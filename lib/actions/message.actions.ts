/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { connectToDatabase } from '@/lib/db'
import Conversation from '@/lib/db/models/conversation.model'
import Product from '@/lib/db/models/product.model'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'
import { checkRateLimit } from '../rate-limit'

async function requireUserId() {
  const session = await auth()
  if (!session?.user) throw new Error('Not logged in')
  return (session.user as any).id as string
}

// A buyer asking about a product starts (or reuses) a conversation with
// that product's vendor. One conversation per buyer+vendor+product so
// repeat questions about the same item stay in one thread.
export async function startConversation({
  vendorId,
  productId,
}: {
  vendorId: string
  productId?: string
}) {
  try {
    const buyerId = await requireUserId()
    if (buyerId === vendorId) throw new Error('You can’t message yourself')
    await connectToDatabase()

    let conversation = await Conversation.findOne({ buyerId, vendorId, productId: productId || null })
    if (!conversation) {
      conversation = await Conversation.create({
        buyerId,
        vendorId,
        productId: productId || undefined,
        messages: [],
        lastMessageAt: new Date(),
      })
    }

    return { success: true, data: { conversationId: conversation._id.toString() } }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function sendMessage({
  conversationId,
  body,
}: {
  conversationId: string
  body: string
}) {
  try {
    const userId = await requireUserId()
    if (!body.trim()) throw new Error('Message can’t be empty')

    const { allowed } = checkRateLimit(`send-message:${userId}`, 20, 60 * 1000)
    if (!allowed) throw new Error('You’re sending messages too fast — slow down a bit')

    await connectToDatabase()
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) throw new Error('Conversation not found')

    const senderRole =
      conversation.buyerId.toString() === userId ? 'buyer'
      : conversation.vendorId.toString() === userId ? 'vendor'
      : null
    if (!senderRole) throw new Error('Unauthorized')

    conversation.messages.push({
      senderId: userId,
      senderRole,
      body: body.trim().slice(0, 2000),
      createdAt: new Date(),
    } as any)
    conversation.lastMessageAt = new Date()
    await conversation.save()

    revalidatePath('/account/messages')
    revalidatePath('/vendor/messages')
    return { success: true }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function getMyConversations() {
  try {
    const userId = await requireUserId()
    await connectToDatabase()

    const conversations = await Conversation.find({
      $or: [{ buyerId: userId }, { vendorId: userId }],
    })
      .populate('buyerId', 'name')
      .populate('vendorId', 'name vendorProfile')
      .populate('productId', 'name slug images')
      .sort({ lastMessageAt: -1 })
      .lean()

    const withRole = (conversations as any[]).map((c) => {
      const myRole = c.buyerId?._id?.toString() === userId ? 'buyer' : 'vendor'
      const unread = (c.messages || []).filter(
        (m: any) => m.senderRole !== myRole && !m.readAt
      ).length
      return { ...c, myRole, unread, lastMessage: c.messages?.[c.messages.length - 1] || null }
    })

    return { success: true, data: JSON.parse(JSON.stringify(withRole)) }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function getConversation(conversationId: string) {
  try {
    const userId = await requireUserId()
    await connectToDatabase()

    const conversation = await Conversation.findById(conversationId)
      .populate('buyerId', 'name')
      .populate('vendorId', 'name vendorProfile')
      .populate('productId', 'name slug images')
      .lean() as any
    if (!conversation) throw new Error('Conversation not found')

    const myRole =
      conversation.buyerId?._id?.toString() === userId ? 'buyer'
      : conversation.vendorId?._id?.toString() === userId ? 'vendor'
      : null
    if (!myRole) throw new Error('Unauthorized')

    // Mark the other party's messages read
    await Conversation.updateOne(
      { _id: conversationId },
      { $set: { 'messages.$[elem].readAt': new Date() } },
      { arrayFilters: [{ 'elem.senderRole': { $ne: myRole }, 'elem.readAt': { $exists: false } }] }
    )

    return { success: true, data: { ...conversation, myRole } }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// Used on product/store pages to resolve the vendor to message.
export async function getProductVendorId(productId: string) {
  await connectToDatabase()
  const product = await Product.findById(productId).select('vendorId').lean() as any
  return product?.vendorId?.toString() || null
}

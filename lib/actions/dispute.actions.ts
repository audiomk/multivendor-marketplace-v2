/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { connectToDatabase } from '@/lib/db'
import Dispute from '@/lib/db/models/dispute.model'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'
import { checkAdmin } from './auth-guards'

async function requireUserId() {
  const session = await auth()
  if (!session?.user) throw new Error('Not logged in')
  return (session.user as any).id as string
}

export async function getMyDisputes() {
  try {
    const userId = await requireUserId()
    await connectToDatabase()
    const disputes = await Dispute.find({ buyerId: userId })
      .populate('orderId', '_id totalPrice')
      .populate('vendorId', 'name vendorProfile')
      .sort({ createdAt: -1 })
      .lean()
    return { success: true, data: JSON.parse(JSON.stringify(disputes)) }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function getVendorDisputes() {
  try {
    const userId = await requireUserId()
    await connectToDatabase()
    const disputes = await Dispute.find({ vendorId: userId })
      .populate('orderId', '_id totalPrice')
      .populate('buyerId', 'name email')
      .sort({ createdAt: -1 })
      .lean()
    return { success: true, data: JSON.parse(JSON.stringify(disputes)) }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function getAllDisputes() {
  try {
    await checkAdmin()
    await connectToDatabase()
    const disputes = await Dispute.find()
      .populate('orderId', '_id totalPrice')
      .populate('buyerId', 'name email')
      .populate('vendorId', 'name vendorProfile')
      .sort({ createdAt: -1 })
      .lean()
    return { success: true, data: JSON.parse(JSON.stringify(disputes)) }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function updateDisputeStatus({
  disputeId,
  status,
  resolution,
}: {
  disputeId: string
  status: 'under_review' | 'resolved' | 'rejected'
  resolution?: string
}) {
  try {
    await checkAdmin()
    await connectToDatabase()
    await Dispute.findByIdAndUpdate(disputeId, {
      status,
      resolution: resolution || '',
      resolvedAt: ['resolved', 'rejected'].includes(status) ? new Date() : undefined,
    })
    revalidatePath('/admin/disputes')
    return { success: true, message: 'Dispute updated' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

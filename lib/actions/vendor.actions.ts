/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'
import Order from '@/lib/db/models/order.model'
import User from '@/lib/db/models/user.model'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'

async function requireSession() {
  const session = await auth()
  if (!session?.user) throw new Error('Not logged in')
  return { session, userId: (session.user as any).id as string }
}

async function requireApprovedVendor() {
  const { session, userId } = await requireSession()
  await connectToDatabase()
  const dbUser = await User.findById(userId)
    .select('role vendorProfile')
    .lean() as any
  const isVendor = dbUser?.role === 'vendor'
  const isAdmin  = dbUser?.role === 'Admin' || dbUser?.role === 'admin'
  if (!isVendor && !isAdmin) {
    throw new Error('Unauthorized — vendor role required')
  }
  if (!dbUser?.vendorProfile?.isApproved) {
    throw new Error('Your vendor account is pending approval')
  }
  return { session, userId, dbUser }
}

export async function applyToBeVendor({
  storeName,
  storeSlug,
  bio,
}: {
  storeName: string
  storeSlug: string
  bio: string
}) {
  try {
    const { userId } = await requireSession()
    await connectToDatabase()

    const slugTaken = await User.findOne({
      'vendorProfile.storeSlug': storeSlug,
      _id: { $ne: userId },
    })
    if (slugTaken) throw new Error('That store URL is already taken')

    const dbUser = await User.findById(userId).select('role vendorProfile').lean() as any
    if (dbUser?.vendorProfile?.storeName) {
      throw new Error('You already have a vendor account')
    }

    const updateData: any = {
      vendorProfile: {
        storeName,
        storeSlug,
        bio,
        isApproved: false,
        commission: 10,
      },
    }

    if (dbUser?.role === 'User') {
      updateData.role = 'vendor'
    }

    await User.findByIdAndUpdate(userId, updateData)
    return { success: true, message: 'Application submitted' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function getVendorStats() {
  try {
    const { userId } = await requireSession()
    await connectToDatabase()

    const [productCount, orders] = await Promise.all([
      Product.countDocuments({ vendorId: userId, isPublished: true }),
      Order.find({ 'vendorOrders.vendorId': userId }).lean(),
    ])

    let totalRevenue  = 0
    let totalOrders   = 0
    let pendingOrders = 0

    for (const order of orders) {
      for (const vo of (order as any).vendorOrders) {
        if (vo.vendorId?.toString() === userId) {
          totalRevenue += vo.vendorPayout || 0
          totalOrders++
          if (vo.status === 'pending') pendingOrders++
        }
      }
    }

    return {
      success: true,
      data: { productCount, totalRevenue, totalOrders, pendingOrders },
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function getVendorProducts({
  page  = 1,
  limit = 10,
}: {
  page?:  number
  limit?: number
}) {
  try {
    const { userId } = await requireSession()
    await connectToDatabase()

    const products = await Product.find({ vendorId: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await Product.countDocuments({ vendorId: userId })

    return {
      success: true,
      data: {
        products:   JSON.parse(JSON.stringify(products)),
        totalPages: Math.ceil(total / limit),
        total,
      },
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function createVendorProduct(data: any) {
  try {
    const { userId } = await requireApprovedVendor()

    let slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
    const existing = await Product.findOne({ slug })
    if (existing) slug = `${slug}-${Date.now()}`

    await Product.create({ ...data, slug, vendorId: userId, isPublished: true })
    revalidatePath('/vendor/products')
    return { success: true, message: 'Product created' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function updateVendorProduct(id: string, data: any) {
  try {
    const { userId } = await requireApprovedVendor()
    await Product.findOneAndUpdate({ _id: id, vendorId: userId }, data, { new: true })
    revalidatePath('/vendor/products')
    return { success: true, message: 'Product updated' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function deleteVendorProduct(id: string) {
  try {
    const { userId } = await requireApprovedVendor()
    await Product.findOneAndUpdate({ _id: id, vendorId: userId }, { isPublished: false })
    revalidatePath('/vendor/products')
    return { success: true, message: 'Product removed' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function getVendorOrders({
  page  = 1,
  limit = 10,
}: {
  page?:  number
  limit?: number
}) {
  try {
    const { userId } = await requireSession()
    await connectToDatabase()

    const orders = await Order.find({ 'vendorOrders.vendorId': userId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await Order.countDocuments({ 'vendorOrders.vendorId': userId })

    return {
      success: true,
      data: {
        orders:     JSON.parse(JSON.stringify(orders)),
        totalPages: Math.ceil(total / limit),
        total,
      },
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function updateVendorOrderStatus(orderId: string, vendorId: string, status: string) {
  try {
    await connectToDatabase()
    await Order.updateOne(
      { _id: orderId, 'vendorOrders.vendorId': vendorId },
      { $set: { 'vendorOrders.$.status': status } }
    )
    revalidatePath('/vendor/orders')
    return { success: true, message: 'Status updated' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function getVendorStore(slug: string, query?: string, category?: string) {
  try {
    await connectToDatabase()

    const vendor = await User.findOne({
      'vendorProfile.storeSlug':  slug,
      'vendorProfile.isApproved': true,
    }).lean()

    if (!vendor) throw new Error('Store not found')

    const filter: any = { vendorId: (vendor as any)._id, isPublished: true }
    if (query)    filter.name     = { $regex: query, $options: 'i' }
    if (category) filter.category = category

    const products      = await Product.find(filter).sort({ createdAt: -1 }).lean()
    const allCategories = await Product.find({
      vendorId: (vendor as any)._id, isPublished: true,
    }).distinct('category')

    return {
      success: true,
      data: {
        vendor:     JSON.parse(JSON.stringify(vendor)),
        products:   JSON.parse(JSON.stringify(products)),
        categories: allCategories,
      },
    }
  } catch (error) {
    return { success: false, message: formatError(error), data: null }
  }
}

export async function getVendorInfoForProducts(productIds: string[]) {
  try {
    await connectToDatabase()

    const products = await Product.find({ _id: { $in: productIds } })
      .populate('vendorId', 'vendorProfile verification')
      .select('_id vendorId')
      .lean() as any[]

    const map: Record<string, { storeName: string; storeSlug: string; isVerified: boolean }> = {}

    for (const product of products) {
      if (product.vendorId?.vendorProfile) {
        map[product._id.toString()] = {
          storeName:  product.vendorId.vendorProfile.storeName,
          storeSlug:  product.vendorId.vendorProfile.storeSlug,
          isVerified: product.vendorId.verification?.isVerified || false,
        }
      }
    }

    return { success: true, data: map }
  } catch (error) {
    return { success: false, data: {} }
  }
}
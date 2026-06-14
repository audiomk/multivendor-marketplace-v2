'use server'

import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'
import Order from '@/lib/db/models/order.model'
import User from '@/lib/db/models/user.model'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'

// --- Vendor Application & Dashboard ---

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
    const session = await auth()
    if (!session) throw new Error('Not logged in')

    await connectToDatabase()

    const slugTaken = await User.findOne({
      'vendorProfile.storeSlug': storeSlug,
    })
    if (slugTaken) throw new Error('That store URL is already taken')

    await User.findByIdAndUpdate((session.user as any).id, {
      role: 'vendor',
      vendorProfile: {
        storeName,
        storeSlug,
        bio,
        isApproved: false,
        commission: 10,
      },
    })

    return { success: true, message: 'Application submitted' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function getVendorStats() {
  try {
    const session = await auth()
    if (!session) throw new Error('Not logged in')
    const vendorId = (session.user as any).id

    await connectToDatabase()

    const [productCount, orders] = await Promise.all([
      Product.countDocuments({ vendorId, isPublished: true }),
      Order.find({ 'vendorOrders.vendorId': vendorId }).lean(),
    ])

    let totalRevenue = 0
    let totalOrders = 0
    let pendingOrders = 0

    for (const order of orders) {
      for (const vo of (order as any).vendorOrders) {
        if (vo.vendorId?.toString() === vendorId) {
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

// --- Product Management ---

export async function getVendorProducts({
  page = 1,
  limit = 10,
}: {
  page?: number
  limit?: number
}) {
  try {
    const session = await auth()
    if (!session) throw new Error('Not logged in')
    const vendorId = (session.user as any).id

    await connectToDatabase()

    const products = await Product.find({ vendorId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await Product.countDocuments({ vendorId })

    return {
      success: true,
      data: {
        products: JSON.parse(JSON.stringify(products)),
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
    const session = await auth()
    if (!session || (session.user as any).role !== 'vendor') {
      throw new Error('Unauthorized')
    }
    const vendorId = (session.user as any).id

    await connectToDatabase()

    let slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')

    const existing = await Product.findOne({ slug })
    if (existing) slug = `${slug}-${Date.now()}`

    await Product.create({ ...data, slug, vendorId, isPublished: true })

    revalidatePath('/vendor/products')
    return { success: true, message: 'Product created' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function updateVendorProduct(id: string, data: any) {
  try {
    const session = await auth()
    const vendorId = (session?.user as any)?.id
    if (!vendorId) throw new Error('Unauthorized')

    await connectToDatabase()

    await Product.findOneAndUpdate({ _id: id, vendorId }, data, { new: true })

    revalidatePath('/vendor/products')
    return { success: true, message: 'Product updated' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function deleteVendorProduct(id: string) {
  try {
    const session = await auth()
    const vendorId = (session?.user as any)?.id
    if (!vendorId) throw new Error('Unauthorized')

    await connectToDatabase()
    await Product.findOneAndUpdate({ _id: id, vendorId }, { isPublished: false })

    revalidatePath('/vendor/products')
    return { success: true, message: 'Product removed' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// --- Order Management ---

export async function getVendorOrders({
  page = 1,
  limit = 10,
}: {
  page?: number
  limit?: number
}) {
  try {
    const session = await auth()
    const vendorId = (session?.user as any)?.id
    if (!vendorId) throw new Error('Unauthorized')

    await connectToDatabase()

    const orders = await Order.find({ 'vendorOrders.vendorId': vendorId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await Order.countDocuments({
      'vendorOrders.vendorId': vendorId,
    })

    return {
      success: true,
      data: {
        orders: JSON.parse(JSON.stringify(orders)),
        totalPages: Math.ceil(total / limit),
        total,
      },
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function updateVendorOrderStatus(
  orderId: string,
  vendorId: string,
  status: string
) {
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

// --- Public / Storefront Helpers ---

export async function getVendorStore(slug: string) {
  try {
    await connectToDatabase()

    const vendor = await User.findOne({
      'vendorProfile.storeSlug': slug,
      'vendorProfile.isApproved': true,
    }).lean()

    if (!vendor) throw new Error('Store not found')

    const products = await Product.find({
      vendorId: (vendor as any)._id,
      isPublished: true,
    })
      .sort({ createdAt: -1 })
      .lean()

    return {
      success: true,
      data: {
        vendor: JSON.parse(JSON.stringify(vendor)),
        products: JSON.parse(JSON.stringify(products)),
      },
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function getVendorInfoForProducts(productIds: string[]) {
  try {
    await connectToDatabase()

    const products = await Product.find({
      _id: { $in: productIds },
    })
      .populate('vendorId', 'vendorProfile')
      .select('_id vendorId')
      .lean() as any[]

    const map: Record<string, { storeName: string; storeSlug: string }> = {}

    for (const product of products) {
      if (product.vendorId?.vendorProfile) {
        map[product._id.toString()] = {
          storeName: product.vendorId.vendorProfile.storeName,
          storeSlug: product.vendorId.vendorProfile.storeSlug,
        }
      }
    }

    return { success: true, data: map }
  } catch (error) {
    return { success: false, data: {} }
  }
}
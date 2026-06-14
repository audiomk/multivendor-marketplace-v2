'use server'

import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'
import Order from '@/lib/db/models/order.model'
import Product from '@/lib/db/models/product.model'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'

async function checkAdmin() {
  const session = await auth()
  if ((session?.user as any)?.role !== 'admin') {
    throw new Error('Unauthorized')
  }
  return session
}

// Get all vendors
export async function getAllVendors() {
  try {
    await checkAdmin()
    await connectToDatabase()
    const vendors = await User.find({ role: 'vendor' })
      .select('name email vendorProfile createdAt')
      .lean()
    return { success: true, data: JSON.parse(JSON.stringify(vendors)) }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// Approve vendor
export async function approveVendor(id: string) {
  try {
    await checkAdmin()
    await connectToDatabase()
    await User.findByIdAndUpdate(id, {
      'vendorProfile.isApproved': true,
    })
    revalidatePath('/admin/vendors')
    return { success: true, message: 'Vendor approved' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// Reject vendor
export async function rejectVendor(id: string) {
  try {
    await checkAdmin()
    await connectToDatabase()
    await User.findByIdAndUpdate(id, {
      role: 'User',
      vendorProfile: null,
    })
    revalidatePath('/admin/vendors')
    return { success: true, message: 'Vendor rejected' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// Suspend vendor
export async function suspendVendor(id: string) {
  try {
    await checkAdmin()
    await connectToDatabase()
    await User.findByIdAndUpdate(id, {
      'vendorProfile.isApproved': false,
    })
    revalidatePath('/admin/vendors')
    return { success: true, message: 'Vendor suspended' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// Update vendor commission
export async function updateVendorCommission(id: string, commission: number) {
  try {
    await checkAdmin()
    await connectToDatabase()
    await User.findByIdAndUpdate(id, {
      'vendorProfile.commission': commission,
    })
    revalidatePath('/admin/vendors')
    return { success: true, message: 'Commission updated' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// Get platform stats
export async function getPlatformStats() {
  try {
    await checkAdmin()
    await connectToDatabase()

    const [
      totalUsers,
      totalVendors,
      pendingVendors,
      totalProducts,
      orders,
    ] = await Promise.all([
      User.countDocuments({ role: 'User' }),
      User.countDocuments({ role: 'vendor', 'vendorProfile.isApproved': true }),
      User.countDocuments({ role: 'vendor', 'vendorProfile.isApproved': false }),
      Product.countDocuments({ isPublished: true }),
      Order.find().lean(),
    ])

    const totalRevenue = (orders as any[]).reduce(
      (sum, o) => sum + (o.totalPrice || 0), 0
    )
    const totalCommission = (orders as any[]).reduce((sum, o) => {
      return sum + ((o.vendorOrders || []).reduce(
        (s: number, vo: any) => s + (vo.commission || 0), 0
      ))
    }, 0)

    return {
      success: true,
      data: {
        totalUsers,
        totalVendors,
        pendingVendors,
        totalProducts,
        totalOrders: orders.length,
        totalRevenue,
        totalCommission,
      },
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
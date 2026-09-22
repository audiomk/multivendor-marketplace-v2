'use server'

import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'
import Order from '@/lib/db/models/order.model'
import Product from '@/lib/db/models/product.model'
import { revalidatePath } from 'next/cache'
import { formatError } from '../utils'
import { checkAdmin } from './auth-guards'

// Get all vendors
export async function getAllVendors() {
  try {
    await checkAdmin()
    await connectToDatabase()
    const vendors = await User.find({ role: 'vendor' })
      .select('name email vendorProfile verification createdAt')
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

    const vendor = await User.findByIdAndUpdate(
      id,
      { 'vendorProfile.isApproved': true },
      { new: true }
    ).lean() as any

    // Send approval email
    if (vendor?.email) {
      try {
        const { sendVendorApprovalEmail } = await import('@/emails')
        await sendVendorApprovalEmail({
          vendorEmail: vendor.email,
          vendorName:  vendor.name,
          storeName:   vendor.vendorProfile?.storeName || 'Your Store',
        })
      } catch (emailErr) {
        console.error('Approval email failed:', emailErr)
      }
    }

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

// Confirm (or revoke) a vendor's submitted WhatsApp number. This is a
// manual check by design — call/message the number yourself to confirm
// it's really theirs before verifying, there's no automated OTP step here.
export async function setVendorWhatsAppVerified(id: string, verified: boolean) {
  try {
    await checkAdmin()
    await connectToDatabase()
    await User.findByIdAndUpdate(id, {
      'vendorProfile.whatsappVerified': verified,
    })
    revalidatePath('/admin/vendors')
    return { success: true, message: verified ? 'WhatsApp number verified' : 'Verification revoked' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// Mark a vendor's payout for one order as manually paid (e.g. EcoCash,
// bank transfer) — the fallback path since Stripe Connect doesn't support
// Zimbabwe-based recipients, so vendorPayout.stripeTransferId will be empty
// for essentially every local vendor.
export async function markVendorPayoutPaid({
  orderId,
  vendorId,
  method,
  reference,
  notes,
}: {
  orderId: string
  vendorId: string
  method: 'ecocash' | 'bank_transfer' | 'other'
  reference: string
  notes?: string
}) {
  try {
    await checkAdmin()
    if (!reference.trim()) throw new Error('A payout reference is required')
    await connectToDatabase()

    const res = await Order.updateOne(
      { _id: orderId, 'vendorOrders.vendorId': vendorId },
      {
        $set: {
          'vendorOrders.$.payoutStatus': 'paid',
          'vendorOrders.$.payoutMethod': method,
          'vendorOrders.$.payoutReference': reference.trim(),
          'vendorOrders.$.payoutNotes': notes?.trim() || '',
          'vendorOrders.$.payoutPaidAt': new Date(),
        },
      }
    )
    if (res.matchedCount === 0) throw new Error('Vendor order not found')

    revalidatePath('/admin/vendors/payouts')
    return { success: true, message: 'Payout marked as paid' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// Reverse a payout marked paid by mistake
export async function markVendorPayoutUnpaid({
  orderId,
  vendorId,
}: {
  orderId: string
  vendorId: string
}) {
  try {
    await checkAdmin()
    await connectToDatabase()

    const res = await Order.updateOne(
      { _id: orderId, 'vendorOrders.vendorId': vendorId },
      {
        $set: {
          'vendorOrders.$.payoutStatus': 'unpaid',
          'vendorOrders.$.payoutMethod': '',
          'vendorOrders.$.payoutReference': '',
          'vendorOrders.$.payoutNotes': '',
        },
        $unset: { 'vendorOrders.$.payoutPaidAt': '' },
      }
    )
    if (res.matchedCount === 0) throw new Error('Vendor order not found')

    revalidatePath('/admin/vendors/payouts')
    return { success: true, message: 'Payout reverted to unpaid' }
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
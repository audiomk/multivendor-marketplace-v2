'use server'

import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import Product from '@/lib/db/models/product.model'
import User from '@/lib/db/models/user.model'
import { stripe } from '@/lib/stripe'
import { formatError } from '../utils'

// Call this after any successful payment
export async function splitOrderByVendor(orderId: string) {
  try {
    await connectToDatabase()

    const order = (await Order.findById(orderId).lean()) as any
    if (!order) throw new Error('Order not found')

    // Batch fetch all products in the order at once to avoid N+1 DB queries
    const productIds = order.items.map((item: any) => item.product)
    const products = (await Product.find({ _id: { $in: productIds } })
      .select('_id vendorId')
      .lean()) as any[]

    const productVendorMap = new Map<string, string>()
    products.forEach((p) => {
      if (p.vendorId) productVendorMap.set(p._id.toString(), p.vendorId.toString())
    })

    // Group order items by vendorId
    const vendorMap: Record<string, any[]> = {}
    for (const item of order.items) {
      const vendorId = productVendorMap.get(item.product.toString())
      if (!vendorId) continue

      if (!vendorMap[vendorId]) vendorMap[vendorId] = []
      vendorMap[vendorId].push(item)
    }

    // Batch fetch all vendor user profiles at once
    const vendorIds = Object.keys(vendorMap)
    const vendors = (await User.find({ _id: { $in: vendorIds } })
      .select('name email vendorProfile')
      .lean()) as any[]

    const vendorMapById = new Map<string, any>()
    vendors.forEach((v) => vendorMapById.set(v._id.toString(), v))

    // Pre-fetch populated order for emails if any vendors exist
    let fullOrder: any = null
    if (vendorIds.length > 0) {
      fullOrder = (await Order.findById(orderId)
        .populate('user', 'name email')
        .lean()) as any
    }

    const vendorOrders = []

    for (const [vendorId, items] of Object.entries(vendorMap)) {
      const vendor = vendorMapById.get(vendorId)
      if (!vendor) continue

      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
      const commissionRate = vendor.vendorProfile?.commission ?? 10
      const commission = subtotal * (commissionRate / 100)
      const vendorPayout = subtotal - commission
      const formattedPayout = Math.round(vendorPayout * 100) / 100

      let stripeTransferId = ''

      // Only transfer if vendor has Stripe connected
      if (
        vendor.vendorProfile?.stripeAccountId &&
        process.env.STRIPE_SECRET_KEY?.startsWith('sk_live')
      ) {
        try {
          const transfer = await stripe.transfers.create({
            amount: Math.round(vendorPayout * 100),
            currency: 'usd',
            destination: vendor.vendorProfile.stripeAccountId,
            metadata: { orderId, vendorId },
          })
          stripeTransferId = transfer.id
        } catch (stripeErr) {
          console.error('Stripe transfer failed:', stripeErr)
        }
      }

      vendorOrders.push({
        vendorId,
        items: items.map((i) => i.product),
        subtotal: Math.round(subtotal * 100) / 100,
        commission: Math.round(commission * 100) / 100,
        vendorPayout: formattedPayout,
        status: 'pending',
        stripeTransferId,
      })

      // Notify vendor via email inside the loop
      if (vendor.email) {
        try {
          const { sendVendorNewOrder } = await import('@/emails')
          await sendVendorNewOrder({
            vendorEmail: vendor.email,
            order: fullOrder,
            vendorItems: items,
            vendorPayout: formattedPayout,
          })
        } catch (emailErr) {
          console.error('Vendor notification email failed:', emailErr)
        }
      }
    }

    // Save vendor orders array back to main Order record
    await Order.findByIdAndUpdate(orderId, { vendorOrders })

    return { success: true, message: 'Order split successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
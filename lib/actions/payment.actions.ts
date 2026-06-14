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

    const order = await Order.findById(orderId).lean() as any
    if (!order) throw new Error('Order not found')

    // Group items by vendorId
    const vendorMap: Record<string, any[]> = {}

    for (const item of order.items) {
      const product = await Product.findById(item.product)
        .select('vendorId')
        .lean() as any

      if (!product?.vendorId) continue

      const vendorId = product.vendorId.toString()
      if (!vendorMap[vendorId]) vendorMap[vendorId] = []
      vendorMap[vendorId].push(item)
    }

    const vendorOrders = []

    for (const [vendorId, items] of Object.entries(vendorMap)) {
      const vendor = await User.findById(vendorId)
        .select('vendorProfile')
        .lean() as any

      if (!vendor) continue

      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
      )
      const commissionRate = vendor.vendorProfile?.commission ?? 10
      const commission     = subtotal * (commissionRate / 100)
      const vendorPayout   = subtotal - commission

      let stripeTransferId = ''

      // Only transfer if vendor has Stripe connected
      if (
        vendor.vendorProfile?.stripeAccountId &&
        process.env.STRIPE_SECRET_KEY?.startsWith('sk_live')
      ) {
        try {
          const transfer = await stripe.transfers.create({
            amount:      Math.round(vendorPayout * 100),
            currency:    'usd',
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
        items:           items.map(i => i.product),
        subtotal:        Math.round(subtotal * 100) / 100,
        commission:      Math.round(commission * 100) / 100,
        vendorPayout:    Math.round(vendorPayout * 100) / 100,
        status:          'pending',
        stripeTransferId,
      })
    }

    // Save vendor orders to the order
    await Order.findByIdAndUpdate(orderId, { vendorOrders })

    return { success: true, message: 'Order split successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
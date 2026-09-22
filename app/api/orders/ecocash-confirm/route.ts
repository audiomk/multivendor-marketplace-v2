import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import { auth } from '@/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { allowed } = checkRateLimit(`ecocash-confirm:${session.user.id}`, 5, 5 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many attempts — wait a few minutes and try again' }, { status: 429 })
    }

    const { orderId, reference } = await req.json()
    if (!orderId || typeof reference !== 'string' || !reference.trim()) {
      return NextResponse.json({ error: 'orderId and reference are required' }, { status: 400 })
    }

    await connectToDatabase()

    const order = await Order.findById(orderId)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    // Prevent submitting a reference against someone else's order
    if (order.user.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    if (order.isPaid) {
      return NextResponse.json({ error: 'Order is already paid' }, { status: 400 })
    }

    // Reject a reference already tied to a different order, to make it
    // harder to reuse one real EcoCash payment across multiple orders
    const duplicate = await Order.findOne({
      _id: { $ne: order._id },
      'paymentResult.id': reference.trim(),
    })
    if (duplicate) {
      return NextResponse.json(
        { error: 'This reference has already been submitted for another order' },
        { status: 400 }
      )
    }

    // Mark order as pending EcoCash confirmation
    order.paymentResult = {
      id: reference.trim(),
      status: 'ECOCASH_PENDING',
      email_address: session.user?.email || '',
      pricePaid: '0',
    }
    await order.save()

    return NextResponse.json({
      success: true,
      message: 'EcoCash payment submitted for confirmation',
    })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
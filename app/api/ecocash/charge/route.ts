import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import { requestEcoCashPayment, isEcoCashDirectConfigured } from '@/lib/ecocash-api'
import { checkRateLimit } from '@/lib/rate-limit'

// Pushes a real-time EcoCash PIN prompt for this order. Falls back
// gracefully with a clear message when not configured — the buyer should
// use the manual reference flow (app/api/orders/ecocash-confirm) instead.
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { allowed } = checkRateLimit(`ecocash-charge:${session.user.id}`, 5, 5 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many attempts — wait a few minutes and try again' }, { status: 429 })
    }

    if (!isEcoCashDirectConfigured()) {
      return NextResponse.json(
        {
          error:
            'Automatic EcoCash payments aren’t enabled yet — please use the manual instructions below.',
        },
        { status: 503 }
      )
    }

    const { orderId, msisdn } = await req.json()
    if (!orderId || !msisdn) {
      return NextResponse.json({ error: 'orderId and msisdn are required' }, { status: 400 })
    }

    await connectToDatabase()
    const order = await Order.findById(orderId)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (order.user.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    if (order.isPaid) {
      return NextResponse.json({ error: 'Order is already paid' }, { status: 400 })
    }

    const reference = `Order-${orderId.toString().slice(-8).toUpperCase()}`
    const result = await requestEcoCashPayment({
      msisdn,
      amount: order.totalPrice,
      reference,
      reason: reference,
    })

    order.paymentResult = {
      id: result.ecocashTransactionReference ?? reference,
      status: 'ECOCASH_AWAITING_PIN',
      email_address: order.paymentResult?.email_address ?? '',
      pricePaid: order.paymentResult?.pricePaid ?? '',
    }
    await order.save()

    return NextResponse.json({ success: true, message: 'Check your phone to approve the payment' })
  } catch (err: any) {
    console.error('EcoCash direct charge error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

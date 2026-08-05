import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import { splitOrderByVendor } from '@/lib/actions/payment.actions'

export async function POST(req: Request) {
  try {
    const body   = await req.text()
    const params = new URLSearchParams(body)

    const status    = params.get('status')?.toLowerCase()
    const pollUrl   = params.get('pollurl') || ''
    const paynowRef = params.get('paynowreference') || ''
    const amount    = params.get('amount') || '0'

    await connectToDatabase()

    if (status === 'paid' || status === 'awaiting delivery') {
      // Find order by poll URL
      const order = await Order.findOneAndUpdate(
        { 'paymentResult.paynowPollUrl': pollUrl },
        {
          isPaid:  true,
          paidAt:  new Date(),
          'paymentResult.id':          paynowRef,
          'paymentResult.status':      'COMPLETED',
          'paymentResult.pricePaid':   amount,
        },
        { new: true }
      )

      if (order) {
        await splitOrderByVendor(order._id.toString())
        console.log(`Order ${order._id} paid and split via Paynow`)
      }
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Paynow result error:', err)
    return new Response('Error', { status: 500 })
  }
}

// Test endpoint — manually trigger split for an order
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')
  const secret  = searchParams.get('secret')

  // Only allow in dev or with secret
  if (
    process.env.NODE_ENV !== 'development' &&
    secret !== process.env.AUTH_SECRET?.slice(0, 8)
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!orderId) {
    return NextResponse.json({ error: 'orderId required' }, { status: 400 })
  }

  try {
    await connectToDatabase()

    await Order.findByIdAndUpdate(orderId, {
      isPaid:  true,
      paidAt:  new Date(),
      'paymentResult.status': 'COMPLETED',
      'paymentResult.id':     'test-paynow-ref',
    })

    const result = await splitOrderByVendor(orderId)
    return NextResponse.json({ success: true, result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import { createZimswitchCheckout, isZimswitchConfigured } from '@/lib/zimswitch'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { allowed } = checkRateLimit(`zimswitch-initiate:${session.user.id}`, 5, 5 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many attempts — wait a few minutes and try again' }, { status: 429 })
    }

    if (!isZimswitchConfigured()) {
      return NextResponse.json(
        {
          error:
            'Zimswitch is not set up yet — apply for merchant sign-on through your bank, ' +
            'then set ZIMSWITCH_ENTITY_ID and ZIMSWITCH_ACCESS_TOKEN.',
        },
        { status: 503 }
      )
    }

    const { orderId } = await req.json()

    await connectToDatabase()
    const order = await Order.findById(orderId).lean() as any
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
    const checkout = await createZimswitchCheckout({
      amount: order.totalPrice,
      reference,
    })

    if (checkout.result?.code && !checkout.result.code.startsWith('000.200')) {
      // 000.200.xxx is OPPWA's "transaction pending / checkout created" range
      // for this step — VERIFY against the real docs.
      return NextResponse.json(
        { error: checkout.result.description || 'Zimswitch checkout creation failed' },
        { status: 400 }
      )
    }

    await Order.findByIdAndUpdate(orderId, {
      'paymentResult.id': checkout.id,
      'paymentResult.status': 'ZIMSWITCH_PENDING',
    })

    return NextResponse.json({ success: true, checkoutId: checkout.id })
  } catch (err: any) {
    console.error('Zimswitch initiate error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

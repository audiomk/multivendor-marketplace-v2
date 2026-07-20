import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import { createPaynowInstance } from '@/lib/paynow'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, phone, method } = await req.json()
    // method: 'web' | 'ecocash' | 'onemoney'

    await connectToDatabase()
    const order = await Order.findById(orderId).lean() as any
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const paynow  = createPaynowInstance()
    const email   = session.user?.email || 'customer@indabacart.com'
    const payment = paynow.createPayment(
      `Order-${orderId.toString().slice(-8).toUpperCase()}`,
      email
    )

    // Add order items
    for (const item of order.items) {
      payment.add(item.name, item.price * item.quantity)
    }

    // Add shipping
    if (order.shippingPrice > 0) {
      payment.add('Shipping', order.shippingPrice)
    }

    let response

    if (method === 'web') {
      // Web checkout — redirect to Paynow
      response = await paynow.send(payment)
    } else {
      // Mobile checkout — EcoCash or OneMoney
      const mobileMethod = method === 'onemoney' ? 'onemoney' : 'ecocash'
      response = await paynow.sendMobile(payment, phone, mobileMethod)
    }

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Payment initiation failed' },
        { status: 400 }
      )
    }

    // Save poll URL to order for status checking
    await Order.findByIdAndUpdate(orderId, {
      'paymentResult.id':     `paynow-${orderId}`,
      'paymentResult.status': 'PAYNOW_PENDING',
      'paymentResult.paynowPollUrl': response.pollUrl,
    })

    return NextResponse.json({
      success:      true,
      redirectUrl:  response.redirectUrl  || null,
      pollUrl:      response.pollUrl       || null,
      instructions: (response as any).instructions || null,
      method,
    })
  } catch (err: any) {
    console.error('Paynow error:', err)
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import { auth } from '@/auth'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, reference } = await req.json()

    await connectToDatabase()

    // Mark order as pending EcoCash confirmation
    await Order.findByIdAndUpdate(orderId, {
      'paymentResult.id':            reference,
      'paymentResult.status':        'ECOCASH_PENDING',
      'paymentResult.email_address': session.user?.email || '',
      'paymentResult.pricePaid':     '0',
    })

    return NextResponse.json({
      success: true,
      message: 'EcoCash payment submitted for confirmation',
    })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
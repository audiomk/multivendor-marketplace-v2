import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import { splitOrderByVendor } from '@/lib/actions/payment.actions'

// SCAFFOLD — receives EcoCash's async payment confirmation. The auth check
// below (a shared secret header) is a placeholder: EcoCash's real webhook
// signing scheme (HMAC, mutual TLS, IP allowlist, etc.) is NOT publicly
// documented here and must be confirmed from developers.ecocash.co.zw
// before this goes live with real money — do not trust this as-is the way
// you would a verified Stripe/Paynow callback.
export async function POST(req: Request) {
  try {
    const secret = req.headers.get('x-webhook-secret')
    if (!process.env.ECOCASH_WEBHOOK_SECRET || secret !== process.env.ECOCASH_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    // VERIFY the real payload shape — assuming { sourceReference, status, ecocashTransactionReference }
    const { sourceReference, status, ecocashTransactionReference } = body

    if (status !== 'SUCCESS' || !sourceReference) {
      return NextResponse.json({ received: true })
    }

    await connectToDatabase()
    const order = await Order.findOne({ 'paymentResult.id': ecocashTransactionReference })
    if (order && !order.isPaid) {
      order.isPaid = true
      order.paidAt = new Date()
      order.paymentResult = {
        id: ecocashTransactionReference ?? order.paymentResult?.id ?? '',
        status: 'COMPLETED',
        email_address: order.paymentResult?.email_address ?? '',
        pricePaid: order.paymentResult?.pricePaid ?? '',
      }
      await order.save()
      await splitOrderByVendor(order._id.toString())
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('EcoCash webhook error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

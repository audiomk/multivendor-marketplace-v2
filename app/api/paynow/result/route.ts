import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import { createPaynowInstance } from '@/lib/paynow'
import { splitOrderByVendor } from '@/lib/actions/payment.actions'

export async function POST(req: Request) {
  try {
    const body   = await req.text()
    const params = new URLSearchParams(body)

    const status    = params.get('status')?.toLowerCase()
    const reference = params.get('reference') || ''
    const pollUrl   = params.get('pollurl')   || ''
    const paynowRef = params.get('paynowreference') || ''

    // Extract orderId from reference (Order-XXXXXXXX)
    const orderId = reference.replace('Order-', '')

    await connectToDatabase()

    if (status === 'paid' || status === 'awaiting delivery') {
      // Verify with Paynow before marking as paid
      const paynow       = createPaynowInstance()
      const statusResult = await paynow.pollTransaction(pollUrl)

      if (statusResult.paid()) {
        const order = await Order.findOneAndUpdate(
          {
            $or: [
              { _id: { $regex: orderId, $options: 'i' } },
              { 'paymentResult.paynowPollUrl': pollUrl },
            ]
          },
          {
            isPaid:               true,
            paidAt:               new Date(),
            'paymentResult.id':          paynowRef,
            'paymentResult.status':      'COMPLETED',
            'paymentResult.email_address': params.get('customerEmail') || '',
            'paymentResult.pricePaid':   params.get('amount') || '0',
          },
          { new: true }
        )

        if (order) {
          await splitOrderByVendor(order._id.toString())
        }
      }
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Paynow result webhook error:', err)
    return new Response('Error', { status: 500 })
  }
}
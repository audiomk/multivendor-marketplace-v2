import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import { splitOrderByVendor } from '@/lib/actions/payment.actions'
import { createPaynowInstance } from '@/lib/paynow'

export async function POST(req: Request) {
  try {
    const body    = await req.text()
    const pollUrl = new URLSearchParams(body).get('pollurl') || ''
    if (!pollUrl) return new Response('Missing pollurl', { status: 400 })

    await connectToDatabase()

    // Never trust the status Paynow's POST body claims — poll Paynow's own
    // server for the real status. pollTransaction() validates the response
    // hash against our integration key, so a forged callback can't fake it.
    const paynow = createPaynowInstance()
    const result = await paynow.pollTransaction(pollUrl)

    if (result?.status?.toLowerCase() === 'paid') {
      const order = await Order.findOne({ 'paymentResult.paynowPollUrl': pollUrl })

      if (order && !order.isPaid) {
        order.isPaid = true
        order.paidAt = new Date()
        order.paymentResult = {
          id: order.paymentResult?.id ?? '',
          status: 'COMPLETED',
          email_address: order.paymentResult?.email_address ?? '',
          pricePaid: order.paymentResult?.pricePaid ?? '',
        }
        await order.save()

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

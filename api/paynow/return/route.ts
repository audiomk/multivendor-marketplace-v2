import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import { createPaynowInstance } from '@/lib/paynow'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const pollUrl  = searchParams.get('pollurl') || ''
    const reference = searchParams.get('reference') || ''

    if (pollUrl) {
      await connectToDatabase()
      const paynow = createPaynowInstance()
      const status = await paynow.pollTransaction(pollUrl)

      if (status.paid()) {
        // Find order by poll URL and redirect to order page
        const order = await Order.findOne({
          'paymentResult.paynowPollUrl': pollUrl
        }).lean() as any

        if (order) {
          return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/account/orders/${order._id}`
          )
        }
      }
    }

    // Fallback — redirect to orders page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/account/orders`
    )
  } catch (err) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/account/orders`
    )
  }
}
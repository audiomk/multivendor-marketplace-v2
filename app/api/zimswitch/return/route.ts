import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import { getZimswitchPaymentStatus, isZimswitchSuccessCode } from '@/lib/zimswitch'
import { splitOrderByVendor } from '@/lib/actions/payment.actions'

// The widget (paymentWidgets.js) redirects the browser back here with
// ?resourcePath=... — VERIFY the exact query param names against the real
// OPPWA integration guide; this follows their commonly documented shape.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const resourcePath = searchParams.get('resourcePath')
    const orderId = searchParams.get('orderId')

    if (!resourcePath || !orderId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SERVER_URL}/account/orders`)
    }

    await connectToDatabase()
    const order = await Order.findById(orderId)
    if (!order) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SERVER_URL}/account/orders`)
    }

    if (!order.isPaid) {
      // Never trust the redirect alone — verify status directly with OPPWA.
      const status = await getZimswitchPaymentStatus(resourcePath)
      if (isZimswitchSuccessCode(status.result.code)) {
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
      }
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/account/orders/${orderId}`
    )
  } catch (err) {
    console.error('Zimswitch return error:', err)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SERVER_URL}/account/orders`)
  }
}

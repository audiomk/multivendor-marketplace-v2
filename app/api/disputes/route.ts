import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Dispute from '@/lib/db/models/dispute.model'
import Order from '@/lib/db/models/order.model'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, vendorId, reason, details } = await req.json()

    await connectToDatabase()

    // Verify buyer owns this order
    const order = await Order.findOne({
      _id:    orderId,
      user:   (session.user as any).id,
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const dispute = await Dispute.create({
      orderId,
      buyerId:  (session.user as any).id,
      vendorId,
      reason,
      details,
    })

    return NextResponse.json({ success: true, disputeId: dispute._id })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const role = (session.user as any).role
    const userId = (session.user as any).id

    let filter: any = {}
    if (role === 'Admin' || role === 'admin') {
      filter = {} // admin sees all
    } else if (role === 'vendor') {
      filter = { vendorId: userId }
    } else {
      filter = { buyerId: userId }
    }

    const disputes = await Dispute.find(filter)
      .populate('orderId',  '_id totalPrice')
      .populate('buyerId',  'name email')
      .populate('vendorId', 'name vendorProfile')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(disputes)
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
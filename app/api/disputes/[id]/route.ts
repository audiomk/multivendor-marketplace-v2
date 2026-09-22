import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Dispute from '@/lib/db/models/dispute.model'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const role = (session?.user as any)?.role
    if (role !== 'Admin' && role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { status, resolution } = await req.json()

    await connectToDatabase()

    await Dispute.findByIdAndUpdate(id, {
      status,
      resolution,
      resolvedAt: ['resolved', 'rejected'].includes(status)
        ? new Date()
        : undefined,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
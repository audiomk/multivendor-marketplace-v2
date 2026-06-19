import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any).role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { storeName, storeSlug, bio, logo } = await req.json()
    const vendorId = (session.user as any).id

    await connectToDatabase()

    // Check slug not taken by another vendor
    const existing = await User.findOne({
      'vendorProfile.storeSlug': storeSlug,
      _id: { $ne: vendorId },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'That store URL is already taken' },
        { status: 409 }
      )
    }

    await User.findByIdAndUpdate(vendorId, {
      'vendorProfile.storeName': storeName,
      'vendorProfile.storeSlug': storeSlug,
      'vendorProfile.bio':       bio,
      'vendorProfile.logo':      logo,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
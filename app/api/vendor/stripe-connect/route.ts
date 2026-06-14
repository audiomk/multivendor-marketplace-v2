import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { stripe } from '@/lib/stripe'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'

export async function POST() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const user = await User.findById((session.user as any).id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let accountId = user.vendorProfile?.stripeAccountId

    if (!accountId) {
      const account = await stripe.accounts.create({
        type:  'express',
        email: user.email!,
        capabilities: {
          card_payments: { requested: true },
          transfers:     { requested: true },
        },
      })
      accountId = account.id
      await User.findByIdAndUpdate(user._id, {
        'vendorProfile.stripeAccountId': accountId,
      })
    }

    const accountLink = await stripe.accountLinks.create({
      account:     accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/vendor/settings`,
      return_url:  `${process.env.NEXT_PUBLIC_SERVER_URL}/vendor/settings?stripe=success`,
      type:        'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
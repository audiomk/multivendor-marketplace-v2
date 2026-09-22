import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'
import bcrypt from 'bcryptjs'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    const { allowed, retryAfterSeconds } = checkRateLimit(
      `reset-password:${getClientIp(req)}`,
      10,
      15 * 60 * 1000
    )
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many attempts — try again later' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
      )
    }

    const { token, password } = await req.json()
    await connectToDatabase()

    const user = await User.findOne({
      resetToken:        token,
      resetTokenExpires: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link' },
        { status: 400 }
      )
    }

    await User.findByIdAndUpdate(user._id, {
      password:          bcrypt.hashSync(password, 10),
      resetToken:        null,
      resetTokenExpires: null,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
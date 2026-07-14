import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
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
      password:          bcrypt.hashSync(password, 5),
      resetToken:        null,
      resetTokenExpires: null,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
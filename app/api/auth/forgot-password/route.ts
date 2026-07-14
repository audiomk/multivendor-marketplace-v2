import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'
import crypto from 'crypto'
import { Resend } from 'resend'
import { SENDER_EMAIL, SENDER_NAME } from '@/lib/constants'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    await connectToDatabase()

    const user = await User.findOne({ email })
    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Generate reset token
    const token   = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await User.findByIdAndUpdate(user._id, {
      resetToken:        token,
      resetTokenExpires: expires,
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password?token=${token}`

    await resend.emails.send({
      from:    `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to:      email,
      subject: 'Reset your Indaba Cart password',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto">
          <div style="background:#006D6B;padding:20px;text-align:center;border-radius:8px 8px 0 0">
            <h1 style="color:#FABB02;margin:0">Indaba Cart</h1>
          </div>
          <div style="background:#fff;padding:24px;border-radius:0 0 8px 8px;border:1px solid #eee">
            <h2>Reset Your Password</h2>
            <p>Click the button below to reset your password. This link expires in 1 hour.</p>
            <a href="${resetUrl}"
               style="display:inline-block;background:#006D6B;color:#fff;padding:12px 24px;
                      border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
              Reset Password
            </a>
            <p style="color:#666;font-size:12px">
              If you didn't request this, ignore this email.
            </p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
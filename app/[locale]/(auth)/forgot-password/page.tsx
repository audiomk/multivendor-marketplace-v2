'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [sent,      setSent]      = useState(false)
  const [error,     setError]     = useState('')

  const handleSubmit = async () => {
    if (!email) return
    setLoading(true)
    setError('')
    try {
      await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full max-w-md mx-auto'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>Reset Password</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {sent ? (
            <div className='text-center space-y-3 py-4'>
              <div className='text-4xl'>📧</div>
              <p className='font-semibold'>Check your email</p>
              <p className='text-sm text-muted-foreground'>
                If an account exists for {email}, you'll receive a
                password reset link shortly.
              </p>
              <Link
                href='/sign-in'
                className='text-sm text-[#006D6B] hover:underline block'
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <p className='text-sm text-muted-foreground'>
                Enter your email address and we'll send you a link to
                reset your password.
              </p>
              {error && (
                <p className='text-red-600 text-sm'>{error}</p>
              )}
              <Input
                type='email'
                placeholder='Enter your email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <Button
                className='w-full'
                style={{ background: '#006D6B' }}
                onClick={handleSubmit}
                disabled={loading || !email}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <Link
                href='/sign-in'
                className='text-sm text-[#006D6B] hover:underline block text-center'
              >
                Back to Sign In
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
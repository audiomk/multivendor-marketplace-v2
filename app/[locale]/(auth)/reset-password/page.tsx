'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token        = searchParams.get('token') || ''
  const [password,   setPassword]   = useState('')
  const [confirm,    setConfirm]    = useState('')
  const [loading,    setLoading]    = useState(false)
  const [done,       setDone]       = useState(false)
  const [error,      setError]      = useState('')

  const handleSubmit = async () => {
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setDone(true)
      }
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
          <CardTitle className='text-2xl'>New Password</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {done ? (
            <div className='text-center space-y-3 py-4'>
              <div className='text-4xl'>✅</div>
              <p className='font-semibold'>Password reset successfully!</p>
              <Link
                href='/sign-in'
                className='text-sm text-[#006D6B] hover:underline block'
              >
                Sign in with your new password
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <p className='text-red-600 text-sm bg-red-50 p-3 rounded'>
                  {error}
                </p>
              )}
              <Input
                type='password'
                placeholder='New password'
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <Input
                type='password'
                placeholder='Confirm new password'
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
              <Button
                className='w-full'
                style={{ background: '#006D6B' }}
                onClick={handleSubmit}
                disabled={loading || !password || !confirm}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
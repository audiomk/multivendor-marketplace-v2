'use client'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function StripeConnectButton() {
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setLoading(true)
    const res  = await fetch('/api/vendor/stripe-connect', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setLoading(false)
      alert('Failed to connect Stripe. Check your Stripe keys.')
    }
  }

  return (
    <Button onClick={handle} disabled={loading}>
      {loading ? 'Connecting...' : 'Connect with Stripe'}
    </Button>
  )
}
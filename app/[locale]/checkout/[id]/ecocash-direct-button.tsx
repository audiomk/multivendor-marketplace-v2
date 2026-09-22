'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

// SCAFFOLD — optional automatic path alongside the manual EcoCash flow.
// Fails gracefully (with a clear message) until ECOCASH_API_KEY /
// ECOCASH_MERCHANT_CODE are configured server-side — see lib/ecocash-api.ts.
export default function EcoCashDirectButton({ orderId }: { orderId: string }) {
  const [msisdn, setMsisdn] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  const handleCharge = async () => {
    if (!msisdn.trim()) {
      toast({ description: 'Enter your EcoCash number', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/ecocash/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, msisdn }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setSent(true)
      toast({ description: data.message })
    } catch (err: any) {
      toast({ description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <p className='text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2'>
        Prompt sent — approve it on your phone, then refresh this page.
      </p>
    )
  }

  return (
    <div className='space-y-2'>
      <p className='text-xs text-muted-foreground'>
        Or get an automatic payment prompt (once enabled):
      </p>
      <div className='flex gap-2'>
        <Input
          type='tel'
          placeholder='07XXXXXXXX'
          value={msisdn}
          onChange={e => setMsisdn(e.target.value)}
        />
        <Button onClick={handleCharge} disabled={loading} variant='outline' className='shrink-0'>
          {loading ? 'Sending…' : 'Send Prompt'}
        </Button>
      </div>
    </div>
  )
}

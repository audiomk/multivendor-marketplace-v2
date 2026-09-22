'use client'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

// SCAFFOLD — renders OPPWA's "Copy & Pay" widget once ZIMSWITCH_ENTITY_ID /
// ZIMSWITCH_ACCESS_TOKEN are configured server-side. Until then, initiate
// fails gracefully with a clear message. VERIFY the widget script URL and
// data-brands values against the real OPPWA integration guide once you have
// sandbox access.
export default function ZimswitchForm({ orderId }: { orderId: string }) {
  const [checkoutId, setCheckoutId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/zimswitch/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.error || 'Could not start Zimswitch checkout')
        if (!cancelled) setCheckoutId(data.checkoutId)
      } catch (err: any) {
        if (!cancelled) setError(err.message)
        toast({ description: err.message, variant: 'destructive' })
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [orderId, toast])

  useEffect(() => {
    if (!checkoutId) return
    const env = process.env.NEXT_PUBLIC_ZIMSWITCH_ENV === 'live' ? 'oppwa.com' : 'eu-test.oppwa.com'
    const script = document.createElement('script')
    script.src = `https://${env}/v1/paymentWidgets.js?checkoutId=${checkoutId}`
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [checkoutId])

  if (loading) {
    return <p className='text-sm text-muted-foreground'>Starting Zimswitch checkout…</p>
  }

  if (error) {
    return (
      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm'>
        <p className='font-medium text-yellow-800'>Zimswitch isn&apos;t available yet</p>
        <p className='text-yellow-700 mt-1'>{error}</p>
      </div>
    )
  }

  return (
    <form
      action={`/api/zimswitch/return?orderId=${orderId}`}
      className='paymentWidgets'
      data-brands='VISA MASTER'
    />
  )
}

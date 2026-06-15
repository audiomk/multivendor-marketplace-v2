'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export default function EcoCashConfirmButton({ orderId }: { orderId: string }) {
  const [loading,   setLoading]   = useState(false)
  const [reference, setReference] = useState('')
  const { toast } = useToast()
  const router    = useRouter()

  const handleConfirm = async () => {
    if (!reference.trim()) {
      toast({
        description: 'Please enter your EcoCash transaction reference',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    try {
      const res  = await fetch('/api/orders/ecocash-confirm', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderId, reference }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ description: 'Payment submitted for confirmation!' })
        router.push(`/account/orders/${orderId}`)
      } else {
        throw new Error(data.error)
      }
    } catch (err: any) {
      toast({ description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-2'>
      <input
        type='text'
        placeholder='Enter EcoCash reference e.g. ECD123456789'
        value={reference}
        onChange={e => setReference(e.target.value)}
        className='w-full border rounded-lg px-3 py-2 text-sm outline-none
                   focus:ring-2 focus:ring-green-500'
      />
      <Button
        className='w-full rounded-full bg-green-600 hover:bg-green-700'
        onClick={handleConfirm}
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'I Have Paid via EcoCash'}
      </Button>
    </div>
  )
}
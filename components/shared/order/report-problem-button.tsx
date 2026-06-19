'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const REASONS = [
  'Item not received',
  'Item damaged',
  'Wrong item sent',
  'Item not as described',
  'Other',
]

export default function ReportProblemButton({
  orderId,
  vendorOrders,
}: {
  orderId: string
  vendorOrders: any[]
}) {
  const [open,    setOpen]    = useState(false)
  const [reason,  setReason]  = useState(REASONS[0])
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!details.trim()) {
      toast({ description: 'Please provide details', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const vendorId = vendorOrders[0]?.vendorId
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, vendorId, reason, details }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ description: 'Dispute submitted. We will review it shortly.' })
        setOpen(false)
      }
    } catch {
      toast({ description: 'Failed to submit', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (!open) return (
    <Button
      variant='outline'
      className='w-full text-red-600 border-red-200 hover:bg-red-50'
      onClick={() => setOpen(true)}
    >
      Report a Problem
    </Button>
  )

  return (
    <div className='border border-red-200 rounded-lg p-4 space-y-3'>
      <h3 className='font-semibold text-red-700'>Report a Problem</h3>
      <select
        value={reason}
        onChange={e => setReason(e.target.value)}
        className='w-full border rounded px-3 py-2 text-sm'
      >
        {REASONS.map(r => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <textarea
        value={details}
        onChange={e => setDetails(e.target.value)}
        placeholder='Please describe the problem in detail...'
        rows={3}
        className='w-full border rounded px-3 py-2 text-sm outline-none
                   focus:ring-2 focus:ring-red-400 resize-none'
      />
      <div className='flex gap-2'>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className='flex-1 bg-red-600 hover:bg-red-700'
        >
          {loading ? 'Submitting...' : 'Submit Dispute'}
        </Button>
        <Button
          variant='outline'
          onClick={() => setOpen(false)}
          className='flex-1'
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
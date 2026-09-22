'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

const REASONS = [
  'Item not received',
  'Item not as described',
  'Damaged or defective',
  'Vendor unresponsive',
  'Other',
]

export default function DisputeForm({
  orderId,
  vendors,
}: {
  orderId: string
  vendors: { id: string; storeName: string }[]
}) {
  const [open, setOpen] = useState(false)
  const [vendorId, setVendorId] = useState(vendors[0]?.id || '')
  const [reason, setReason] = useState(REASONS[0])
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  if (submitted) {
    return (
      <p className='text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3'>
        Your report was submitted. Our team will review it and follow up.
      </p>
    )
  }

  if (!open) {
    return (
      <Button variant='outline' size='sm' onClick={() => setOpen(true)}>
        Report a Problem
      </Button>
    )
  }

  const handleSubmit = async () => {
    if (!details.trim()) {
      toast({ description: 'Add a few details about the issue', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, vendorId, reason, details }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Could not submit report')
      setSubmitted(true)
      router.refresh()
    } catch (err: any) {
      toast({ description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-2 border rounded-lg p-3'>
      {vendors.length > 1 && (
        <Select value={vendorId} onValueChange={setVendorId}>
          <SelectTrigger className='h-9'><SelectValue /></SelectTrigger>
          <SelectContent>
            {vendors.map((v) => (
              <SelectItem key={v.id} value={v.id}>{v.storeName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Select value={reason} onValueChange={setReason}>
        <SelectTrigger className='h-9'><SelectValue /></SelectTrigger>
        <SelectContent>
          {REASONS.map((r) => (
            <SelectItem key={r} value={r}>{r}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder='What happened?'
        rows={3}
        className='w-full border rounded-md px-3 py-2 text-sm outline-none
                   focus:ring-2 focus:ring-[#006D6B] resize-none'
      />
      <div className='flex gap-2'>
        <Button size='sm' onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting…' : 'Submit Report'}
        </Button>
        <Button size='sm' variant='ghost' onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  )
}

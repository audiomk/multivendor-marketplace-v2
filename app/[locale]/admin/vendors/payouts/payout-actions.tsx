'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  markVendorPayoutPaid, markVendorPayoutUnpaid,
} from '@/lib/actions/admin.actions'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export function MarkPaidForm({ orderId, vendorId }: { orderId: string; vendorId: string }) {
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState<'ecocash' | 'bank_transfer' | 'other'>('ecocash')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  if (!open) {
    return (
      <Button size='sm' className='bg-green-600 hover:bg-green-700' onClick={() => setOpen(true)}>
        Mark Paid
      </Button>
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    const res = await markVendorPayoutPaid({ orderId, vendorId, method, reference, notes })
    setLoading(false)
    toast({ description: res.message, variant: res.success ? 'default' : 'destructive' })
    if (res.success) {
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <div className='space-y-2 w-56'>
      <Select value={method} onValueChange={(v) => setMethod(v as typeof method)}>
        <SelectTrigger className='h-8 text-xs'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='ecocash'>EcoCash</SelectItem>
          <SelectItem value='bank_transfer'>Bank Transfer</SelectItem>
          <SelectItem value='other'>Other</SelectItem>
        </SelectContent>
      </Select>
      <Input
        className='h-8 text-xs'
        placeholder='Reference (e.g. EcoCash txn id)'
        value={reference}
        onChange={(e) => setReference(e.target.value)}
      />
      <Input
        className='h-8 text-xs'
        placeholder='Notes (optional)'
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className='flex gap-1'>
        <Button size='sm' className='h-7 text-xs bg-green-600 hover:bg-green-700'
          onClick={handleSubmit} disabled={loading || !reference.trim()}>
          {loading ? 'Saving…' : 'Confirm'}
        </Button>
        <Button size='sm' variant='outline' className='h-7 text-xs' onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export function RevertPaidButton({ orderId, vendorId }: { orderId: string; vendorId: string }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleRevert = async () => {
    if (!confirm('Revert this payout to unpaid?')) return
    setLoading(true)
    const res = await markVendorPayoutUnpaid({ orderId, vendorId })
    setLoading(false)
    toast({ description: res.message, variant: res.success ? 'default' : 'destructive' })
    if (res.success) router.refresh()
  }

  return (
    <Button size='sm' variant='ghost' className='h-7 text-xs text-muted-foreground'
      onClick={handleRevert} disabled={loading}>
      Undo
    </Button>
  )
}

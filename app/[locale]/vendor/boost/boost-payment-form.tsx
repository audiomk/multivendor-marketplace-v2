'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { submitBoostPaymentReference } from '@/lib/actions/boost.actions'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export default function BoostPaymentForm({ boostId }: { boostId: string }) {
  const [open, setOpen] = useState(false)
  const [reference, setReference] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  if (!open) {
    return (
      <Button size='sm' onClick={() => setOpen(true)}>I&rsquo;ve Paid</Button>
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    const res = await submitBoostPaymentReference({ boostId, method: 'ecocash', reference })
    setLoading(false)
    toast({ description: res.message, variant: res.success ? 'default' : 'destructive' })
    if (res.success) {
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <div className='flex gap-1 items-center'>
      <Input
        className='h-8 text-xs w-40'
        placeholder='EcoCash/Paynow reference'
        value={reference}
        onChange={(e) => setReference(e.target.value)}
      />
      <Button size='sm' className='h-8' onClick={handleSubmit} disabled={loading || !reference.trim()}>
        {loading ? '…' : 'Submit'}
      </Button>
    </div>
  )
}

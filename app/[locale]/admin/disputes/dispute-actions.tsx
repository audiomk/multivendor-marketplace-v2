'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { updateDisputeStatus } from '@/lib/actions/dispute.actions'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export default function DisputeActions({ disputeId, status }: { disputeId: string; status: string }) {
  const [resolving, setResolving] = useState<'resolved' | 'rejected' | null>(null)
  const [resolution, setResolution] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const setUnderReview = async () => {
    setLoading(true)
    const res = await updateDisputeStatus({ disputeId, status: 'under_review' })
    setLoading(false)
    toast({ description: res.message, variant: res.success ? 'default' : 'destructive' })
    if (res.success) router.refresh()
  }

  const submitResolution = async () => {
    if (!resolving) return
    setLoading(true)
    const res = await updateDisputeStatus({ disputeId, status: resolving, resolution })
    setLoading(false)
    toast({ description: res.message, variant: res.success ? 'default' : 'destructive' })
    if (res.success) {
      setResolving(null)
      router.refresh()
    }
  }

  if (status === 'resolved' || status === 'rejected') {
    return null
  }

  if (resolving) {
    return (
      <div className='space-y-2 w-56'>
        <textarea
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          placeholder='Explain the outcome…'
          rows={2}
          className='w-full border rounded-md px-2 py-1 text-xs outline-none resize-none'
        />
        <div className='flex gap-1'>
          <Button size='sm' className='h-7 text-xs' onClick={submitResolution} disabled={loading}>
            {loading ? '…' : 'Confirm'}
          </Button>
          <Button size='sm' variant='outline' className='h-7 text-xs' onClick={() => setResolving(null)}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex gap-1 flex-wrap'>
      {status === 'open' && (
        <Button size='sm' variant='outline' onClick={setUnderReview} disabled={loading}>
          Start Review
        </Button>
      )}
      <Button size='sm' className='bg-green-600 hover:bg-green-700' onClick={() => setResolving('resolved')}>
        Resolve
      </Button>
      <Button size='sm' variant='destructive' onClick={() => setResolving('rejected')}>
        Reject
      </Button>
    </div>
  )
}

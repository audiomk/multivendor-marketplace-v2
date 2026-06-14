'use client'
import { Button } from '@/components/ui/button'
import {
  approveVendor, rejectVendor, suspendVendor
} from '@/lib/actions/admin.actions'
import { useRouter } from '@/i18n/routing'
import { useState } from 'react'

export default function VendorActions({
  id, type
}: {
  id: string
  type: 'pending' | 'approved'
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handle = async (action: 'approve' | 'reject' | 'suspend') => {
    if (!confirm(`${action} this vendor?`)) return
    setLoading(true)
    if (action === 'approve') await approveVendor(id)
    if (action === 'reject')  await rejectVendor(id)
    if (action === 'suspend') await suspendVendor(id)
    setLoading(false)
    router.refresh()
  }

  if (type === 'pending') return (
    <div className='flex gap-2'>
      <Button size='sm' onClick={() => handle('approve')} disabled={loading}
        className='bg-green-600 hover:bg-green-700'>
        Approve
      </Button>
      <Button size='sm' variant='destructive'
        onClick={() => handle('reject')} disabled={loading}>
        Reject
      </Button>
    </div>
  )

  return (
    <Button size='sm' variant='outline'
      onClick={() => handle('suspend')} disabled={loading}>
      Suspend
    </Button>
  )
}
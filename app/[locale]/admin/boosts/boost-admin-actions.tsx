'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { confirmBoostPayment, revokeBoost } from '@/lib/actions/boost.actions'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export function ConfirmBoostButton({ boostId }: { boostId: string }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleConfirm = async () => {
    setLoading(true)
    const res = await confirmBoostPayment(boostId)
    setLoading(false)
    toast({ description: res.message, variant: res.success ? 'default' : 'destructive' })
    if (res.success) router.refresh()
  }

  return (
    <Button size='sm' className='bg-green-600 hover:bg-green-700' onClick={handleConfirm} disabled={loading}>
      {loading ? '…' : 'Confirm & Activate'}
    </Button>
  )
}

export function RevokeBoostButton({ boostId }: { boostId: string }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleRevoke = async () => {
    if (!confirm('Revoke this boost?')) return
    setLoading(true)
    const res = await revokeBoost(boostId)
    setLoading(false)
    toast({ description: res.message, variant: res.success ? 'default' : 'destructive' })
    if (res.success) router.refresh()
  }

  return (
    <Button size='sm' variant='outline' onClick={handleRevoke} disabled={loading}>
      {loading ? '…' : 'Revoke'}
    </Button>
  )
}

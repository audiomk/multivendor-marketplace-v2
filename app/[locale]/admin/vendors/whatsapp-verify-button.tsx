'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { setVendorWhatsAppVerified } from '@/lib/actions/admin.actions'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export default function WhatsAppVerifyButton({
  vendorId,
  verified,
}: {
  vendorId: string
  verified: boolean
}) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleToggle = async () => {
    setLoading(true)
    const res = await setVendorWhatsAppVerified(vendorId, !verified)
    setLoading(false)
    toast({ description: res.message, variant: res.success ? 'default' : 'destructive' })
    if (res.success) router.refresh()
  }

  return (
    <Button
      size='sm'
      variant={verified ? 'outline' : 'default'}
      className={verified ? '' : 'bg-green-600 hover:bg-green-700'}
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? '…' : verified ? 'Revoke' : 'Verify'}
    </Button>
  )
}

'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateVendorWhatsApp } from '@/lib/actions/vendor.actions'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export default function WhatsAppForm({
  currentNumber,
  isVerified,
}: {
  currentNumber: string
  isVerified: boolean
}) {
  const [number, setNumber] = useState(currentNumber)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSave = async () => {
    setLoading(true)
    const res = await updateVendorWhatsApp(number)
    setLoading(false)
    toast({ description: res.message, variant: res.success ? 'default' : 'destructive' })
    if (res.success) router.refresh()
  }

  return (
    <div className='space-y-3'>
      {currentNumber && (
        <div className='flex items-center gap-2 text-sm'>
          <div className={`w-2.5 h-2.5 rounded-full ${isVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span>
            {isVerified
              ? 'Verified — you’ll get order alerts here'
              : 'Pending verification — we’ll confirm this number with you'}
          </span>
        </div>
      )}
      <div className='flex gap-2'>
        <Input
          type='tel'
          placeholder='07XXXXXXXX'
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
        <Button onClick={handleSave} disabled={loading || !number.trim()} className='shrink-0'>
          {loading ? 'Saving…' : 'Save'}
        </Button>
      </div>
      <p className='text-xs text-muted-foreground'>
        We message this number directly when you get an order — much faster
        than checking a group chat.
      </p>
    </div>
  )
}

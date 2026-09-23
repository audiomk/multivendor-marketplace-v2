'use client'
import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { startConversation } from '@/lib/actions/message.actions'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export default function MessageSellerButton({
  vendorId,
  productId,
}: {
  vendorId: string
  productId: string
}) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleClick = async () => {
    setLoading(true)
    const res = await startConversation({ vendorId, productId })
    setLoading(false)
    if (!res.success) {
      if (res.message === 'Not logged in') {
        toast({ description: 'Sign in to message the seller' })
        router.push('/sign-in')
        return
      }
      toast({ description: res.message, variant: 'destructive' })
      return
    }
    router.push(`/account/messages/${res.data!.conversationId}`)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className='text-sm text-blue-600 hover:underline flex items-center gap-1 w-fit'
    >
      <MessageCircle className='w-3.5 h-3.5' />
      {loading ? 'Starting chat…' : 'Message Seller'}
    </button>
  )
}

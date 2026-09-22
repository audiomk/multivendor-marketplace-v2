'use client'
import { useState } from 'react'
import { Heart } from 'lucide-react'
import { toggleWishlist } from '@/lib/actions/wishlist.actions'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function WishlistButton({
  productId,
  initialInWishlist = false,
  className,
}: {
  productId: string
  initialInWishlist?: boolean
  className?: string
}) {
  const [inWishlist, setInWishlist] = useState(initialInWishlist)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    const res = await toggleWishlist(productId)
    setLoading(false)
    if (!res.success) {
      if (res.message === 'Not logged in') {
        toast({ description: 'Sign in to save items to your wishlist' })
        router.push('/sign-in')
      } else {
        toast({ description: res.message, variant: 'destructive' })
      }
      return
    }
    setInWishlist(res.inWishlist!)
    router.refresh()
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      disabled={loading}
      className={cn(
        'absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 shadow-sm',
        'hover:bg-white transition-colors',
        className
      )}
    >
      <Heart
        className={cn('w-4 h-4', inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-500')}
      />
    </button>
  )
}

'use client'
import { Button } from '@/components/ui/button'
import {
  deleteVendorProduct,
  permanentlyDeleteVendorProduct,
} from '@/lib/actions/vendor.actions'
import { useRouter } from '@/i18n/routing'
import { useState } from 'react'

export default function DeleteVendorProduct({
  id,
  isPublished,
}: {
  id:          string
  isPublished: boolean
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDraft = async () => {
    if (!confirm('Move this product to drafts? It will be hidden from public listings.')) return
    setLoading(true)
    await deleteVendorProduct(id)
    setLoading(false)
    router.refresh()
  }

  const handlePermanent = async () => {
    if (!confirm('Permanently delete this product? This cannot be undone.')) return
    setLoading(true)
    await permanentlyDeleteVendorProduct(id)
    setLoading(false)
    router.refresh()
  }

  if (!isPublished) {
    // Already a draft — show permanent delete option
    return (
      <div className='flex gap-1'>
        <Button
          size='sm'
          variant='outline'
          onClick={handleDraft}
          disabled={loading}
          className='text-xs'
        >
          Draft
        </Button>
        <Button
          size='sm'
          variant='destructive'
          onClick={handlePermanent}
          disabled={loading}
          className='text-xs'
        >
          {loading ? '...' : 'Delete Forever'}
        </Button>
      </div>
    )
  }

  return (
    <Button
      size='sm'
      variant='destructive'
      onClick={handleDraft}
      disabled={loading}
    >
      {loading ? '...' : 'Deactivate'}
    </Button>
  )
}
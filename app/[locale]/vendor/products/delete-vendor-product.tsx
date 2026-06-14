'use client'
import { Button } from '@/components/ui/button'
import { deleteVendorProduct } from '@/lib/actions/vendor.actions'
import { useRouter } from '@/i18n/routing'
import { useState } from 'react'

export default function DeleteVendorProduct({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handle = async () => {
    if (!confirm('Remove this product?')) return
    setLoading(true)
    await deleteVendorProduct(id)
    setLoading(false)
    router.refresh()
  }

  return (
    <Button
      size='sm'
      variant='destructive'
      onClick={handle}
      disabled={loading}
    >
      {loading ? '...' : 'Delete'}
    </Button>
  )
}
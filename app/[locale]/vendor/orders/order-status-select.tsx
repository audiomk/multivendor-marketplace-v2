'use client'
import { updateVendorOrderStatus } from '@/lib/actions/vendor.actions'
import { useRouter } from '@/i18n/routing'
import { useState } from 'react'

const STATUSES = ['pending', 'processing', 'shipped', 'delivered']

export default function OrderStatusSelect({
  orderId,
  vendorId,
  currentStatus,
}: {
  orderId: string
  vendorId: string
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handle = async (val: string) => {
    setLoading(true)
    await updateVendorOrderStatus(orderId, vendorId, val)
    setStatus(val)
    setLoading(false)
    router.refresh()
  }

  return (
    <select
      value={status}
      onChange={e => handle(e.target.value)}
      disabled={loading}
      className='border rounded px-2 py-1 text-sm'
    >
      {STATUSES.map(s => (
        <option key={s} value={s}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  )
}
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requestBoost } from '@/lib/actions/boost.actions'
import { BOOST_TIERS, BOOST_DURATIONS_DAYS, calculateBoostPrice, BoostTier } from '@/lib/boost'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export default function BoostRequestForm({
  products,
}: {
  products: { _id: string; name: string }[]
}) {
  const [productId, setProductId] = useState(products[0]?._id || '')
  const [tier, setTier] = useState<BoostTier>('featured')
  const [duration, setDuration] = useState(7)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const price = calculateBoostPrice(tier, duration)

  const handleSubmit = async () => {
    if (!productId) {
      toast({ description: 'Add a product first', variant: 'destructive' })
      return
    }
    setLoading(true)
    const res = await requestBoost({ productId, tier, durationDays: duration })
    setLoading(false)
    toast({ description: res.message, variant: res.success ? 'default' : 'destructive' })
    if (res.success) router.refresh()
  }

  if (products.length === 0) {
    return (
      <Card className='mb-6'>
        <CardContent className='p-6 text-sm text-muted-foreground'>
          Add a product before you can boost one.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle>Boost a Product</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <label className='text-sm font-medium mb-1 block'>Product</label>
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='grid grid-cols-3 gap-2'>
          {(Object.keys(BOOST_TIERS) as BoostTier[]).map((t) => (
            <button
              key={t}
              type='button'
              onClick={() => setTier(t)}
              className={`p-3 rounded-lg border-2 text-left transition ${
                tier === t ? 'border-[#006D6B] bg-[#006D6B]/5' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className='font-semibold text-sm'>{BOOST_TIERS[t].label}</p>
              <p className='text-xs text-muted-foreground mt-0.5'>{BOOST_TIERS[t].description}</p>
              <p className='text-xs font-medium mt-1'>${BOOST_TIERS[t].pricePerWeek}/week</p>
              {BOOST_TIERS[t].maxSlots !== null && (
                <p className='text-[11px] text-yellow-600 mt-0.5'>Limited slots</p>
              )}
            </button>
          ))}
        </div>

        <div>
          <label className='text-sm font-medium mb-1 block'>Duration</label>
          <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {BOOST_DURATIONS_DAYS.map((d) => (
                <SelectItem key={d} value={String(d)}>{d} days</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center justify-between pt-2 border-t'>
          <p className='text-lg font-bold'>${price.toFixed(2)}</p>
          <Button onClick={handleSubmit} disabled={loading} style={{ background: '#006D6B' }}>
            {loading ? 'Requesting…' : 'Request Boost'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

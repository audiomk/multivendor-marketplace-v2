'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PriceSlider({
  minPrice = 0,
  maxPrice = 1000,
  currentMin,
  currentMax,
}: {
  minPrice?:   number
  maxPrice?:   number
  currentMin?: number
  currentMax?: number
}) {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const [min, setMin] = useState(currentMin ?? minPrice)
  const [max, setMax] = useState(currentMax ?? maxPrice)

  // Apply filter
  const apply = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('price', `${min}-${max}`)
    params.set('page', '1')
    router.push(`/search?${params.toString()}`)
  }

  const reset = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('price')
    params.set('page', '1')
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className='space-y-3'>
      <div className='flex justify-between text-sm font-medium'>
        <span>${min}</span>
        <span>${max}</span>
      </div>

      {/* Min slider */}
      <div className='space-y-1'>
        <label className='text-xs text-gray-500'>Min price</label>
        <input
          type='range'
          min={minPrice}
          max={maxPrice}
          value={min}
          onChange={e => {
            const val = Number(e.target.value)
            if (val < max) setMin(val)
          }}
          className='w-full accent-[#006D6B]'
        />
      </div>

      {/* Max slider */}
      <div className='space-y-1'>
        <label className='text-xs text-gray-500'>Max price</label>
        <input
          type='range'
          min={minPrice}
          max={maxPrice}
          value={max}
          onChange={e => {
            const val = Number(e.target.value)
            if (val > min) setMax(val)
          }}
          className='w-full accent-[#006D6B]'
        />
      </div>

      {/* Visual range bar */}
      <div className='relative h-2 bg-gray-200 rounded-full'>
        <div
          className='absolute h-2 rounded-full'
          style={{
            background:  '#006D6B',
            left:  `${((min - minPrice) / (maxPrice - minPrice)) * 100}%`,
            right: `${100 - ((max - minPrice) / (maxPrice - minPrice)) * 100}%`,
          }}
        />
      </div>

      <div className='flex gap-2'>
        <button
          onClick={apply}
          className='flex-1 text-sm py-1.5 rounded-lg text-white font-medium'
          style={{ background: '#006D6B' }}
        >
          Apply
        </button>
        <button
          onClick={reset}
          className='flex-1 text-sm py-1.5 rounded-lg border font-medium
                     hover:bg-gray-50'
        >
          Reset
        </button>
      </div>
    </div>
  )
}
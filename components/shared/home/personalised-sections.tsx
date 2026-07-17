'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import useBrowsingHistory from '@/hooks/use-browsing-history'
import ProductSlider from '@/components/shared/product/product-slider'
import { Separator } from '@/components/ui/separator'

function PersonalisedSlider({
  title,
  type,
  hideDetails = false,
  accentColor = '#006D6B',
}: {
  title:        string
  type:         'related' | 'trending' | 'also-bought'
  hideDetails?: boolean
  accentColor?: string
}) {
  const { products: history } = useBrowsingHistory()
  const [data, setData]       = useState([])

  const historyIds = history.map((p) => p.id).join(',')
  const historyCategories = history.map((p) => p.category).join(',')

  useEffect(() => {
    if (!historyIds) return

    fetch(
      `/api/products/browsing-history?type=${type}&ids=${historyIds}&categories=${historyCategories}&excludeId=`
    )
      .then((r) => r.json())
      .then(setData)
      .catch((err) => console.error('Personalised data fetch error:', err))
  }, [historyIds, historyCategories, type])

  if (!data.length) return null

  return (
    <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
      <div className='flex items-center gap-3 px-5 pt-5 pb-3
                      border-b border-gray-100'>
        <div
          className='w-1 h-6 rounded-full'
          style={{ background: accentColor }}
        />
        <h2 className='text-xl font-bold text-gray-900'>{title}</h2>
      </div>
      <div className='p-4'>
        <ProductSlider
          products={data}
          hideDetails={hideDetails}
        />
      </div>
    </div>
  )
}

export default function PersonalisedSections() {
  const { products } = useBrowsingHistory()
  const t = useTranslations('Home') // Instantiated securely inside the component block

  if (!products.length) return null

  return (
    <div className='space-y-6'>
      <Separator />
      <PersonalisedSlider
        title={t('Picked For You')}
        type='related'
        accentColor='#006D6B'
      />
      <PersonalisedSlider
        title={t('Trending in Your Department')}
        type='trending'
        accentColor='#FABB02'
      />
      <PersonalisedSlider
        title={t('Shoppers Like You Also Bought')}
        type='also-bought'
        hideDetails
        accentColor='#006D6B'
      />
    </div>
  )
}
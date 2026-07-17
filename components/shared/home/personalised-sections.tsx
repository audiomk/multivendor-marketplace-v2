'use client'
import { useEffect, useState } from 'react'
import useBrowsingHistory from '@/hooks/use-browsing-history'
import ProductSlider from '@/components/shared/product/product-slider'
import { Separator } from '@/components/ui/separator'
import { useTranslations } from 'next-intl'
// inside component:
const t = useTranslations('Home')
// then use:
{t('Featured Promotions')}
{t('Sponsored')}

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

  useEffect(() => {
    if (!history.length) return
    const ids        = history.map((p) => p.id).join(',')
    const categories = history.map((p) => p.category).join(',')

    fetch(
      `/api/products/browsing-history?type=${type}&ids=${ids}&categories=${categories}&excludeId=`
    )
      .then((r) => r.json())
      .then(setData)
  }, [history, type])

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
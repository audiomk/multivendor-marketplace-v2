import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getBoostedProducts } from '@/lib/actions/boost.actions'
import { BOOST_TIERS } from '@/lib/boost'

// Real, paid vendor placements (see /vendor/boost and lib/actions/boost.actions.ts).
// Empty slots show an "Advertise here" card instead of stock-photo filler —
// turns unsold ad inventory into a self-serve upsell for vendors.
export default async function AdSlots() {
  const t = await getTranslations('Home')
  const maxSlots = BOOST_TIERS.spotlight.maxSlots || 4
  const boosted = await getBoostedProducts({ tier: 'spotlight', limit: maxSlots })
  const emptySlots = Math.max(0, maxSlots - boosted.length)

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-bold text-gray-900'>{t('Featured Promotions')}</h2>
        <span className='text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded'>
          {t('Sponsored')}
        </span>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        {boosted.map((product: any) => (
          <Link
            key={product._id}
            href={`/product/${product.slug}`}
            className='group relative rounded-xl overflow-hidden
                       shadow-sm hover:shadow-md transition-shadow'
          >
            <div className='aspect-[3/2] relative'>
              <Image
                src={product.images?.[0]}
                alt={product.name}
                fill
                className='object-cover group-hover:scale-105 transition-transform duration-300'
              />
              <div className='absolute inset-0 bg-gradient-to-t
                              from-black/60 via-transparent to-transparent' />
              <p className='absolute bottom-2 left-2 right-2 text-white
                            text-xs font-semibold leading-tight line-clamp-2'>
                {product.name}
              </p>
            </div>
          </Link>
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <Link
            key={`empty-${i}`}
            href='/vendor/boost'
            className='group relative rounded-xl overflow-hidden border-2 border-dashed
                       border-gray-200 hover:border-[#006D6B] transition-colors
                       aspect-[3/2] flex flex-col items-center justify-center gap-1 text-center p-3'
          >
            <span className='text-xl'>📣</span>
            <p className='text-xs font-semibold text-gray-500 group-hover:text-[#006D6B]'>
              Advertise here
            </p>
            <p className='text-[10px] text-gray-400'>${BOOST_TIERS.spotlight.pricePerWeek}/week</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

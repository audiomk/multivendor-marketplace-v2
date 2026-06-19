import Image from 'next/image'
import Link from 'next/link'

export type AdSlot = {
  id:      number
  image:   string
  href:    string
  alt:     string
  label?:  string
}

// ← Edit these to update your ads anytime
const ADS: AdSlot[] = [
  {
    id:    1,
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=200&fit=crop',
    href:  '/search?category=smartphones',
    alt:   'Tech Deals',
    label: 'Mid-month Tech Upgrade — Save up to 50%',
  },
  {
    id:    2,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=200&fit=crop',
    href:  '/search?category=kitchen-accessories',
    alt:   'Kitchen Sale',
    label: 'Kitchen Essentials — Save up to 45%',
  },
  {
    id:    3,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=200&fit=crop',
    href:  '/search?category=beauty',
    alt:   'Beauty Deals',
    label: 'Beauty & Skincare — Shop Now',
  },
  {
    id:    4,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=200&fit=crop',
    href:  '/search?category=mens-watches',
    alt:   'Watches',
    label: 'New Arrivals — Watches & Accessories',
  },
]

export default function AdSlots() {
  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-bold text-gray-900'>Featured Promotions</h2>
        <span className='text-xs text-gray-400 border border-gray-200
                         px-2 py-0.5 rounded'>Sponsored</span>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        {ADS.map((ad) => (
          <Link
            key={ad.id}
            href={ad.href}
            className='group relative rounded-xl overflow-hidden
                       shadow-sm hover:shadow-md transition-shadow'
          >
            <div className='aspect-[3/2] relative'>
              <Image
                src={ad.image}
                alt={ad.alt}
                fill
                className='object-cover group-hover:scale-105 transition-transform duration-300'
              />
              <div className='absolute inset-0 bg-gradient-to-t
                              from-black/60 via-transparent to-transparent' />
              <p className='absolute bottom-2 left-2 right-2 text-white
                            text-xs font-semibold leading-tight'>
                {ad.label}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
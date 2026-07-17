import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import { HomeCarousel } from '@/components/shared/home/home-carousel'
import ProductSlider from '@/components/shared/product/product-slider'
import Image from 'next/image'
import Link from 'next/link'
import {
  getProductsForCard,
  getProductsByTag,
  getAllCategories,
} from '@/lib/actions/product.actions'
import { getSetting } from '@/lib/actions/setting.actions'
import AdSlots from '@/components/shared/home/ad-slots'
import PersonalisedSections from '@/components/shared/home/personalised-sections'
import { toSlug } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'

function getCategoryImage(slug: string): string {
  const map: Record<string, string> = {
    'smartphones':         'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop',
    'laptops':             'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop',
    'fragrances':          'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300&h=300&fit=crop',
    'skincare':            'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop',
    'groceries':           'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop',
    'home-decoration':     'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
    'furniture':           'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=300&fit=crop',
    'tops':                'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=300&h=300&fit=crop',
    'womens-dresses':      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&h=300&fit=crop',
    'womens-shoes':        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=300&fit=crop',
    'mens-shirts':         'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&h=300&fit=crop',
    'mens-shoes':          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
    'mens-watches':        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
    'womens-watches':      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=300&h=300&fit=crop',
    'womens-bags':         'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=300&fit=crop',
    'womens-jewellery':    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop',
    'sunglasses':          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop',
    'automotive':          'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&h=300&fit=crop',
    'beauty':              'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop',
    'kitchen-accessories': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop',
    'sports-accessories':  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&h=300&fit=crop',
    'tablets':             'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop',
    'shoes':               'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
  }
  return map[slug] ||
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&h=300&fit=crop'
}

export default async function HomePage() {
  const t               = await getTranslations('Home')
  const { carousels }   = await getSetting()
  const todaysDeals     = await getProductsByTag({ tag: 'todays-deal' })
  const bestSelling     = await getProductsByTag({ tag: 'best-seller' })
  const newArrivals     = await getProductsByTag({ tag: 'new-arrival', limit: 8 })
  const categories      = (await getAllCategories()).slice(0, 8)
  const featuredCards   = await getProductsForCard({ tag: 'featured' })
  const newArrivalCards = await getProductsForCard({ tag: 'new-arrival' })
  const bestSellerCards = await getProductsForCard({ tag: 'best-seller' })

  return (
    <div className='bg-[#F5F5F5] min-h-screen'>

      {/* Hero Carousel */}
      <HomeCarousel items={carousels} />

      {/* Category Strip */}
      <div className='bg-white border-b shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 py-3'>
          <div className='flex items-center gap-1 overflow-x-auto scrollbar-hide'>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/search?category=${cat}`}
                className='flex flex-col items-center gap-1 px-3 py-2 rounded-lg
                           hover:bg-[#F5F5F5] transition shrink-0 group'
              >
                <div className='w-12 h-12 rounded-full overflow-hidden border-2
                                border-transparent group-hover:border-[#006D6B]
                                transition'>
                  <Image
                    src={getCategoryImage(toSlug(cat))}
                    alt={cat}
                    width={48}
                    height={48}
                    className='object-cover w-full h-full'
                  />
                </div>
                <span className='text-xs font-medium text-gray-700
                                 whitespace-nowrap capitalize'>
                  {cat.replace(/-/g, ' ')}
                </span>
              </Link>
            ))}
            <Link
              href='/search'
              className='flex flex-col items-center gap-1 px-3 py-2
                         rounded-lg hover:bg-[#F5F5F5] transition shrink-0'
            >
              <div className='w-12 h-12 rounded-full bg-[#006D6B] flex
                              items-center justify-center'>
                <span className='text-white text-xl font-bold'>+</span>
              </div>
              <span className='text-xs font-medium text-[#006D6B] whitespace-nowrap'>
                All Depts
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 py-6 space-y-8'>

        {/* Promo Banners Row */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Link
            href='/search?tag=todays-deal'
            className='rounded-xl overflow-hidden relative h-36 flex items-center
                       px-6 group'
            style={{ background: 'linear-gradient(135deg, #006D6B, #004a48)' }}
          >
            <div className='z-10'>
              <p className='text-[#FABB02] text-xs font-bold uppercase tracking-wider'>
                {t('Limited Time')}
              </p>
              <p className='text-white text-xl font-extrabold mt-1'>
                {t("Today's Deals")}
              </p>
              <p className='text-gray-300 text-xs mt-1'>
                {t('Up to 70% off')}
              </p>
            </div>
            <span className='absolute right-4 text-5xl
                             group-hover:scale-110 transition-transform'>🔥</span>
          </Link>

          <Link
            href='/search?tag=new-arrival'
            className='rounded-xl overflow-hidden relative h-36 flex items-center
                       px-6 group'
            style={{ background: 'linear-gradient(135deg, #FABB02, #e6a800)' }}
          >
            <div className='z-10'>
              <p className='text-[#006D6B] text-xs font-bold uppercase tracking-wider'>
                {t('Just In')}
              </p>
              <p className='text-gray-900 text-xl font-extrabold mt-1'>
                {t('New Arrivals')}
              </p>
              <p className='text-gray-700 text-xs mt-1'>
                {t('Fresh stock daily')}
              </p>
            </div>
            <span className='absolute right-4 text-5xl
                             group-hover:scale-110 transition-transform'>✨</span>
          </Link>

          <Link
            href='/become-vendor'
            className='rounded-xl overflow-hidden relative h-36 flex items-center
                       px-6 group bg-gray-900'
          >
            <div className='z-10'>
              <p className='text-[#FABB02] text-xs font-bold uppercase tracking-wider'>
                {t('Grow Revenue')}
              </p>
              <p className='text-white text-xl font-extrabold mt-1'>
                {t('Start Selling Today')}
              </p>
              <p className='text-gray-400 text-xs mt-1'>
                {t('Free to get started')}
              </p>
            </div>
            <span className='absolute right-4 text-5xl
                             group-hover:scale-110 transition-transform'>🏪</span>
          </Link>
        </div>

        {/* Today's Deals */}
        <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
          <div className='flex items-center justify-between px-5 pt-5 pb-3
                          border-b border-gray-100'>
            <div className='flex items-center gap-3'>
              <div className='w-1 h-6 rounded-full bg-[#006D6B]' />
              <h2 className='text-xl font-bold text-gray-900'>
                {t("Today's Deals")}
              </h2>
              <span className='bg-[#FABB02] text-black text-xs font-bold
                               px-2 py-0.5 rounded-full'>
                HOT
              </span>
            </div>
            <Link
              href='/search?tag=todays-deal'
              className='text-[#006D6B] text-sm font-semibold
                         hover:underline flex items-center gap-1'
            >
              {t('See all deals')} →
            </Link>
          </div>
          <div className='p-4'>
            <ProductSlider products={todaysDeals} hideDetails={false} />
          </div>
        </div>

        {/* 4-card quick nav grid */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {[
            {
              title: t('Categories'),
              link: { text: t('Browse all'), href: '/search' },
              items: categories.slice(0, 4).map((cat) => ({
                name: cat,
                image: getCategoryImage(toSlug(cat)),
                href: `/search?category=${cat}`,
              })),
            },
            {
              title: t('New Arrivals'),
              link: { text: t('View all'), href: '/search?tag=new-arrival' },
              items: newArrivalCards,
            },
            {
              title: t('Best Sellers'),
              link: { text: t('View all'), href: '/search?tag=best-seller' },
              items: bestSellerCards,
            },
            {
              title: t('Featured'),
              link: { text: t('Shop now'), href: '/search?tag=featured' },
              items: featuredCards,
            },
          ].map((card) => (
            <div
              key={card.title}
              className='bg-white rounded-xl shadow-sm p-4 flex flex-col'
            >
              <h3 className='font-bold text-gray-900 mb-3 text-base'>
                {card.title}
              </h3>
              <div className='grid grid-cols-2 gap-2 flex-1'>
                {card.items.slice(0, 4).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className='flex flex-col items-center gap-1 group'
                  >
                    <div className='w-full aspect-square rounded-lg overflow-hidden
                                    bg-gray-50 border border-gray-100'>
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={120}
                        height={120}
                        className='w-full h-full object-cover
                                   group-hover:scale-105 transition-transform'
                      />
                    </div>
                    <p className='text-xs text-center text-gray-600
                                  line-clamp-1 w-full'>
                      {item.name}
                    </p>
                  </Link>
                ))}
              </div>
              <Link
                href={card.link.href}
                className='mt-3 text-sm text-[#006D6B] font-semibold hover:underline'
              >
                {card.link.text} →
              </Link>
            </div>
          ))}
        </div>

        {/* New Arrivals Slider */}
        <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
          <div className='flex items-center justify-between px-5 pt-5 pb-3
                          border-b border-gray-100'>
            <div className='flex items-center gap-3'>
              <div className='w-1 h-6 rounded-full bg-[#FABB02]' />
              <h2 className='text-xl font-bold text-gray-900'>
                {t('New Arrivals')}
              </h2>
            </div>
            <Link
              href='/search?tag=new-arrival'
              className='text-[#006D6B] text-sm font-semibold
                         hover:underline flex items-center gap-1'
            >
              {t('View all')} →
            </Link>
          </div>
          <div className='p-4'>
            <ProductSlider products={newArrivals} hideDetails={false} />
          </div>
        </div>

        {/* Best Sellers */}
        <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
          <div className='flex items-center justify-between px-5 pt-5 pb-3
                          border-b border-gray-100'>
            <div className='flex items-center gap-3'>
              <div className='w-1 h-6 rounded-full bg-[#006D6B]' />
              <h2 className='text-xl font-bold text-gray-900'>
                {t('Best Selling Products')}
              </h2>
            </div>
            <Link
              href='/search?tag=best-seller'
              className='text-[#006D6B] text-sm font-semibold
                         hover:underline flex items-center gap-1'
            >
              View all →
            </Link>
          </div>
          <div className='p-4'>
            <ProductSlider products={bestSelling} hideDetails />
          </div>
        </div>

        {/* Vendor CTA Banner */}
        <div
          className='rounded-xl p-8 text-center relative overflow-hidden'
          style={{ background: 'linear-gradient(135deg, #006D6B 0%, #004a48 100%)' }}
        >
          <div className='relative z-10'>
            <p className='text-[#FABB02] font-bold text-sm uppercase tracking-widest mb-2'>
              {t('Join Indaba Cart')}
            </p>
            <h2 className='text-white text-2xl md:text-3xl font-extrabold mb-2'>
              {t('Start Selling Today')}
            </h2>
            <p className='text-gray-300 text-sm mb-6 max-w-md mx-auto'>
              {t('Start Selling Tagline')}
            </p>
            <Link
              href='/become-vendor'
              className='inline-block bg-[#FABB02] text-black font-extrabold
                         px-8 py-3 rounded-lg hover:bg-[#e6a800] transition'
            >
              {t('Open Your Store')} →
            </Link>
          </div>
          <div className='absolute -bottom-8 -right-8 w-48 h-48
                          bg-white/5 rounded-full' />
          <div className='absolute -top-8 -left-8 w-32 h-32
                          bg-white/5 rounded-full' />
        </div>

        {/* Ad Slots */}
      <AdSlots />

      {/* Personalised Sections */}
      <PersonalisedSections />

      {/* Browsing History */}
      <BrowsingHistoryList />

      </div>
    </div>
  )
}
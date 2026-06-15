import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getVendorStore } from '@/lib/actions/vendor.actions'
import ProductCard from '@/components/shared/product/product-card'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Package, Store } from 'lucide-react'
import ProductSlider from '@/components/shared/product/product-slider'

type StorePageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  props: StorePageProps
): Promise<Metadata> {
  const params = await props.params
  const result = await getVendorStore(params.slug)
  if (!result.success) return { title: 'Store not found' }
  const { vendor } = result.data!
  return {
    title: vendor.vendorProfile.storeName,
    description: vendor.vendorProfile.bio,
  }
}

export default async function VendorStorePage(props: StorePageProps) {
  const params = await props.params
  const result = await getVendorStore(params.slug)

  if (!result.success) notFound()

  const { vendor, products } = result.data!
  const profile = vendor.vendorProfile

  const featuredProducts = products.slice(0, 10)
  const allProducts      = products

  return (
    <div>
      {/* Store Header */}
      <div className='bg-gradient-to-r from-slate-900 to-slate-700
                      text-white rounded-lg p-6 md:p-10 mb-6'>
        <div className='flex items-center gap-4'>
          {/* Store Avatar */}
          <div className='w-16 h-16 md:w-20 md:h-20 bg-yellow-400 rounded-full
                          flex items-center justify-center shrink-0'>
            {profile.logo ? (
              <img
                src={profile.logo}
                alt={profile.storeName}
                className='w-full h-full rounded-full object-cover'
              />
            ) : (
              <Store className='w-8 h-8 text-black' />
            )}
          </div>

          {/* Store Info */}
          <div className='flex-1'>
            <h1 className='text-2xl md:text-3xl font-bold'>
              {profile.storeName}
            </h1>
            {profile.bio && (
              <p className='text-gray-300 text-sm mt-1 max-w-xl'>
                {profile.bio}
              </p>
            )}
            <div className='flex items-center gap-4 mt-2 text-sm text-gray-400'>
              <span className='flex items-center gap-1'>
                <Package size={14} />
                {products.length} product{products.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-8'>
        {[
          { label: 'Total Products', value: products.length },
          { label: 'Categories',     value: [...new Set(products.map((p: any) => p.category))].length },
          { label: 'Avg Rating',     value: products.length > 0
              ? (products.reduce((s: number, p: any) => s + (p.avgRating || 0), 0) / products.length).toFixed(1)
              : 'N/A'
          },
          { label: 'Store Status',   value: '✓ Verified' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className='p-4 text-center'>
              <p className='text-2xl font-bold'>{stat.value}</p>
              <p className='text-sm text-muted-foreground'>{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Products Slider */}
      {featuredProducts.length > 0 && (
        <div className='mb-8'>
          <ProductSlider
            title={`Featured from ${profile.storeName}`}
            products={featuredProducts}
          />
        </div>
      )}

      <Separator className='my-8' />

      {/* All Products Grid */}
      <div>
        <h2 className='text-xl font-bold mb-4'>
          All Products ({allProducts.length})
        </h2>

        {allProducts.length === 0 ? (
          <div className='text-center py-20 text-muted-foreground'>
            <Store className='w-12 h-12 mx-auto mb-3 opacity-30' />
            <p>This store has no products yet.</p>
          </div>
        ) : (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {allProducts.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
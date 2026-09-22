import { Metadata } from 'next'
import { getMyWishlist } from '@/lib/actions/wishlist.actions'
import ProductCard from '@/components/shared/product/product-card'

export const metadata: Metadata = { title: 'Your Wishlist' }

export default async function WishlistPage() {
  const result = await getMyWishlist()
  const products = result.success ? result.data! : []

  return (
    <div>
      <h1 className='h1-bold py-4'>Your Wishlist</h1>

      {products.length === 0 ? (
        <div className='text-center py-20 text-muted-foreground'>
          <p className='text-lg font-medium mb-2'>Your wishlist is empty</p>
          <p className='text-sm'>Tap the heart on any product to save it here.</p>
        </div>
      ) : (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {products.map((product: any) => (
            <ProductCard key={product._id} product={product} initialInWishlist />
          ))}
        </div>
      )}
    </div>
  )
}

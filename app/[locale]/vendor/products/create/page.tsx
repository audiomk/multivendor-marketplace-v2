import { Metadata } from 'next'
import VendorProductForm from '../vendor-product-form'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Add Product' }

export default function VendorCreateProductPage() {
  return (
    <main className='max-w-4xl mx-auto p-4'>
      <div className='flex mb-4 text-sm'>
        <Link href='/vendor/products' className='text-muted-foreground hover:text-black'>
          My Products
        </Link>
        <span className='mx-1'>›</span>
        <span>Add Product</span>
      </div>
      <div className='my-8'>
        <VendorProductForm type='Create' />
      </div>
    </main>
  )
}
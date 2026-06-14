import { Metadata } from 'next'
import VendorProductForm from '../../vendor-product-form'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'

export const metadata: Metadata = { title: 'Edit Product' }

type EditProductProps = {
  params: Promise<{ id: string }>
}

export default async function VendorEditProductPage(props: EditProductProps) {
  const params = await props.params
  const { id } = params

  const session = await auth()
  const vendorId = (session?.user as any)?.id

  await connectToDatabase()

  // Only allow vendor to edit their own products
  const product = await Product.findOne({
    _id: id,
    vendorId,
  }).lean()

  if (!product) notFound()

  return (
    <main className='max-w-4xl mx-auto p-4'>
      <div className='flex mb-4 text-sm'>
        <Link
          href='/vendor/products'
          className='text-muted-foreground hover:text-black'
        >
          My Products
        </Link>
        <span className='mx-1'>›</span>
        <span>Edit Product</span>
      </div>
      <div className='my-8'>
        <VendorProductForm
          type='Update'
          product={JSON.parse(JSON.stringify(product))}
          productId={id}
        />
      </div>
    </main>
  )
}
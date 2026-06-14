import { Metadata } from 'next'
import { getVendorProducts } from '@/lib/actions/vendor.actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import DeleteVendorProduct from './delete-vendor-product'

export const metadata: Metadata = { title: 'My Products' }

export default async function VendorProductsPage() {
  const result = await getVendorProducts({})

  if (!result.success) {
    return <p className='text-red-500'>{result.message}</p>
  }

  const { products } = result.data!

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold'>My Products</h1>
        <Button asChild>
          <Link href='/vendor/products/create'>+ Add Product</Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className='text-center py-20 text-muted-foreground'>
          <p className='text-lg font-medium mb-2'>No products yet</p>
          <p className='text-sm mb-4'>Add your first product to start selling</p>
          <Button asChild>
            <Link href='/vendor/products/create'>Add Product</Link>
          </Button>
        </div>
      ) : (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p: any) => (
                <TableRow key={p._id}>
                  <TableCell className='font-medium'>{p.name}</TableCell>
                  <TableCell>{formatCurrency(p.price)}</TableCell>
                  <TableCell>{p.countInStock}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      p.isPublished
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {p.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell className='flex gap-2'>
                    <Button asChild size='sm' variant='outline'>
                      <Link href={`/vendor/products/${p._id}/edit`}>Edit</Link>
                    </Button>
                    <DeleteVendorProduct id={p._id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
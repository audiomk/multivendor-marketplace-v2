import { Metadata } from 'next'
import { getMyBoosts } from '@/lib/actions/boost.actions'
import { getVendorProducts } from '@/lib/actions/vendor.actions'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { BOOST_TIERS } from '@/lib/boost'
import BoostRequestForm from './boost-request-form'
import BoostPaymentForm from './boost-payment-form'

export const metadata: Metadata = { title: 'Boost Products' }

export default async function VendorBoostPage() {
  const [boostsResult, productsResult] = await Promise.all([
    getMyBoosts(),
    getVendorProducts({ limit: 100 }),
  ])

  const boosts = boostsResult.success ? boostsResult.data! : []
  const products = productsResult.success
    ? productsResult.data!.products.map((p: any) => ({ _id: p._id, name: p.name }))
    : []

  return (
    <div>
      <h1 className='text-2xl font-bold mb-2'>Boost Products</h1>
      <p className='text-sm text-muted-foreground mb-6'>
        Pay to get extra homepage visibility for a product. Request a boost below,
        pay via EcoCash/Paynow, then submit your reference &mdash; we&rsquo;ll confirm
        and activate it.
      </p>

      <BoostRequestForm products={products} />

      <Card>
        <CardHeader>
          <CardTitle>Your Boosts</CardTitle>
        </CardHeader>
        <CardContent>
          {boosts.length === 0 ? (
            <p className='text-sm text-muted-foreground'>No boosts yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boosts.map((b: any) => {
                  const isExpired = b.expiresAt && new Date(b.expiresAt) < new Date()
                  return (
                    <TableRow key={b._id}>
                      <TableCell className='text-sm'>{b.productId?.name || 'Deleted product'}</TableCell>
                      <TableCell className='text-sm'>{BOOST_TIERS[b.tier as keyof typeof BOOST_TIERS]?.label}</TableCell>
                      <TableCell className='text-sm'>{b.durationDays} days</TableCell>
                      <TableCell className='text-sm'>${b.price.toFixed(2)}</TableCell>
                      <TableCell>
                        {b.paymentStatus === 'paid' && !isExpired && (
                          <span className='text-xs px-2 py-1 rounded-full bg-green-100 text-green-700'>Active</span>
                        )}
                        {b.paymentStatus === 'paid' && isExpired && (
                          <span className='text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600'>Expired</span>
                        )}
                        {b.paymentStatus === 'cancelled' && (
                          <span className='text-xs px-2 py-1 rounded-full bg-red-100 text-red-700'>Cancelled</span>
                        )}
                        {b.paymentStatus === 'pending' && b.paymentReference && (
                          <span className='text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700'>Awaiting confirmation</span>
                        )}
                        {b.paymentStatus === 'pending' && !b.paymentReference && (
                          <span className='text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600'>Awaiting payment</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {b.paymentStatus === 'pending' && !b.paymentReference && (
                          <BoostPaymentForm boostId={b._id} />
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

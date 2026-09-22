import { Metadata } from 'next'
import { auth } from '@/auth'
import { getAllBoosts, getActiveSpotlightCount } from '@/lib/actions/boost.actions'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { BOOST_TIERS } from '@/lib/boost'
import { ConfirmBoostButton, RevokeBoostButton } from './boost-admin-actions'

export const metadata: Metadata = { title: 'Boosts' }

export default async function AdminBoostsPage() {
  const session = await auth()
  const role = session?.user?.role
  if (role !== 'Admin' && role !== 'admin') {
    throw new Error('Admin permission required')
  }

  const [result, spotlightCount] = await Promise.all([
    getAllBoosts(),
    getActiveSpotlightCount(),
  ])
  if (!result.success) return <p className='text-red-500'>{result.message}</p>

  const boosts = result.data!
  const pending = boosts.filter((b: any) => b.paymentStatus === 'pending' && b.paymentReference)
  const revenue = boosts
    .filter((b: any) => b.paymentStatus === 'paid')
    .reduce((s: number, b: any) => s + b.price, 0)

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Boosts</h1>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-2xl font-bold text-yellow-600'>{pending.length}</p>
            <p className='text-sm text-muted-foreground'>Awaiting confirmation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-2xl font-bold text-green-600'>${revenue.toFixed(2)}</p>
            <p className='text-sm text-muted-foreground'>Boost revenue (all time)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-2xl font-bold'>
              {spotlightCount}/{BOOST_TIERS.spotlight.maxSlots}
            </p>
            <p className='text-sm text-muted-foreground'>Spotlight slots used</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-2xl font-bold'>{boosts.length}</p>
            <p className='text-sm text-muted-foreground'>Total requests</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Boost Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Reference</TableHead>
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
                    <TableCell>
                      <p className='text-sm font-medium'>{b.vendorId?.vendorProfile?.storeName || b.vendorId?.name}</p>
                      <p className='text-xs text-muted-foreground'>{b.vendorId?.email}</p>
                    </TableCell>
                    <TableCell className='text-sm'>{BOOST_TIERS[b.tier as keyof typeof BOOST_TIERS]?.label}</TableCell>
                    <TableCell className='text-sm'>${b.price.toFixed(2)}</TableCell>
                    <TableCell className='text-xs font-mono'>{b.paymentReference || '—'}</TableCell>
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
                      {b.paymentStatus === 'pending' && (
                        <span className='text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700'>
                          {b.paymentReference ? 'Awaiting confirmation' : 'Awaiting payment'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {b.paymentStatus === 'pending' && b.paymentReference && (
                        <ConfirmBoostButton boostId={b._id} />
                      )}
                      {b.paymentStatus === 'paid' && !isExpired && (
                        <RevokeBoostButton boostId={b._id} />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

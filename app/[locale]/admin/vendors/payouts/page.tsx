import { Metadata } from 'next'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import User from '@/lib/db/models/user.model'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { MarkPaidForm, RevertPaidButton } from './payout-actions'

export const metadata: Metadata = { title: 'Vendor Payouts' }

export default async function AdminPayoutsPage() {
  const session = await auth()
  const role = session?.user?.role
  if (role !== 'Admin' && role !== 'admin') {
    throw new Error('Admin permission required')
  }

  await connectToDatabase()

  const orders = await Order.find({
    isPaid: true,
    'vendorOrders.0': { $exists: true },
  }).lean() as any[]

  // Build payout records
  const payouts: any[] = []
  for (const order of orders) {
    for (const vo of order.vendorOrders || []) {
      if (!vo.vendorId) continue
      const vendor = await User.findById(vo.vendorId)
        .select('name vendorProfile')
        .lean() as any
      payouts.push({
        orderId:          order._id.toString(),
        vendorId:         vo.vendorId.toString(),
        date:             order.paidAt || order.createdAt,
        vendorName:       vendor?.name || 'Unknown',
        storeName:        vendor?.vendorProfile?.storeName || 'Unknown Store',
        subtotal:         vo.subtotal || 0,
        commission:       vo.commission || 0,
        vendorPayout:     vo.vendorPayout || 0,
        payoutStatus:     vo.payoutStatus || 'unpaid',
        payoutMethod:     vo.payoutMethod || '',
        payoutReference:  vo.payoutReference || vo.stripeTransferId || '',
        payoutPaidAt:     vo.payoutPaidAt || null,
        fulfillmentStatus: vo.status || 'pending',
      })
    }
  }

  payouts.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const totalCommission = payouts.reduce((s, p) => s + p.commission, 0)
  const totalPayouts    = payouts.reduce((s, p) => s + p.vendorPayout, 0)
  const totalUnpaid     = payouts
    .filter((p) => p.payoutStatus !== 'paid')
    .reduce((s, p) => s + p.vendorPayout, 0)

  return (
    <div>
      <h1 className='text-2xl font-bold mb-2'>Vendor Payout History</h1>
      <p className='text-sm text-muted-foreground mb-6'>
        Stripe Connect does not support Zimbabwe-based recipients, so almost every
        payout here needs to be sent manually (EcoCash, bank transfer) and marked
        paid below — a blank &quot;Payout&quot; column is money you still owe a vendor.
      </p>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-2xl font-bold'>{payouts.length}</p>
            <p className='text-sm text-muted-foreground'>Total Payouts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-2xl font-bold text-green-600'>
              {formatCurrency(totalPayouts)}
            </p>
            <p className='text-sm text-muted-foreground'>Owed to Vendors (all time)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className={`text-2xl font-bold ${totalUnpaid > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(totalUnpaid)}
            </p>
            <p className='text-sm text-muted-foreground'>Still Unpaid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-2xl font-bold text-purple-600'>
              {formatCurrency(totalCommission)}
            </p>
            <p className='text-sm text-muted-foreground'>Commission Earned</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Payout</TableHead>
                <TableHead>Payout Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((p, i) => (
                <TableRow key={i}>
                  <TableCell className='font-mono text-xs'>
                    #{p.orderId.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell className='text-xs'>
                    {new Date(p.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <p className='font-medium text-sm'>{p.storeName}</p>
                    <p className='text-xs text-muted-foreground'>{p.vendorName}</p>
                  </TableCell>
                  <TableCell>{formatCurrency(p.subtotal)}</TableCell>
                  <TableCell className='text-red-500'>
                    -{formatCurrency(p.commission)}
                  </TableCell>
                  <TableCell className='font-bold text-green-600'>
                    {formatCurrency(p.vendorPayout)}
                  </TableCell>
                  <TableCell>
                    {p.payoutStatus === 'paid' ? (
                      <div className='space-y-1'>
                        <span className='text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 inline-block'>
                          Paid{p.payoutMethod ? ` — ${p.payoutMethod}` : ''}
                        </span>
                        {p.payoutReference && (
                          <p className='text-[11px] font-mono text-muted-foreground truncate max-w-[160px]'>
                            {p.payoutReference}
                          </p>
                        )}
                        {p.payoutPaidAt && (
                          <p className='text-[11px] text-muted-foreground'>
                            {new Date(p.payoutPaidAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className='text-xs px-2 py-1 rounded-full bg-red-100 text-red-700'>
                        Unpaid
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {p.payoutStatus === 'paid' ? (
                      <RevertPaidButton orderId={p.orderId} vendorId={p.vendorId} />
                    ) : (
                      <MarkPaidForm orderId={p.orderId} vendorId={p.vendorId} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

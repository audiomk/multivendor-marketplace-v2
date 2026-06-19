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
        orderId:         order._id.toString(),
        date:            order.paidAt || order.createdAt,
        vendorName:      vendor?.name || 'Unknown',
        storeName:       vendor?.vendorProfile?.storeName || 'Unknown Store',
        stripeAccountId: vendor?.vendorProfile?.stripeAccountId || '',
        subtotal:        vo.subtotal || 0,
        commission:      vo.commission || 0,
        vendorPayout:    vo.vendorPayout || 0,
        stripeTransferId: vo.stripeTransferId || '',
        status:          vo.status || 'pending',
      })
    }
  }

  payouts.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const totalCommission = payouts.reduce((s, p) => s + p.commission, 0)
  const totalPayouts    = payouts.reduce((s, p) => s + p.vendorPayout, 0)

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Vendor Payout History</h1>

      <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-6'>
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
            <p className='text-sm text-muted-foreground'>Paid to Vendors</p>
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
                <TableHead>Stripe Transfer</TableHead>
                <TableHead>Status</TableHead>
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
                  <TableCell className='text-xs font-mono'>
                    {p.stripeTransferId
                      ? p.stripeTransferId.slice(0, 20) + '...'
                      : <span className='text-muted-foreground'>Manual</span>
                    }
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      p.status === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {p.status}
                    </span>
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
import { Metadata } from 'next'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

export const metadata: Metadata = { title: 'My Earnings' }

export default async function VendorEarningsPage() {
  const session  = await auth()
  const vendorId = (session?.user as any)?.id

  await connectToDatabase()

  const orders = await Order.find({
    'vendorOrders.vendorId': vendorId,
    isPaid: true,
  }).lean() as any[]

  let totalEarnings   = 0
  let totalCommission = 0
  let totalOrders     = 0
  const recentPayouts = []

  for (const order of orders) {
    const vo = order.vendorOrders?.find(
      (v: any) => v.vendorId?.toString() === vendorId
    )
    if (!vo) continue

    totalEarnings   += vo.vendorPayout  || 0
    totalCommission += vo.commission    || 0
    totalOrders++

    recentPayouts.push({
      orderId:    order._id.toString(),
      date:       order.paidAt || order.createdAt,
      subtotal:   vo.subtotal,
      commission: vo.commission,
      payout:     vo.vendorPayout,
      status:     vo.status,
    })
  }

  recentPayouts.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const stats = [
    { label: 'Total Earnings',   value: formatCurrency(totalEarnings) },
    { label: 'Total Orders',     value: totalOrders },
    { label: 'Commission Paid',  value: formatCurrency(totalCommission) },
    { label: 'Avg Order Value',  value: totalOrders > 0
        ? formatCurrency(totalEarnings / totalOrders)
        : formatCurrency(0)
    },
  ]

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>My Earnings</h1>

      {/* Stats */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardContent className='p-4 text-center'>
              <p className='text-2xl font-bold'>{stat.value}</p>
              <p className='text-sm text-muted-foreground'>{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPayouts.length === 0 ? (
            <p className='text-center py-10 text-muted-foreground'>
              No payouts yet. Payouts appear here after orders are paid.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Your Payout</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayouts.map(payout => (
                  <TableRow key={payout.orderId}>
                    <TableCell className='font-mono text-xs'>
                      #{payout.orderId.slice(-6).toUpperCase()}
                    </TableCell>
                    <TableCell className='text-sm'>
                      {new Date(payout.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(payout.subtotal)}
                    </TableCell>
                    <TableCell className='text-red-500'>
                      -{formatCurrency(payout.commission)}
                    </TableCell>
                    <TableCell className='font-bold text-green-600'>
                      {formatCurrency(payout.payout)}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        payout.status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : payout.status === 'shipped'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {payout.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
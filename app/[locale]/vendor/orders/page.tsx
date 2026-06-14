import { Metadata } from 'next'
import { getVendorOrders } from '@/lib/actions/vendor.actions'
import { auth } from '@/auth'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import OrderStatusSelect from './order-status-select'

export const metadata: Metadata = { title: 'My Orders' }

export default async function VendorOrdersPage() {
  const session = await auth()
  const vendorId = (session?.user as any)?.id
  const result = await getVendorOrders({})

  if (!result.success) {
    return <p className='text-red-500'>{result.message}</p>
  }

  const { orders } = result.data!

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>My Orders</h1>

      {orders.length === 0 ? (
        <p className='text-center py-20 text-muted-foreground'>
          No orders yet.
        </p>
      ) : (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Payout</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: any) => {
                const vendorOrder = order.vendorOrders?.find(
                  (vo: any) => vo.vendorId?.toString() === vendorId
                )
                return (
                  <TableRow key={order._id}>
                    <TableCell className='font-mono text-xs'>
                      #{order._id.slice(-6).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <p className='font-medium'>{order.user?.name}</p>
                      <p className='text-xs text-muted-foreground'>
                        {order.user?.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      {vendorOrder?.items?.length || order.items?.length} items
                    </TableCell>
                    <TableCell>
                      {formatCurrency(vendorOrder?.vendorPayout || 0)}
                    </TableCell>
                    <TableCell className='text-xs'>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <OrderStatusSelect
                        orderId={order._id}
                        vendorId={vendorId}
                        currentStatus={vendorOrder?.status || 'pending'}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
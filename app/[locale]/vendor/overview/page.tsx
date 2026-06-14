import { Metadata } from 'next'
import { auth } from '@/auth'
import { getVendorStats } from '@/lib/actions/vendor.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingBag, DollarSign, Clock } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Vendor Dashboard' }

export default async function VendorOverviewPage() {
  const session = await auth()
  const result = await getVendorStats()

  if (!result.success) {
    return <p className='text-red-500'>{result.message}</p>
  }

  const { productCount, totalRevenue, totalOrders, pendingOrders } = result.data!

  const cards = [
    {
      title: 'Active Products',
      value: productCount,
      icon: Package,
      href: '/vendor/products',
      color: 'text-blue-500',
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingBag,
      href: '/vendor/orders',
      color: 'text-green-500',
    },
    {
      title: 'Pending Orders',
      value: pendingOrders,
      icon: Clock,
      href: '/vendor/orders',
      color: 'text-yellow-500',
    },
    {
      title: 'Total Earnings',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      href: '/vendor/earnings',
      color: 'text-purple-500',
    },
  ]

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>
        Welcome back, {session?.user?.name}
      </h1>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className='hover:shadow-md transition-shadow cursor-pointer'>
              <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  {card.title}
                </CardTitle>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <p className='text-2xl font-bold'>{card.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <Link href='/vendor/products/create'
              className='block w-full text-center bg-black text-white
                         py-2 rounded-lg hover:bg-gray-800 transition'>
              + Add New Product
            </Link>
            <Link href='/vendor/orders'
              className='block w-full text-center border border-black
                         py-2 rounded-lg hover:bg-gray-50 transition'>
              View Orders
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-2 mb-2'>
              <div className='w-3 h-3 bg-green-500 rounded-full' />
              <span className='text-sm'>Store is live</span>
            </div>
            <p className='text-sm text-muted-foreground'>
              Your store is approved and accepting orders.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
import { auth } from '@/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Home } from 'lucide-react'

export const metadata = { title: 'Your Addresses' }

export default async function AddressesPage() {
  const session = await auth()
  const address = (session?.user as any)?.address

  return (
    <div className='max-w-2xl mx-auto py-8 px-4'>
      <h1 className='text-2xl font-bold mb-6'>Your Addresses</h1>

      {address ? (
        <Card>
          <CardHeader className='flex flex-row items-center gap-3 pb-2'>
            <Home size={20} className='text-[#006D6B]' />
            <CardTitle className='text-base'>Default Address</CardTitle>
          </CardHeader>
          <CardContent className='space-y-1 text-sm'>
            <p className='font-medium'>{address.fullName}</p>
            <p>{address.street}</p>
            <p>{address.city}, {address.province} {address.postalCode}</p>
            <p>{address.country}</p>
            <p>{address.phone}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className='py-10 text-center'>
            <Home size={40} className='mx-auto mb-3 text-gray-300' />
            <p className='text-muted-foreground mb-4'>
              No saved addresses yet. Your address will be saved when you place your first order.
            </p>
            <Button asChild style={{ background: '#006D6B' }}>
              <Link href='/search'>Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className='mt-4'>
        <Link
          href='/account'
          className='text-sm text-[#006D6B] hover:underline'
        >
          ← Back to Account
        </Link>
      </div>
    </div>
  )
}
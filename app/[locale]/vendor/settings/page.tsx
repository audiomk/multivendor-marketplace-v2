import { Metadata } from 'next'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StripeConnectButton from './stripe-connect-button'

export const metadata: Metadata = { title: 'Vendor Settings' }

export default async function VendorSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ stripe?: string }>
}) {
  const params      = await searchParams
  const session     = await auth()
  const vendorId    = (session?.user as any)?.id

  await connectToDatabase()
  const user = await User.findById(vendorId).lean() as any
  const profile = user?.vendorProfile

  const stripeConnected = !!profile?.stripeAccountId

  return (
    <div className='max-w-2xl'>
      <h1 className='text-2xl font-bold mb-6'>Vendor Settings</h1>

      {params.stripe === 'success' && (
        <div className='bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6'>
          ✓ Stripe account connected successfully!
        </div>
      )}

      {/* Store Info */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Store Name</span>
            <span className='font-medium'>{profile?.storeName}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Store URL</span>
            <span className='font-medium'>/store/{profile?.storeSlug}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Commission Rate</span>
            <span className='font-medium'>{profile?.commission}%</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Status</span>
            <span className={`font-medium ${
              profile?.isApproved ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {profile?.isApproved ? '✓ Approved' : '⏳ Pending'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stripe Connect */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Account</CardTitle>
        </CardHeader>
        <CardContent>
          {stripeConnected ? (
            <div className='flex items-center gap-3'>
              <div className='w-3 h-3 bg-green-500 rounded-full' />
              <div>
                <p className='font-medium'>Stripe Connected</p>
                <p className='text-sm text-muted-foreground'>
                  You will receive payouts automatically after each sale.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className='text-sm text-muted-foreground mb-4'>
                Connect your Stripe account to receive automatic payouts
                when customers purchase your products.
              </p>
              <StripeConnectButton />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
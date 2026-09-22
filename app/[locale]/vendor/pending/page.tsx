import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import RefreshButton from './refresh-button'

// Vendors are approved to sell instantly on signup, so the only way to land
// here is if an admin has suspended the account.
export default function VendorPendingPage() {
  return (
    <div className='max-w-lg mx-auto py-20 px-4'>
      <Card className='text-center'>
        <CardHeader>
          <div className='text-5xl mb-2'>🚫</div>
          <CardTitle>Store Temporarily Unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground mb-6'>
            Your vendor account has been suspended. If you believe this is a
            mistake, please contact support.
          </p>
          <div className='flex gap-2 justify-center'>
            <RefreshButton />
            <Button asChild variant='outline'>
              <Link href='/'>Back to Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
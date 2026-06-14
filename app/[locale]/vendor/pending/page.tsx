import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function VendorPendingPage() {
  return (
    <div className='max-w-lg mx-auto py-20 px-4'>
      <Card className='text-center'>
        <CardHeader>
          <div className='text-5xl mb-2'>⏳</div>
          <CardTitle>Application Under Review</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground mb-6'>
            Our team is reviewing your vendor application.
            You will receive access to your dashboard once approved.
          </p>
          <Button asChild variant='outline'>
            <Link href='/'>Back to Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
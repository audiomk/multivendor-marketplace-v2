import { Metadata } from 'next'
import Link from 'next/link'
import { getMyDisputes } from '@/lib/actions/dispute.actions'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Your Reports' }

const STATUS_STYLE: Record<string, string> = {
  open: 'bg-yellow-100 text-yellow-700',
  under_review: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default async function MyDisputesPage() {
  const result = await getMyDisputes()
  const disputes = result.success ? result.data! : []

  return (
    <div>
      <h1 className='h1-bold py-4'>Your Reports</h1>

      {disputes.length === 0 ? (
        <p className='text-sm text-muted-foreground'>
          No reports filed. You can report a problem from any paid order&apos;s page.
        </p>
      ) : (
        <div className='space-y-3'>
          {disputes.map((d: any) => (
            <Card key={d._id}>
              <CardContent className='p-4 space-y-1'>
                <div className='flex items-center justify-between'>
                  <p className='font-medium text-sm'>
                    {d.vendorId?.vendorProfile?.storeName || d.vendorId?.name || 'Vendor'}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[d.status]}`}>
                    {d.status.replace('_', ' ')}
                  </span>
                </div>
                <p className='text-sm'>{d.reason}</p>
                <p className='text-xs text-muted-foreground'>{d.details}</p>
                {d.resolution && (
                  <p className='text-xs bg-gray-50 border rounded p-2 mt-2'>
                    <span className='font-medium'>Response: </span>{d.resolution}
                  </p>
                )}
                <Link
                  href={`/account/orders/${d.orderId?._id}`}
                  className='text-xs text-[#006D6B] hover:underline inline-block mt-1'
                >
                  View order &rarr;
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

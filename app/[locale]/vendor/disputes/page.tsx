import { Metadata } from 'next'
import { getVendorDisputes } from '@/lib/actions/dispute.actions'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Disputes' }

const STATUS_STYLE: Record<string, string> = {
  open: 'bg-yellow-100 text-yellow-700',
  under_review: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default async function VendorDisputesPage() {
  const result = await getVendorDisputes()
  const disputes = result.success ? result.data! : []

  return (
    <div>
      <h1 className='text-2xl font-bold mb-2'>Disputes</h1>
      <p className='text-sm text-muted-foreground mb-6'>
        Reports buyers have filed about orders from your store. Our team reviews
        and resolves these &mdash; reach out to the buyer directly if you can sort it out faster.
      </p>

      {disputes.length === 0 ? (
        <p className='text-sm text-muted-foreground'>No disputes filed against your store.</p>
      ) : (
        <div className='space-y-3'>
          {disputes.map((d: any) => (
            <Card key={d._id}>
              <CardContent className='p-4 space-y-1'>
                <div className='flex items-center justify-between'>
                  <p className='font-medium text-sm'>Order #{d.orderId?._id?.slice(-6).toUpperCase()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[d.status]}`}>
                    {d.status.replace('_', ' ')}
                  </span>
                </div>
                <p className='text-sm'>{d.reason}</p>
                <p className='text-xs text-muted-foreground'>{d.details}</p>
                {d.resolution && (
                  <p className='text-xs bg-gray-50 border rounded p-2 mt-2'>
                    <span className='font-medium'>Resolution: </span>{d.resolution}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

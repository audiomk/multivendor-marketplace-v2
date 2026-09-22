import { Metadata } from 'next'
import { auth } from '@/auth'
import { getAllDisputes } from '@/lib/actions/dispute.actions'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import DisputeActions from './dispute-actions'

export const metadata: Metadata = { title: 'Disputes' }

const STATUS_STYLE: Record<string, string> = {
  open: 'bg-yellow-100 text-yellow-700',
  under_review: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default async function AdminDisputesPage() {
  const session = await auth()
  const role = session?.user?.role
  if (role !== 'Admin' && role !== 'admin') {
    throw new Error('Admin permission required')
  }

  const result = await getAllDisputes()
  if (!result.success) return <p className='text-red-500'>{result.message}</p>
  const disputes = result.data!
  const openCount = disputes.filter((d: any) => d.status === 'open').length

  return (
    <div>
      <h1 className='text-2xl font-bold mb-6'>Disputes</h1>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-2xl font-bold text-yellow-600'>{openCount}</p>
            <p className='text-sm text-muted-foreground'>Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-2xl font-bold'>{disputes.length}</p>
            <p className='text-sm text-muted-foreground'>Total</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {disputes.length === 0 && (
            <p className='text-sm text-muted-foreground'>No disputes filed yet.</p>
          )}
          {disputes.map((d: any) => (
            <div key={d._id} className='border rounded-lg p-4 flex items-start justify-between gap-4'>
              <div className='space-y-1 flex-1'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[d.status]}`}>
                    {d.status.replace('_', ' ')}
                  </span>
                  <p className='text-sm font-medium'>
                    Order #{d.orderId?._id?.slice(-6).toUpperCase()}
                  </p>
                </div>
                <p className='text-xs text-muted-foreground'>
                  Buyer: {d.buyerId?.name} ({d.buyerId?.email}) &middot; Vendor: {d.vendorId?.vendorProfile?.storeName || d.vendorId?.name}
                </p>
                <p className='text-sm'>{d.reason}</p>
                <p className='text-xs text-muted-foreground'>{d.details}</p>
                {d.resolution && (
                  <p className='text-xs bg-gray-50 border rounded p-2 mt-2'>
                    <span className='font-medium'>Resolution: </span>{d.resolution}
                  </p>
                )}
              </div>
              <DisputeActions disputeId={d._id} status={d.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

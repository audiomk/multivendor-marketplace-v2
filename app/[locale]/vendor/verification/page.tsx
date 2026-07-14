import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import VendorVerificationForm from './vendor-verification-form'

export const metadata = { title: 'Vendor Verification' }

export default async function VendorVerificationPage() {
  const session = await auth()
  const userId  = (session?.user as any)?.id

  await connectToDatabase()
  const user = await User.findById(userId)
    .select('verification')
    .lean() as any

  const verification = user?.verification || {}

  return (
    <div className='max-w-3xl mx-auto space-y-6 py-6'>
      <div>
        <h1 className='text-2xl font-bold' style={{ color: '#006D6B' }}>
          Store Verification
        </h1>
        <p className='text-muted-foreground text-sm mt-1'>
          Complete all three steps to get a verified badge on your store.
        </p>
      </div>

      {/* Progress bar */}
      <div className='flex gap-2'>
        {['ID Document', 'Tax Clearance', 'Face Verification'].map((step, i) => {
          const statuses = [
            verification.idStatus,
            verification.taxStatus,
            verification.selfieStatus,
          ]
          const status = statuses[i] || 'none'
          return (
            <div key={step} className='flex-1'>
              <div className={`h-2 rounded-full ${
                status === 'approved' ? 'bg-green-500' :
                status === 'pending'  ? 'bg-yellow-400' :
                status === 'rejected' ? 'bg-red-400' :
                'bg-gray-200'
              }`} />
              <p className='text-xs mt-1 text-center text-muted-foreground'>
                {step}
              </p>
              <p className={`text-xs text-center font-medium ${
                status === 'approved' ? 'text-green-600' :
                status === 'pending'  ? 'text-yellow-600' :
                status === 'rejected' ? 'text-red-600' :
                'text-gray-400'
              }`}>
                {status === 'none' ? 'Not submitted' : status}
              </p>
            </div>
          )
        })}
      </div>

      <VendorVerificationForm verification={verification} />
    </div>
  )
}
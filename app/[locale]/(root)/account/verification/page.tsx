import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/db/models/user.model'
import BuyerVerificationForm from './buyer-verification-form'

export const metadata = { title: 'Account Verification' }

export default async function BuyerVerificationPage() {
  const session = await auth()
  const userId  = (session?.user as any)?.id
  await connectToDatabase()
  const user = await User.findById(userId).select('verification').lean() as any
  const verification = user?.verification || {}

  return (
    <div className='max-w-lg mx-auto py-8 px-4'>
      <h1 className='text-2xl font-bold mb-2' style={{ color: '#006D6B' }}>
        Account Verification
      </h1>
      <p className='text-muted-foreground text-sm mb-6'>
        Verify your identity to unlock higher purchase limits and trusted buyer status.
      </p>
      <BuyerVerificationForm verification={verification} />
    </div>
  )
}
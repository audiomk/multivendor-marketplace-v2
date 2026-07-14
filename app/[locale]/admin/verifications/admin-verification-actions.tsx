'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { adminReviewVerification } from '@/lib/actions/verification.actions'
import Image from 'next/image'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

export default function AdminVerificationActions({
  userId,
  verification,
}: {
  userId:       string
  verification: any
}) {
  const { toast }   = useToast()
  const [loading,   setLoading]   = useState(false)
  const [rejectMsg, setRejectMsg] = useState('')

  const handle = async (
    type:   'id' | 'tax' | 'selfie',
    status: 'approved' | 'rejected'
  ) => {
    setLoading(true)
    const res = await adminReviewVerification({
      userId, type, status,
      rejectReason: status === 'rejected' ? rejectMsg : '',
    })
    toast({ description: res.message, variant: res.success ? 'default' : 'destructive' })
    setLoading(false)
    if (res.success) window.location.reload()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>Review</Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Review Verification Documents</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* ID Documents */}
          <div className='space-y-2'>
            <h3 className='font-semibold'>ID Document</h3>
            <div className='grid grid-cols-2 gap-3'>
              {verification?.idFrontUrl && (
                <div>
                  <p className='text-xs text-muted-foreground mb-1'>Front</p>
                  <Image
                    src={verification.idFrontUrl}
                    alt='ID Front'
                    width={200} height={130}
                    className='rounded border object-cover w-full'
                  />
                </div>
              )}
              {verification?.idBackUrl && (
                <div>
                  <p className='text-xs text-muted-foreground mb-1'>Back</p>
                  <Image
                    src={verification.idBackUrl}
                    alt='ID Back'
                    width={200} height={130}
                    className='rounded border object-cover w-full'
                  />
                </div>
              )}
            </div>
            {verification?.idStatus === 'pending' && (
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  className='bg-green-600 hover:bg-green-700'
                  disabled={loading}
                  onClick={() => handle('id', 'approved')}
                >
                  Approve ID
                </Button>
                <Button
                  size='sm'
                  variant='destructive'
                  disabled={loading}
                  onClick={() => handle('id', 'rejected')}
                >
                  Reject ID
                </Button>
              </div>
            )}
          </div>

          {/* Tax Document */}
          <div className='space-y-2'>
            <h3 className='font-semibold'>Tax Clearance</h3>
            {verification?.taxDocUrl && (
              <div>
                <a
                  href={verification.taxDocUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 text-sm hover:underline'
                >
                  View Tax Document →
                </a>
                {verification.taxExpiryDate && (
                  <p className='text-xs text-muted-foreground mt-1'>
                    Expires: {new Date(verification.taxExpiryDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
            {verification?.taxStatus === 'pending' && (
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  className='bg-green-600 hover:bg-green-700'
                  disabled={loading}
                  onClick={() => handle('tax', 'approved')}
                >
                  Approve Tax
                </Button>
                <Button
                  size='sm'
                  variant='destructive'
                  disabled={loading}
                  onClick={() => handle('tax', 'rejected')}
                >
                  Reject Tax
                </Button>
              </div>
            )}
          </div>

          {/* Selfie */}
          <div className='space-y-2'>
            <h3 className='font-semibold'>Face Verification</h3>
            {verification?.selfieUrl && (
              <Image
                src={verification.selfieUrl}
                alt='Selfie'
                width={150} height={150}
                className='rounded-lg border object-cover'
              />
            )}
            {verification?.selfieStatus === 'pending' && (
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  className='bg-green-600 hover:bg-green-700'
                  disabled={loading}
                  onClick={() => handle('selfie', 'approved')}
                >
                  Approve Selfie
                </Button>
                <Button
                  size='sm'
                  variant='destructive'
                  disabled={loading}
                  onClick={() => handle('selfie', 'rejected')}
                >
                  Reject Selfie
                </Button>
              </div>
            )}
          </div>

          {/* Reject reason */}
          <div className='space-y-1'>
            <p className='text-xs text-muted-foreground'>
              Rejection reason (optional):
            </p>
            <input
              type='text'
              value={rejectMsg}
              onChange={e => setRejectMsg(e.target.value)}
              placeholder='e.g. Image too blurry, ID expired...'
              className='w-full border rounded px-3 py-2 text-sm outline-none
                         focus:ring-2 focus:ring-[#006D6B]'
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
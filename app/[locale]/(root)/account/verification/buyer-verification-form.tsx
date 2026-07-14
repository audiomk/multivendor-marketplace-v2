'use client'
import { useState } from 'react'
import { UploadButton } from '@/lib/uploadthing'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { submitBuyerIdVerification } from '@/lib/actions/verification.actions'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

export default function BuyerVerificationForm({
  verification,
}: {
  verification: any
}) {
  const { toast }   = useToast()
  const [idUrl,     setIdUrl]     = useState('')
  const [loading,   setLoading]   = useState(false)

  const status = verification.idStatus || 'none'

  const handleSubmit = async () => {
    if (!idUrl) {
      toast({ description: 'Please upload your ID', variant: 'destructive' })
      return
    }
    setLoading(true)
    const res = await submitBuyerIdVerification({ idFrontUrl: idUrl })
    toast({ description: res.message, variant: res.success ? 'default' : 'destructive' })
    setLoading(false)
    if (res.success) window.location.reload()
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>ID Verification</CardTitle>
        {status === 'approved' && (
          <span className='flex items-center gap-1 text-green-600 text-sm font-medium'>
            <CheckCircle size={14} /> Verified
          </span>
        )}
        {status === 'pending' && (
          <span className='flex items-center gap-1 text-yellow-600 text-sm font-medium'>
            <Clock size={14} /> Under Review
          </span>
        )}
        {status === 'rejected' && (
          <span className='flex items-center gap-1 text-red-600 text-sm font-medium'>
            <XCircle size={14} /> Rejected
          </span>
        )}
      </CardHeader>
      <CardContent className='space-y-4'>
        {status === 'approved' ? (
          <div className='text-center py-6'>
            <CheckCircle size={48} className='text-green-500 mx-auto mb-3' />
            <p className='font-semibold text-green-700'>Your account is verified!</p>
            <p className='text-sm text-muted-foreground mt-1'>
              You have full access to all buyer features.
            </p>
          </div>
        ) : (
          <>
            {status === 'rejected' && (
              <p className='text-red-600 text-sm bg-red-50 p-3 rounded'>
                Rejected: {verification.idRejectReason || 'Please resubmit a clearer photo'}
              </p>
            )}
            <p className='text-sm text-muted-foreground'>
              Upload a clear photo of your National ID, Passport, or Driver's License.
            </p>
            {(idUrl || verification.idFrontUrl) && (
              <Image
                src={idUrl || verification.idFrontUrl}
                alt='ID'
                width={200} height={130}
                className='rounded border object-cover'
              />
            )}
            <UploadButton
              endpoint='idDocumentUploader'
              onClientUploadComplete={res => setIdUrl(res[0].url)}
              onUploadError={(_error) => {
              toast({ description: 'Upload failed', variant: 'destructive' })
            }}
            />
            <Button
              onClick={handleSubmit}
              disabled={loading || status === 'pending'}
              style={{ background: '#006D6B' }}
              className='w-full'
            >
              {loading ? 'Submitting...' :
               status === 'pending' ? 'Under Review — No Action Needed' :
               'Submit ID for Verification'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
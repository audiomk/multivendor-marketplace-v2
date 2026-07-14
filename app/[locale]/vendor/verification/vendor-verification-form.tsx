'use client'
import { useState, useRef } from 'react'
import { UploadButton } from '@/lib/uploadthing'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import {
  submitIdVerification,
  submitTaxVerification,
  submitSelfieVerification,
} from '@/lib/actions/verification.actions'
import { CheckCircle, Clock, XCircle, Camera } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved') return (
    <span className='flex items-center gap-1 text-green-600 text-sm font-medium'>
      <CheckCircle size={14} /> Approved
    </span>
  )
  if (status === 'pending') return (
    <span className='flex items-center gap-1 text-yellow-600 text-sm font-medium'>
      <Clock size={14} /> Under Review
    </span>
  )
  if (status === 'rejected') return (
    <span className='flex items-center gap-1 text-red-600 text-sm font-medium'>
      <XCircle size={14} /> Rejected
    </span>
  )
  return <span className='text-gray-400 text-sm'>Not submitted</span>
}

export default function VendorVerificationForm({
  verification,
}: {
  verification: any
}) {
  const { toast } = useToast()
  const videoRef   = useRef<HTMLVideoElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const [stream,   setStream]   = useState<MediaStream | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string>('')
  const [selfieUrl,     setSelfieUrl]     = useState<string>('')
  const [taxExpiry,     setTaxExpiry]     = useState<string>('')
  const [taxDocUrl,     setTaxDocUrl]     = useState<string>('')
  const [idFrontUrl,    setIdFrontUrl]    = useState<string>('')
  const [idBackUrl,     setIdBackUrl]     = useState<string>('')
  const [loadingId,     setLoadingId]     = useState(false)
  const [loadingTax,    setLoadingTax]    = useState(false)
  const [loadingSelfie, setLoadingSelfie] = useState(false)
  const [cameraOpen,    setCameraOpen]    = useState(false)

  // --- Camera ---
  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(s)
      setCameraOpen(true)
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = s
      }, 100)
    } catch {
      toast({ description: 'Camera access denied', variant: 'destructive' })
    }
  }

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    setCameraOpen(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas  = canvasRef.current
    const video   = videoRef.current
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg')
    setSelfiePreview(dataUrl)
    stopCamera()
  }

  // --- Submit handlers ---
  const handleIdSubmit = async () => {
    if (!idFrontUrl || !idBackUrl) {
      toast({ description: 'Upload both front and back of ID', variant: 'destructive' })
      return
    }
    setLoadingId(true)
    const res = await submitIdVerification({ idFrontUrl, idBackUrl })
    toast({ description: res.message, variant: res.success ? 'default' : 'destructive' })
    setLoadingId(false)
    if (res.success) window.location.reload()
  }

  const handleTaxSubmit = async () => {
    if (!taxDocUrl || !taxExpiry) {
      toast({ description: 'Upload document and set expiry date', variant: 'destructive' })
      return
    }
    setLoadingTax(true)
    const res = await submitTaxVerification({ taxDocUrl, taxExpiryDate: taxExpiry })
    toast({ description: res.message, variant: res.success ? 'default' : 'destructive' })
    setLoadingTax(false)
    if (res.success) window.location.reload()
  }

  const handleSelfieSubmit = async () => {
    if (!selfieUrl && !selfiePreview) {
      toast({ description: 'Please take or upload a selfie', variant: 'destructive' })
      return
    }
    setLoadingSelfie(true)

    // If it's a captured photo (dataUrl), we need to upload it
    if (selfiePreview && !selfieUrl) {
      toast({ description: 'Please upload your selfie using the upload button', variant: 'destructive' })
      setLoadingSelfie(false)
      return
    }

    const res = await submitSelfieVerification({ selfieUrl })
    toast({ description: res.message, variant: res.success ? 'default' : 'destructive' })
    setLoadingSelfie(false)
    if (res.success) window.location.reload()
  }

  return (
    <div className='space-y-6'>

      {/* Step 1 — ID Document */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-base'>Step 1 — ID Document</CardTitle>
          <StatusBadge status={verification.idStatus || 'none'} />
        </CardHeader>
        <CardContent className='space-y-4'>
          {verification.idStatus === 'rejected' && (
            <p className='text-red-600 text-sm bg-red-50 p-3 rounded'>
              Rejected: {verification.idRejectReason || 'Please resubmit'}
            </p>
          )}
          {verification.idStatus === 'approved' ? (
            <p className='text-green-600 text-sm'>
              Your ID has been verified ✓
            </p>
          ) : (
            <>
              <p className='text-sm text-muted-foreground'>
                Upload a clear photo of your National ID, Passport, or Driver&apos;s License.
              </p>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-xs font-medium mb-2'>Front of ID</p>
                  {(idFrontUrl || verification.idFrontUrl) && (
                    <Image
                      src={idFrontUrl || verification.idFrontUrl}
                      alt='ID Front'
                      width={160} height={100}
                      className='rounded border object-cover mb-2'
                    />
                  )}
                  <UploadButton
                    endpoint='idDocumentUploader'
                    onClientUploadComplete={res => setIdFrontUrl(res[0].url)}
                    onUploadError={(_error) => { 
                      toast({ description: 'Upload failed', variant: 'destructive' })
                    }}
                  />
                </div>
                <div>
                  <p className='text-xs font-medium mb-2'>Back of ID</p>
                  {(idBackUrl || verification.idBackUrl) && (
                    <Image
                      src={idBackUrl || verification.idBackUrl}
                      alt='ID Back'
                      width={160} height={100}
                      className='rounded border object-cover mb-2'
                    />
                  )}
                  <UploadButton
                    endpoint='idDocumentUploader'
                    onClientUploadComplete={res => setIdBackUrl(res[0].url)}
                    onUploadError={(_error) => { 
                      toast({ description: 'Upload failed', variant: 'destructive' })
                    }}
                  />
                </div>
              </div>
              <Button
                onClick={handleIdSubmit}
                disabled={loadingId || verification.idStatus === 'pending'}
                style={{ background: '#006D6B' }}
                className='w-full'
              >
                {loadingId ? 'Submitting...' :
                 verification.idStatus === 'pending' ? 'Awaiting Review' :
                 'Submit ID for Verification'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Step 2 — Tax Clearance */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-base'>Step 2 — Tax Clearance</CardTitle>
          <StatusBadge status={verification.taxStatus || 'none'} />
        </CardHeader>
        <CardContent className='space-y-4'>
          {verification.taxStatus === 'rejected' && (
            <p className='text-red-600 text-sm bg-red-50 p-3 rounded'>
              Rejected: {verification.taxRejectReason || 'Please resubmit'}
            </p>
          )}
          {verification.taxStatus === 'approved' ? (
            <div className='text-green-600 text-sm'>
              <p>Tax clearance verified ✓</p>
              {verification.taxExpiryDate && (
                <p className='text-xs text-gray-500 mt-1'>
                  Expires: {new Date(verification.taxExpiryDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <>
              <p className='text-sm text-muted-foreground'>
                Upload your ZIMRA tax clearance certificate and set the expiry date.
              </p>
              <div className='space-y-3'>
                <div>
                  <p className='text-xs font-medium mb-2'>Tax Clearance Document</p>
                  {(taxDocUrl || verification.taxDocUrl) && (
                    <p className='text-xs text-green-600 mb-2'>
                      ✓ Document uploaded
                    </p>
                  )}
                  <UploadButton
                    endpoint='taxDocumentUploader'
                    onClientUploadComplete={res => setTaxDocUrl(res[0].url)}
                    onUploadError={(_error) => { 
                      toast({ description: 'Upload failed', variant: 'destructive' })
                    }}
                  />
                </div>
                <div>
                  <p className='text-xs font-medium mb-2'>Certificate Expiry Date</p>
                  <Input
                    type='date'
                    value={taxExpiry}
                    onChange={e => setTaxExpiry(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <Button
                onClick={handleTaxSubmit}
                disabled={loadingTax || verification.taxStatus === 'pending'}
                style={{ background: '#006D6B' }}
                className='w-full'
              >
                {loadingTax ? 'Submitting...' :
                 verification.taxStatus === 'pending' ? 'Awaiting Review' :
                 'Submit Tax Document'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Step 3 — Face Verification */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-base'>Step 3 — Face Verification (KYC)</CardTitle>
          <StatusBadge status={verification.selfieStatus || 'none'} />
        </CardHeader>
        <CardContent className='space-y-4'>
          {verification.selfieStatus === 'rejected' && (
            <p className='text-red-600 text-sm bg-red-50 p-3 rounded'>
              Rejected: {verification.selfieRejectReason || 'Please resubmit'}
            </p>
          )}
          {verification.selfieStatus === 'approved' ? (
            <p className='text-green-600 text-sm'>Face verified ✓</p>
          ) : (
            <>
              <p className='text-sm text-muted-foreground'>
                Take a clear selfie or upload a photo. Our team will compare it
                to your ID document.
              </p>

              {/* Camera */}
              {cameraOpen && (
                <div className='space-y-2'>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className='w-full rounded-lg border'
                  />
                  <canvas ref={canvasRef} className='hidden' />
                  <div className='flex gap-2'>
                    <Button onClick={capturePhoto} className='flex-1'
                      style={{ background: '#006D6B' }}>
                      <Camera size={16} className='mr-2' /> Capture Photo
                    </Button>
                    <Button onClick={stopCamera} variant='outline' className='flex-1'>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Preview captured photo */}
              {selfiePreview && !cameraOpen && (
                <div className='space-y-2'>
                  <Image
                    src={selfiePreview}
                    alt='Selfie preview'
                    width={200} height={200}
                    className='rounded-lg border mx-auto object-cover'
                  />
                  <p className='text-xs text-center text-muted-foreground'>
                    Photo captured — now upload it below
                  </p>
                </div>
              )}

              {/* Uploaded selfie preview */}
              {selfieUrl && (
                <Image
                  src={selfieUrl}
                  alt='Selfie'
                  width={200} height={200}
                  className='rounded-lg border mx-auto object-cover'
                />
              )}

              <div className='flex gap-2'>
                {!cameraOpen && (
                  <Button
                    onClick={startCamera}
                    variant='outline'
                    className='flex-1'
                  >
                    <Camera size={16} className='mr-2' /> Use Camera
                  </Button>
                )}
                <div className='flex-1'>
                  <UploadButton
                    endpoint='selfieUploader'
                    onClientUploadComplete={res => {
                      setSelfieUrl(res[0].url)
                      setSelfiePreview('')
                    }}
                    onUploadError={(_error) => { 
                      toast({ description: 'Upload failed', variant: 'destructive' })
                    }}
                  />
                </div>
              </div>

              <Button
                onClick={handleSelfieSubmit}
                disabled={
                  loadingSelfie ||
                  verification.selfieStatus === 'pending' ||
                  (!selfieUrl && !selfiePreview)
                }
                style={{ background: '#006D6B' }}
                className='w-full'
              >
                {loadingSelfie ? 'Submitting...' :
                 verification.selfieStatus === 'pending' ? 'Awaiting Review' :
                 'Submit for Face Verification'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
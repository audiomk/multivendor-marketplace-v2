'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export default function PaynowForm({ orderId }: { orderId: string }) {
  const [method,  setMethod]  = useState<'web' | 'ecocash' | 'onemoney'>('web')
  const [phone,   setPhone]   = useState('')
  const [loading, setLoading] = useState(false)
  const [instructions, setInstructions] = useState('')
  const { toast }  = useToast()
  const router     = useRouter()

  const handlePay = async () => {
    if ((method === 'ecocash' || method === 'onemoney') && !phone) {
      toast({ description: 'Please enter your phone number', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res  = await fetch('/api/paynow/initiate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderId, phone, method }),
      })
      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || 'Payment failed')
      }

      if (method === 'web' && data.redirectUrl) {
        // Redirect to Paynow website
        window.location.href = data.redirectUrl
      } else if (data.instructions) {
        // Mobile — show USSD instructions
        setInstructions(data.instructions)
        toast({ description: 'Check your phone for the payment prompt!' })
      }
    } catch (err: any) {
      toast({ description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (instructions) {
    return (
      <div className='space-y-3'>
        <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
          <p className='font-semibold text-green-800 mb-2'>
            📱 Payment Instructions
          </p>
          <p className='text-sm text-green-700 whitespace-pre-line'>
            {instructions}
          </p>
        </div>
        <Button
          variant='outline'
          className='w-full'
          onClick={() => router.push(`/account/orders/${orderId}`)}
        >
          I Have Paid — View Order
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Payment method selector */}
      <div className='grid grid-cols-3 gap-2'>
        {[
          { value: 'web',      label: '🌐 Web', desc: 'Card / ZimSwitch' },
          { value: 'ecocash',  label: '📱 EcoCash', desc: 'Econet' },
          { value: 'onemoney', label: '📱 OneMoney', desc: 'NetOne' },
        ].map(opt => (
          <button
            key={opt.value}
            type='button'
            onClick={() => setMethod(opt.value as any)}
            className={`p-2 rounded-lg border text-xs text-center transition ${
              method === opt.value
                ? 'border-[#006D6B] bg-[#006D6B]/10 text-[#006D6B] font-semibold'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div>{opt.label}</div>
            <div className='text-gray-500'>{opt.desc}</div>
          </button>
        ))}
      </div>

      {/* Phone number for mobile methods */}
      {(method === 'ecocash' || method === 'onemoney') && (
        <div className='space-y-1'>
          <label className='text-sm font-medium'>
            {method === 'ecocash' ? 'EcoCash' : 'OneMoney'} Number
          </label>
          <Input
            type='tel'
            placeholder='07XXXXXXXX'
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <p className='text-xs text-muted-foreground'>
            You will receive a payment prompt on this number
          </p>
        </div>
      )}

      {/* Pay button */}
      <Button
        onClick={handlePay}
        disabled={loading}
        className='w-full'
        style={{ background: '#006D6B' }}
      >
        {loading
          ? 'Processing...'
          : method === 'web'
          ? 'Pay with Paynow →'
          : `Send ${method === 'ecocash' ? 'EcoCash' : 'OneMoney'} Prompt`
        }
      </Button>

      <p className='text-xs text-center text-muted-foreground'>
        Secured by Paynow Zimbabwe
      </p>
    </div>
  )
}
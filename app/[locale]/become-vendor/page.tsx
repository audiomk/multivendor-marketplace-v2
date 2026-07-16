'use client'
import { useState } from 'react'
import { applyToBeVendor } from '@/lib/actions/vendor.actions'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card'

export default function BecomeVendorPage() {
  const { update } = useSession()
  const [form, setForm] = useState({ storeName: '', storeSlug: '', bio: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    const result = await applyToBeVendor(form)
    if (!result.success) {
      setError(result.message || 'Something went wrong')
      setLoading(false)
      return
    }
    await update()
    window.location.href = '/vendor/pending'
  }

  return (
    <div className='max-w-lg mx-auto py-12 px-4'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl' style={{ color: '#006D6B' }}>
            Become a Vendor
          </CardTitle>
          <CardDescription>
            Set up your store and start selling to thousands of customers
            across Zimbabwe and beyond.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {error && (
            <p className='bg-red-50 text-red-600 px-4 py-2 rounded text-sm'>
              {error}
            </p>
          )}
          <div className='space-y-1'>
            <Label>Store Name</Label>
            <Input
              value={form.storeName}
              onChange={e => setForm({ ...form, storeName: e.target.value })}
              placeholder="Bob's Electronics"
            />
          </div>
          <div className='space-y-1'>
            <Label>Store URL</Label>
            <div className='flex items-center border rounded-md overflow-hidden'>
              <span className='bg-muted px-3 py-2 text-sm text-muted-foreground'>
                /store/
              </span>
              <Input
                className='border-0 rounded-none'
                value={form.storeSlug}
                onChange={e => setForm({
                  ...form,
                  storeSlug: e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '')
                })}
                placeholder='bobs-electronics'
              />
            </div>
          </div>
          <div className='space-y-1'>
            <Label>Store Bio</Label>
            <textarea
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder='Tell customers about your store...'
              rows={3}
              className='w-full border rounded-md px-3 py-2 text-sm
                         outline-none focus:ring-2 focus:ring-[#006D6B]
                         resize-none'
            />
          </div>
          <Button
            className='w-full'
            style={{ background: '#006D6B' }}
            onClick={handleSubmit}
            disabled={loading || !form.storeName || !form.storeSlug}
          >
            {loading ? 'Submitting...' : 'Apply to Sell on Indaba Cart'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
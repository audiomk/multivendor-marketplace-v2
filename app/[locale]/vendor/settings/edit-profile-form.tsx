'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export default function EditProfileForm({
  current,
}: {
  current: {
    storeName: string
    storeSlug: string
    bio:       string
    logo:      string
  }
}) {
  const [form,    setForm]    = useState(current)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router    = useRouter()

  const handle = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/vendor/profile', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      toast({ description: 'Store profile updated!' })
      router.refresh()
    } catch (err: any) {
      toast({ description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-1'>
        <Label>Store Name</Label>
        <Input
          value={form.storeName}
          onChange={e => setForm({ ...form, storeName: e.target.value })}
          placeholder="Your Store Name"
        />
      </div>

      <div className='space-y-1'>
        <Label>Store URL Slug</Label>
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
            placeholder='your-store-name'
          />
        </div>
      </div>

      <div className='space-y-1'>
        <Label>Store Bio</Label>
        <textarea
          value={form.bio}
          onChange={e => setForm({ ...form, bio: e.target.value })}
          rows={3}
          className='w-full border rounded-md px-3 py-2 text-sm outline-none
                     focus:ring-2 focus:ring-[#006D6B] resize-none'
          placeholder='Tell customers about your store...'
        />
      </div>

      <div className='space-y-1'>
        <Label>Logo URL</Label>
        <Input
          value={form.logo}
          onChange={e => setForm({ ...form, logo: e.target.value })}
          placeholder='https://example.com/your-logo.png'
        />
        <p className='text-xs text-muted-foreground'>
          Paste a direct image URL for your store logo
        </p>
      </div>

      <Button
        onClick={handle}
        disabled={loading}
        className='w-full'
        style={{ background: '#006D6B' }}
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  )
}
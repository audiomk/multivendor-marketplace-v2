'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export default function RefreshButton() {
  const { data: session, update } = useSession()
  const router  = useRouter()
  const [checking, setChecking] = useState(false)

  // Auto-check every 60 seconds only
  useEffect(() => {
    const interval = setInterval(async () => {
      const updated = await update()
      if ((updated?.user as any)?.vendorProfile?.isApproved) {
        router.push('/vendor/overview')
      }
    }, 60000) // 60 seconds not 30
    return () => clearInterval(interval)
  }, [update, router])

  const handleRefresh = async () => {
    setChecking(true)
    const updated = await update()
    if ((updated?.user as any)?.vendorProfile?.isApproved) {
      router.push('/vendor/overview')
    } else {
      setChecking(false)
    }
  }

  return (
    <Button onClick={handleRefresh} variant='outline' disabled={checking}>
      {checking ? 'Checking...' : 'Check Approval Status'}
    </Button>
  )
}
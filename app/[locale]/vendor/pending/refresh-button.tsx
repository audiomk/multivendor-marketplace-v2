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
      // update() with no argument is a plain read and never refreshes the
      // token; passing an object is what makes the server re-read the DB.
      const updated = await update({ refresh: true })
      if ((updated?.user as any)?.vendorProfile?.isApproved) {
        router.push('/vendor/overview')
      }
    }, 60000) // 60 seconds not 30
    return () => clearInterval(interval)
  }, [update, router])

  const handleRefresh = async () => {
    setChecking(true)
    const updated = await update({ refresh: true })
    if ((updated?.user as any)?.vendorProfile?.isApproved) {
      router.push('/vendor/overview')
    } else {
      setChecking(false)
    }
  }

  return (
    <Button onClick={handleRefresh} disabled={checking}>
      {checking ? 'Checking...' : 'Check Status'}
    </Button>
  )
}
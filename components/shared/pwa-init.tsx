'use client'
import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'

export default function PwaInit() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Service worker registration failed:', err)
      })
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!installPrompt || dismissed) return null

  const handleInstall = async () => {
    installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  return (
    <div className='fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50
                    bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex items-center gap-3'>
      <div className='w-10 h-10 rounded-lg bg-[#006D6B] flex items-center justify-center shrink-0'>
        <Download className='w-5 h-5 text-[#FABB02]' />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-semibold'>Install Indaba Cart</p>
        <p className='text-xs text-muted-foreground'>Faster access, right from your home screen.</p>
      </div>
      <button
        onClick={handleInstall}
        className='shrink-0 bg-[#006D6B] text-white text-xs font-bold px-3 py-2 rounded-lg'
      >
        Install
      </button>
      <button
        onClick={() => setDismissed(true)}
        aria-label='Dismiss'
        className='shrink-0 text-gray-400 hover:text-gray-600'
      >
        <X className='w-4 h-4' />
      </button>
    </div>
  )
}

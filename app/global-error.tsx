'use client'
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error)
    } else {
      console.error(error)
    }
  }, [error])

  return (
    <html>
      <body style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24,
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p style={{ color: '#666', marginBottom: 24 }}>
            We hit an unexpected error. Try again, or head back to the homepage.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => reset()}
              style={{
                background: '#006D6B', color: 'white', padding: '10px 20px',
                borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600,
              }}
            >
              Try again
            </button>
            {/* Plain <a>, not next/link: this replaces the entire app shell
                during a root-level crash, so it can't depend on router
                context that may itself be part of what broke. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href='/'
              style={{
                background: '#F5F5F5', color: '#111', padding: '10px 20px',
                borderRadius: 8, textDecoration: 'none', fontWeight: 600,
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}

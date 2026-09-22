'use client'
import * as Sentry from '@sentry/nextjs'

// Runs once when this module is first imported (module-level code only
// executes once, even under Strict Mode's double-render). Manual init
// rather than the instrumentation-client.ts convention because that
// requires Next.js 15.3+ and this project is on 15.1.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalWithSentry = globalThis as any

if (process.env.NEXT_PUBLIC_SENTRY_DSN && !globalWithSentry.__sentryClientInitialized) {
  globalWithSentry.__sentryClientInitialized = true
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
  })
}

export default function SentryClientInit() {
  return null
}

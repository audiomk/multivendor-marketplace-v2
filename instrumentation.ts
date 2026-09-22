// Server + Edge error tracking — inert until SENTRY_DSN is set. Sign up at
// sentry.io, create a Next.js project, and drop the DSN it gives you into
// SENTRY_DSN. No other setup needed; this doesn't wrap next.config.ts with
// the build-time Sentry plugin (source map upload, release tracking) to
// keep the build simple — revisit that once error tracking proves useful.
export async function register() {
  if (!process.env.SENTRY_DSN) return

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Sentry = await import('@sentry/nextjs')
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
    })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const Sentry = await import('@sentry/nextjs')
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
    })
  }
}

// In-memory rate limiter — fine for a single-instance deployment. If this
// app ever runs on multiple serverless instances (e.g. Vercel functions
// that don't share memory), each instance gets its own bucket, so the
// effective limit is (limit * instance count) rather than a hard global
// cap. Good enough to stop casual abuse/scripted spam; for a hard
// guarantee at scale, swap this for a shared store (Redis, Upstash, etc).

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Opportunistic cleanup so this Map doesn't grow unbounded in a
// long-running process.
let lastSweep = Date.now()
function sweepExpired() {
  const now = Date.now()
  if (now - lastSweep < 60_000) return
  lastSweep = now
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key)
  }
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds?: number } {
  sweepExpired()
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true }
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count++
  return { allowed: true }
}

// Best-effort client IP from common proxy headers — Vercel/most reverse
// proxies set x-forwarded-for; falls back to a constant so at least a
// same-process limit still applies if no proxy header is present.
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

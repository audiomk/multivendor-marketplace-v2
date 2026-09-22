import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { checkRateLimit } from './rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests up to the limit, then blocks', () => {
    const key = 'test-key-1'
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, 5, 60_000).allowed).toBe(true)
    }
    const blocked = checkRateLimit(key, 5, 60_000)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('tracks separate keys independently', () => {
    expect(checkRateLimit('test-key-2a', 1, 60_000).allowed).toBe(true)
    expect(checkRateLimit('test-key-2a', 1, 60_000).allowed).toBe(false)
    // A different key isn't affected by the first key's usage
    expect(checkRateLimit('test-key-2b', 1, 60_000).allowed).toBe(true)
  })

  it('resets once the time window has passed', () => {
    const key = 'test-key-3'
    expect(checkRateLimit(key, 1, 60_000).allowed).toBe(true)
    expect(checkRateLimit(key, 1, 60_000).allowed).toBe(false)

    vi.advanceTimersByTime(60_001)

    expect(checkRateLimit(key, 1, 60_000).allowed).toBe(true)
  })
})

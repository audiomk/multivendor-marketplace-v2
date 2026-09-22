import { describe, it, expect } from 'vitest'
import { formatWhatsAppNumber, buildWhatsAppLink } from './whatsapp'

describe('formatWhatsAppNumber', () => {
  it('converts a local 0-prefixed number to international format', () => {
    expect(formatWhatsAppNumber('0771234567')).toBe('263771234567')
  })

  it('adds the country code to a 9-digit number with no prefix', () => {
    expect(formatWhatsAppNumber('771234567')).toBe('263771234567')
  })

  it('leaves an already-international number unchanged', () => {
    expect(formatWhatsAppNumber('263771234567')).toBe('263771234567')
  })

  it('strips non-digit formatting before normalizing', () => {
    expect(formatWhatsAppNumber('+263 77 123 4567')).toBe('263771234567')
    expect(formatWhatsAppNumber('077-123-4567')).toBe('263771234567')
  })
})

describe('buildWhatsAppLink', () => {
  it('produces a wa.me link with the number normalized and the message URL-encoded', () => {
    const link = buildWhatsAppLink('0771234567', 'Hello there & welcome!')
    expect(link).toBe('https://wa.me/263771234567?text=Hello%20there%20%26%20welcome!')
  })
})

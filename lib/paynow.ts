import { Paynow } from 'paynow'

/**
 * Instantiates and configures a Paynow client instance with default or environment URLs.
 */
export function createPaynowInstance() {
  const paynow = new Paynow(
    process.env.PAYNOW_INTEGRATION_ID || 'test-id',
    process.env.PAYNOW_INTEGRATION_KEY || 'test-key'
  )

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  paynow.resultUrl = `${baseUrl}/api/paynow/result`
  paynow.returnUrl = `${baseUrl}/api/paynow/return`

  return paynow
}

/**
 * Formats Zimbabwean phone numbers into Paynow-compatible format: 263XXXXXXXXX
 */
export function formatPaynowPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('263')) return digits
  if (digits.startsWith('0')) return '263' + digits.slice(1)
  if (digits.length === 9) return '263' + digits
  return digits
}
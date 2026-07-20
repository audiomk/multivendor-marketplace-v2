import { Paynow } from 'paynow'

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
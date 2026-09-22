// EcoCash Open API (C2B instant payments) — SCAFFOLD, not yet wired to real
// credentials.
//
// This is separate from the manual "buyer submits a reference, admin
// confirms" flow already in app/api/orders/ecocash-confirm/route.ts — that
// flow keeps working with zero setup and zero fees, and stays as the
// fallback when this direct API isn't configured. This file automates it:
// EcoCash pushes a PIN prompt straight to the buyer's phone and confirms
// payment via webhook instead of a human checking a reference number.
//
// Signing up requires a merchant account from EcoCash and approval to be an
// "Online Merchant" (developers.ecocash.co.zw) — there's a sandbox, but
// production needs their review. The field names below follow the publicly
// documented shape of EcoCash's Open API C2B SDKs (customerMsisdn, amount,
// reason, sourceReference, clientName) but the exact base URL, header name
// for the API key, and webhook payload MUST be verified against the actual
// developer portal once you have sandbox access — none of this has been
// tested against a live endpoint.
//
// Required env vars once you have credentials:
//   ECOCASH_API_KEY        — from the EcoCash developer portal
//   ECOCASH_MERCHANT_CODE  — your assigned merchant code
//   ECOCASH_ENV            — "live" once approved for production; anything else uses sandbox
//   ECOCASH_WEBHOOK_SECRET — shared secret to validate the payment webhook (see app/api/ecocash/webhook)

const BASE_URL =
  process.env.ECOCASH_ENV === 'live'
    ? 'https://api.ecocash.co.zw/api/v2/payment/instant/c2b/live'
    : 'https://api.ecocash.co.zw/api/v2/payment/instant/c2b/sandbox'

export function isEcoCashDirectConfigured() {
  return Boolean(process.env.ECOCASH_API_KEY && process.env.ECOCASH_MERCHANT_CODE)
}

export interface EcoCashChargeResult {
  status: string
  ecocashTransactionReference?: string
  [key: string]: unknown
}

// Pushes a PIN prompt to the customer's phone. The actual payment
// confirmation arrives later via webhook — this call only confirms the
// prompt was sent, not that the customer paid.
export async function requestEcoCashPayment({
  msisdn,
  amount,
  reference,
  reason,
}: {
  msisdn: string
  amount: number
  reference: string
  reason: string
}): Promise<EcoCashChargeResult> {
  if (!isEcoCashDirectConfigured()) {
    throw new Error(
      'EcoCash direct API is not configured — set ECOCASH_API_KEY and ECOCASH_MERCHANT_CODE'
    )
  }

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': process.env.ECOCASH_API_KEY!,
    },
    body: JSON.stringify({
      customerMsisdn: msisdn,
      amount,
      currency: 'USD',
      reason,
      sourceReference: reference,
      clientName: process.env.NEXT_PUBLIC_ECOCASH_NAME || 'Indaba Cart',
      merchantCode: process.env.ECOCASH_MERCHANT_CODE,
    }),
  })

  if (!res.ok) throw new Error(`EcoCash request failed: ${res.status}`)
  return res.json()
}

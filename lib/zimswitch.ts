// Zimswitch Online — SCAFFOLD, not yet wired to real credentials.
//
// Zimswitch has no public self-serve signup: you apply through your bank
// for merchant sign-on first, and their integration guide points to the
// OPPWA gateway (oppwa.com) — the same "Copy & Pay" platform used by many
// bank-issued gateways across the region. This file follows OPPWA's
// publicly documented request/response shape as closely as possible, but
// exact field names, payment brand codes, and result-code ranges MUST be
// verified against the real integration guide once your bank/Zimswitch
// grants sandbox access — nothing here has been tested against a live
// endpoint.
//
// Required env vars once you have credentials:
//   ZIMSWITCH_ENTITY_ID     — merchant "channel" id from the OPPWA dashboard
//   ZIMSWITCH_ACCESS_TOKEN  — bearer token from the OPPWA dashboard
//   ZIMSWITCH_ENV           — "live" once ready; anything else uses the test host

const OPPWA_BASE_URL =
  process.env.ZIMSWITCH_ENV === 'live'
    ? 'https://oppwa.com'
    : 'https://eu-test.oppwa.com'

export function isZimswitchConfigured() {
  return Boolean(process.env.ZIMSWITCH_ENTITY_ID && process.env.ZIMSWITCH_ACCESS_TOKEN)
}

export interface ZimswitchCheckoutResult {
  id: string
  result: { code: string; description: string }
}

// Step 1 — server creates a "checkout" and hands the checkoutId to the
// client-side widget (paymentWidgets.js) that collects card details.
// VERIFY: paymentType, field names, and content-type against the real docs.
export async function createZimswitchCheckout({
  amount,
  currency = 'USD',
  reference,
}: {
  amount: number
  currency?: string
  reference: string
}): Promise<ZimswitchCheckoutResult> {
  if (!isZimswitchConfigured()) {
    throw new Error(
      'Zimswitch is not configured — set ZIMSWITCH_ENTITY_ID and ZIMSWITCH_ACCESS_TOKEN'
    )
  }

  const body = new URLSearchParams({
    entityId: process.env.ZIMSWITCH_ENTITY_ID!,
    amount: amount.toFixed(2),
    currency,
    paymentType: 'DB', // debit/purchase — VERIFY against docs
    merchantTransactionId: reference,
  })

  const res = await fetch(`${OPPWA_BASE_URL}/v1/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.ZIMSWITCH_ACCESS_TOKEN}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })
  if (!res.ok) throw new Error(`Zimswitch checkout creation failed: ${res.status}`)
  return res.json()
}

// Step 2 — after the widget redirects back with a resourcePath, the server
// verifies the final payment status directly with OPPWA. Never trust the
// client-side redirect alone (mirrors how Paynow verification works here —
// see app/api/paynow/result/route.ts).
export async function getZimswitchPaymentStatus(
  resourcePath: string
): Promise<{ result: { code: string; description: string } }> {
  if (!isZimswitchConfigured()) {
    throw new Error('Zimswitch is not configured')
  }
  const res = await fetch(
    `${OPPWA_BASE_URL}${resourcePath}?entityId=${process.env.ZIMSWITCH_ENTITY_ID}`,
    { headers: { Authorization: `Bearer ${process.env.ZIMSWITCH_ACCESS_TOKEN}` } }
  )
  if (!res.ok) throw new Error(`Zimswitch status check failed: ${res.status}`)
  return res.json()
}

// OPPWA's documented convention is that result codes matching these
// patterns are "successful" — VERIFY this regex against the real
// integration guide before relying on it with real money.
export function isZimswitchSuccessCode(code: string): boolean {
  return /^(000\.000\.|000\.100\.1|000\.[36])/.test(code)
}

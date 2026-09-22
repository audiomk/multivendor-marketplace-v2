// WhatsApp vendor notifications.
//
// Two tiers, deliberately kept separate:
//
// 1. wa.me deep links (buildWhatsAppLink) — free, no signup, works today.
//    Opens WhatsApp with the message pre-filled; a human (you, in the admin
//    order view) still has to tap send. This is the fast path for "message
//    this vendor directly instead of posting in a congested group."
//
// 2. sendWhatsAppOrderNotification — SCAFFOLD for the WhatsApp Business
//    Cloud API (Meta), which can push the message automatically with no
//    human click. This requires a Meta Business verification + a WhatsApp
//    Business phone number + an approved message template (business-
//    initiated messages outside a 24h customer-service window MUST use a
//    pre-approved template — you can't just send free-form text). There is
//    typically a free monthly allowance of business-initiated conversations,
//    but pricing/limits change — verify current terms at
//    business.whatsapp.com before relying on it. Not wired to real
//    credentials; fails gracefully until WHATSAPP_* env vars are set.

// Formats a Zimbabwean (or already-international) number into the digits-only
// international format wa.me/Meta's API expects, e.g. "0771234567" -> "263771234567".
export function formatWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('263')) return digits
  if (digits.startsWith('0')) return '263' + digits.slice(1)
  if (digits.length === 9) return '263' + digits
  return digits
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const number = formatWhatsAppNumber(phone)
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function buildOrderNotificationMessage({
  storeName,
  orderShortId,
  itemsSummary,
  vendorPayout,
}: {
  storeName: string
  orderShortId: string
  itemsSummary: string
  vendorPayout: number
}): string {
  return (
    `New order for ${storeName}! 🛒\n\n` +
    `Order #${orderShortId}\n` +
    `Items: ${itemsSummary}\n` +
    `Your payout: $${vendorPayout.toFixed(2)}\n\n` +
    `View it in your vendor dashboard.`
  )
}

export function isWhatsAppApiConfigured() {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)
}

// SCAFFOLD — sends a pre-approved template message via Meta's Cloud API.
// "new_order" is a placeholder template name; you must create and get a
// template approved in Meta Business Manager before this call will succeed,
// and the {{1}}/{{2}}/{{3}} placeholders below must match that template's
// actual variable layout.
export async function sendWhatsAppOrderNotification({
  toPhone,
  storeName,
  orderShortId,
  vendorPayout,
}: {
  toPhone: string
  storeName: string
  orderShortId: string
  vendorPayout: number
}): Promise<{ success: boolean; message?: string }> {
  if (!isWhatsAppApiConfigured()) {
    return {
      success: false,
      message: 'WhatsApp Business API not configured — set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID',
    }
  }

  const to = formatWhatsAppNumber(toPhone)
  const res = await fetch(
    `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: 'new_order',
          language: { code: 'en_US' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: storeName },
                { type: 'text', text: orderShortId },
                { type: 'text', text: `$${vendorPayout.toFixed(2)}` },
              ],
            },
          ],
        },
      }),
    }
  )

  if (!res.ok) {
    const body = await res.text()
    console.error('WhatsApp send failed:', body)
    return { success: false, message: 'WhatsApp send failed' }
  }
  return { success: true }
}

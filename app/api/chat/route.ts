import Anthropic from '@anthropic-ai/sdk'
import { auth } from '@/auth'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { isAiChatConfigured, AI_CHAT_MODEL, AI_CHAT_SYSTEM_PROMPT } from '@/lib/ai-chat'

// Only the last N turns are sent — bounds token cost per request and this
// is a stateless FAQ-style assistant, not a long-running conversation that
// needs full history.
const MAX_HISTORY_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 2000

export async function POST(req: Request) {
  if (!isAiChatConfigured()) {
    return Response.json(
      { error: 'Chat isn’t set up yet — set ANTHROPIC_API_KEY to enable it.' },
      { status: 503 }
    )
  }

  const session = await auth()
  const rateLimitKey = session?.user?.id ? `ai-chat:${session.user.id}` : `ai-chat-ip:${getClientIp(req)}`
  const { allowed, retryAfterSeconds } = checkRateLimit(rateLimitKey, 15, 10 * 60 * 1000)
  if (!allowed) {
    return Response.json(
      { error: 'You’ve sent a lot of messages — give it a minute and try again.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    )
  }

  const { messages } = await req.json()
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: 'messages is required' }, { status: 400 })
  }

  const trimmed = messages
    .slice(-MAX_HISTORY_MESSAGES)
    .filter((m: any) => m?.role === 'user' || m?.role === 'assistant')
    .map((m: any) => ({
      role: m.role,
      content: String(m.content || '').slice(0, MAX_MESSAGE_LENGTH),
    }))

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: AI_CHAT_MODEL,
          max_tokens: 1024,
          system: AI_CHAT_SYSTEM_PROMPT,
          messages: trimmed,
        })
        anthropicStream.on('text', (text) => {
          controller.enqueue(encoder.encode(text))
        })
        await anthropicStream.finalMessage()
        controller.close()
      } catch (err) {
        console.error('AI chat stream error:', err)
        controller.enqueue(encoder.encode('\n\n[Something went wrong — please try again.]'))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

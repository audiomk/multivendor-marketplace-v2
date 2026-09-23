'use client'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getConversation, sendMessage } from '@/lib/actions/message.actions'
import { useToast } from '@/hooks/use-toast'
import { formatDateTime } from '@/lib/utils'

export default function ChatThread({
  conversationId,
  myRole,
  initialMessages,
  otherPartyName,
}: {
  conversationId: string
  myRole: 'buyer' | 'vendor'
  initialMessages: any[]
  otherPartyName: string
}) {
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const { toast } = useToast()
  const bottomRef = useRef<HTMLDivElement>(null)

  // Simple polling instead of websockets — no extra infra/cost, and a
  // few-second delay is fine for buyer/vendor product questions.
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await getConversation(conversationId)
      if (res.success) setMessages((res.data as any).messages)
    }, 5000)
    return () => clearInterval(interval)
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = async () => {
    if (!draft.trim()) return
    setSending(true)
    const res = await sendMessage({ conversationId, body: draft })
    setSending(false)
    if (!res.success) {
      toast({ description: res.message, variant: 'destructive' })
      return
    }
    setMessages((prev) => [
      ...prev,
      { senderRole: myRole, body: draft.trim(), createdAt: new Date().toISOString() },
    ])
    setDraft('')
  }

  return (
    <div className='flex flex-col h-[70vh] border rounded-lg overflow-hidden'>
      <div className='px-4 py-3 border-b bg-gray-50'>
        <p className='font-medium text-sm'>{otherPartyName}</p>
      </div>
      <div className='flex-1 overflow-y-auto p-4 space-y-3'>
        {messages.length === 0 && (
          <p className='text-sm text-muted-foreground text-center mt-8'>
            No messages yet — say hello!
          </p>
        )}
        {messages.map((m, i) => {
          const mine = m.senderRole === myRole
          return (
            <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  mine ? 'bg-[#006D6B] text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{m.body}</p>
                <p className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-gray-400'}`}>
                  {formatDateTime(new Date(m.createdAt)).dateTime}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <div className='p-3 border-t flex gap-2'>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder='Type a message…'
          className='flex-1 border rounded-full px-4 py-2 text-sm outline-none
                     focus:ring-2 focus:ring-[#006D6B]'
        />
        <Button onClick={handleSend} disabled={sending || !draft.trim()} className='rounded-full'>
          Send
        </Button>
      </div>
    </div>
  )
}

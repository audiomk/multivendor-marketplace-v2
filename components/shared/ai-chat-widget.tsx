'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MessageSquare, X, Send } from 'lucide-react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function AiChatWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Not useful in the admin dashboard — admins already have direct access,
  // they don't need a "how does the site work" assistant.
  if (pathname?.includes('/admin')) return null

  const handleSend = async () => {
    const text = draft.trim()
    if (!text || loading) return
    setError('')
    setDraft('')
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages([...nextMessages, { role: 'assistant', content: '' }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Something went wrong')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantText += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', content: assistantText }
          return copy
        })
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label='Open chat'
        className='fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#006D6B]
                   shadow-lg flex items-center justify-center hover:scale-105 transition-transform'
      >
        <MessageSquare className='w-6 h-6 text-[#FABB02]' />
      </button>
    )
  }

  return (
    <div className='fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm h-[70vh] max-h-[520px]
                    bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden'>
      <div className='px-4 py-3 flex items-center justify-between' style={{ background: '#006D6B' }}>
        <p className='text-white font-semibold text-sm'>Indaba Cart Assistant</p>
        <button onClick={() => setOpen(false)} aria-label='Close chat' className='text-white/80 hover:text-white'>
          <X className='w-5 h-5' />
        </button>
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-3'>
        {messages.length === 0 && (
          <p className='text-sm text-muted-foreground text-center mt-8'>
            Hi! Ask me anything about how Indaba Cart works &mdash; payments, orders, selling, or anything else.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                m.role === 'user' ? 'bg-[#006D6B] text-white' : 'bg-gray-100 text-gray-900'
              }`}
            >
              {m.content || (loading && i === messages.length - 1 ? '…' : '')}
            </div>
          </div>
        ))}
        {error && (
          <p className='text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2'>{error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className='p-3 border-t flex gap-2'>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder='Ask a question…'
          disabled={loading}
          className='flex-1 border rounded-full px-4 py-2 text-sm outline-none
                     focus:ring-2 focus:ring-[#006D6B] disabled:opacity-50'
        />
        <button
          onClick={handleSend}
          disabled={loading || !draft.trim()}
          aria-label='Send'
          className='shrink-0 w-9 h-9 rounded-full bg-[#006D6B] flex items-center justify-center
                     disabled:opacity-50'
        >
          <Send className='w-4 h-4 text-white' />
        </button>
      </div>
    </div>
  )
}

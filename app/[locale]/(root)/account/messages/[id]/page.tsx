import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getConversation } from '@/lib/actions/message.actions'
import ChatThread from '@/components/shared/messages/chat-thread'

export const metadata: Metadata = { title: 'Conversation' }

export default async function ConversationPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const result = await getConversation(id)
  if (!result.success) notFound()

  const conversation = result.data as any
  const otherPartyName = conversation.myRole === 'buyer'
    ? (conversation.vendorId?.vendorProfile?.storeName || conversation.vendorId?.name || 'Vendor')
    : (conversation.buyerId?.name || 'Buyer')

  return (
    <div>
      <h1 className='h1-bold py-4'>Messages</h1>
      <ChatThread
        conversationId={id}
        myRole={conversation.myRole}
        initialMessages={conversation.messages}
        otherPartyName={otherPartyName}
      />
    </div>
  )
}

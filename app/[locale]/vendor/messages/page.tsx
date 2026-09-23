import { Metadata } from 'next'
import { getMyConversations } from '@/lib/actions/message.actions'
import ConversationList from '@/components/shared/messages/conversation-list'

export const metadata: Metadata = { title: 'Messages' }

export default async function VendorMessagesPage() {
  const result = await getMyConversations()
  const conversations = result.success ? result.data! : []

  return (
    <div>
      <h1 className='text-2xl font-bold mb-4'>Messages</h1>
      <ConversationList conversations={conversations} basePath='/vendor/messages' />
    </div>
  )
}

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

export default function ConversationList({
  conversations,
  basePath,
}: {
  conversations: any[]
  basePath: string
}) {
  if (conversations.length === 0) {
    return <p className='text-sm text-muted-foreground'>No conversations yet.</p>
  }

  return (
    <div className='space-y-2'>
      {conversations.map((c) => {
        const otherParty = c.myRole === 'buyer'
          ? (c.vendorId?.vendorProfile?.storeName || c.vendorId?.name || 'Vendor')
          : (c.buyerId?.name || 'Buyer')
        return (
          <Link key={c._id} href={`${basePath}/${c._id}`}>
            <Card className='hover:border-[#006D6B] transition-colors'>
              <CardContent className='p-4 flex items-center justify-between gap-3'>
                <div className='min-w-0'>
                  <div className='flex items-center gap-2'>
                    <p className='font-medium text-sm truncate'>{otherParty}</p>
                    {c.unread > 0 && (
                      <span className='bg-[#006D6B] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full'>
                        {c.unread}
                      </span>
                    )}
                  </div>
                  {c.productId?.name && (
                    <p className='text-xs text-muted-foreground truncate'>Re: {c.productId.name}</p>
                  )}
                  {c.lastMessage && (
                    <p className='text-xs text-gray-500 truncate mt-0.5'>{c.lastMessage.body}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

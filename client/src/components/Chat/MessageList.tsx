import { useRef, useEffect } from 'react'
import { useChatStore } from '../../store/useChatStore'
import { useAuthStore } from '../../store/useAuthStore'
import { MessageBubble } from './MessageBubble'

interface Props {
  roomId: string
}

export function MessageList({ roomId }: Props) {
  const messages = useChatStore((s) => s.messages[roomId] ?? [])
  const currentUser = useAuthStore((s) => s.user)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
        No messages yet. Say hello!
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
      {messages.map((message, index) => {
        const prev = messages[index - 1]
        const showAvatar = !prev || prev.senderId !== message.senderId
        const isOwn = message.senderId === currentUser?.id
        return (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={isOwn}
            showAvatar={showAvatar}
          />
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}

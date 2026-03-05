import { useChatStore } from '../../store/useChatStore'

interface Props {
  roomId: string
}

export function TypingIndicator({ roomId }: Props) {
  const typingUsers = useChatStore((s) => s.typingUsers[roomId] ?? [])

  if (typingUsers.length === 0) return <div className="h-6" />

  const label =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing`
      : typingUsers.length === 2
      ? `${typingUsers[0]} and ${typingUsers[1]} are typing`
      : 'Several people are typing'

  return (
    <div className="px-6 h-6 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
      <span>{label}</span>
      <span className="flex items-center">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </span>
    </div>
  )
}

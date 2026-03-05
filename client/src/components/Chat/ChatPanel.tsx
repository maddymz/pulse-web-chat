import { useChatStore } from '../../store/useChatStore'
import { ChatHeader } from './ChatHeader'
import { MessageList } from './MessageList'
import { TypingIndicator } from './TypingIndicator'
import { MessageInput } from './MessageInput'

export function ChatPanel() {
  const activeRoomId = useChatStore((s) => s.activeRoomId)

  if (!activeRoomId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-600">
        <div className="text-center select-none">
          <div className="text-5xl mb-3">💬</div>
          <p className="text-lg font-medium">Select a room to start chatting</p>
          <p className="text-sm mt-1">Or create a new one with the + button</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900">
      <ChatHeader roomId={activeRoomId} />
      <MessageList roomId={activeRoomId} />
      <TypingIndicator roomId={activeRoomId} />
      <MessageInput roomId={activeRoomId} />
    </div>
  )
}

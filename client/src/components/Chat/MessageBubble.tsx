import { UserAvatar } from '../Sidebar/UserAvatar'
import { formatTime, formatFullDate } from '../../lib/utils'
import type { Message } from '../../types'

interface Props {
  message: Message
  isOwn: boolean
  showAvatar: boolean
}

export function MessageBubble({ message, isOwn, showAvatar }: Props) {
  return (
    <div
      className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${
        !showAvatar ? (isOwn ? 'pr-9' : 'pl-9') : ''
      }`}
    >
      {showAvatar && !isOwn && (
        <UserAvatar username={message.senderName} color={message.avatarColor} size="sm" />
      )}
      {showAvatar && isOwn && <div className="w-7" />}

      <div className={`max-w-[70%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {showAvatar && !isOwn && (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 ml-1">
            {message.senderName}
          </span>
        )}
        <div
          className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
            isOwn
              ? 'bg-violet-600 text-white rounded-br-sm'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
          }`}
        >
          {message.text}
        </div>
        <span
          className="text-xs text-gray-400 dark:text-gray-500 mt-1 mx-1"
          title={formatFullDate(message.timestamp)}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}

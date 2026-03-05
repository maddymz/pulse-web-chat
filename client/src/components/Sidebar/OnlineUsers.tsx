import { useChatStore } from '../../store/useChatStore'
import { UserAvatar } from './UserAvatar'

export function OnlineUsers() {
  const onlineUsers = useChatStore((s) => s.onlineUsers)

  return (
    <div className="py-2 border-t border-gray-200 dark:border-gray-700">
      <div className="px-4 py-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Online — {onlineUsers.length}
        </span>
      </div>
      <ul className="space-y-0.5">
        {onlineUsers.map((user) => (
          <li key={user.id} className="flex items-center gap-2.5 px-4 py-1">
            <div className="relative">
              <UserAvatar username={user.username} color={user.avatarColor} size="sm" />
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full ring-1 ring-white dark:ring-gray-800" />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{user.username}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

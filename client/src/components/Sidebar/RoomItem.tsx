import { useChatStore } from '../../store/useChatStore'
import { useUIStore } from '../../store/useUIStore'
import socket from '../../lib/socket'
import { SocketEvents } from '../../types/events'
import type { Room } from '../../types'

interface Props {
  room: Room
}

export function RoomItem({ room }: Props) {
  const { activeRoomId, setActiveRoom, unreadCounts } = useChatStore()
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)
  const isActive = activeRoomId === room.id
  const unread = unreadCounts[room.id] ?? 0

  const handleClick = () => {
    if (!isActive) {
      socket.emit(SocketEvents.JOIN_ROOM, { roomId: room.id })
      setActiveRoom(room.id)
    }
    setSidebarOpen(false)
  }

  return (
    <li>
      <button
        onClick={handleClick}
        className={`w-full text-left px-4 py-1.5 flex items-center justify-between transition-colors rounded-sm ${
          isActive
            ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-medium'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
        }`}
      >
        <span className="text-sm truncate">{room.name}</span>
        {unread > 0 && !isActive && (
          <span className="ml-1 bg-violet-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center leading-none">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
    </li>
  )
}

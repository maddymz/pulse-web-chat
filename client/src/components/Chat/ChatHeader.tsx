import { useChatStore } from '../../store/useChatStore'
import { useUIStore } from '../../store/useUIStore'

interface Props {
  roomId: string
}

export function ChatHeader({ roomId }: Props) {
  const room = useChatStore((s) => s.rooms.find((r) => r.id === roomId))
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)

  if (!room) return null

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Hamburger — mobile only */}
      <button
        className="md:hidden p-2 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 transition-colors"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div>
        <h2 className="font-semibold text-gray-900 dark:text-white">{room.name}</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {room.memberIds.length} member{room.memberIds.length !== 1 ? 's' : ''} here
        </p>
      </div>
    </div>
  )
}

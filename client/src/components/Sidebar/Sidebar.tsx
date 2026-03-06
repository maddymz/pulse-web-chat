import { RoomList } from './RoomList'
import { OnlineUsers } from './OnlineUsers'
import { ThemeToggle } from '../UI/ThemeToggle'
import { useUIStore } from '../../store/useUIStore'

export function Sidebar() {
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)

  return (
    <aside className="h-full w-full flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white">Pulse</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {/* Close button — mobile only */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <RoomList />
        <OnlineUsers />
      </div>
    </aside>
  )
}

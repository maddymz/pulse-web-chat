import { RoomList } from './RoomList'
import { OnlineUsers } from './OnlineUsers'
import { ThemeToggle } from '../UI/ThemeToggle'

export function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white">Pulse</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex-1 overflow-y-auto">
        <RoomList />
        <OnlineUsers />
      </div>
    </aside>
  )
}

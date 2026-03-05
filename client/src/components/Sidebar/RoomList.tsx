import { useChatStore } from '../../store/useChatStore'
import { useUIStore } from '../../store/useUIStore'
import { RoomItem } from './RoomItem'

export function RoomList() {
  const rooms = useChatStore((s) => s.rooms)
  const setCreateRoomModalOpen = useUIStore((s) => s.setCreateRoomModalOpen)

  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-4 py-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Rooms
        </span>
        <button
          onClick={() => setCreateRoomModalOpen(true)}
          className="w-5 h-5 flex items-center justify-center text-lg leading-none text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          title="Create room"
        >
          +
        </button>
      </div>
      <ul>
        {rooms.map((room) => (
          <RoomItem key={room.id} room={room} />
        ))}
      </ul>
    </div>
  )
}

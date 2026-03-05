import { useChatStore } from '../../store/useChatStore'

interface Props {
  roomId: string
}

export function ChatHeader({ roomId }: Props) {
  const room = useChatStore((s) => s.rooms.find((r) => r.id === roomId))

  if (!room) return null

  return (
    <div className="flex items-center px-6 py-3.5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div>
        <h2 className="font-semibold text-gray-900 dark:text-white">{room.name}</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {room.memberIds.length} member{room.memberIds.length !== 1 ? 's' : ''} here
        </p>
      </div>
    </div>
  )
}

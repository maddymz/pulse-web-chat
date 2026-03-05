import { useSocket } from '../hooks/useSocket'
import { Sidebar } from './Sidebar/Sidebar'
import { ChatPanel } from './Chat/ChatPanel'
import { CreateRoomModal } from './UI/CreateRoomModal'
import { useUIStore } from '../store/useUIStore'

export function ChatLayout() {
  useSocket()
  const createRoomModalOpen = useUIStore((s) => s.createRoomModalOpen)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <ChatPanel />
      </main>
      {createRoomModalOpen && <CreateRoomModal />}
    </div>
  )
}

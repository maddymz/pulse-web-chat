import { useSocket } from '../hooks/useSocket'
import { useViewportHeight } from '../hooks/useViewportHeight'
import { Sidebar } from './Sidebar/Sidebar'
import { ChatPanel } from './Chat/ChatPanel'
import { CreateRoomModal } from './UI/CreateRoomModal'
import { useUIStore } from '../store/useUIStore'

export function ChatLayout() {
  useSocket()
  useViewportHeight()
  const createRoomModalOpen = useUIStore((s) => s.createRoomModalOpen)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)

  return (
    <div
      className="flex overflow-hidden fixed w-full left-0"
      style={{
        height: 'var(--app-height, 100dvh)',
        top: 'var(--app-top, 0px)',
      }}
    >
      {/* Mobile backdrop — tap outside sidebar to close it */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: slide-in drawer on mobile, static column on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 transition-transform duration-200 md:static md:w-64 md:z-auto md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col min-w-0">
        <ChatPanel />
      </main>

      {createRoomModalOpen && <CreateRoomModal />}
    </div>
  )
}

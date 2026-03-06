import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  darkMode: boolean
  createRoomModalOpen: boolean
  sidebarOpen: boolean
  toggleDarkMode: () => void
  setCreateRoomModalOpen: (open: boolean) => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      darkMode: false,
      createRoomModalOpen: false,
      sidebarOpen: false,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setCreateRoomModalOpen: (open) => set({ createRoomModalOpen: open }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'pulse-ui',
      partialize: (s) => ({ darkMode: s.darkMode }),
    }
  )
)

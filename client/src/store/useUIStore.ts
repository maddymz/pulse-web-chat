import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  darkMode: boolean
  createRoomModalOpen: boolean
  toggleDarkMode: () => void
  setCreateRoomModalOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      darkMode: false,
      createRoomModalOpen: false,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setCreateRoomModalOpen: (open) => set({ createRoomModalOpen: open }),
    }),
    {
      name: 'pulse-ui',
      partialize: (s) => ({ darkMode: s.darkMode }),
    }
  )
)

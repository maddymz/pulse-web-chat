import { create } from 'zustand'
import type { User, Room, Message } from '../types'

interface ChatState {
  rooms: Room[]
  messages: Record<string, Message[]>
  onlineUsers: User[]
  typingUsers: Record<string, string[]>
  activeRoomId: string | null
  unreadCounts: Record<string, number>

  setRooms: (rooms: Room[]) => void
  addRoom: (room: Room) => void
  setActiveRoom: (roomId: string) => void
  addMessage: (message: Message) => void
  setHistory: (roomId: string, messages: Message[]) => void
  setOnlineUsers: (users: User[]) => void
  addOnlineUser: (user: User) => void
  removeOnlineUser: (userId: string) => void
  setTyping: (roomId: string, username: string, isTyping: boolean) => void
  updateRoomMembers: (roomId: string, memberIds: string[]) => void
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: [],
  messages: {},
  onlineUsers: [],
  typingUsers: {},
  activeRoomId: null,
  unreadCounts: {},

  setRooms: (rooms) =>
    set({ rooms, messages: Object.fromEntries(rooms.map((r) => [r.id, []])) }),

  addRoom: (room) =>
    set((s) => ({
      rooms: [...s.rooms, room],
      messages: { ...s.messages, [room.id]: [] },
    })),

  setActiveRoom: (roomId) =>
    set((s) => ({
      activeRoomId: roomId,
      unreadCounts: { ...s.unreadCounts, [roomId]: 0 },
    })),

  addMessage: (message) =>
    set((s) => {
      const existing = s.messages[message.roomId] ?? []
      const isActive = s.activeRoomId === message.roomId
      return {
        messages: { ...s.messages, [message.roomId]: [...existing, message] },
        unreadCounts: isActive
          ? s.unreadCounts
          : { ...s.unreadCounts, [message.roomId]: (s.unreadCounts[message.roomId] ?? 0) + 1 },
      }
    }),

  setHistory: (roomId, messages) =>
    set((s) => ({ messages: { ...s.messages, [roomId]: messages } })),

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  addOnlineUser: (user) =>
    set((s) => ({
      onlineUsers: s.onlineUsers.some((u) => u.id === user.id)
        ? s.onlineUsers
        : [...s.onlineUsers, user],
    })),

  removeOnlineUser: (userId) =>
    set((s) => ({ onlineUsers: s.onlineUsers.filter((u) => u.id !== userId) })),

  setTyping: (roomId, username, isTyping) =>
    set((s) => {
      const current = s.typingUsers[roomId] ?? []
      const updated = isTyping
        ? current.includes(username) ? current : [...current, username]
        : current.filter((u) => u !== username)
      return { typingUsers: { ...s.typingUsers, [roomId]: updated } }
    }),

  updateRoomMembers: (roomId, memberIds) =>
    set((s) => ({
      rooms: s.rooms.map((r) => (r.id === roomId ? { ...r, memberIds } : r)),
    })),
}))

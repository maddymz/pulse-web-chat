export interface User {
  id: string
  username: string
  avatarColor: string
}

export interface Message {
  id: string
  roomId: string
  senderId: string
  senderName: string
  avatarColor: string
  text: string
  timestamp: number
}

export interface Room {
  id: string
  name: string
  createdBy: string
  memberIds: string[]
}

// ── Payload types ─────────────────────────────

export interface JoinAckPayload {
  user: User
  rooms: Room[]
  onlineUsers: User[]
}

export interface RoomJoinedPayload {
  room: Room
  history: Message[]
}

export interface NewMessagePayload {
  message: Message
}

export interface RoomCreatedPayload {
  room: Room
}

export interface UserJoinedPayload {
  user: User
}

export interface UserLeftPayload {
  userId: string
  username: string
}

export interface TypingUpdatePayload {
  roomId: string
  userId: string
  username: string
  isTyping: boolean
}

export interface RoomUsersUpdatePayload {
  roomId: string
  memberIds: string[]
}

export interface ErrorPayload {
  code: string
  message: string
}

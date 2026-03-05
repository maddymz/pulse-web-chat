import { useEffect } from 'react'
import socket from '../lib/socket'
import { SocketEvents } from '../types/events'
import { useChatStore } from '../store/useChatStore'
import type {
  RoomJoinedPayload,
  NewMessagePayload,
  RoomCreatedPayload,
  UserJoinedPayload,
  UserLeftPayload,
  TypingUpdatePayload,
  RoomUsersUpdatePayload,
} from '../types'

export function useSocket() {
  const {
    addRoom,
    setHistory,
    addMessage,
    addOnlineUser,
    removeOnlineUser,
    setTyping,
    updateRoomMembers,
  } = useChatStore()

  useEffect(() => {
    socket.on(SocketEvents.ROOM_JOINED, ({ room, history }: RoomJoinedPayload) => {
      setHistory(room.id, history)
    })

    socket.on(SocketEvents.ROOM_CREATED, ({ room }: RoomCreatedPayload) => {
      addRoom(room)
    })

    socket.on(SocketEvents.NEW_MESSAGE, ({ message }: NewMessagePayload) => {
      addMessage(message)
    })

    socket.on(SocketEvents.USER_JOINED, ({ user }: UserJoinedPayload) => {
      addOnlineUser(user)
    })

    socket.on(SocketEvents.USER_LEFT, ({ userId }: UserLeftPayload) => {
      removeOnlineUser(userId)
    })

    socket.on(SocketEvents.TYPING_UPDATE, ({ roomId, username, isTyping }: TypingUpdatePayload) => {
      setTyping(roomId, username, isTyping)
    })

    socket.on(SocketEvents.ROOM_USERS_UPDATE, ({ roomId, memberIds }: RoomUsersUpdatePayload) => {
      updateRoomMembers(roomId, memberIds)
    })

    return () => {
      socket.off(SocketEvents.ROOM_JOINED)
      socket.off(SocketEvents.ROOM_CREATED)
      socket.off(SocketEvents.NEW_MESSAGE)
      socket.off(SocketEvents.USER_JOINED)
      socket.off(SocketEvents.USER_LEFT)
      socket.off(SocketEvents.TYPING_UPDATE)
      socket.off(SocketEvents.ROOM_USERS_UPDATE)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}

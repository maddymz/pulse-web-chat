import { useEffect } from 'react'
import socket from '../lib/socket'
import { SocketEvents } from '../types/events'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'

// Shared AudioContext — created once, resumed on first user gesture so that
// mobile browsers (iOS Safari, Android Chrome) honour the autoplay policy.
let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) audioCtx = new AudioContext()
    // resume() is a no-op when already running; on mobile it needs a gesture
    // to move from 'suspended' → 'running', so we call it on every interaction.
    if (audioCtx.state === 'suspended') audioCtx.resume()
    return audioCtx
  } catch {
    return null
  }
}

// Unlock the AudioContext on the first user interaction so mobile can play.
const unlockAudio = () => { getAudioContext(); document.removeEventListener('click', unlockAudio); document.removeEventListener('touchend', unlockAudio) }
document.addEventListener('click', unlockAudio, { once: true })
document.addEventListener('touchend', unlockAudio, { once: true })

function playPing() {
  try {
    const ctx = getAudioContext()
    if (!ctx || ctx.state !== 'running') return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.4)
  } catch {
    // fail silently
  }
}
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
    // On reconnect the server has no memory of this client's user or room
    // membership. Re-emit JOIN + JOIN_ROOM so messages start flowing again.
    const handleConnect = () => {
      const user = useAuthStore.getState().user
      const activeRoomId = useChatStore.getState().activeRoomId
      if (!user) return // Initial connection is handled by LoginScreen
      socket.emit(SocketEvents.JOIN, { username: user.username })
      if (activeRoomId) {
        socket.emit(SocketEvents.JOIN_ROOM, { roomId: activeRoomId })
      }
    }

    socket.on('connect', handleConnect)

    socket.on(SocketEvents.ROOM_JOINED, ({ room, history }: RoomJoinedPayload) => {
      setHistory(room.id, history)
    })

    socket.on(SocketEvents.ROOM_CREATED, ({ room }: RoomCreatedPayload) => {
      addRoom(room)
    })

    socket.on(SocketEvents.NEW_MESSAGE, ({ message }: NewMessagePayload) => {
      addMessage(message)
      const currentUserId = useAuthStore.getState().user?.id
      if (message.senderId !== currentUserId) playPing()
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
      socket.off('connect', handleConnect)
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

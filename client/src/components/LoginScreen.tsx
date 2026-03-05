import { useState, type FormEvent } from 'react'
import socket from '../lib/socket'
import { SocketEvents } from '../types/events'
import { useAuthStore } from '../store/useAuthStore'
import { useChatStore } from '../store/useChatStore'
import type { JoinAckPayload } from '../types'

export function LoginScreen() {
  const [username, setUsername] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const setUser = useAuthStore((s) => s.setUser)
  const { setRooms, setOnlineUsers } = useChatStore()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const name = username.trim()
    if (!name || name.length < 2 || name.length > 20) {
      setError('Username must be 2–20 characters')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      setError('Letters, numbers, and underscores only')
      return
    }
    setConnecting(true)
    setError('')

    // Must register JOIN_ACK here — ChatLayout (and useSocket) only mounts
    // after the user is set, so it would be too late to catch this event there.
    socket.once(SocketEvents.JOIN_ACK, ({ user, rooms, onlineUsers }: JoinAckPayload) => {
      setUser(user)
      setRooms(rooms)
      setOnlineUsers(onlineUsers)
    })

    socket.once(SocketEvents.ERROR, () => {
      setConnecting(false)
      setError('Connection failed. Is the server running?')
      socket.disconnect()
    })

    socket.connect()
    socket.emit(SocketEvents.JOIN, { username: name })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-600 mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">P</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pulse</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Chat with your friends</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Choose a username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. cooldev_42"
            maxLength={20}
            autoFocus
            disabled={connecting}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={connecting || !username.trim()}
            className="mt-4 w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
          >
            {connecting ? 'Joining…' : 'Join Pulse'}
          </button>
        </form>
      </div>
    </div>
  )
}

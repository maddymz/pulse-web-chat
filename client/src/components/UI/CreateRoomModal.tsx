import { useState, type FormEvent } from 'react'
import { Modal } from './Modal'
import { useUIStore } from '../../store/useUIStore'
import socket from '../../lib/socket'
import { SocketEvents } from '../../types/events'

export function CreateRoomModal() {
  const [name, setName] = useState('')
  const setCreateRoomModalOpen = useUIStore((s) => s.setCreateRoomModalOpen)

  const handleClose = () => setCreateRoomModalOpen(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    socket.emit(SocketEvents.CREATE_ROOM, { name: trimmed })
    handleClose()
  }

  return (
    <Modal title="Create a room" onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Room name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. gaming"
          maxLength={50}
          autoFocus
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            Create
          </button>
        </div>
      </form>
    </Modal>
  )
}

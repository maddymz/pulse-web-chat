import { useState, useRef, useCallback, type KeyboardEvent } from 'react'
import socket from '../../lib/socket'
import { SocketEvents } from '../../types/events'

interface Props {
  roomId: string
}

export function MessageInput({ roomId }: Props) {
  const [text, setText] = useState('')
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (isTypingRef.current !== isTyping) {
        isTypingRef.current = isTyping
        socket.emit(SocketEvents.TYPING, { roomId, isTyping })
      }
    },
    [roomId]
  )

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    sendTyping(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => sendTyping(false), 2000)
  }

  const sendMessage = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    socket.emit(SocketEvents.SEND_MESSAGE, { roomId, text: trimmed })
    setText('')
    sendTyping(false)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="px-3 md:px-6 pt-3 md:pt-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      <div className="flex items-end gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-2 border border-gray-200 dark:border-gray-700 focus-within:border-violet-400 dark:focus-within:border-violet-600 transition-colors">
        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Send a message…"
          rows={1}
          style={{ resize: 'none' }}
          className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none max-h-28 overflow-y-auto"
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim()}
          className="mb-0.5 p-2.5 md:p-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white transition-colors"
          title="Send (Enter)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      <p className="hidden md:block text-xs text-gray-400 dark:text-gray-600 mt-1.5 text-right">
        Enter to send · Shift+Enter for newline
      </p>
    </div>
  )
}

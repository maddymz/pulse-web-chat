import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import socket from '../../lib/socket'
import { SocketEvents } from '../../types/events'

interface Props {
  roomId: string
}

export function MessageInput({ roomId }: Props) {
  const [text, setText] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pickerWrapRef = useRef<HTMLDivElement>(null)
  const emojiButtonRef = useRef<HTMLButtonElement>(null)

  // Close picker when clicking outside
  useEffect(() => {
    if (!showPicker) return
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (
        pickerWrapRef.current?.contains(target) ||
        emojiButtonRef.current?.contains(target)
      ) return
      setShowPicker(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [showPicker])

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

  const insertEmoji = (emoji: { native: string }) => {
    const ta = textareaRef.current
    const start = ta?.selectionStart ?? text.length
    const end = ta?.selectionEnd ?? text.length
    const newText = text.slice(0, start) + emoji.native + text.slice(end)
    setText(newText)
    setShowPicker(false)
    // Restore cursor after emoji
    requestAnimationFrame(() => {
      if (ta) {
        ta.selectionStart = ta.selectionEnd = start + emoji.native.length
        ta.focus()
      }
    })
  }

  return (
    <div
      className="px-3 md:px-6 pt-3 md:pt-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {/* Emoji picker — fixed so it escapes overflow:hidden parents */}
      {showPicker && (
        <div
          ref={pickerWrapRef}
          className="fixed z-50 bottom-20 right-4 md:right-8 shadow-xl rounded-2xl overflow-hidden"
        >
          <Picker
            data={data}
            onEmojiSelect={insertEmoji}
            theme="auto"
            previewPosition="none"
            skinTonePosition="none"
          />
        </div>
      )}

      <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl px-3 py-2 border border-gray-200 dark:border-gray-700 focus-within:border-violet-400 dark:focus-within:border-violet-600 transition-colors">
        {/* Emoji toggle */}
        <button
          ref={emojiButtonRef}
          type="button"
          onClick={() => setShowPicker((v) => !v)}
          className="mb-0.5 p-1 text-gray-400 hover:text-violet-500 dark:hover:text-violet-400 transition-colors flex-shrink-0"
          title="Emoji"
          aria-label="Toggle emoji picker"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M8 13s1.5 2 4 2 4-2 4-2" />
            <circle cx="9" cy="10" r="0.5" fill="currentColor" />
            <circle cx="15" cy="10" r="0.5" fill="currentColor" />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
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
          className="mb-0.5 p-2.5 md:p-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white transition-colors flex-shrink-0"
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

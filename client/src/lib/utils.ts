const PALETTE = [
  '#F87171', '#FB923C', '#FBBF24', '#34D399',
  '#38BDB8', '#60A5FA', '#818CF8', '#E879F9',
  '#F472B6', '#A78BFA',
]

export function usernameToColor(username: string): string {
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatFullDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

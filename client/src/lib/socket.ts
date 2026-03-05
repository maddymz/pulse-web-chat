import { io } from 'socket.io-client'

// Connects to same origin (Vite proxy forwards /socket.io → :3001)
const socket = io({ autoConnect: false })

export default socket

import { useAuthStore } from './store/useAuthStore'
import { LoginScreen } from './components/LoginScreen'
import { ChatLayout } from './components/ChatLayout'
import { useTheme } from './hooks/useTheme'

function App() {
  useTheme()
  const user = useAuthStore((s) => s.user)
  return user ? <ChatLayout /> : <LoginScreen />
}

export default App

import { useEffect } from 'react'
import { useUIStore } from '../store/useUIStore'

export function useTheme() {
  const darkMode = useUIStore((s) => s.darkMode)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])
}

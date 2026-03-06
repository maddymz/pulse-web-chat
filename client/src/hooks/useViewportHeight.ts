import { useEffect } from 'react'

/**
 * Tracks the visual viewport height (accounts for iOS Safari virtual keyboard)
 * and writes it to the --vh CSS custom property on <html>.
 * Use `height: calc(var(--vh) * 100)` or `height: var(--app-height)` in CSS,
 * or the `app-height` class (set via inline style in ChatLayout).
 */
export function useViewportHeight() {
  useEffect(() => {
    const update = () => {
      const h = window.visualViewport?.height ?? window.innerHeight
      document.documentElement.style.setProperty('--app-height', `${h}px`)
    }
    update()
    window.visualViewport?.addEventListener('resize', update)
    window.addEventListener('resize', update)
    return () => {
      window.visualViewport?.removeEventListener('resize', update)
      window.removeEventListener('resize', update)
    }
  }, [])
}

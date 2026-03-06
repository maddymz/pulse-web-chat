import { useEffect } from 'react'

/**
 * Tracks the visual viewport dimensions and writes them to CSS custom properties.
 * --app-height: actual visible height (shrinks when iOS keyboard appears)
 * --app-top: vertical offset when iOS scrolls the page to show the keyboard
 *
 * ChatLayout uses position:fixed + these two vars so it always occupies
 * exactly the visible area, regardless of keyboard state.
 */
export function useViewportHeight() {
  useEffect(() => {
    const update = () => {
      const vv = window.visualViewport
      const height = vv?.height ?? window.innerHeight
      const offsetTop = vv?.offsetTop ?? 0
      document.documentElement.style.setProperty('--app-height', `${height}px`)
      document.documentElement.style.setProperty('--app-top', `${offsetTop}px`)
    }
    update()
    // iOS fires 'scroll' on visualViewport (not 'resize') when keyboard changes
    window.visualViewport?.addEventListener('resize', update)
    window.visualViewport?.addEventListener('scroll', update)
    return () => {
      window.visualViewport?.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('scroll', update)
    }
  }, [])
}

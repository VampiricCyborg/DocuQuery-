import { useEffect } from "react"

type Shortcut = { key: string; ctrl?: boolean; meta?: boolean; action: () => void }

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      for (const s of shortcuts) {
        const ctrlOk = s.ctrl ? e.ctrlKey : true
        const metaOk = s.meta ? e.metaKey : true
        if (e.key === s.key && ctrlOk && metaOk) {
          e.preventDefault()
          s.action()
        }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [shortcuts])
}

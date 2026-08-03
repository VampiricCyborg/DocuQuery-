"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ChevronDown, Check } from "lucide-react"
import { useChatStore } from "@/stores/chat.store"
import { CHAT_MODE_META, type ChatMode } from "@/types"
import { cn } from "@/lib/utils"

const MODES: ChatMode[] = ["docuquery", "llm", "hybrid"]
const MENU_WIDTH = 256

export function ModeIndicator() {
  const { activeMode, setMode } = useChatStore()
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ left: 0, top: 0 })
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const activeIndex = MODES.indexOf(activeMode)
  const meta = CHAT_MODE_META[activeMode]

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const updatePosition = () => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const menuHeight = menuRef.current?.offsetHeight ?? 180
    const top = rect.top >= menuHeight + 8 ? rect.top - menuHeight - 8 : rect.bottom + 8
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - MENU_WIDTH - 8))
    setPosition({ left, top })
  }

  useEffect(() => {
    if (!open) return
    updatePosition()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus() }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault()
        const next = (activeIndex + (event.key === "ArrowDown" ? 1 : -1) + MODES.length) % MODES.length
        setMode(MODES[next])
      }
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setOpen(false) }
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!triggerRef.current?.contains(event.target as Node) && !menuRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)
    return () => { document.removeEventListener("keydown", onKeyDown); document.removeEventListener("pointerdown", onPointerDown); window.removeEventListener("resize", updatePosition); window.removeEventListener("scroll", updatePosition, true) }
  }, [open, activeIndex, setMode])

  const menu = open && mounted ? createPortal(
    <div ref={menuRef} role="menu" aria-label="Chat mode" style={{ position: "fixed", left: position.left, top: position.top, width: MENU_WIDTH, zIndex: 100 }} className="rounded-xl border border-neutral-700/60 bg-neutral-900 p-1 shadow-xl shadow-black/50">
      {MODES.map(mode => {
        const m = CHAT_MODE_META[mode]
        const selected = mode === activeMode
        return <button key={mode} role="menuitemradio" aria-checked={selected} onClick={() => { setMode(mode); setOpen(false); triggerRef.current?.focus() }} className={cn("flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left outline-none focus:ring-2 focus:ring-blue-500", selected ? "bg-neutral-800 text-white" : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white")}>
          <span className="mt-0.5 text-base">{m.icon}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className={cn("text-xs font-semibold", m.color)}>{m.label}</span>{selected && <Check className="h-3 w-3 shrink-0 text-emerald-400" />}</span><span className="mt-0.5 block text-[11px] leading-relaxed text-neutral-500">{m.description}</span></span>
        </button>
      })}
    </div>, document.body
  ) : null

  return <>
    <button ref={triggerRef} aria-haspopup="menu" aria-expanded={open} aria-label={`Chat mode: ${meta.label}`} onClick={() => setOpen(value => !value)} className={cn("flex items-center gap-1.5 rounded-lg border border-neutral-700/60 bg-neutral-800/60 px-2.5 py-1.5 text-xs font-medium transition-all hover:border-neutral-600 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500", open && "border-neutral-600 bg-neutral-800")}>
      <span>{meta.icon}</span><span className={meta.color}>{meta.label}</span><ChevronDown className={cn("h-3 w-3 text-neutral-500 transition-transform", open && "rotate-180")} />
    </button>
    {menu}
  </>
}

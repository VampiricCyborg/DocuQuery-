"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, MessageSquare, Files, Bot, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip } from "@/components/ui/Tooltip"

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/chat", icon: MessageSquare, label: "Chat" },
  { href: "/files", icon: Files, label: "Files" },
  { href: "/agents", icon: Bot, label: "Agents" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

export function NavLinks({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-0.5 px-2 py-2">
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href)
        const item = (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
              active
                ? "bg-neutral-800 text-white"
                : "text-neutral-500 hover:bg-neutral-900 hover:text-neutral-200"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        )
        return collapsed
          ? <Tooltip key={href} content={label} side="right">{item}</Tooltip>
          : item
      })}
    </nav>
  )
}

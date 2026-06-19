"use client"
import { cn } from "@/lib/utils"

interface BadgeProps { children: React.ReactNode; variant?: "default" | "success" | "warning" | "error"; className?: string }

const variants = {
  default: "bg-neutral-800 text-neutral-300",
  success: "bg-green-500/15 text-green-400",
  warning: "bg-yellow-500/15 text-yellow-400",
  error: "bg-red-500/15 text-red-400",
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  )
}

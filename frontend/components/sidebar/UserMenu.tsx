"use client"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { LogOut, Settings, CreditCard, User } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { useRouter } from "next/navigation"

export function UserMenu() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  if (!user) return null

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2.5 px-3 py-3 border-t border-neutral-800 hover:bg-neutral-900 transition-colors w-full text-left">
          <Avatar name={user.name} src={user.avatar} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user.name}</p>
            <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
          </div>
          <Badge variant="success">{user.plan}</Badge>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top" align="start" sideOffset={4}
          className="z-50 w-52 rounded-xl border border-neutral-800 bg-neutral-900 p-1 shadow-xl"
        >
          {[
            { icon: User, label: "Profile", action: () => {} },
            { icon: Settings, label: "Settings", action: () => router.push("/settings") },
            { icon: CreditCard, label: "Billing", action: () => {} },
          ].map(({ icon: Icon, label, action }) => (
            <DropdownMenu.Item key={label} onSelect={action}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white cursor-pointer outline-none transition-colors"
            >
              <Icon className="h-4 w-4" />{label}
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className="my-1 h-px bg-neutral-800" />
          <DropdownMenu.Item onSelect={() => { logout(); router.push("/login") }}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 cursor-pointer outline-none transition-colors"
          >
            <LogOut className="h-4 w-4" />Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

"use client"

import { useAuthStore } from "@/stores/auth.store"
import { Avatar } from "@/components/ui/Avatar"

export default function ProfilePage() {
  const user = useAuthStore(s => s.user)
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div><h1 className="text-xl font-semibold text-white">Profile</h1><p className="mt-0.5 text-sm text-neutral-500">Your DocuQuery account information.</p></div>
        <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="flex items-center gap-4"><Avatar name={user?.name} src={user?.avatar} size="lg" /><div><h2 className="text-base font-semibold text-white">{user?.name}</h2><p className="text-sm text-neutral-500">{user?.email}</p></div></div>
          <dl className="mt-6 grid gap-4 border-t border-neutral-800 pt-5 sm:grid-cols-2"><div><dt className="text-xs text-neutral-500">Name</dt><dd className="mt-1 text-sm text-neutral-200">{user?.name}</dd></div><div><dt className="text-xs text-neutral-500">Email</dt><dd className="mt-1 text-sm text-neutral-200">{user?.email}</dd></div><div><dt className="text-xs text-neutral-500">Account created</dt><dd className="mt-1 text-sm text-neutral-200">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</dd></div></dl>
        </section>
      </div>
    </div>
  )
}

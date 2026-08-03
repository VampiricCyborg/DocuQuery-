"use client"

import { useState } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { useSettingsStore } from "@/stores/settings.store"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import type { ChatMode } from "@/types"
import { useRouter } from "next/navigation"

const sections = ["General", "Appearance", "Chat", "Documents", "Account"] as const

export default function SettingsPage() {
  const [section, setSection] = useState<typeof sections[number]>("General")
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const settings = useSettingsStore()
  const router = useRouter()

  return <div className="flex-1 overflow-y-auto p-6"><div className="mx-auto max-w-4xl space-y-6">
    <div><h1 className="text-xl font-semibold text-white">Settings</h1><p className="mt-0.5 text-sm text-neutral-500">Manage your DocuQuery preferences and account.</p></div>
    <div className="grid gap-6 md:grid-cols-[170px_1fr]">
      <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto md:flex-col">{sections.map(item => <button key={item} onClick={() => setSection(item)} className={cn("rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500", section === item ? "bg-neutral-800 text-white" : "text-neutral-500 hover:bg-neutral-900 hover:text-neutral-200")}>{item}</button>)}</nav>
      <div className="space-y-5">{section === "General" && <Section title="General"><p className="mb-4 text-sm text-neutral-500">Choose the mode used when creating a new conversation.</p><ModeChoices value={settings.defaultMode} onChange={mode => settings.set("defaultMode", mode)} /></Section>}
      {section === "Appearance" && <Section title="Appearance"><p className="mb-4 text-sm text-neutral-500">The current release supports the dark theme.</p><div className="rounded-lg border border-blue-900/50 bg-blue-950/20 px-3 py-2 text-sm text-blue-200">Dark theme is enabled.</div></Section>}
      {section === "Chat" && <Section title="Chat"><Toggle label="Show citations" checked={settings.showCitations} onChange={v => settings.set("showCitations", v)} /><Toggle label="Auto-expand citations" checked={settings.autoExpandCitations} onChange={v => settings.set("autoExpandCitations", v)} /></Section>}
      {section === "Documents" && <Section title="Documents"><label className="block text-sm text-neutral-300">Default retrieval count<select value={settings.retrievalCount} onChange={e => settings.set("retrievalCount", Number(e.target.value))} className="mt-2 block rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white"><option value={3}>3 chunks</option><option value={5}>5 chunks</option><option value={10}>10 chunks</option></select></label></Section>}
      {section === "Account" && <><Section title="Account"><div className="grid gap-4 sm:grid-cols-2"><Info label="Name" value={user?.name} /><Info label="Email" value={user?.email} /><Info label="Created" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"} /></div><div className="mt-5 flex flex-wrap gap-3"><Button variant="secondary" onClick={() => router.push("/profile")}>View profile</Button><Button variant="secondary" onClick={() => { void logout(); router.push("/login") }}>Logout</Button></div></Section><Section title="Danger zone"><p className="mb-3 text-sm text-neutral-500">Account deletion is permanent and is not available until a verified deletion endpoint is configured.</p><Button variant="destructive" disabled>Delete account</Button></Section></>}
      </div>
    </div>
  </div></div>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-5"><h2 className="mb-4 text-sm font-semibold text-white">{title}</h2>{children}</section> }
function ModeChoices({ value, onChange }: { value: ChatMode; onChange: (mode: ChatMode) => void }) { return <div className="grid gap-2 sm:grid-cols-3">{(["docuquery", "llm", "hybrid"] as ChatMode[]).map(mode => <button key={mode} onClick={() => onChange(mode)} className={cn("rounded-lg border px-3 py-3 text-left text-sm capitalize", value === mode ? "border-blue-500 bg-blue-500/10 text-white" : "border-neutral-700 text-neutral-400 hover:border-neutral-500")}>{mode === "docuquery" ? "DocuQuery" : mode === "llm" ? "LLM" : "Hybrid"}</button>)}</div> }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex items-center justify-between border-b border-neutral-800 py-3 text-sm text-neutral-300 last:border-0"><span>{label}</span><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="h-4 w-4 accent-blue-600" /></label> }
function Info({ label, value }: { label: string; value?: string }) { return <div><p className="text-xs text-neutral-500">{label}</p><p className="mt-1 text-sm text-neutral-200">{value ?? "—"}</p></div> }

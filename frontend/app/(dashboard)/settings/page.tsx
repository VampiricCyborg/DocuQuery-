"use client"
import { useAuthStore } from "@/stores/auth.store"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"

export default function SettingsPage() {
  const user = useAuthStore(s => s.user)

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Settings</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Manage your account and preferences</p>
        </div>

        {/* Profile */}
        <Section title="Profile">
          <div className="flex items-center gap-4 mb-4">
            <Avatar name={user?.name} size="lg" />
            <div>
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-neutral-500">{user?.email}</p>
              <Badge variant="success" className="mt-1">{user?.plan} plan</Badge>
            </div>
          </div>
          <div className="space-y-3">
            <Field label="Name" defaultValue={user?.name} />
            <Field label="Email" defaultValue={user?.email} type="email" />
          </div>
          <Button className="mt-4" variant="secondary">Save changes</Button>
        </Section>

        {/* API Keys */}
        <Section title="API Keys">
          <Field label="OpenAI API Key" placeholder="sk-..." type="password" />
          <Field label="Pinecone API Key" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" type="password" />
          <Button className="mt-4" variant="secondary">Save keys</Button>
        </Section>

        {/* Danger */}
        <Section title="Danger Zone">
          <p className="text-sm text-neutral-500 mb-3">Permanently delete your account and all data.</p>
          <Button variant="destructive">Delete account</Button>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
      <h2 className="text-sm font-semibold text-white mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-neutral-400">{label}</label>
      <Input {...props} />
    </div>
  )
}

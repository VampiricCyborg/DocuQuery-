"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import toast from "react-hot-toast"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password) // mock: signup = login
      toast.success("Account created!")
      router.push("/chat")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { label: "Name", value: name, set: setName, type: "text", placeholder: "Your name" },
          { label: "Email", value: email, set: setEmail, type: "email", placeholder: "you@example.com" },
          { label: "Password", value: password, set: setPassword, type: "password", placeholder: "Min 8 characters" },
        ].map(({ label, value, set, type, placeholder }) => (
          <div key={label} className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">{label}</label>
            <Input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder} required />
          </div>
        ))}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>
      </form>
      <p className="mt-4 text-center text-xs text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">Sign in</Link>
      </p>
    </motion.div>
  )
}

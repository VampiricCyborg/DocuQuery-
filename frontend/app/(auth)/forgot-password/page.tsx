"use client"
import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    setSent(true)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {sent ? (
        <div className="text-center space-y-3">
          <CheckCircle className="h-10 w-10 text-green-400 mx-auto" />
          <p className="text-sm text-neutral-300">Check your email for a reset link.</p>
          <Link href="/login" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Back to sign in</Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-neutral-500 mb-4">Enter your email and we'll send a reset link.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400">Email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/login" className="flex items-center justify-center gap-1 text-xs text-neutral-500 hover:text-white transition-colors">
              <ArrowLeft className="h-3 w-3" /> Back to sign in
            </Link>
          </div>
        </>
      )}
    </motion.div>
  )
}

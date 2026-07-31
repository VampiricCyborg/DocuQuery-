import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types"

interface StoredAccount {
  user: User
  password: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  accounts: StoredAccount[]
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accounts: [],
      login: async (email, password) => {
        await new Promise(r => setTimeout(r, 500))
        const account = get().accounts.find(item => item.user.email.toLowerCase() === email.trim().toLowerCase())
        if (!account) throw new Error("No account found. Please sign up first.")
        if (account.password !== password) throw new Error("Incorrect password.")
        set({ user: account.user, isAuthenticated: true })
      },
      signup: async (name, email, password) => {
        await new Promise(r => setTimeout(r, 500))
        const normalizedEmail = email.trim().toLowerCase()
        if (get().accounts.some(item => item.user.email.toLowerCase() === normalizedEmail)) {
          throw new Error("An account already exists. Please sign in instead.")
        }
        if (password.length < 8) throw new Error("Password must be at least 8 characters.")
        const user: User = {
          id: crypto.randomUUID(),
          name: name.trim(),
          email: normalizedEmail,
          plan: "free",
          createdAt: new Date().toISOString(),
        }
        set(state => ({ accounts: [...state.accounts, { user, password }], user, isAuthenticated: true }))
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: "auth-store-v2" }
  )
)

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types"
import { MOCK_USER } from "@/services/mock"

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (_email, _password) => {
        await new Promise(r => setTimeout(r, 800))
        set({ user: MOCK_USER, isAuthenticated: true })
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: "auth-store" }
  )
)

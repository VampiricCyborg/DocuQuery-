import { create } from "zustand"
import type { Agent, VoiceState } from "@/types"

interface UIStore {
  theme: "light" | "dark"
  voiceState: VoiceState
  selectedAgent: Agent | null
  setTheme: (t: "light" | "dark") => void
  setVoiceState: (s: VoiceState) => void
  setSelectedAgent: (a: Agent | null) => void
}

export const useUIStore = create<UIStore>()((set) => ({
  theme: "dark",
  voiceState: "idle",
  selectedAgent: null,
  setTheme: (theme) => set({ theme }),
  setVoiceState: (voiceState) => set({ voiceState }),
  setSelectedAgent: (selectedAgent) => set({ selectedAgent }),
}))

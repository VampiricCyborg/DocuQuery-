import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ChatMode } from "@/types"

interface SettingsState {
  defaultMode: ChatMode
  showCitations: boolean
  autoExpandCitations: boolean
  retrievalCount: number
  set: <K extends keyof Omit<SettingsState, "set">>(key: K, value: SettingsState[K]) => void
}

export const useSettingsStore = create<SettingsState>()(persist((set) => ({
  defaultMode: "docuquery",
  showCitations: true,
  autoExpandCitations: false,
  retrievalCount: 5,
  set: (key, value) => set({ [key]: value } as Partial<SettingsState>),
}), { name: "docuquery-settings" }))

export const getDefaultChatMode = () => useSettingsStore.getState().defaultMode

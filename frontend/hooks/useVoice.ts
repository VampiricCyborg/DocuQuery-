"use client"
import { useCallback, useRef } from "react"
import { useUIStore } from "@/stores/ui.store"

export function useVoice(onTranscript: (text: string) => void) {
  const setVoiceState = useUIStore(s => s.setVoiceState)
  const voiceState = useUIStore(s => s.voiceState)
  type Recognition = { continuous: boolean; interimResults: boolean; onstart: () => void; onresult: (event: { results: { 0: { 0: { transcript: string } } } }) => void; onerror: () => void; onend: () => void; start: () => void; stop: () => void }
  type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition }
  const recognitionRef = useRef<Recognition | null>(null)

  const start = useCallback(() => {
    const speechWindow = window as SpeechWindow
    const SR = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
    if (!SR) return
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onstart = () => setVoiceState("listening")
    recognition.onresult = (e) => {
      const transcript: string = e.results[0][0].transcript
      onTranscript(transcript)
      setVoiceState("idle")
    }
    recognition.onerror = () => setVoiceState("idle")
    recognition.onend = () => setVoiceState("idle")
    recognitionRef.current = recognition
    recognition.start()
  }, [onTranscript, setVoiceState])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setVoiceState("idle")
  }, [setVoiceState])

  return { voiceState, start, stop }
}

"use client"
import { useState, useCallback, useRef } from "react"
import { useUIStore } from "@/stores/ui.store"

export function useVoice(onTranscript: (text: string) => void) {
  const setVoiceState = useUIStore(s => s.setVoiceState)
  const voiceState = useUIStore(s => s.voiceState)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  const start = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onstart = () => setVoiceState("listening")
    recognition.onresult = (e: any) => {
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

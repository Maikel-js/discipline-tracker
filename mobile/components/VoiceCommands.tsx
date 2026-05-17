import { useState, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, Platform } from "react-native"
import * as Speech from "expo-speech"
import { ExpoWebSpeechRecognition } from "expo-speech-recognition"
import { useStore } from "../shared/store"

const recognition = new ExpoWebSpeechRecognition()
recognition.lang = "es-ES"
recognition.continuous = false
recognition.interimResults = false
recognition.maxAlternatives = 1

export default function VoiceCommands() {
  const { habits, completeHabit, addTask, toggleExtremeMode, togglePunishmentMode } = useStore()
  const [isListening, setIsListening] = useState(false)
  const [lastCommand, setLastCommand] = useState<string | null>(null)
  const [recognizedText, setRecognizedText] = useState("")
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognition.onresult = (e: any) => {
      if (e.results && e.results.length > 0) {
        const result = e.results[0]
        if (result.length > 0) {
          const text = result[0].transcript.toLowerCase()
          setRecognizedText(text)
          processCommand(text)
        }
      }
    }

    return () => {
      recognition.abort()
      recognition.onstart = null
      recognition.onend = null
      recognition.onerror = null
      recognition.onresult = null
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const speak = (text: string) => {
    Speech.speak(text, { language: "es-ES" })
  }

  const processCommand = (text: string) => {
    const lower = text.toLowerCase()

    if (lower.includes("completar") || lower.includes("hecho") || lower.includes("listo")) {
      const habitName = extractHabitName(lower, habits.map(h => h.name))
      if (habitName) {
        const habit = habits.find(h => h.name.toLowerCase().includes(habitName))
        if (habit) {
          completeHabit(habit.id)
          setLastCommand(`Completado: ${habit.name}`)
          speak(`Perfecto, completado ${habit.name}`)
          return
        }
      }
    }

    if (lower.includes("nueva tarea") || lower.includes("crear tarea")) {
      const taskMatch = text.match(/tarea[:\s]+(.+)/i)
      if (taskMatch) {
        addTask({
          title: taskMatch[1].trim(),
          priority: "medium",
          status: "todo",
          allowReset: false,
          subtasks: [],
          dependencies: [],
          reminders: [],
          prerequisites: [],
        })
        setLastCommand(`Tarea creada: ${taskMatch[1].trim()}`)
        speak(`Tarea creada: ${taskMatch[1].trim()}`)
        return
      }
    }

    if (lower.includes("modo extremo") || lower.includes("disciplina extrema")) {
      toggleExtremeMode()
      setLastCommand("Modo Extremo activado")
      speak("Modo extremo activado")
      return
    }

    if (lower.includes("modo castigo") || lower.includes("castigo")) {
      togglePunishmentMode()
      setLastCommand("Modo Castigo activado")
      speak("Modo castigo activado")
      return
    }

    if (lower.includes("puntaje") || lower.includes("puntos")) {
      const state = useStore.getState()
      speak(`Tu puntaje actual es ${state.stats.disciplinaryScore} puntos`)
      setLastCommand(`Puntaje: ${state.stats.disciplinaryScore}`)
    }
  }

  const extractHabitName = (text: string, habitNames: string[]): string | null => {
    for (const name of habitNames) {
      if (text.includes(name.toLowerCase())) {
        return name
      }
    }
    return null
  }

  const toggleListening = async () => {
    if (isListening) {
      recognition.stop()
      setIsListening(false)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    } else {
      setRecognizedText("")
      setLastCommand(null)
      try {
        recognition.start()
        timeoutRef.current = setTimeout(() => {
          recognition.stop()
        }, 10000)
      } catch {
        speak("Reconocimiento de voz no disponible en este dispositivo")
      }
    }
  }

  return (
    <View className="absolute bottom-24 left-4 z-40">
      <TouchableOpacity
        onPress={toggleListening}
        className={`p-3 rounded-full shadow-lg ${isListening ? "bg-blue-600" : "bg-gray-800"}`}
      >
        <Text className="text-xl">{isListening ? "🎤" : "🎙️"}</Text>
      </TouchableOpacity>
      {isListening && (
        <View className="absolute left-14 bottom-2 bg-blue-900/50 border border-blue-500 rounded-lg p-2 min-w-40">
          <Text className="text-blue-400 text-xs">Escuchando...</Text>
        </View>
      )}
      {lastCommand && !isListening && (
        <View className="absolute left-14 bottom-2 bg-green-900/50 border border-green-500 rounded-lg p-2 min-w-40">
          <Text className="text-green-400 text-sm">{lastCommand}</Text>
        </View>
      )}
    </View>
  )
}

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { useStore } from "../shared/store"

interface Props {
  taskId?: string
  habitId?: string
  onComplete?: () => void
}

export default function PomodoroTimer({ taskId, habitId, onComplete }: Props) {
  const settings = useStore((s) => s.settings)
  const startPomodoro = useStore((s) => s.startPomodoro)
  const endPomodoro = useStore((s) => s.endPomodoro)
  const [isRunning, setIsRunning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(
    (settings.pomodoroLength || 25) * 60
  )
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => s - 1)
      }, 1000)
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false)
      if (sessionId) {
        endPomodoro(sessionId, true)
      }
      if (onComplete) onComplete()
    }
    return () => clearInterval(interval)
  }, [isRunning, secondsLeft, sessionId, endPomodoro, onComplete])

  const handleStart = () => {
    startPomodoro(taskId, habitId)
    const sessions = useStore.getState().pomodoroSessions
    setSessionId(sessions[sessions.length - 1]?.id || null)
    setIsRunning(true)
  }

  const handlePause = () => setIsRunning(false)

  const handleReset = () => {
    if (sessionId) {
      endPomodoro(sessionId, false)
    }
    setIsRunning(false)
    setSecondsLeft((settings.pomodoroLength || 25) * 60)
    setSessionId(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
  }

  const pomodoroMinutes = settings.pomodoroLength || 25
  const progress =
    ((pomodoroMinutes * 60 - secondsLeft) / (pomodoroMinutes * 60)) * 100

  return (
    <View className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg">🍅</Text>
          <Text className="text-white font-medium">Pomodoro</Text>
        </View>
        <Text className="text-gray-400 text-xs">
          {pomodoroMinutes} min trabajo / {settings.breakLength || 5} min
          descanso
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-4xl font-bold text-center text-white">
          {formatTime(secondsLeft)}
        </Text>
        <View className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
          <View
            className="h-full bg-red-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </View>
      </View>

      <View className="flex-row gap-2">
        {!isRunning ? (
          <TouchableOpacity
            onPress={handleStart}
            className="flex-1 py-2 bg-green-600 rounded-lg items-center"
          >
            <Text className="text-white font-semibold">▶ Iniciar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handlePause}
            className="flex-1 py-2 bg-yellow-600 rounded-lg items-center"
          >
            <Text className="text-white font-semibold">⏸ Pausar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleReset}
          className="p-2 bg-gray-600 rounded-lg items-center justify-center"
        >
          <Text className="text-white font-semibold">⏹</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

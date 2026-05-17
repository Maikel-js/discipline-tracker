import { useEffect, useState, useRef } from "react"
import { View, Text, TouchableOpacity, Vibration } from "react-native"
import { Audio } from "expo-av"
import { useStore } from "../shared/store"
import type { NotificationLevel, Habit } from "../shared/types"

interface Props {
  habit: Habit
}

const notificationMessages: Record<NotificationLevel, { title: string; message: string }> = {
  1: { title: "Recordatorio", message: "¡No olvides completar tu hábito!" },
  2: { title: "Recordatorio Urgente", message: "Ya pasaron 5 minutos. ¡Fecha límite cercana!" },
  3: { title: "Repetición", message: "Aún no completado. ¡Debes hacerlo!" },
  4: { title: "ALARMA", message: "⚠️ ALARMA SONORA ACTIVADA" },
  5: { title: "MODO EXTREMO", message: "⚠️ BLOQUEO TOTAL ⚠️" },
}

const ALARM_BASE64 =
  "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0Y"

export default function NotificationSystem({ habit }: Props) {
  const {
    settings,
    notifications,
    addNotification,
    acknowledgeNotification,
    completeHabit,
  } = useStore()

  const [showModal, setShowModal] = useState(false)
  const [currentLevel, setCurrentLevel] = useState<NotificationLevel>(1)
  const soundRef = useRef<Audio.Sound | null>(null)

  const habitNotifications = notifications.filter(
    (n) => n.habitId === habit.id && !n.acknowledged
  )
  const maxLevel =
    habitNotifications.length > 0
      ? Math.max(...habitNotifications.map((n) => n.level))
      : 0

  useEffect(() => {
    if (habit.status !== "pending") return

    const isExtreme = settings.extremeMode
    const isPunishment = settings.punishmentMode
    const thresholds = isExtreme
      ? [0, 1, 2, 3, 5]
      : isPunishment
        ? [0, 3, 5, 10, 15]
        : [0, 5, 10, 15, 20]

    const checkPending = () => {
      const scheduledTime = new Date(habit.scheduledTime)
      const now = new Date()
      const diffMinutes = (now.getTime() - scheduledTime.getTime()) / (1000 * 60)

      if (diffMinutes >= thresholds[0] && diffMinutes < thresholds[1] && maxLevel < 1) {
        addNotification(habit.id, 1)
        setCurrentLevel(1)
      } else if (diffMinutes >= thresholds[1] && diffMinutes < thresholds[2] && maxLevel < 2) {
        addNotification(habit.id, 2)
        setCurrentLevel(2)
      } else if (diffMinutes >= thresholds[2] && diffMinutes < thresholds[3] && maxLevel < 3) {
        addNotification(habit.id, 3)
        setCurrentLevel(3)
        setShowModal(true)
      } else if (diffMinutes >= thresholds[3] && diffMinutes < thresholds[4] && maxLevel < 4) {
        addNotification(habit.id, 4)
        setCurrentLevel(4)
        playAlarm()
        setShowModal(true)
      } else if (diffMinutes >= thresholds[4] && maxLevel < 5) {
        addNotification(habit.id, 5)
        setCurrentLevel(5)
        playAlarm()
        setShowModal(true)
      }
    }

    const intervalTime = isExtreme ? 10000 : isPunishment ? 20000 : 30000
    const interval = setInterval(checkPending, intervalTime)
    checkPending()

    return () => {
      clearInterval(interval)
      stopAlarm()
    }
  }, [habit, maxLevel, settings])

  const playAlarm = async () => {
    if (!settings.soundEnabled) return
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync()
      } else {
        const { sound } = await Audio.Sound.createAsync(
          { uri: ALARM_BASE64 },
          { shouldPlay: true, isLooping: true }
        )
        soundRef.current = sound
      }
      if (settings.vibrationEnabled) {
        Vibration.vibrate([500, 200, 500, 200, 500])
      }
    } catch {}
  }

  const stopAlarm = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync()
      await soundRef.current.unloadAsync()
      soundRef.current = null
    }
    Vibration.cancel()
  }

  const handleComplete = async () => {
    await stopAlarm()
    completeHabit(habit.id)
    setShowModal(false)
  }

  const handleAcknowledge = () => {
    if (habitNotifications[0]) {
      acknowledgeNotification(habitNotifications[0].id)
    }
    setShowModal(false)
  }

  if (!showModal) return null

  return (
    <View className="absolute inset-0 z-50 items-center justify-center bg-black/80">
      <View
        className={`bg-gray-900 border-2 rounded-2xl p-8 max-w-md w-full mx-4 items-center ${
          currentLevel >= 4 ? "border-red-500" : "border-orange-500"
        }`}
      >
        <Text className="text-5xl mb-4">
          {currentLevel === 5
            ? "🛡️"
            : currentLevel === 4
              ? "🔊"
              : currentLevel >= 3
                ? "📳"
                : "⚠️"}
        </Text>

        <Text
          className={`text-2xl font-bold mb-2 ${
            currentLevel >= 4 ? "text-red-500" : "text-orange-500"
          }`}
        >
          {notificationMessages[currentLevel as NotificationLevel].title}
        </Text>
        <Text className="text-gray-300 mb-4">{habit.name}</Text>
        <Text className="text-gray-400 mb-6">
          {notificationMessages[currentLevel as NotificationLevel].message}
        </Text>

        <TouchableOpacity
          onPress={handleComplete}
          className="w-full py-4 bg-green-600 rounded-xl items-center mb-3"
        >
          <Text className="text-white font-bold text-lg">✓ Completar Ahora</Text>
        </TouchableOpacity>

        {currentLevel < 4 && (
          <TouchableOpacity
            onPress={handleAcknowledge}
            className="w-full py-3 bg-gray-700 rounded-xl items-center"
          >
            <Text className="text-white">Recordar más tarde</Text>
          </TouchableOpacity>
        )}

        {currentLevel >= 4 && (
          <Text className="text-red-400 text-xs mt-4">
            ⚠️ No puedes posponer sin completar
          </Text>
        )}
      </View>
    </View>
  )
}

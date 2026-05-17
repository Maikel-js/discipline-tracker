import { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, Alert } from "react-native"
import { useStore } from "../shared/store"

interface Recommendation {
  id: string
  type: "time_change" | "schedule_adjust" | "abandoned" | "pattern"
  title: string
  description: string
  action: string
}

export default function SmartTracker() {
  const { habits, logs, updateHabit } = useStore()
  const deleteHabit = useStore((s) => s.deleteHabit)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  useEffect(() => {
    const analyzePatterns = () => {
      const recs: Recommendation[] = []

      habits.forEach((habit) => {
        const habitLogs = logs.filter((l) => l.habitId === habit.id)
        const missedLogs = habitLogs.filter((l) => l.status === "missed")

        if (missedLogs.length >= 3) {
          recs.push({
            id: `abandoned-${habit.id}`,
            type: "abandoned",
            title: "Hábito abandonado detectado",
            description: `"${habit.name}" ha sido incumplido ${missedLogs.length} veces.`,
            action: "Considera eliminarlo o reducir su dificultad.",
          })
        }

        const hours = missedLogs.map(
          (l) => new Date(l.completedAt).getHours()
        )
        const hourCounts: Record<number, number> = {}
        hours.forEach((h) => (hourCounts[h] = (hourCounts[h] || 0) + 1))

        const failingHour = Object.entries(hourCounts).sort(
          ([, a], [, b]) => b - a
        )[0]

        if (failingHour && parseInt(failingHour[0]) >= 18) {
          const suggestedTime = parseInt(failingHour[0]) - 2
          recs.push({
            id: `time-${habit.id}`,
            type: "time_change",
            title: "Ajuste de horario recomendado",
            description: `Sueles fallar "${habit.name}" a las ${failingHour[0]}:00.`,
            action: `¿Cambiar la hora a las ${suggestedTime}:00?`,
          })
        }

        if (habit.currentStreak > habit.streakGoal * 2) {
          recs.push({
            id: `success-${habit.id}`,
            type: "schedule_adjust",
            title: "¡Excelente progreso!",
            description: `Llevas ${habit.currentStreak} días con "${habit.name}".`,
            action: "Considera aumentar la meta de rachas.",
          })
        }
      })

      setRecommendations(recs)
    }

    analyzePatterns()
  }, [logs, habits])

  const handleAction = (rec: Recommendation) => {
    if (rec.type === "time_change") {
      const habitId = rec.id.replace("time-", "")
      const habit = habits.find((h) => h.id === habitId)
      if (habit) {
        const currentHour = parseInt(habit.scheduledTime.split(":")[0])
        const newTime = `${currentHour - 2}:00`
        updateHabit(habitId, { scheduledTime: newTime })
      }
    } else if (rec.type === "abandoned") {
      const habitId = rec.id.replace("abandoned-", "")
      Alert.alert("Eliminar hábito", "¿Eliminar este hábito?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteHabit(habitId),
        },
      ])
    }
  }

  if (recommendations.length === 0) return null

  return (
    <View className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mt-6">
      <View className="flex-row items-center gap-2 mb-4">
        <Text className="text-lg">💡</Text>
        <Text className="font-semibold text-white">
          Análisis Inteligente
        </Text>
      </View>

      <View className="gap-3">
        {recommendations.map((rec) => (
          <View
            key={rec.id}
            className={`p-3 rounded-lg border ${
              rec.type === "abandoned"
                ? "bg-red-900/20 border-red-500/30"
                : rec.type === "time_change"
                  ? "bg-orange-900/20 border-orange-500/30"
                  : rec.type === "schedule_adjust"
                    ? "bg-green-900/20 border-green-500/30"
                    : "bg-gray-700/50 border-gray-600"
            }`}
          >
            <View className="flex-row justify-between">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-sm font-medium text-white">
                    {rec.title}
                  </Text>
                </View>
                <Text className="text-xs text-gray-400">
                  {rec.description}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  {rec.action}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleAction(rec)}
                className="p-2"
              >
                <Text className="text-gray-400">→</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native"
import { useStore } from "../shared/store"
import type { AIRecommendation, Prediction } from "../shared/types"

const DAYS_ES = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
]

export default function AICoach() {
  const { habits, logs } = useStore()
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    analyzeBehavior()
    generatePredictions()
  }, [habits, logs])

  const analyzeBehavior = () => {
    const newRecs: AIRecommendation[] = []

    const dayStats = new Map<
      string,
      { completed: number; missed: number }
    >()
    const hourStats = new Map<
      number,
      { completed: number; missed: number }
    >()

    logs.forEach((log) => {
      const date = new Date(log.completedAt)
      const day = DAYS_ES[date.getDay()]
      const hour = date.getHours()

      const dayData = dayStats.get(day) || { completed: 0, missed: 0 }
      if (log.status === "completed") dayData.completed++
      else dayData.missed++
      dayStats.set(day, dayData)

      const hourData = hourStats.get(hour) || { completed: 0, missed: 0 }
      if (log.status === "completed") hourData.completed++
      else hourData.missed++
      hourStats.set(hour, hourData)
    })

    let worstDay = ""
    let worstDayMissRate = 0
    dayStats.forEach((data, day) => {
      const total = data.completed + data.missed
      const missRate = total > 0 ? data.missed / total : 0
      if (missRate > worstDayMissRate && total > 2) {
        worstDayMissRate = missRate
        worstDay = day
      }
    })

    if (worstDay) {
      newRecs.push({
        id: Math.random().toString(36).substr(2, 9),
        type: "schedule",
        message: `Estás fallando los ${worstDay}s. Considera mover esos hábitos a otra hora o día.`,
        confidence: Math.round(worstDayMissRate * 100),
        action: "recomendar_horario",
        createdAt: new Date().toISOString(),
      })
    }

    let bestHour = 0
    let bestHourRate = 0
    hourStats.forEach((data, hour) => {
      const total = data.completed + data.missed
      const completeRate = total > 0 ? data.completed / total : 0
      if (completeRate > bestHourRate && total > 2) {
        bestHourRate = completeRate
        bestHour = hour
      }
    })

    if (bestHour > 0) {
      newRecs.push({
        id: Math.random().toString(36).substr(2, 9),
        type: "time",
        message: `Tu mejor hora es ${bestHour}:00. Schedula hábitos importantes a esa hora.`,
        confidence: Math.round(bestHourRate * 100),
        createdAt: new Date().toISOString(),
      })
    }

    const missedHabits = habits.filter((h) => h.missedCount >= 3)
    if (missedHabits.length > 0) {
      newRecs.push({
        id: Math.random().toString(36).substr(2, 9),
        type: "habit",
        message: `Has fallado "${missedHabits[0].name}" 3+ veces. ¿Querés eliminarlo o cambiar el horario?`,
        confidence: 80,
        createdAt: new Date().toISOString(),
      })
    }

    setRecommendations(newRecs)
  }

  const generatePredictions = () => {
    const newPredictions: Prediction[] = []

    habits.forEach((habit) => {
      if (habit.status !== "pending") return

      const todayLogs = logs.filter(
        (l) =>
          l.habitId === habit.id &&
          l.completedAt.startsWith(new Date().toISOString().split("T")[0])
      )

      if (todayLogs.length === 0) {
        let probability = 50
        const factors: string[] = []

        if (habit.currentStreak === 0) {
          probability -= 20
          factors.push("RACHA: 0")
        }

        if (habit.missedCount >= 2) {
          probability -= 15
          factors.push("FALLOS RECIENTES")
        }

        probability = Math.max(5, Math.min(95, probability))

        newPredictions.push({
          id: habit.id,
          habitId: habit.id,
          probability,
          factors,
          lastUpdated: new Date().toISOString(),
        })
      }
    })

    setPredictions(newPredictions)
  }

  const lowProbHabits = predictions.filter((p) => p.probability < 40)

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowPanel(true)}
        className={`p-3 rounded-full shadow-lg ${
          lowProbHabits.length > 0
            ? "bg-purple-600"
            : "bg-gray-800"
        }`}
      >
        <Text className="text-xl">🧠</Text>
      </TouchableOpacity>

      <Modal visible={showPanel} transparent animationType="slide">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowPanel(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-4 max-h-[70vh]"
          >
            <View className="flex-row items-center gap-2 mb-4">
              <Text className="text-lg">✨</Text>
              <Text className="text-lg font-bold text-white">
                AI Coach
              </Text>
            </View>

            <ScrollView>
              {predictions.length > 0 ? (
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-400 mb-2">
                    📈 Predicciones
                  </Text>
                  <View className="gap-2">
                    {predictions.slice(0, 5).map((pred) => {
                      const habit = habits.find(
                        (h) => h.id === pred.habitId
                      )
                      const color =
                        pred.probability > 70
                          ? "text-green-400"
                          : pred.probability > 40
                            ? "text-yellow-400"
                            : "text-red-400"
                      return (
                        <View
                          key={pred.id}
                          className="bg-gray-800 rounded-lg p-3"
                        >
                          <View className="flex-row justify-between items-center mb-1">
                            <Text className="text-white text-sm">
                              {habit?.name}
                            </Text>
                            <Text className={`font-bold ${color}`}>
                              {pred.probability}%
                            </Text>
                          </View>
                          <View className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <View
                              className={`h-full rounded-full ${
                                pred.probability > 70
                                  ? "bg-green-500"
                                  : pred.probability > 40
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                              style={{ width: `${pred.probability}%` }}
                            />
                          </View>
                        </View>
                      )
                    })}
                  </View>
                </View>
              ) : null}

              {recommendations.length > 0 ? (
                <View>
                  <Text className="text-sm font-medium text-gray-400 mb-2">
                    🎯 Recomendaciones
                  </Text>
                  <View className="gap-2">
                    {recommendations.map((rec) => (
                      <View
                        key={rec.id}
                        className="bg-gray-800 rounded-lg p-3 border-l-2 border-purple-500"
                      >
                        <Text className="text-white text-sm">
                          {rec.message}
                        </Text>
                        <Text className="text-xs text-gray-500 mt-1">
                          {rec.confidence}% confianza
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {recommendations.length === 0 &&
              predictions.length === 0 ? (
                <Text className="text-gray-500 text-center py-4">
                  Completa hábitos para obtener recomendaciones
                  personalizadas.
                </Text>
              ) : null}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  )
}

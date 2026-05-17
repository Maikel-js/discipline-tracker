import { View, Text, ScrollView } from "react-native"
import { useStore } from "../shared/store"

export default function AnalyticsScreen() {
  const stats = useStore((s) => s.stats)
  const habits = useStore((s) => s.habits)
  const logs = useStore((s) => s.logs)
  const patternInsights = useStore((s) => s.patternInsights)

  const today = new Date().toISOString().split("T")[0]
  const todayLogs = logs.filter((l) => l.completedAt.startsWith(today))
  const completedToday = todayLogs.filter((l) => l.status === "completed").length
  const missedToday = todayLogs.filter((l) => l.status === "missed").length

  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="p-4 pt-12">
        <Text className="text-2xl font-bold text-white mb-6">
          Analíticas
        </Text>

        <View className="flex-row flex-wrap gap-3 mb-6">
          <View className="flex-1 min-w-[45%] bg-gray-800 rounded-xl p-4">
            <Text className="text-gray-400 text-xs mb-1">
              Puntuación
            </Text>
            <Text className="text-purple-400 text-2xl font-bold">
              {stats.disciplinaryScore}
            </Text>
          </View>
          <View className="flex-1 min-w-[45%] bg-gray-800 rounded-xl p-4">
            <Text className="text-gray-400 text-xs mb-1">Nivel</Text>
            <Text className="text-green-400 text-2xl font-bold">
              {stats.level}
            </Text>
          </View>
          <View className="flex-1 min-w-[45%] bg-gray-800 rounded-xl p-4">
            <Text className="text-gray-400 text-xs mb-1">Hoy</Text>
            <Text className="text-blue-400 text-2xl font-bold">
              {completedToday}
              <Text className="text-gray-500 text-lg">
                {" "}/ {completedToday + missedToday}
              </Text>
            </Text>
          </View>
          <View className="flex-1 min-w-[45%] bg-gray-800 rounded-xl p-4">
            <Text className="text-gray-400 text-xs mb-1">
              Racha general
            </Text>
            <Text className="text-yellow-400 text-2xl font-bold">
              {stats.currentStreak} días
            </Text>
          </View>
        </View>

        <Text className="text-lg font-semibold text-white mb-3">
          Hábitos
        </Text>
        <View className="bg-gray-800 rounded-xl p-4 mb-6">
          {habits.length === 0 ? (
            <Text className="text-gray-500">
              No hay hábitos registrados
            </Text>
          ) : (
            habits.map((h) => (
              <View
                key={h.id}
                className="flex-row items-center justify-between py-2 border-b border-gray-700 last:border-b-0"
              >
                <Text className="text-gray-200 flex-1">{h.name}</Text>
                <View className="flex-row items-center gap-3">
                  <Text className="text-yellow-400 text-sm">
                    {h.currentStreak}
                  </Text>
                  <Text
                    className={`text-sm ${
                      h.completionRate >= 70
                        ? "text-green-400"
                        : h.completionRate >= 40
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {h.completionRate}%
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {patternInsights.length > 0 ? (
          <>
            <Text className="text-lg font-semibold text-white mb-3">
              Insights
            </Text>
            <View className="bg-gray-800 rounded-xl p-4 mb-6">
              {patternInsights.map((insight) => (
                <View
                  key={insight.id}
                  className="py-2 border-b border-gray-700 last:border-b-0"
                >
                  <Text className="text-gray-200">{insight.message}</Text>
                  <Text className="text-purple-400 text-sm">
                    {insight.value}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </View>
    </ScrollView>
  )
}

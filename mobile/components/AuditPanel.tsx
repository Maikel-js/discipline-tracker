import { View, Text } from "react-native"
import { useStore } from "../shared/store"

export default function AuditPanel() {
  const { auditLogs, detectAbandonedHabits, patternInsights, disciplineHistory } =
    useStore()
  const abandonedHabits = detectAbandonedHabits()
  const recentLogs = [...auditLogs]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 20)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "completed":
        return "✅"
      case "missed":
        return "❌"
      case "rescheduled":
        return "🕐"
      case "penalty":
        return "⚠️"
      default:
        return "•"
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "completed":
        return "Completado"
      case "missed":
        return "Incumplido"
      case "rescheduled":
        return "Reprogramado"
      case "penalty":
        return "Penalización"
      default:
        return action
    }
  }

  return (
    <View className="gap-6">
      <View>
        <Text className="text-lg font-semibold text-white mb-4">
          🗑 Historial de Auditoría
        </Text>

        {abandonedHabits.length > 0 ? (
          <View className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
            <Text className="text-red-400 text-sm mb-2">
              ⚠️ Hábitos en riesgo de abandono
            </Text>
            {abandonedHabits.map((h) => (
              <Text key={h.id} className="text-sm text-gray-300">
                • {h.name} (incumplidos: {h.missedCount})
              </Text>
            ))}
          </View>
        ) : null}

        {recentLogs.length === 0 ? (
          <Text className="text-center text-gray-500 py-8">
            No hay registros de auditoría
          </Text>
        ) : (
          <View className="gap-2">
            {recentLogs.map((log) => (
              <View
                key={log.id}
                className="flex-row items-center gap-3 p-2 bg-gray-800/50 rounded-lg"
              >
                <Text>{getActionIcon(log.action)}</Text>
                <View className="flex-1">
                  <Text className="text-sm text-white">{log.habitName}</Text>
                  {log.details ? (
                    <Text className="text-xs text-gray-500">
                      {log.details}
                    </Text>
                  ) : null}
                </View>
                <Text className="text-xs text-gray-500">
                  {formatDate(log.timestamp)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {patternInsights.length > 0 ? (
        <View>
          <Text className="text-lg font-semibold text-white mb-4">
            📊 Insights de Patrones
          </Text>
          <View className="gap-2">
            {patternInsights.map((insight) => (
              <View
                key={insight.id}
                className="p-3 bg-gray-800/50 rounded-lg"
              >
                <Text className="text-sm text-gray-400">
                  {insight.message}
                </Text>
                <Text className="text-lg font-medium text-white">
                  {insight.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {disciplineHistory.length > 0 ? (
        <View>
          <Text className="text-lg font-semibold text-white mb-4">
            Historial de Puntuación
          </Text>
          <View className="gap-2">
            {disciplineHistory
              .slice(-10)
              .reverse()
              .map((entry) => (
                <View
                  key={entry.id}
                  className="flex-row items-center justify-between p-2 bg-gray-800/50 rounded-lg"
                >
                  <View className="flex-1">
                    <Text className="text-sm text-white">{entry.reason}</Text>
                    <Text className="text-xs text-gray-500">
                      {formatDate(entry.date)}
                    </Text>
                  </View>
                  <Text
                    className={`text-sm font-medium ${
                      entry.score >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {entry.score > 0 ? "+" : ""}
                    {entry.score}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      ) : null}
    </View>
  )
}

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native"
import { useStore } from "../shared/store"

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6)

export default function AutoScheduler() {
  const { habits, tasks, logs, addDisciplineScore } = useStore()
  const [selectedDate] = useState(new Date().toISOString().split("T")[0])
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<any[]>([])

  const consistencyScore = Math.min(
    100,
    Math.round(
      (logs.filter(l => {
        const diff = Date.now() - new Date(l.completedAt).getTime()
        return diff < 7 * 24 * 60 * 60 * 1000
      }).length /
        7) *
        100
    )
  )

  const weekLogs = logs.filter(l => {
    const diff = Date.now() - new Date(l.completedAt).getTime()
    return diff < 7 * 24 * 60 * 60 * 1000
  })
  const procrastinationIndex = weekLogs.length > 0
    ? Math.round((weekLogs.filter(l => l.status === "missed").length / weekLogs.length) * 100)
    : 0

  const generateDailyPlan = () => {
    return habits
      .filter(h => h.status !== "completed")
      .slice(0, 4)
      .map((habit, idx) => ({
        id: `block-${idx}`,
        title: habit.name,
        startHour: 6 + idx * 2,
        color:
          idx === 0
            ? "#ef4444"
            : idx === 1
              ? "#f97316"
              : idx === 2
                ? "#eab308"
                : "#22c55e",
        completed: false,
      }))
  }

  const [planBlocks, setPlanBlocks] = useState(generateDailyPlan)

  useEffect(() => {
    setPlanBlocks(generateDailyPlan())
  }, [habits, tasks])

  const toggleBlock = (blockId: string) => {
    setPlanBlocks(prev =>
      prev.map(b =>
        b.id === blockId ? { ...b, completed: !b.completed } : b
      )
    )
    const block = planBlocks.find(b => b.id === blockId)
    if (block && !block.completed) {
      addDisciplineScore(5, `Completó bloque: ${block.title}`)
    }
  }

  const trend =
    consistencyScore > 70
      ? { icon: "📈", color: "text-green-400" }
      : consistencyScore > 40
        ? { icon: "➡️", color: "text-yellow-400" }
        : { icon: "📉", color: "text-red-400" }

  return (
    <ScrollView className="gap-4">
      <View className="flex-row flex-wrap gap-2">
        <MiniStat label="Consistencia" value={`${consistencyScore}%`} icon={trend.icon} color={trend.color} />
        <MiniStat label="Procrastinación" value={`${procrastinationIndex}%`} icon="😴" color="text-yellow-400" />
        <MiniStat label="H. Efectivas" value={`${weekLogs.length * 0.5}h`} icon="⏰" color="text-blue-400" />
        <MiniStat label="Productividad" value={`${weekLogs.length}`} icon="📈" color="text-purple-400" />
      </View>

      <View className="bg-gray-800/50 rounded-xl p-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-semibold text-white">⏰ Time Blocking</Text>
          <TouchableOpacity
            onPress={() => setShowHistory(!showHistory)}
            className={`px-2 py-1 rounded ${showHistory ? "bg-blue-600" : "bg-gray-700"}`}
          >
            <Text className="text-white text-xs">📋 Historial</Text>
          </TouchableOpacity>
        </View>

        <View className="gap-1">
          {HOURS.map(hour => {
            const block = planBlocks.find(b => b.startHour === hour)
            return (
              <View key={hour} className="flex-row items-center gap-2">
                <Text className="text-xs text-gray-500 w-12">
                  {hour}:00
                </Text>
                {block ? (
                  <TouchableOpacity
                    onPress={() => toggleBlock(block.id)}
                    className={`flex-1 p-2 rounded-lg ${
                      block.completed
                        ? "bg-green-900/50 border border-green-500"
                        : "bg-gray-700 border border-gray-600"
                    }`}
                    style={{ borderLeftColor: block.color, borderLeftWidth: 3 }}
                  >
                    <Text
                      className={`text-sm ${
                        block.completed ? "text-green-400 line-through" : "text-white"
                      }`}
                    >
                      {block.title}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View className="flex-1 p-2 bg-gray-900/30 rounded-lg">
                    <Text className="text-sm text-gray-600">Libre</Text>
                  </View>
                )}
              </View>
            )
          })}
        </View>
      </View>

      {showHistory && (
        <View className="bg-gray-800/50 rounded-xl p-4 max-h-64">
          <Text className="font-semibold text-white mb-3">📋 Historial</Text>
          {history.length === 0 ? (
            <Text className="text-gray-500 text-sm text-center py-4">
              No hay historial
            </Text>
          ) : (
            history.map((entry: any) => (
              <View key={entry.id} className="flex-row justify-between py-1">
                <Text className="text-sm text-white">{entry.action}</Text>
                <Text className="text-xs text-gray-500">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  )
}

function MiniStat({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string
  icon: string
  color: string
}) {
  return (
    <View className="flex-1 min-w-[45%] bg-gray-800/50 rounded-lg p-3">
      <View className="flex-row items-center gap-1 mb-1">
        <Text>{icon}</Text>
        <Text className="text-gray-400 text-xs">{label}</Text>
      </View>
      <Text className={`text-lg font-bold ${color}`}>{value}</Text>
    </View>
  )
}

import { useMemo } from "react"
import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import { useStore } from "../shared/store"
import { format, subDays, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"

const COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6"]

export default function StatsDashboard() {
  const { habits, tasks, logs, stats, disciplineHistory, goals, protocols } = useStore()

  const completionData = useMemo(() => {
    const completed = habits.filter(h => h.status === "completed").length
    const pending = habits.filter(h => h.status === "pending").length
    const missed = habits.filter(h => h.status === "missed").length
    const total = completed + pending + missed
    return [
      { name: "Completados", value: completed, color: "#22c55e" },
      { name: "Pendientes", value: pending, color: "#f59e0b" },
      { name: "Fallados", value: missed, color: "#ef4444" },
    ].filter(d => d.value > 0)
  }, [habits])

  const weeklyData = useMemo(() => {
    const last7 = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() })
    return last7.map(day => {
      const dayStr = format(day, "yyyy-MM-dd")
      const dayLogs = logs.filter(l => l.completedAt.startsWith(dayStr))
      return {
        date: format(day, "EEE", { locale: es }),
        completados: dayLogs.filter(l => l.status === "completed").length,
        fallados: dayLogs.filter(l => l.status === "missed").length,
      }
    })
  }, [logs])

  const maxWeekly = useMemo(
    () => Math.max(1, ...weeklyData.map(d => d.completados + d.fallados)),
    [weeklyData]
  )

  const categoryData = useMemo(() => {
    const cats: Record<string, { total: number; completed: number }> = {}
    habits.forEach(h => {
      if (!cats[h.category]) cats[h.category] = { total: 0, completed: 0 }
      cats[h.category].total++
      if (h.status === "completed") cats[h.category].completed++
    })
    return Object.entries(cats).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      total: data.total,
      completados: data.completed,
      tasa: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    }))
  }, [habits])

  return (
    <ScrollView className="gap-6">
      <View className="flex-row flex-wrap gap-4">
        <StatCard label="Puntuación" value={stats.disciplinaryScore} icon="📈" color="text-blue-400" />
        <StatCard label="Racha Actual" value={`${stats.currentStreak}d`} icon="🎯" color="text-green-400" />
        <StatCard label="Tasa" value={`${stats.completionRate}%`} icon="✅" color="text-purple-400" />
        <StatCard label="Hábitos Hoy" value={`${stats.completedToday}/${stats.totalHabits}`} icon="📅" color="text-yellow-400" />
      </View>

      <View className="bg-gray-800 p-4 rounded-xl">
        <Text className="text-white font-bold mb-4">📊 Distribución de Hábitos</Text>
        <View className="gap-2">
          {completionData.map((d, i) => (
            <View key={i} className="flex-row items-center gap-2">
              <View className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
              <Text className="text-sm text-gray-300 flex-1">{d.name}</Text>
              <Text className="text-sm text-white font-bold">{d.value}</Text>
            </View>
          ))}
          {completionData.length === 0 && (
            <Text className="text-gray-500 text-center py-4">Sin datos</Text>
          )}
        </View>
      </View>

      <View className="bg-gray-800 p-4 rounded-xl">
        <Text className="text-white font-bold mb-4">📊 Progreso Semanal</Text>
        <View className="gap-1">
          {weeklyData.map((d, i) => (
            <View key={i} className="flex-row items-center gap-2">
              <Text className="text-xs text-gray-500 w-10">{d.date}</Text>
              <View className="flex-1 h-5 flex-row gap-0.5">
                {d.completados > 0 && (
                  <View
                    className="h-full bg-green-500 rounded-l-sm"
                    style={{ flex: d.completados }}
                  />
                )}
                {d.fallados > 0 && (
                  <View
                    className="h-full bg-red-500 rounded-r-sm"
                    style={{ flex: d.fallados }}
                  />
                )}
                {d.completados + d.fallados === 0 && (
                  <View className="h-full flex-1 bg-gray-700 rounded-sm" />
                )}
              </View>
              <Text className="text-xs text-gray-400 w-8 text-right">
                {d.completados + d.fallados}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="bg-gray-800 p-4 rounded-xl">
        <Text className="text-white font-bold mb-4">📊 Rendimiento por Categoría</Text>
        <View className="gap-3">
          {categoryData.map((cat, i) => (
            <View key={i}>
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm text-gray-300">{cat.name}</Text>
                <Text className="text-sm text-gray-400">
                  {cat.completados}/{cat.total} ({cat.tasa}%)
                </Text>
              </View>
              <View className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: COLORS[i % COLORS.length],
                    width: `${cat.tasa}%`,
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className="flex-row gap-4">
        <View className="flex-1 bg-gray-800 p-4 rounded-xl">
          <Text className="text-white font-bold mb-3">🎯 Metas</Text>
          <View className="gap-2">
            {goals.slice(0, 3).map(goal => (
              <View key={goal.id} className="bg-gray-700 p-2 rounded-lg">
                <Text className="text-white text-sm" numberOfLines={1}>
                  {goal.title}
                </Text>
                <View className="h-1.5 bg-gray-600 rounded-full mt-1 overflow-hidden">
                  <View
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${goal.progress}%` }}
                  />
                </View>
                <Text className="text-xs text-gray-400 mt-0.5">
                  {goal.progress}%
                </Text>
              </View>
            ))}
            {goals.length === 0 && (
              <Text className="text-gray-500 text-sm text-center py-2">
                Sin metas
              </Text>
            )}
          </View>
        </View>
        <View className="flex-1 bg-gray-800 p-4 rounded-xl">
          <Text className="text-white font-bold mb-3">📋 Protocolos</Text>
          <View className="gap-2">
            {protocols.slice(0, 3).map(p => (
              <View key={p.id} className="bg-gray-700 p-2 rounded-lg">
                <Text className="text-white text-sm" numberOfLines={1}>
                  {p.name}
                </Text>
                <View className="h-1.5 bg-gray-600 rounded-full mt-1 overflow-hidden">
                  <View
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${p.progress}%` }}
                  />
                </View>
                <Text className="text-xs text-gray-400 mt-0.5">
                  {p.progress}%
                </Text>
              </View>
            ))}
            {protocols.length === 0 && (
              <Text className="text-gray-500 text-sm text-center py-2">
                Sin protocolos
              </Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string | number
  icon: string
  color: string
}) {
  return (
    <View className="flex-1 min-w-[45%] bg-gray-800 p-3 rounded-xl">
      <View className="flex-row items-center gap-1 mb-1">
        <Text>{icon}</Text>
        <Text className="text-gray-400 text-xs">{label}</Text>
      </View>
      <Text className="text-xl font-bold text-white">{value}</Text>
    </View>
  )
}

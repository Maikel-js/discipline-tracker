import { useState, useMemo } from "react"
import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import { useStore } from "../shared/store"
import { subDays, format } from "date-fns"

type Period = "week" | "month" | "quarter"

export default function AnalyticsHub() {
  const { habits, logs } = useStore()
  const [period, setPeriod] = useState<Period>("week")
  const [selectedHabitId, setSelectedHabitId] = useState<string>("all")

  const filteredLogs = useMemo(() => {
    let filtered = logs
    const now = new Date()
    if (period === "week") {
      filtered = filtered.filter(l => now.getTime() - new Date(l.completedAt).getTime() < 7 * 86400000)
    } else if (period === "month") {
      filtered = filtered.filter(l => now.getTime() - new Date(l.completedAt).getTime() < 30 * 86400000)
    } else {
      filtered = filtered.filter(l => now.getTime() - new Date(l.completedAt).getTime() < 90 * 86400000)
    }
    if (selectedHabitId !== "all") {
      filtered = filtered.filter(l => l.habitId === selectedHabitId)
    }
    return filtered
  }, [logs, period, selectedHabitId])

  const completionRate = useMemo(() => {
    const completed = filteredLogs.filter(l => l.status === "completed").length
    return filteredLogs.length > 0 ? Math.round((completed / filteredLogs.length) * 100) : 0
  }, [filteredLogs])

  const procrastinationIndex = useMemo(() => {
    const missed = filteredLogs.filter(l => l.status === "missed").length
    return logs.length > 0 ? Math.round((missed / logs.length) * 100) : 0
  }, [filteredLogs, logs])

  const dailyData = useMemo(() => {
    const days = period === "week" ? 7 : period === "month" ? 30 : 90
    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dateStr = format(date, "yyyy-MM-dd")
      const dayLogs = filteredLogs.filter(l => l.completedAt.startsWith(dateStr))
      result.push({
        date: format(date, "MMM dd"),
        completed: dayLogs.filter(l => l.status === "completed").length,
        missed: dayLogs.filter(l => l.status === "missed").length,
      })
    }
    return result
  }, [filteredLogs, period])

  const maxDaily = useMemo(() => Math.max(1, ...dailyData.map(d => d.completed + d.missed)), [dailyData])

  const topHabits = useMemo(() => {
    const habitStats = new Map<string, { completed: number; missed: number }>()
    habits.forEach(h => habitStats.set(h.id, { completed: 0, missed: 0 }))
    filteredLogs.forEach(log => {
      const s = habitStats.get(log.habitId)
      if (s) {
        if (log.status === "completed") s.completed++
        else s.missed++
      }
    })
    return habits
      .map(h => {
        const s = habitStats.get(h.id) || { completed: 0, missed: 0 }
        return { ...h, completed: s.completed, missed: s.missed, rate: s.completed + s.missed > 0 ? Math.round((s.completed / (s.completed + s.missed)) * 100) : 0 }
      })
      .filter(h => h.completed + h.missed > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5)
  }, [habits, filteredLogs])

  const hourStats = useMemo(() => {
    const hours = new Array(24).fill(0)
    filteredLogs.filter(l => l.status === "completed").forEach(l => {
      const hour = new Date(l.completedAt).getHours()
      hours[hour]++
    })
    const maxH = Math.max(1, ...hours)
    return hours.map((count, hour) => ({ hour: `${hour}:00`, count, pct: (count / maxH) * 100 }))
  }, [filteredLogs])

  const insights = useMemo(() => {
    const r: { type: string; text: string; icon: string }[] = []
    if (completionRate > 70) r.push({ type: "positive", text: "Excelente tasa de cumplimiento", icon: "🎯" })
    else if (completionRate < 40) r.push({ type: "negative", text: "Cumplimiento bajo", icon: "⚠️" })
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
    const dayStats = new Array(7).fill(0)
    dailyData.forEach(d => {
      const dayIdx = days.indexOf(d.date.slice(0, 3))
      if (dayIdx >= 0) dayStats[dayIdx] += d.completed
    })
    const bestDay = dayStats.indexOf(Math.max(...dayStats))
    const worstDay = dayStats.indexOf(Math.min(...dayStats.filter(s => s > 0)))
    if (bestDay >= 0) r.push({ type: "neutral", text: `Mejor día: ${days[bestDay]}`, icon: "📅" })
    if (worstDay >= 0) r.push({ type: "warning", text: `Cuidado con ${days[worstDay]}`, icon: "🔔" })
    if (procrastinationIndex > 30) r.push({ type: "warning", text: `Alta procrastinación: ${procrastinationIndex}%`, icon: "😴" })
    return r
  }, [completionRate, dailyData, procrastinationIndex])

  return (
    <ScrollView className="gap-4">
      <View className="flex-row gap-2">
        {(["week", "month", "quarter"] as Period[]).map(p => (
          <TouchableOpacity
            key={p}
            onPress={() => setPeriod(p)}
            className={`px-3 py-1 rounded-lg ${period === p ? "bg-blue-600" : "bg-gray-700"}`}
          >
            <Text className="text-white text-sm">
              {p === "week" ? "Semana" : p === "month" ? "Mes" : "Trimestre"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex-row flex-wrap gap-2">
        <MiniCard label="Tasa" value={`${completionRate}%`} color={completionRate > 70 ? "text-green-400" : completionRate > 40 ? "text-yellow-400" : "text-red-400"} />
        <MiniCard label="Procrastinación" value={`${procrastinationIndex}%`} color={procrastinationIndex < 20 ? "text-green-400" : procrastinationIndex < 40 ? "text-yellow-400" : "text-red-400"} />
        <MiniCard label="Total Acciones" value={filteredLogs.length} color="text-blue-400" />
        <MiniCard label="Hábitos" value={habits.length} color="text-purple-400" />
      </View>

      <View className="bg-gray-800/50 rounded-lg p-4">
        <Text className="text-white font-medium mb-3">Tendencia de Cumplimiento</Text>
        <View className="gap-1">
          {dailyData.slice(0, 14).map((d, i) => (
            <View key={i} className="flex-row items-center gap-2">
              <Text className="text-xs text-gray-500 w-14">{d.date}</Text>
              <View className="flex-1 h-4 flex-row gap-0.5">
                <View className="h-full bg-green-500 rounded-l-sm" style={{ flex: Math.max(0.1, d.completed) }} />
                {d.missed > 0 && <View className="h-full bg-red-500" style={{ flex: d.missed }} />}
                {d.completed + d.missed === 0 && <View className="h-full flex-1 bg-gray-700 rounded-sm" />}
              </View>
              <View className="flex-row gap-1 w-12">
                <Text className="text-xs text-green-400">{d.completed}</Text>
                <Text className="text-xs text-red-400">{d.missed}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className="bg-gray-800/50 rounded-lg p-4">
        <Text className="text-white font-medium mb-3">Distribución por Hora</Text>
        <View className="gap-0.5">
          {hourStats.filter(h => h.count > 0).map((h, i) => (
            <View key={i} className="flex-row items-center gap-2">
              <Text className="text-xs text-gray-500 w-10">{h.hour}</Text>
              <View className="flex-1 h-3 bg-gray-700 rounded-sm overflow-hidden">
                <View className="h-full bg-blue-500 rounded-sm" style={{ width: `${h.pct}%` }} />
              </View>
              <Text className="text-xs text-gray-400 w-6 text-right">{h.count}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="bg-gray-800/50 rounded-lg p-4">
        <Text className="text-white font-medium mb-3">Top Hábitos</Text>
        <View className="gap-2">
          {topHabits.map((h, i) => (
            <View key={h.id}>
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm text-white" numberOfLines={1}>#{i + 1} {h.name}</Text>
                <Text className={`text-sm ${h.rate > 70 ? "text-green-400" : h.rate > 40 ? "text-yellow-400" : "text-red-400"}`}>
                  {h.rate}%
                </Text>
              </View>
              <View className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <View className="h-full bg-blue-500 rounded-full" style={{ width: `${h.rate}%` }} />
              </View>
            </View>
          ))}
          {topHabits.length === 0 && (
            <Text className="text-gray-500 text-sm text-center py-4">Sin datos</Text>
          )}
        </View>
      </View>

      <View className="bg-gray-800/50 rounded-lg p-4">
        <Text className="text-white font-medium mb-3">Insights</Text>
        <View className="gap-2">
          {insights.map((insight, i) => (
            <View
              key={i}
              className={`p-3 rounded-lg ${
                insight.type === "positive"
                  ? "bg-green-900/20 border border-green-500/30"
                  : insight.type === "negative"
                    ? "bg-red-900/20 border border-red-500/30"
                    : "bg-yellow-900/20 border border-yellow-500/30"
              }`}
            >
              <Text className="text-sm text-gray-300">
                {insight.icon} {insight.text}
              </Text>
            </View>
          ))}
          {insights.length === 0 && (
            <Text className="text-gray-500 text-sm text-center py-4">Sin insights</Text>
          )}
        </View>
      </View>

      <View className="bg-gray-800/50 rounded-lg p-4">
        <Text className="text-white font-medium mb-3">Análisis por Día</Text>
        <View className="flex-row gap-1">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(day => {
            const dayData = dailyData.filter(d => d.date.toLowerCase().startsWith(day.slice(0, 3).toLowerCase()))
            const avg = dayData.length > 0 ? Math.round(dayData.reduce((a, b) => a + b.completed / Math.max(1, b.completed + b.missed) * 100, 0) / dayData.length) : 0
            return (
              <View key={day} className="flex-1 items-center p-1">
                <Text className="text-xs text-gray-500 mb-1">{day.slice(0, 2)}</Text>
                <View className={`w-full h-8 rounded items-center justify-center ${avg > 70 ? "bg-green-500" : avg > 40 ? "bg-yellow-500" : avg > 0 ? "bg-red-500" : "bg-gray-700"}`}>
                  <Text className="text-xs font-bold text-white">{avg}%</Text>
                </View>
              </View>
            )
          })}
        </View>
      </View>
    </ScrollView>
  )
}

function MiniCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View className="flex-1 min-w-[45%] bg-gray-800/50 rounded-lg p-3">
      <Text className="text-xs text-gray-500">{label}</Text>
      <Text className={`text-lg font-bold ${color}`}>{value}</Text>
    </View>
  )
}

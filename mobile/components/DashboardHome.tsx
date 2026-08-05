import { useEffect, useMemo, useState } from "react"
import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { useStore } from "../shared/store"
import { useAuth } from "../shared/auth"
import { subDays, format } from "date-fns"
import { es } from "date-fns/locale"
import PomodoroTimer from "./PomodoroTimer"
import AuditPanel from "./AuditPanel"
import SensorIntegration from "./SensorIntegration"
import AccountabilityPartnerPanel from "./AccountabilityPartner"
import ContributionCalendar from "./ContributionCalendar"
import StatsDashboard from "./StatsDashboard"
import RewardsSystem from "./RewardsSystem"
import SmartTracker from "./SmartTracker"

type AdvancedPanel = "audit" | "sensors" | "partners" | "rewards" | "stats" | null

export default function DashboardHome() {
  const stats = useStore((s) => s.stats)
  const habits = useStore((s) => s.habits)
  const tasks = useStore((s) => s.tasks)
  const logs = useStore((s) => s.logs)
  const settings = useStore((s) => s.settings)
  const patternInsights = useStore((s) => s.patternInsights)
  const toggleExtremeMode = useStore((s) => s.toggleExtremeMode)
  const togglePunishmentMode = useStore((s) => s.togglePunishmentMode)
  const generatePatternInsights = useStore((s) => s.generatePatternInsights)
  const { user } = useAuth()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activePanel, setActivePanel] = useState<AdvancedPanel>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    generatePatternInsights()
  }, [logs, habits, generatePatternInsights])

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  const chartData = useMemo(() => {
    const last7 = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i))
    return last7.map((date) => {
      const key = format(date, "yyyy-MM-dd")
      const completed = logs.filter(
        (l) => l.completedAt.startsWith(key) && l.status === "completed"
      ).length
      const missed = logs.filter(
        (l) => l.completedAt.startsWith(key) && l.status === "missed"
      ).length
      return {
        date: format(date, "EEE", { locale: es }),
        completados: completed,
        incumplidos: missed,
      }
    })
  }, [logs])

  const maxChart = useMemo(
    () => Math.max(1, ...chartData.map((d) => d.completados + d.incumplidos)),
    [chartData]
  )

  const pendingTasks = tasks.filter((t) => t.status === "todo").length
  const doingTasks = tasks.filter((t) => t.status === "doing").length
  const doneTasks = tasks.filter((t) => t.status === "done").length
  const habitsDue = habits.filter((h) => h.status === "pending")

  return (
    <ScrollView
      className="flex-1 bg-gray-900"
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <View className="p-4 pt-12">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-white">Dashboard</Text>
            <Text className="text-gray-400 text-sm">
              {currentTime.toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={togglePunishmentMode}
              className={`px-2 py-1 rounded-lg text-xs ${
                settings.punishmentMode ? "bg-orange-600" : "bg-gray-700"
              }`}
            >
              <Text
                className={`text-xs ${
                  settings.punishmentMode ? "text-white" : "text-gray-400"
                }`}
              >
                {settings.punishmentMode ? "🔥 Castigo" : "Castigo"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleExtremeMode}
              className={`px-2 py-1 rounded-lg ${
                settings.extremeMode ? "bg-red-600" : "bg-gray-700"
              }`}
            >
              <Text
                className={`text-xs ${
                  settings.extremeMode ? "text-white" : "text-gray-400"
                }`}
              >
                {settings.extremeMode ? "🔥 Extremo" : "Extremo"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-3 mb-4">
          <StatCard
            label="Puntuación"
            value={String(stats.disciplinaryScore)}
            sub={`Nivel ${stats.level}`}
            color="text-blue-400"
          />
          <StatCard
            label="Racha"
            value={`${stats.currentStreak}d`}
            sub="días"
            color="text-orange-400"
          />
          <StatCard
            label="Hoy"
            value={String(stats.completedToday)}
            sub="completados"
            color="text-green-400"
          />
          <StatCard
            label="Tasa"
            value={`${stats.completionRate}%`}
            sub="cumplimiento"
            color="text-purple-400"
          />
        </View>

        {user ? (
          <View className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 mb-4">
            <Text className="text-gray-400 text-xs">Hola,</Text>
            <Text className="text-white font-semibold">{user.name}</Text>
          </View>
        ) : null}

        {patternInsights.length > 0 ? (
          <View className="gap-2 mb-4">
            {patternInsights.slice(0, 3).map((insight) => (
              <View
                key={insight.id}
                className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg"
              >
                <Text className="text-xs text-gray-400">
                  {insight.message}
                </Text>
                <Text className="text-base font-bold text-white">
                  {insight.value}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View className="mb-4">
          <PomodoroTimer />
        </View>

        <View className="flex-row gap-2 mb-3">
          <TouchableOpacity
            onPress={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-1 rounded-lg ${
              showAdvanced ? "bg-indigo-600" : "bg-gray-700"
            }`}
          >
            <Text className="text-white text-xs">Avanzado ▾</Text>
          </TouchableOpacity>
        </View>

        {showAdvanced ? (
          <View className="flex-row gap-2 mb-4 flex-wrap">
            {(
              [
                { id: "audit", label: "Auditoría", color: "bg-purple-600" },
                { id: "sensors", label: "Sensores", color: "bg-blue-600" },
                { id: "partners", label: "Partners", color: "bg-green-600" },
                { id: "rewards", label: "Recompensas", color: "bg-yellow-600" },
                { id: "stats", label: "Stats", color: "bg-pink-600" },
              ] as { id: AdvancedPanel; label: string; color: string }[]
            ).map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() =>
                  setActivePanel(activePanel === opt.id ? null : opt.id)
                }
                className={`px-3 py-1 rounded-lg ${
                  activePanel === opt.id ? opt.color : "bg-gray-700"
                }`}
              >
                <Text className="text-white text-xs">{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {activePanel === "audit" ? (
          <View className="bg-gray-800/30 border border-gray-700 rounded-xl p-3 mb-4">
            <AuditPanel />
          </View>
        ) : null}
        {activePanel === "sensors" ? (
          <View className="bg-gray-800/30 border border-gray-700 rounded-xl p-3 mb-4">
            <SensorIntegration />
          </View>
        ) : null}
        {activePanel === "partners" ? (
          <View className="bg-gray-800/30 border border-gray-700 rounded-xl p-3 mb-4">
            <AccountabilityPartnerPanel />
          </View>
        ) : null}
        {activePanel === "rewards" ? (
          <View className="bg-gray-800/30 border border-gray-700 rounded-xl p-3 mb-4">
            <RewardsSystem />
          </View>
        ) : null}
        {activePanel === "stats" ? (
          <View className="bg-gray-800/30 border border-gray-700 rounded-xl p-3 mb-4">
            <StatsDashboard />
          </View>
        ) : null}

        <View className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-4">
          <Text className="font-semibold text-white mb-3">
            📊 Progreso Semanal
          </Text>
          <View className="gap-1">
            {chartData.map((d, i) => (
              <View key={i} className="flex-row items-center gap-2">
                <Text className="text-xs text-gray-500 w-10 capitalize">
                  {d.date}
                </Text>
                <View className="flex-1 h-5 flex-row gap-0.5">
                  {d.completados > 0 ? (
                    <View
                      className="h-full bg-green-500 rounded-l-sm"
                      style={{ flex: d.completados }}
                    />
                  ) : null}
                  {d.incumplidos > 0 ? (
                    <View
                      className="h-full bg-red-500"
                      style={{ flex: d.incumplidos }}
                    />
                  ) : null}
                  {d.completados + d.incumplidos === 0 ? (
                    <View className="h-full flex-1 bg-gray-700 rounded-sm" />
                  ) : null}
                </View>
                <Text className="text-xs text-gray-400 w-6 text-right">
                  {d.completados + d.incumplidos}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-4">
          <Text className="font-semibold text-white mb-3">Tareas</Text>
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-yellow-500" />
                <Text className="text-sm text-gray-400">Por hacer</Text>
              </View>
              <Text className="font-bold text-white">{pendingTasks}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-blue-500" />
                <Text className="text-sm text-gray-400">En progreso</Text>
              </View>
              <Text className="font-bold text-white">{doingTasks}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-green-500" />
                <Text className="text-sm text-gray-400">Completadas</Text>
              </View>
              <Text className="font-bold text-white">{doneTasks}</Text>
            </View>
          </View>
        </View>

        <SmartTracker />

        <View className="mt-4">
          <ContributionCalendar />
        </View>

        <View className="mt-4 mb-4">
          <Text className="font-semibold text-white mb-2">
            Hábitos pendientes
          </Text>
          {habitsDue.length === 0 ? (
            <Text className="text-gray-500 text-sm">
              Todos los hábitos completados hoy
            </Text>
          ) : (
            habitsDue.slice(0, 5).map((habit) => (
              <View
                key={habit.id}
                className="bg-gray-800 rounded-lg p-3 mb-2 flex-row items-center"
              >
                <View className="w-2 h-2 rounded-full bg-purple-400 mr-3" />
                <Text className="text-gray-200 flex-1">{habit.name}</Text>
                <Text className="text-gray-400 text-sm">
                  {habit.scheduledTime}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  )
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string
  sub: string
  color: string
}) {
  return (
    <View className="flex-1 min-w-[45%] bg-gray-800/50 border border-gray-700 rounded-xl p-3">
      <Text className="text-gray-400 text-xs mb-1">{label}</Text>
      <Text className={`text-2xl font-bold ${color}`}>{value}</Text>
      <Text className="text-xs text-gray-500">{sub}</Text>
    </View>
  )
}

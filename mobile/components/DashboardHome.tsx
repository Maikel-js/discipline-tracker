import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { useStore } from "../shared/store"

export default function DashboardHome() {
  const stats = useStore((s) => s.stats)
  const habits = useStore((s) => s.habits)
  const tasks = useStore((s) => s.tasks)
  const toggleExtremeMode = useStore((s) => s.toggleExtremeMode)
  const settings = useStore((s) => s.settings)
  const habitsDue = habits.filter((h) => h.status === "pending")
  const tasksTodo = tasks.filter((t) => t.status === "todo")

  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="p-4 pt-12">
        <Text className="text-2xl font-bold text-white mb-1">
          Discipline Tracker
        </Text>
        <Text className="text-gray-400 mb-6">
          Nivel {stats.level} · {stats.disciplinaryScore} pts
        </Text>

        <View className="flex-row flex-wrap gap-3 mb-6">
          <StatCard
            label="Hábitos hoy"
            value={String(stats.completedToday)}
            total={String(stats.totalHabits)}
            color="bg-purple-600"
          />
          <StatCard
            label="Racha"
            value={`${stats.currentStreak} días`}
            color="bg-green-600"
          />
          <StatCard
            label="Cumplimiento"
            value={`${stats.completionRate}%`}
            color="bg-blue-600"
          />
          <StatCard
            label="Pendientes"
            value={String(habitsDue.length + tasksTodo.length)}
            color="bg-orange-600"
          />
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-white mb-3">
            Tareas pendientes
          </Text>
          {tasksTodo.length === 0 ? (
            <Text className="text-gray-500">¡Todo completado!</Text>
          ) : (
            tasksTodo.slice(0, 5).map((task) => (
              <View
                key={task.id}
                className="bg-gray-800 rounded-lg p-3 mb-2 flex-row items-center"
              >
                <View className="w-2 h-2 rounded-full bg-yellow-400 mr-3" />
                <Text className="text-gray-200 flex-1">{task.title}</Text>
              </View>
            ))
          )}
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-white mb-3">
            Hábitos pendientes
          </Text>
          {habitsDue.length === 0 ? (
            <Text className="text-gray-500">
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
                <Text className="text-gray-400 text-sm">{habit.scheduledTime}</Text>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity
          onPress={toggleExtremeMode}
          className={`p-3 rounded-xl flex-row items-center justify-center mb-8 ${
            settings.extremeMode ? "bg-red-700" : "bg-gray-800"
          }`}
        >
          <Text
            className={`font-semibold ${
              settings.extremeMode ? "text-white" : "text-gray-300"
            }`}
          >
            Modo Extremo: {settings.extremeMode ? "ACTIVADO" : "Desactivado"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

function StatCard({
  label,
  value,
  total,
  color,
}: {
  label: string
  value: string
  total?: string
  color: string
}) {
  return (
    <View className={`flex-1 min-w-[45%] ${color} rounded-xl p-4`}>
      <Text className="text-white/70 text-xs mb-1">{label}</Text>
      <Text className="text-white text-2xl font-bold">
        {value}
        {total ? (
          <Text className="text-white/60 text-lg"> / {total}</Text>
        ) : null}
      </Text>
    </View>
  )
}

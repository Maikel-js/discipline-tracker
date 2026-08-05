import { useState, useMemo } from "react"
import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns"
import { es } from "date-fns/locale"
import { useStore } from "../shared/store"

export default function PhysicalCalendar() {
  const { habits, tasks, logs } = useStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { locale: es, weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { locale: es, weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const habitsByDate = useMemo(() => {
    const map: Record<string, { completed: number; total: number; missed: number }> = {}
    habits.forEach((h) => {
      const dateKey = format(new Date(h.createdAt), "yyyy-MM-dd")
      if (!map[dateKey]) map[dateKey] = { completed: 0, total: 0, missed: 0 }
      map[dateKey].total++
      if (h.status === "completed") map[dateKey].completed++
      if (h.status === "missed") map[dateKey].missed++
    })
    logs.forEach((log) => {
      const dateKey = log.completedAt.slice(0, 10)
      if (!map[dateKey]) map[dateKey] = { completed: 0, total: 0, missed: 0 }
      if (log.status === "completed") map[dateKey].completed++
      if (log.status === "missed") map[dateKey].missed++
    })
    return map
  }, [habits, logs])

  const tasksByDate = useMemo(() => {
    const map: Record<string, number> = {}
    tasks.forEach((t) => {
      if (t.dueDate) {
        const dateKey = t.dueDate.slice(0, 10)
        map[dateKey] = (map[dateKey] || 0) + 1
      }
    })
    return map
  }, [tasks])

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null

  const dayDetailItems = useMemo(() => {
    if (!selectedDateStr) return []
    const selLogs = logs.filter((l) => l.completedAt.startsWith(selectedDateStr))
    const selTasks = tasks.filter((t) => t.dueDate?.startsWith(selectedDateStr))

    const items: { label: string; color: string; icon: string }[] = []
    selLogs.forEach((log) => {
      const habit = habits.find((h) => h.id === log.habitId)
      if (habit) {
        items.push({
          icon: log.status === "completed" ? "✓" : "✗",
          label: `${log.status === "completed" ? "Completado" : "Fallado"}: ${habit.name}`,
          color: log.status === "completed" ? "text-green-400" : "text-red-400",
        })
      }
    })
    selTasks.forEach((t) => {
      items.push({
        icon: "▸",
        label: `Tarea: ${t.title}`,
        color: "text-blue-400",
      })
    })
    return items
  }, [selectedDateStr, habits, logs, tasks])

  const weekDays = ["L", "M", "X", "J", "V", "S", "D"]

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-white">📅 Calendario</Text>
      </View>

      <View className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
        <View className="flex-row items-center justify-between p-3 bg-gray-900/50 border-b border-gray-700">
          <TouchableOpacity
            onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2"
          >
            <Text className="text-gray-300 text-lg">‹</Text>
          </TouchableOpacity>
          <Text className="text-base font-bold text-white capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </Text>
          <TouchableOpacity
            onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2"
          >
            <Text className="text-gray-300 text-lg">›</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row border-b border-gray-700">
          {weekDays.map((day) => (
            <View key={day} className="flex-1 p-2 items-center">
              <Text className="text-xs font-bold text-gray-500">{day}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row flex-wrap">
          {days.map((day, idx) => {
            const dateKey = format(day, "yyyy-MM-dd")
            const dayData = habitsByDate[dateKey]
            const taskCount = tasksByDate[dateKey] || 0
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isTodayDate = isToday(day)
            const hasCompleted = dayData && dayData.completed > 0
            const hasMissed = dayData && dayData.missed > 0

            return (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedDate(day)}
                className={`w-[14.285%] p-1 border-b border-r border-gray-700/50 min-h-[56px] ${
                  !isCurrentMonth ? "bg-gray-900/30" : ""
                } ${isSelected ? "bg-blue-900/30" : ""}`}
                style={{ borderWidth: 0.5, borderColor: "#374151" }}
              >
                <Text
                  className={`text-xs text-center ${
                    isTodayDate
                      ? "bg-blue-600 text-white w-6 h-6 rounded-full overflow-hidden mx-auto pt-0.5"
                      : isSelected
                        ? "text-blue-300"
                        : !isCurrentMonth
                          ? "text-gray-600"
                          : "text-gray-300"
                  }`}
                >
                  {format(day, "d")}
                </Text>
                <View className="flex-row justify-center gap-0.5 mt-1">
                  {hasCompleted ? (
                    <View
                      className="w-1.5 h-1.5 rounded-full bg-green-500"
                    />
                  ) : null}
                  {hasMissed ? (
                    <View
                      className="w-1.5 h-1.5 rounded-full bg-red-500"
                    />
                  ) : null}
                  {taskCount > 0 ? (
                    <View
                      className="w-1.5 h-1.5 rounded-full bg-blue-500"
                    />
                  ) : null}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {selectedDate ? (
        <View className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
          <Text className="text-base font-bold text-white mb-3 capitalize">
            {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
          </Text>
          {dayDetailItems.length === 0 ? (
            <Text className="text-gray-500 text-sm py-4 text-center">
              Sin actividad registrada
            </Text>
          ) : (
            <View className="gap-2">
              {dayDetailItems.map((item, i) => (
                <View
                  key={i}
                  className="flex-row items-center gap-3 p-2.5 bg-gray-900/50 rounded-lg"
                >
                  <Text className={item.color}>{item.icon}</Text>
                  <Text className={`text-sm ${item.color}`}>{item.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : null}

      <View className="flex-row items-center gap-4 px-2">
        <View className="flex-row items-center gap-1">
          <View className="w-2 h-2 rounded-full bg-green-500" />
          <Text className="text-xs text-gray-400">Completado</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-2 h-2 rounded-full bg-red-500" />
          <Text className="text-xs text-gray-400">Fallado</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-2 h-2 rounded-full bg-blue-500" />
          <Text className="text-xs text-gray-400">Tareas</Text>
        </View>
      </View>
    </View>
  )
}

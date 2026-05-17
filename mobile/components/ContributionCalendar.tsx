import { View, Text } from "react-native"
import { useMemo } from "react"
import { format, eachDayOfInterval, startOfYear, endOfYear } from "date-fns"
import { useStore } from "../shared/store"

const COLOR_LEVELS = [
  "#1f2937",
  "#064e3b",
  "#047857",
  "#10b981",
  "#34d399",
  "#6ee7b7",
]

export default function ContributionCalendar() {
  const { logs } = useStore()

  const calendarData = useMemo(() => {
    const year = new Date().getFullYear()
    const start = startOfYear(new Date(year, 0, 1))
    const end = endOfYear(new Date(year, 11, 31))
    const days = eachDayOfInterval({ start, end })

    const logCounts = new Map<string, number>()
    logs.forEach(log => {
      if (log.completedAt) {
        const dateStr = log.completedAt.split("T")[0]
        logCounts.set(dateStr, (logCounts.get(dateStr) || 0) + 1)
      }
    })

    return days.map(day => {
      const dateStr = format(day, "yyyy-MM-dd")
      const count = logCounts.get(dateStr) || 0

      let level = 0
      if (count > 0) level = 1
      if (count >= 3) level = 2
      if (count >= 5) level = 3
      if (count >= 8) level = 4
      if (count >= 10) level = 5

      return { date: day, dateStr, count, level }
    })
  }, [logs])

  const weeks = useMemo(() => {
    const result: typeof calendarData[] = []
    let currentWeek: typeof calendarData = []

    calendarData.forEach((day, i) => {
      if (i === 0) {
        const firstDayOfWeek = day.date.getDay()
        for (let j = 0; j < firstDayOfWeek; j++) {
          currentWeek.push({ date: new Date(), dateStr: "", count: 0, level: -1 })
        }
      }
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        result.push(currentWeek)
        currentWeek = []
      }
    })

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: new Date(), dateStr: "", count: 0, level: -1 })
      }
      result.push(currentWeek)
    }

    return result
  }, [calendarData])

  return (
    <View className="bg-gray-900 p-4 rounded-xl">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-bold text-white">Calendario</Text>
        <View className="flex-row items-center gap-1">
          <Text className="text-xs text-gray-500">Menos</Text>
          {COLOR_LEVELS.map((color, i) => (
            <View key={i} style={{ backgroundColor: i === 0 ? '#374151' : color }} className="w-2 h-2 rounded-sm" />
          ))}
          <Text className="text-xs text-gray-500">Más</Text>
        </View>
      </View>

      <View className="flex-row gap-1 ml-5 mb-1">
        {["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map((m, i) => (
          <Text key={m} className="text-[8px] text-gray-600 w-[10px]">{m}</Text>
        ))}
      </View>

      <View className="flex-row gap-[2px]">
        <View className="flex-col gap-[2px] mr-1">
          {["D", "L", "M", "X", "J", "V", "S"].map((d, i) => (
            <Text key={d} className="text-[8px] text-gray-600 h-2">{i % 2 === 0 ? d : ""}</Text>
          ))}
        </View>

        <View className="flex-row gap-[2px]">
          {weeks.slice(0, 26).map((week, wi) => (
            <View key={wi} className="flex-col gap-[2px]">
              {week.map((day, di) => (
                <View
                  key={di}
                  style={{ backgroundColor: day.level === -1 ? 'transparent' : COLOR_LEVELS[day.level] }}
                  className="w-2 h-2 rounded-sm"
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      <View className="mt-3 items-center">
        <Text className="text-xs text-gray-500">
          Total: {calendarData.reduce((sum, d) => sum + d.count, 0)} actividades
        </Text>
      </View>
    </View>
  )
}
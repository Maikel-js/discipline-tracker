"use client"
import { useMemo } from "react"
import { format, eachDayOfInterval, startOfWeek, endOfWeek, startOfYear, endOfYear, isSameDay, subMonths } from "date-fns"
import { es } from "date-fns/locale"

interface ContributionData {
  date: string
  count: number
}

interface ContributionCalendarProps {
  data?: ContributionData[]
  year?: number
}

const COLOR_LEVELS = [
  "bg-gray-800",
  "bg-emerald-900",
  "bg-emerald-700",
  "bg-emerald-500",
  "bg-emerald-400",
  "bg-emerald-300",
]

export default function ContributionCalendar({ data = [], year = new Date().getFullYear() }: ContributionCalendarProps) {
  const calendarData = useMemo(() => {
    const start = startOfYear(new Date(year, 0, 1))
    const end = endOfYear(new Date(year, 11, 31))
    const days = eachDayOfInterval({ start, end })

    const dataMap = new Map(data.map(d => [d.date, d.count]))

    return days.map(day => {
      const dateStr = format(day, "yyyy-MM-dd")
      const count = dataMap.get(dateStr) || 0

      let level = 0
      if (count > 0) level = 1
      if (count >= 3) level = 2
      if (count >= 5) level = 3
      if (count >= 8) level = 4
      if (count >= 10) level = 5

      return {
        date: day,
        dateStr,
        count,
        level,
      }
    })
  }, [data, year])

  const weeks = useMemo(() => {
    const result: typeof calendarData[] = []
    let currentWeek: typeof calendarData = []

    calendarData.forEach((day, i) => {
      if (i === 0) {
        const firstDayOfWeek = day.date.getDay()
        for (let j = 0; j < firstDayOfWeek; j++) {
          currentWeek.push({ date: new Date(2024, 0, 1), dateStr: "", count: 0, level: -1 })
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
        currentWeek.push({ date: new Date(2024, 0, 1), dateStr: "", count: 0, level: -1 })
      }
      result.push(currentWeek)
    }

    return result
  }, [calendarData])

  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  return (
    <div className="bg-gray-900 p-4 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Calendario de Contribuciones</h3>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Menos</span>
          {COLOR_LEVELS.map((color, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${i === 0 ? 'bg-gray-800' : color}`} />
          ))}
          <span>Más</span>
        </div>
      </div>

      <div className="flex gap-1 mb-2 ml-8">
        {months.map((month, i) => {
          const weekIndex = Math.floor((new Date(year, i + 1, 1).getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
          if (i === 0 || weekIndex !== Math.floor((new Date(year, i, 1).getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))) {
            return <span key={month} className="text-xs text-gray-500 w-[12px]" style={{ marginLeft: weekIndex === 0 ? '0' : 'auto' }}>{month}</span>
          }
          return null
        })}
      </div>

      <div className="flex gap-1">
        <div className="flex flex-col gap-1 mr-1">
          {days.map((day, i) => (
            <span key={day} className="text-xs text-gray-500 h-[10px] flex items-center">{i % 2 === 0 ? day : ''}</span>
          ))}
        </div>

        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`w-[10px] h-[10px] rounded-sm ${
                    day.level === -1 ? 'bg-transparent' : day.level === 0 ? 'bg-gray-800' : COLOR_LEVELS[day.level]
                  }`}
                  title={day.dateStr ? `${day.dateStr}: ${day.count} completados` : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-center">
        <span className="text-sm text-gray-400">
          Total: {calendarData.reduce((sum, d) => sum + d.count, 0)} actividades completadas en {year}
        </span>
      </div>
    </div>
  )
}
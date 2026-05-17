import { useState, useEffect, useMemo } from "react"
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native"
import { useStore } from "../shared/store"
import { useAuth } from "../shared/auth"
import { emailService } from "../shared/email"
import type { DigitalTwin, Experiment } from "../shared/types"
import { subDays, format } from "date-fns"

export default function AdvancedAIHub() {
  const { habits, tasks, logs, experiments, addExperiment, completeExperiment, pauseExperiment, resumeExperiment, deleteExperiment } = useStore()
  const { user } = useAuth()
  const [activeModule, setActiveModule] = useState<"twin" | "experiments">("twin")
  const [digitalTwin, setDigitalTwin] = useState<DigitalTwin | null>(null)
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null)
  const [experimentResults, setExperimentResults] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newExpName, setNewExpName] = useState("")
  const [newExpDesc, setNewExpDesc] = useState("")
  const [newExpType, setNewExpType] = useState<"habits" | "tasks">("habits")
  const [newExpPeriod, setNewExpPeriod] = useState(7)
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([])
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    analyzeDigitalTwin()
  }, [habits, tasks, logs])

  const analyzeDigitalTwin = () => {
    const completedLogs = logs.filter(l => l.status === "completed")
    const hourCounts = new Map<number, number>()
    completedLogs.forEach(log => {
      const hour = new Date(log.completedAt).getHours()
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
    })
    let bestHour = 0, maxCount = 0
    hourCounts.forEach((count, hour) => { if (count > maxCount) { maxCount = count; bestHour = hour } })
    const chronotype = bestHour >= 5 && bestHour < 12 ? "morning" : bestHour >= 17 && bestHour < 22 ? "night" : "afternoon"
    const recentMisses = logs.filter(l => l.status === "missed").slice(-10)
    const riskTolerance = Math.max(0, 100 - recentMisses.length * 10)
    const predictions = habits.filter(h => h.status === "pending").map(h => ({
      id: `${h.id}-pred`,
      habitId: h.id,
      probability: Math.max(20, 100 - h.missedCount * 15),
      confidence: Math.min(90, 50 + h.currentStreak * 5),
    }))
    setDigitalTwin({
      profile: { chronotype, decisionStyle: "balanced", riskTolerance, motivationType: riskTolerance > 70 ? "reward" : "avoidance" },
      predictions,
      lastUpdated: new Date().toISOString(),
    })
  }

  const toggleHabitSelection = (id: string) => {
    setSelectedHabitIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const toggleTaskSelection = (id: string) => {
    setSelectedTaskIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const createExperiment = async () => {
    const linkedItems = newExpType === "habits" ? selectedHabitIds : selectedTaskIds
    if (!newExpName || linkedItems.length === 0) return
    addExperiment({
      name: newExpName,
      description: newExpDesc,
      type: newExpType,
      periodDays: newExpPeriod,
      linkedHabits: newExpType === "habits" ? selectedHabitIds : [],
      linkedTasks: newExpType === "tasks" ? selectedTaskIds : [],
      status: "active",
    })
    setNewExpName(""); setNewExpDesc(""); setNewExpType("habits"); setNewExpPeriod(7)
    setSelectedHabitIds([]); setSelectedTaskIds([]); setShowCreateModal(false)
  }

  const calculateExperimentResults = (exp: Experiment) => {
    const startDate = new Date(exp.startDate)
    const endDate = exp.endDate ? new Date(exp.endDate) : new Date()
    const linkedHabitIds = exp.linkedHabits || []
    const expLogs = logs.filter(log => {
      const logDate = new Date(log.completedAt)
      return logDate >= startDate && logDate <= endDate && linkedHabitIds.includes(log.habitId)
    })
    const completedLogs = expLogs.filter(l => l.status === "completed").length
    const missedLogs = expLogs.filter(l => l.status === "missed").length
    const totalLogs = expLogs.length
    const completionRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0
    const streakMap = new Map<string, number>()
    expLogs.forEach(log => {
      if (log.status === "completed") streakMap.set(log.habitId, (streakMap.get(log.habitId) || 0) + 1)
    })
    const avgStreak = streakMap.size > 0 ? Math.round(Array.from(streakMap.values()).reduce((a, b) => a + b, 0) / streakMap.size) : 0
    const daysSinceStart = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / 86400000))
    const displayDays = Math.min(daysSinceStart, 30)
    const dailyData = Array.from({ length: displayDays }, (_, i) => {
      const date = subDays(new Date(), displayDays - 1 - i)
      const dateStr = format(date, "yyyy-MM-dd")
      const dayLogs = expLogs.filter(l => l.completedAt.startsWith(dateStr))
      return {
        date: format(date, "MMM dd"),
        completed: dayLogs.filter(l => l.status === "completed").length,
        missed: dayLogs.filter(l => l.status === "missed").length,
      }
    })
    const midpoint = Math.floor(expLogs.length / 2)
    const firstHalf = expLogs.slice(0, midpoint)
    const secondHalf = expLogs.slice(midpoint)
    const firstRate = firstHalf.length > 0 ? Math.round((firstHalf.filter(l => l.status === "completed").length / firstHalf.length) * 100) : 0
    const secondRate = secondHalf.length > 0 ? Math.round((secondHalf.filter(l => l.status === "completed").length / secondHalf.length) * 100) : 0
    const trend = secondRate > firstRate + 5 ? "up" : secondRate < firstRate - 5 ? "down" : "stable"

    const catMap = new Map<string, { count: number; completed: number }>()
    habits.forEach(habit => {
      if (!linkedHabitIds.includes(habit.id)) return
      const hLogs = expLogs.filter(l => l.habitId === habit.id)
      const hCompleted = hLogs.filter(l => l.status === "completed").length
      catMap.set(habit.category, {
        count: (catMap.get(habit.category)?.count || 0) + hLogs.length,
        completed: (catMap.get(habit.category)?.completed || 0) + hCompleted,
      })
    })
    const categoryBreakdown = Array.from(catMap.entries()).map(([cat, data]) => ({
      category: cat,
      count: data.count,
      rate: data.count > 0 ? Math.round((data.completed / data.count) * 100) : 0,
    }))
    return { completionRate, totalLogs, completedLogs, missedLogs, avgStreak, trend, dailyData, categoryBreakdown, beforeVsAfter: [{ period: "Primera mitad", completion: firstRate }, { period: "Segunda mitad", completion: secondRate }] }
  }

  const handleViewResults = (exp: Experiment) => {
    setSelectedExperiment(exp)
    setExperimentResults(calculateExperimentResults(exp))
  }

  const maxExpDaily = useMemo(() => {
    if (!experimentResults) return 1
    return Math.max(1, ...experimentResults.dailyData.map((d: any) => d.completed + d.missed))
  }, [experimentResults])

  return (
    <ScrollView className="gap-4">
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => setActiveModule("twin")}
          className={`flex-1 p-3 rounded-xl ${activeModule === "twin" ? "bg-gray-700 border border-gray-500" : "bg-gray-800/50 border border-gray-700"}`}
        >
          <Text className="text-2xl mb-1">🧠</Text>
          <Text className="text-sm font-medium text-white">Digital Twin</Text>
          <Text className="text-xs text-gray-500">Tu gemelo digital</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveModule("experiments")}
          className={`flex-1 p-3 rounded-xl ${activeModule === "experiments" ? "bg-gray-700 border border-gray-500" : "bg-gray-800/50 border border-gray-700"}`}
        >
          <Text className="text-2xl mb-1">🧪</Text>
          <Text className="text-sm font-medium text-white">Experimentos</Text>
          <Text className="text-xs text-gray-500">Laboratorio personal</Text>
        </TouchableOpacity>
      </View>

      {activeModule === "twin" && digitalTwin && (
        <View className="gap-4">
          <Text className="text-lg font-bold text-white">🧠 Digital Twin</Text>
          <View className="flex-row flex-wrap gap-2">
            <TwinCard label="Cronotipo" value={digitalTwin.profile.chronotype} sub={digitalTwin.profile.chronotype === "morning" ? "🌅 Mejor mañana" : digitalTwin.profile.chronotype === "night" ? "🌙 Mejor noche" : "⛅ Mejor tarde"} />
            <TwinCard label="Estilo Decisión" value={digitalTwin.profile.decisionStyle} sub="Basado en elecciones" />
            <TwinCard label="Tolerancia Riesgo" value={`${digitalTwin.profile.riskTolerance}%`} sub={digitalTwin.profile.riskTolerance > 70 ? "🎯 Alto riesgo" : "🛡️ Conservador"} />
            <TwinCard label="Motivación" value={digitalTwin.profile.motivationType} sub={digitalTwin.profile.motivationType === "reward" ? "🏆 Recompensas" : "⚠️ Evitar castigos"} />
          </View>
          <View className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
            <Text className="font-medium text-white mb-2">📈 Predicciones del Gemelo</Text>
            {digitalTwin.predictions.slice(0, 3).map(pred => {
              const habit = habits.find(h => h.id === pred.habitId)
              return (
                <View key={pred.id} className="flex-row justify-between items-center py-1">
                  <Text className="text-sm text-gray-300">{habit?.name || "?"}</Text>
                  <Text className={`font-bold ${pred.probability > 70 ? "text-green-400" : pred.probability > 40 ? "text-yellow-400" : "text-red-400"}`}>
                    {pred.probability}% ({pred.confidence}% confianza)
                  </Text>
                </View>
              )
            })}
          </View>
        </View>
      )}

      {activeModule === "experiments" && (
        <View className="gap-4">
          {!selectedExperiment ? (
            <>
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-bold text-white">🧪 Laboratorio de Experimentos</Text>
                <TouchableOpacity
                  onPress={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-green-600 rounded-xl"
                >
                  <Text className="text-white text-sm">+ Nuevo</Text>
                </TouchableOpacity>
              </View>

              {experiments.length === 0 ? (
                <View className="items-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
                  <Text className="text-5xl mb-3 opacity-30">🧪</Text>
                  <Text className="text-gray-400 font-medium">No hay experimentos</Text>
                </View>
              ) : (
                experiments.map(exp => {
                  const daysRunning = Math.floor((Date.now() - new Date(exp.startDate).getTime()) / 86400000)
                  return (
                    <View key={exp.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <View className="flex-row justify-between mb-2">
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2">
                            <Text className="font-medium text-white">{exp.name}</Text>
                            <StatusBadge status={exp.status} />
                            <TypeBadge type={exp.type} />
                          </View>
                          {exp.description && <Text className="text-xs text-gray-400 mt-0.5">{exp.description}</Text>}
                        </View>
                        <Text className="text-xs text-gray-500">{Math.max(0, exp.periodDays - daysRunning)} días rest.</Text>
                      </View>
                      <View className="h-2 bg-gray-700 rounded-full overflow-hidden mb-1">
                        <View className={`h-full ${exp.status === "active" ? "bg-green-500" : exp.status === "completed" ? "bg-blue-500" : "bg-yellow-500"}`}
                          style={{ width: `${exp.progress}%` }} />
                      </View>
                      <Text className="text-xs text-gray-500 text-right mb-2">{exp.progress}%</Text>
                      <View className="flex-row gap-2">
                        <TouchableOpacity onPress={() => handleViewResults(exp)}
                          className="flex-1 py-2 bg-green-600/20 border border-green-500/30 rounded-lg items-center">
                          <Text className="text-green-400 text-sm">📊 Resultados</Text>
                        </TouchableOpacity>
                        {exp.status === "active" && (
                          <>
                            <ActionBtn label="✅" onPress={() => completeExperiment(exp.id)} color="bg-blue-900/20 border-blue-500/30" />
                            <ActionBtn label="⏸️" onPress={() => pauseExperiment(exp.id)} color="bg-yellow-900/20 border-yellow-500/30" />
                            <ActionBtn label="🗑️" onPress={() => deleteExperiment(exp.id)} color="bg-red-900/20 border-red-500/30" />
                          </>
                        )}
                        {exp.status === "paused" && (
                          <>
                            <ActionBtn label="▶️" onPress={() => resumeExperiment(exp.id)} color="bg-green-900/20 border-green-500/30" />
                            <ActionBtn label="🗑️" onPress={() => deleteExperiment(exp.id)} color="bg-red-900/20 border-red-500/30" />
                          </>
                        )}
                      </View>
                    </View>
                  )
                })
              )}
            </>
          ) : (
            <ExperimentResults
              experiment={selectedExperiment}
              results={experimentResults}
              habits={habits}
              onBack={() => { setSelectedExperiment(null); setExperimentResults(null) }}
              onComplete={() => {
                completeExperiment(selectedExperiment.id)
                setSelectedExperiment({ ...selectedExperiment, status: "completed" as const })
                setExperimentResults(calculateExperimentResults({ ...selectedExperiment, status: "completed" as const }))
              }}
              onPause={() => {
                pauseExperiment(selectedExperiment.id)
                setSelectedExperiment({ ...selectedExperiment, status: "paused" as const })
              }}
              onResume={() => {
                resumeExperiment(selectedExperiment.id)
                setSelectedExperiment({ ...selectedExperiment, status: "active" as const })
              }}
            />
          )}
        </View>
      )}

      {showCreateModal && (
        <View className="absolute inset-0 z-50 items-center justify-center bg-black/70">
          <View className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[90%]">
            <Text className="text-lg font-bold text-white mb-4">🧪 Nuevo Experimento</Text>
            <ScrollView className="gap-4">
              <TextInput className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-white text-sm"
                placeholder="Nombre del experimento" placeholderTextColor="#6b7280"
                value={newExpName} onChangeText={setNewExpName} />
              <TextInput className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-white text-sm h-20"
                placeholder="Descripción (opcional)" placeholderTextColor="#6b7280" multiline
                value={newExpDesc} onChangeText={setNewExpDesc} />
              <View className="flex-row gap-2">
                <TouchableOpacity onPress={() => setNewExpType("habits")}
                  className={`flex-1 py-2 rounded-lg items-center ${newExpType === "habits" ? "bg-green-600" : "bg-gray-700"}`}>
                  <Text className="text-white text-sm">Hábitos</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setNewExpType("tasks")}
                  className={`flex-1 py-2 rounded-lg items-center ${newExpType === "tasks" ? "bg-blue-600" : "bg-gray-700"}`}>
                  <Text className="text-white text-sm">Tareas</Text>
                </TouchableOpacity>
              </View>
              <View>
                <Text className="text-sm text-gray-400 mb-1">Período (días)</Text>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity onPress={() => setNewExpPeriod(Math.max(1, newExpPeriod - 1))}
                    className="w-8 h-8 bg-gray-700 rounded-lg items-center justify-center">
                    <Text className="text-white">-</Text>
                  </TouchableOpacity>
                  <Text className="text-white font-medium w-8 text-center">{newExpPeriod}</Text>
                  <TouchableOpacity onPress={() => setNewExpPeriod(Math.min(365, newExpPeriod + 1))}
                    className="w-8 h-8 bg-gray-700 rounded-lg items-center justify-center">
                    <Text className="text-white">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {newExpType === "habits" && (
                <View>
                  <Text className="text-sm text-gray-400 mb-2">Hábitos a medir *</Text>
                  <View className="max-h-40 bg-gray-800/50 rounded-lg p-3 gap-2">
                    {habits.length === 0 ? <Text className="text-xs text-gray-500">Sin hábitos</Text> :
                      habits.map(h => (
                        <TouchableOpacity key={h.id} onPress={() => toggleHabitSelection(h.id)}
                          className={`flex-row items-center gap-2 p-2 rounded ${selectedHabitIds.includes(h.id) ? "bg-green-900/30 border border-green-500/50" : ""}`}>
                          <Text className={`text-sm ${selectedHabitIds.includes(h.id) ? "text-green-400" : "text-white"}`}>
                            {selectedHabitIds.includes(h.id) ? "✓" : "○"} {h.name}
                          </Text>
                          <Text className="text-xs text-gray-500 ml-auto">{h.completionRate}%</Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              )}
              {newExpType === "tasks" && (
                <View>
                  <Text className="text-sm text-gray-400 mb-2">Tareas a medir *</Text>
                  <View className="max-h-40 bg-gray-800/50 rounded-lg p-3 gap-2">
                    {tasks.length === 0 ? <Text className="text-xs text-gray-500">Sin tareas</Text> :
                      tasks.map(t => (
                        <TouchableOpacity key={t.id} onPress={() => toggleTaskSelection(t.id)}
                          className={`flex-row items-center gap-2 p-2 rounded ${selectedTaskIds.includes(t.id) ? "bg-blue-900/30 border border-blue-500/50" : ""}`}>
                          <Text className={`text-sm ${selectedTaskIds.includes(t.id) ? "text-blue-400" : "text-white"}`}>
                            {selectedTaskIds.includes(t.id) ? "✓" : "○"} {t.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              )}
              <View className="flex-row gap-2 pt-2">
                <TouchableOpacity onPress={() => setShowCreateModal(false)}
                  className="flex-1 py-2 bg-gray-700 rounded-lg items-center">
                  <Text className="text-white">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={createExperiment}
                  disabled={!newExpName || (newExpType === "habits" ? selectedHabitIds.length === 0 : selectedTaskIds.length === 0)}
                  className="flex-1 py-2 bg-green-600 disabled:bg-gray-700 rounded-lg items-center">
                  <Text className="text-white font-medium">Crear</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

function TwinCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <View className="flex-1 min-w-[45%] bg-gray-800/50 rounded-lg p-4">
      <Text className="text-xs text-gray-500 mb-1">{label}</Text>
      <Text className="text-lg font-bold text-white capitalize">{value}</Text>
      <Text className="text-xs text-gray-400">{sub}</Text>
    </View>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { active: "bg-green-900 text-green-400", completed: "bg-blue-900 text-blue-400", paused: "bg-yellow-900 text-yellow-400" }
  return <Text className={`text-xs px-2 py-0.5 rounded ${colors[status] || "bg-gray-900 text-gray-400"}`}>
    {status === "active" ? "Activo" : status === "completed" ? "Completado" : "Pausado"}
  </Text>
}

function TypeBadge({ type }: { type: string }) {
  return <Text className={`text-xs px-2 py-0.5 rounded ${type === "habits" ? "bg-green-900/50 text-green-400" : "bg-blue-900/50 text-blue-400"}`}>
    {type === "habits" ? "Hábitos" : "Tareas"}
  </Text>
}

function ActionBtn({ label, onPress, color }: { label: string; onPress: () => void; color: string }) {
  return (
    <TouchableOpacity onPress={onPress} className={`py-2 px-3 rounded-lg border ${color}`}>
      <Text>{label}</Text>
    </TouchableOpacity>
  )
}

function ExperimentResults({ experiment, results, habits, onBack, onComplete, onPause, onResume }: {
  experiment: Experiment; results: any; habits: any[]
  onBack: () => void; onComplete: () => void; onPause: () => void; onResume: () => void
}) {
  if (!results) return null
  const maxD = Math.max(1, ...results.dailyData.map((d: any) => d.completed + d.missed))
  return (
    <View className="gap-4">
      <TouchableOpacity onPress={onBack}>
        <Text className="text-gray-400 text-sm">← Volver a experimentos</Text>
      </TouchableOpacity>
      <Text className="text-lg font-bold text-white">🧪 Resultados: {experiment.name}</Text>

      <View className="flex-row flex-wrap gap-2">
        <MiniResCard label="Tasa Cumplimiento" value={`${results.completionRate}%`}
          color={results.completionRate > 70 ? "text-green-400" : results.completionRate > 40 ? "text-yellow-400" : "text-red-400"} />
        <MiniResCard label="Total Registros" value={results.totalLogs} color="text-blue-400" sub={`${results.completedLogs}✓ / ${results.missedLogs}✗`} />
        <MiniResCard label="Racha Promedio" value={`${results.avgStreak}d`} color="text-orange-400" />
        <MiniResCard label="Tendencia" value={results.trend === "up" ? "📈 Mejorando" : results.trend === "down" ? "📉 Empeorando" : "➡️ Estable"}
          color={results.trend === "up" ? "text-green-400" : results.trend === "down" ? "text-red-400" : "text-yellow-400"} />
      </View>

      <View className="flex-row flex-wrap gap-1">
        {experiment.linkedHabits.map((hid: string) => {
          const h = habits.find(x => x.id === hid)
          return h ? <Text key={hid} className="text-xs px-2 py-0.5 rounded bg-green-900/30 text-green-400 border border-green-500/30">{h.name}</Text> : null
        })}
      </View>

      <View className="bg-gray-800/50 rounded-lg p-4">
        <Text className="text-white font-medium mb-3">📊 Cumplimiento Diario</Text>
        <View className="gap-1">
          {results.dailyData.map((d: any, i: number) => (
            <View key={i} className="flex-row items-center gap-2">
              <Text className="text-xs text-gray-500 w-14">{d.date}</Text>
              <View className="flex-1 h-4 flex-row gap-0.5">
                <View className="h-full bg-green-500 rounded-l-sm" style={{ flex: Math.max(0.1, d.completed) }} />
                {d.missed > 0 && <View className="h-full bg-red-500" style={{ flex: d.missed }} />}
                {d.completed + d.missed === 0 && <View className="h-full flex-1 bg-gray-700 rounded-sm" />}
              </View>
              <Text className="text-xs text-green-400 w-4">{d.completed}</Text>
              <Text className="text-xs text-red-400 w-4">{d.missed}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="bg-gray-800/50 rounded-lg p-4">
        <Text className="text-white font-medium mb-3">🏆 Antes vs Después</Text>
        {results.beforeVsAfter.map((b: any, i: number) => {
          const rate = Math.round(b.completion)
          return (
            <View key={i} className="flex-row items-center gap-2 mb-2">
              <Text className="text-sm text-gray-300 w-32">{b.period}</Text>
              <View className="flex-1 h-4 bg-gray-700 rounded-sm overflow-hidden">
                <View className={`h-full ${rate > 50 ? "bg-green-500" : "bg-red-500"} rounded-sm`} style={{ width: `${rate}%` }} />
              </View>
              <Text className="text-sm font-bold text-white w-10 text-right">{rate}%</Text>
            </View>
          )
        })}
      </View>

      {results.categoryBreakdown.length > 0 && (
        <View className="bg-gray-800/50 rounded-lg p-4">
          <Text className="text-white font-medium mb-3">🎯 Desglose por Categoría</Text>
          {results.categoryBreakdown.map((cat: any, i: number) => (
            <View key={i} className="flex-row items-center gap-2 mb-2">
              <Text className="text-sm text-gray-300 capitalize w-20">{cat.category}</Text>
              <View className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                <View className={`h-full rounded-full ${cat.rate > 70 ? "bg-green-500" : cat.rate > 40 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${cat.rate}%` }} />
              </View>
              <Text className="text-sm font-bold text-white w-10 text-right">{cat.rate}%</Text>
            </View>
          ))}
        </View>
      )}

      <View className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
        <Text className="font-medium text-white mb-1">💡 Conclusión</Text>
        <Text className="text-sm text-gray-300">
          {results.totalLogs === 0
            ? `ℹ️ El experimento "${experiment.name}" aún no tiene registros.`
            : results.trend === "up"
              ? `✅ Tendencia positiva: ${results.beforeVsAfter[0].completion}% → ${results.beforeVsAfter[1].completion}%`
              : results.trend === "down"
                ? `⚠️ Tendencia negativa: ${results.beforeVsAfter[0].completion}% → ${results.beforeVsAfter[1].completion}%`
                : `ℹ️ Estable: ${results.completionRate}% de cumplimiento.`}
        </Text>
      </View>

      {experiment.status === "active" && (
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={onComplete} className="flex-1 py-2 bg-green-600 rounded-lg items-center">
            <Text className="text-white font-medium">Completar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onPause} className="py-2 px-4 bg-yellow-600 rounded-lg items-center">
            <Text className="text-white">⏸️</Text>
          </TouchableOpacity>
        </View>
      )}
      {experiment.status === "paused" && (
        <TouchableOpacity onPress={onResume} className="py-2 bg-blue-600 rounded-lg items-center">
          <Text className="text-white font-medium">Reanudar</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

function MiniResCard({ label, value, color, sub }: { label: string; value: string | number; color: string; sub?: string }) {
  return (
    <View className="flex-1 min-w-[45%] bg-gray-800/50 rounded-lg p-3">
      <Text className="text-xs text-gray-500">{label}</Text>
      <Text className={`text-lg font-bold ${color}`}>{value}</Text>
      {sub && <Text className="text-xs text-gray-500">{sub}</Text>}
    </View>
  )
}

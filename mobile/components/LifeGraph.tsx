import { useState, useMemo, useEffect } from "react"
import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native"
import Svg, { Circle, Line, Rect, Text as SvgText, G, Defs, Marker, Polygon, Filter, FeGaussianBlur, FeMerge, FeMergeNode } from "react-native-svg"
import { useStore } from "../shared/store"
import type { Goal } from "../shared/types"

const categoryColors: Record<string, { bg: string; border: string; text: string; line: string }> = {
  health: { bg: "bg-green-900/40", border: "border-green-500", text: "text-green-400", line: "#22c55e" },
  study: { bg: "bg-blue-900/40", border: "border-blue-500", text: "text-blue-400", line: "#3b82f6" },
  exercise: { bg: "bg-red-900/40", border: "border-red-500", text: "text-red-400", line: "#ef4444" },
  work: { bg: "bg-purple-900/40", border: "border-purple-500", text: "text-purple-400", line: "#a855f7" },
  personal: { bg: "bg-yellow-900/40", border: "border-yellow-500", text: "text-yellow-400", line: "#eab308" },
  other: { bg: "bg-gray-800/40", border: "border-gray-500", text: "text-gray-400", line: "#6b7280" },
}

const categoryLabels: Record<string, string> = {
  health: "Salud", study: "Estudio", exercise: "Ejercicio", work: "Trabajo", personal: "Personal", other: "Otro",
}

export default function LifeGraph() {
  const { habits, goals, addGoal, recalculateGoalProgress } = useStore()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [newGoalTitle, setNewGoalTitle] = useState("")
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([])

  useEffect(() => { recalculateGoalProgress() }, [habits, goals.length])

  const filteredHabits = useMemo(
    () => (selectedCategory === "all" ? habits : habits.filter(h => h.category === selectedCategory)),
    [habits, selectedCategory]
  )

  const categorizedHabits = useMemo(() => {
    const grouped: Record<string, typeof habits> = {}
    filteredHabits.forEach(h => {
      if (!grouped[h.category]) grouped[h.category] = []
      grouped[h.category].push(h)
    })
    return grouped
  }, [filteredHabits])

  const goalsWithHabits = useMemo(() => goals.filter(g => g.linkedHabits.length > 0), [goals])

  const getGoalProgress = (goal: Goal) => {
    const linkedHabits = habits.filter(h => goal.linkedHabits.includes(h.id))
    if (linkedHabits.length === 0) return goal.progress
    return Math.round(linkedHabits.reduce((acc, h) => acc + h.completionRate, 0) / linkedHabits.length)
  }

  const categories = Object.keys(categorizedHabits)

  const connectGoal = () => {
    if (!newGoalTitle.trim() || selectedHabitIds.length === 0) return
    addGoal({
      title: newGoalTitle.trim(),
      description: `Conectada a ${selectedHabitIds.length} hábito(s) desde Life Graph`,
      type: "quarterly",
      progress: 0,
      dueDate: new Date(Date.now() + 90 * 86400000).toISOString(),
      linkedHabits: selectedHabitIds,
      linkedTasks: [],
      status: "active",
    })
    setNewGoalTitle("")
    setSelectedHabitIds([])
  }

  const toggleHabitSelection = (id: string) => {
    setSelectedHabitIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const svgW = 600
  const svgH = 400
  const cx = svgW / 2
  const cy = svgH / 2

  const catNodes = categories.map((cat, i) => {
    const angle = (i / categories.length) * Math.PI * 2 - Math.PI / 2
    const r = 80
    return { id: `cat-${cat}`, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), label: categoryLabels[cat], category: cat }
  })

  const habitNodes = filteredHabits.map((h, i) => {
    const angle = (i / filteredHabits.length) * Math.PI * 2 - Math.PI / 2
    const r = 140
    return { id: h.id, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), label: h.name, category: h.category, rate: h.completionRate, streak: h.currentStreak }
  })

  const goalNodes = goalsWithHabits.map((g, i) => ({
    id: g.id, x: 80 + i * 160, y: 40, label: g.title, linkedHabits: g.linkedHabits,
  }))

  return (
    <ScrollView className="gap-4">
      <Text className="text-lg font-bold text-white">🕸️ Life Graph - Red de Hábitos</Text>

      <ScrollView horizontal className="gap-2">
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setSelectedCategory("all")}
            className={`px-3 py-1 rounded-lg ${selectedCategory === "all" ? "bg-blue-600" : "bg-gray-700"}`}
          >
            <Text className="text-white text-sm">Todos ({habits.length})</Text>
          </TouchableOpacity>
          {Object.entries(categoryColors).map(([cat, colors]) => {
            const count = habits.filter(h => h.category === cat).length
            if (count === 0) return null
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg ${selectedCategory === cat ? colors.bg : "bg-gray-700"}`}
              >
                <Text className={`text-sm ${selectedCategory === cat ? colors.text : "text-gray-400"}`}>
                  {categoryLabels[cat]} ({count})
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      <View className="border border-gray-700 rounded-xl overflow-hidden bg-gray-900">
        {filteredHabits.length === 0 ? (
          <View className="h-80 items-center justify-center">
            <Text className="text-5xl mb-4 opacity-30">🕸️</Text>
            <Text className="text-gray-500">No hay hábitos todavía</Text>
          </View>
        ) : (
          <Svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
            <Defs>
              {Object.entries(categoryColors).map(([cat, c]) => (
                <Marker key={cat} id={`arrow-${cat}`} markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <Polygon points="0 0, 8 3, 0 6" fill={c.line} />
                </Marker>
              ))}
            </Defs>
            {habitNodes.map(hn =>
              catNodes.filter(cn => cn.category === hn.category).map(cn => (
                <Line key={`${hn.id}-${cn.id}`} x1={hn.x} y1={hn.y} x2={cn.x} y2={cn.y}
                  stroke={categoryColors[hn.category || "other"].line} strokeWidth={1} strokeOpacity={0.3}
                  markerEnd={`url(#arrow-${hn.category || "other"})`} />
              ))
            )}
            {goalNodes.map(gn =>
              gn.linkedHabits.map(habitId => {
                const hn = habitNodes.find(n => n.id === habitId)
                if (!hn) return null
                return <Line key={`${gn.id}-${habitId}`} x1={hn.x} y1={hn.y} x2={gn.x} y2={gn.y}
                  stroke="#a855f7" strokeWidth={1} strokeOpacity={0.3} />
              })
            )}
            {goalNodes.map(gn => {
              const goal = goalsWithHabits.find(g => g.id === gn.id)
              if (!goal) return null
              const progress = getGoalProgress(goal)
              return (
                <G key={gn.id}>
                  <Rect x={gn.x - 60} y={gn.y - 18} width={120} height={36} rx={8} fill="#1f2937" stroke="#a855f7" strokeWidth={1.5} />
                  <SvgText x={gn.x} y={gn.y - 2} textAnchor="middle" fill="white" fontSize={10} fontWeight="bold">
                    {gn.label.length > 12 ? gn.label.slice(0, 12) + "..." : gn.label}
                  </SvgText>
                  <SvgText x={gn.x} y={gn.y + 10} textAnchor="middle" fill="#9ca3af" fontSize={8}>
                    {progress}% · {goal.linkedHabits.length} hábitos
                  </SvgText>
                </G>
              )
            })}
            {catNodes.map(cn => {
              const c = categoryColors[cn.category || "other"]
              const count = categorizedHabits[cn.category]?.length || 0
              return (
                <G key={cn.id}>
                  <Circle cx={cn.x} cy={cn.y} r={24} fill="#111827" stroke={c.line} strokeWidth={1.5} />
                  <SvgText x={cn.x} y={cn.y - 2} textAnchor="middle" fill={c.line} fontSize={9} fontWeight="bold">
                    {cn.label}
                  </SvgText>
                  <SvgText x={cn.x} y={cn.y + 10} textAnchor="middle" fill="#6b7280" fontSize={8}>
                    {count}
                  </SvgText>
                </G>
              )
            })}
            {habitNodes.map(hn => {
              const c = categoryColors[hn.category || "other"]
              return (
                <G key={hn.id}>
                  <Circle cx={hn.x} cy={hn.y} r={20} fill="#111827" stroke={c.line} strokeWidth={2} />
                  <Circle cx={hn.x} cy={hn.y} r={20 * (hn.rate || 0) / 100} fill={`${c.line}20`} />
                  <SvgText x={hn.x} y={hn.y - 3} textAnchor="middle" fill="white" fontSize={7} fontWeight="bold">
                    {hn.label.length > 8 ? hn.label.slice(0, 8) + "..." : hn.label}
                  </SvgText>
                  <SvgText x={hn.x} y={hn.y + 8} textAnchor="middle" fill={c.line} fontSize={6}>{hn.rate}%</SvgText>
                  {(hn.streak || 0) > 0 && (
                    <Circle cx={hn.x + 16} cy={hn.y - 15} r={5} fill="#f97316" />
                  )}
                </G>
              )
            })}
          </Svg>
        )}
      </View>

      <View className="flex-row gap-4">
        <View className="flex-1 bg-gray-800/30 border border-gray-700 rounded-xl p-4">
          <Text className="font-medium text-white mb-3">🔥 Hábitos por Categoría</Text>
          <View className="gap-2">
            {Object.entries(categorizedHabits).map(([cat, habitsInCat]) => {
              const c = categoryColors[cat]
              return (
                <View key={cat} className={`p-3 rounded-lg ${c.bg} border-l-2 ${c.border}`}>
                  <View className="flex-row justify-between mb-2">
                    <Text className={`text-sm font-medium ${c.text}`}>{categoryLabels[cat]}</Text>
                    <Text className="text-xs text-gray-400">{habitsInCat.length} hábitos</Text>
                  </View>
                  {habitsInCat.map(h => (
                    <View key={h.id} className="flex-row justify-between py-0.5">
                      <Text className="text-sm text-gray-300">{h.name}</Text>
                      <View className="flex-row items-center gap-1">
                        {h.currentStreak > 0 && (
                          <Text className="text-xs text-orange-400">🔥{h.currentStreak}</Text>
                        )}
                        <Text className={`text-xs ${h.completionRate > 70 ? "text-green-400" : h.completionRate > 40 ? "text-yellow-400" : "text-red-400"}`}>
                          {h.completionRate}%
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )
            })}
          </View>
        </View>

        <View className="flex-1 bg-gray-800/30 border border-gray-700 rounded-xl p-4">
          <Text className="font-medium text-white mb-3">🎯 Metas Conectadas</Text>
          {goalsWithHabits.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-3xl mb-2 opacity-50">🎯</Text>
              <Text className="text-gray-500 text-sm text-center">No hay metas con hábitos conectados</Text>
            </View>
          ) : (
            goalsWithHabits.map(goal => {
              const progress = getGoalProgress(goal)
              const linkedHabits = habits.filter(h => goal.linkedHabits.includes(h.id))
              return (
                <View key={goal.id} className="bg-gray-800/50 rounded-lg p-3 border-l-2 border-purple-500 mb-2">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="font-medium text-white text-sm" numberOfLines={1}>{goal.title}</Text>
                    <Text className="text-sm font-bold text-purple-400">{progress}%</Text>
                  </View>
                  <View className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-1">
                    <View className="h-full bg-purple-500 rounded-full" style={{ width: `${progress}%` }} />
                  </View>
                  <View className="flex-row flex-wrap gap-1">
                    {linkedHabits.map(h => (
                      <Text key={h.id} className={`text-xs px-1.5 py-0.5 rounded ${categoryColors[h.category].bg} ${categoryColors[h.category].text}`}>
                        {h.name}
                      </Text>
                    ))}
                  </View>
                </View>
              )
            })
          )}

          <View className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 mt-4">
            <Text className="font-medium text-white mb-2">Conectar Hábitos a Meta</Text>
            <TextInput
              className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-white text-sm mb-2"
              placeholder="Nombre de la meta"
              placeholderTextColor="#6b7280"
              value={newGoalTitle}
              onChangeText={setNewGoalTitle}
            />
            <View className="flex-row flex-wrap gap-2 mb-2">
              {habits.map(h => {
                const selected = selectedHabitIds.includes(h.id)
                const c = categoryColors[h.category]
                return (
                  <TouchableOpacity
                    key={h.id}
                    onPress={() => toggleHabitSelection(h.id)}
                    className={`px-2 py-1 rounded ${selected ? c.bg + " " + c.border : "bg-gray-700"}`}
                    style={selected ? { borderWidth: 1, borderColor: c.line } : {}}
                  >
                    <Text className={`text-xs ${selected ? c.text : "text-gray-400"}`}>{h.name}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
            <TouchableOpacity
              onPress={connectGoal}
              disabled={!newGoalTitle.trim() || selectedHabitIds.length === 0}
              className="py-2 bg-purple-600 disabled:bg-gray-700 rounded-lg items-center"
            >
              <Text className="text-white font-medium text-sm">Conectar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

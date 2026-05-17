import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native"
import { useStore } from "../shared/store"
import LifeGraph from "./LifeGraph"

export default function LifeOSHub() {
  const { habits, tasks, goals, decisions, protocols, plugins, addGoal, addDecision, togglePlugin } = useStore()
  const [activeModule, setActiveModule] = useState<"goals" | "lifegraph" | "decisions" | "protocols" | "plugins">("goals")
  const [newGoalTitle, setNewGoalTitle] = useState("")
  const [newDecision, setNewDecision] = useState("")

  const modules = [
    { id: "goals" as const, icon: "🎯", label: "Metas", color: "text-purple-400", desc: "OKRs y objetivos" },
    { id: "lifegraph" as const, icon: "🕸️", label: "Life Graph", color: "text-indigo-400", desc: "Visualización" },
    { id: "decisions" as const, icon: "🧠", label: "Decisiones", color: "text-pink-400", desc: "Matriz y priorización" },
    { id: "protocols" as const, icon: "📋", label: "Protocolos", color: "text-yellow-400", desc: "Sistemas" },
    { id: "plugins" as const, icon: "🧩", label: "Plugins", color: "text-cyan-400", desc: "Extensiones" },
  ]

  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) return
    addGoal({
      title: newGoalTitle.trim(),
      description: "",
      type: "quarterly",
      progress: 0,
      dueDate: new Date(Date.now() + 90 * 86400000).toISOString(),
      linkedHabits: [],
      linkedTasks: [],
      status: "active",
    })
    setNewGoalTitle("")
  }

  const handleAddDecision = () => {
    if (!newDecision.trim()) return
    addDecision({
      title: newDecision.trim(),
      options: [],
      matrix: 'simple',
      status: 'pending',
    })
    setNewDecision("")
  }

  return (
    <ScrollView className="gap-4">
      <View className="flex-row flex-wrap gap-2">
        {modules.map(mod => (
          <TouchableOpacity
            key={mod.id}
            onPress={() => setActiveModule(mod.id)}
            className={`flex-1 min-w-[45%] p-3 rounded-xl ${
              activeModule === mod.id ? "bg-gray-700 border border-gray-500" : "bg-gray-800/50 border border-gray-700"
            }`}
          >
            <Text className="text-xl mb-1">{mod.icon}</Text>
            <Text className="text-sm font-medium text-white">{mod.label}</Text>
            <Text className="text-xs text-gray-500">{mod.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeModule === "goals" && (
        <View className="gap-4">
          <Text className="text-lg font-bold text-white">🎯 Metas y OKRs</Text>
          <View className="gap-2">
            {goals.length === 0 ? (
              <View className="items-center py-8">
                <Text className="text-3xl mb-2 opacity-50">🎯</Text>
                <Text className="text-gray-500">No hay metas todavía</Text>
              </View>
            ) : (
              goals.map(goal => (
                <View key={goal.id} className="bg-gray-800/50 rounded-lg p-4 border-l-2 border-purple-500">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="font-medium text-white">{goal.title}</Text>
                    <Text className={`text-xs px-2 py-0.5 rounded ${
                      goal.status === "active" ? "bg-green-900 text-green-400" :
                      goal.status === "completed" ? "bg-blue-900 text-blue-400" :
                      "bg-gray-700 text-gray-400"
                    }`}>{goal.status}</Text>
                  </View>
                  {goal.description ? (
                    <Text className="text-sm text-gray-400 mb-2">{goal.description}</Text>
                  ) : null}
                  <View className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <View className="h-full bg-purple-500" style={{ width: `${goal.progress}%` }} />
                  </View>
                  <Text className="text-xs text-gray-500 mt-1">{goal.progress}% completado</Text>
                </View>
              ))
            )}
          </View>

          <View className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
            <Text className="font-medium text-white mb-2">Nueva Meta</Text>
            <TextInput
              className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-white text-sm"
              placeholder="Título de la meta"
              placeholderTextColor="#6b7280"
              value={newGoalTitle}
              onChangeText={setNewGoalTitle}
              onSubmitEditing={handleAddGoal}
            />
            <TouchableOpacity onPress={handleAddGoal} className="mt-2 py-2 bg-purple-600 rounded-lg items-center">
              <Text className="text-white font-medium">Crear Meta</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {activeModule === "lifegraph" && <LifeGraph />}

      {activeModule === "decisions" && (
        <View className="gap-4">
          <Text className="text-lg font-bold text-white">🧠 Matriz de Decisiones</Text>

          <View className="flex-row flex-wrap gap-4">
            <View className="flex-1 min-w-[45%] bg-gray-800/50 rounded-lg p-4">
              <Text className="font-medium text-green-400 mb-1">🔥 Urgente + Importante</Text>
              <Text className="text-xs text-gray-500 mb-2">Hacer ahora</Text>
              {tasks.filter(t => t.priority === "urgent").map(t => (
                <Text key={t.id} className="text-sm text-white bg-gray-700 px-2 py-1 rounded mb-1">{t.title}</Text>
              ))}
              {tasks.filter(t => t.priority === "urgent").length === 0 && (
                <Text className="text-xs text-gray-600">Sin tareas urgentes</Text>
              )}
            </View>
            <View className="flex-1 min-w-[45%] bg-gray-800/50 rounded-lg p-4">
              <Text className="font-medium text-yellow-400 mb-1">⏰ Urgente + No Importante</Text>
              <Text className="text-xs text-gray-500">Delegar o reprogramar</Text>
            </View>
            <View className="flex-1 min-w-[45%] bg-gray-800/50 rounded-lg p-4">
              <Text className="font-medium text-blue-400 mb-1">📅 No Urgente + Importante</Text>
              <Text className="text-xs text-gray-500">Planificar</Text>
            </View>
            <View className="flex-1 min-w-[45%] bg-gray-800/50 rounded-lg p-4">
              <Text className="font-medium text-gray-400 mb-1">🗑️ No Urgente + No Importante</Text>
              <Text className="text-xs text-gray-500">Eliminar</Text>
            </View>
          </View>

          <View className="bg-pink-900/20 border border-pink-500/30 rounded-xl p-4">
            <Text className="font-medium text-white mb-2">Registrar Decisión</Text>
            <TextInput
              className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-white text-sm"
              placeholder="¿Qué decisión tomaste?"
              placeholderTextColor="#6b7280"
              value={newDecision}
              onChangeText={setNewDecision}
            />
            <TouchableOpacity onPress={handleAddDecision} className="mt-2 py-2 bg-pink-600 rounded-lg items-center">
              <Text className="text-white font-medium">Guardar Decisión</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {activeModule === "protocols" && (
        <View className="gap-4">
          <Text className="text-lg font-bold text-white">📋 Sistemas de Protocolos</Text>
          {protocols.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-3xl mb-2 opacity-50">📋</Text>
              <Text className="text-gray-500">No hay protocolos todavía</Text>
            </View>
          ) : (
            protocols.map(protocol => (
              <View key={protocol.id} className="bg-gray-800/50 rounded-lg p-3">
                <Text className="font-medium text-white">{protocol.name}</Text>
                <Text className="text-sm text-gray-400">{protocol.description}</Text>
                <View className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <View className="h-full bg-yellow-500 rounded-full" style={{ width: `${protocol.progress}%` }} />
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {activeModule === "plugins" && (
        <View className="gap-4">
          <Text className="text-lg font-bold text-white">🧩 Plugins y Extensiones</Text>
          <View className="gap-2">
            {plugins.map(plugin => (
              <View key={plugin.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="font-medium text-white">{plugin.name}</Text>
                      {plugin.enabled && <View className="w-2 h-2 bg-green-500 rounded-full" />}
                    </View>
                    <Text className="text-sm text-gray-400">{plugin.description}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => togglePlugin(plugin.id)}
                    className={`px-3 py-1 rounded-lg ${plugin.enabled ? "bg-green-600" : "bg-gray-700"}`}
                  >
                    <Text className="text-white text-sm">{plugin.enabled ? "Desactivar" : "Activar"}</Text>
                  </TouchableOpacity>
                </View>
                {plugin.enabled && (
                  <View className="mt-3 pt-3 border-t border-gray-700/50">
                    <Text className="text-xs text-green-400 font-bold uppercase tracking-wider">✓ Sincronización Activa</Text>
                    <Text className="text-xs text-gray-500 mt-1 italic">
                      {plugin.id === "fit" ? "Última lectura: 12,450 pasos" :
                       plugin.id === "gcal" ? "Calendario sincronizado" :
                       "Bot activo: Escuchando eventos"}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  )
}

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity } from "react-native"
import { useStore } from "../shared/store"

export default function GoalsSection() {
  const goals = useStore((s) => s.goals)
  const addGoal = useStore((s) => s.addGoal)
  const updateGoal = useStore((s) => s.updateGoal)
  const deleteGoal = useStore((s) => s.deleteGoal)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [showForm, setShowForm] = useState(false)

  const handleAdd = () => {
    if (!title.trim()) return
    addGoal({
      title: title.trim(),
      description: description.trim(),
      type: "monthly",
      progress: 0,
      dueDate: "",
      linkedHabits: [],
      linkedTasks: [],
      status: "active",
    })
    setTitle("")
    setDescription("")
    setShowForm(false)
  }

  return (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-white">Metas</Text>
        <TouchableOpacity
          onPress={() => setShowForm(!showForm)}
          className="bg-purple-600 px-3 py-1.5 rounded-lg"
        >
          <Text className="text-white text-sm">+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {showForm ? (
        <View className="bg-gray-800 rounded-xl p-4 mb-4">
          <TextInput
            className="bg-gray-700 text-white rounded-lg p-3 mb-2"
            placeholder="Título de la meta"
            placeholderTextColor="#6b7280"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            className="bg-gray-700 text-white rounded-lg p-3 mb-3"
            placeholder="Descripción"
            placeholderTextColor="#6b7280"
            value={description}
            onChangeText={setDescription}
          />
          <TouchableOpacity
            onPress={handleAdd}
            className="bg-purple-600 py-2 rounded-lg items-center"
          >
            <Text className="text-white font-semibold">Guardar</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {goals.length === 0 ? (
        <Text className="text-gray-500">No hay metas definidas</Text>
      ) : (
        goals.map((goal) => (
          <View
            key={goal.id}
            className="bg-gray-800 rounded-xl p-4 mb-3"
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white font-semibold flex-1">
                {goal.title}
              </Text>
              <TouchableOpacity onPress={() => deleteGoal(goal.id)}>
                <Text className="text-gray-500">✕</Text>
              </TouchableOpacity>
            </View>
            {goal.description ? (
              <Text className="text-gray-400 text-sm mb-2">
                {goal.description}
              </Text>
            ) : null}
            <View className="bg-gray-700 rounded-full h-2 mb-1">
              <View
                className="bg-purple-500 rounded-full h-2"
                style={{ width: `${Math.min(goal.progress, 100)}%` }}
              />
            </View>
            <Text className="text-gray-400 text-xs">{goal.progress}%</Text>
          </View>
        ))
      )}
    </View>
  )
}

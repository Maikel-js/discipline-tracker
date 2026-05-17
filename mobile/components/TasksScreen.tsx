import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { useState } from "react"
import { useStore } from "../shared/store"
import TaskCard from "./TaskCard"
import TaskFormModal from "./TaskFormModal"

export default function TasksScreen() {
  const tasks = useStore((s) => s.tasks)
  const advanceTask = useStore((s) => s.advanceTask)
  const deleteTask = useStore((s) => s.deleteTask)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<string>("all")

  const filtered =
    filter === "all"
      ? tasks
      : tasks.filter((t) => t.status === filter)

  const statusCounts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    doing: tasks.filter((t) => t.status === "doing").length,
    done: tasks.filter((t) => t.status === "done").length,
  }

  return (
    <View className="flex-1 bg-gray-900">
      <View className="p-4 pt-12">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-white">Tareas</Text>
          <TouchableOpacity
            onPress={() => setShowForm(true)}
            className="bg-blue-600 px-4 py-2 rounded-xl"
          >
            <Text className="text-white font-semibold">+ Nueva</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-2 mb-2">
          <View className="flex-1 bg-yellow-700/30 rounded-xl p-2 items-center">
            <Text className="text-yellow-400 font-bold text-lg">
              {statusCounts.todo}
            </Text>
            <Text className="text-yellow-300/70 text-xs">Por hacer</Text>
          </View>
          <View className="flex-1 bg-blue-700/30 rounded-xl p-2 items-center">
            <Text className="text-blue-400 font-bold text-lg">
              {statusCounts.doing}
            </Text>
            <Text className="text-blue-300/70 text-xs">En curso</Text>
          </View>
          <View className="flex-1 bg-green-700/30 rounded-xl p-2 items-center">
            <Text className="text-green-400 font-bold text-lg">
              {statusCounts.done}
            </Text>
            <Text className="text-green-300/70 text-xs">Completadas</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-2"
        >
          <View className="flex-row gap-2">
            {["all", "todo", "doing", "done"].map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                className={`px-4 py-2 rounded-full ${
                  filter === f ? "bg-blue-600" : "bg-gray-800"
                }`}
              >
                <Text
                  className={`text-sm ${
                    filter === f ? "text-white" : "text-gray-400"
                  }`}
                >
                  {f === "all"
                    ? "Todas"
                    : f === "todo"
                      ? "Por hacer"
                      : f === "doing"
                        ? "En curso"
                        : "Completadas"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-4">
        {filtered.length === 0 ? (
          <Text className="text-gray-500 text-center mt-8">
            No hay tareas. ¡Crea tu primera tarea!
          </Text>
        ) : (
          filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onAdvance={() => advanceTask(task.id)}
              onDelete={() => deleteTask(task.id)}
            />
          ))
        )}
      </ScrollView>

      <TaskFormModal
        visible={showForm}
        onClose={() => setShowForm(false)}
      />
    </View>
  )
}

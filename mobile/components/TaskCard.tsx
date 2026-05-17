import { View, Text, TouchableOpacity } from "react-native"
import type { Task } from "../shared/types"

const priorityColors: Record<string, string> = {
  low: "border-blue-500",
  medium: "border-yellow-500",
  high: "border-orange-500",
  urgent: "border-red-500",
}

const statusLabels: Record<string, string> = {
  todo: "Por hacer",
  doing: "En curso",
  done: "Completada",
}

export default function TaskCard({
  task,
  onAdvance,
  onDelete,
}: {
  task: Task
  onAdvance: () => void
  onDelete: () => void
}) {
  const subtasksDone = task.subtasks.filter((s) => s.completed).length

  return (
    <View
      className={`mb-3 bg-gray-800 rounded-xl p-4 border-l-4 ${
        task.isBlocked
          ? "border-red-500 opacity-60"
          : priorityColors[task.priority] || "border-gray-600"
      }`}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text
            className={`text-base font-semibold ${
              task.status === "done" ? "text-gray-500 line-through" : "text-white"
            }`}
          >
            {task.title}
          </Text>
          {task.description ? (
            <Text className="text-gray-400 text-sm mt-1">
              {task.description}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity onPress={onDelete}>
          <Text className="text-gray-500 text-lg">✕</Text>
        </TouchableOpacity>
      </View>

      {task.isBlocked && task.blockReason ? (
        <View className="bg-red-900/30 rounded-lg p-2 mb-2">
          <Text className="text-red-400 text-xs">{task.blockReason}</Text>
        </View>
      ) : null}

      <View className="flex-row items-center gap-3 mb-2">
        <View
          className={`px-2 py-0.5 rounded-md ${
            task.status === "todo"
              ? "bg-yellow-700/40"
              : task.status === "doing"
                ? "bg-blue-700/40"
                : "bg-green-700/40"
          }`}
        >
          <Text
            className={`text-xs ${
              task.status === "todo"
                ? "text-yellow-400"
                : task.status === "doing"
                  ? "text-blue-400"
                  : "text-green-400"
            }`}
          >
            {statusLabels[task.status]}
          </Text>
        </View>
        {task.subtasks.length > 0 ? (
          <Text className="text-gray-500 text-xs">
            Subtareas: {subtasksDone}/{task.subtasks.length}
          </Text>
        ) : null}
      </View>

      {task.status !== "done" && !task.isBlocked ? (
        <TouchableOpacity
          onPress={onAdvance}
          className="bg-blue-600 py-2 rounded-lg items-center"
        >
          <Text className="text-white font-semibold text-sm">
            {task.status === "todo"
              ? "Empezar"
              : task.status === "doing"
                ? "Completar"
                : "Siguiente"}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

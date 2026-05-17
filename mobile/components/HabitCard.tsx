import { View, Text, TouchableOpacity } from "react-native"
import type { Habit } from "../shared/types"

const priorityColors: Record<string, string> = {
  low: "bg-blue-500/20 border-blue-500",
  medium: "bg-yellow-500/20 border-yellow-500",
  high: "bg-orange-500/20 border-orange-500",
  urgent: "bg-red-500/20 border-red-500",
}

const statusIcons: Record<string, string> = {
  completed: "✅",
  pending: "⏳",
  missed: "❌",
}

export default function HabitCard({
  habit,
  onComplete,
  onMiss,
}: {
  habit: Habit
  onComplete: () => void
  onMiss: () => void
}) {
  return (
    <View
      className={`mb-3 rounded-xl p-4 border-l-4 ${
        priorityColors[habit.priority] || "bg-gray-800 border-gray-600"
      }`}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1">
          <Text className="text-lg mr-2">
            {statusIcons[habit.status] || "⏳"}
          </Text>
          <Text className="text-white font-semibold text-base flex-1">
            {habit.name}
          </Text>
        </View>
        <View className="bg-gray-700 px-2 py-1 rounded-md">
          <Text className="text-xs text-gray-300">{habit.frequency}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-4 mb-3">
        <View className="flex-row items-center">
          <Text className="text-yellow-400 text-sm mr-1">★</Text>
          <Text className="text-gray-400 text-sm">
            {habit.currentStreak}
          </Text>
        </View>
        <Text className="text-gray-500">|</Text>
        <Text className="text-gray-400 text-sm">{habit.scheduledTime}</Text>
        <Text className="text-gray-500">|</Text>
        <Text className="text-gray-400 text-sm">{habit.category}</Text>
      </View>

      <View className="flex-row gap-2">
        {habit.status !== "completed" && (
          <TouchableOpacity
            onPress={onComplete}
            className="flex-1 bg-green-600 py-2 rounded-lg items-center"
          >
            <Text className="text-white font-semibold text-sm">Completar</Text>
          </TouchableOpacity>
        )}
        {habit.status !== "missed" && habit.status !== "completed" && (
          <TouchableOpacity
            onPress={onMiss}
            className="flex-1 bg-red-700 py-2 rounded-lg items-center"
          >
            <Text className="text-white font-semibold text-sm">Perdido</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

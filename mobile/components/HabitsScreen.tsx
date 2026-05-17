import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { useState } from "react"
import { useStore } from "../shared/store"
import HabitCard from "./HabitCard"
import HabitFormModal from "./HabitFormModal"
import NotificationSystem from "./NotificationSystem"

export default function HabitsScreen() {
  const habits = useStore((s) => s.habits)
  const completeHabit = useStore((s) => s.completeHabit)
  const missHabit = useStore((s) => s.missHabit)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<string>("all")

  const filtered =
    filter === "all"
      ? habits
      : filter === "pending"
        ? habits.filter((h) => h.status === "pending")
        : filter === "completed"
          ? habits.filter((h) => h.status === "completed")
          : habits

  return (
    <View className="flex-1 bg-gray-900">
      <View className="p-4 pt-12">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-white">Hábitos</Text>
          <TouchableOpacity
            onPress={() => setShowForm(true)}
            className="bg-purple-600 px-4 py-2 rounded-xl"
          >
            <Text className="text-white font-semibold">+ Nuevo</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          <View className="flex-row gap-2">
            {["all", "pending", "completed", "missed"].map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                className={`px-4 py-2 rounded-full ${
                  filter === f ? "bg-purple-600" : "bg-gray-800"
                }`}
              >
                <Text
                  className={`text-sm ${
                    filter === f ? "text-white" : "text-gray-400"
                  }`}
                >
                  {f === "all"
                    ? "Todos"
                    : f === "pending"
                      ? "Pendientes"
                      : f === "completed"
                        ? "Completados"
                        : "Perdidos"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-4">
        {filtered.length === 0 ? (
          <Text className="text-gray-500 text-center mt-8">
            No hay hábitos. ¡Crea tu primer hábito!
          </Text>
        ) : (
          filtered.map((habit) => (
            <View key={habit.id}>
              <HabitCard
                habit={habit}
                onComplete={() => completeHabit(habit.id)}
                onMiss={() => missHabit(habit.id)}
              />
              {habit.status === "pending" && (
                <NotificationSystem habit={habit} />
              )}
            </View>
          ))
        )}
      </ScrollView>

      <HabitFormModal
        visible={showForm}
        onClose={() => setShowForm(false)}
      />
    </View>
  )
}

import { useState } from "react"
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native"
import { useStore } from "../shared/store"
import type { Category, Priority, HabitFrequency } from "../shared/types"

const categories: Category[] = [
  "health",
  "study",
  "exercise",
  "work",
  "personal",
  "other",
]
const priorities: Priority[] = ["low", "medium", "high", "urgent"]
const frequencies: HabitFrequency[] = ["daily", "weekly", "monthly"]

export default function HabitFormModal({
  visible,
  onClose,
}: {
  visible: boolean
  onClose: () => void
}) {
  const addHabit = useStore((s) => s.addHabit)
  const [name, setName] = useState("")
  const [scheduledTime, setScheduledTime] = useState("08:00")
  const [frequency, setFrequency] = useState<HabitFrequency>("daily")
  const [priority, setPriority] = useState<Priority>("medium")
  const [category, setCategory] = useState<Category>("personal")
  const [streakGoal, setStreakGoal] = useState("7")

  const handleSubmit = () => {
    if (!name.trim()) return
    addHabit({
      name: name.trim(),
      scheduledTime,
      frequency,
      priority,
      streakGoal: parseInt(streakGoal) || 7,
      category,
      prerequisites: [],
      status: "pending",
    })
    setName("")
    setScheduledTime("08:00")
    setFrequency("daily")
    setPriority("medium")
    setCategory("personal")
    setStreakGoal("7")
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-gray-800 rounded-t-3xl p-6 max-h-[80%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-white">
              Nuevo Hábito
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-400 text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            <Text className="text-gray-300 text-sm mb-2">Nombre</Text>
            <TextInput
              className="bg-gray-700 text-white rounded-xl p-3 mb-4"
              placeholder="Ej: Meditar 10 min"
              placeholderTextColor="#6b7280"
              value={name}
              onChangeText={setName}
            />

            <Text className="text-gray-300 text-sm mb-2">Horario</Text>
            <TextInput
              className="bg-gray-700 text-white rounded-xl p-3 mb-4"
              placeholder="08:00"
              placeholderTextColor="#6b7280"
              value={scheduledTime}
              onChangeText={setScheduledTime}
            />

            <Text className="text-gray-300 text-sm mb-2">Frecuencia</Text>
            <View className="flex-row gap-2 mb-4">
              {frequencies.map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFrequency(f)}
                  className={`flex-1 py-2 rounded-xl items-center ${
                    frequency === f ? "bg-purple-600" : "bg-gray-700"
                  }`}
                >
                  <Text className="text-white text-sm">
                    {f === "daily"
                      ? "Diario"
                      : f === "weekly"
                        ? "Semanal"
                        : "Mensual"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-gray-300 text-sm mb-2">Prioridad</Text>
            <View className="flex-row gap-2 mb-4">
              {priorities.map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-xl items-center ${
                    priority === p ? "bg-purple-600" : "bg-gray-700"
                  }`}
                >
                  <Text className="text-white text-sm capitalize">{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-gray-300 text-sm mb-2">Categoría</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {categories.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategory(c)}
                  className={`px-3 py-2 rounded-xl ${
                    category === c ? "bg-purple-600" : "bg-gray-700"
                  }`}
                >
                  <Text className="text-white text-sm capitalize">{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-gray-300 text-sm mb-2">
              Meta de racha (días)
            </Text>
            <TextInput
              className="bg-gray-700 text-white rounded-xl p-3 mb-6"
              keyboardType="numeric"
              value={streakGoal}
              onChangeText={setStreakGoal}
            />

            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-purple-600 py-3 rounded-xl items-center mb-4"
            >
              <Text className="text-white font-semibold text-base">
                Crear Hábito
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

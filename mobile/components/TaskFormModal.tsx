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
import type { Priority, TaskStatus } from "../shared/types"

export default function TaskFormModal({
  visible,
  onClose,
}: {
  visible: boolean
  onClose: () => void
}) {
  const addTask = useStore((s) => s.addTask)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [status, setStatus] = useState<TaskStatus>("todo")
  const [dueDate, setDueDate] = useState("")

  const handleSubmit = () => {
    if (!title.trim()) return
    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status,
      dueDate: dueDate || undefined,
      allowReset: false,
      subtasks: [],
      dependencies: [],
      reminders: [],
      prerequisites: [],
    })
    setTitle("")
    setDescription("")
    setPriority("medium")
    setStatus("todo")
    setDueDate("")
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-gray-800 rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-white">Nueva Tarea</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-400 text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            <Text className="text-gray-300 text-sm mb-2">Título</Text>
            <TextInput
              className="bg-gray-700 text-white rounded-xl p-3 mb-4"
              placeholder="Ej: Terminar reporte"
              placeholderTextColor="#6b7280"
              value={title}
              onChangeText={setTitle}
            />

            <Text className="text-gray-300 text-sm mb-2">Descripción</Text>
            <TextInput
              className="bg-gray-700 text-white rounded-xl p-3 mb-4"
              placeholder="Opcional"
              placeholderTextColor="#6b7280"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text className="text-gray-300 text-sm mb-2">Prioridad</Text>
            <View className="flex-row gap-2 mb-4">
              {(["low", "medium", "high", "urgent"] as Priority[]).map(
                (p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-xl items-center ${
                      priority === p ? "bg-blue-600" : "bg-gray-700"
                    }`}
                  >
                    <Text className="text-white text-sm capitalize">{p}</Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <Text className="text-gray-300 text-sm mb-2">Fecha límite</Text>
            <TextInput
              className="bg-gray-700 text-white rounded-xl p-3 mb-6"
              placeholder="YYYY-MM-DD (opcional)"
              placeholderTextColor="#6b7280"
              value={dueDate}
              onChangeText={setDueDate}
            />

            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-blue-600 py-3 rounded-xl items-center mb-4"
            >
              <Text className="text-white font-semibold text-base">
                Crear Tarea
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

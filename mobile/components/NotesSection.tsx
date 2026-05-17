import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity } from "react-native"
import { useStore } from "../shared/store"
import type { Category } from "../shared/types"

const categories: Category[] = [
  "health",
  "study",
  "exercise",
  "work",
  "personal",
  "other",
]

export default function NotesSection() {
  const notes = useStore((s) => s.notes)
  const addNote = useStore((s) => s.addNote)
  const deleteNote = useStore((s) => s.deleteNote)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState<Category>("personal")
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = search
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.content.toLowerCase().includes(search.toLowerCase())
      )
    : notes

  const handleAdd = () => {
    if (!title.trim()) return
    addNote({
      title: title.trim(),
      content: content.trim(),
      category,
      tags: [],
    })
    setTitle("")
    setContent("")
    setShowForm(false)
  }

  return (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-white">Notas</Text>
        <TouchableOpacity
          onPress={() => setShowForm(!showForm)}
          className="bg-purple-600 px-3 py-1.5 rounded-lg"
        >
          <Text className="text-white text-sm">+ Nueva</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        className="bg-gray-800 text-white rounded-xl p-3 mb-4"
        placeholder="Buscar notas..."
        placeholderTextColor="#6b7280"
        value={search}
        onChangeText={setSearch}
      />

      {showForm ? (
        <View className="bg-gray-800 rounded-xl p-4 mb-4">
          <TextInput
            className="bg-gray-700 text-white rounded-lg p-3 mb-2"
            placeholder="Título"
            placeholderTextColor="#6b7280"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            className="bg-gray-700 text-white rounded-lg p-3 mb-2"
            placeholder="Contenido"
            placeholderTextColor="#6b7280"
            value={content}
            onChangeText={setContent}
            multiline
          />
          <View className="flex-row flex-wrap gap-2 mb-3">
            {categories.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                className={`px-3 py-1 rounded-full ${
                  category === c ? "bg-purple-600" : "bg-gray-700"
                }`}
              >
                <Text className="text-white text-xs capitalize">{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            onPress={handleAdd}
            className="bg-purple-600 py-2 rounded-lg items-center"
          >
            <Text className="text-white font-semibold">Guardar</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {filtered.length === 0 ? (
        <Text className="text-gray-500">No hay notas</Text>
      ) : (
        filtered.map((note) => (
          <View key={note.id} className="bg-gray-800 rounded-xl p-4 mb-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-white font-semibold">{note.title}</Text>
              <TouchableOpacity onPress={() => deleteNote(note.id)}>
                <Text className="text-gray-500">✕</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-gray-400 text-sm mb-2">{note.content}</Text>
            <View className="flex-row items-center gap-2">
              <View className="bg-gray-700 px-2 py-0.5 rounded-md">
                <Text className="text-xs text-gray-300 capitalize">
                  {note.category}
                </Text>
              </View>
              <Text className="text-gray-600 text-xs">
                {new Date(note.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  )
}

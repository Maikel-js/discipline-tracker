import { useState } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import NotesSection from "./NotesSection"
import ProtocolsSection from "./ProtocolsSection"

export default function NotesProtocols() {
  const [activeView, setActiveView] = useState<"notes" | "protocols">("notes")

  return (
    <View className="gap-4">
      <View className="flex-row bg-gray-800 p-1 rounded-2xl border border-gray-700">
        <TouchableOpacity
          onPress={() => setActiveView("notes")}
          className={`flex-1 items-center py-2 rounded-xl ${
            activeView === "notes" ? "bg-blue-600" : ""
          }`}
        >
          <Text
            className={`text-sm font-bold ${
              activeView === "notes" ? "text-white" : "text-gray-400"
            }`}
          >
            📝 Notas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveView("protocols")}
          className={`flex-1 items-center py-2 rounded-xl ${
            activeView === "protocols" ? "bg-blue-600" : ""
          }`}
        >
          <Text
            className={`text-sm font-bold ${
              activeView === "protocols" ? "text-white" : "text-gray-400"
            }`}
          >
            📋 Protocolos
          </Text>
        </TouchableOpacity>
      </View>
      {activeView === "notes" ? <NotesSection /> : <ProtocolsSection />}
    </View>
  )
}

import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { useState } from "react"
import GoalsSection from "./GoalsSection"
import NotesSection from "./NotesSection"
import ProtocolsSection from "./ProtocolsSection"
import SettingsSection from "./SettingsSection"
import UserProfile from "./UserProfile"
import AuditPanel from "./AuditPanel"
import SensorIntegration from "./SensorIntegration"
import AccountabilityPartnerPanel from "./AccountabilityPartner"
import NotesProtocols from "./NotesProtocols"
import StatsDashboard from "./StatsDashboard"
import AutoScheduler from "./AutoScheduler"
import DownloadPortal from "./DownloadPortal"
import AnalyticsHub from "./AnalyticsHub"
import LifeGraph from "./LifeGraph"
import AdvancedAIHub from "./AdvancedAIHub"
import LifeOSHub from "./LifeOSHub"

type Section =
  | "goals"
  | "notesprotocols"
  | "settings"
  | "profile"
  | "audit"
  | "sensors"
  | "partners"
  | "stats"
  | "schedule"
  | "downloads"
  | "analytics"
  | "lifegraph"
  | "ai"
  | "lifeos"

const sections: { key: Section; label: string; icon: string }[] = [
  { key: "goals", label: "Metas", icon: "🎯" },
  { key: "notesprotocols", label: "Notas/Prot", icon: "📝" },
  { key: "stats", label: "Stats", icon: "📊" },
  { key: "analytics", label: "Analytics", icon: "📈" },
  { key: "schedule", label: "Horario", icon: "⏰" },
  { key: "lifegraph", label: "Life Graph", icon: "🕸️" },
  { key: "ai", label: "IA", icon: "🧠" },
  { key: "lifeos", label: "Life OS", icon: "🔄" },
  { key: "downloads", label: "Descargas", icon: "📥" },
  { key: "profile", label: "Perfil", icon: "👤" },
  { key: "settings", label: "Ajustes", icon: "⚙️" },
  { key: "audit", label: "Auditoría", icon: "🗑" },
  { key: "sensors", label: "Sensores", icon: "📡" },
  { key: "partners", label: "Partners", icon: "🤝" },
]

export default function MoreScreen() {
  const [activeSection, setActiveSection] = useState<Section>("goals")

  const renderSection = () => {
    switch (activeSection) {
      case "goals":
        return <GoalsSection />
      case "notesprotocols":
        return <NotesProtocols />
      case "stats":
        return <StatsDashboard />
      case "analytics":
        return <AnalyticsHub />
      case "schedule":
        return <AutoScheduler />
      case "lifegraph":
        return <LifeGraph />
      case "ai":
        return <AdvancedAIHub />
      case "lifeos":
        return <LifeOSHub />
      case "downloads":
        return <DownloadPortal />
      case "profile":
        return <UserProfile />
      case "settings":
        return <SettingsSection />
      case "audit":
        return <AuditPanel />
      case "sensors":
        return <SensorIntegration />
      case "partners":
        return <AccountabilityPartnerPanel />
      default:
        return null
    }
  }

  return (
    <View className="flex-1 bg-gray-900">
      <View className="p-4 pt-12">
        <Text className="text-2xl font-bold text-white mb-4">Más</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          <View className="flex-row gap-2">
            {sections.map((s) => (
              <TouchableOpacity
                key={s.key}
                onPress={() => setActiveSection(s.key)}
                className={`flex-row items-center px-4 py-2 rounded-full ${
                  activeSection === s.key ? "bg-purple-600" : "bg-gray-800"
                }`}
              >
                <Text className="mr-1">{s.icon}</Text>
                <Text
                  className={`text-sm ${
                    activeSection === s.key
                      ? "text-white"
                      : "text-gray-400"
                  }`}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      <ScrollView className="flex-1 px-4">{renderSection()}</ScrollView>
    </View>
  )
}

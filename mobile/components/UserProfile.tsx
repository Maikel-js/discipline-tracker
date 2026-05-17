import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity } from "react-native"
import { useAuth } from "../shared/auth"
import { useStore } from "../shared/store"

export default function UserProfile() {
  const { user, logout, updateProfile } = useAuth()
  const { settings, updateSettings, stats } = useStore()
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(user?.name || "")
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "synced"
  >("idle")

  if (!user) return null

  const handleSaveName = () => {
    updateProfile({ name })
    setEditingName(false)
  }

  const handleSync = async () => {
    setSyncStatus("syncing")
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setSyncStatus("synced")
    setTimeout(() => setSyncStatus("idle"), 2000)
  }

  return (
    <View className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-white">👤 Perfil</Text>
        <TouchableOpacity
          onPress={logout}
          className="flex-row items-center gap-2"
        >
          <Text className="text-red-400 text-sm">🚪 Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <View className="gap-3">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 bg-green-500/20 rounded-full items-center justify-center">
            <Text className="text-green-400 font-bold text-xl">
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            {editingName ? (
              <View className="flex-row gap-2">
                <TextInput
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm flex-1"
                  value={name}
                  onChangeText={setName}
                />
                <TouchableOpacity onPress={handleSaveName}>
                  <Text className="text-green-400 text-sm">Guardar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setName(user.name)
                  setEditingName(true)
                }}
              >
                <Text className="text-white font-medium">{user.name}</Text>
              </TouchableOpacity>
            )}
            <Text className="text-gray-400 text-sm">📧 {user.email}</Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 bg-gray-700/50 rounded-lg p-3">
            <Text className="text-gray-400 text-xs mb-1">🏆 Score</Text>
            <Text className="text-white font-bold">
              {stats.disciplinaryScore}
            </Text>
          </View>
          <View className="flex-1 bg-gray-700/50 rounded-lg p-3">
            <Text className="text-gray-400 text-xs mb-1">🔥 Nivel</Text>
            <Text className="text-white font-bold">{stats.level}</Text>
          </View>
        </View>
      </View>

      <View className="border-t border-gray-700 pt-4 gap-3">
        <Text className="text-white font-medium">⚙️ Configuración</Text>
        <ToggleRow
          label="Notificaciones"
          icon="🔔"
          value={settings.notificationsEnabled}
          onToggle={(v) => updateSettings({ notificationsEnabled: v })}
        />
        <ToggleRow
          label="Sonido"
          icon="🔊"
          value={settings.soundEnabled}
          onToggle={(v) => updateSettings({ soundEnabled: v })}
        />
        <ToggleRow
          label="Vibración"
          icon="📳"
          value={settings.vibrationEnabled}
          onToggle={(v) => updateSettings({ vibrationEnabled: v })}
        />
      </View>

      <View className="border-t border-gray-700 pt-4 gap-3">
        <Text className="text-white font-medium">🛡 Modos Especiales</Text>
        <TouchableOpacity
          onPress={() =>
            updateSettings({
              extremeMode: !settings.extremeMode,
            })
          }
          className={`p-3 rounded-lg flex-row items-center justify-between ${
            settings.extremeMode ? "bg-red-600" : "bg-gray-700"
          }`}
        >
          <Text
            className={
              settings.extremeMode ? "text-white" : "text-gray-300"
            }
          >
            🔥 Modo Extremo
          </Text>
          <Text
            className={`text-xs ${
              settings.extremeMode ? "text-white" : "text-gray-400"
            }`}
          >
            {settings.extremeMode ? "ACTIVADO" : "OFF"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            updateSettings({
              punishmentMode: !settings.punishmentMode,
            })
          }
          className={`p-3 rounded-lg flex-row items-center justify-between ${
            settings.punishmentMode ? "bg-orange-600" : "bg-gray-700"
          }`}
        >
          <Text
            className={
              settings.punishmentMode ? "text-white" : "text-gray-300"
            }
          >
            ⚡ Modo Castigo
          </Text>
          <Text
            className={`text-xs ${
              settings.punishmentMode ? "text-white" : "text-gray-400"
            }`}
          >
            {settings.punishmentMode ? "ACTIVADO" : "OFF"}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="border-t border-gray-700 pt-4">
        <TouchableOpacity
          onPress={handleSync}
          disabled={syncStatus === "syncing"}
          className="p-3 rounded-lg flex-row items-center justify-center gap-2 bg-blue-600"
        >
          <Text className="text-white font-medium">
            {syncStatus === "syncing"
              ? "🔄 Sincronizando..."
              : syncStatus === "synced"
                ? "☁️ Sincronizado"
                : "☁️ Sincronizar con la nube"}
          </Text>
        </TouchableOpacity>
        <Text className="text-gray-500 text-xs text-center mt-2">
          Tus datos se guardan localmente
        </Text>
      </View>
    </View>
  )
}

function ToggleRow({
  label,
  icon,
  value,
  onToggle,
}: {
  label: string
  icon: string
  value: boolean
  onToggle: (v: boolean) => void
}) {
  return (
    <TouchableOpacity
      onPress={() => onToggle(!value)}
      className="flex-row items-center justify-between p-2 rounded-lg"
    >
      <Text className="text-gray-300 text-sm">
        {icon} {label}
      </Text>
      <Text className={value ? "text-green-400" : "text-gray-500"}>
        {value ? "✓" : "✗"}
      </Text>
    </TouchableOpacity>
  )
}

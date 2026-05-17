import { View, Text, TouchableOpacity, Switch } from "react-native"
import { useStore } from "../shared/store"

export default function SettingsSection() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const toggleExtremeMode = useStore((s) => s.toggleExtremeMode)
  const togglePunishmentMode = useStore((s) => s.togglePunishmentMode)

  return (
    <View>
      <Text className="text-lg font-semibold text-white mb-4">
        Ajustes
      </Text>

      <View className="bg-gray-800 rounded-xl p-4 mb-4">
        <SettingRow
          label="Notificaciones"
          value={settings.notificationsEnabled}
          onToggle={(v) =>
            updateSettings({ notificationsEnabled: v })
          }
        />
        <SettingRow
          label="Sonido"
          value={settings.soundEnabled}
          onToggle={(v) => updateSettings({ soundEnabled: v })}
        />
        <SettingRow
          label="Vibración"
          value={settings.vibrationEnabled}
          onToggle={(v) => updateSettings({ vibrationEnabled: v })}
        />
      </View>

      <View className="bg-gray-800 rounded-xl p-4 mb-4">
        <TouchableOpacity
          onPress={toggleExtremeMode}
          className="flex-row items-center justify-between py-2"
        >
          <Text
            className={`font-semibold ${
              settings.extremeMode ? "text-red-400" : "text-gray-200"
            }`}
          >
            Modo Extremo
          </Text>
          <Text
            className={`text-sm ${
              settings.extremeMode ? "text-red-400" : "text-gray-500"
            }`}
          >
            {settings.extremeMode ? "ACTIVADO" : "Desactivado"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePunishmentMode}
          className="flex-row items-center justify-between py-2"
        >
          <Text
            className={`font-semibold ${
              settings.punishmentMode ? "text-red-400" : "text-gray-200"
            }`}
          >
            Modo Castigo
          </Text>
          <Text
            className={`text-sm ${
              settings.punishmentMode ? "text-red-400" : "text-gray-500"
            }`}
          >
            {settings.punishmentMode ? "ACTIVADO" : "Desactivado"}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="bg-gray-800 rounded-xl p-4">
        <Text className="text-gray-300 text-sm mb-3">
          Pomodoro
        </Text>
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-gray-400 text-sm">
            Duración: {settings.pomodoroLength} min
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() =>
                updateSettings({
                  pomodoroLength: Math.max(5, settings.pomodoroLength - 5),
                })
              }
              className="bg-gray-700 w-8 h-8 rounded-lg items-center justify-center"
            >
              <Text className="text-white">-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                updateSettings({
                  pomodoroLength: Math.min(60, settings.pomodoroLength + 5),
                })
              }
              className="bg-gray-700 w-8 h-8 rounded-lg items-center justify-center"
            >
              <Text className="text-white">+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-400 text-sm">
            Descanso: {settings.breakLength} min
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() =>
                updateSettings({
                  breakLength: Math.max(1, settings.breakLength - 1),
                })
              }
              className="bg-gray-700 w-8 h-8 rounded-lg items-center justify-center"
            >
              <Text className="text-white">-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                updateSettings({
                  breakLength: Math.min(30, settings.breakLength + 1),
                })
              }
              className="bg-gray-700 w-8 h-8 rounded-lg items-center justify-center"
            >
              <Text className="text-white">+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

function SettingRow({
  label,
  value,
  onToggle,
}: {
  label: string
  value: boolean
  onToggle: (v: boolean) => void
}) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-gray-200">{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#374151", true: "#7c3aed" }}
        thumbColor={value ? "#a78bfa" : "#6b7280"}
      />
    </View>
  )
}

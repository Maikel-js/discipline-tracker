import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, Linking, ScrollView } from "react-native"
import { useStore } from "../shared/store"

type Platform = "android" | "windows" | "linux" | "ios" | "web"

export default function DownloadPortal() {
  const { updateSettings, settings } = useStore()
  const [activeSection, setActiveSection] = useState<"download" | "settings" | "about">("download")

  const appUrl = "https://discipline-tracker-rho.vercel.app"

  return (
    <ScrollView className="gap-4">
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => setActiveSection("download")}
          className={`flex-1 py-2 rounded-lg items-center ${
            activeSection === "download" ? "bg-blue-600" : "bg-gray-800"
          }`}
        >
          <Text className="text-white text-sm">📥 Descargar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveSection("settings")}
          className={`flex-1 py-2 rounded-lg items-center ${
            activeSection === "settings" ? "bg-blue-600" : "bg-gray-800"
          }`}
        >
          <Text className="text-white text-sm">⚙️ Ajustes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveSection("about")}
          className={`flex-1 py-2 rounded-lg items-center ${
            activeSection === "about" ? "bg-blue-600" : "bg-gray-800"
          }`}
        >
          <Text className="text-white text-sm">ℹ️ Info</Text>
        </TouchableOpacity>
      </View>

      {activeSection === "download" && (
        <View className="gap-4">
          <View className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/30 rounded-xl p-4">
            <Text className="font-bold text-white mb-1">🌐 Versión Web</Text>
            <Text className="text-sm text-gray-300 mb-3">
              Usa Discipline Tracker desde cualquier navegador
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(appUrl)}
              className="py-2 bg-blue-600 rounded-lg items-center"
            >
              <Text className="text-white font-bold">Abrir Web App</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <Text className="font-bold text-white mb-3">📱 Descargas Disponibles</Text>
            <View className="gap-3">
              <DownloadCard
                icon="🤖"
                title="Android (APK)"
                desc="Instalador directo"
                url="https://github.com/Maikel-js/discipline-tracker/releases/download/v0.1.0/Discipline-Tracker-v0.1.0.apk"
              />
              <DownloadCard
                icon="🪟"
                title="Windows (EXE)"
                desc="Instalador oficial"
                url="https://github.com/Maikel-js/discipline-tracker/releases/download/v0.1.0/Discipline-Tracker-Setup.exe"
              />
              <DownloadCard
                icon="🐧"
                title="Linux (AppImage)"
                desc="Binario ejecutable"
                url={appUrl}
              />
              <View className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-3">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-purple-300 font-medium">🌐 PWA Web</Text>
                    <Text className="text-xs text-gray-400">Instalar desde navegador</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(appUrl)}
                    className="px-3 py-1 bg-purple-600 rounded-lg"
                  >
                    <Text className="text-white text-sm font-bold">Abrir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {activeSection === "settings" && (
        <View className="gap-4">
          <View className="bg-gray-800/50 rounded-xl p-4">
            <Text className="font-bold text-white mb-3">⏱️ Pomodoro</Text>
            <View className="gap-3">
              <SettingsRow
                label="Enfoque (min)"
                value={settings.pomodoroLength}
                onChange={v => updateSettings({ pomodoroLength: v })}
                min={5}
                max={60}
              />
              <SettingsRow
                label="Descanso (min)"
                value={settings.breakLength}
                onChange={v => updateSettings({ breakLength: v })}
                min={1}
                max={30}
              />
            </View>
          </View>

          <View className="bg-gray-800/50 rounded-xl p-4">
            <Text className="font-bold text-white mb-3">🔔 Notificaciones</Text>
            <ToggleRow
              label="Push"
              value={settings.notificationsEnabled}
              onToggle={v => updateSettings({ notificationsEnabled: v })}
            />
            <ToggleRow
              label="Sonido"
              value={settings.soundEnabled}
              onToggle={v => updateSettings({ soundEnabled: v })}
            />
            <ToggleRow
              label="Vibración"
              value={settings.vibrationEnabled}
              onToggle={v => updateSettings({ vibrationEnabled: v })}
            />
          </View>
        </View>
      )}

      {activeSection === "about" && (
        <View className="bg-gray-800/50 rounded-xl p-4 gap-3">
          <Text className="font-bold text-white text-lg">ℹ️ Acerca de</Text>
          <View className="bg-gray-700/50 rounded-lg p-3">
            <Text className="text-gray-400 text-sm">Versión</Text>
            <Text className="text-white font-medium">1.0.0 (React Native)</Text>
          </View>
          <View className="bg-gray-700/50 rounded-lg p-3">
            <Text className="text-gray-400 text-sm">App Web</Text>
            <Text className="text-white font-medium">{appUrl}</Text>
          </View>
          <Text className="text-gray-500 text-xs text-center mt-2">
            Discipline Tracker - Todos los datos se guardan localmente
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

function DownloadCard({
  icon,
  title,
  desc,
  url,
}: {
  icon: string
  title: string
  desc: string
  url: string
}) {
  return (
    <View className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-3">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-medium text-white">{icon} {title}</Text>
          <Text className="text-xs text-gray-400">{desc}</Text>
        </View>
        <TouchableOpacity
          onPress={() => Linking.openURL(url)}
          className="px-3 py-1 bg-blue-600 rounded-lg"
        >
          <Text className="text-white text-sm font-bold">Descargar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function ToggleRow({
  label,
  value,
  onToggle,
}: {
  label: string
  value: boolean
  onToggle: (v: boolean) => void
}) {
  return (
    <TouchableOpacity
      onPress={() => onToggle(!value)}
      className="flex-row items-center justify-between py-2"
    >
      <Text className="text-gray-300 text-sm">{label}</Text>
      <Text className={value ? "text-green-400" : "text-gray-500"}>
        {value ? "✓" : "✗"}
      </Text>
    </TouchableOpacity>
  )
}

function SettingsRow({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-gray-300 text-sm">{label}</Text>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 bg-gray-700 rounded-lg items-center justify-center"
        >
          <Text className="text-white">-</Text>
        </TouchableOpacity>
        <Text className="text-white font-medium w-8 text-center">{value}</Text>
        <TouchableOpacity
          onPress={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 bg-gray-700 rounded-lg items-center justify-center"
        >
          <Text className="text-white">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

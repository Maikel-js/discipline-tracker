import "../global.css"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import { View } from "react-native"
import { useStore } from "../shared/store"
import VoiceCommands from "../components/VoiceCommands"

export default function RootLayout() {
  const checkAndResetDaily = useStore((s) => s.checkAndResetDaily)
  const settings = useStore((s) => s.settings)

  useEffect(() => {
    checkAndResetDaily()
  }, [checkAndResetDaily])

  return (
    <View className="flex-1 bg-gray-900">
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      {settings.notificationsEnabled && <VoiceCommands />}
    </View>
  )
}

import "../global.css"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useRef, useState } from "react"
import { View, AppState, AppStateStatus } from "react-native"
import { useStore } from "../shared/store"
import {
  registerForPushNotificationsAsync,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  getStoredPushToken,
} from "../shared/pushNotifications"
import VoiceCommands from "../components/VoiceCommands"

export default function RootLayout() {
  const checkAndResetDaily = useStore((s) => s.checkAndResetDaily)
  const addNotification = useStore((s) => s.addNotification)
  const settings = useStore((s) => s.settings)
  const [pushToken, setPushToken] = useState<string | null>(null)
  const appState = useRef(AppState.currentState)

  useEffect(() => {
    checkAndResetDaily()
  }, [checkAndResetDaily])

  useEffect(() => {
    ;(async () => {
      const stored = await getStoredPushToken()
      if (stored) {
        setPushToken(stored)
        return
      }
      const token = await registerForPushNotificationsAsync()
      if (token) setPushToken(token)
    })()
  }, [])

  useEffect(() => {
    const receivedSub = addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data
      if (data?.habitId && data?.level) {
        addNotification(String(data.habitId), Number(data.level) as 1 | 2 | 3 | 4 | 5)
      }
    })

    const responseSub = addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data
    })

    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === "active") {
        checkAndResetDaily()
      }
      appState.current = nextState
    })

    return () => {
      receivedSub()
      responseSub()
      subscription.remove()
    }
  }, [])

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

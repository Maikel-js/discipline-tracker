import "../global.css"
import { Stack, useRouter, useSegments } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useRef } from "react"
import { View, ActivityIndicator, AppState, AppStateStatus } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { AuthProvider, useAuth } from "../shared/auth"
import { useStore } from "../shared/store"
import {
  registerForPushNotificationsAsync,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  getStoredPushToken,
} from "../shared/pushNotifications"
import VoiceCommands from "../components/VoiceCommands"

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === "(tabs)"

    if (!isAuthenticated && inAuthGroup) {
      router.replace("/login")
    } else if (isAuthenticated && segments[0] === "login") {
      router.replace("/(tabs)")
    }
  }, [isAuthenticated, isLoading, segments, router])

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator color="#8b5cf6" size="large" />
      </View>
    )
  }

  return <>{children}</>
}

function RootNavigator() {
  const checkAndResetDaily = useStore((s) => s.checkAndResetDaily)
  const addNotification = useStore((s) => s.addNotification)
  const settings = useStore((s) => s.settings)
  const appState = useRef(AppState.currentState)

  useEffect(() => {
    checkAndResetDaily()
  }, [checkAndResetDaily])

  useEffect(() => {
    ;(async () => {
      const stored = await getStoredPushToken()
      if (stored) return
      await registerForPushNotificationsAsync()
    })()
  }, [])

  useEffect(() => {
    const receivedSub = addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data as
        | { habitId?: string; level?: number }
        | undefined
      if (data?.habitId && data?.level) {
        addNotification(String(data.habitId), Number(data.level) as 1 | 2 | 3 | 4 | 5)
      }
    })

    const responseSub = addNotificationResponseReceivedListener(() => {
      // navigate to relevant screen on tap if needed
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
  }, [addNotification, checkAndResetDaily])

  return (
    <View className="flex-1 bg-gray-900">
      <StatusBar style="light" />
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthGate>
      {settings.notificationsEnabled && <VoiceCommands />}
    </View>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

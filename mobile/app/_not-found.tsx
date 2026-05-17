import { View, Text } from "react-native"
import { Link } from "expo-router"

export default function NotFound() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-900 p-4">
      <Text className="text-4xl text-gray-400 mb-4">404</Text>
      <Text className="text-lg text-gray-300 mb-6">Página no encontrada</Text>
      <Link href="/" className="text-purple-400 text-base">
        Volver al inicio
      </Link>
    </View>
  )
}

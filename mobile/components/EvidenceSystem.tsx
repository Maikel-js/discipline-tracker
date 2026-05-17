import { useState } from "react"
import { View, Text, TouchableOpacity, Alert } from "react-native"
import * as ImagePicker from "expo-image-picker"
import * as Location from "expo-location"

interface Props {
  habitId: string
  onVerified: () => void
  onCancel: () => void
}

export default function EvidenceSystem({ habitId, onVerified, onCancel }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePhotoCapture = async () => {
    setLoading(true)
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== "granted") {
        setError("Permiso de cámara denegado")
        return
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      })
      if (!result.canceled) {
        onVerified()
      }
    } catch {
      setError("No se pudo acceder a la cámara")
    } finally {
      setLoading(false)
    }
  }

  const handleGPSCheck = async () => {
    setLoading(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setError("Permiso de ubicación denegado")
        return
      }
      const position = await Location.getCurrentPositionAsync({})
      if (position) {
        onVerified()
      }
    } catch {
      setError("No se pudo obtener ubicación")
    } finally {
      setLoading(false)
    }
  }

  const handleTimeCheck = () => {
    const now = new Date()
    const hour = now.getHours()
    if (hour >= 6 && hour <= 22) {
      onVerified()
    } else {
      setError("Solo puedes completar este hábito entre 6am y 10pm")
    }
  }

  return (
    <View className="absolute inset-0 z-50 items-center justify-center bg-black/80">
      <View className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full mx-4">
        <Text className="text-xl font-bold text-white mb-2 text-center">
          Verificación de Evidencia
        </Text>
        <Text className="text-gray-400 text-sm text-center mb-6">
          Este hábito requiere evidencia para completar
        </Text>

        {error && (
          <View className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
            <Text className="text-red-400 text-sm">{error}</Text>
          </View>
        )}

        <View className="gap-3">
          <TouchableOpacity
            onPress={handlePhotoCapture}
            disabled={loading}
            className="flex-row items-center gap-3 p-4 bg-gray-800 border border-gray-600 rounded-xl"
          >
            <Text className="text-2xl">📷</Text>
            <View>
              <Text className="text-white font-medium">Tomar Foto</Text>
              <Text className="text-xs text-gray-400">Evidencia visual</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGPSCheck}
            disabled={loading}
            className="flex-row items-center gap-3 p-4 bg-gray-800 border border-gray-600 rounded-xl"
          >
            <Text className="text-2xl">📍</Text>
            <View>
              <Text className="text-white font-medium">Verificar Ubicación</Text>
              <Text className="text-xs text-gray-400">Check-in GPS</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleTimeCheck}
            disabled={loading}
            className="flex-row items-center gap-3 p-4 bg-gray-800 border border-gray-600 rounded-xl"
          >
            <Text className="text-2xl">⏰</Text>
            <View>
              <Text className="text-white font-medium">Verificar Hora</Text>
              <Text className="text-xs text-gray-400">Tiempo mínimo requerido</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={onCancel}
          className="mt-4 p-3 bg-gray-700 rounded-xl items-center"
        >
          <Text className="text-gray-400">Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

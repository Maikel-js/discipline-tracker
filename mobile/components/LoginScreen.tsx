import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native"
import { useAuth } from "../shared/auth"

export default function LoginScreen() {
  const auth = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError("")
    setLoading(true)

    let success: boolean
    if (isRegister) {
      success = await auth.register(email, password, name)
    } else {
      success = await auth.login(email, password)
    }

    setLoading(false)
    if (!success) {
      setError(
        isRegister
          ? "Este email ya está registrado"
          : "Email o contraseña incorrectos"
      )
    }
  }

  return (
    <View className="flex-1 bg-black justify-center p-4">
      <View className="w-full max-w-md mx-auto">
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-green-500/20 rounded-full items-center justify-center mb-4">
            <Text className="text-3xl">🏆</Text>
          </View>
          <Text className="text-2xl font-bold text-white mb-2">
            Discipline Tracker
          </Text>
          <Text className="text-gray-400">
            {isRegister ? "Crea tu cuenta" : "Inicia sesión"}
          </Text>
        </View>

        <View className="gap-4">
          {isRegister ? (
            <TextInput
              className="bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500"
              placeholder="Tu nombre"
              placeholderTextColor="#6b7280"
              value={name}
              onChangeText={setName}
            />
          ) : null}

          <TextInput
            className="bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500"
            placeholder="Email"
            placeholderTextColor="#6b7280"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            className="bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500"
            placeholder="Contraseña"
            placeholderTextColor="#6b7280"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? (
            <View className="bg-red-500/20 border border-red-500 rounded-xl p-3">
              <Text className="text-red-400 text-sm">{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="bg-green-600 disabled:bg-gray-600 py-3 rounded-xl items-center"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold">
                {isRegister ? "Registrarse" : "Iniciar sesión"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            setIsRegister(!isRegister)
            setError("")
          }}
          className="mt-6 items-center"
        >
          <Text className="text-gray-400 text-sm">
            {isRegister
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿No tienes cuenta? Regístrate"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

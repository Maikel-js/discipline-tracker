import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity } from "react-native"
import { useStore } from "../shared/store"

export default function AccountabilityPartnerPanel() {
  const {
    addAccountabilityPartner,
    removeAccountabilityPartner,
    accountabilityPartners,
  } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [notifyOnMiss, setNotifyOnMiss] = useState(true)
  const [notifyOnComplete, setNotifyOnComplete] = useState(true)

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) return
    addAccountabilityPartner({
      name: name.trim(),
      email: email.trim(),
      notifyOnMiss,
      notifyOnComplete,
    })
    setName("")
    setEmail("")
    setNotifyOnMiss(true)
    setNotifyOnComplete(true)
    setShowForm(false)
  }

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-white">
          Accountability Partners
        </Text>
        <TouchableOpacity
          onPress={() => setShowForm(!showForm)}
          className="flex-row items-center gap-1 px-3 py-1 bg-blue-600 rounded-lg"
        >
          <Text className="text-white text-sm">+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {showForm ? (
        <View className="p-4 bg-gray-800/50 rounded-lg gap-3">
          <TextInput
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
            placeholder="Nombre"
            placeholderTextColor="#6b7280"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
            placeholder="Email"
            placeholderTextColor="#6b7280"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => setNotifyOnMiss(!notifyOnMiss)}
              className="flex-row items-center gap-2"
            >
              <Text
                className={
                  notifyOnMiss ? "text-green-400" : "text-gray-500"
                }
              >
                {notifyOnMiss ? "✓" : "○"}
              </Text>
              <Text className="text-sm text-gray-300">
                Notificar si fallo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setNotifyOnComplete(!notifyOnComplete)}
              className="flex-row items-center gap-2"
            >
              <Text
                className={
                  notifyOnComplete ? "text-green-400" : "text-gray-500"
                }
              >
                {notifyOnComplete ? "✓" : "○"}
              </Text>
              <Text className="text-sm text-gray-300">
                Notificar si completo
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleSubmit}
            className="py-2 bg-green-600 rounded-lg items-center"
          >
            <Text className="text-white text-sm">Guardar</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {accountabilityPartners.length === 0 ? (
        <Text className="text-center text-gray-500 py-8">
          No hay partners agregados
        </Text>
      ) : (
        <View className="gap-2">
          {accountabilityPartners.map((partner) => (
            <View
              key={partner.id}
              className="flex-row items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
            >
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center">
                <Text className="text-white font-medium">
                  {partner.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm text-white font-medium">
                  {partner.name}
                </Text>
                <Text className="text-xs text-gray-400">
                  {partner.email}
                </Text>
                <View className="flex-row gap-2 mt-1">
                  {partner.notifyOnMiss ? (
                    <Text className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded">
                      Alerta si fallo
                    </Text>
                  ) : null}
                  {partner.notifyOnComplete ? (
                    <Text className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded">
                      Alerta si completo
                    </Text>
                  ) : null}
                </View>
              </View>
              <TouchableOpacity
                onPress={() =>
                  removeAccountabilityPartner(partner.id)
                }
                className="p-2"
              >
                <Text className="text-gray-400">🗑</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

import { View, Text, TouchableOpacity } from "react-native"
import { useStore } from "../shared/store"

export default function ProtocolsSection() {
  const protocols = useStore((s) => s.protocols)
  const runProtocol = useStore((s) => s.runProtocol)
  const toggleProtocolStep = useStore((s) => s.toggleProtocolStep)

  return (
    <View>
      <Text className="text-lg font-semibold text-white mb-4">
        Protocolos
      </Text>

      {protocols.length === 0 ? (
        <Text className="text-gray-500">
          No hay protocolos disponibles
        </Text>
      ) : (
        protocols.map((protocol) => {
          const stepsDone = protocol.steps.filter(
            (s) => s.completed
          ).length
          return (
            <View
              key={protocol.id}
              className="bg-gray-800 rounded-xl p-4 mb-4"
            >
              <Text className="text-white font-semibold text-base mb-1">
                {protocol.name}
              </Text>
              {protocol.description ? (
                <Text className="text-gray-400 text-sm mb-3">
                  {protocol.description}
                </Text>
              ) : null}

              <View className="bg-gray-700 rounded-full h-2 mb-3">
                <View
                  className="bg-green-500 rounded-full h-2"
                  style={{
                    width: `${Math.min(protocol.progress, 100)}%`,
                  }}
                />
              </View>
              <Text className="text-gray-400 text-xs mb-3">
                {protocol.progress}% · {stepsDone}/{protocol.steps.length} pasos
              </Text>

              {protocol.steps.map((step, index) => (
                <TouchableOpacity
                  key={step.id}
                  onPress={() =>
                    toggleProtocolStep(protocol.id, index)
                  }
                  className="flex-row items-center py-2"
                >
                  <View
                    className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                      step.completed
                        ? "bg-green-500 border-green-500"
                        : "border-gray-500"
                    }`}
                  >
                    {step.completed ? (
                      <Text className="text-white text-xs">✓</Text>
                    ) : null}
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`${
                        step.completed
                          ? "text-gray-500 line-through"
                          : "text-gray-200"
                      }`}
                    >
                      {step.action}
                    </Text>
                    <Text className="text-gray-600 text-xs">
                      {step.time} · {step.duration}min
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => runProtocol(protocol.id)}
                className="bg-green-700 py-2 rounded-lg items-center mt-3"
              >
                <Text className="text-white font-semibold text-sm">
                  Ejecutar Protocolo
                </Text>
              </TouchableOpacity>
            </View>
          )
        })
      )}
    </View>
  )
}

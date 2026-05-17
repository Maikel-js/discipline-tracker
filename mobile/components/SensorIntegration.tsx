import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { useStore } from "../shared/store"

export default function SensorIntegration() {
  const { updateSensorData, checkAutoMarkHabit, sensorData, habits } =
    useStore()
  const [simulating, setSimulating] = useState(false)
  const [lastAutoMark, setLastAutoMark] = useState<string | null>(null)

  const simulateSensorData = async (
    type: "steps" | "sleep" | "activity"
  ) => {
    setSimulating(true)

    let value: number
    switch (type) {
      case "steps":
        value = Math.floor(Math.random() * 5000) + 8000
        break
      case "sleep":
        value = Math.floor(Math.random() * 4) + 6
        break
      case "activity":
        value = Math.floor(Math.random() * 60) + 30
        break
    }

    updateSensorData(type, value)

    habits
      .filter((h) =>
        type === "steps" || type === "activity"
          ? h.category === "exercise"
          : h.category === "health"
      )
      .forEach((h) => {
        if (checkAutoMarkHabit(h.id, type)) {
          setLastAutoMark(
            `${h.name} marcado automáticamente por ${type}`
          )
        }
      })

    setSimulating(false)
  }

  const latestData = (type: string) => {
    const data = sensorData
      .filter((s) => s.type === type)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
      )[0]
    return data
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const stepsData = latestData("steps")
      const sleepData = latestData("sleep")
      const activityData = latestData("activity")

      habits
        .filter(
          (h) =>
            h.category === "exercise" || h.category === "health"
        )
        .forEach((h) => {
          if (stepsData && checkAutoMarkHabit(h.id, "steps")) {
            setLastAutoMark(
              `${h.name} marcado automáticamente`
            )
          }
          if (sleepData && checkAutoMarkHabit(h.id, "sleep")) {
            setLastAutoMark(
              `${h.name} marcado automáticamente`
            )
          }
          if (
            activityData &&
            checkAutoMarkHabit(h.id, "activity")
          ) {
            setLastAutoMark(
              `${h.name} marcado automáticamente`
            )
          }
        })
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <View className="gap-4">
      <Text className="text-lg font-semibold text-white">
        Integración de Sensores
      </Text>

      <Text className="text-xs text-gray-500 mb-4">
        Simula datos de sensores para marcar hábitos automáticamente
      </Text>

      {lastAutoMark ? (
        <View className="flex-row items-center gap-2 p-2 bg-green-900/30 border border-green-500/50 rounded-lg">
          <Text className="text-green-400">✅</Text>
          <Text className="text-green-400 text-sm">{lastAutoMark}</Text>
        </View>
      ) : null}

      <View className="gap-3">
        <SensorButton
          label="Pasos"
          icon="👣"
          meta="Meta: 10,000 pasos"
          value={
            latestData("steps")
              ? `${latestData("steps")?.value} pasos`
              : "Sin datos"
          }
          onPress={() => simulateSensorData("steps")}
          disabled={simulating}
        />
        <SensorButton
          label="Sueño"
          icon="🌙"
          meta="Meta: 7+ horas"
          value={
            latestData("sleep")
              ? `${latestData("sleep")?.value} horas`
              : "Sin datos"
          }
          onPress={() => simulateSensorData("sleep")}
          disabled={simulating}
        />
        <SensorButton
          label="Actividad Física"
          icon="🏃"
          meta="Meta: 30+ minutos"
          value={
            latestData("activity")
              ? `${latestData("activity")?.value} minutos`
              : "Sin datos"
          }
          onPress={() => simulateSensorData("activity")}
          disabled={simulating}
        />
      </View>
    </View>
  )
}

function SensorButton({
  label,
  icon,
  meta,
  value,
  onPress,
  disabled,
}: {
  label: string
  icon: string
  meta: string
  value: string
  onPress: () => void
  disabled: boolean
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className="flex-row items-center justify-between p-3 bg-gray-800/50 rounded-lg"
    >
      <View className="flex-row items-center gap-3">
        <Text className="text-xl">{icon}</Text>
        <View>
          <Text className="text-sm text-white">{label}</Text>
          <Text className="text-xs text-gray-500">{meta}</Text>
        </View>
      </View>
      <Text className="text-sm text-white">{value}</Text>
    </TouchableOpacity>
  )
}

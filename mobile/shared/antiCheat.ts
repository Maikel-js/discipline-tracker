import AsyncStorage from '@react-native-async-storage/async-storage'
import { generateId } from './helpers'
import type { Habit, HabitLog, AntiCheatAlert } from './types'

export class AntiCheatSystem {
  private alerts: AntiCheatAlert[] = []

  async init() {
    try {
      const stored = await AsyncStorage.getItem('anticheat_alerts')
      if (stored) this.alerts = JSON.parse(stored)
    } catch {
      this.alerts = []
    }
  }

  checkCompletion(habitId: string, timeSpentSeconds: number = 0): AntiCheatAlert | null {
    const now = Date.now()

    if (timeSpentSeconds < 5 && timeSpentSeconds > 0) {
      const alert: AntiCheatAlert = {
        id: generateId(),
        userId: 'current',
        type: 'suspicious_pattern',
        details: `Completado en solo ${timeSpentSeconds} segundos`,
        timestamp: new Date().toISOString(),
        resolved: false
      }
      this.addAlert(alert)
      return alert
    }

    return null
  }

  checkPattern(habits: Habit[], logs: HabitLog[]): AntiCheatAlert[] {
    const newAlerts: AntiCheatAlert[] = []

    habits.forEach(habit => {
      const habitLogs = logs.filter(l => l.habitId === habit.id)
      const completedLogs = habitLogs.filter(l => l.status === 'completed')

      if (completedLogs.length < 3) return

      const times = completedLogs.map(l => new Date(l.completedAt).getTime())
      let suspicious = true
      for (let i = 1; i < times.length; i++) {
        const diff = times[i] - times[i - 1]
        if (diff < 12 * 60 * 60 * 1000) {
          suspicious = false
          break
        }
      }

      if (suspicious) {
        const alert: AntiCheatAlert = {
          id: generateId(),
          userId: 'current',
          type: 'fake_completion',
          details: 'Patrón sospechoso: completados a misma hora',
          timestamp: new Date().toISOString(),
          resolved: false
        }
        newAlerts.push(alert)
        this.addAlert(alert)
      }
    })

    return newAlerts
  }

  addAlert(alert: AntiCheatAlert): void {
    this.alerts.push(alert)
    this.saveAlerts()
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
      this.saveAlerts()
    }
  }

  getAlerts(): AntiCheatAlert[] {
    return this.alerts.filter(a => !a.resolved)
  }

  private async saveAlerts(): Promise<void> {
    try {
      await AsyncStorage.setItem('anticheat_alerts', JSON.stringify(this.alerts))
    } catch {
      // Silently fail
    }
  }
}

export const antiCheatSystem = new AntiCheatSystem()
export default antiCheatSystem

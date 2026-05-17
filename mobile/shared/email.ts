import AsyncStorage from '@react-native-async-storage/async-storage'
import { generateId } from './helpers'
import type { EmailLog, EmailPreferences, User, Habit, Task } from './types'

const EMAIL_CONFIG = {
  from: 'Discipline Tracker <noreply@discipline-tracker.app>',
  templates: {
    reminder: {
      subject: 'Recordatorio: Tienes hábitos pendientes',
      body: (name: string, pendingHabits: string[]) => `
        <h1>Hola ${name}!</h1>
        <p>Tienes ${pendingHabits.length} hábitos pendientes hoy:</p>
        <ul>
          ${pendingHabits.map(h => `<li>${h}</li>`).join('')}
        </ul>
        <p>No olvides completarlos para mantener tu racha.</p>
      `
    },
    insistent: {
      subject: 'Acción requerida: Tus hábitos esperan',
      body: (name: string, pendingHabits: string[]) => `
        <h1>${name}, aún tienes pendientes</h1>
        <p>Estos hábitos aún no están completados:</p>
        <ul>
          ${pendingHabits.map(h => `<li><strong>${h}</strong></li>`).join('')}
        </ul>
        <p>Tu disciplina está en juego. No pares ahora!</p>
      `
    },
    critical: {
      subject: 'CRÍTICO: Estás incumpliendo tus objetivos',
      body: (name: string, pendingHabits: string[]) => `
        <h1>${name}, esto es serio</h1>
        <p>Has ignorado varios recordatorios. Tu racha está en riesgo.</p>
        <div>
          <h2>Hábitos pendientes:</h2>
          ${pendingHabits.map(h => `<p>✗ ${h}</p>`).join('')}
        </div>
      `
    }
  }
}

class EmailService {
  private logs: EmailLog[] = []
  private preferences: Map<string, EmailPreferences> = new Map()

  async init() {
    try {
      const stored = await AsyncStorage.getItem('email_logs')
      if (stored) this.logs = JSON.parse(stored)
    } catch {
      this.logs = []
    }
  }

  async sendEmail(
    to: string,
    type: 'reminder' | 'insistent' | 'critical',
    user: User,
    data: { habits?: Habit[]; tasks?: Task[] }
  ): Promise<boolean> {
    const template = EMAIL_CONFIG.templates[type]
    const pendingHabits = data.habits?.filter(h => h.status === 'pending').map(h => h.name) || []

    const emailLog: EmailLog = {
      id: generateId(),
      userId: user.id,
      type,
      subject: template.subject,
      body: template.body(user.name, pendingHabits),
      sentAt: new Date().toISOString(),
      opened: false
    }

    this.logs.push(emailLog)
    await this.saveLogs()

    console.log(`[Email] ${type} sent to ${to}:`, template.subject)

    return true
  }

  async sendBatchReminders(
    users: User[],
    habitsMap: Map<string, Habit[]>,
    tasksMap: Map<string, Task[]>
  ): Promise<void> {
    for (const user of users) {
      const userHabits = habitsMap.get(user.id) || []
      const userTasks = tasksMap.get(user.id) || []

      const pendingHabits = userHabits.filter(h => h.status === 'pending')
      const overdueTasks = userTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date())

      if (pendingHabits.length > 0 || overdueTasks.length > 0) {
        const lastEmail = this.logs
          .filter(l => l.userId === user.id)
          .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())[0]

        const hoursSinceLastEmail = lastEmail
          ? (Date.now() - new Date(lastEmail.sentAt).getTime()) / (1000 * 60 * 60)
          : 24

        let type: 'reminder' | 'insistent' | 'critical' = 'reminder'
        if (hoursSinceLastEmail < 24) continue
        if (hoursSinceLastEmail >= 48) type = 'insistent'
        if (hoursSinceLastEmail >= 72) type = 'critical'

        await this.sendEmail(user.email, type, user, { habits: pendingHabits, tasks: overdueTasks })
      }
    }
  }

  canSendEmail(userId: string, minHours: number = 6): boolean {
    const userLogs = this.logs
      .filter(l => l.userId === userId)
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())

    if (userLogs.length === 0) return true

    const lastEmail = userLogs[0]
    const hoursSince = (Date.now() - new Date(lastEmail.sentAt).getTime()) / (1000 * 60 * 60)

    return hoursSince >= minHours
  }

  getEmailLogs(userId: string): EmailLog[] {
    return this.logs.filter(l => l.userId === userId)
  }

  async setPreferences(userId: string, prefs: EmailPreferences): Promise<void> {
    this.preferences.set(userId, prefs)
    await AsyncStorage.setItem(`email_prefs_${userId}`, JSON.stringify(prefs))
  }

  async getPreferences(userId: string): Promise<EmailPreferences> {
    if (this.preferences.has(userId)) {
      return this.preferences.get(userId)!
    }
    try {
      const stored = await AsyncStorage.getItem(`email_prefs_${userId}`)
      if (stored) {
        const prefs = JSON.parse(stored)
        this.preferences.set(userId, prefs)
        return prefs
      }
    } catch {
      // Ignore
    }
    return {
      enabled: true,
      frequency: 'medium' as const,
      reminderTypes: ['habit_missed', 'task_overdue', 'ignored']
    }
  }

  private async saveLogs(): Promise<void> {
    try {
      await AsyncStorage.setItem('email_logs', JSON.stringify(this.logs))
    } catch {
      // Silently fail
    }
  }
}

export const emailService = new EmailService()
export default emailService

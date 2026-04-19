import type { Habit, HabitLog, AntiCheatAlert } from '@/types';

export class AntiCheatSystem {
  private alerts: AntiCheatAlert[] = [];
  private recentCompletions: Map<string, { habitId: string; timestamp: number; timeSpent: number }[]> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('anticheat_alerts');
      if (stored) this.alerts = JSON.parse(stored);
    }
  }

  checkCompletion(habitId: string, timeSpentSeconds: number = 0): AntiCheatAlert | null {
    const now = Date.now();
    const recent = this.recentCompletions.get(habitId) || [];

    recent.push({ habitId, timestamp: now, timeSpent: timeSpentSeconds });
    const recentFiltered = recent.filter(t => now - t.timestamp < 60000);
    this.recentCompletions.set(habitId, recentFiltered);

    if (recentFiltered.length >= 5) {
      const alert: AntiCheatAlert = {
        id: Math.random().toString(36).substr(2, 9),
        userId: 'current',
        type: 'rapid_complete',
        details: `5 completados en menos de 1 minuto para hábito ${habitId}`,
        timestamp: new Date().toISOString(),
        resolved: false
      };
      this.addAlert(alert);
      return alert;
    }

    if (timeSpentSeconds < 5 && timeSpentSeconds > 0) {
      const alert: AntiCheatAlert = {
        id: Math.random().toString(36).substr(2, 9),
        userId: 'current',
        type: 'suspicious_pattern',
        details: `Completado en solo ${timeSpentSeconds} segundos`,
        timestamp: new Date().toISOString(),
        resolved: false
      };
      this.addAlert(alert);
      return alert;
    }

    return null;
  }

  checkPattern(habits: Habit[], logs: HabitLog[]): AntiCheatAlert[] {
    const newAlerts: AntiCheatAlert[] = [];

    habits.forEach(habit => {
      const habitLogs = logs.filter(l => l.habitId === habit.id);
      const completedLogs = habitLogs.filter(l => l.status === 'completed');

      if (completedLogs.length < 3) return;

      const times = completedLogs.map(l => new Date(l.completedAt).getTime());
      let suspicious = true;
      for (let i = 1; i < times.length; i++) {
        const diff = times[i] - times[i - 1];
        if (diff < 12 * 60 * 60 * 1000) {
          suspicious = false;
          break;
        }
      }

      if (suspicious) {
        const alert: AntiCheatAlert = {
          id: Math.random().toString(36).substr(2, 9),
          userId: 'current',
          type: 'fake_completion',
          details: `Patrón sospechoso: completados a misma hora`,
          timestamp: new Date().toISOString(),
          resolved: false
        };
        newAlerts.push(alert);
        this.addAlert(alert);
      }
    });

    return newAlerts;
  }

  addAlert(alert: AntiCheatAlert): void {
    this.alerts.push(alert);
    this.saveAlerts();
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.saveAlerts();
    }
  }

  getAlerts(): AntiCheatAlert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  private saveAlerts(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('anticheat_alerts', JSON.stringify(this.alerts));
    }
  }
}

export const antiCheatSystem = new AntiCheatSystem();
export default antiCheatSystem;
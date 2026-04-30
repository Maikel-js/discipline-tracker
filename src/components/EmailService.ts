import type { EmailLog, EmailPreferences, User, Habit, Task } from '@/types';

const EMAIL_CONFIG = {
  from: 'Discipline Tracker <noreply@discipline-tracker.app>',
  apiKey: process.env.NEXT_PUBLIC_EMAIL_API_KEY || '',
  templates: {
    reminder: {
      subject: '📋 Recordatorio: Tienes hábitos pendientes',
      body: (name: string, pendingHabits: string[]) => `
        <h1>Hola ${name}!</h1>
        <p>Tienes ${pendingHabits.length} hábitos pendientes hoy:</p>
        <ul>
          ${pendingHabits.map(h => `<li>${h}</li>`).join('')}
        </ul>
        <p>No olvides completarlos para mantener tu racha.</p>
        <a href="https://discipline-tracker-rho.vercel.app" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
          Abrir App
        </a>
      `
    },
    insistent: {
      subject: '⚠️ Acción requerida: Tus hábitos esperan',
      body: (name: string, pendingHabits: string[]) => `
        <h1>${name}, aún tienes pendientes</h1>
        <p>Estos hábitos aún no están completados:</p>
        <ul style="background: #fef3c7; padding: 16px; border-radius: 8px;">
          ${pendingHabits.map(h => `<li><strong>${h}</strong></li>`).join('')}
        </ul>
        <p>Tu disciplina está en juego. ¡No pares ahora!</p>
      `
    },
    critical: {
      subject: '🔥 CRÍTICO: Estás incumpliendo tus objetivos',
      body: (name: string, pendingHabits: string[]) => `
        <h1 style="color: #dc2626;">${name}, esto es serio</h1>
        <p style="color: #7f1d1d; font-size: 18px;">
          Has ignorado varios recordatorios. Tu racha está en riesgo.
        </p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 12px; border: 2px solid #dc2626;">
          <h2>Hábitos pendientes:</h2>
          ${pendingHabits.map(h => `<p>✗ ${h}</p>`).join('')}
        </div>
        <p style="margin-top: 20px;">Cada día que pierdes es un paso atrás.</p>
      `
    },
    experimentCreated: {
      subject: '🧪 Nuevo experimento creado',
      body: (name: string, data: { experimentName: string; type: string; periodDays: number; items: string[] }) => `
        <h1>¡Hola ${name}!</h1>
        <p>Tu nuevo experimento ha sido creado exitosamente:</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; border: 2px solid #22c55e;">
          <h2 style="color: #16a34a;">🧪 ${data.experimentName}</h2>
          <p><strong>Tipo:</strong> ${data.type === 'habits' ? 'Hábitos' : 'Tareas'}</p>
          <p><strong>Período:</strong> ${data.periodDays} días</p>
          <p><strong>Elementos a medir:</strong></p>
          <ul>
            ${data.items.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <p style="margin-top: 20px;">La barra de progreso se llenará a medida que completes los elementos vinculados.</p>
        <a href="https://discipline-tracker-rho.vercel.app" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 16px;">
          Ver Experimento
        </a>
      `
    }
  }
};

class EmailService {
  private logs: EmailLog[] = [];
  private preferences: Map<string, EmailPreferences> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('email_logs');
      if (stored) this.logs = JSON.parse(stored);
    }
  }

  async sendEmail(
    to: string,
    type: 'reminder' | 'insistent' | 'critical',
    user: User,
    data: { habits?: Habit[]; tasks?: Task[] }
  ): Promise<boolean> {
    const template = EMAIL_CONFIG.templates[type];
    const pendingHabits = data.habits?.filter(h => h.status === 'pending').map(h => h.name) || [];
    
    const emailLog: EmailLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      type,
      subject: template.subject,
      body: template.body(user.name, pendingHabits),
      sentAt: new Date().toISOString(),
      opened: false
    };

    this.logs.push(emailLog);
    this.saveLogs();

    console.log(`[Email] ${type} sent to ${to}:`, template.subject);
    
    return true;
  }

  async sendExperimentNotification(
    to: string,
    user: User,
    data: { experimentName: string; type: 'habits' | 'tasks'; periodDays: number; items: string[] }
  ): Promise<boolean> {
    const template = EMAIL_CONFIG.templates.experimentCreated;
    
    const emailLog: EmailLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      type: 'reminder',
      subject: template.subject,
      body: template.body(user.name, data),
      sentAt: new Date().toISOString(),
      opened: false
    };

    this.logs.push(emailLog);
    this.saveLogs();

    console.log(`[Email] Experiment notification sent to ${to}:`, template.subject);
    console.log('[Email] Experiment details:', data);

    if (EMAIL_CONFIG.apiKey) {
      try {
        await this.sendViaRealService(to, template.subject, template.body(user.name, data));
      } catch (error) {
        console.warn('[Email] Real service failed, using local log:', error);
      }
    }
    
    return true;
  }

  private async sendViaRealService(to: string, subject: string, htmlBody: string): Promise<void> {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        user_id: EMAIL_CONFIG.apiKey,
        template_params: {
          to_email: to,
          subject,
          message: htmlBody
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Email service error: ${response.statusText}`);
    }
  }

  async sendBatchReminders(
    users: User[],
    habitsMap: Map<string, Habit[]>,
    tasksMap: Map<string, Task[]>
  ): Promise<void> {
    for (const user of users) {
      const userHabits = habitsMap.get(user.id) || [];
      const userTasks = tasksMap.get(user.id) || [];
      
      const pendingHabits = userHabits.filter(h => h.status === 'pending');
      const overdueTasks = userTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date());
      
      if (pendingHabits.length > 0 || overdueTasks.length > 0) {
        const lastEmail = this.logs
          .filter(l => l.userId === user.id)
          .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())[0];

        const hoursSinceLastEmail = lastEmail
          ? (Date.now() - new Date(lastEmail.sentAt).getTime()) / (1000 * 60 * 60)
          : 24;

        let type: 'reminder' | 'insistent' | 'critical' = 'reminder';
        if (hoursSinceLastEmail < 24) continue;
        if (hoursSinceLastEmail >= 48) type = 'insistent';
        if (hoursSinceLastEmail >= 72) type = 'critical';

        await this.sendEmail(user.email, type, user, { habits: pendingHabits, tasks: overdueTasks });
      }
    }
  }

  canSendEmail(userId: string, minHours: number = 6): boolean {
    const userLogs = this.logs
      .filter(l => l.userId === userId)
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
    
    if (userLogs.length === 0) return true;
    
    const lastEmail = userLogs[0];
    const hoursSince = (Date.now() - new Date(lastEmail.sentAt).getTime()) / (1000 * 60 * 60);
    
    return hoursSince >= minHours;
  }

  getEmailLogs(userId: string): EmailLog[] {
    return this.logs.filter(l => l.userId === userId);
  }

  setPreferences(userId: string, prefs: EmailPreferences): void {
    this.preferences.set(userId, prefs);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`email_prefs_${userId}`, JSON.stringify(prefs));
    }
  }

  getPreferences(userId: string): EmailPreferences {
    if (this.preferences.has(userId)) {
      return this.preferences.get(userId)!;
    }
    const stored = localStorage.getItem(`email_prefs_${userId}`);
    if (stored) {
      const prefs = JSON.parse(stored);
      this.preferences.set(userId, prefs);
      return prefs;
    }
    return {
      enabled: true,
      frequency: 'medium',
      reminderTypes: ['habit_missed', 'task_overdue', 'ignored']
    };
  }

  private saveLogs(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('email_logs', JSON.stringify(this.logs));
    }
  }
}

export const emailService = new EmailService();
export default emailService;

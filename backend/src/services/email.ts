import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

const defaultConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  from: process.env.SMTP_FROM || 'Discipline Tracker <noreply@discipline-tracker.app>',
};

let transport: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter {
  if (transport) return transport;

  transport = nodemailer.createTransport({
    host: defaultConfig.host,
    port: defaultConfig.port,
    secure: defaultConfig.secure,
    auth: {
      user: defaultConfig.user,
      pass: defaultConfig.pass,
    },
  });

  return transport;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = getTransport();
    await transporter.sendMail({
      from: defaultConfig.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Email] Failed to send:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

export function buildHabitReminderEmail(
  name: string,
  pendingHabits: { name: string; category: string; scheduledTime: string }[]
): { subject: string; html: string } {
  const subject = `Recordatorio: ${pendingHabits.length} hábito(s) pendiente(s)`;

  const habitList = pendingHabits
    .map(
      (h) => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #374151; color: #d1d5db;">
            ${h.name}
          </td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #374151; color: #9ca3af;">
            ${h.category}
          </td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #374151; color: #9ca3af;">
            ${h.scheduledTime}
          </td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="background: #111827; color: #f3f4f6; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #fbbf24; margin: 0; font-size: 24px;">⚡ Discipline Tracker</h1>
      </div>

      <h2 style="color: #f3f4f6; margin-bottom: 16px;">Hola ${name},</h2>
      <p style="color: #9ca3af; line-height: 1.6;">
        Tienes <strong style="color: #f3f4f6;">${pendingHabits.length} hábito(s)</strong> pendientes por completar hoy.
        No olvides hacerlos para mantener tu racha de disciplina.
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #1f2937; border-radius: 8px;">
        <thead>
          <tr style="background: #374151;">
            <th style="padding: 8px 12px; text-align: left; color: #8b5cf6;">Hábito</th>
            <th style="padding: 8px 12px; text-align: left; color: #8b5cf6;">Categoría</th>
            <th style="padding: 8px 12px; text-align: left; color: #8b5cf6;">Horario</th>
          </tr>
        </thead>
        <tbody>
          ${habitList}
        </tbody>
      </table>

      <div style="background: #1f2937; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="color: #9ca3af; margin: 0; font-size: 13px;">
          "La disciplina es el puente entre metas y logros." — Jim Rohn
        </p>
      </div>

      <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 24px;">
        Discipline Tracker — Tu aliado para construir mejores hábitos
      </p>
    </div>
  `;

  return { subject, html };
}

export function buildCriticalAlertEmail(
  name: string,
  missedHabits: { name: string; streak: number }[]
): { subject: string; html: string } {
  const subject = `⚠️ CRÍTICO: Estás perdiendo tu disciplina`;

  const missedList = missedHabits
    .map(
      (h) => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #374151; color: #d1d5db;">
            ${h.name}
          </td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #374151; color: #ef4444;">
            Racha perdida: ${h.streak} días
          </td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="background: #111827; color: #f3f4f6; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ef4444; margin: 0; font-size: 24px;">⚠️ ALERTA CRÍTICA ⚠️</h1>
      </div>

      <p style="color: #9ca3af; line-height: 1.6;">
        <strong style="color: #f3f4f6;">${name}</strong>, has ignorado múltiples recordatorios.
        Tu disciplina está en riesgo.
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #1f2937; border-radius: 8px;">
        <thead>
          <tr style="background: #374151;">
            <th style="padding: 8px 12px; text-align: left; color: #ef4444;">Hábito</th>
            <th style="padding: 8px 12px; text-align: left; color: #ef4444;">Estado</th>
          </tr>
        </thead>
        <tbody>
          ${missedList}
        </tbody>
      </table>

      <div style="background: #7f1d1d; border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="color: #fca5a5; margin: 0; font-size: 14px; text-align: center;">
          ¡Recupera el control ahora! Cada acción cuenta.
        </p>
      </div>

      <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 24px;">
        Discipline Tracker — Tu aliado para construir mejores hábitos
      </p>
    </div>
  `;

  return { subject, html };
}

export { getTransport };

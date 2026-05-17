import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { sendEmail, buildHabitReminderEmail, buildCriticalAlertEmail } from '../services/email';

export const emailRouter = Router();

const sendEmailSchema = z.object({
  to: z.string().email('Valid email required'),
  subject: z.string().min(1, 'Subject is required'),
  html: z.string().min(1, 'HTML content is required'),
  text: z.string().optional(),
});

emailRouter.post('/send', async (req: Request, res: Response) => {
  const parsed = sendEmailSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    return;
  }

  const result = await sendEmail(parsed.data);

  if (result.success) {
    res.json({ success: true, message: 'Email sent' });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

const reminderSchema = z.object({
  to: z.string().email(),
  name: z.string().min(1),
  pendingHabits: z.array(z.object({
    name: z.string(),
    category: z.string(),
    scheduledTime: z.string(),
  })).min(1),
});

emailRouter.post('/reminder', async (req: Request, res: Response) => {
  const parsed = reminderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    return;
  }

  const { to, name, pendingHabits } = parsed.data;
  const { subject, html } = buildHabitReminderEmail(name, pendingHabits);
  const result = await sendEmail({ to, subject, html });

  if (result.success) {
    res.json({ success: true, message: 'Reminder sent' });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

const criticalSchema = z.object({
  to: z.string().email(),
  name: z.string().min(1),
  missedHabits: z.array(z.object({
    name: z.string(),
    streak: z.number(),
  })).min(1),
});

emailRouter.post('/critical-alert', async (req: Request, res: Response) => {
  const parsed = criticalSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    return;
  }

  const { to, name, missedHabits } = parsed.data;
  const { subject, html } = buildCriticalAlertEmail(name, missedHabits);
  const result = await sendEmail({ to, subject, html });

  if (result.success) {
    res.json({ success: true, message: 'Critical alert sent' });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

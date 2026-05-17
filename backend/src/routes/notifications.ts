import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { sendPushNotification, sendBatchPushNotifications } from '../services/push';

export const notificationRouter = Router();

const sendSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  data: z.record(z.unknown()).optional(),
});

const sendBatchSchema = z.object({
  notifications: z.array(z.object({
    token: z.string().min(1),
    title: z.string().min(1),
    body: z.string().min(1),
    data: z.record(z.unknown()).optional(),
  })).min(1).max(100, 'Max 100 notifications per batch'),
});

notificationRouter.post('/send', async (req: Request, res: Response) => {
  const parsed = sendSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    return;
  }

  const { token, title, body, data } = parsed.data;
  const result = await sendPushNotification(token, title, body, data);

  if (result.success) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

notificationRouter.post('/send-batch', async (req: Request, res: Response) => {
  const parsed = sendBatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    return;
  }

  const result = await sendBatchPushNotifications(parsed.data.notifications);

  if (result.success) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false, errors: result.errors });
  }
});

notificationRouter.post('/register-token', async (req: Request, res: Response) => {
  const schema = z.object({
    token: z.string().min(1, 'Push token is required'),
    userId: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    return;
  }

  const { token, userId } = parsed.data;
  console.log(`[Push] Token registered${userId ? ` for user ${userId}` : ''}: ${token}`);

  res.json({ success: true, message: 'Token registered' });
});

import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

const expo = new Expo();

export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  if (!Expo.isExpoPushToken(token)) {
    return { success: false, error: 'Invalid Expo push token' };
  }

  const message: ExpoPushMessage = {
    to: token,
    sound: 'default',
    title,
    body,
    data: data || {},
    priority: 'high',
    badge: 1,
    channelId: 'default',
  };

  try {
    const ticket: ExpoPushTicket = await expo.sendPushNotificationsAsync([message]);
    return { success: true, ticket: JSON.stringify(ticket) };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

export async function sendBatchPushNotifications(
  notifications: { token: string; title: string; body: string; data?: Record<string, unknown> }[]
): Promise<{ success: boolean; errors: string[] }> {
  const messages: ExpoPushMessage[] = [];

  for (const notif of notifications) {
    if (!Expo.isExpoPushToken(notif.token)) continue;

    messages.push({
      to: notif.token,
      sound: 'default',
      title: notif.title,
      body: notif.body,
      data: notif.data || {},
      priority: 'high',
    });
  }

  if (messages.length === 0) {
    return { success: false, errors: ['No valid tokens'] };
  }

  try {
    const tickets = await expo.sendPushNotificationsAsync(messages);
    const errors: string[] = [];

    for (const ticket of tickets) {
      if (ticket.status === 'error' && ticket.message) {
        errors.push(ticket.message);
      }
    }

    return { success: errors.length === 0, errors };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, errors: [errorMessage] };
  }
}

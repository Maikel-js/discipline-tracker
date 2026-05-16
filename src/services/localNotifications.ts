import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import type { NotificationLevel } from '@/types';

const isNative = Capacitor.isNativePlatform();

const notificationMessages: Record<NotificationLevel, { title: string; message: string }> = {
  1: { title: 'Recordatorio', message: '¡No olvides completar tu hábito!' },
  2: { title: 'Recordatorio Urgente', message: 'Ya pasaron 5 minutos. ¡Fecha límite cercana!' },
  3: { title: 'Repetición', message: 'Aún no completas este hábito. ¡Debes hacerlo!' },
  4: { title: 'ALARMA', message: '⚠️ ALARMA SONORA ACTIVADA' },
  5: { title: 'MODO EXTREMO', message: '⚠️ BLOQUEO TOTAL ⚠️' },
};

function hashId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % 900000 + 100;
}

export async function requestPermissions(): Promise<boolean> {
  if (!isNative) return false;
  try {
    const { display } = await LocalNotifications.requestPermissions();
    return display === 'granted';
  } catch {
    return false;
  }
}

function getNotificationId(habitId: string, level: number): number {
  return hashId(`${habitId}-level-${level}`);
}

export async function scheduleHabitNotifications(
  habitId: string,
  habitName: string,
  scheduledTime: Date,
  thresholds: number[],
  notificationsEnabled: boolean,
  soundEnabled: boolean
): Promise<void> {
  if (!isNative || !notificationsEnabled) return;

  const now = Date.now();
  const baseTime = scheduledTime.getTime();

  for (let level = 1; level <= 5; level++) {
    const offsetMinutes = thresholds[level - 1];
    const triggerTime = new Date(baseTime + offsetMinutes * 60000);

    if (triggerTime.getTime() <= now) continue;

    const msg = notificationMessages[level as NotificationLevel];
    const id = getNotificationId(habitId, level);
    const isAlarm = level >= 4;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title: msg.title,
            body: `${habitName}: ${msg.message}`,
            schedule: { at: triggerTime },
            sound: isAlarm && soundEnabled ? 'alarm.wav' : undefined,
            smallIcon: 'ic_stat_icon',
            largeIcon: 'ic_launcher',
            ongoing: isAlarm,
            channelId: isAlarm ? 'alarm-channel' : 'reminder-channel',
            actionTypeId: '',
            extra: {
              habitId,
              level,
            },
          },
        ],
      });
    } catch {
      // silently fail
    }
  }
}

export async function cancelHabitNotifications(habitId: string): Promise<void> {
  if (!isNative) return;
  const ids = [1, 2, 3, 4, 5].map((level) => ({
    id: getNotificationId(habitId, level),
  }));
  try {
    await LocalNotifications.cancel({ notifications: ids });
  } catch {
    // silently fail
  }
}

export async function removeAllDeliveredNotifications(): Promise<void> {
  if (!isNative) return;
  try {
    await LocalNotifications.removeAllDeliveredNotifications();
  } catch {
    // silently fail
  }
}

export function addNotificationReceivedListener(
  handler: (notification: { habitId: string; level: number }) => void
): () => void {
  if (!isNative) return () => {};
  try {
    const listener = LocalNotifications.addListener(
      'localNotificationReceived',
      (notification) => {
        const extra = notification.extra as { habitId?: string; level?: number } | undefined;
        if (extra?.habitId) {
          handler({ habitId: extra.habitId, level: extra.level ?? 1 });
        }
      }
    );
    return () => {
      listener.then((l) => l.remove());
    };
  } catch {
    return () => {};
  }
}

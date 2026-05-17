import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PUSH_TOKEN_KEY = 'expo_push_token';
const API_URL = __DEV__
  ? 'http://localhost:4000/api'
  : 'https://api.discipline-tracker.app/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function handleRegistrationError(errorMessage: string) {
  console.warn('[PushNotifications] Registration error:', errorMessage);
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Recordatorios',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#8b5cf6',
    });
    await Notifications.setNotificationChannelAsync('alarm', {
      name: 'Alarmas',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [500, 500, 500, 500],
      lightColor: '#ef4444',
      bypassDnd: true,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    handleRegistrationError('Permission not granted');
    return null;
  }

  const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    handleRegistrationError('Project ID not found');
    return null;
  }

  try {
    let token: string;

    if (Device.isDevice) {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({ projectId })
      ).data;
      token = pushTokenString;
    } else {
      token = `simulator-${Date.now()}`;
    }

    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    return token;
  } catch (e: unknown) {
    handleRegistrationError(`${e}`);
    return null;
  }
}

export async function getStoredPushToken(): Promise<string | null> {
  return AsyncStorage.getItem(PUSH_TOKEN_KEY);
}

export async function removePushToken(): Promise<void> {
  await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
}

export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, title, body, data }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function addNotificationReceivedListener(
  handler: (notification: Notifications.Notification) => void
) {
  const subscription = Notifications.addNotificationReceivedListener(handler);
  return () => subscription.remove();
}

export function addNotificationResponseReceivedListener(
  handler: (response: Notifications.NotificationResponse) => void
) {
  const subscription =
    Notifications.addNotificationResponseReceivedListener(handler);
  return () => subscription.remove();
}

export async function getLastNotificationResponse() {
  return Notifications.getLastNotificationResponseAsync();
}

export function scheduleLocalNotification(
  title: string,
  body: string,
  trigger: Notifications.NotificationTriggerInput,
  data?: Record<string, unknown>
) {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: true },
    trigger,
  });
}

export function cancelAllScheduledNotifications() {
  return Notifications.cancelAllScheduledNotificationsAsync();
}

export function setBadgeCount(count: number) {
  return Notifications.setBadgeCountAsync(count);
}

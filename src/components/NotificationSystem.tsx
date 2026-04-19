'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Bell, AlertTriangle, Volume2, Vibrate as Vibration, ShieldAlert, X } from 'lucide-react';
import type { NotificationLevel, Habit } from '@/types';

interface Props {
  habit: Habit;
}

const notificationMessages: Record<NotificationLevel, { title: string; message: string }> = {
  1: { title: 'Recordatorio', message: '¡No olvides completar tu hábito!' },
  2: { title: 'Recordatorio Urgente', message: 'Ya pasaron 5 minutos. ¡Fecha límite cercana!' },
  3: { title: 'Repetición', message: '仍未完成。¡Debes completar este hábito!' },
  4: { title: 'ALARMA', message: '⚠️ ALARMA SONORA ACTIVADA' },
  5: { title: 'MODO EXTREMO', message: '⚠️ BLOQUEO TOTAL ⚠️' }
};

export default function NotificationSystem({ habit }: Props) {
  const { 
    settings, 
    notifications, 
    addNotification, 
    acknowledgeNotification,
    triggerAlarm,
    completeHabit,
    logs
  } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<NotificationLevel>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const vibrationRef = useRef<number | null>(null);

  const habitNotifications = notifications.filter(n => n.habitId === habit.id && !n.acknowledged);
  const maxLevel = habitNotifications.length > 0 
    ? Math.max(...habitNotifications.map(n => n.level)) 
    : 0;

  useEffect(() => {
    if (habit.status !== 'pending') {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (vibrationRef.current && navigator.vibrate) {
        navigator.vibrate(0);
        vibrationRef.current = null;
      }
      return;
    }

    const isExtreme = settings.extremeMode;
    const isPunishment = settings.punishmentMode;

    const checkPending = () => {
      const scheduledTime = new Date(habit.scheduledTime);
      const now = new Date();
      const diffMinutes = (now.getTime() - scheduledTime.getTime()) / (1000 * 60);

      const thresholds = isExtreme
        ? [0, 1, 2, 3, 5]
        : isPunishment
          ? [0, 3, 5, 10, 15]
          : [0, 5, 10, 15, 20];

      if (diffMinutes >= thresholds[0] && diffMinutes < thresholds[1] && maxLevel < 1) {
        addNotification(habit.id, 1);
        setCurrentLevel(1);
        if (settings.notificationsEnabled) {
          showBrowserNotification(notificationMessages[1]);
        }
      } else if (diffMinutes >= thresholds[1] && diffMinutes < thresholds[2] && maxLevel < 2) {
        addNotification(habit.id, 2);
        setCurrentLevel(2);
        if (settings.notificationsEnabled) {
          showBrowserNotification(notificationMessages[2]);
        }
      } else if (diffMinutes >= thresholds[2] && diffMinutes < thresholds[3] && maxLevel < 3) {
        addNotification(habit.id, 3);
        setCurrentLevel(3);
        setShowModal(true);
      } else if (diffMinutes >= thresholds[3] && diffMinutes < thresholds[4] && maxLevel < 4) {
        addNotification(habit.id, 4);
        setCurrentLevel(4);
        if (settings.soundEnabled) {
          playAlarm();
        }
        if (isExtreme || isPunishment) {
          repeatAlarm(isExtreme ? 3000 : 5000);
        }
        setShowModal(true);
      } else if (diffMinutes >= thresholds[4] && maxLevel < 5) {
        addNotification(habit.id, 5);
        setCurrentLevel(5);
        if (isExtreme) {
          repeatAlarm(1000);
        }
        setShowModal(true);
      }
    };

    const intervalTime = isExtreme ? 10000 : isPunishment ? 20000 : 30000;
    const interval = setInterval(checkPending, intervalTime);
    checkPending();

    return () => clearInterval(interval);
  }, [habit, maxLevel, settings]);

  useEffect(() => {
    if (settings.extremeMode && habit.status === 'missed') {
      setShowModal(true);
      setCurrentLevel(5);
      if (settings.soundEnabled) {
        playAlarm();
      }
    }
  }, [habit.status]);

  const showBrowserNotification = async (msg: { title: string; message: string }) => {
    if ('Notification' in window && Notification.permission === 'granted') {
new Notification(msg.title, {
        body: msg.message,
        icon: '/icon.png',
        badge: '/badge.png'
      });
    }
  };

  const playAlarm = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      if (settings.vibrationEnabled && 'vibrate' in navigator) {
        navigator.vibrate([500, 200, 500, 200, 500]);
        vibrationRef.current = 1;
      }
    }
  };

  const repeatAlarm = (interval: number) => {
    if (settings.extremeMode) {
      const repeat = setInterval(() => {
        playAlarm();
        if (settings.vibrationEnabled && 'vibrate' in navigator) {
          navigator.vibrate([500, 100, 500, 100, 500]);
        }
      }, interval);
      vibrationRef.current = repeat as unknown as number;
    }
  };

  const handleComplete = () => {
    completeHabit(habit.id);
    setShowModal(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleAcknowledge = () => {
    if (habitNotifications[0]) {
      acknowledgeNotification(habitNotifications[0].id);
    }
  };

  return (
    <>
      <audio 
        ref={audioRef}
        src="data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0Y" 
        loop 
      />
      
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className={`relative z-10 bg-gray-900 border-2 rounded-2xl p-8 max-w-md w-full mx-4 text-center ${
            currentLevel >= 4 ? 'border-red-500 animate-pulse' : 'border-orange-500'
          }`}>
            <div className="flex justify-center mb-4">
              {currentLevel === 5 ? (
                <ShieldAlert size={64} className="text-red-500 animate-pulse" />
              ) : currentLevel === 4 ? (
                <Volume2 size={64} className="text-red-500 animate-pulse" />
              ) : currentLevel >= 3 ? (
                <Vibration size={64} className="text-orange-500" />
              ) : (
                <AlertTriangle size={64} className="text-orange-500" />
              )}
            </div>
            
            <h2 className={`text-2xl font-bold mb-2 ${
              currentLevel >= 4 ? 'text-red-500' : 'text-orange-500'
            }`}>
              {notificationMessages[currentLevel as NotificationLevel].title}
            </h2>
            
            <p className="text-gray-300 mb-4">
              {habit.name}
            </p>
            
            <p className="text-gray-400 mb-6">
              {notificationMessages[currentLevel as NotificationLevel].message}
            </p>

            <div className="space-y-3">
              <button
                onClick={handleComplete}
                className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-lg transition-colors"
              >
                ✓ Completar Ahora
              </button>
              
              {currentLevel < 4 && (
                <button
                  onClick={handleAcknowledge}
                  className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  Recordar más tarde
                </button>
              )}
            </div>

            {currentLevel >= 4 && (
              <p className="text-red-400 text-xs mt-4">
                ⚠️ No puedes posponer sin completar
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
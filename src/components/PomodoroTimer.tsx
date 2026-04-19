'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Play, Pause, Square, Timer, Coffee } from 'lucide-react';

interface Props {
  taskId?: string;
  habitId?: string;
  onComplete?: () => void;
}

export default function PomodoroTimer({ taskId, habitId, onComplete }: Props) {
  const { startPomodoro, endPomodoro, settings } = useStore();
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState((settings.pomodoroLength || 25) * 60);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(s => s - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      if (sessionId) {
        endPomodoro(sessionId, true);
      }
      if (onComplete) onComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, sessionId]);

  const handleStart = () => {
    startPomodoro(taskId, habitId);
    const sessions = useStore.getState().pomodoroSessions;
    setSessionId(sessions[sessions.length - 1]?.id || null);
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    if (sessionId) {
      endPomodoro(sessionId, false);
    }
    setIsRunning(false);
    setSecondsLeft((settings.pomodoroLength || 25) * 60);
    setSessionId(null);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '25:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const pomodoroMinutes = settings.pomodoroLength || 25;
  const progress = ((pomodoroMinutes * 60 - secondsLeft) / (pomodoroMinutes * 60)) * 100;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white font-medium">
          <Timer size={18} className="text-red-500" />
          Pomodoro
        </div>
        <div className="text-xs text-gray-400">
          {(settings.pomodoroLength || 25)} min trabajo / {(settings.breakLength || 5)} min descanso
        </div>
      </div>

      <div className="relative mb-4">
        <div className="text-4xl font-bold text-center text-white">
          {isNaN(secondsLeft) ? '25:00' : formatTime(secondsLeft)}
        </div>
        <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white"
          >
            <Play size={16} />
            Iniciar
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-white"
          >
            <Pause size={16} />
            Pausar
          </button>
        )}
        <button
          onClick={handleReset}
          className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white"
        >
          <Square size={16} />
        </button>
      </div>
    </div>
  );
}
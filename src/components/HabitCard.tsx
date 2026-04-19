'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Check, X, Flame, Clock, Bell, AlertTriangle } from 'lucide-react';
import type { Habit, HabitStatus, Priority, Category } from '@/types';

interface Props {
  habit: Habit;
}

const priorityColors: Record<Priority, string> = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500'
};

const categoryColors: Record<Category, string> = {
  health: 'text-green-400',
  study: 'text-blue-400',
  exercise: 'text-red-400',
  work: 'text-purple-400',
  personal: 'text-yellow-400',
  other: 'text-gray-400'
};

export default function HabitCard({ habit }: Props) {
  const { completeHabit, missHabit, settings } = useStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const isOverdue = habit.status === 'pending' && new Date(habit.scheduledTime) < new Date();

  const handleComplete = () => {
    completeHabit(habit.id);
    setShowConfirm(false);
  };

  const handleMiss = () => {
    missHabit(habit.id);
    setShowConfirm(false);
  };

  return (
    <div className={`card hover:scale-[1.02] transition-all duration-200 ${
      habit.status === 'completed' ? 'bg-green-900/30 border-green-500/50' :
      habit.status === 'missed' ? 'bg-red-900/30 border-red-500/50' :
      isOverdue ? 'bg-red-900/20 border-red-500/30' : 'bg-gray-800/50 border-gray-700'
    } border rounded-xl p-4`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${priorityColors[habit.priority]}`} />
            <span className={`text-xs uppercase ${categoryColors[habit.category]}`}>
              {habit.category}
            </span>
          </div>
          <h3 className="font-semibold text-white">{habit.name}</h3>
        </div>
        <div className="flex items-center gap-1 text-orange-400">
          <Flame size={16} />
          <span className="text-sm font-bold">{habit.currentStreak}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{habit.scheduledTime}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Meta:</span>
          <span>{habit.streakGoal} días</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Cumplimiento:</span>
          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
              style={{ width: `${habit.completionRate}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">{habit.completionRate}%</span>
        </div>

        {habit.status === 'pending' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfirm(!showConfirm)}
              className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              {showConfirm ? <X size={18} /> : <Check size={18} />}
            </button>
            {showConfirm && (
              <>
                <button
                  onClick={handleComplete}
                  className="p-2 rounded-lg bg-green-600 hover:bg-green-500 text-white transition-colors"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={handleMiss}
                  className="p-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </>
            )}
          </div>
        )}

        {habit.status === 'completed' && (
          <div className="flex items-center gap-1 text-green-400">
            <Check size={18} />
            <span className="text-xs">Completado</span>
          </div>
        )}

        {habit.status === 'missed' && (
          <div className="flex items-center gap-1 text-red-400">
            <X size={18} />
            <span className="text-xs">Incumplido</span>
          </div>
        )}
      </div>

      {settings.extremeMode && habit.status === 'pending' && isOverdue && (
        <div className="mt-3 pt-3 border-t border-red-500/30 flex items-center gap-2 text-red-400 animate-pulse">
          <AlertTriangle size={14} />
          <span className="text-xs">¡HÁBITO INCUMPLIDO! Modo disciplina extrema activado</span>
        </div>
      )}
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Lightbulb, TrendingDown, Clock, ArrowRight } from 'lucide-react';

interface Recommendation {
  id: string;
  type: 'time_change' | 'schedule_adjust' | 'abandoned' | 'pattern';
  title: string;
  description: string;
  action: string;
}

export default function SmartTracker() {
  const { habits, logs, updateHabit, completeHabit } = useStore();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    const analyzePatterns = () => {
      const recs: Recommendation[] = [];

      habits.forEach(habit => {
        const habitLogs = logs.filter(l => l.habitId === habit.id);
        const missedLogs = habitLogs.filter(l => l.status === 'missed');
        
        if (missedLogs.length >= 3) {
          recs.push({
            id: `abandoned-${habit.id}`,
            type: 'abandoned',
            title: 'Hábito abandonado detectado',
            description: `"${habit.name}" ha sido incumplido ${missedLogs.length} veces.`,
            action: 'Considera eliminarlo o reducir su dificultad.'
          });
        }

        const hours = missedLogs.map(l => new Date(l.completedAt).getHours());
        const hourCounts: Record<number, number> = {};
        hours.forEach(h => hourCounts[h] = (hourCounts[h] || 0) + 1);
        
        const failingHour = Object.entries(hourCounts)
          .sort(([,a], [,b]) => b - a)[0];
        
        if (failingHour && parseInt(failingHour[0]) >= 18) {
          const suggestedTime = parseInt(failingHour[0]) - 2;
          recs.push({
            id: `time-${habit.id}`,
            type: 'time_change',
            title: 'Ajuste de horario recomendado',
            description: `Sueles fallar "${habit.name}" a las ${failingHour[0]}:00.`,
            action: `¿Cambiar la hora a las ${suggestedTime}:00?`
          });
        }

        if (habit.currentStreak > habit.streakGoal * 2) {
          recs.push({
            id: `success-${habit.id}`,
            type: 'schedule_adjust',
            title: '¡Excelente progreso!',
            description: `Llevas ${habit.currentStreak} días con "${habit.name}".`,
            action: 'Considera aumentar la meta de rachas.'
          });
        }
      });

      setRecommendations(recs);
    };

    analyzePatterns();
  }, [logs, habits]);

  const handleAction = (rec: Recommendation) => {
    if (rec.type === 'time_change') {
      const habitId = rec.id.replace('time-', '');
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        const currentHour = parseInt(habit.scheduledTime.split(':')[0]);
        const newTime = `${currentHour - 2}:00`;
        updateHabit(habitId, { scheduledTime: newTime });
      }
    } else if (rec.type === 'abandoned') {
      const habitId = rec.id.replace('abandoned-', '');
      if (confirm('¿Eliminar este hábito?')) {
        useStore.getState().deleteHabit(habitId);
      }
    }
  };

  if (recommendations.length === 0) return null;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={18} className="text-yellow-400" />
        <h3 className="font-semibold text-white">Análisis Inteligente</h3>
      </div>
      
      <div className="space-y-3">
        {recommendations.map(rec => (
          <div 
            key={rec.id}
            className={`p-3 rounded-lg border ${
              rec.type === 'abandoned' ? 'bg-red-900/20 border-red-500/30' :
              rec.type === 'time_change' ? 'bg-orange-900/20 border-orange-500/30' :
              rec.type === 'schedule_adjust' ? 'bg-green-900/20 border-green-500/30' :
              'bg-gray-700/50 border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {rec.type === 'abandoned' && <TrendingDown size={14} className="text-red-400" />}
                  {rec.type === 'time_change' && <Clock size={14} className="text-orange-400" />}
                  {rec.type === 'schedule_adjust' && <Lightbulb size={14} className="text-green-400" />}
                  <span className="text-sm font-medium text-white">{rec.title}</span>
                </div>
                <p className="text-xs text-gray-400">{rec.description}</p>
                <p className="text-xs text-gray-500 mt-1">{rec.action}</p>
              </div>
              <button
                onClick={() => handleAction(rec)}
                className="p-2 hover:bg-gray-600 rounded-lg"
              >
                <ArrowRight size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import type { AIRecommendation, Prediction } from '@/types';
import { Sparkles, TrendingUp, Calendar, Clock, AlertTriangle, Brain, Target, Trophy } from 'lucide-react';

const DAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export default function AICoach() {
  const { habits, logs, tasks } = useStore();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    analyzeBehavior();
    generatePredictions();
  }, [habits, logs]);

  const analyzeBehavior = () => {
    const newRecs: AIRecommendation[] = [];

    const dayStats = new Map<string, { completed: number; missed: number }>();
    const hourStats = new Map<number, { completed: number; missed: number }>();

    logs.forEach(log => {
      const date = new Date(log.completedAt);
      const day = DAYS_ES[date.getDay()];
      const hour = date.getHours();

      const dayData = dayStats.get(day) || { completed: 0, missed: 0 };
      if (log.status === 'completed') dayData.completed++;
      else dayData.missed++;
      dayStats.set(day, dayData);

      const hourData = hourStats.get(hour) || { completed: 0, missed: 0 };
      if (log.status === 'completed') hourData.completed++;
      else hourData.missed++;
      hourStats.set(hour, hourData);
    });

    let worstDay = '';
    let worstDayMissRate = 0;
    dayStats.forEach((data, day) => {
      const total = data.completed + data.missed;
      const missRate = total > 0 ? data.missed / total : 0;
      if (missRate > worstDayMissRate && total > 2) {
        worstDayMissRate = missRate;
        worstDay = day;
      }
    });

    if (worstDay) {
      newRecs.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'schedule',
        message: `Estás fallando los ${worstDay}s. Considera mover esos hábitos a otra hora o día.`,
        confidence: Math.round(worstDayMissRate * 100),
        action: 'recomendar_horario',
        createdAt: new Date().toISOString()
      });
    }

    let bestHour = 0;
    let bestHourRate = 0;
    hourStats.forEach((data, hour) => {
      const total = data.completed + data.missed;
      const completeRate = total > 0 ? data.completed / total : 0;
      if (completeRate > bestHourRate && total > 2) {
        bestHourRate = completeRate;
        bestHour = hour;
      }
    });

    if (bestHour > 0) {
      newRecs.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'time',
        message: `Tu mejor hora es ${bestHour}:00. Schedula hábitos importantes a esa hora.`,
        confidence: Math.round(bestHourRate * 100),
        createdAt: new Date().toISOString()
      });
    }

    const missedHabits = habits.filter(h => h.missedCount >= 3);
    if (missedHabits.length > 0) {
      newRecs.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'habit',
        message: `Has fallado "${missedHabits[0].name}" 3+ veces. ¿Querés eliminarlo o cambiar el horario?`,
        confidence: 80,
        createdAt: new Date().toISOString()
      });
    }

    setRecommendations(newRecs);
  };

  const generatePredictions = () => {
    const newPredictions: Prediction[] = [];

    habits.forEach((habit, idx) => {
      if (habit.status !== 'pending') return;

      const todayLogs = logs.filter(l => 
        l.habitId === habit.id && 
        l.completedAt.startsWith(new Date().toISOString().split('T')[0])
      );

      if (todayLogs.length === 0) {
        const scheduledTime = new Date(habit.scheduledTime);
        const now = new Date();
        const diffMinutes = (now.getTime() - scheduledTime.getTime()) / (1000 * 60);

        let probability = 50;
        const factors: string[] = [];

        if (diffMinutes > 60) {
          probability = 20;
          factors.push('YA PASÓ LA HORA');
        } else if (diffMinutes > 30) {
          probability = 40;
          factors.push('CASI VENCE');
        }

        if (habit.currentStreak === 0) {
          probability -= 20;
          factors.push('RACHA: 0');
        }

        if (habit.missedCount >= 2) {
          probability -= 15;
          factors.push('FALLOS RECIENTES');
        }

        probability = Math.max(5, Math.min(95, probability));

        newPredictions.push({
          id: habit.id,
          habitId: habit.id,
          probability,
          factors,
          lastUpdated: new Date().toISOString()
        });
      }
    });

    setPredictions(newPredictions);
  };

  const lowProbHabits = predictions.filter(p => p.probability < 40);

  return (
    <>
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`fixed bottom-24 right-4 p-3 rounded-full shadow-lg transition-colors z-40 ${
          lowProbHabits.length > 0 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse' 
            : 'bg-gray-800'
        }`}
      >
        <Brain className="w-6 h-6 text-white" />
      </button>

      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPanel(false)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-4 w-full max-w-md max-h-[70vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">AI Coach</h2>
            </div>

            {predictions.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Predicciones
                </h3>
                <div className="space-y-2">
                  {predictions.slice(0, 5).map(pred => {
                    const habit = habits.find(h => h.id === pred.habitId);
                    const color = pred.probability > 70 ? 'text-green-400' : pred.probability > 40 ? 'text-yellow-400' : 'text-red-400';
                    return (
                      <div key={pred.id} className="bg-gray-800 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-white text-sm">{habit?.name}</span>
                          <span className={`font-bold ${color}`}>{pred.probability}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              pred.probability > 70 ? 'bg-green-500' : pred.probability > 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${pred.probability}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {recommendations.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Recomendaciones
                </h3>
                <div className="space-y-2">
                  {recommendations.map(rec => (
                    <div key={rec.id} className="bg-gray-800 rounded-lg p-3 border-l-2 border-purple-500">
                      <p className="text-white text-sm">{rec.message}</p>
                      <span className="text-xs text-gray-500">{rec.confidence}% confianza</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendations.length === 0 && predictions.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                Completa hábitos para obtener recomendaciones personalizadas.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
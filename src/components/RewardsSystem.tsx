'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { Reward, LeaderboardEntry } from '@/types';
import { Trophy, Medal, Crown, Star, Lock, Zap, Flame, Target, Award, Users } from 'lucide-react';

const AVAILABLE_REWARDS: Reward[] = [
  { id: 'first_habit', name: 'Primer Paso', description: 'Completa tu primer hábito', icon: '🎯', requirement: 1, type: 'completion' },
  { id: 'streak_3', name: 'Consistente', description: '3 días de racha', icon: '🔥', requirement: 3, type: 'streak' },
  { id: 'streak_7', name: 'Dedicado', description: '7 días de racha', icon: '🔥', requirement: 7, type: 'streak' },
  { id: 'streak_30', name: 'Disciplinado', description: '30 días de racha', icon: '🏆', requirement: 30, type: 'streak' },
  { id: 'score_100', name: 'Puntaje 100', description: 'Alcanza 100 puntos', icon: '💯', requirement: 100, type: 'score' },
  { id: 'score_500', name: 'Estrella', description: 'Alcanza 500 puntos', icon: '⭐', requirement: 500, type: 'score' },
  { id: 'tasks_10', name: 'Productivo', description: 'Completa 10 tareas', icon: '✅', requirement: 10, type: 'completion' },
  { id: 'perfect_day', name: 'Día Perfecto', description: 'Completa todos los hábitos', icon: '💎', requirement: 1, type: 'completion' }
];

export default function RewardsPanel() {
  const { stats, habits, logs, tasks } = useStore();
  const [activeTab, setActiveTab] = useState<'rewards' | 'leaderboard'>('rewards');

  const unlockedRewards = AVAILABLE_REWARDS.map(reward => {
    let unlocked = false;
    let unlockedAt: string | undefined;

    if (reward.type === 'streak') {
      if (stats.currentStreak >= reward.requirement) unlocked = true;
    } else if (reward.type === 'score') {
      if (stats.disciplinaryScore >= reward.requirement) unlocked = true;
    } else if (reward.type === 'completion') {
      if (reward.id === 'first_habit' && habits.length >= 1) unlocked = true;
      if (reward.id === 'tasks_10' && tasks.filter(t => t.status === 'done').length >= 10) unlocked = true;
      if (reward.id === 'perfect_day') {
        const today = new Date().toISOString().split('T')[0];
        const completed = logs.filter(l => l.completedAt.startsWith(today) && l.status === 'completed').length;
        const pending = habits.filter(h => h.status === 'pending').length;
        if (completed > 0 && pending === 0) unlocked = true;
      }
    }

    return { ...reward, unlocked, unlockedAt };
  });

  const mockLeaderboard: LeaderboardEntry[] = [
    { rank: 1, userId: '1', userName: 'Maikel', score: 1250, streak: 28 },
    { rank: 2, userId: '2', userName: 'Carlos', score: 980, streak: 21 },
    { rank: 3, userId: '3', userName: 'Ana', score: 875, streak: 15 },
    { rank: 4, userId: 'you', userName: localStorage.getItem('discipline_user') ? JSON.parse(localStorage.getItem('discipline_user')!).name : 'Tú', score: stats.disciplinaryScore, streak: stats.currentStreak },
    { rank: 5, userId: '4', userName: 'Pedro', score: 450, streak: 7 },
    { rank: 6, userId: '5', userName: 'Sofia', score: 320, streak: 5 }
  ].sort((a, b) => b.score - a.score).map((entry, i) => ({ ...entry, rank: i + 1 }));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex-1 p-2 rounded-lg ${activeTab === 'rewards' ? 'bg-green-600' : 'bg-gray-700'}`}
        >
          <Trophy className="w-4 h-4 inline mr-1" />
          Recompensas
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 p-2 rounded-lg ${activeTab === 'leaderboard' ? 'bg-green-600' : 'bg-gray-700'}`}
        >
          <Users className="w-4 h-4 inline mr-1" />
          Ranking
        </button>
      </div>

      {activeTab === 'rewards' && (
        <div className="grid grid-cols-2 gap-2">
          {unlockedRewards.map(reward => (
            <div
              key={reward.id}
              className={`p-3 rounded-lg border ${
                reward.unlocked
                  ? 'bg-yellow-900/30 border-yellow-500'
                  : 'bg-gray-800/50 border-gray-700'
              }`}
            >
              <div className="text-2xl mb-1">{reward.icon}</div>
              <div className={`text-sm font-medium ${reward.unlocked ? 'text-yellow-400' : 'text-gray-400'}`}>
                {reward.name}
              </div>
              <div className="text-xs text-gray-500">{reward.description}</div>
              {reward.unlocked && (
                <div className="text-xs text-green-400 mt-1">✓ Desbloqueado</div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="space-y-2">
          {mockLeaderboard.map(entry => (
            <div
              key={entry.userId}
              className={`flex items-center justify-between p-3 rounded-lg ${
                entry.userId === 'you' ? 'bg-green-900/30 border border-green-500' : 'bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`font-bold w-6 ${
                  entry.rank === 1 ? 'text-yellow-400' :
                  entry.rank === 2 ? 'text-gray-400' :
                  entry.rank === 3 ? 'text-amber-600' : 'text-gray-500'
                }`}>
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                </span>
                <span className="text-white">{entry.userName}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">{entry.score} pts</div>
                <div className="text-xs text-gray-500">{entry.streak} días</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
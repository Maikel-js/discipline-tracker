'use client';

import { useStore } from '@/store/useStore';
import { Flame, Target, TrendingUp, Trophy, Zap, Calendar, Clock, CheckCircle, AlertTriangle, Timer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useEffect, useState } from 'react';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import PomodoroTimer from './PomodoroTimer';
import AuditPanel from './AuditPanel';
import SensorIntegration from './SensorIntegration';
import AccountabilityPartnerPanel from './AccountabilityPartner';

export default function Dashboard() {
  const { stats, habits, logs, tasks, settings, toggleExtremeMode, togglePunishmentMode, generatePatternInsights, patternInsights } = useStore();
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [contributionData, setContributionData] = useState<number[][]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activePanel, setActivePanel] = useState<'audit' | 'sensors' | 'partners' | null>(null);

  useEffect(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return format(date, 'yyyy-MM-dd');
    });

    const data = last7Days.map(date => {
      const completed = logs.filter(l => 
        l.completedAt.startsWith(date) && l.status === 'completed'
      ).length;
      const missed = logs.filter(l => 
        l.completedAt.startsWith(date) && l.status === 'missed'
      ).length;
      return {
        date: format(new Date(date), 'EEE'),
        completados: completed,
        incumplidos: missed
      };
    });
    setChartData(data);

    const categories = ['health', 'study', 'exercise', 'work', 'personal', 'other'];
    const catData = categories.map(cat => {
      const catHabits = habits.filter(h => h.category === cat);
      const avgRate = catHabits.length > 0
        ? Math.round(catHabits.reduce((acc, h) => acc + h.completionRate, 0) / catHabits.length)
        : 0;
      return { name: cat, rate: avgRate };
    }).filter(d => d.rate > 0);
    setCategoryData(catData);

    const weeks: number[][] = [];
    for (let w = 0; w < 12; w++) {
      const week: number[] = [];
      for (let d = 0; d < 7; d++) {
        const date = subDays(new Date(), (11 - w) * 7 + (6 - d));
        const dateStr = format(date, 'yyyy-MM-dd');
        const count = logs.filter(l => 
          l.completedAt.startsWith(dateStr) && l.status === 'completed'
        ).length;
        week.push(count);
      }
      weeks.push(week);
    }
    setContributionData(weeks);

    generatePatternInsights();
  }, [logs, habits]);

  const pendingTasks = tasks.filter(t => t.status === 'todo').length;
  const doingTasks = tasks.filter(t => t.status === 'doing').length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={togglePunishmentMode}
            className={`px-3 py-2 rounded-xl font-bold text-sm transition-colors ${
              settings.punishmentMode 
                ? 'bg-orange-600 text-white animate-pulse' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            <AlertTriangle size={14} className="inline mr-1" />
            {settings.punishmentMode ? 'CASTIGO' : 'Modo Castigo'}
          </button>
          <button
            onClick={toggleExtremeMode}
            className={`px-3 py-2 rounded-xl font-bold text-sm transition-colors ${
              settings.extremeMode 
                ? 'bg-red-600 text-white animate-pulse' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {settings.extremeMode ? '🔥 EXTREMO' : 'Modo Disciplina'}
          </button>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-2 rounded-xl text-sm transition-colors ${
              showAdvanced 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Avanzado
          </button>
        </div>
      </div>

      {showAdvanced && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setActivePanel(activePanel === 'audit' ? null : 'audit')}
            className={`px-3 py-1 rounded-lg text-sm ${activePanel === 'audit' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}
          >
            Auditoría
          </button>
          <button
            onClick={() => setActivePanel(activePanel === 'sensors' ? null : 'sensors')}
            className={`px-3 py-1 rounded-lg text-sm ${activePanel === 'sensors' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
          >
            Sensores
          </button>
          <button
            onClick={() => setActivePanel(activePanel === 'partners' ? null : 'partners')}
            className={`px-3 py-1 rounded-lg text-sm ${activePanel === 'partners' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}
          >
            Partners
          </button>
        </div>
      )}

      {activePanel === 'audit' && (
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
          <AuditPanel />
        </div>
      )}

      {activePanel === 'sensors' && (
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
          <SensorIntegration />
        </div>
      )}

      {activePanel === 'partners' && (
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
          <AccountabilityPartnerPanel />
        </div>
      )}

      {patternInsights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {patternInsights.slice(0, 3).map(insight => (
            <div key={insight.id} className="p-3 bg-gray-800/30 border border-gray-700 rounded-lg">
              <div className="text-xs text-gray-400">{insight.message}</div>
              <div className="text-lg font-bold text-white">{insight.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
          <PomodoroTimer />
        </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Trophy size={16} />
            <span className="text-xs">Score</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.disciplinaryScore}</div>
          <div className="text-xs text-gray-500">Nivel {stats.level}</div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Flame size={16} />
            <span className="text-xs">Racha</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">{stats.currentStreak}</div>
          <div className="text-xs text-gray-500">días consecutivos</div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <CheckCircle size={16} />
            <span className="text-xs">Hoy</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{stats.completedToday}</div>
          <div className="text-xs text-gray-500">completados</div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingUp size={16} />
            <span className="text-xs">Tasa</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.completionRate}%</div>
          <div className="text-xs text-gray-500">cumplimiento</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <h3 className="font-semibold text-white mb-4">Progreso Semanal</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="completados" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="incumplidos" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <h3 className="font-semibold text-white mb-4">Tareas</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="text-sm text-gray-400">Por hacer</span>
              </div>
              <span className="font-bold text-white">{pendingTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-400">En progreso</span>
              </div>
              <span className="font-bold text-white">{doingTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-gray-400">Completadas</span>
              </div>
              <span className="font-bold text-white">{doneTasks}</span>
            </div>
            <div className="pt-3 border-t border-gray-700">
              <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full flex">
                  <div 
                    className="bg-blue-500 transition-all" 
                    style={{ width: `${(doingTasks / (pendingTasks + doingTasks + doneTasks || 1)) * 100}%` }}
                  />
                  <div 
                    className="bg-green-500 transition-all" 
                    style={{ width: `${(doneTasks / (pendingTasks + doingTasks + doneTasks || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Calendario de Contribución</h3>
          <span className="text-xs text-gray-500"> ähnlich wie GitHub</span>
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-1">
            {contributionData.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((count, di) => (
                  <div
                    key={di}
                    className={`w-3 h-3 rounded-sm ${
                      count === 0 ? 'bg-gray-800' :
                      count === 1 ? 'bg-green-900' :
                      count === 2 ? 'bg-green-700' :
                      count === 3 ? 'bg-green-500' :
                      'bg-green-400'
                    }`}
                    title={`${count} completado(s)`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span>Menos</span>
            <div className="w-3 h-3 bg-gray-800 rounded-sm" />
            <div className="w-3 h-3 bg-green-900 rounded-sm" />
            <div className="w-3 h-3 bg-green-700 rounded-sm" />
            <div className="w-3 h-3 bg-green-500 rounded-sm" />
            <div className="w-3 h-3 bg-green-400 rounded-sm" />
            <span>Más</span>
          </div>
        </div>
      </div>
    </div>
  );
}
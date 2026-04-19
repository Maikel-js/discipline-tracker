'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import type { TimeBlock, DailyPlan, ConsistencyScore, AnalyticsData } from '@/types';
import { Clock, Calendar, TrendingUp, Zap, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Save, Download, History, Palette, Battery, BarChart3, AlertCircle } from 'lucide-react';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6);

export default function AutoScheduler() {
  const { habits, tasks, logs, settings, stats, addDisciplineScore } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [consistencyScore, setConsistencyScore] = useState<ConsistencyScore>({ score: 0, level: 1, trend: 'stable', weeklyAverage: 0, lastUpdated: '' });
  const [analytics, setAnalytics] = useState<AnalyticsData>({ productivityTrend: [], procrastinationIndex: 0, effectiveHours: 0, weeklyProductivity: 0, consistencyScore: 0 });
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    generateDailyPlan();
    calculateConsistencyScore();
    calculateAnalytics();
    loadHistory();
  }, [habits, tasks, logs, selectedDate]);

  const generateDailyPlan = () => {
    const blocks: TimeBlock[] = [];
    let blockIdx = 0;

    habits.filter(h => h.status !== 'completed').slice(0, 4).forEach((habit, idx) => {
      const startHour = 6 + idx * 2;
      const color = idx === 0 ? '#ef4444' : idx === 1 ? '#f97316' : idx === 2 ? '#eab308' : '#22c55e';
      blocks.push({
        id: `block-${blockIdx++}`,
        title: habit.name,
        startTime: `${startHour}:00`,
        endTime: `${startHour + 1}:30`,
        type: 'habit',
        color,
        completed: false
      });
    });

    tasks.filter(t => t.status === 'todo').slice(0, 3).forEach((task, idx) => {
      const startHour = 10 + idx * 2;
      blocks.push({
        id: `block-${blockIdx++}`,
        title: task.title,
        startTime: `${startHour}:00`,
        endTime: `${startHour + 1}:00`,
        type: 'task',
        color: '#3b82f6',
        completed: false
      });
    });

    blocks.push({
      id: `block-${blockIdx++}`,
      title: 'Pomodoro Focus',
      startTime: '14:00',
      endTime: '14:25',
      type: 'work',
      color: '#8b5cf6',
      completed: false
    });

    blocks.push({
      id: `block-${blockIdx++}`,
      title: 'Break',
      startTime: '14:25',
      endTime: '14:45',
      type: 'break',
      color: '#06b6d4',
      completed: false
    });

    const plan: DailyPlan = {
      id: Math.random().toString(36).substr(2, 9),
      date: selectedDate,
      blocks,
      totalBlocks: blocks.length,
      completedBlocks: 0
    };
    setDailyPlan(plan);
  };

  const calculateConsistencyScore = () => {
    const last7Days = logs.filter(l => {
      const diff = Date.now() - new Date(l.completedAt).getTime();
      return diff < 7 * 24 * 60 * 60 * 1000;
    });

    const dailyCounts = new Map<string, number>();
    last7Days.forEach(l => {
      const date = l.completedAt.split('T')[0];
      dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
    });

    let trend: 'up' | 'down' | 'stable' = 'stable';
    const values = Array.from(dailyCounts.values());
    if (values.length >= 2) {
      const recent = values.slice(-2)[0];
      const older = values.slice(0, -1).reduce((a, b) => a + b, 0) / (values.length - 1);
      if (recent > older * 1.2) trend = 'up';
      else if (recent < older * 0.8) trend = 'down';
    }

    const score = Math.min(100, Math.round((last7Days.length / 7) * 100));
    const level = Math.floor(score / 25) + 1;

    setConsistencyScore({
      score,
      level,
      trend,
      weeklyAverage: Math.round(values.reduce((a, b) => a + b, 0) / Math.max(1, values.length)),
      lastUpdated: new Date().toISOString()
    });
  };

  const calculateAnalytics = () => {
    const weekLogs = logs.filter(l => {
      const diff = Date.now() - new Date(l.completedAt).getTime();
      return diff < 7 * 24 * 60 * 60 * 1000;
    });

    const dailyProductivity = [0, 0, 0, 0, 0, 0, 0];
    weekLogs.forEach(l => {
      const day = new Date(l.completedAt).getDay();
      dailyProductivity[day]++;
    });

    const avg = dailyProductivity.reduce((a, b) => a + b, 0) / 7;
    const max = Math.max(...dailyProductivity);

    setAnalytics({
      productivityTrend: dailyProductivity,
      procrastinationIndex: Math.round((1 - avg / Math.max(1, max)) * 100),
      effectiveHours: Math.round(weekLogs.length * 0.5),
      weeklyProductivity: Math.round(avg * 10),
      consistencyScore: consistencyScore.score
    });
  };

  const loadHistory = () => {
    const stored = localStorage.getItem('discipline_history');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  };

  const saveHistory = (action: string, details: string) => {
    const entry = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      details,
      timestamp: new Date().toISOString()
    };
    const updated = [entry, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem('discipline_history', JSON.stringify(updated));
  };

  const exportBackup = () => {
    const data = {
      habits,
      tasks,
      logs,
      stats,
      settings,
      history,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discipline-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    saveHistory('backup', 'Exportó backup de datos');
  };

  const toggleBlock = (blockId: string) => {
    if (!dailyPlan) return;
    const updated = {
      ...dailyPlan,
      blocks: dailyPlan.blocks.map(b =>
        b.id === blockId ? { ...b, completed: !b.completed } : b
      ),
      completedBlocks: dailyPlan.blocks.find(b => b.id === blockId)?.completed
        ? dailyPlan.completedBlocks - 1
        : dailyPlan.completedBlocks + 1
    };
    setDailyPlan(updated);
    if (updated.blocks.find(b => b.id === blockId && !b.completed)) {
      addDisciplineScore(5, `Completó bloque: ${updated.blocks.find(b => b.id === blockId)?.title}`);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
    saveHistory('theme', `Cambió a modo ${newTheme}`);
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => changeDate(-1)} className="p-2 touch-active hover:bg-gray-800 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white text-sm"
            />
          </div>
          <button onClick={() => changeDate(1)} className="p-2 touch-active hover:bg-gray-800 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={exportBackup} className="p-2 touch-active hover:bg-gray-800 rounded-lg" title="Exportar Backup">
            <Download className="w-5 h-5" />
          </button>
          <button onClick={() => setShowHistory(!showHistory)} className={`p-2 touch-active rounded-lg ${showHistory ? 'bg-blue-600' : 'hover:bg-gray-800'}`} title="Historial">
            <History className="w-5 h-5" />
          </button>
          <button onClick={toggleTheme} className="p-2 touch-active hover:bg-gray-800 rounded-lg" title="Cambiar Tema">
            <Palette className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
            <Battery className="w-3 h-3" />
            Consistencia
          </div>
          <div className={`text-xl font-bold ${consistencyScore.trend === 'up' ? 'text-green-400' : consistencyScore.trend === 'down' ? 'text-red-400' : 'text-white'}`}>
            {consistencyScore.score}%
          </div>
          <div className="text-xs text-gray-500">Nivel {consistencyScore.level}</div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
            <AlertCircle className="w-3 h-3" />
            Procrastinación
          </div>
          <div className="text-xl font-bold text-yellow-400">{analytics.procrastinationIndex}%</div>
          <div className="text-xs text-gray-500">Índice</div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
            <Clock className="w-3 h-3" />
            Horas Efectivas
          </div>
          <div className="text-xl font-bold text-blue-400">{analytics.effectiveHours}h</div>
          <div className="text-xs text-gray-500">esta semana</div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
            <TrendingUp className="w-3 h-3" />
            Productividad
          </div>
          <div className="text-xl font-bold text-purple-400">{analytics.weeklyProductivity}</div>
          <div className="text-xs text-gray-500">puntos</div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-4">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Time Blocking
        </h3>

        <div className="space-y-1">
          {HOURS.map(hour => {
            const block = dailyPlan?.blocks.find(b => {
              const start = parseInt(b.startTime.split(':')[0]);
              return start === hour;
            });
            return (
              <div key={hour} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-12">{hour}:00</span>
                {block ? (
                  <button
                    onClick={() => toggleBlock(block.id)}
                    className={`flex-1 p-2 rounded-lg text-left text-sm transition-all ${
                      block.completed
                        ? 'bg-green-900/50 border border-green-500 text-green-400'
                        : 'bg-gray-700 border border-gray-600 text-white hover:bg-gray-600'
                    }`}
                    style={{ borderLeftColor: block.color, borderLeftWidth: '3px' }}
                  >
                    <span className={block.completed ? 'line-through' : ''}>{block.title}</span>
                  </button>
                ) : (
                  <div className="flex-1 p-2 bg-gray-900/30 rounded-lg text-sm text-gray-600">
                    Libre
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showHistory && (
        <div className="bg-gray-800/50 rounded-xl p-4 max-h-64 overflow-y-auto">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <History className="w-4 h-4" />
            Historial
          </h3>
          <div className="space-y-2">
            {history.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay historial</p>
            ) : (
              history.map(entry => (
                <div key={entry.id} className="flex justify-between text-sm">
                  <span className="text-white">{entry.action}</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(entry.timestamp).toLocaleString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import type { Habit, Task, HabitLog } from '@/types';
import { 
  BarChart3, TrendingUp, TrendingDown, Clock, Calendar,
  Target, Activity, Zap, Download, Filter, Eye,
  ArrowUpRight, ArrowDownRight, Minus, RefreshCw,
  ChevronDown, ChevronUp, CalendarDays, FileSpreadsheet, FileText
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, subMonths, startOfWeek, eachDayOfInterval, startOfMonth } from 'date-fns';

type Period = 'week' | 'month' | 'quarter';
type MetricType = 'completion' | 'streak' | 'productivity' | 'procrastination';

export default function AnalyticsHub() {
  const { habits, tasks, logs, stats } = useStore();
  const [period, setPeriod] = useState<Period>('week');
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const filteredLogs = useMemo(() => {
    let filtered = logs;
    const now = new Date();
    
    if (period === 'week') {
      filtered = filtered.filter(l => now.getTime() - new Date(l.completedAt).getTime() < 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      filtered = filtered.filter(l => now.getTime() - new Date(l.completedAt).getTime() < 30 * 24 * 60 * 60 * 1000);
    } else {
      filtered = filtered.filter(l => now.getTime() - new Date(l.completedAt).getTime() < 90 * 24 * 60 * 60 * 1000);
    }

    if (selectedHabitId !== 'all') {
      filtered = filtered.filter(l => l.habitId === selectedHabitId);
    }

    return filtered;
  }, [logs, period, selectedHabitId]);

  const completionRate = useMemo(() => {
    const completed = filteredLogs.filter(l => l.status === 'completed').length;
    const total = filteredLogs.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [filteredLogs]);

  const consistencyScore = useMemo(() => {
    const dailyCompletions = new Map<string, number>();
    filteredLogs.forEach(log => {
      const date = log.completedAt.split('T')[0];
      dailyCompletions.set(date, (dailyCompletions.get(date) || 0) + 1);
    });
    
    const values = Array.from(dailyCompletions.values());
    if (values.length === 0) return 0;
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return Math.round(Math.max(0, Math.min(100, avg * 10 - stdDev * 2)));
  }, [filteredLogs]);

  const procrastinationIndex = useMemo(() => {
    const missed = filteredLogs.filter(l => l.status === 'missed').length;
    const total = logs.length;
    return total > 0 ? Math.round((missed / total) * 100) : 0;
  }, [filteredLogs, logs]);

  const dailyData = useMemo(() => {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    const result = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayLogs = filteredLogs.filter(l => l.completedAt.startsWith(dateStr));
      
      result.push({
        date: format(date, 'MMM dd'),
        day: format(date, 'EEE'),
        completed: dayLogs.filter(l => l.status === 'completed').length,
        missed: dayLogs.filter(l => l.status === 'missed').length,
        rate: dayLogs.length > 0 ? Math.round((dayLogs.filter(l => l.status === 'completed').length / dayLogs.length) * 100) : 0
      });
    }
    return result;
  }, [filteredLogs, period]);

  const bestDay = useMemo(() => {
    const dayStats = new Map<string, { completed: number; total: number }>();
    dailyData.forEach(d => {
      const existing = dayStats.get(d.day) || { completed: 0, total: 0 };
      dayStats.set(d.day, {
        completed: existing.completed + d.completed,
        total: existing.total + d.completed + d.missed
      });
    });

    let best = { day: '', rate: 0 };
    dayStats.forEach((stats, day) => {
      if (stats.total > 0) {
        const rate = (stats.completed / stats.total) * 100;
        if (rate > best.rate) {
          best = { day, rate };
        }
      }
    });
    return best;
  }, [dailyData]);

  const worstDay = useMemo(() => {
    const dayStats = new Map<string, { completed: number; total: number }>();
    dailyData.forEach(d => {
      const existing = dayStats.get(d.day) || { completed: 0, total: 0 };
      dayStats.set(d.day, {
        completed: existing.completed + d.completed,
        total: existing.total + d.completed + d.missed
      });
    });

    let worst = { day: '', rate: 100 };
    dayStats.forEach((stats, day) => {
      if (stats.total > 0) {
        const rate = (stats.completed / stats.total) * 100;
        if (rate < worst.rate) {
          worst = { day, rate };
        }
      }
    });
    return worst;
  }, [dailyData]);

  const topHabits = useMemo(() => {
    const habitStats = new Map<string, { completed: number; missed: number }>();
    
    habits.forEach(h => {
      habitStats.set(h.id, { completed: 0, missed: 0 });
    });

    filteredLogs.forEach(log => {
      const stats = habitStats.get(log.habitId);
      if (stats) {
        if (log.status === 'completed') stats.completed++;
        else stats.missed++;
      }
    });

    return habits
      .map(h => {
        const stat = habitStats.get(h.id) || { completed: 0, missed: 0 };
        return {
          id: h.id,
          name: h.name,
          category: h.category,
          completed: stat.completed,
          missed: stat.missed,
          rate: stat.completed + stat.missed > 0 ? Math.round((stat.completed / (stat.completed + stat.missed)) * 100) : 0
        };
      })
      .filter(h => h.completed + h.missed > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
  }, [habits, filteredLogs]);

  const hourStats = useMemo(() => {
    const hours = new Array(24).fill(0);
    filteredLogs
      .filter(l => l.status === 'completed')
      .forEach(l => {
        const hour = new Date(l.completedAt).getHours();
        hours[hour]++;
      });
    return hours.map((count, hour) => ({ hour: `${hour}:00`, count }));
  }, [filteredLogs]);

  const insights = useMemo(() => {
    const result = [];
    
    if (completionRate > 70) {
      result.push({ type: 'positive', text: 'Excelente tasa de cumplimiento', icon: '🎯' });
    } else if (completionRate < 40) {
      result.push({ type: 'negative', text: 'Cumplimiento bajo - necesitas mejorar', icon: '⚠️' });
    }

    if (bestDay.day) {
      result.push({ type: 'neutral', text: `Tu mejor día es el ${bestDay.day}`, icon: '📅' });
    }

    if (worstDay.day) {
      result.push({ type: 'warning', text: `Cuidado con el ${worstDay.day}`, icon: '🔔' });
    }

    if (procrastinationIndex > 30) {
      result.push({ type: 'warning', text: `Alta procrastinación: ${procrastinationIndex}%`, icon: '😴' });
    }

    return result;
  }, [completionRate, bestDay, worstDay, procrastinationIndex]);

  const trend = completionRate > 50 ? 'up' : completionRate > 30 ? 'stable' : 'down';

  const exportCSV = () => {
    const headers = ['Fecha', 'Completados', 'Incumplidos', 'Tasa'];
    const rows = dailyData.map(d => [d.date, d.completed, d.missed, d.rate]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportPDF = () => {
    const content = `
REPORTE DE ANÁLISIS - Discipline Tracker
Período: ${period.toUpperCase()}
Fecha: ${new Date().toLocaleDateString()}

MÉTRICAS PRINCIPALES:
- Tasa de Cumplimiento: ${completionRate}%
- Índice de Consistencia: ${consistencyScore}%
- Índice de Procrastinación: ${procrastinationIndex}%
- Mejor Día: ${bestDay.day} (${Math.round(bestDay.rate)}%)
- Peor Día: ${worstDay.day} (${Math.round(worstDay.rate)}%)

HÁBITOS TOP:
${topHabits.map(h => `- ${h.name}: ${h.rate}%`).join('\n')}

Generated by Discipline Tracker
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-analisis-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1 rounded-lg text-sm ${period === 'week' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            Semana
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1 rounded-lg text-sm ${period === 'month' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            Mes
          </button>
          <button
            onClick={() => setPeriod('quarter')}
            className={`px-3 py-1 rounded-lg text-sm ${period === 'quarter' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            Trimestre
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="p-2 bg-gray-700 rounded-lg" title="Exportar CSV">
            <FileSpreadsheet className="w-4 h-4" />
          </button>
          <button onClick={exportPDF} className="p-2 bg-gray-700 rounded-lg" title="Exportar Reporte">
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Tasa de Cumplimiento</div>
          <div className={`text-2xl font-bold ${completionRate > 70 ? 'text-green-400' : completionRate > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
            {completionRate}%
          </div>
          <div className="flex items-center text-xs">
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3 text-green-400" /> : 
             trend === 'down' ? <ArrowDownRight className="w-3 h-3 text-red-400" /> : 
             <Minus className="w-3 h-3 text-gray-400" />}
            <span className="text-gray-500 ml-1">{period}</span>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Índice de Consistencia</div>
          <div className={`text-2xl font-bold ${consistencyScore > 70 ? 'text-green-400' : consistencyScore > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
            {consistencyScore}%
          </div>
          <div className="text-xs text-gray-500">Confiabilidad</div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Procrastinación</div>
          <div className={`text-2xl font-bold ${procrastinationIndex < 20 ? 'text-green-400' : procrastinationIndex < 40 ? 'text-yellow-400' : 'text-red-400'}`}>
            {procrastinationIndex}%
          </div>
          <div className="text-xs text-gray-500">Índice</div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Total Acciones</div>
          <div className="text-2xl font-bold text-blue-400">
            {filteredLogs.length}
          </div>
          <div className="text-xs text-gray-500">En período</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Tendencia de Cumplimiento</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
              <YAxis stroke="#9ca3af" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
              <Area type="monotone" dataKey="completed" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
              <Area type="monotone" dataKey="missed" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Distribución por Hora</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourStats.filter(h => h.count > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9ca3af" fontSize={10} />
              <YAxis stroke="#9ca3af" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Top Hábitos</h4>
          <div className="space-y-2">
            {topHabits.map((h, i) => (
              <div key={h.id} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-4">#{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">{h.name}</span>
                    <span className={h.rate > 70 ? 'text-green-400' : h.rate > 40 ? 'text-yellow-400' : 'text-red-400'}>
                      {h.rate}%
                    </span>
                  </div>
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${h.rate}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Insights Automáticos</h4>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <div key={i} className={`p-3 rounded-lg ${
                insight.type === 'positive' ? 'bg-green-900/20 border border-green-500/30' :
                insight.type === 'negative' ? 'bg-red-900/20 border border-red-500/30' :
                insight.type === 'warning' ? 'bg-yellow-900/20 border border-yellow-500/30' :
                'bg-gray-700'
              }`}>
                <span className="mr-2">{insight.icon}</span>
                <span className="text-sm">{insight.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="font-medium mb-3">Análisis por Día</h4>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => {
            const dayData = dailyData.filter(d => d.day.toLowerCase().startsWith(day.toLowerCase().slice(0, 3)));
            const avg = dayData.length > 0 ? Math.round(dayData.reduce((a, b) => a + b.rate, 0) / dayData.length) : 0;
            return (
              <div key={day} className="p-2">
                <div className="text-xs text-gray-500 mb-1">{day.slice(0, 2)}</div>
                <div className={`h-8 rounded flex items-center justify-center text-xs font-bold ${
                  avg > 70 ? 'bg-green-500' : avg > 40 ? 'bg-yellow-500' : avg > 0 ? 'bg-red-500' : 'bg-gray-700'
                }`}>
                  {avg}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
'use client';

import { useStore } from '@/store/useStore';
import { Flame, TrendingUp, Trophy, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import PomodoroTimer from './PomodoroTimer';
import AuditPanel from './AuditPanel';
import SensorIntegration from './SensorIntegration';
import AccountabilityPartnerPanel from './AccountabilityPartner';

export default function Dashboard({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const { stats, habits, logs, tasks, settings, toggleExtremeMode, togglePunishmentMode, generatePatternInsights, patternInsights } = useStore();
  const [platform, setPlatform] = useState<'android' | 'windows' | 'linux' | 'web'>('web');
  const [chartData, setChartData] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activePanel, setActivePanel] = useState<'audit' | 'sensors' | 'partners' | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('android')) setPlatform('android');
    else if (userAgent.includes('win')) setPlatform('windows');
    else if (userAgent.includes('linux')) setPlatform('linux');

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

    generatePatternInsights();
  }, [logs, habits]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const calStart = startOfWeek(monthStart, { locale: es });
    const calEnd = endOfWeek(monthEnd, { locale: es });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [calendarMonth]);

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLogs = logs.filter(l => l.completedAt.startsWith(dateStr));
    const completed = dayLogs.filter(l => l.status === 'completed').length;
    const missed = dayLogs.filter(l => l.status === 'missed').length;
    if (completed > 0 && missed === 0) return 'completed';
    if (completed > 0 && missed > 0) return 'partial';
    if (missed > 0) return 'missed';
    return 'none';
  };

  const completedCount = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return logs.filter(l => l.completedAt.startsWith(dateStr) && l.status === 'completed').length;
  };

  const prevMonth = () => setCalendarMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCalendarMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const pendingTasks = tasks.filter(t => t.status === 'todo').length;
  const doingTasks = tasks.filter(t => t.status === 'doing').length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="flex gap-2">
          <button
            type="button"
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
            type="button"
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
            type="button"
            onClick={() => onTabChange('download')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
          >
            <Download size={16} />
            {platform === 'windows' ? 'Descargar para Windows' : 
             platform === 'android' ? 'Instalar App Android' : 
             platform === 'linux' ? 'Descargar para Linux' : 'Descargar App'}
          </button>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-2 rounded-xl text-sm transition-colors ${
              showAdvanced 
                ? 'bg-indigo-600 text-white' 
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
            type="button"
            onClick={() => setActivePanel(activePanel === 'audit' ? null : 'audit')}
            className={`px-3 py-1 rounded-lg text-sm ${activePanel === 'audit' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}
          >
            Auditoría
          </button>
          <button
            type="button"
            onClick={() => setActivePanel(activePanel === 'sensors' ? null : 'sensors')}
            className={`px-3 py-1 rounded-lg text-sm ${activePanel === 'sensors' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
          >
            Sensores
          </button>
          <button
            type="button"
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">Calendario</h3>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white text-sm">&lt;</button>
            <span className="text-sm text-gray-300 font-medium capitalize min-w-[120px] text-center">
              {format(calendarMonth, 'MMMM yyyy', { locale: es })}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white text-sm">&gt;</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {weekDays.map(d => (
            <div key={d} className="text-center text-[10px] text-gray-500 font-bold py-1">{d}</div>
          ))}
          {calendarDays.map((day, i) => {
            const status = getDayStatus(day);
            const count = completedCount(day);
            const isCurrentMonth = isSameMonth(day, calendarMonth);
            const isTodayDate = isToday(day);
            return (
              <div
                key={i}
                className={`text-center py-1 rounded text-xs relative ${
                  !isCurrentMonth ? 'opacity-20' : ''
                } ${
                  isTodayDate ? 'ring-1 ring-blue-500 bg-blue-900/20' : ''
                }`}
              >
                <span className={`font-medium ${isTodayDate ? 'text-white' : isCurrentMonth ? 'text-gray-300' : 'text-gray-600'}`}>
                  {format(day, 'd')}
                </span>
                {status !== 'none' && isCurrentMonth && (
                  <div className="flex justify-center gap-0.5 mt-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      status === 'completed' ? 'bg-green-500' :
                      status === 'partial' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                  </div>
                )}
                {count > 0 && isCurrentMonth && (
                  <div className="text-[8px] text-green-400 leading-none">{count}</div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-2 mt-2 text-[10px] text-gray-500">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Hecho</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Parcial</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Fallado</div>
        </div>
      </div>
    </div>
  );
}
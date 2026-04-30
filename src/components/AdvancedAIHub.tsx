'use client';

import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { emailService } from '@/components/EmailService';
import { useAuth } from '@/components/AuthProvider';
import type { DigitalTwin, Experiment } from '@/types';
import { 
  Brain, FlaskConical, BookOpen, Play, Pause,
  Target, TrendingUp, TrendingDown, Lightbulb, Zap, ChevronRight,
  Clock, Users, Building, GraduationCap, Activity, RefreshCw,
  CheckCircle, XCircle, ArrowLeft, BarChart3, Calendar, Award, Mail
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';

interface ExperimentResults {
  completionRate: number;
  totalLogs: number;
  completedLogs: number;
  missedLogs: number;
  avgStreak: number;
  trend: 'up' | 'down' | 'stable';
  dailyData: { date: string; completed: number; missed: number; rate: number }[];
  categoryBreakdown: { category: string; count: number; rate: number }[];
  beforeVsAfter: { period: string; completion: number }[];
}

export default function AdvancedAIHub() {
  const { habits, tasks, logs, experiments, protocols, addExperiment, runProtocol, completeExperiment, pauseExperiment, resumeExperiment, deleteExperiment } = useStore();
  const { user } = useAuth();
  const [activeModule, setActiveModule] = useState<'twin' | 'experiments' | 'protocols'>('twin');
  const [digitalTwin, setDigitalTwin] = useState<DigitalTwin | null>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [experimentResults, setExperimentResults] = useState<ExperimentResults | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExpName, setNewExpName] = useState('');
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpType, setNewExpType] = useState<'habits' | 'tasks'>('habits');
  const [newExpPeriod, setNewExpPeriod] = useState(7);
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    analyzeDigitalTwin();
  }, [habits, tasks, logs]);

  const analyzeDigitalTwin = () => {
    const completedLogs = logs.filter(l => l.status === 'completed');
    const hourCounts = new Map<number, number>();
    
    completedLogs.forEach(log => {
      const hour = new Date(log.completedAt).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    let bestHour = 0, maxCount = 0;
    hourCounts.forEach((count, hour) => {
      if (count > maxCount) { maxCount = count; bestHour = hour; }
    });

    const chronotype: 'morning' | 'night' | 'afternoon' = bestHour >= 5 && bestHour < 12 ? 'morning' : bestHour >= 17 && bestHour < 22 ? 'night' : 'afternoon';

    const recentMisses = logs.filter(l => l.status === 'missed').slice(-10);
    const riskTolerance = Math.max(0, 100 - recentMisses.length * 10);

    const predictions = habits.filter(h => h.status === 'pending').map(h => ({
      id: h.id,
      habitId: h.id,
      probability: Math.max(20, 100 - h.missedCount * 15),
      confidence: Math.min(90, 50 + (h.currentStreak * 5))
    }));

    setDigitalTwin({
      profile: {
        chronotype,
        decisionStyle: 'balanced',
        riskTolerance,
        motivationType: riskTolerance > 70 ? 'reward' : 'avoidance'
      },
      predictions,
      lastUpdated: new Date().toISOString()
    });
  };

  const createExperiment = async () => {
    const linkedItems = newExpType === 'habits' ? selectedHabitIds : selectedTaskIds;
    if (!newExpName || linkedItems.length === 0) return;

    addExperiment({
      name: newExpName,
      description: newExpDesc,
      type: newExpType,
      periodDays: newExpPeriod,
      linkedHabits: newExpType === 'habits' ? selectedHabitIds : [],
      linkedTasks: newExpType === 'tasks' ? selectedTaskIds : [],
      status: 'active',
    });

    if (user) {
      const itemNames = linkedItems.map(id => {
        if (newExpType === 'habits') {
          return habits.find(h => h.id === id)?.name;
        }
        return tasks.find(t => t.id === id)?.title;
      }).filter(Boolean) as string[];

      await emailService.sendExperimentNotification(user.email, user, {
        experimentName: newExpName,
        type: newExpType,
        periodDays: newExpPeriod,
        items: itemNames
      });
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000);
    }

    setNewExpName('');
    setNewExpDesc('');
    setNewExpType('habits');
    setNewExpPeriod(7);
    setSelectedHabitIds([]);
    setSelectedTaskIds([]);
    setShowCreateModal(false);
  };

  const toggleHabitSelection = (habitId: string) => {
    setSelectedHabitIds(prev =>
      prev.includes(habitId) ? prev.filter(id => id !== habitId) : [...prev, habitId]
    );
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const calculateExperimentResults = (exp: Experiment): ExperimentResults => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.endDate ? new Date(exp.endDate) : new Date();

    const linkedHabitIds = exp.linkedHabits || [];
    const linkedTaskIds = exp.linkedTasks || [];

    const expLogs = logs.filter(log => {
      const logDate = new Date(log.completedAt);
      return logDate >= startDate && logDate <= endDate && linkedHabitIds.includes(log.habitId);
    });

    const completedLogs = expLogs.filter(l => l.status === 'completed').length;
    const missedLogs = expLogs.filter(l => l.status === 'missed').length;
    const totalLogs = expLogs.length;
    const completionRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

    const streakMap = new Map<string, number>();
    expLogs.forEach(log => {
      if (log.status === 'completed') {
        streakMap.set(log.habitId, (streakMap.get(log.habitId) || 0) + 1);
      }
    });
    const avgStreak = streakMap.size > 0 ? Math.round(Array.from(streakMap.values()).reduce((a, b) => a + b, 0) / streakMap.size) : 0;

    const daysSinceStart = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const displayDays = Math.min(daysSinceStart, 30);
    const lastDays = Array.from({ length: displayDays }, (_, i) => {
      const date = subDays(new Date(), displayDays - 1 - i);
      return format(date, 'yyyy-MM-dd');
    });

    const dailyData = lastDays.map(date => {
      const dayLogs = expLogs.filter(l => l.completedAt.startsWith(date));
      const completed = dayLogs.filter(l => l.status === 'completed').length;
      const missed = dayLogs.filter(l => l.status === 'missed').length;
      const rate = dayLogs.length > 0 ? Math.round((completed / dayLogs.length) * 100) : 0;
      return {
        date: format(new Date(date), 'MMM dd'),
        completed,
        missed,
        rate
      };
    });

    const categoryMap = new Map<string, { count: number; completed: number }>();
    habits.forEach(habit => {
      if (!linkedHabitIds.includes(habit.id)) return;
      const habitLogs = expLogs.filter(l => l.habitId === habit.id);
      const completed = habitLogs.filter(l => l.status === 'completed').length;
      categoryMap.set(habit.category, {
        count: (categoryMap.get(habit.category)?.count || 0) + habitLogs.length,
        completed: (categoryMap.get(habit.category)?.completed || 0) + completed
      });
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      rate: data.count > 0 ? Math.round((data.completed / data.count) * 100) : 0
    }));

    const midpoint = Math.floor(expLogs.length / 2);
    const firstHalfLogs = expLogs.slice(0, midpoint);
    const secondHalfLogs = expLogs.slice(midpoint);
    const firstHalfRate = firstHalfLogs.length > 0 ? Math.round((firstHalfLogs.filter(l => l.status === 'completed').length / firstHalfLogs.length) * 100) : 0;
    const secondHalfRate = secondHalfLogs.length > 0 ? Math.round((secondHalfLogs.filter(l => l.status === 'completed').length / secondHalfLogs.length) * 100) : 0;

    const trend = secondHalfRate > firstHalfRate + 5 ? 'up' : secondHalfRate < firstHalfRate - 5 ? 'down' : 'stable';

    return {
      completionRate,
      totalLogs,
      completedLogs,
      missedLogs,
      avgStreak,
      trend,
      dailyData,
      categoryBreakdown,
      beforeVsAfter: [
        { period: 'Primera mitad', completion: firstHalfRate },
        { period: 'Segunda mitad', completion: secondHalfRate }
      ]
    };
  };

  const handleViewResults = (exp: Experiment) => {
    setSelectedExperiment(exp);
    setExperimentResults(calculateExperimentResults(exp));
  };

  const modules = [
    { id: 'twin', icon: Brain, label: 'Digital Twin', color: 'text-purple-400', desc: 'Tu gemelo digital' },
    { id: 'experiments', icon: FlaskConical, label: 'Experimentos', color: 'text-green-400', desc: 'Laboratorio personal' },
    { id: 'protocols', icon: BookOpen, label: 'Protocolos', color: 'text-orange-400', desc: 'Rutinas ejecutables' }
  ] as const;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {modules.map(mod => (
          <button
            key={mod.id}
            onClick={() => setActiveModule(mod.id)}
            className={`p-3 rounded-xl text-left transition-all ${
              activeModule === mod.id 
                ? 'bg-gray-700 border border-gray-500' 
                : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-700'
            }`}
          >
            <mod.icon className={`w-5 h-5 mb-1 ${mod.color}`} />
            <div className="text-sm font-medium">{mod.label}</div>
            <div className="text-xs text-gray-500">{mod.desc}</div>
          </button>
        ))}
      </div>


      {activeModule === 'twin' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Digital Twin - Tu Gemelo Digital
          </h3>

          {digitalTwin && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">Cronotipo</div>
                  <div className="text-lg font-bold text-white capitalize">{digitalTwin.profile.chronotype}</div>
                  <div className="text-xs text-gray-400">
                    {digitalTwin.profile.chronotype === 'morning' ? '🌅 Mejor mañana' : 
                     digitalTwin.profile.chronotype === 'night' ? '🌙 Mejor noche' : '⛅ Mejor tarde'}
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">Estilo de Decisión</div>
                  <div className="text-lg font-bold text-white capitalize">{digitalTwin.profile.decisionStyle}</div>
                  <div className="text-xs text-gray-400">Basado en tus elecciones</div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">Tolerancia al Riesgo</div>
                  <div className="text-lg font-bold text-white">{digitalTwin.profile.riskTolerance}%</div>
                  <div className="text-xs text-gray-400">
                    {digitalTwin.profile.riskTolerance > 70 ? '🎯 Alto riesgo, alta recompensa' : '🛡️ Conservador'}
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">Tipo de Motivación</div>
                  <div className="text-lg font-bold text-white capitalize">{digitalTwin.profile.motivationType}</div>
                  <div className="text-xs text-gray-400">
                    {digitalTwin.profile.motivationType === 'reward' ? '🏆 Impulsado por recompensas' : 
                     digitalTwin.profile.motivationType === 'avoidance' ? '⚠️ Impulsado por evitar castigos' : '👥 Impulsado socialmente'}
                  </div>
                </div>
              </div>

              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Predicciones del Gemelo
                </h4>
                <div className="space-y-2">
                  {digitalTwin.predictions.slice(0, 3).map(pred => {
                    const habit = habits.find(h => h.id === pred.habitId);
                    return (
                      <div key={pred.id} className="flex justify-between items-center">
                        <span className="text-sm">{habit?.name}</span>
                        <span className={`font-bold ${
                          pred.probability > 70 ? 'text-green-400' : 
                          pred.probability > 40 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {pred.probability}% ({pred.confidence}% confianza)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeModule === 'experiments' && (
        <div className="space-y-4">
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
              <div className="relative z-10 bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-green-400" />
                  Nuevo Experimento
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Nombre del experimento</label>
                    <input
                      value={newExpName}
                      onChange={e => setNewExpName(e.target.value)}
                      placeholder="Ej: Meditar antes de dormir"
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Descripción (opcional)</label>
                    <textarea
                      value={newExpDesc}
                      onChange={e => setNewExpDesc(e.target.value)}
                      placeholder="¿Qué hipótesis quieres probar?"
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white resize-none h-20"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Tipo de experimento</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewExpType('habits')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          newExpType === 'habits' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        Hábitos
                      </button>
                      <button
                        onClick={() => setNewExpType('tasks')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          newExpType === 'tasks' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        Tareas
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Período (días)</label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={newExpPeriod}
                      onChange={e => setNewExpPeriod(parseInt(e.target.value) || 7)}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                    />
                  </div>

                  {newExpType === 'habits' && (
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Hábitos a medir <span className="text-red-400">*</span></label>
                      <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-800/50 rounded-lg p-3">
                        {habits.length === 0 ? (
                          <p className="text-xs text-gray-500">No hay hábitos creados</p>
                        ) : (
                          habits.map(habit => (
                            <label
                              key={habit.id}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                selectedHabitIds.includes(habit.id) ? 'bg-green-900/30 border border-green-500/50' : 'hover:bg-gray-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedHabitIds.includes(habit.id)}
                                onChange={() => toggleHabitSelection(habit.id)}
                                className="accent-green-500"
                              />
                              <span className="text-sm text-white">{habit.name}</span>
                              <span className="text-xs text-gray-500 ml-auto">{habit.completionRate}%</span>
                            </label>
                          ))
                        )}
                      </div>
                      {selectedHabitIds.length > 0 && (
                        <p className="text-xs text-green-400 mt-1">{selectedHabitIds.length} hábito(s) seleccionado(s)</p>
                      )}
                    </div>
                  )}

                  {newExpType === 'tasks' && (
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Tareas a medir <span className="text-red-400">*</span></label>
                      <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-800/50 rounded-lg p-3">
                        {tasks.length === 0 ? (
                          <p className="text-xs text-gray-500">No hay tareas creadas</p>
                        ) : (
                          tasks.map(task => (
                            <label
                              key={task.id}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                selectedTaskIds.includes(task.id) ? 'bg-blue-900/30 border border-blue-500/50' : 'hover:bg-gray-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedTaskIds.includes(task.id)}
                                onChange={() => toggleTaskSelection(task.id)}
                                className="accent-blue-500"
                              />
                              <span className="text-sm text-white">{task.title}</span>
                            </label>
                          ))
                        )}
                      </div>
                      {selectedTaskIds.length > 0 && (
                        <p className="text-xs text-blue-400 mt-1">{selectedTaskIds.length} tarea(s) seleccionada(s)</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={createExperiment}
                      disabled={!newExpName || (newExpType === 'habits' ? selectedHabitIds.length === 0 : selectedTaskIds.length === 0)}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-white font-medium transition-colors"
                    >
                      Crear Experimento
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedExperiment && experimentResults ? (
            <>
              <button
                onClick={() => { setSelectedExperiment(null); setExperimentResults(null); }}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} />
                <span className="text-sm">Volver a experimentos</span>
              </button>

              <h3 className="text-lg font-bold flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-green-400" />
                Resultados: {selectedExperiment.name}
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">Tasa de Cumplimiento</div>
                  <div className={`text-2xl font-bold ${experimentResults.completionRate > 70 ? 'text-green-400' : experimentResults.completionRate > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {experimentResults.completionRate}%
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">Total Registros</div>
                  <div className="text-2xl font-bold text-blue-400">{experimentResults.totalLogs}</div>
                  <div className="text-xs text-gray-500">
                    <span className="text-green-400">{experimentResults.completedLogs} ✓</span> / <span className="text-red-400">{experimentResults.missedLogs} ✗</span>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">Racha Promedio</div>
                  <div className="text-2xl font-bold text-orange-400">{experimentResults.avgStreak}</div>
                  <div className="text-xs text-gray-500">días</div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">Tendencia</div>
                  <div className="flex items-center gap-2">
                    {experimentResults.trend === 'up' ? (
                      <TrendingUp className="text-green-400" />
                    ) : experimentResults.trend === 'down' ? (
                      <TrendingDown className="text-red-400" />
                    ) : (
                      <Activity className="text-yellow-400" />
                    )}
                    <span className={`text-lg font-bold ${
                      experimentResults.trend === 'up' ? 'text-green-400' :
                      experimentResults.trend === 'down' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {experimentResults.trend === 'up' ? 'Mejorando' : experimentResults.trend === 'down' ? 'Empeorando' : 'Estable'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedExperiment.linkedHabits.map(habitId => {
                  const habit = habits.find(h => h.id === habitId);
                  if (!habit) return null;
                  return (
                    <span key={habitId} className="text-xs px-2 py-1 rounded bg-green-900/30 text-green-400 border border-green-500/30">
                      {habit.name}
                    </span>
                  );
                })}
                {selectedExperiment.linkedTasks.map(taskId => {
                  const task = tasks.find(t => t.id === taskId);
                  if (!task) return null;
                  return (
                    <span key={taskId} className="text-xs px-2 py-1 rounded bg-blue-900/30 text-blue-400 border border-blue-500/30">
                      {task.title}
                    </span>
                  );
                })}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    Cumplimiento Diario
                  </h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={experimentResults.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
                      <YAxis stroke="#9ca3af" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                      <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="missed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    Antes vs Después
                  </h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={experimentResults.beforeVsAfter}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="period" stroke="#9ca3af" fontSize={10} />
                      <YAxis stroke="#9ca3af" fontSize={10} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                      <Bar dataKey="completion" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {experimentResults.categoryBreakdown.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-400" />
                    Desglose por Categoría
                  </h4>
                  <div className="space-y-2">
                    {experimentResults.categoryBreakdown.map(cat => (
                      <div key={cat.category} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300 capitalize">{cat.category}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                cat.rate > 70 ? 'bg-green-500' : cat.rate > 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${cat.rate}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-white w-12 text-right">{cat.rate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  Conclusión del Experimento
                </h4>
                <p className="text-sm text-gray-300">
                  {experimentResults.totalLogs === 0
                    ? `ℹ️ El experimento "${selectedExperiment.name}" aún no tiene registros. Completa los elementos vinculados para ver resultados.`
                    : experimentResults.trend === 'up'
                    ? `✅ El experimento "${selectedExperiment.name}" mostró una tendencia positiva. La tasa de cumplimiento mejoró de ${experimentResults.beforeVsAfter[0].completion}% a ${experimentResults.beforeVsAfter[1].completion}%.`
                    : experimentResults.trend === 'down'
                    ? `⚠️ El experimento "${selectedExperiment.name}" mostró una tendencia negativa. La tasa de cumplimiento bajó de ${experimentResults.beforeVsAfter[0].completion}% a ${experimentResults.beforeVsAfter[1].completion}%. Considera ajustar la variable.`
                    : `ℹ️ El experimento "${selectedExperiment.name}" se mantuvo estable con una tasa de cumplimiento del ${experimentResults.completionRate}%. No hay cambios significativos.`
                  }
                </p>
              </div>

              {selectedExperiment.status === 'active' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      completeExperiment(selectedExperiment.id);
                      setSelectedExperiment({ ...selectedExperiment, status: 'completed' });
                      setExperimentResults(calculateExperimentResults({ ...selectedExperiment, status: 'completed' }));
                    }}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    Completar Experimento
                  </button>
                  <button
                    onClick={() => {
                      pauseExperiment(selectedExperiment.id);
                      setSelectedExperiment({ ...selectedExperiment, status: 'paused' });
                    }}
                    className="py-2 px-4 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    Pausar
                  </button>
                </div>
              )}

              {selectedExperiment.status === 'paused' && (
                <button
                  onClick={() => {
                    resumeExperiment(selectedExperiment.id);
                    setSelectedExperiment({ ...selectedExperiment, status: 'active' });
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  Reanudar Experimento
                </button>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-green-400" />
                  Laboratorio de Experimentos
                </h3>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-medium transition-colors"
                >
                  <span className="text-lg">+</span> Nuevo
                </button>
              </div>

              {emailSent && (
                <div className="flex items-center gap-2 p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
                  <Mail className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">Notificación de experimento enviada por email</span>
                </div>
              )}

              <div className="space-y-3">
                {experiments.length === 0 ? (
                  <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
                    <FlaskConical className="w-16 h-16 mx-auto mb-3 opacity-30 text-green-400" />
                    <p className="text-gray-400 font-medium">No hay experimentos</p>
                    <p className="text-sm text-gray-500 mt-1">Crea un experimento para medir el impacto de cambios en tus hábitos</p>
                  </div>
                ) : (
                  experiments.map(exp => {
                    const linkedItemNames = [...exp.linkedHabits, ...exp.linkedTasks].map(id => {
                      const habit = habits.find(h => h.id === id);
                      const task = tasks.find(t => t.id === id);
                      return habit?.name || task?.title;
                    }).filter(Boolean);
                    const daysRunning = Math.floor((Date.now() - new Date(exp.startDate).getTime()) / (1000 * 60 * 60 * 24));
                    const daysRemaining = exp.endDate ? Math.max(0, Math.floor((new Date(exp.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

                    return (
                      <div key={exp.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{exp.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                exp.status === 'active' ? 'bg-green-900 text-green-400' :
                                exp.status === 'completed' ? 'bg-blue-900 text-blue-400' :
                                'bg-yellow-900 text-yellow-400'
                              }`}>
                                {exp.status === 'active' ? 'Activo' : exp.status === 'completed' ? 'Completado' : 'Pausado'}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                exp.type === 'habits' ? 'bg-green-900/50 text-green-400' : 'bg-blue-900/50 text-blue-400'
                              }`}>
                                {exp.type === 'habits' ? 'Hábitos' : 'Tareas'}
                              </span>
                            </div>
                            {exp.description && (
                              <p className="text-xs text-gray-400 mt-1">{exp.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500">{daysRemaining} días restantes</span>
                          </div>
                        </div>

                        {linkedItemNames.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {linkedItemNames.map((name, i) => (
                              <span key={i} className={`text-xs px-2 py-0.5 rounded ${
                                exp.type === 'habits' ? 'bg-green-900/20 text-green-400 border border-green-500/20' : 'bg-blue-900/20 text-blue-400 border border-blue-500/20'
                              }`}>
                                {name}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
                          <div
                            className={`h-full transition-all ${
                              exp.status === 'active' ? 'bg-green-500' :
                              exp.status === 'completed' ? 'bg-blue-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${exp.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mb-3 text-right">{exp.progress}% completado</div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewResults(exp)}
                            className="flex-1 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-green-400 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <BarChart3 size={14} />
                            Ver Resultados
                          </button>
                          {exp.status === 'active' && (
                            <>
                              <button
                                onClick={() => completeExperiment(exp.id)}
                                className="py-2 px-3 bg-blue-900/20 hover:bg-blue-900/40 border border-blue-500/30 rounded-lg text-blue-400 text-sm transition-colors"
                                title="Completar"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => pauseExperiment(exp.id)}
                                className="py-2 px-3 bg-yellow-900/20 hover:bg-yellow-900/40 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm transition-colors"
                                title="Pausar"
                              >
                                <Pause size={16} />
                              </button>
                              <button
                                onClick={() => deleteExperiment(exp.id)}
                                className="py-2 px-3 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
                                title="Eliminar"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {exp.status === 'paused' && (
                            <>
                              <button
                                onClick={() => resumeExperiment(exp.id)}
                                className="py-2 px-3 bg-green-900/20 hover:bg-green-900/40 border border-green-500/30 rounded-lg text-green-400 text-sm transition-colors"
                                title="Reanudar"
                              >
                                <Play size={16} />
                              </button>
                              <button
                                onClick={() => deleteExperiment(exp.id)}
                                className="py-2 px-3 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
                                title="Eliminar"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      )}

      {activeModule === 'protocols' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-400" />
            Protocolos Ejecutables
          </h3>

          <div className="space-y-3">
            {protocols.map(protocol => (
              <div key={protocol.id} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{protocol.name}</div>
                    <div className="text-xs text-gray-500">{protocol.steps.length} pasos • {protocol.steps.reduce((a, s) => a + s.duration, 0)} min</div>
                  </div>
                  <button
                    onClick={() => runProtocol(protocol.id)}
                    className="px-3 py-1 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm"
                  >
                    <Play className="w-4 h-4 inline" /> Iniciar
                  </button>
                </div>
                <div className="space-y-1 mt-3">
                  {protocol.steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 w-12">{step.time}</span>
                      <span className="text-white flex-1">{step.action}</span>
                      <span className="text-gray-500">{step.duration}min</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Completado: {protocol.timesCompleted} veces</span>
                  <span>Efectividad: {Math.round(protocol.effectiveness)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

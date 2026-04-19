'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import Dashboard from '@/components/Dashboard';
import HabitCard from '@/components/HabitCard';
import HabitFormModal from '@/components/HabitFormModal';
import TaskFormModal from '@/components/TaskFormModal';
import TaskColumn from '@/components/TaskCard';
import NotificationSystem from '@/components/NotificationSystem';
import TabBar from '@/components/TabBar';
import { Plus, Flame, ListTodo, Bell, Zap, Settings } from 'lucide-react';

export default function Home() {
  const { habits, tasks, settings, stats, logs, notifications, completeHabit, missHabit } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    logs.forEach(log => {
      const habit = habits.find(h => h.id === log.habitId);
      if (habit && habit.status === 'pending') {
        const scheduledTime = new Date(habit.scheduledTime);
        const now = new Date();
        const diffMinutes = (now.getTime() - scheduledTime.getTime()) / (1000 * 60);
        
        if (diffMinutes >= 10 && diffMinutes < 15) {
          if (!notifications.find(n => n.habitId === habit.id && n.level >= 3)) {
            if (settings.extremeMode) {
              completeHabit(habit.id);
            }
          }
        }
      }
    });
  }, [currentTime]);

  const pendingHabits = habits.filter(h => h.status === 'pending');
  const todaysHabits = habits.filter(h => h.frequency === 'daily' || h.frequency === 'weekly');
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const doingTasks = tasks.filter(t => t.status === 'doing');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="max-w-4xl mx-auto p-4">
        <header className="flex items-center justify-between py-4 mb-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Zap className="text-yellow-400" size={24} />
              Discipline Tracker
            </h1>
            <p className="text-xs text-gray-500">
              {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-800 rounded-xl"
          >
            <Settings size={20} className="text-gray-400" />
          </button>
        </header>

        {activeTab === 'dashboard' && <Dashboard />}

        {activeTab === 'habits' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Mis Hábitos</h2>
              <button
                onClick={() => setShowHabitModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
              >
                <Plus size={18} />
                <span className="text-sm">Nuevo</span>
              </button>
            </div>

            <div className="space-y-3">
              {pendingHabits.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Flame size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No hay hábitos pendientes</p>
                  <p className="text-sm mt-2">Crea tu primer hábito para comenzar</p>
                </div>
              ) : (
                pendingHabits.map(habit => (
                  <div key={habit.id}>
                    <HabitCard habit={habit} />
                    <NotificationSystem habit={habit} />
                  </div>
                ))
              )}
            </div>

            {habits.filter(h => h.status === 'completed').length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-400 mb-4">Completados hoy</h3>
                <div className="space-y-3">
                  {habits
                    .filter(h => h.status === 'completed')
                    .map(habit => (
                      <HabitCard key={habit.id} habit={habit} />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Tareas</h2>
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
              >
                <Plus size={18} />
                <span className="text-sm">Nueva</span>
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <TaskColumn title="Por Hacer" status="todo" tasks={tasks} />
              <TaskColumn title="En Progreso" status="doing" tasks={tasks} />
              <TaskColumn title="Completado" status="done" tasks={tasks} />
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <Dashboard />
          </div>
        )}
      </div>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <HabitFormModal isOpen={showHabitModal} onClose={() => setShowHabitModal(false)} />
      <TaskFormModal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} />

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className="relative z-10 bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Configuración</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => useStore.getState().toggleExtremeMode()}
                className={`w-full p-4 rounded-xl text-left transition-colors ${
                  settings.extremeMode ? 'bg-red-900/50 border border-red-500' : 'bg-gray-800 border border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Zap className={settings.extremeMode ? 'text-red-500' : 'text-gray-400'} />
                  <div>
                    <div className="font-medium text-white">Modo Disciplina Extrema</div>
                    <div className="text-xs text-gray-400">
                      Notificaciones más insistentes
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  if ('Notification' in window && Notification.permission !== 'granted') {
                    Notification.requestPermission();
                  }
                }}
                className="w-full p-4 rounded-xl bg-gray-800 border border-gray-700 text-left"
              >
                <div className="flex items-center gap-3">
                  <Bell className="text-gray-400" />
                  <div>
                    <div className="font-medium text-white">Notificaciones Push</div>
                    <div className="text-xs text-gray-400">
                      {Notification.permission === 'granted' ? 'Activadas' : 'Activar'}
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
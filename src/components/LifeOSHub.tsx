'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { Goal, Decision, Note, Plugin } from '@/types';
import { 
  Target, Brain, FileText, Puzzle, Code, Building2, 
  TrendingUp, CheckCircle, AlertCircle, Plus, X,
  Star, Calendar, DollarSign, BookOpen, ChevronRight,
  FlaskConical, Clock, Trophy, Lightbulb, Shield
} from 'lucide-react';

export default function LifeOSHub() {
  const { habits, tasks, logs, stats, addDisciplineScore } = useStore();
  const [activeModule, setActiveModule] = useState<'goals' | 'decisions' | 'notes' | 'plugins'>('goals');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [plugins, setPlugins] = useState<Plugin[]>([
    { id: 'gcal', name: 'Google Calendar', description: 'Sincroniza con Google Calendar', enabled: false, version: '1.0' },
    { id: 'whatsapp', name: 'WhatsApp Bot', description: 'Notificaciones por WhatsApp', enabled: false, version: '1.0' },
    { id: 'fit', name: 'Google Fit', description: 'Conectar con Google Fit', enabled: false, version: '1.0' },
    { id: 'telegram', name: 'Telegram Bot', description: 'Bot de Telegram', enabled: false, version: '1.0' }
  ]);

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setGoals([...goals, newGoal]);
  };

  const addDecision = (decision: Omit<Decision, 'id'>) => {
    const newDecision: Decision = {
      ...decision,
      id: Math.random().toString(36).substr(2, 9)
    };
    setDecisions([...decisions, newDecision]);
  };

  const addNote = (note: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote: Note = {
      ...note,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setNotes([...notes, newNote]);
  };

  const togglePlugin = (id: string) => {
    setPlugins(plugins.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const modules = [
    { id: 'goals', icon: Target, label: 'Metas', color: 'text-purple-400', desc: 'OKRs y objetivos' },
    { id: 'decisions', icon: Brain, label: 'Decisiones', color: 'text-pink-400', desc: 'Matriz y priorización' },
    { id: 'notes', icon: FileText, label: 'Notas', color: 'text-yellow-400', desc: 'Second Brain' },
    { id: 'plugins', icon: Puzzle, label: 'Plugins', color: 'text-cyan-400', desc: 'Extensiones' }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {modules.map(mod => (
          <button
            key={mod.id}
            onClick={() => setActiveModule(mod.id as any)}
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

      {activeModule === 'goals' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Metas y OKRs
            </h3>
          </div>

          <div className="space-y-2">
            {goals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay metas todavía</p>
                <p className="text-sm">Crea tu primera meta trimestral</p>
              </div>
            ) : (
              goals.map(goal => (
                <div key={goal.id} className="bg-gray-800/50 rounded-lg p-4 border-l-2 border-purple-500">
                  <div className="flex justify-between">
                    <span className="font-medium">{goal.title}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      goal.status === 'active' ? 'bg-green-900 text-green-400' :
                      goal.status === 'completed' ? 'bg-blue-900 text-blue-400' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {goal.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{goal.description}</p>
                  <div className="mt-2">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 transition-all"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{goal.progress}% completado</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
            <h4 className="font-medium mb-2">Nueva Meta</h4>
            <div className="space-y-2">
              <input
                placeholder="Título de la meta"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addGoal({
                      title: e.currentTarget.value,
                      description: '',
                      type: 'quarterly',
                      progress: 0,
                      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                      linkedHabits: [],
                      linkedTasks: [],
                      status: 'active'
                    });
                    e.currentTarget.value = '';
                  }
                }}
              />
              <p className="text-xs text-gray-500">Presiona Enter para crear</p>
            </div>
          </div>
        </div>
      )}

      {activeModule === 'decisions' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Brain className="w-5 h-5 text-pink-400" />
            Matriz de Decisiones
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-green-400">🔥 Urgente + Importante</h4>
              <p className="text-xs text-gray-500">Hacer ahora</p>
              <div className="mt-2 space-y-1">
                {tasks.filter(t => t.priority === 'urgent').map(t => (
                  <div key={t.id} className="text-sm text-white bg-gray-700 px-2 py-1 rounded">{t.title}</div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-yellow-400">⏰ Urgente + No Importante</h4>
              <p className="text-xs text-gray-500">Delegar o reprogramar</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-blue-400">📅 No Urgente + Importante</h4>
              <p className="text-xs text-gray-500">Planificar</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-gray-400">🗑️ No Urgente + No Importante</h4>
              <p className="text-xs text-gray-500">Eliminar</p>
            </div>
          </div>
        </div>
      )}

      {activeModule === 'notes' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-yellow-400" />
            Segundo Cerebro
          </h3>

          <div className="space-y-2">
            {notes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay notas todavía</p>
              </div>
            ) : (
              notes.map(note => (
                <div key={note.id} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="font-medium">{note.title}</div>
                  <p className="text-sm text-gray-400">{note.content}</p>
                </div>
              ))
            )}
          </div>

          <input
            placeholder="Nueva nota rápida..."
            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                addNote({
                  title: e.currentTarget.value.slice(0, 30),
                  content: e.currentTarget.value,
                  linkedTasks: [],
                  linkedHabits: [],
                  tags: []
                });
                e.currentTarget.value = '';
              }
            }}
          />
        </div>
      )}

      {activeModule === 'plugins' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-cyan-400" />
            Plugins y Extensiones
          </h3>

          <div className="space-y-2">
            {plugins.map(plugin => (
              <div key={plugin.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4">
                <div>
                  <div className="font-medium">{plugin.name}</div>
                  <div className="text-sm text-gray-400">{plugin.description}</div>
                  <div className="text-xs text-gray-500">v{plugin.version}</div>
                </div>
                <button
                  onClick={() => togglePlugin(plugin.id)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    plugin.enabled 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {plugin.enabled ? 'Activado' : 'Activar'}
                </button>
              </div>
            ))}
          </div>

          <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-400">API Pública disponible en /api</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
             other apps can integrate via REST API
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
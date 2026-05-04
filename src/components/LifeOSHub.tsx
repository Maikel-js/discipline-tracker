'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { Goal, Decision, Protocol, Plugin } from '@/types';
import { 
  Target, Brain, FileText, Puzzle, Code, Building2, 
  TrendingUp, CheckCircle, AlertCircle, Plus, X,
  Star, Calendar, DollarSign, BookOpen, ChevronRight,
  FlaskConical, Clock, Trophy, Lightbulb, Shield, Network
} from 'lucide-react';
import LifeGraph from './LifeGraph';

export default function LifeOSHub() {
  const { habits, tasks, logs, stats, addDisciplineScore, goals, decisions, protocols, plugins, addGoal, addDecision, togglePlugin } = useStore();
  const [activeModule, setActiveModule] = useState<'goals' | 'lifegraph' | 'decisions' | 'protocols' | 'plugins'>('goals');

  const modules = [
    { id: 'goals', icon: Target, label: 'Metas', color: 'text-purple-400', desc: 'OKRs y objetivos' },
    { id: 'lifegraph', icon: Network, label: 'Life Graph', color: 'text-indigo-400', desc: 'Visualización' },
    { id: 'decisions', icon: Brain, label: 'Decisiones', color: 'text-pink-400', desc: 'Matriz y priorización' },
    { id: 'protocols', icon: FileText, label: 'Protocolos', color: 'text-yellow-400', desc: 'Sistemas' },
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

      {activeModule === 'lifegraph' && <LifeGraph />}

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

      {activeModule === 'protocols' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-yellow-400" />
            Sistemas de Protocolos
          </h3>
          <div className="space-y-2">
            {protocols.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay protocolos todavía</p>
              </div>
            ) : (
              protocols.map(protocol => (
                <div key={protocol.id} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="font-medium text-white">{protocol.name}</div>
                  <p className="text-sm text-gray-400">{protocol.description}</p>
                  <div className="mt-2 h-1 bg-gray-700 rounded-full">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${protocol.progress}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-gray-500">Gestiona tus protocolos completos en la pestaña dedicada.</p>
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
              <div key={plugin.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {plugin.name}
                      {plugin.enabled && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                    </div>
                    <div className="text-sm text-gray-400">{plugin.description}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePlugin(plugin.id)}
                    className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                      plugin.enabled 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    {plugin.enabled ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
                
                {plugin.enabled && (
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className="flex items-center gap-2 text-[10px] text-green-400 uppercase tracking-widest font-bold">
                      <CheckCircle size={10} /> Sincronización Activa
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 italic">
                      {plugin.id === 'fit' ? 'Última lectura: 12,450 pasos detectados' : 
                       plugin.id === 'gcal' ? 'Calendario sincronizado con éxito' :
                       'Bot activo: Escuchando eventos de disciplina'}
                    </p>
                  </div>
                )}
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
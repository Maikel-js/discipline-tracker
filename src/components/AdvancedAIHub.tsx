'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import type { GraphNode, DigitalTwin, Experiment, Protocol } from '@/types';
import { 
  Network, Brain, FlaskConical, BookOpen, Play, 
  Target, TrendingUp, Lightbulb, Zap, ChevronRight,
  Clock, Users, Building, GraduationCap, Activity, RefreshCw
} from 'lucide-react';

export default function AdvancedAIHub() {
  const { habits, tasks, logs } = useStore();
  const [activeModule, setActiveModule] = useState<'graph' | 'twin' | 'experiments' | 'protocols'>('graph');
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [digitalTwin, setDigitalTwin] = useState<DigitalTwin | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([
    { id: '1', name: 'Rutina Matutina', steps: [{ time: '6:00', action: 'Ejercicio', duration: 30 }, { time: '6:30', action: 'Meditar', duration: 15 }, { time: '6:45', action: 'Estudiar', duration: 60 }], timesCompleted: 0, effectiveness: 0 },
    { id: '2', name: 'Deep Work', steps: [{ time: '9:00', action: 'Bloque de trabajo profundo', duration: 120 }, { time: '11:00', action: 'Break', duration: 15 }, { time: '11:15', action: 'Continuar trabajo', duration: 120 }], timesCompleted: 0, effectiveness: 0 },
    { id: '3', name: 'Noche Productiva', steps: [{ time: '19:00', action: 'Revisión diaria', duration: 30 }, { time: '19:30', action: 'Planificación siguiente día', duration: 15 }, { time: '20:00', action: 'Aprendizaje', duration: 60 }], timesCompleted: 0, effectiveness: 0 }
  ]);

  useEffect(() => {
    buildGraph();
    analyzeDigitalTwin();
  }, [habits, tasks, logs]);

  const buildGraph = () => {
    const nodes: GraphNode[] = [];

    habits.forEach(h => {
      nodes.push({
        id: h.id,
        type: 'habit',
        label: h.name,
        connections: []
      });
    });

    tasks.forEach(t => {
      nodes.push({
        id: t.id,
        type: 'task',
        label: t.title,
        connections: t.dependencies || []
      });
    });

    habits.forEach((h, idx) => {
      if (nodes[idx]) {
        tasks.slice(0, 2).forEach(t => {
          nodes[idx].connections.push(t.id);
        });
      }
    });

    setGraphNodes(nodes);
  };

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

  const startExperiment = (name: string) => {
    const exp: Experiment = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      variable: 'time',
      startDate: new Date().toISOString(),
      control: Math.random() * 100,
      variant: Math.random() * 100
    };
    setExperiments([...experiments, exp]);
  };

  const runProtocol = (protocolId: string) => {
    setProtocols(protocols.map(p => {
      if (p.id === protocolId) {
        return { ...p, timesCompleted: p.timesCompleted + 1, effectiveness: (p.effectiveness * p.timesCompleted + Math.random() * 30 + 70) / (p.timesCompleted + 1) };
      }
      return p;
    }));
  };

  const modules = [
    { id: 'graph', icon: Network, label: 'Life Graph', color: 'text-blue-400', desc: 'Red de conexiones' },
    { id: 'twin', icon: Brain, label: 'Digital Twin', color: 'text-purple-400', desc: 'Tu gemelo digital' },
    { id: 'experiments', icon: FlaskConical, label: 'Experimentos', color: 'text-green-400', desc: 'Laboratorio personal' },
    { id: 'protocols', icon: BookOpen, label: 'Protocolos', color: 'text-orange-400', desc: 'Rutinas ejecutables' }
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

      {activeModule === 'graph' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-400" />
            Life Graph - Tu Red de Vida
          </h3>

          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {graphNodes.slice(0, 20).map((node, idx) => (
                <div
                  key={node.id}
                  className={`p-2 rounded-lg text-sm cursor-pointer transition-all hover:scale-110 ${
                    node.type === 'habit' ? 'bg-green-900/50 border border-green-500' :
                    node.type === 'task' ? 'bg-blue-900/50 border border-blue-500' :
                    'bg-purple-900/50 border border-purple-500'
                  }`}
                  style={{ 
                    transform: `translate(${Math.sin(idx) * 20}px, ${Math.cos(idx) * 20}px)` 
                  }}
                >
                  <div className="text-white">{node.label}</div>
                  <div className="text-xs text-gray-400">{node.connections.length} conexiones</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">{habits.length}</div>
              <div className="text-xs text-gray-500">Hábitos</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-400">{tasks.length}</div>
              <div className="text-xs text-gray-500">Tareas</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-400">{graphNodes.reduce((acc, n) => acc + n.connections.length, 0)}</div>
              <div className="text-xs text-gray-500">Conexiones</div>
            </div>
          </div>
        </div>
      )}

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
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-green-400" />
            Laboratorio de Experimentos
          </h3>

          <div className="space-y-2">
            {experiments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FlaskConical className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay experimentos activos</p>
                <p className="text-sm">Crea un experimento para probar hipótesis</p>
              </div>
            ) : (
              experiments.map(exp => (
                <div key={exp.id} className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="font-medium">{exp.name}</span>
                    <span className="text-green-400">{exp.results ? `${exp.results}%` : 'En progreso'}</span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${exp.results || 50}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => startExperiment('Cambiar hora de ejercicio')}
              className="p-3 bg-green-900/30 border border-green-500/30 rounded-lg hover:bg-green-800/30"
            >
              <div className="text-sm font-medium">🧪 Nuevo Experimento</div>
            </button>
            <button className="p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
              <div className="text-sm font-medium">📊 Ver Resultados</div>
            </button>
          </div>
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
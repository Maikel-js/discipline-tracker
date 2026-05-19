'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import type { Protocol, Priority, Category, ProtocolStep } from '@/types';
import { 
  ClipboardList, Plus, Trash2, Edit2, CheckCircle, 
  Clock, Target, AlertTriangle, Tag, Link as LinkIcon,
  ChevronDown, ChevronUp, Save, X, Activity,
  RotateCcw, Loader2, Calendar, Zap, Layers, Repeat
} from 'lucide-react';

const priorityConfig: Record<Priority, { color: string; bg: string; border: string; label: string }> = {
  low: { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', label: 'Baja' },
  medium: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Media' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'Alta' },
  urgent: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Urgente' }
};

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  active: { color: 'text-green-400', bg: 'bg-green-500/10', label: 'Activo' },
  in_progress: { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'En Progreso' },
  completed: { color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Completado' },
  archived: { color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Archivado' }
};

const categoryLabels: Record<string, string> = {
  work: 'Trabajo', study: 'Estudio', health: 'Salud',
  exercise: 'Ejercicio', personal: 'Personal', other: 'Otro'
};

export default function Protocols() {
  const store = useStore();
  const protocols = store.protocols || [];
  const runProtocol = store.runProtocol;
  const updateProtocol = store.updateProtocol;
  const addProtocol = store.addProtocol;
  const deleteProtocol = store.deleteProtocol;
  const toggleProtocolStep = store.toggleProtocolStep;
  const linkHabitToProtocol = store.linkHabitToProtocol;
  const linkTaskToProtocol = store.linkTaskToProtocol;
  const unlinkHabitFromProtocol = store.unlinkHabitFromProtocol;
  const unlinkTaskFromProtocol = store.unlinkTaskFromProtocol;
  const habits = store.habits || [];
  const tasks = store.tasks || [];

  const [isHydrated, setIsHydrated] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formSection, setFormSection] = useState<'basics' | 'steps' | 'links'>('basics');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [objective, setObjective] = useState('');
  const [conditions, setConditions] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('other');
  const [status, setStatus] = useState<Protocol['status']>('active');
  const [tags, setTags] = useState('');
  const [steps, setSteps] = useState<ProtocolStep[]>([]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPurpose('');
    setObjective('');
    setConditions('');
    setPriority('medium');
    setCategory('other');
    setStatus('active');
    setTags('');
    setSteps([]);
    setEditingId(null);
    setIsCreating(false);
    setFormSection('basics');
  };

  const handleEdit = (protocol: Protocol) => {
    setName(protocol.name);
    setDescription(protocol.description || '');
    setPurpose(protocol.purpose || '');
    setObjective(protocol.objective || '');
    setConditions(protocol.conditions || '');
    setPriority(protocol.priority);
    setCategory(protocol.category);
    setStatus(protocol.status || 'active');
    setTags((protocol.tags || []).join(', '));
    setSteps(protocol.steps || []);
    setEditingId(protocol.id);
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      const protocolData = {
        name,
        description,
        purpose,
        objective,
        conditions,
        priority,
        category,
        status,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        steps: steps.map(s => ({ ...s, id: s.id || Math.random().toString(36).substr(2, 9) })),
        linkedHabits: editingId ? protocols.find(p => p.id === editingId)?.linkedHabits || [] : [],
        linkedTasks: editingId ? protocols.find(p => p.id === editingId)?.linkedTasks || [] : [],
      };
      if (editingId) {
        updateProtocol(editingId, protocolData);
      } else {
        addProtocol(protocolData);
      }
      resetForm();
    } finally {
      setIsLoading(false);
    }
  };

  const addStep = () => {
    setSteps([...steps, { id: Math.random().toString(36).substr(2, 9), time: '08:00', action: '', duration: 15, completed: false }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, updates: any) => {
    setSteps(steps.map((s, i) => i === index ? { ...s, ...updates } : s));
  };

  if (!isHydrated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-gray-400 animate-pulse">Cargando protocolos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="text-blue-400" />
          Protocolos
        </h2>
        {!isCreating && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition shadow-lg shadow-blue-500/20 font-bold"
          >
            <Plus size={18} />
            Nuevo
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">
              {editingId ? 'Editar Protocolo' : 'Crear Protocolo'}
            </h3>
            <button type="button" onClick={resetForm} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition">
              <X size={20} />
            </button>
          </div>

          <div className="flex gap-2 border-b border-gray-700 pb-3">
            {(['basics', 'steps', 'links'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFormSection(s)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  formSection === s ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {s === 'basics' ? 'Info' : s === 'steps' ? 'Pasos' : 'Vínculos'}
              </button>
            ))}
          </div>

          {formSection === 'basics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 flex items-center gap-1.5">
                    <ClipboardList size={14} /> Nombre
                  </label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del protocolo"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 flex items-center gap-1.5">
                    <Target size={14} /> Objetivo
                  </label>
                  <input value={objective} onChange={e => setObjective(e.target.value)} placeholder="¿Qué buscas lograr?"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-1.5">
                  <Zap size={14} /> Propósito
                </label>
                <textarea value={purpose} onChange={e => setPurpose(e.target.value)} rows={2}
                  placeholder="¿Por qué es necesario este protocolo?"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none resize-none transition" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-1.5">
                  <Layers size={14} /> Descripción
                </label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                  placeholder="Detalles técnicos y consideraciones..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none resize-none transition" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Prioridad</label>
                  <select value={priority} onChange={e => setPriority(e.target.value as Priority)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none">
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Categoría</label>
                  <select value={category} onChange={e => setCategory(e.target.value as Category)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none">
                    {Object.entries(categoryLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Estado</label>
                  <select value={status} onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none">
                    <option value="active">Activo</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="completed">Completado</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Tags</label>
                  <input value={tags} onChange={e => setTags(e.target.value)} placeholder="foco, mañana, pc"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Condiciones
                </label>
                <input value={conditions} onChange={e => setConditions(e.target.value)} placeholder="Ej: Solo si hay silencio absoluto"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none" />
              </div>
            </div>
          )}

          {formSection === 'steps' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-400 font-semibold">Pasos del Protocolo</label>
                <button type="button" onClick={addStep}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                  <Plus size={14} /> Añadir
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-2 items-center bg-gray-900 p-3 rounded-xl border border-gray-800 hover:border-gray-600 transition">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock size={14} />
                      <input type="time" value={step.time}
                        onChange={e => updateStep(index, { time: e.target.value })}
                        className="bg-transparent text-white text-sm outline-none w-20" />
                    </div>
                    <input placeholder="Acción..." value={step.action}
                      onChange={e => updateStep(index, { action: e.target.value })}
                      className="bg-transparent text-white text-sm outline-none flex-1 min-w-0" />
                    <div className="flex items-center gap-1 text-gray-500 shrink-0">
                      <input type="number" value={step.duration}
                        onChange={e => updateStep(index, { duration: parseInt(e.target.value) || 0 })}
                        className="bg-transparent text-white text-sm outline-none w-14 text-right" />
                      <span className="text-xs">min</span>
                    </div>
                    <button type="button" onClick={() => removeStep(index)}
                      className="p-1.5 hover:bg-red-900/30 rounded-lg text-red-400 hover:text-red-300 transition shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {steps.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Agrega pasos para este protocolo</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {formSection === 'links' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-1.5">
                  <LinkIcon size={14} /> Hábitos Vinculados
                </label>
                <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto p-2 bg-gray-900 rounded-xl border border-gray-700">
                  {habits.map(h => (
                    <button key={h.id} type="button" onClick={() => {
                      if (editingId) {
                        if ((protocols.find(p => p.id === editingId)?.linkedHabits || []).includes(h.id))
                          unlinkHabitFromProtocol(editingId, h.id);
                        else linkHabitToProtocol(editingId, h.id);
                      }
                    }}
                      className={`text-xs px-2 py-1 rounded-lg transition ${
                        editingId && (protocols.find(p => p.id === editingId)?.linkedHabits || []).includes(h.id)
                          ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}>
                      {h.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-1.5">
                  <LinkIcon size={14} /> Tareas Vinculadas
                </label>
                <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto p-2 bg-gray-900 rounded-xl border border-gray-700">
                  {tasks.map(t => (
                    <button key={t.id} type="button" onClick={() => {
                      if (editingId) {
                        if ((protocols.find(p => p.id === editingId)?.linkedTasks || []).includes(t.id))
                          unlinkTaskFromProtocol(editingId, t.id);
                        else linkTaskToProtocol(editingId, t.id);
                      }
                    }}
                      className={`text-xs px-2 py-1 rounded-lg transition ${
                        editingId && (protocols.find(p => p.id === editingId)?.linkedTasks || []).includes(t.id)
                          ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}>
                      {t.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button type="button" disabled={isLoading} onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10">
            {isLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            {editingId ? 'Actualizar Protocolo' : 'Publicar Protocolo'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {protocols.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-dashed border-gray-700">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No hay protocolos.</p>
            <p className="text-sm text-gray-500 mt-1">Crea tu primer protocolo</p>
          </div>
        ) : (
          protocols.map(protocol => {
            const prio = priorityConfig[protocol.priority];
            const sts = statusConfig[protocol.status] || statusConfig.active;
            const stepCount = protocol.steps?.length || 0;
            const completedSteps = protocol.steps?.filter(s => s.completed).length || 0;
            const linkedHabitsCount = protocol.linkedHabits?.length || 0;
            const linkedTasksCount = protocol.linkedTasks?.length || 0;

            return (
              <div key={protocol.id} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden hover:border-gray-600 transition">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="text-lg font-bold text-white">{protocol.name}</h3>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${prio.bg} ${prio.color} border ${prio.border}`}>
                          {prio.label}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${sts.bg} ${sts.color}`}>
                          {sts.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1"><Layers size={12} /> {categoryLabels[protocol.category] || protocol.category}</span>
                        <span className="flex items-center gap-1"><Calendar size={12} /> Creado {new Date(protocol.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Repeat size={12} /> {protocol.timesCompleted} ejecuciones</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button type="button" onClick={() => handleEdit(protocol)}
                        className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition">
                        <Edit2 size={15} />
                      </button>
                      <button type="button" onClick={() => deleteProtocol(protocol.id)}
                        className="p-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {protocol.objective && (
                    <p className="text-sm text-blue-400 flex items-center gap-1.5 mb-3">
                      <Target size={14} className="shrink-0" />
                      <span>{protocol.objective}</span>
                    </p>
                  )}

                  {protocol.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{protocol.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700/50">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Progreso</div>
                      <div className="text-lg font-bold text-blue-400">{protocol.progress}%</div>
                      <div className="h-1 bg-gray-700 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${protocol.progress}%` }} />
                      </div>
                    </div>
                    <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700/50">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Efectividad</div>
                      <div className="text-lg font-bold text-green-400">{protocol.effectiveness.toFixed(0)}%</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700/50">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Pasos</div>
                      <div className="text-lg font-bold text-purple-400">{completedSteps}/{stepCount}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700/50">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Vínculos</div>
                      <div className="text-lg font-bold text-orange-400">{linkedHabitsCount + linkedTasksCount}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(protocol.tags || []).map(tag => (
                      <span key={tag} className="text-[10px] bg-gray-900 text-gray-500 px-2 py-1 rounded-md flex items-center gap-1 border border-gray-700">
                        <Tag size={10} /> {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={() => runProtocol(protocol.id)}
                      className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-green-600/20">
                      <RotateCcw size={15} />
                      Ejecutar
                    </button>
                    <button type="button"
                      onClick={() => setExpandedId(expandedId === protocol.id ? null : protocol.id)}
                      className={`px-4 py-2.5 rounded-xl transition flex items-center gap-1 text-sm ${
                        expandedId === protocol.id ? 'bg-gray-700 text-white' : 'bg-gray-700/50 text-gray-400 hover:text-white'
                      }`}>
                      {expandedId === protocol.id ? <>Ocultar <ChevronUp size={15} /></> : <>Detalles <ChevronDown size={15} /></>}
                    </button>
                  </div>
                </div>

                {expandedId === protocol.id && (
                  <div className="px-5 pb-5 bg-gray-900/30 space-y-5 border-t border-gray-700/50 pt-4">
                    {protocol.conditions && (
                      <div className="bg-yellow-900/10 border border-yellow-700/20 rounded-xl p-3">
                        <h4 className="text-xs font-bold text-yellow-500 flex items-center gap-1 mb-1">
                          <AlertTriangle size={12} /> CONDICIONES
                        </h4>
                        <p className="text-xs text-yellow-200/70">{protocol.conditions}</p>
                      </div>
                    )}

                    {protocol.steps && protocol.steps.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <Clock size={12} /> Línea de Tiempo
                        </h4>
                        <div className="space-y-2">
                          {protocol.steps.map((step, idx) => (
                            <div key={idx} className="relative pl-8">
                              <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gray-700" />
                              <div className={`absolute left-1.5 top-3 w-3 h-3 rounded-full border-2 ${
                                step.completed ? 'bg-green-500 border-green-500' : 'bg-gray-800 border-gray-600'
                              }`} />
                              <div
                                onClick={() => toggleProtocolStep(protocol.id, idx)}
                                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                                  step.completed
                                    ? 'bg-green-900/5 border-green-500/20'
                                    : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="text-xs text-gray-500 font-mono shrink-0">{step.time}</div>
                                  <span className={`text-sm truncate ${step.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                                    {step.action}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] text-gray-500">{step.duration} min</span>
                                  {step.completed && <CheckCircle size={14} className="text-green-500" />}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                          <LinkIcon size={12} /> Hábitos ({linkedHabitsCount})
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {habits.map(h => {
                            const isLinked = (protocol.linkedHabits || []).includes(h.id);
                            return (
                              <button key={h.id} type="button"
                                onClick={() => isLinked ? unlinkHabitFromProtocol(protocol.id, h.id) : linkHabitToProtocol(protocol.id, h.id)}
                                className={`text-[10px] px-2 py-1 rounded-lg transition ${
                                  isLinked ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                                }`}>
                                {h.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                          <LinkIcon size={12} /> Tareas ({linkedTasksCount})
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {tasks.map(t => {
                            const isLinked = (protocol.linkedTasks || []).includes(t.id);
                            return (
                              <button key={t.id} type="button"
                                onClick={() => isLinked ? unlinkTaskFromProtocol(protocol.id, t.id) : linkTaskToProtocol(protocol.id, t.id)}
                                className={`text-[10px] px-2 py-1 rounded-lg transition ${
                                  isLinked ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                                }`}>
                                {t.title}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

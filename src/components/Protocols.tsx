'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import type { Protocol, Priority, Category, ProtocolStep } from '@/types';
import { 
  ClipboardList, Plus, Trash2, Edit2, CheckCircle, 
  Clock, Target, AlertTriangle, Tag, Link as LinkIcon,
  ChevronDown, ChevronUp, Save, X, BookOpen, Activity,
  Archive, RotateCcw, Loader2
} from 'lucide-react';

export default function Protocols() {
  const {
    protocols, runProtocol, updateProtocol, addProtocol, deleteProtocol,
    toggleProtocolStep, linkHabitToProtocol, linkTaskToProtocol,
    unlinkHabitFromProtocol, unlinkTaskFromProtocol, habits, tasks
  } = useStore();

  const [isHydrated, setIsHydrated] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
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
  };

  const handleEdit = (protocol: Protocol) => {
    setName(protocol.name);
    setDescription(protocol.description || '');
    setPurpose(protocol.purpose || '');
    setObjective(protocol.objective || '');
    setConditions(protocol.conditions || '');
    setPriority(protocol.priority);
    setCategory(protocol.category);
    setStatus(protocol.status);
    setTags(protocol.tags.join(', '));
    setSteps(protocol.steps);
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
        <p className="text-gray-400 animate-pulse">Sincronizando protocolos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="text-blue-400" />
          Módulo de Protocolos
        </h2>
        {!isCreating && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition shadow-lg shadow-blue-500/20 font-bold"
          >
            <Plus size={18} />
            Crear Protocolo
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">
              {editingId ? 'Editar Protocolo' : 'Crear Nuevo Protocolo'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Nombre del Protocolo</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Rutina de Enfoque Profundo"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Objetivo Claro</label>
              <input
                value={objective}
                onChange={e => setObjective(e.target.value)}
                placeholder="¿Qué buscas lograr?"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Propósito (Por qué)</label>
            <textarea
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              placeholder="¿Por qué es necesario este protocolo? ¿Qué problema resuelve?"
              rows={2}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none resize-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Descripción Técnica (Cómo)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalles específicos y consideraciones técnicas..."
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none resize-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Prioridad</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Categoría</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none"
              >
                <option value="work">Trabajo</option>
                <option value="study">Estudio</option>
                <option value="health">Salud</option>
                <option value="exercise">Ejercicio</option>
                <option value="personal">Personal</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Estado</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none"
              >
                <option value="active">Activo</option>
                <option value="in_progress">En Progreso</option>
                <option value="completed">Completado</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Tags (coma)</label>
              <input
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="foco, mañana, pc"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Condiciones de Ejecución</label>
            <input
              value={conditions}
              onChange={e => setConditions(e.target.value)}
              placeholder="Ej: Solo si hay silencio absoluto"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-400 font-semibold">Pasos del Protocolo</label>
              <button
                onClick={addStep}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
              >
                <Plus size={14} /> Añadir Paso
              </button>
            </div>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2 items-center bg-gray-900 p-3 rounded-xl border border-gray-800">
                  <input
                    type="time"
                    value={step.time}
                    onChange={e => updateStep(index, { time: e.target.value })}
                    className="bg-transparent text-white text-sm outline-none w-20"
                  />
                  <input
                    placeholder="Acción..."
                    value={step.action}
                    onChange={e => updateStep(index, { action: e.target.value })}
                    className="bg-transparent text-white text-sm outline-none flex-1"
                  />
                  <input
                    type="number"
                    value={step.duration}
                    onChange={e => updateStep(index, { duration: parseInt(e.target.value) || 0 })}
                    className="bg-transparent text-white text-sm outline-none w-16"
                  />
                  <span className="text-gray-500 text-xs">min</span>
                  <button onClick={() => removeStep(index)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            {editingId ? 'Actualizar Protocolo Maestro' : 'Publicar Nuevo Protocolo'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {protocols.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-dashed border-gray-700">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No hay protocolos configurados.</p>
          </div>
        ) : (
          protocols.map(protocol => (
            <div key={protocol.id} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-xl font-bold text-white">{protocol.name}</h3>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        protocol.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        protocol.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {protocol.priority}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                        {protocol.category}
                      </span>
                    </div>
                    {protocol.objective && (
                      <p className="text-sm text-blue-400 flex items-center gap-1">
                        <Target size={14} /> {protocol.objective}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(protocol)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteProtocol(protocol.id)}
                      className="p-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                  {protocol.description}
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <CheckCircle size={14} /> {protocol.progress}% Completado
                    </span>
                    <button
                      type="button"
                      onClick={() => runProtocol(protocol.id)}
                      className="text-xs font-bold bg-green-600/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full hover:bg-green-600/40 transition flex items-center gap-1"
                    >
                      <RotateCcw size={12} /> Reiniciar Ciclo
                    </button>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${protocol.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {protocol.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-gray-900 text-gray-500 px-2 py-1 rounded-md flex items-center gap-1">
                      <Tag size={10} /> {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setExpandedId(expandedId === protocol.id ? null : protocol.id)}
                  className="w-full mt-4 py-2 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-white transition border-t border-gray-700/50 pt-4"
                >
                  {expandedId === protocol.id ? (
                    <>Ver Menos <ChevronUp size={14} /></>
                  ) : (
                    <>Detalles del Sistema <ChevronDown size={14} /></>
                  )}
                </button>
              </div>

              {expandedId === protocol.id && (
                <div className="px-5 pb-5 bg-gray-900/30 space-y-5 animate-in slide-in-from-top duration-300">
                  {protocol.conditions && (
                    <div className="bg-yellow-900/10 border border-yellow-700/20 p-3 rounded-xl">
                      <h4 className="text-xs font-bold text-yellow-500 flex items-center gap-1 mb-1">
                        <AlertTriangle size={12} /> CONDICIONES DE EJECUCIÓN
                      </h4>
                      <p className="text-xs text-yellow-200/70">{protocol.conditions}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pasos de Acción</h4>
                    <div className="space-y-2">
                      {protocol.steps.map((step, idx) => (
                        <div 
                          key={idx}
                          onClick={() => toggleProtocolStep(protocol.id, idx)}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${
                            step.completed 
                              ? 'bg-green-900/10 border-green-500/20 opacity-60' 
                              : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            step.completed ? 'bg-green-600 border-green-500' : 'bg-gray-900 border-gray-700'
                          }`}>
                            {step.completed && <CheckCircle size={14} className="text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${step.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                              {step.action}
                            </div>
                            <div className="text-[10px] text-gray-500 flex items-center gap-1">
                              <Clock size={10} /> {step.time} • {step.duration} min
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <LinkIcon size={12} /> Hábitos Vinculados
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {habits.map(h => (
                          <button
                            key={h.id}
                            onClick={() => {
                              if (protocol.linkedHabits.includes(h.id)) unlinkHabitFromProtocol(protocol.id, h.id);
                              else linkHabitToProtocol(protocol.id, h.id);
                            }}
                            className={`text-[10px] px-2 py-1 rounded-md transition ${
                              protocol.linkedHabits.includes(h.id)
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                            }`}
                          >
                            {h.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <LinkIcon size={12} /> Tareas Vinculadas
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {tasks.map(t => (
                          <button
                            key={t.id}
                            onClick={() => {
                              if (protocol.linkedTasks.includes(t.id)) unlinkTaskFromProtocol(protocol.id, t.id);
                              else linkTaskToProtocol(protocol.id, t.id);
                            }}
                            className={`text-[10px] px-2 py-1 rounded-md transition ${
                              protocol.linkedTasks.includes(t.id)
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                            }`}
                          >
                            {t.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { Goal } from '@/types';
import { Target, Plus, X, Edit2, Trash2, Calendar, Link, BarChart3 } from 'lucide-react';

const typeLabels: Record<string, string> = {
  quarterly: 'Trimestral', monthly: 'Mensual', yearly: 'Anual', okr: 'OKR'
};

const typeIcons: Record<string, string> = {
  quarterly: '📅', monthly: '📆', yearly: '📋', okr: '🎯'
};

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, recalculateGoalProgress, habits, tasks } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Goal['type']>('quarterly');
  const [dueDate, setDueDate] = useState('');
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('quarterly');
    setDueDate('');
    setSelectedHabits([]);
    setSelectedTasks([]);
    setEditingId(null);
    setErrors({});
    setShowForm(false);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'El título es obligatorio';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingId) {
      updateGoal(editingId, { title, description, type, dueDate, linkedHabits: selectedHabits, linkedTasks: selectedTasks });
    } else {
      addGoal({
        title, description, type, progress: 0, dueDate,
        linkedHabits: selectedHabits, linkedTasks: selectedTasks, status: 'active'
      });
    }
    resetForm();
  };

  const handleEdit = (goal: Goal) => {
    setTitle(goal.title);
    setDescription(goal.description);
    setType(goal.type);
    setDueDate(goal.dueDate);
    setSelectedHabits(goal.linkedHabits);
    setSelectedTasks(goal.linkedTasks);
    setEditingId(goal.id);
    setShowForm(true);
  };

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(id => id !== item) : [...arr, item];

  const statusConfig: Record<string, { color: string; bg: string }> = {
    active: { color: 'text-green-400', bg: 'bg-green-500/10' },
    completed: { color: 'text-blue-400', bg: 'bg-blue-500/10' },
    paused: { color: 'text-yellow-400', bg: 'bg-yellow-500/10' }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Target className="text-purple-400" />
          Metas
        </h2>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition shadow-lg shadow-purple-500/20 font-bold">
          <Plus size={18} /> Nueva
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative z-10 bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <Target className="text-purple-400" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{editingId ? 'Editar Meta' : 'Nueva Meta'}</h2>
                  <p className="text-xs text-gray-500">{editingId ? 'Actualiza los datos de la meta' : 'Define una nueva meta'}</p>
                </div>
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-1.5">
                  <Target size={14} /> Título
                </label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Ej: Mejorar condición física"
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:outline-none transition ${
                    errors.title ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-purple-500'
                  }`} />
                {errors.title && <p className="text-xs text-red-400">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Descripción</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="¿Qué quieres lograr?"
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:outline-none resize-none transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 flex items-center gap-1.5">
                    <BarChart3 size={14} /> Tipo
                  </label>
                  <select value={type} onChange={e => setType(e.target.value as Goal['type'])}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:outline-none transition">
                    {Object.entries(typeLabels).map(([k, v]) => (
                      <option key={k} value={k}>{typeIcons[k]} {v}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 flex items-center gap-1.5">
                    <Calendar size={14} /> Fecha límite
                  </label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-purple-500 focus:outline-none transition" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 flex items-center gap-1.5">
                    <Link size={14} /> Hábitos ({selectedHabits.length})
                  </label>
                  <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-gray-800 rounded-xl border border-gray-700">
                    {habits.map(habit => (
                      <label key={habit.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-700/50 cursor-pointer">
                        <input type="checkbox" checked={selectedHabits.includes(habit.id)}
                          onChange={() => setSelectedHabits(toggleArrayItem(selectedHabits, habit.id))}
                          className="w-4 h-4 accent-purple-500 rounded" />
                        <span className="text-sm text-gray-300">{habit.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 flex items-center gap-1.5">
                    <Link size={14} /> Tareas ({selectedTasks.length})
                  </label>
                  <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-gray-800 rounded-xl border border-gray-700">
                    {tasks.map(task => (
                      <label key={task.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-700/50 cursor-pointer">
                        <input type="checkbox" checked={selectedTasks.includes(task.id)}
                          onChange={() => setSelectedTasks(toggleArrayItem(selectedTasks, task.id))}
                          className="w-4 h-4 accent-orange-500 rounded" />
                        <span className="text-sm text-gray-300">{task.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2">
                <Target size={18} />
                {editingId ? 'Actualizar Meta' : 'Crear Meta'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map(goal => {
          const sts = statusConfig[goal.status] || statusConfig.active;
          const linkedHabitsData = habits.filter(h => goal.linkedHabits.includes(h.id));
          const linkedTasksData = tasks.filter(t => goal.linkedTasks.includes(t.id));

          return (
            <div key={goal.id} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden hover:border-gray-600 transition group">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{typeIcons[goal.type]}</span>
                      <h3 className="text-lg font-bold text-white truncate">{goal.title}</h3>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${sts.bg} ${sts.color}`}>
                        {goal.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{typeLabels[goal.type]}</span>
                      {goal.dueDate && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />{new Date(goal.dueDate).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => handleEdit(goal)}
                      className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => deleteGoal(goal.id)}
                      className="p-1.5 bg-red-900/30 hover:bg-red-900/50 rounded-lg text-red-400 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{goal.description}</p>
                )}

                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progreso</span>
                    <span className="font-bold text-purple-400">{goal.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>

                {(linkedHabitsData.length > 0 || linkedTasksData.length > 0) && (
                  <div className="flex flex-wrap gap-1">
                    {linkedHabitsData.map(h => (
                      <span key={h.id} className="text-[10px] bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-md border border-purple-500/30">
                        {h.name}
                      </span>
                    ))}
                    {linkedTasksData.map(t => (
                      <span key={t.id} className="text-[10px] bg-orange-600/20 text-orange-400 px-2 py-0.5 rounded-md border border-orange-500/30">
                        {t.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-800/50 rounded-2xl border border-dashed border-gray-700">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No hay metas creadas</p>
            <p className="text-sm text-gray-500 mt-1">Crea tu primera meta</p>
          </div>
        )}
      </div>
    </div>
  );
}

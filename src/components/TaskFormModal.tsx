'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { X, Plus, Trash2, ListTodo, AlertTriangle, Calendar, Link, CheckSquare } from 'lucide-react';
import type { Priority, TaskStatus, Subtask, Task } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
}

const priorityLabels: Record<Priority, string> = { low: 'Baja', medium: 'Media', high: 'Alta', urgent: 'Urgente' };
const statusLabels: Record<TaskStatus, string> = { todo: 'Por Hacer', doing: 'En Progreso', done: 'Completado' };

export default function TaskFormModal({ isOpen, onClose, task }: Props) {
  const { addTask, updateTask, tasks } = useStore();
  const isEditing = !!task;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    dueDate: '',
    status: 'todo' as TaskStatus,
    allowReset: false,
    subtasks: [] as Subtask[],
    dependencies: [] as string[],
    reminders: [] as string[],
    prerequisites: [] as string[]
  });
  const [newSubtask, setNewSubtask] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<'details' | 'subtasks' | 'links'>('details');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        dueDate: task.dueDate || '',
        status: task.status,
        allowReset: task.allowReset,
        subtasks: task.subtasks,
        dependencies: task.dependencies,
        reminders: task.reminders,
        prerequisites: task.prerequisites
      });
    } else {
      setFormData({
        title: '', description: '', priority: 'medium', dueDate: '', status: 'todo',
        allowReset: false, subtasks: [], dependencies: [], reminders: [], prerequisites: []
      });
    }
    setErrors({});
    setActiveSection('details');
  }, [task, isOpen]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) errs.title = 'El título es obligatorio';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setFormData({
      ...formData,
      subtasks: [...formData.subtasks, { id: generateId(), title: newSubtask, completed: false }]
    });
    setNewSubtask('');
  };

  const handleRemoveSubtask = (id: string) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.filter(s => s.id !== id)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing) {
      updateTask(task.id, formData);
    } else {
      addTask(formData);
    }

    setFormData({
      title: '', description: '', priority: 'medium', dueDate: '', status: 'todo',
      allowReset: false, subtasks: [], dependencies: [], reminders: [], prerequisites: []
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-5 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <ListTodo className="text-orange-400" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{isEditing ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
              <p className="text-xs text-gray-500">{isEditing ? 'Modifica los detalles de la tarea' : 'Define una nueva tarea'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-1 px-5 pt-4 pb-2 border-b border-gray-700/50">
          {(['details', 'subtasks', 'links'] as const).map(s => (
            <button key={s} onClick={() => setActiveSection(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeSection === s ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}>
              {s === 'details' ? 'Detalles' : s === 'subtasks' ? 'Subtareas' : 'Vínculos'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {activeSection === 'details' && (
            <>
              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-1.5">
                  <ListTodo size={14} /> Título
                </label>
                <input type="text" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Terminar informe"
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:outline-none transition ${
                    errors.title ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-blue-500'
                  }`}
                  required
                />
                {errors.title && <p className="text-xs text-red-400">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Descripción</label>
                <textarea value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles de la tarea..."
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none resize-none transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Prioridad
                  </label>
                  <select value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition">
                    {Object.entries(priorityLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 flex items-center gap-1.5">
                    <Calendar size={14} /> Fecha límite
                  </label>
                  <input type="datetime-local" value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-1.5">
                  <ListTodo size={14} /> Estado
                </label>
                <select value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition">
                  {Object.entries(statusLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl border border-gray-700 cursor-pointer hover:bg-gray-700/50 transition">
                <input type="checkbox" checked={formData.allowReset}
                  onChange={(e) => setFormData({ ...formData, allowReset: e.target.checked })}
                  className="w-4 h-4 accent-blue-500 rounded" />
                <div>
                  <span className="text-sm text-gray-300 font-medium">Permitir reinicio</span>
                  <p className="text-xs text-gray-500">La tarea se reiniciará al completarse</p>
                </div>
              </label>
            </>
          )}

          {activeSection === 'subtasks' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input type="text" value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                  className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition"
                  placeholder="Agregar subtarea..."
                />
                <button type="button" onClick={handleAddSubtask}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition flex items-center gap-1">
                  <Plus size={16} />
                </button>
              </div>
              {formData.subtasks.length > 0 ? (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {formData.subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center justify-between px-3 py-2.5 bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition group">
                      <div className="flex items-center gap-2">
                        <CheckSquare size={14} className="text-gray-500" />
                        <span className="text-sm text-gray-300">{subtask.title}</span>
                      </div>
                      <button type="button" onClick={() => handleRemoveSubtask(subtask.id)}
                        className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Agrega subtareas para desglosar el trabajo</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'links' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400 flex items-center gap-1.5">
                  <Link size={14} /> Dependencias
                </label>
                <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-gray-800 rounded-xl border border-gray-700">
                  {tasks.filter(t => t.id !== task?.id).map(t => (
                    <label key={t.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-700/50 cursor-pointer">
                      <input type="checkbox" checked={formData.dependencies.includes(t.id)}
                        onChange={(e) => setFormData({
                          ...formData,
                          dependencies: e.target.checked
                            ? [...formData.dependencies, t.id]
                            : formData.dependencies.filter(id => id !== t.id)
                        })}
                        className="w-4 h-4 accent-orange-500 rounded" />
                      <span className="text-sm text-gray-300">{t.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2">
            <ListTodo size={18} />
            {isEditing ? 'Guardar Cambios' : 'Crear Tarea'}
          </button>
        </form>
      </div>
    </div>
  );
}

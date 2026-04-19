'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Priority, TaskStatus, Subtask } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskFormModal({ isOpen, onClose }: Props) {
  const { addTask, tasks } = useStore();
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

  const generateId = () => Math.random().toString(36).substr(2, 9);

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
    if (!formData.title.trim()) return;
    addTask(formData);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      status: 'todo',
      allowReset: false,
      subtasks: [],
      dependencies: [],
      reminders: [],
      prerequisites: []
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Nueva Tarea</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="Ej: Terminar informe"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Descripción (opcional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none h-20"
              placeholder="Detalles de la tarea..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Prioridad</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fecha límite</label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="Agregar subtarea..."
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white"
              >
                <Plus size={18} />
              </button>
            </div>
            {formData.subtasks.length > 0 && (
              <div className="space-y-1">
                {formData.subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-300">{subtask.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(subtask.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Dependencias (otras tareas)</label>
            <select
              multiple
              value={formData.dependencies}
              onChange={(e) => setFormData({ ...formData, dependencies: Array.from(e.target.selectedOptions, o => o.value) })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              {tasks
                .filter(t => t.id !== formData.dependencies[0])
                .map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allowReset"
              checked={formData.allowReset}
              onChange={(e) => setFormData({ ...formData, allowReset: e.target.checked })}
              className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="allowReset" className="text-sm text-gray-300">
              Permitir reiniciar al completar
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
          >
            Crear Tarea
          </button>
        </form>
      </div>
    </div>
  );
}
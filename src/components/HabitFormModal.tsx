'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { X, Flame, Clock, Calendar, AlertTriangle, Target, Tag } from 'lucide-react';
import type { HabitFrequency, Priority, Category, HabitStatus } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const freqLabels: Record<HabitFrequency, string> = { daily: 'Diaria', weekly: 'Semanal', monthly: 'Mensual' };
const priorityLabels: Record<Priority, string> = { low: 'Baja', medium: 'Media', high: 'Alta', urgent: 'Urgente' };
const categoryLabels: Record<Category, string> = {
  health: 'Salud', study: 'Estudio', exercise: 'Ejercicio',
  work: 'Trabajo', personal: 'Personal', other: 'Otro'
};

export default function HabitFormModal({ isOpen, onClose }: Props) {
  const { addHabit, habits } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scheduledTime: '08:00',
    frequency: 'daily' as HabitFrequency,
    priority: 'medium' as Priority,
    streakGoal: 7,
    category: 'personal' as Category,
    status: 'pending' as HabitStatus,
    prerequisites: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'El nombre es obligatorio';
    if (!formData.scheduledTime) errs.scheduledTime = 'Selecciona una hora';
    if (formData.streakGoal < 1) errs.streakGoal = 'Mínimo 1 día';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    addHabit(formData);
    setFormData({
      name: '', description: '', scheduledTime: '08:00', frequency: 'daily',
      priority: 'medium', streakGoal: 7, category: 'personal', status: 'pending', prerequisites: []
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
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Flame className="text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Nuevo Hábito</h2>
              <p className="text-xs text-gray-500">Define un nuevo hábito para trackear</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-1.5">
              <Flame size={14} /> Nombre del hábito
            </label>
            <input type="text" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Meditar 10 minutos"
              className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:outline-none transition ${
                errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-blue-500'
              }`}
              required
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-1.5">
              <Tag size={14} /> Descripción (opcional)
            </label>
            <textarea value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe en qué consiste este hábito..."
              rows={2}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none resize-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400 flex items-center gap-1.5">
                <Clock size={14} /> Hora
              </label>
              <input type="time" value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400 flex items-center gap-1.5">
                <Calendar size={14} /> Frecuencia
              </label>
              <select value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as HabitFrequency })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition">
                {Object.entries(freqLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
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
                <Target size={14} /> Categoría
              </label>
              <select value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition">
                {Object.entries(categoryLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-1.5">
              <Flame size={14} /> Meta de racha (días)
            </label>
            <input type="number" min="1" max="365" value={formData.streakGoal}
              onChange={(e) => setFormData({ ...formData, streakGoal: parseInt(e.target.value) || 7 })}
              className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:outline-none transition ${
                errors.streakGoal ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
              }`} />
            {errors.streakGoal && <p className="text-xs text-red-400">{errors.streakGoal}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Prerrequisitos</label>
            <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-gray-800 rounded-xl border border-gray-700">
              {habits.map(h => (
                <label key={h.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-700/50 cursor-pointer">
                  <input type="checkbox" checked={formData.prerequisites.includes(h.id)}
                    onChange={(e) => setFormData({
                      ...formData,
                      prerequisites: e.target.checked
                        ? [...formData.prerequisites, h.id]
                        : formData.prerequisites.filter(id => id !== h.id)
                    })}
                    className="w-4 h-4 accent-blue-500 rounded" />
                  <span className="text-sm text-gray-300">{h.name}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
            <Flame size={18} />
            Crear Hábito
          </button>
        </form>
      </div>
    </div>
  );
}

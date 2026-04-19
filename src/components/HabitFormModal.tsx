'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { X } from 'lucide-react';
import type { HabitFrequency, Priority, Category, HabitStatus } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function HabitFormModal({ isOpen, onClose }: Props) {
  const { addHabit, habits } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    scheduledTime: '08:00',
    frequency: 'daily' as HabitFrequency,
    priority: 'medium' as Priority,
    streakGoal: 7,
    category: 'personal' as Category,
    status: 'pending' as HabitStatus,
    prerequisites: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    addHabit(formData);
    setFormData({
      name: '',
      scheduledTime: '08:00',
      frequency: 'daily',
      priority: 'medium',
      streakGoal: 7,
      category: 'personal',
      status: 'pending',
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
          <h2 className="text-xl font-bold text-white">Nuevo Hábito</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre del hábito</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="Ej: Meditar 10 minutos"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Hora programada</label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Frecuencia</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as HabitFrequency })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="daily">Diaria</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>
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
              <label className="block text-sm text-gray-400 mb-1">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="health">Salud</option>
                <option value="study">Estudio</option>
                <option value="exercise">Ejercicio</option>
                <option value="work">Trabajo</option>
                <option value="personal">Personal</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Meta de rachas (días)</label>
            <input
              type="number"
              min="1"
              max="365"
              value={formData.streakGoal}
              onChange={(e) => setFormData({ ...formData, streakGoal: parseInt(e.target.value) || 7 })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Prerrequisitos (hábitos que deben completarse primero)</label>
            <select
              multiple
              value={formData.prerequisites}
              onChange={(e) => setFormData({ ...formData, prerequisites: Array.from(e.target.selectedOptions, o => o.value) })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              {habits.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
          >
            Crear Hábito
          </button>
        </form>
      </div>
    </div>
  );
}
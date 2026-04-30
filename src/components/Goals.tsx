import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { Goal } from '@/types';

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

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('quarterly');
    setDueDate('');
    setSelectedHabits([]);
    setSelectedTasks([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      updateGoal(editingId, {
        title,
        description,
        type,
        dueDate,
        linkedHabits: selectedHabits,
        linkedTasks: selectedTasks
      });
    } else {
      addGoal({
        title,
        description,
        type,
        progress: 0,
        dueDate,
        linkedHabits: selectedHabits,
        linkedTasks: selectedTasks,
        status: 'active'
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

  const toggleHabitLink = (habitId: string) => {
    setSelectedHabits(prev =>
      prev.includes(habitId) ? prev.filter(id => id !== habitId) : [...prev, habitId]
    );
  };

  const toggleTaskLink = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Metas</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Nueva Meta
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg space-y-4">
          <input
            type="text"
            placeholder="Título de la meta"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
          <textarea
            placeholder="Descripción"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              value={type}
              onChange={e => setType(e.target.value as Goal['type'])}
              className="p-2 rounded bg-gray-700 text-white"
            >
              <option value="quarterly">Trimestral</option>
              <option value="monthly">Mensual</option>
              <option value="yearly">Anual</option>
              <option value="okr">OKR</option>
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="p-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-semibold">Vincular Hábitos</h3>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {habits.map(habit => (
                <label key={habit.id} className="flex items-center space-x-2 text-white">
                  <input
                    type="checkbox"
                    checked={selectedHabits.includes(habit.id)}
                    onChange={() => toggleHabitLink(habit.id)}
                    className="rounded"
                  />
                  <span>{habit.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-semibold">Vincular Tareas</h3>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {tasks.map(task => (
                <label key={task.id} className="flex items-center space-x-2 text-white">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => toggleTaskLink(task.id)}
                    className="rounded"
                  />
                  <span>{task.title}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              {editingId ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {goals.map(goal => (
          <div key={goal.id} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
                <p className="text-gray-400 text-sm">{goal.description}</p>
                <div className="flex space-x-2 mt-1">
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">{goal.type}</span>
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">
                    {new Date(goal.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(goal)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Progreso</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {goal.linkedHabits.map(habitId => {
                const habit = habits.find(h => h.id === habitId);
                return habit ? (
                  <span key={habitId} className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                    {habit.name}
                  </span>
                ) : null;
              })}
              {goal.linkedTasks.map(taskId => {
                const task = tasks.find(t => t.id === taskId);
                return task ? (
                  <span key={taskId} className="text-xs bg-orange-600 text-white px-2 py-1 rounded">
                    {task.title}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

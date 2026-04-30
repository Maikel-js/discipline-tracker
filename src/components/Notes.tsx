import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { Note } from '@/types';

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote, habits, tasks } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [tags, setTags] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedHabits([]);
    setSelectedTasks([]);
    setTags('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);

    if (editingId) {
      updateNote(editingId, {
        title,
        content,
        linkedHabits: selectedHabits,
        linkedTasks: selectedTasks,
        tags: tagArray
      });
    } else {
      addNote({
        title,
        content,
        linkedHabits: selectedHabits,
        linkedTasks: selectedTasks,
        tags: tagArray
      });
    }
    resetForm();
  };

  const handleEdit = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setSelectedHabits(note.linkedHabits);
    setSelectedTasks(note.linkedTasks);
    setTags(note.tags.join(', '));
    setEditingId(note.id);
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
        <h2 className="text-2xl font-bold text-white">Notas</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Nueva Nota
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg space-y-4">
          <input
            type="text"
            placeholder="Título de la nota"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
          <textarea
            placeholder="Contenido de la nota"
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            rows={5}
          />
          <input
            type="text"
            placeholder="Etiquetas (separadas por coma)"
            value={tags}
            onChange={e => setTags(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />

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
        {notes.map(note => (
          <div key={note.id} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-white">{note.title}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(note)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-2 whitespace-pre-wrap">{note.content}</p>

            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {note.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-600 text-white px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-1">
              {note.linkedHabits.map(habitId => {
                const habit = habits.find(h => h.id === habitId);
                return habit ? (
                  <span key={habitId} className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                    {habit.name}
                  </span>
                ) : null;
              })}
              {note.linkedTasks.map(taskId => {
                const task = tasks.find(t => t.id === taskId);
                return task ? (
                  <span key={taskId} className="text-xs bg-orange-600 text-white px-2 py-1 rounded">
                    {task.title}
                  </span>
                ) : null;
              })}
            </div>

            <div className="text-xs text-gray-500 mt-2">
              {new Date(note.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

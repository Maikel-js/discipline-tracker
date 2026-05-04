'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import type { Note, Category } from '@/types';
import { 
  Plus, Trash2, Edit2, Save, X, Tag, 
  Search, FileText, Calendar, Filter, StickyNote
} from 'lucide-react';
import { format } from 'date-fns';

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [tags, setTags] = useState('');

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('other');
    setTags('');
    setEditingId(null);
    setIsCreating(false);
  };

  const handleEdit = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setTags(note.tags.join(', '));
    setEditingId(note.id);
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    const noteData = {
      title,
      content,
      category,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
    };

    if (editingId) {
      updateNote(editingId, noteData);
    } else {
      addNote(noteData);
    }
    resetForm();
  };

  const filteredNotes = (notes || []).filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <StickyNote className="text-yellow-400" />
          Notas y Pensamientos
        </h2>
        {!isCreating && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition shadow-lg shadow-blue-500/20 font-bold"
          >
            <Plus size={18} />
            Nueva Nota
          </button>
        )}
      </div>

      {!isCreating && (
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar notas..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value as any)}
              className="bg-transparent text-white text-sm outline-none"
            >
              <option value="all">Todas las categorías</option>
              <option value="work">Trabajo</option>
              <option value="study">Estudio</option>
              <option value="health">Salud</option>
              <option value="exercise">Ejercicio</option>
              <option value="personal">Personal</option>
              <option value="other">Otro</option>
            </select>
          </div>
        </div>
      )}

      {isCreating && (
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 space-y-4 animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">
              {editingId ? 'Editar Nota' : 'Crear Nueva Nota'}
            </h3>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Título de la nota"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-lg font-bold text-white focus:border-blue-500 outline-none transition-all"
            />
            
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Escribe lo que tienes en mente..."
              rows={8}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none resize-none transition-all"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="text-sm text-gray-400">Tags (separados por coma)</label>
                <input
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="ideas, recordatorio, importante"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Save size={18} />
              {editingId ? 'Actualizar Nota' : 'Guardar Nota'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-gray-800/30 rounded-2xl border border-dashed border-gray-700">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 font-medium">No se encontraron notas.</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery || filterCategory !== 'all' ? 'Intenta ajustar tus filtros' : 'Crea tu primera nota para empezar'}
            </p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div 
              key={note.id} 
              className="bg-gray-800 p-5 rounded-2xl border border-gray-700 hover:border-gray-500 transition-all group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                  {note.category}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleEdit(note)}
                    className="p-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteNote(note.id)}
                    className="p-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{note.title}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-4 flex-1 whitespace-pre-wrap">{note.content}</p>

              <div className="pt-4 border-t border-gray-700 mt-auto flex flex-wrap gap-2 items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {(note.tags || []).map(tag => (
                    <span key={tag} className="text-[10px] bg-gray-900 text-gray-500 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Tag size={8} /> {tag}
                    </span>
                  ))}
                </div>
                <div className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Calendar size={10} />
                  {format(new Date(note.updatedAt), 'dd/MM/yyyy HH:mm')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Check, MoreVertical, Trash2, GripVertical, Edit2 } from 'lucide-react';
import type { Task, Priority } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  task: Task;
  onEdit?: (task: Task) => void;
}

interface DragOverlayProps {
  task: Task;
}

const priorityColors: Record<Priority, string> = {
  low: 'border-l-green-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-orange-500',
  urgent: 'border-l-red-500'
};

export function DragOverlayCard({ task }: DragOverlayProps) {
  return (
    <div className={`bg-gray-800 border-2 border-blue-500 rounded-lg p-3 border-l-4 ${priorityColors[task.priority]} shadow-2xl shadow-blue-500/30 rotate-3 scale-105`}>
      <div className="flex items-start gap-2">
        <GripVertical size={16} className="mt-1 text-blue-400" />
        <div className="flex-1">
          <h4 className="font-medium text-white">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-gray-400 mt-1">{task.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TaskCard({ task, onEdit }: Props) {
  const { updateTask, deleteTask } = useStore();
  const [showMenu, setShowMenu] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: { type: 'task', task }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : ('auto' as const)
  };

  const toggleSubtask = (subtaskId: string) => {
    const subtasks = task.subtasks.map(s =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    updateTask(task.id, { subtasks });
  };

  const getButtonConfig = () => {
    switch (task.status) {
      case 'todo':
        return { text: 'Iniciar', color: 'bg-blue-600 hover:bg-blue-500' };
      case 'doing':
        return { text: 'Completar', color: 'bg-green-600 hover:bg-green-500' };
      case 'done':
        return task.allowReset
          ? { text: 'Reiniciar', color: 'bg-yellow-600 hover:bg-yellow-500' }
          : { text: 'Completado', color: 'bg-gray-600 cursor-not-allowed' };
    }
  };

  const buttonConfig = getButtonConfig();
  const isDone = task.status === 'done' && !task.allowReset;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-800/50 border border-gray-700 rounded-lg p-3 border-l-4 ${priorityColors[task.priority]} ${isDragging ? 'shadow-xl shadow-blue-500/20' : ''}`}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 text-gray-500 cursor-grab active:cursor-grabbing hover:text-blue-400 transition-colors"
        >
          <GripVertical size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${task.status === 'done' ? 'line-through text-gray-500' : 'text-white'}`}>
              {task.title}
            </h4>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <MoreVertical size={14} className="text-gray-400" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-6 bg-gray-700 rounded shadow-lg py-1 z-10 min-w-[120px]">
                  {onEdit && (
                    <button
                      onClick={() => { onEdit(task); setShowMenu(false); }}
                      className="flex items-center gap-2 px-3 py-1.5 text-blue-400 hover:bg-gray-600 w-full text-sm"
                    >
                      <Edit2 size={14} /> Editar
                    </button>
                  )}
                  <button
                    onClick={() => { deleteTask(task.id); setShowMenu(false); }}
                    className="flex items-center gap-2 px-3 py-1.5 text-red-400 hover:bg-gray-600 w-full text-sm"
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>

          {task.description && (
            <p className="text-sm text-gray-400 mt-1">{task.description}</p>
          )}

          {task.subtasks.length > 0 && (
            <div className="mt-2 space-y-1">
              {task.subtasks.map(subtask => (
                <button
                  key={subtask.id}
                  onClick={() => toggleSubtask(subtask.id)}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                >
                  <div className={`w-4 h-4 rounded border ${
                    subtask.completed ? 'bg-green-500 border-green-500' : 'border-gray-500'
                  }`}>
                    {subtask.completed && <Check size={12} className="text-white" />}
                  </div>
                  <span className={subtask.completed ? 'line-through' : ''}>{subtask.title}</span>
                </button>
              ))}
            </div>
          )}

          {task.dueDate && (
            <div className="mt-2 text-xs text-gray-500">
              Vence: {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}

          <button
            onClick={() => !isDone && useStore.getState().advanceTask(task.id)}
            disabled={isDone}
            className={`w-full mt-3 py-2 rounded-lg text-white text-sm font-medium transition-colors ${buttonConfig.color}`}
          >
            {buttonConfig.text}
          </button>
        </div>
      </div>
    </div>
  );
}

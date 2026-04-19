'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Check, MoreVertical, Trash2, GripVertical } from 'lucide-react';
import type { Task, Priority, TaskStatus } from '@/types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  task: Task;
}

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
}

const priorityColors: Record<Priority, string> = {
  low: 'border-l-green-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-orange-500',
  urgent: 'border-l-red-500'
};

function SortableTask({ task }: Props) {
  const { updateTask, deleteTask, advanceTask } = useStore();
  const [showMenu, setShowMenu] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
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
      className={`bg-gray-800/50 border border-gray-700 rounded-lg p-3 border-l-4 ${priorityColors[task.priority]}`}
    >
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="mt-1 text-gray-500 cursor-grab">
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
                <div className="absolute right-0 top-6 bg-gray-700 rounded shadow-lg py-1 z-10">
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="flex items-center gap-2 px-3 py-1 text-red-400 hover:bg-gray-600 w-full"
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
            onClick={() => !isDone && advanceTask(task.id)}
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

export default function TaskColumn({ title, status, tasks }: TaskColumnProps) {
  const { moveTask } = useStore();
  const filteredTasks = tasks.filter(t => t.status === status);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <div className="bg-gray-900/50 rounded-xl p-4 min-h-[400px]">
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        {title}
        <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">{filteredTasks.length}</span>
      </h3>
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (over && active.id !== over.id) {
            moveTask(active.id as string, status);
          }
        }}
      >
        <SortableContext items={filteredTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {filteredTasks.map(task => (
              <SortableTask key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {filteredTasks.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No hay tareas
        </div>
      )}
    </div>
  );
}
'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '@/types';
import TaskCard from './TaskCard';
import { useCallback } from 'react';

interface Props {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  isOver: boolean;
  onEditTask: (task: Task) => void;
}

export default function TaskColumn({ title, status, tasks, isOver, onEditTask }: Props) {
  const { setNodeRef, isOver: isOverDnd } = useDroppable({ id: `column-${status}` });
  const filteredTasks = tasks.filter(t => t.status === status);

  const handleEdit = useCallback((task: Task) => {
    onEditTask(task);
  }, [onEditTask]);

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-900/50 rounded-xl p-4 min-h-[400px] transition-all duration-200 ${
        isOver ? 'bg-blue-900/30 ring-2 ring-blue-500/50 scale-[1.02]' : ''
      }`}
    >
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        {title}
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          isOver ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
        }`}>
          {filteredTasks.length}
        </span>
      </h3>

      <SortableContext items={filteredTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[100px]">
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={handleEdit} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

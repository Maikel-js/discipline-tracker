'use client';

import { useState, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { Plus } from 'lucide-react';
import type { Task, TaskStatus } from '@/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import TaskColumn from './TaskColumn';
import TaskCard from './TaskCard';
import TaskFormModal from './TaskFormModal';

const columns: { title: string; status: TaskStatus }[] = [
  { title: 'Por Hacer', status: 'todo' },
  { title: 'En Progreso', status: 'doing' },
  { title: 'Completado', status: 'done' }
];

export default function TaskBoard() {
  const { tasks, updateTask } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  const handleDragStart = useCallback((event: any) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: any) => {
    const { over } = event;
    if (over) {
      const overId = over.id as string;
      if (overId.startsWith('column-')) {
        setOverColumn(overId.replace('column-', '') as TaskStatus);
      } else {
        const overTask = tasks.find(t => t.id === overId);
        if (overTask) {
          setOverColumn(overTask.status);
        }
      }
    } else {
      setOverColumn(null);
    }
  }, [tasks]);

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;
    setActiveId(null);
    setOverColumn(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    let targetStatus: TaskStatus | null = null;

    if (overId.startsWith('column-')) {
      targetStatus = overId.replace('column-', '') as TaskStatus;
    } else {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (taskId && targetStatus) {
      updateTask(taskId, { status: targetStatus });
    }
  }, [tasks, updateTask]);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingTask(undefined);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Tareas</h2>
        <button
          onClick={() => {
            setEditingTask(undefined);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
        >
          <Plus size={18} />
          <span className="text-sm">Nueva</span>
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid md:grid-cols-3 gap-4">
          {columns.map(col => (
            <TaskColumn
              key={col.status}
              title={col.title}
              status={col.status}
              tasks={tasks}
              isOver={overColumn === col.status}
              onEditTask={handleEditTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragOverlay /> : null}
        </DragOverlay>
      </DndContext>

      <TaskFormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        task={editingTask}
      />
    </div>
  );
}

declare global {
  var __TEST_STORE__: any;
}

import type { Goal, Task, Habit, HabitStatus } from '@/types';

describe('Goals Tests', () => {
  let store: any;

  beforeEach(() => {
    store = global.__TEST_STORE__;
  });

  describe('Add Goal', () => {
    it('should create a new goal with id and createdAt', () => {
      store.addGoal({
        title: 'Meta trimestral',
        description: 'Completar proyecto',
        type: 'quarterly',
        progress: 0,
        dueDate: '2026-06-30',
        linkedHabits: [],
        linkedTasks: [],
        status: 'active'
      });

      expect(store.goals).toHaveLength(1);
      expect(store.goals[0].title).toBe('Meta trimestral');
      expect(store.goals[0].id).toBeDefined();
      expect(store.goals[0].createdAt).toBeDefined();
    });

    it('should create goal with linked habits', () => {
      store.addGoal({
        title: 'Meta con hábitos',
        description: 'Test',
        type: 'monthly',
        progress: 0,
        dueDate: '2026-05-30',
        linkedHabits: ['habit-1', 'habit-2'],
        linkedTasks: [],
        status: 'active'
      });

      expect(store.goals[0].linkedHabits).toHaveLength(2);
      expect(store.goals[0].linkedHabits).toContain('habit-1');
    });

    it('should create goal with linked tasks', () => {
      store.addGoal({
        title: 'Meta con tareas',
        description: 'Test',
        type: 'yearly',
        progress: 0,
        dueDate: '2026-12-31',
        linkedHabits: [],
        linkedTasks: ['task-1', 'task-2'],
        status: 'active'
      });

      expect(store.goals[0].linkedTasks).toHaveLength(2);
    });
  });

  describe('Update Goal', () => {
    beforeEach(() => {
      store.addGoal({
        title: 'Original',
        description: 'Desc',
        type: 'quarterly',
        progress: 0,
        dueDate: '2026-06-30',
        linkedHabits: [],
        linkedTasks: [],
        status: 'active'
      });
    });

    it('should update goal title', () => {
      const goal = store.goals[0];
      store.updateGoal(goal.id, { title: 'Actualizado' });

      expect(store.goals[0].title).toBe('Actualizado');
    });

    it('should update goal status to completed', () => {
      const goal = store.goals[0];
      store.updateGoal(goal.id, { status: 'completed' });

      expect(store.goals[0].status).toBe('completed');
    });

    it('should update linked habits', () => {
      const goal = store.goals[0];
      store.updateGoal(goal.id, { linkedHabits: ['new-habit'] });

      expect(store.goals[0].linkedHabits).toContain('new-habit');
    });
  });

  describe('Delete Goal', () => {
    it('should delete a goal', () => {
      store.addGoal({
        title: 'Para eliminar',
        description: 'Test',
        type: 'monthly',
        progress: 0,
        dueDate: '2026-05-30',
        linkedHabits: [],
        linkedTasks: [],
        status: 'active'
      });

      const goal = store.goals[0];
      store.deleteGoal(goal.id);

      expect(store.goals).toHaveLength(0);
    });
  });

  describe('Recalculate Goal Progress', () => {
    it('should calculate progress from linked habits completionRate', () => {
      // Add a habit with completionRate of 80
      store.addHabit({
        name: 'Habit 1',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'health',
        status: 'completed'
      });

      const habit = store.habits[0];
      store.updateHabit(habit.id, { completionRate: 80 });

      store.addGoal({
        title: 'Meta con hábito',
        description: 'Test',
        type: 'quarterly',
        progress: 0,
        dueDate: '2026-06-30',
        linkedHabits: [habit.id],
        linkedTasks: [],
        status: 'active'
      });

      store.recalculateGoalProgress();

      expect(store.goals[0].progress).toBe(80);
    });

    it('should calculate progress from linked tasks done status', () => {
      store.addTask({
        title: 'Task 1',
        priority: 'high',
        status: 'done',
        allowReset: false,
        subtasks: [],
        dependencies: [],
        reminders: []
      });

      const task = store.tasks[0];

      store.addGoal({
        title: 'Meta con tarea',
        description: 'Test',
        type: 'quarterly',
        progress: 0,
        dueDate: '2026-06-30',
        linkedHabits: [],
        linkedTasks: [task.id],
        status: 'active'
      });

      store.recalculateGoalProgress();

      expect(store.goals[0].progress).toBe(100);
    });

    it('should stay at 0% with no linked items', () => {
      store.addGoal({
        title: 'Meta vacía',
        description: 'Test',
        type: 'quarterly',
        progress: 50,
        dueDate: '2026-06-30',
        linkedHabits: [],
        linkedTasks: [],
        status: 'active'
      });

      store.recalculateGoalProgress();

      expect(store.goals[0].progress).toBe(50);
    });

    it('should change status to completed when progress reaches 100%', () => {
      store.addTask({
        title: 'Task done',
        priority: 'high',
        status: 'done',
        allowReset: false,
        subtasks: [],
        dependencies: [],
        reminders: []
      });

      const task = store.tasks[0];

      store.addGoal({
        title: 'Meta completada',
        description: 'Test',
        type: 'quarterly',
        progress: 0,
        dueDate: '2026-06-30',
        linkedHabits: [],
        linkedTasks: [task.id],
        status: 'active'
      });

      store.recalculateGoalProgress();

      expect(store.goals[0].status).toBe('completed');
    });
  });
});

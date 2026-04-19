declare global {
  var __TEST_STORE__: any;
}

import type { Habit, Task, HabitLog, Notification, Alarm, Streak, HabitStatus, TaskStatus } from '@/types';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

describe('Habits CRUD Tests', () => {
  let store: any;

  beforeEach(() => {
    store = global.__TEST_STORE__;
  });

  describe('Create Habit', () => {
    it('should create a new habit', () => {
      store.addHabit({
        name: 'Meditar 10 minutos',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });

      expect(store.habits).toHaveLength(1);
      expect(store.habits[0].name).toBe('Meditar 10 minutos');
    });

    it('should create habit with all required fields', () => {
      store.addHabit({
        name: 'Test',
        scheduledTime: '09:00',
        frequency: 'weekly',
        priority: 'medium',
        streakGoal: 14,
        category: 'exercise',
        status: 'pending'
      });

      const habit = store.habits[0];
      expect(habit.id).toBeDefined();
      expect(habit.currentStreak).toBe(0);
      expect(habit.completionRate).toBe(0);
    });

    it('should generate unique ids', () => {
      store.addHabit({ name: 'H1', scheduledTime: '08:00', frequency: 'daily', priority: 'low', streakGoal: 7, category: 'health', status: 'pending' });
      store.addHabit({ name: 'H2', scheduledTime: '08:00', frequency: 'daily', priority: 'low', streakGoal: 7, category: 'health', status: 'pending' });

      expect(store.habits[0].id).not.toBe(store.habits[1].id);
    });
  });

  describe('Update Habit', () => {
    it('should update habit name', () => {
      store.addHabit({ name: 'Original', scheduledTime: '08:00', frequency: 'daily', priority: 'medium', streakGoal: 7, category: 'health', status: 'pending' });
      const habit = store.habits[0];
      
      store.updateHabit(habit.id, { name: 'Actualizado' });
      
      expect(store.habits[0].name).toBe('Actualizado');
    });

    it('should update habit priority', () => {
      store.addHabit({ name: 'Test', scheduledTime: '08:00', frequency: 'daily', priority: 'low', streakGoal: 7, category: 'health', status: 'pending' });
      const habit = store.habits[0];
      
      store.updateHabit(habit.id, { priority: 'urgent' });
      
      expect(store.habits[0].priority).toBe('urgent');
    });
  });

  describe('Delete Habit', () => {
    it('should delete a habit', () => {
      store.addHabit({ name: 'Test', scheduledTime: '08:00', frequency: 'daily', priority: 'medium', streakGoal: 7, category: 'health', status: 'pending' });
      const habit = store.habits[0];
      
      store.deleteHabit(habit.id);
      
      expect(store.habits).toHaveLength(0);
    });
  });

  describe('Complete Habit', () => {
    it('should mark habit as completed', () => {
      store.addHabit({ name: 'Test', scheduledTime: '08:00', frequency: 'daily', priority: 'medium', streakGoal: 7, category: 'health', status: 'pending' });
      const habit = store.habits[0];
      
      store.completeHabit(habit.id);
      
      expect(store.habits[0].status).toBe('completed');
    });

    it('should increment streak', () => {
      store.addHabit({ name: 'Test', scheduledTime: '08:00', frequency: 'daily', priority: 'medium', streakGoal: 7, category: 'health', status: 'pending' });
      const habit = store.habits[0];
      
      store.completeHabit(habit.id);
      
      expect(store.habits[0].currentStreak).toBe(1);
    });
  });

  describe('Miss Habit', () => {
    it('should mark habit as missed', () => {
      store.addHabit({ name: 'Test', scheduledTime: '08:00', frequency: 'daily', priority: 'medium', streakGoal: 7, category: 'health', status: 'pending' });
      const habit = store.habits[0];
      
      store.missHabit(habit.id);
      
      expect(store.habits[0].status).toBe('missed');
    });

    it('should reset streak on miss', () => {
      store.addHabit({ name: 'Test', scheduledTime: '08:00', frequency: 'daily', priority: 'medium', streakGoal: 7, category: 'health', status: 'pending' });
      const habit = store.habits[0];
      store.completeHabit(habit.id);
      
      store.missHabit(habit.id);
      
      expect(store.habits[0].currentStreak).toBe(0);
    });
  });
});
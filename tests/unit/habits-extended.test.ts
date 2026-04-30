declare global {
  var __TEST_STORE__: any;
}

describe('Habits Extended Tests', () => {
  let store: any;

  beforeEach(() => {
    store = global.__TEST_STORE__;
  });

  describe('Reschedule Habit', () => {
    it('should change scheduled time', () => {
      store.addHabit({
        name: 'Test',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });

      const habit = store.habits[0];
      store.rescheduleHabit(habit.id, '10:30');

      expect(store.habits[0].scheduledTime).toBe('10:30');
    });

    it('should increment rescheduleCount', () => {
      store.addHabit({
        name: 'Test',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });

      const habit = store.habits[0];
      expect(habit.rescheduleCount).toBe(0);

      store.rescheduleHabit(habit.id, '10:30');

      expect(store.habits[0].rescheduleCount).toBe(1);
    });

    it('should add audit log on reschedule', () => {
      store.addHabit({
        name: 'Test',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });

      const habit = store.habits[0];
      store.rescheduleHabit(habit.id, '10:30');

      expect(store.auditLogs).toHaveLength(1);
      expect(store.auditLogs[0].action).toBe('rescheduled');
    });

    it('should penalize discipline score after max reschedules', () => {
      store.addHabit({
        name: 'Test',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });

      const habit = store.habits[0];
      const initialScore = store.stats.disciplinaryScore;

      // Reschedule up to max (3 times)
      store.rescheduleHabit(habit.id, '09:00');
      store.rescheduleHabit(habit.id, '10:00');
      store.rescheduleHabit(habit.id, '11:00');

      expect(store.habits[0].rescheduleCount).toBe(3);

      // This one should trigger penalty
      store.rescheduleHabit(habit.id, '12:00');

      expect(store.stats.disciplinaryScore).toBeLessThan(initialScore);
    });
  });

  describe('Check Task Dependencies', () => {
    it('should return true if no dependencies', () => {
      store.addTask({
        title: 'No deps',
        priority: 'high',
        status: 'todo',
        allowReset: false,
        subtasks: [],
        dependencies: [],
        reminders: []
      });

      const task = store.tasks[0];
      const result = store.checkTaskDependencies(task.id);

      expect(result).toBe(true);
    });

    it('should return true if all dependencies are done', () => {
      store.addTask({
        title: 'Dep 1',
        priority: 'high',
        status: 'done',
        allowReset: false,
        subtasks: [],
        dependencies: [],
        reminders: []
      });

      const dep = store.tasks[0];

      store.addTask({
        title: 'Main task',
        priority: 'high',
        status: 'todo',
        allowReset: false,
        subtasks: [],
        dependencies: [dep.id],
        reminders: []
      });

      const task = store.tasks[1];
      const result = store.checkTaskDependencies(task.id);

      expect(result).toBe(true);
    });

    it('should return false and block task if dependencies not done', () => {
      store.addTask({
        title: 'Dep 1',
        priority: 'high',
        status: 'todo', // Not done
        allowReset: false,
        subtasks: [],
        dependencies: [],
        reminders: []
      });

      const dep = store.tasks[0];

      store.addTask({
        title: 'Main task',
        priority: 'high',
        status: 'todo',
        allowReset: false,
        subtasks: [],
        dependencies: [dep.id],
        reminders: []
      });

      const task = store.tasks[1];
      const result = store.checkTaskDependencies(task.id);

      expect(result).toBe(false);
      expect(store.tasks[1].isBlocked).toBe(true);
      expect(store.tasks[1].blockReason).toContain('Dep 1');
    });
  });
});

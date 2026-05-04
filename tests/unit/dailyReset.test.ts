declare global {
  var __TEST_STORE__: any;
}

describe('Daily Reset Tests', () => {
  let store: any;

  beforeEach(() => {
    store = global.__TEST_STORE__;
  });

  describe('Check and Reset Daily', () => {
    it('should reset habits to pending status after 12 AM', () => {
      // Create a habit and mark as completed
      store.addHabit({
        name: 'Habit test',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });

      const habit = store.habits[0];
      store.completeHabit(habit.id);
      expect(store.habits[0].status).toBe('completed');

      // Simulate a new day (change lastResetDate)
      const nextDay = new Date('2026-04-19T10:00:00');
      jest.setSystemTime(nextDay);

      store.checkAndResetDaily();

      expect(store.habits[0].status).toBe('pending');
    });

    it('should not reset if already reset today', () => {
      store.addHabit({
        name: 'Habit test',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'health',
        status: 'completed'
      });

      const habit = store.habits[0];

      // First call should reset
      store.checkAndResetDaily();
      expect(store.habits[0].status).toBe('pending');

      // Mark as completed again
      store.completeHabit(habit.id);
      expect(store.habits[0].status).toBe('completed');

      // Second call same day should NOT reset
      store.checkAndResetDaily();
      expect(store.habits[0].status).toBe('completed');
    });

    it('should update lastResetDate after reset', () => {
      const initialDate = store.lastResetDate;

      const nextDay = new Date('2026-04-19T10:00:00');
      jest.setSystemTime(nextDay);

      store.checkAndResetDaily();

      expect(store.lastResetDate).not.toBe(initialDate);
      expect(store.lastResetDate).toBe('2026-04-19');
    });

    it('should update lastResetDate after reset', () => {
      const initialDate = store.lastResetDate;

      const nextDay = new Date('2026-04-19T10:00:00');
      jest.setSystemTime(nextDay);

      store.checkAndResetDaily();

      expect(store.lastResetDate).not.toBe(initialDate);
      expect(store.lastResetDate).toBe('2026-04-19');
    });

    it('should not affect habits that are already pending', () => {
      store.addHabit({
        name: 'Pending habit',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'medium',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });

      const nextDay = new Date('2026-04-19T10:00:00');
      jest.setSystemTime(nextDay);

      store.checkAndResetDaily();

      expect(store.habits[0].status).toBe('pending');
    });

    it('should not affect other state properties', () => {
      store.addHabit({
        name: 'Habit test',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'health',
        status: 'completed'
      });

      const streaksBefore = [...store.streaks];
      const logsBefore = [...store.logs];

      const nextDay = new Date('2026-04-19T10:00:00');
      jest.setSystemTime(nextDay);

      store.checkAndResetDaily();

      expect(store.streaks).toEqual(streaksBefore);
      expect(store.logs).toEqual(logsBefore);
    });
  });
});

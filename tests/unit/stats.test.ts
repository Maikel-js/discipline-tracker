declare global {
  var __TEST_STORE__: any;
}

describe('Stats Tests', () => {
  let store: any;

  beforeEach(() => {
    store = global.__TEST_STORE__;
  });

  describe('Update Stats', () => {
    it('should calculate totalHabits', () => {
      store.addHabit({
        name: 'H1',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });
      store.addHabit({
        name: 'H2',
        scheduledTime: '09:00',
        frequency: 'daily',
        priority: 'medium',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });

      store.updateStats();

      expect(store.stats.totalHabits).toBe(2);
    });

    it('should calculate completedToday', () => {
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

      store.updateStats();

      expect(store.stats.completedToday).toBe(1);
    });

    it('should calculate completionRate as average of habit rates', () => {
      store.addHabit({
        name: 'H1',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });
      store.addHabit({
        name: 'H2',
        scheduledTime: '09:00',
        frequency: 'daily',
        priority: 'medium',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });

      store.updateHabit(store.habits[0].id, { completionRate: 100 });
      store.updateHabit(store.habits[1].id, { completionRate: 50 });

      store.updateStats();

      expect(store.stats.completionRate).toBe(75);
    });

    it('should calculate currentStreak as max streak', () => {
      store.addHabit({
        name: 'H1',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });

      store.updateHabit(store.habits[0].id, { currentStreak: 15 });

      store.updateStats();

      expect(store.stats.currentStreak).toBe(15);
    });

    it('should preserve disciplinaryScore from store', () => {
      store.stats.disciplinaryScore = 150;

      store.addHabit({
        name: 'H1',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });
      store.addHabit({
        name: 'H2',
        scheduledTime: '09:00',
        frequency: 'daily',
        priority: 'medium',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });

      store.updateStats();

      expect(store.stats.disciplinaryScore).toBe(150);
    });

    it('should calculate level based on score', () => {
      store.stats.disciplinaryScore = 250;

      store.updateStats();

      expect(store.stats.level).toBe(3); // Math.floor(250/100) + 1 = 3
    });
  });

  describe('Add Discipline Score', () => {
    it('should add points to score', () => {
      const initialScore = store.stats.disciplinaryScore;

      store.addDisciplineScore(10, 'Test reason');

      expect(store.stats.disciplinaryScore).toBe(initialScore + 10);
    });

    it('should allow negative scores', () => {
      store.stats.disciplinaryScore = 5;

      store.addDisciplineScore(-10, 'Test penalty');

      expect(store.stats.disciplinaryScore).toBe(-5);
    });

    it('should log to history', () => {
      store.addDisciplineScore(15, 'Completed task');

      expect(store.disciplineHistory).toHaveLength(1);
      expect(store.disciplineHistory[0].score).toBeGreaterThan(0);
      expect(store.disciplineHistory[0].reason).toBe('Completed task');
    });
  });

  describe('Toggle Extreme Mode', () => {
    it('should toggle extremeMode in settings', () => {
      const initialMode = store.settings.extremeMode;

      store.toggleExtremeMode();

      expect(store.settings.extremeMode).toBe(!initialMode);
    });
  });

  describe('Update Settings', () => {
    it('should update setting properties', () => {
      store.updateSettings({ notificationsEnabled: false, pomodoroLength: 30 });

      expect(store.settings.notificationsEnabled).toBe(false);
      expect(store.settings.pomodoroLength).toBe(30);
    });

    it('should not affect other settings', () => {
      store.updateSettings({ soundEnabled: false });

      expect(store.settings.vibrationEnabled).toBe(true);
      expect(store.settings.punishmentMode).toBe(false);
    });
  });
});

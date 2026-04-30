declare global {
  var __TEST_STORE__: any;
}

describe('Penalties Tests', () => {
  let store: any;

  beforeEach(() => {
    store = global.__TEST_STORE__;
    // Enable punishment mode
    store.updateSettings({ punishmentMode: true });
  });

  describe('Apply Auto Penalty', () => {
    it('should create penalty task when habit is missed', () => {
      store.addHabit({
        name: 'Test Habit',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });

      const habit = store.habits[0];
      const initialTaskCount = store.tasks.length;

      store.applyAutoPenalty(habit.id);

      expect(store.tasks).toHaveLength(initialTaskCount + 1);
      expect(store.tasks[store.tasks.length - 1].title).toContain('Extra');
      expect(store.tasks[store.tasks.length - 1].priority).toBe('high');
    });

    it('should add audit log', () => {
      store.addHabit({
        name: 'Test Habit',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });

      const habit = store.habits[0];

      store.applyAutoPenalty(habit.id);

      const penaltyLog = store.auditLogs.find((l: any) => l.action === 'penalty');
      expect(penaltyLog).toBeDefined();
      expect(penaltyLog.habitName).toBe('Test Habit');
    });

    it('should penalize discipline score', () => {
      store.addHabit({
        name: 'Test Habit',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });

      const habit = store.habits[0];
      const initialScore = store.stats.disciplinaryScore;

      store.applyAutoPenalty(habit.id);

      expect(store.stats.disciplinaryScore).toBeLessThan(initialScore);
    });
  });

  describe('Toggle Punishment Mode', () => {
    it('should toggle punishment mode in settings', () => {
      const initialMode = store.settings.punishmentMode;

      store.togglePunishmentMode();

      expect(store.settings.punishmentMode).toBe(!initialMode);
    });

    it('should toggle back on second call', () => {
      const initialMode = store.settings.punishmentMode;

      store.togglePunishmentMode();
      store.togglePunishmentMode();

      expect(store.settings.punishmentMode).toBe(initialMode);
    });
  });

  describe('Miss Habit with Punishment Mode', () => {
    it('should apply auto penalty when punishment mode is on', () => {
      store.addHabit({
        name: 'Test Habit',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });

      const habit = store.habits[0];
      const initialTaskCount = store.tasks.length;

      store.missHabit(habit.id);

      expect(store.tasks).toHaveLength(initialTaskCount + 1);
    });

    it('should not apply penalty when punishment mode is off', () => {
      store.updateSettings({ punishmentMode: false });

      store.addHabit({
        name: 'Test Habit',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });

      const habit = store.habits[0];
      const initialTaskCount = store.tasks.length;

      store.missHabit(habit.id);

      expect(store.tasks).toHaveLength(initialTaskCount);
    });
  });
});

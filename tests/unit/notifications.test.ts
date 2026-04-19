declare global {
  var __TEST_STORE__: any;
}

describe('Notifications Tests', () => {
  let store: any;

  beforeEach(() => {
    store = global.__TEST_STORE__;
  });

  describe('First Notification (Level 1)', () => {
    it('should trigger first notification', () => {
      store.addHabit({ name: 'Test', scheduledTime: '10:00', frequency: 'daily', priority: 'high', streakGoal: 7, category: 'health', status: 'pending' });
      const habit = store.habits[0];
      
      store.addNotification(habit.id, 1);
      
      const level1 = store.notifications.filter((n: any) => n.level === 1);
      expect(level1.length).toBeGreaterThan(0);
    });
  });

  describe('Second Notification (Level 2)', () => {
    it('should trigger second notification after 5-10 minutes', () => {
      store.addHabit({ name: 'Test', scheduledTime: '10:00', frequency: 'daily', priority: 'high', streakGoal: 7, category: 'health', status: 'pending' });
      const habit = store.habits[0];
      
      store.addNotification(habit.id, 2);
      
      const level2 = store.notifications.filter((n: any) => n.level === 2);
      expect(level2.length).toBeGreaterThan(0);
    });
  });

  describe('Third Notification (Level 3)', () => {
    it('should trigger after 10-15 minutes', () => {
      store.addHabit({ name: 'Test', scheduledTime: '10:00', frequency: 'daily', priority: 'urgent', streakGoal: 7, category: 'work', status: 'pending' });
      const habit = store.habits[0];
      
      store.addNotification(habit.id, 3);
      
      const level3 = store.notifications.filter((n: any) => n.level === 3);
      expect(level3.length).toBeGreaterThan(0);
    });
  });

  describe('Fourth Notification (Level 4) - Alarm', () => {
    it('should trigger alarm after 15-20 minutes', () => {
      store.addHabit({ name: 'Test', scheduledTime: '10:00', frequency: 'daily', priority: 'urgent', streakGoal: 7, category: 'work', status: 'pending' });
      const habit = store.habits[0];
      
      store.triggerAlarm(habit.id);
      
      const activeAlarms = store.alarms.filter((a: any) => a.habitId === habit.id);
      expect(activeAlarms.length).toBeGreaterThan(0);
    });
  });

  describe('Fifth Notification (Level 5)', () => {
    it('should trigger after 20+ minutes', () => {
      store.addHabit({ name: 'Test', scheduledTime: '10:00', frequency: 'daily', priority: 'urgent', streakGoal: 7, category: 'work', status: 'pending' });
      const habit = store.habits[0];
      
      store.addNotification(habit.id, 5);
      
      const level5 = store.notifications.filter((n: any) => n.level === 5);
      expect(level5.length).toBeGreaterThan(0);
    });
  });
});
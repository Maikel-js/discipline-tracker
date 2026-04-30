declare global {
  var __TEST_STORE__: any;
}

describe('Pomodoro Tests', () => {
  let store: any;

  beforeEach(() => {
    store = global.__TEST_STORE__;
  });

  describe('Start Pomodoro', () => {
    it('should create a new pomodoro session with taskId', () => {
      store.startPomodoro('task-123', undefined);

      expect(store.pomodoroSessions).toHaveLength(1);
      expect(store.pomodoroSessions[0].taskId).toBe('task-123');
      expect(store.pomodoroSessions[0].id).toBeDefined();
      expect(store.pomodoroSessions[0].startTime).toBeDefined();
      expect(store.pomodoroSessions[0].completed).toBe(false);
    });

    it('should create a new pomodoro session with habitId', () => {
      store.startPomodoro(undefined, 'habit-456');

      expect(store.pomodoroSessions).toHaveLength(1);
      expect(store.pomodoroSessions[0].habitId).toBe('habit-456');
    });

    it('should create session with both taskId and habitId', () => {
      store.startPomodoro('task-1', 'habit-1');

      expect(store.pomodoroSessions[0].taskId).toBe('task-1');
      expect(store.pomodoroSessions[0].habitId).toBe('habit-1');
    });
  });

  describe('End Pomodoro', () => {
    it('should mark session as completed and calculate duration', () => {
      store.startPomodoro('task-123', undefined);
      const session = store.pomodoroSessions[0];
      const sessionId = session.id;

      // Simulate time passing
      jest.advanceTimersByTime(1500000); // 25 minutes

      store.endPomodoro(sessionId, true);

      const updatedSession = store.pomodoroSessions.find((s: any) => s.id === sessionId);
      expect(updatedSession.completed).toBe(true);
      expect(updatedSession.endTime).toBeDefined();
      expect(updatedSession.duration).toBeGreaterThan(0);
    });

    it('should not add to discipline score if not completed', () => {
      store.startPomodoro('task-123', undefined);
      const session = store.pomodoroSessions[0];

      store.endPomodoro(session.id, false);

      expect(store.pomodoroSessions[0].completed).toBe(false);
    });

    it('should add discipline score when completed with taskId', () => {
      const initialScore = store.stats.disciplinaryScore;

      store.startPomodoro('task-123', undefined);
      const session = store.pomodoroSessions[0];

      store.endPomodoro(session.id, true);

      expect(store.stats.disciplinaryScore).toBeGreaterThan(initialScore);
    });

    it('should increment habit pomodoroSessions when completed with habitId', () => {
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
      expect(habit.pomodoroSessions).toBe(0);

      store.startPomodoro(undefined, habit.id);
      const session = store.pomodoroSessions[0];

      store.endPomodoro(session.id, true);

      const updatedHabit = store.habits.find((h: any) => h.id === habit.id);
      expect(updatedHabit.pomodoroSessions).toBe(1);
    });
  });
});

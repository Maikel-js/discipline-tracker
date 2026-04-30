declare global {
  var __TEST_STORE__: any;
}

describe('Protocols Tests', () => {
  let store: any;

  beforeEach(() => {
    store = global.__TEST_STORE__;
  });

  describe('Run Protocol', () => {
    it('should increment timesCompleted', () => {
      const protocol = store.protocols[0];
      const initialTimes = protocol.timesCompleted;

      store.runProtocol(protocol.id);

      expect(store.protocols[0].timesCompleted).toBe(initialTimes + 1);
    });

    it('should calculate effectiveness when run', () => {
      const protocol = store.protocols[0];

      store.runProtocol(protocol.id);

      expect(store.protocols[0].effectiveness).toBeGreaterThan(0);
    });
  });

  describe('Update Protocol', () => {
    it('should update protocol name', () => {
      const protocol = store.protocols[0];
      store.updateProtocol(protocol.id, { name: 'Nuevo nombre' });

      expect(store.protocols[0].name).toBe('Nuevo nombre');
    });

    it('should update protocol description', () => {
      const protocol = store.protocols[0];
      store.updateProtocol(protocol.id, { description: 'Nueva descripción' });

      expect(store.protocols[0].description).toBe('Nueva descripción');
    });

    it('should update protocol steps', () => {
      const protocol = store.protocols[0];
      const newSteps = [{ time: '07:00', action: 'Nuevo paso', duration: 45, completed: false }];
      store.updateProtocol(protocol.id, { steps: newSteps });

      expect(store.protocols[0].steps).toHaveLength(1);
      expect(store.protocols[0].steps[0].action).toBe('Nuevo paso');
    });
  });

  describe('Toggle Protocol Step', () => {
    it('should mark step as completed', () => {
      const protocol = store.protocols[0];

      store.toggleProtocolStep(protocol.id, 0);

      expect(store.protocols[0].steps[0].completed).toBe(true);
    });

    it('should unmark step when toggled again', () => {
      const protocol = store.protocols[0];

      store.toggleProtocolStep(protocol.id, 0);
      store.toggleProtocolStep(protocol.id, 0);

      expect(store.protocols[0].steps[0].completed).toBe(false);
    });
  });

  describe('Link Habit to Protocol', () => {
    it('should link habit to protocol', () => {
      const protocol = store.protocols[0];

      store.linkHabitToProtocol(protocol.id, 'habit-123');

      expect(store.protocols[0].linkedHabits).toContain('habit-123');
    });

    it('should not duplicate habit link', () => {
      const protocol = store.protocols[0];

      store.linkHabitToProtocol(protocol.id, 'habit-123');
      store.linkHabitToProtocol(protocol.id, 'habit-123');

      expect(store.protocols[0].linkedHabits.filter((h: string) => h === 'habit-123')).toHaveLength(1);
    });
  });

  describe('Link Task to Protocol', () => {
    it('should link task to protocol', () => {
      const protocol = store.protocols[0];

      store.linkTaskToProtocol(protocol.id, 'task-456');

      expect(store.protocols[0].linkedTasks).toContain('task-456');
    });
  });

  describe('Unlink Habit from Protocol', () => {
    it('should unlink habit from protocol', () => {
      const protocol = store.protocols[0];

      store.linkHabitToProtocol(protocol.id, 'habit-123');
      expect(store.protocols[0].linkedHabits).toContain('habit-123');

      store.unlinkHabitFromProtocol(protocol.id, 'habit-123');
      expect(store.protocols[0].linkedHabits).not.toContain('habit-123');
    });
  });

  describe('Unlink Task from Protocol', () => {
    it('should unlink task from protocol', () => {
      const protocol = store.protocols[0];

      store.linkTaskToProtocol(protocol.id, 'task-456');
      expect(store.protocols[0].linkedTasks).toContain('task-456');

      store.unlinkTaskFromProtocol(protocol.id, 'task-456');
      expect(store.protocols[0].linkedTasks).not.toContain('task-456');
    });
  });

  describe('Recalculate Protocol Progress', () => {
    it('should calculate progress from linked habits completionRate', () => {
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
      store.updateHabit(habit.id, { completionRate: 80 });

      const protocol = store.protocols[0];
      store.linkHabitToProtocol(protocol.id, habit.id);

      store.recalculateProtocolProgress();

      expect(store.protocols[0].progress).toBeGreaterThan(0);
    });

    it('should calculate progress from linked tasks done status', () => {
      store.addTask({
        title: 'Task test',
        priority: 'high',
        status: 'done',
        allowReset: false,
        subtasks: [],
        dependencies: [],
        reminders: []
      });

      const task = store.tasks[0];

      const protocol = store.protocols[0];
      store.linkTaskToProtocol(protocol.id, task.id);

      store.recalculateProtocolProgress();

      expect(store.protocols[0].progress).toBeGreaterThan(0);
    });

    it('should mark protocol as completed when progress reaches 100%', () => {
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

      const protocol = store.protocols[0];
      store.linkTaskToProtocol(protocol.id, task.id);
      store.linkTaskToProtocol(protocol.id, task.id); // duplicate should be filtered

      store.recalculateProtocolProgress();

      expect(store.protocols[0].status).toBe('completed');
    });
  });
});

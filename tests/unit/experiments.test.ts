declare global {
  var __TEST_STORE__: any;
}

describe('Experiments Tests', () => {
  let store: any;

  beforeEach(() => {
    store = global.__TEST_STORE__;
  });

  describe('Add Experiment', () => {
    it('should create experiment with id and dates', () => {
      store.addExperiment({
        name: 'Test Experiment',
        description: 'Test desc',
        type: 'habits',
        periodDays: 30,
        linkedHabits: ['habit-1'],
        linkedTasks: []
      });

      expect(store.experiments).toHaveLength(1);
      expect(store.experiments[0].id).toBeDefined();
      expect(store.experiments[0].startDate).toBeDefined();
      expect(store.experiments[0].endDate).toBeDefined();
      expect(store.experiments[0].progress).toBe(0);
      expect(store.experiments[0].status).toBe('active');
    });

    it('should create experiment with linked habits', () => {
      store.addExperiment({
        name: 'Habit Experiment',
        description: 'Test',
        type: 'habits',
        periodDays: 14,
        linkedHabits: ['h1', 'h2'],
        linkedTasks: []
      });

      expect(store.experiments[0].linkedHabits).toHaveLength(2);
    });

    it('should create experiment with linked tasks', () => {
      store.addExperiment({
        name: 'Task Experiment',
        description: 'Test',
        type: 'tasks',
        periodDays: 7,
        linkedHabits: [],
        linkedTasks: ['t1', 't2', 't3']
      });

      expect(store.experiments[0].linkedTasks).toHaveLength(3);
    });
  });

  describe('Update Experiment', () => {
    beforeEach(() => {
      store.addExperiment({
        name: 'Original',
        description: 'Desc',
        type: 'habits',
        periodDays: 30,
        linkedHabits: [],
        linkedTasks: []
      });
    });

    it('should update experiment name', () => {
      const exp = store.experiments[0];
      store.updateExperiment(exp.id, { name: 'Updated' });

      expect(store.experiments[0].name).toBe('Updated');
    });

    it('should update experiment status', () => {
      const exp = store.experiments[0];
      store.updateExperiment(exp.id, { status: 'paused' });

      expect(store.experiments[0].status).toBe('paused');
    });
  });

  describe('Complete Experiment', () => {
    it('should mark experiment as completed', () => {
      store.addExperiment({
        name: 'To Complete',
        description: 'Test',
        type: 'habits',
        periodDays: 30,
        linkedHabits: [],
        linkedTasks: []
      });

      const exp = store.experiments[0];
      store.completeExperiment(exp.id);

      expect(store.experiments[0].status).toBe('completed');
      expect(store.experiments[0].endDate).toBeDefined();
    });
  });

  describe('Pause/Resume Experiment', () => {
    beforeEach(() => {
      store.addExperiment({
        name: 'Pausable',
        description: 'Test',
        type: 'habits',
        periodDays: 30,
        linkedHabits: [],
        linkedTasks: []
      });
    });

    it('should pause experiment', () => {
      const exp = store.experiments[0];
      store.pauseExperiment(exp.id);

      expect(store.experiments[0].status).toBe('paused');
    });

    it('should resume experiment', () => {
      const exp = store.experiments[0];
      store.pauseExperiment(exp.id);
      expect(store.experiments[0].status).toBe('paused');

      store.resumeExperiment(exp.id);
      expect(store.experiments[0].status).toBe('active');
    });
  });

  describe('Delete Experiment', () => {
    it('should delete experiment', () => {
      store.addExperiment({
        name: 'To Delete',
        description: 'Test',
        type: 'habits',
        periodDays: 30,
        linkedHabits: [],
        linkedTasks: []
      });

      const exp = store.experiments[0];
      store.deleteExperiment(exp.id);

      expect(store.experiments).toHaveLength(0);
    });
  });

  describe('Recalculate Experiment Progress', () => {
    it('should calculate progress for habits type', () => {
      store.addHabit({
        name: 'H1',
        scheduledTime: '08:00',
        frequency: 'daily',
        priority: 'high',
        streakGoal: 7,
        category: 'health',
        status: 'pending'
      });

      const habit = store.habits[0];
      store.updateHabit(habit.id, { completionRate: 80 });

      store.addExperiment({
        name: 'Habit Exp',
        description: 'Test',
        type: 'habits',
        periodDays: 30,
        linkedHabits: [habit.id],
        linkedTasks: []
      });

      store.recalculateExperimentProgress();

      expect(store.experiments[0].progress).toBeGreaterThan(0);
    });

    it('should calculate progress for tasks type', () => {
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

      store.addExperiment({
        name: 'Task Exp',
        description: 'Test',
        type: 'tasks',
        periodDays: 30,
        linkedHabits: [],
        linkedTasks: [task.id]
      });

      store.recalculateExperimentProgress();

      expect(store.experiments[0].progress).toBe(100);
    });
  });
});

declare global {
  var __TEST_STORE__: any;
}

describe('Tasks CRUD Tests', () => {
  let store: any;

  beforeEach(() => {
    store = global.__TEST_STORE__;
  });

  describe('Create Task', () => {
    it('should create a new task', () => {
      store.addTask({
        title: 'Terminar informe',
        priority: 'high',
        status: 'todo',
        allowReset: false,
        subtasks: [],
        dependencies: [],
        reminders: []
      });

      expect(store.tasks).toHaveLength(1);
      expect(store.tasks[0].title).toBe('Terminar informe');
    });

    it('should create task with description', () => {
      store.addTask({
        title: 'Test',
        description: 'Detalles',
        priority: 'medium',
        status: 'todo',
        allowReset: false,
        subtasks: [],
        dependencies: [],
        reminders: []
      });

      expect(store.tasks[0].description).toBe('Detalles');
    });

    it('should create task with subtasks', () => {
      store.addTask({
        title: 'Test',
        priority: 'high',
        status: 'todo',
        allowReset: false,
        subtasks: [
          { id: 'sub1', title: 'Sub1', completed: false },
          { id: 'sub2', title: 'Sub2', completed: false }
        ],
        dependencies: [],
        reminders: []
      });

      expect(store.tasks[0].subtasks).toHaveLength(2);
    });
  });

  describe('Update Task', () => {
    it('should update task title', () => {
      store.addTask({ title: 'Original', priority: 'medium', status: 'todo', allowReset: false, subtasks: [], dependencies: [], reminders: [] });
      const task = store.tasks[0];
      
      store.updateTask(task.id, { title: 'Actualizado' });
      
      expect(store.tasks[0].title).toBe('Actualizado');
    });

    it('should update task priority', () => {
      store.addTask({ title: 'Test', priority: 'low', status: 'todo', allowReset: false, subtasks: [], dependencies: [], reminders: [] });
      const task = store.tasks[0];
      
      store.updateTask(task.id, { priority: 'urgent' });
      
      expect(store.tasks[0].priority).toBe('urgent');
    });
  });

  describe('Delete Task', () => {
    it('should delete a task', () => {
      store.addTask({ title: 'Test', priority: 'medium', status: 'todo', allowReset: false, subtasks: [], dependencies: [], reminders: [] });
      const task = store.tasks[0];
      
      store.deleteTask(task.id);
      
      expect(store.tasks).toHaveLength(0);
    });
  });

  describe('Move Task (Kanban)', () => {
    it('should move task to doing', () => {
      store.addTask({ title: 'Test', priority: 'high', status: 'todo', allowReset: false, subtasks: [], dependencies: [], reminders: [] });
      const task = store.tasks[0];
      
      store.moveTask(task.id, 'doing');
      
      expect(store.tasks[0].status).toBe('doing');
    });

    it('should move task to done', () => {
      store.addTask({ title: 'Test', priority: 'high', status: 'todo', allowReset: false, subtasks: [], dependencies: [], reminders: [] });
      const task = store.tasks[0];
      
      store.moveTask(task.id, 'done');
      
      expect(store.tasks[0].status).toBe('done');
    });
  });

  describe('Advance Task (State Cycle)', () => {
    it('should advance from todo to doing on first click', () => {
      store.addTask({ title: 'Test', priority: 'high', status: 'todo', allowReset: false, subtasks: [], dependencies: [], reminders: [] });
      const task = store.tasks[0];
      
      store.advanceTask(task.id);
      
      expect(store.tasks[0].status).toBe('doing');
    });

    it('should advance from doing to done on second click', () => {
      store.addTask({ title: 'Test', priority: 'high', status: 'doing', allowReset: false, subtasks: [], dependencies: [], reminders: [] });
      const task = store.tasks[0];
      
      store.advanceTask(task.id);
      
      expect(store.tasks[0].status).toBe('done');
    });

    it('should stay done when allowReset is false', () => {
      store.addTask({ title: 'Test', priority: 'high', status: 'done', allowReset: false, subtasks: [], dependencies: [], reminders: [] });
      const task = store.tasks[0];
      
      store.advanceTask(task.id);
      
      expect(store.tasks[0].status).toBe('done');
    });

    it('should reset to todo when allowReset is true', () => {
      store.addTask({ title: 'Test', priority: 'high', status: 'done', allowReset: true, subtasks: [], dependencies: [], reminders: [] });
      const task = store.tasks[0];
      
      store.advanceTask(task.id);
      
      expect(store.tasks[0].status).toBe('todo');
    });

    it('should complete full cycle todo -> doing -> done -> todo', () => {
      store.addTask({ title: 'Test', priority: 'high', status: 'todo', allowReset: true, subtasks: [], dependencies: [], reminders: [] });
      const task = store.tasks[0];
      
      store.advanceTask(task.id);
      expect(store.tasks[0].status).toBe('doing');
      
      store.advanceTask(task.id);
      expect(store.tasks[0].status).toBe('done');
      
      store.advanceTask(task.id);
      expect(store.tasks[0].status).toBe('todo');
    });
  });
});
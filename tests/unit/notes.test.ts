declare global {
  var __TEST_STORE__: any;
}

describe('Notes Tests', () => {
  let store: any;

  beforeEach(() => {
    store = global.__TEST_STORE__;
  });

  describe('Add Note', () => {
    it('should create a new note with id and createdAt', () => {
      store.addNote({
        title: 'Nota importante',
        content: 'Contenido de la nota',
        linkedHabits: [],
        linkedTasks: [],
        tags: ['trabajo']
      });

      expect(store.notes).toHaveLength(1);
      expect(store.notes[0].title).toBe('Nota importante');
      expect(store.notes[0].id).toBeDefined();
      expect(store.notes[0].createdAt).toBeDefined();
    });

    it('should create note with linked habits', () => {
      store.addNote({
        title: 'Nota con hábito',
        content: 'Contenido',
        linkedHabits: ['habit-1', 'habit-2'],
        linkedTasks: [],
        tags: []
      });

      expect(store.notes[0].linkedHabits).toHaveLength(2);
      expect(store.notes[0].linkedHabits).toContain('habit-1');
    });

    it('should create note with linked tasks', () => {
      store.addNote({
        title: 'Nota con tarea',
        content: 'Contenido',
        linkedHabits: [],
        linkedTasks: ['task-1'],
        tags: ['urgente']
      });

      expect(store.notes[0].linkedTasks).toHaveLength(1);
    });

    it('should create note with multiple tags', () => {
      store.addNote({
        title: 'Nota tags',
        content: 'Contenido',
        linkedHabits: [],
        linkedTasks: [],
        tags: ['trabajo', 'personal', 'idea']
      });

      expect(store.notes[0].tags).toHaveLength(3);
    });
  });

  describe('Update Note', () => {
    beforeEach(() => {
      store.addNote({
        title: 'Original',
        content: 'Contenido original',
        linkedHabits: [],
        linkedTasks: [],
        tags: []
      });
    });

    it('should update note title', () => {
      const note = store.notes[0];
      store.updateNote(note.id, { title: 'Actualizado' });

      expect(store.notes[0].title).toBe('Actualizado');
    });

    it('should update note content', () => {
      const note = store.notes[0];
      store.updateNote(note.id, { content: 'Nuevo contenido' });

      expect(store.notes[0].content).toBe('Nuevo contenido');
    });

    it('should update linked habits', () => {
      const note = store.notes[0];
      store.updateNote(note.id, { linkedHabits: ['new-habit'] });

      expect(store.notes[0].linkedHabits).toContain('new-habit');
    });

    it('should update tags', () => {
      const note = store.notes[0];
      store.updateNote(note.id, { tags: ['nuevo-tag'] });

      expect(store.notes[0].tags).toContain('nuevo-tag');
    });
  });

  describe('Delete Note', () => {
    it('should delete a note', () => {
      store.addNote({
        title: 'Para eliminar',
        content: 'Contenido',
        linkedHabits: [],
        linkedTasks: [],
        tags: []
      });

      const note = store.notes[0];
      store.deleteNote(note.id);

      expect(store.notes).toHaveLength(0);
    });

    it('should not affect other notes when deleting one', () => {
      store.addNote({
        title: 'Nota 1',
        content: 'Contenido 1',
        linkedHabits: [],
        linkedTasks: [],
        tags: []
      });
      store.addNote({
        title: 'Nota 2',
        content: 'Contenido 2',
        linkedHabits: [],
        linkedTasks: [],
        tags: []
      });

      const note = store.notes[0];
      store.deleteNote(note.id);

      expect(store.notes).toHaveLength(1);
      expect(store.notes[0].title).toBe('Nota 2');
    });
  });
});

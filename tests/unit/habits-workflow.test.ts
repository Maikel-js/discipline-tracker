declare global {
  var __TEST_STORE__: any;
}

describe('Habits Section - E2E Workflows', () => {
  let store: any;

  beforeEach(() => {
    store = global.__TEST_STORE__;
  });

  const baseHabit = (overrides: Record<string, any> = {}) => ({
    name: 'Leer 30 minutos',
    description: 'Lectura diaria',
    scheduledTime: '08:00',
    frequency: 'daily',
    priority: 'medium',
    streakGoal: 30,
    category: 'study',
    status: 'pending',
    ...overrides
  });

  describe('1. Agregar nuevos hábitos', () => {
    it('debe crear un hábito con todos los campos requeridos', () => {
      store.addHabit(baseHabit());

      expect(store.habits).toHaveLength(1);
      const habit = store.habits[0];

      expect(habit.id).toBeDefined();
      expect(habit.name).toBe('Leer 30 minutos');
      expect(habit.description).toBe('Lectura diaria');
      expect(habit.scheduledTime).toBe('08:00');
      expect(habit.frequency).toBe('daily');
      expect(habit.priority).toBe('medium');
      expect(habit.streakGoal).toBe(30);
      expect(habit.category).toBe('study');
      expect(habit.status).toBe('pending');
    });

    it('debe inicializar métricas en cero al crear', () => {
      store.addHabit(baseHabit());

      const habit = store.habits[0];
      expect(habit.currentStreak).toBe(0);
      expect(habit.completionRate).toBe(0);
      expect(habit.missedCount).toBe(0);
      expect(habit.rescheduleCount).toBe(0);
      expect(habit.pomodoroSessions).toBe(0);
      expect(habit.prerequisites).toEqual([]);
    });

    it('debe crear un streak inicial vinculado al hábito', () => {
      store.addHabit(baseHabit());

      const habit = store.habits[0];
      const streak = store.streaks.find((s: any) => s.habitId === habit.id);

      expect(streak).toBeDefined();
      expect(streak.currentStreak).toBe(0);
      expect(streak.longestStreak).toBe(0);
    });

    it('debe crear varios hábitos con IDs únicos', () => {
      store.addHabit(baseHabit({ name: 'Hábito 1' }));
      store.addHabit(baseHabit({ name: 'Hábito 2' }));
      store.addHabit(baseHabit({ name: 'Hábito 3' }));

      expect(store.habits).toHaveLength(3);
      const ids = store.habits.map((h: any) => h.id);
      expect(new Set(ids).size).toBe(3);
    });

    it('debe aceptar todas las categorías válidas', () => {
      const categories = ['health', 'study', 'exercise', 'work', 'personal', 'other'];
      categories.forEach((cat) => {
        store.addHabit(baseHabit({ name: `H-${cat}`, category: cat }));
      });

      expect(store.habits.map((h: any) => h.category).sort()).toEqual([...categories].sort());
    });

    it('debe aceptar todas las frecuencias válidas', () => {
      const freqs = ['daily', 'weekly', 'monthly'];
      freqs.forEach((freq) => {
        store.addHabit(baseHabit({ name: `H-${freq}`, frequency: freq }));
      });

      expect(store.habits.map((h: any) => h.frequency).sort()).toEqual([...freqs].sort());
    });
  });

  describe('2. Vincular hábitos (prerrequisitos y protocolos)', () => {
    it('debe vincular un hábito como prerrequisito de otro', () => {
      store.addHabit(baseHabit({ name: 'Despertar temprano' }));
      store.addHabit(baseHabit({ name: 'Hacer ejercicio' }));

      const prereq = store.habits[0];
      const dependent = store.habits[1];

      store.updateHabit(dependent.id, { prerequisites: [prereq.id] });

      expect(store.habits[1].prerequisites).toEqual([prereq.id]);
    });

    it('debe vincular un hábito a un protocolo existente', () => {
      store.addHabit(baseHabit({ name: 'Ejercicio matutino' }));
      const habit = store.habits[0];

      store.linkHabitToProtocol('1', habit.id);

      const protocol = store.protocols.find((p: any) => p.id === '1');
      expect(protocol.linkedHabits).toContain(habit.id);
    });

    it('no debe duplicar un hábito ya vinculado al protocolo', () => {
      store.addHabit(baseHabit({ name: 'Meditar' }));
      const habit = store.habits[0];

      store.linkHabitToProtocol('1', habit.id);
      store.linkHabitToProtocol('1', habit.id);
      store.linkHabitToProtocol('1', habit.id);

      const protocol = store.protocols.find((p: any) => p.id === '1');
      expect(protocol.linkedHabits.filter((id: string) => id === habit.id)).toHaveLength(1);
    });

    it('debe vincular múltiples hábitos a un mismo protocolo', () => {
      store.addHabit(baseHabit({ name: 'Hábito A' }));
      store.addHabit(baseHabit({ name: 'Hábito B' }));
      store.addHabit(baseHabit({ name: 'Hábito C' }));

      const [a, b, c] = store.habits;
      store.linkHabitToProtocol('2', a.id);
      store.linkHabitToProtocol('2', b.id);
      store.linkHabitToProtocol('2', c.id);

      const protocol = store.protocols.find((p: any) => p.id === '2');
      expect(protocol.linkedHabits).toHaveLength(3);
    });

    it('debe desvincular un hábito de un protocolo', () => {
      store.addHabit(baseHabit({ name: 'Hábito X' }));
      const habit = store.habits[0];

      store.linkHabitToProtocol('1', habit.id);
      expect(store.protocols[0].linkedHabits).toContain(habit.id);

      store.unlinkHabitFromProtocol('1', habit.id);
      expect(store.protocols[0].linkedHabits).not.toContain(habit.id);
    });

    it('debe vincular un hábito a una meta (goal)', () => {
      store.addHabit(baseHabit({ name: 'Estudiar inglés' }));
      const habit = store.habits[0];

      store.addGoal({
        name: 'Hablar inglés fluido',
        description: 'Meta anual',
        category: 'study',
        targetDate: '2026-12-31',
        progress: 0,
        status: 'active',
        linkedHabits: [habit.id],
        linkedTasks: []
      });

      const goal = store.goals[0];
      expect(goal.linkedHabits).toContain(habit.id);
    });
  });

  describe('3. Asignar nuevos niveles de prioridad', () => {
    it('debe cambiar la prioridad de un hábito existente', () => {
      store.addHabit(baseHabit({ priority: 'low' }));
      const habit = store.habits[0];

      store.updateHabit(habit.id, { priority: 'high' });
      expect(store.habits[0].priority).toBe('high');
    });

    it('debe aceptar los 4 niveles de prioridad (low, medium, high, urgent)', () => {
      const priorities = ['low', 'medium', 'high', 'urgent'];
      priorities.forEach((p) => {
        store.addHabit(baseHabit({ name: `H-${p}`, priority: p }));
      });

      expect(store.habits.map((h: any) => h.priority).sort()).toEqual([...priorities].sort());
    });

    it('debe permitir subir la prioridad a lo largo del tiempo', () => {
      store.addHabit(baseHabit({ priority: 'low' }));
      const habit = store.habits[0];

      store.updateHabit(habit.id, { priority: 'medium' });
      expect(store.habits[0].priority).toBe('medium');

      store.updateHabit(habit.id, { priority: 'high' });
      expect(store.habits[0].priority).toBe('high');

      store.updateHabit(habit.id, { priority: 'urgent' });
      expect(store.habits[0].priority).toBe('urgent');
    });

    it('debe permitir bajar la prioridad', () => {
      store.addHabit(baseHabit({ priority: 'urgent' }));
      const habit = store.habits[0];

      store.updateHabit(habit.id, { priority: 'low' });
      expect(store.habits[0].priority).toBe('low');
    });

    it('la prioridad debe afectar la puntuación al completar el hábito', () => {
      store.addHabit(baseHabit({ priority: 'low', name: 'Hábito baja' }));
      const habitLow = store.habits[0];

      const initialScore = store.stats.disciplinaryScore;
      store.completeHabit(habitLow.id);
      const scoreAfterLow = store.stats.disciplinaryScore;

      store.addHabit(baseHabit({ priority: 'urgent', name: 'Hábito urgente' }));
      const habitUrgent = store.habits[1];
      store.completeHabit(habitUrgent.id);
      const scoreAfterUrgent = store.stats.disciplinaryScore;

      const lowGain = scoreAfterLow - initialScore;
      const urgentGain = scoreAfterUrgent - scoreAfterLow;

      expect(urgentGain).toBeGreaterThanOrEqual(lowGain);
    });
  });

  describe('4. Arrastrar hábitos a nuevos apartados (cambio de estado)', () => {
    it('debe mantener el hábito en la sección "pendientes" por defecto', () => {
      store.addHabit(baseHabit());
      const pending = store.habits.filter((h: any) => h.status === 'pending');
      expect(pending).toHaveLength(1);
    });

    it('al completar un hábito debe moverse al apartado "completados"', () => {
      store.addHabit(baseHabit());
      const habit = store.habits[0];

      expect(store.habits.filter((h: any) => h.status === 'pending')).toHaveLength(1);
      expect(store.habits.filter((h: any) => h.status === 'completed')).toHaveLength(0);

      store.completeHabit(habit.id);

      expect(store.habits.filter((h: any) => h.status === 'pending')).toHaveLength(0);
      expect(store.habits.filter((h: any) => h.status === 'completed')).toHaveLength(1);
    });

    it('al incumplir un hábito debe moverse al apartado "incumplidos"', () => {
      store.addHabit(baseHabit());
      const habit = store.habits[0];

      store.missHabit(habit.id);

      expect(store.habits.filter((h: any) => h.status === 'missed')).toHaveLength(1);
      expect(store.habits.filter((h: any) => h.status === 'pending')).toHaveLength(0);
    });

    it('debe generar un log al mover un hábito a "completado"', () => {
      store.addHabit(baseHabit());
      const habit = store.habits[0];

      const logsBefore = store.logs.length;
      store.completeHabit(habit.id);
      const logsAfter = store.logs.length;

      expect(logsAfter).toBe(logsBefore + 1);
      const newLog = store.logs[store.logs.length - 1];
      expect(newLog.habitId).toBe(habit.id);
      expect(newLog.status).toBe('completed');
    });

    it('debe generar un log al mover un hábito a "incumplido"', () => {
      store.addHabit(baseHabit());
      const habit = store.habits[0];

      const logsBefore = store.logs.length;
      store.missHabit(habit.id);
      const logsAfter = store.logs.length;

      expect(logsAfter).toBe(logsBefore + 1);
      const newLog = store.logs[store.logs.length - 1];
      expect(newLog.habitId).toBe(habit.id);
      expect(newLog.status).toBe('missed');
    });

    it('debe permitir mover múltiples hábitos entre secciones de forma independiente', () => {
      store.addHabit(baseHabit({ name: 'A' }));
      store.addHabit(baseHabit({ name: 'B' }));
      store.addHabit(baseHabit({ name: 'C' }));

      const [a, b, c] = store.habits;

      store.completeHabit(a.id);
      store.missHabit(b.id);
      // c queda en pending

      expect(store.habits.find((h: any) => h.id === a.id).status).toBe('completed');
      expect(store.habits.find((h: any) => h.id === b.id).status).toBe('missed');
      expect(store.habits.find((h: any) => h.id === c.id).status).toBe('pending');
    });

    it('checkAndResetDaily debe existir como función ejecutable sin errores', () => {
      store.addHabit(baseHabit({ name: 'H1' }));
      expect(() => store.checkAndResetDaily()).not.toThrow();
    });

    it('checkAndResetDaily no debe modificar el estado si ya se reinició hoy', () => {
      store.addHabit(baseHabit({ name: 'H1' }));
      store.completeHabit(store.habits[0].id);

      expect(store.habits[0].status).toBe('completed');

      store.checkAndResetDaily();

      // Sigue completado porque el reset interno coincide con hoy
      expect(store.habits[0].status).toBe('completed');
    });

    it('al reprogramar un hábito se debe mantener su estado pero actualizar la hora', () => {
      store.addHabit(baseHabit({ scheduledTime: '08:00' }));
      const habit = store.habits[0];

      store.rescheduleHabit(habit.id, '10:30');

      expect(store.habits[0].scheduledTime).toBe('10:30');
      expect(store.habits[0].status).toBe('pending');
      expect(store.habits[0].rescheduleCount).toBe(1);
    });
  });
});

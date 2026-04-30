import '@testing-library/jest-dom';

const mockLocalStorage = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

Object.defineProperty(window, 'Notification', {
  value: {
    permission: 'granted',
    requestPermission: jest.fn().mockResolvedValue('granted'),
  }
});

Object.defineProperty(window, 'navigator', {
  value: {
    vibrate: jest.fn(),
    serviceWorker: {
      register: jest.fn(),
    },
  },
  writable: true,
});

jest.useFakeTimers();
jest.setSystemTime(new Date('2026-04-18T10:00:00'));

const createFreshStore = () => {
  const habits: any[] = [];
  const tasks: any[] = [];
  const logs: any[] = [];
  const notifications: any[] = [];
  const alarms: any[] = [];
  const streaks: any[] = [];
  const penalties: any[] = [];
  const pomodoroSessions: any[] = [];
  const disciplineHistory: any[] = [];
  const patternInsights: any[] = [];
  const auditLogs: any[] = [];
  const accountabilityPartners: any[] = [];
  const sensorData: any[] = [];
  const autoPenalties: any[] = [];
  const goals: any[] = [];
  const decisions: any[] = [];
  const notes: any[] = [];
  const plugins = [
    { id: 'gcal', name: 'Google Calendar', description: 'Sincroniza con Google Calendar', enabled: false, version: '1.0' },
    { id: 'whatsapp', name: 'WhatsApp Bot', description: 'Notificaciones por WhatsApp', enabled: false, version: '1.0' },
    { id: 'fit', name: 'Google Fit', description: 'Conectar con Google Fit', enabled: false, version: '1.0' },
    { id: 'telegram', name: 'Telegram Bot', description: 'Bot de Telegram', enabled: false, version: '1.0' }
  ];
  const experiments: any[] = [];
  const protocols = [
    { id: '1', name: 'Rutina Matutina', description: 'Rutina de mañana para empezar el día', steps: [{ time: '6:00', action: 'Ejercicio', duration: 30, completed: false }, { time: '6:30', action: 'Meditar', duration: 15, completed: false }, { time: '6:45', action: 'Estudiar', duration: 60, completed: false }], linkedHabits: [], linkedTasks: [], timesCompleted: 0, effectiveness: 0, progress: 0, status: 'active' as const },
    { id: '2', name: 'Deep Work', description: 'Bloque de trabajo profundo', steps: [{ time: '9:00', action: 'Bloque de trabajo profundo', duration: 120, completed: false }, { time: '11:00', action: 'Break', duration: 15, completed: false }, { time: '11:15', action: 'Continuar trabajo', duration: 120, completed: false }], linkedHabits: [], linkedTasks: [], timesCompleted: 0, effectiveness: 0, progress: 0, status: 'active' as const },
    { id: '3', name: 'Noche Productiva', description: 'Rutina nocturna productiva', steps: [{ time: '19:00', action: 'Revisión diaria', duration: 30, completed: false }, { time: '19:30', action: 'Planificación siguiente día', duration: 15, completed: false }, { time: '20:00', action: 'Aprendizaje', duration: 60, completed: false }], linkedHabits: [], linkedTasks: [], timesCompleted: 0, effectiveness: 0, progress: 0, status: 'active' as const }
  ];
  let lastResetDate = new Date().toISOString().split('T')[0];

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addHabit = (habitData: any) => {
    const id = generateId();
    const now = new Date().toISOString();
    habits.push({
      ...habitData,
      id,
      currentStreak: 0,
      completionRate: 0,
      createdAt: now,
      missedCount: 0,
      rescheduleCount: 0,
      pomodoroSessions: 0,
      prerequisites: habitData.prerequisites || []
    });

    streaks.push({
      id: generateId(),
      habitId: id,
      currentStreak: 0,
      longestStreak: 0,
      lastUpdated: now
    });
  };

  const updateHabit = (id: string, updates: any) => {
    const index = habits.findIndex(h => h.id === id);
    if (index !== -1) {
      habits[index] = { ...habits[index], ...updates };
    }
  };

  const deleteHabit = (id: string) => {
    const index = habits.findIndex(h => h.id === id);
    if (index !== -1) {
      habits.splice(index, 1);
      const filteredLogs = logs.filter((l: any) => l.habitId !== id);
      const filteredStreaks = streaks.filter((s: any) => s.habitId !== id);
      logs.length = 0;
      logs.push(...filteredLogs);
      streaks.length = 0;
      streaks.push(...filteredStreaks);
    }
  };

  const completeHabit = (id: string) => {
    const index = habits.findIndex(h => h.id === id);
    if (index !== -1) {
      const now = new Date().toISOString();
      habits[index] = {
        ...habits[index],
        status: 'completed',
        currentStreak: (habits[index].currentStreak || 0) + 1,
        lastCompleted: now
      };
      logs.push({
        id: generateId(),
        habitId: id,
        completedAt: now,
        status: 'completed'
      });
    }
  };

  const missHabit = (id: string) => {
    const index = habits.findIndex(h => h.id === id);
    if (index !== -1) {
      const now = new Date().toISOString();
      habits[index] = {
        ...habits[index],
        status: 'missed',
        currentStreak: 0
      };
      logs.push({
        id: generateId(),
        habitId: id,
        completedAt: now,
        status: 'missed'
      });
    }
  };

  const rescheduleHabit = (id: string, newTime: string) => {
    const index = habits.findIndex(h => h.id === id);
    if (index !== -1) {
      habits[index] = {
        ...habits[index],
        scheduledTime: newTime,
        rescheduleCount: (habits[index].rescheduleCount || 0) + 1
      };
      // Add audit log
      auditLogs.push({
        id: generateId(),
        habitId: id,
        habitName: habits[index].name,
        action: 'rescheduled',
        timestamp: new Date().toISOString(),
        details: `Nueva hora: ${newTime}`
      });
    }
  };

  const addTask = (taskData: any) => {
    const id = generateId();
    tasks.push({
      ...taskData,
      id,
      createdAt: new Date().toISOString(),
      pomodoroMinutes: 0,
      isBlocked: false,
      blockReason: undefined,
      prerequisites: taskData.dependencies || []
    });
  };

  const updateTask = (id: string, updates: any) => {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
    }
  };

  const deleteTask = (id: string) => {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks.splice(index, 1);
    }
  };

  const moveTask = (id: string, status: string) => {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], status };
    }
  };

  const advanceTask = (id: string) => {
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return;

    const task = tasks[index];
    const transitions: Record<string, string> = {
      'todo': 'doing',
      'doing': 'done',
      'done': task.allowReset ? 'todo' : 'done'
    };

    tasks[index] = { ...task, status: transitions[task.status] };
  };

  const checkTaskDependencies = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.dependencies.length === 0) return true;

    const deps = tasks.filter(t => task.dependencies.includes(t.id));
    const allDone = deps.every(d => d.status === 'done');

    if (!allDone && deps.length > 0) {
      const taskIndex = tasks.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          isBlocked: true,
          blockReason: `Depende de: ${deps.map(d => d.title).join(', ')}`
        };
      }
    }

    return allDone;
  };

  const addNotification = (habitId: string, level: number) => {
    notifications.push({
      id: generateId(),
      habitId,
      level,
      sentAt: new Date().toISOString(),
      acknowledged: false
    });
  };

  const acknowledgeNotification = (id: string) => {
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index] = { ...notifications[index], acknowledged: true };
    }
  };

  const clearNotifications = (habitId: string) => {
    const filtered = notifications.filter(n => n.habitId !== habitId);
    notifications.length = 0;
    notifications.push(...filtered);
  };

  const triggerAlarm = (habitId: string) => {
    alarms.push({
      id: generateId(),
      habitId,
      triggeredAt: new Date().toISOString(),
      sound: 'alarm-sound',
      vibration: true,
      repeated: 1
    });
  };

  const stopAlarm = (id: string) => {
    const index = alarms.findIndex(a => a.id === id);
    if (index !== -1) {
      alarms.splice(index, 1);
    }
  };

  const startPomodoro = (taskId?: string, habitId?: string) => {
    pomodoroSessions.push({
      id: generateId(),
      taskId,
      habitId,
      startTime: new Date().toISOString(),
      duration: 0,
      completed: false
    });
  };

  const endPomodoro = (id: string, completed: boolean) => {
    const index = pomodoroSessions.findIndex(s => s.id === id);
    if (index !== -1) {
      const session = pomodoroSessions[index];
      pomodoroSessions[index] = {
        ...session,
        endTime: new Date().toISOString(),
        duration: Math.round((new Date().getTime() - new Date(session.startTime).getTime()) / 60000),
        completed
      };

      if (completed && session.taskId) {
        // Add to discipline score
        const newScore = Math.max(0, stats.disciplinaryScore + 5);
        stats.disciplinaryScore = newScore;
      }
      if (completed && session.habitId) {
        const habitIndex = habits.findIndex(h => h.id === session.habitId);
        if (habitIndex !== -1) {
          habits[habitIndex] = {
            ...habits[habitIndex],
            pomodoroSessions: (habits[habitIndex].pomodoroSessions || 0) + 1
          };
        }
      }
    }
  };

  const addDisciplineScore = (change: number, reason: string) => {
    const newScore = Math.max(0, stats.disciplinaryScore + change);
    stats.disciplinaryScore = newScore;
    disciplineHistory.push({
      id: generateId(),
      score: newScore,
      date: new Date().toISOString(),
      reason
    });
  };

  const generatePatternInsights = () => {
    patternInsights.length = 0;
    patternInsights.push(
      { id: generateId(), type: 'bestDay', message: 'Mejor día', value: 'Lunes' },
      { id: generateId(), type: 'worstDay', message: 'Peor día', value: 'Domingo' }
    );
  };

  const detectAbandonedHabits = () => {
    return habits.filter(h => h.missedCount >= 3 || (h.currentStreak === 0 && h.completionRate < 30));
  };

  const addAuditLog = (habitId: string, habitName: string, action: string, details?: string) => {
    auditLogs.push({
      id: generateId(),
      habitId,
      habitName,
      action,
      timestamp: new Date().toISOString(),
      details
    });
  };

  const addAccountabilityPartner = (partner: any) => {
    accountabilityPartners.push({
      ...partner,
      id: generateId()
    });
  };

  const removeAccountabilityPartner = (id: string) => {
    const index = accountabilityPartners.findIndex(p => p.id === id);
    if (index !== -1) {
      accountabilityPartners.splice(index, 1);
    }
  };

  const notifyPartner = (partnerId: string, habitId: string, status: 'missed' | 'completed') => {
    const partner = accountabilityPartners.find(p => p.id === partnerId);
    if (!partner) return;
    if ((status === 'missed' && !partner.notifyOnMiss) ||
        (status === 'completed' && !partner.notifyOnComplete)) return;

    const index = accountabilityPartners.findIndex(p => p.id === partnerId);
    if (index !== -1) {
      accountabilityPartners[index] = { ...accountabilityPartners[index], lastNotified: new Date().toISOString() };
    }
  };

  const updateSensorData = (type: any, value: number) => {
    const units: Record<string, string> = {
      steps: 'pasos',
      sleep: 'horas',
      activity: 'minutos',
      heartRate: 'lpm'
    };
    sensorData.push({
      id: generateId(),
      type,
      value,
      unit: units[type] || 'unknown',
      timestamp: new Date().toISOString()
    });
  };

  const checkAutoMarkHabit = (habitId: string, type: any) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return false;

    const latestData = sensorData
      .filter(s => s.type === type)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    if (!latestData) return false;

    if (type === 'steps' && latestData.value >= 10000 && habit.category === 'exercise') {
      completeHabit(habitId);
      return true;
    }
    if (type === 'sleep' && latestData.value >= 7 && habit.category === 'health') {
      completeHabit(habitId);
      return true;
    }

    return false;
  };

  const applyAutoPenalty = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const newTask = {
      id: generateId(),
      title: `20 min extra de ${habit.name}`,
      description: `Penalización por incumplimiento de ${habit.name}`,
      priority: 'high',
      status: 'todo',
      allowReset: false,
      subtasks: [],
      dependencies: [],
      reminders: [],
      createdAt: new Date().toISOString(),
      pomodoroMinutes: 0,
      isBlocked: false,
      blockReason: undefined,
      prerequisites: []
    };
    tasks.push(newTask);

    addAuditLog(habitId, habit.name, 'penalty', 'Tarea correctiva creada');
    addDisciplineScore(-5, `Penalización: ${habit.name}`);
  };

  const togglePunishmentMode = () => {
    settings.punishmentMode = !settings.punishmentMode;
    return settings.punishmentMode;
  };

  const addGoal = (goalData: any) => {
    const id = generateId();
    goals.push({
      ...goalData,
      id,
      createdAt: new Date().toISOString()
    });
  };

  const updateGoal = (id: string, updates: any) => {
    const index = goals.findIndex(g => g.id === id);
    if (index !== -1) {
      goals[index] = { ...goals[index], ...updates };
    }
  };

  const deleteGoal = (id: string) => {
    const index = goals.findIndex(g => g.id === id);
    if (index !== -1) {
      goals.splice(index, 1);
    }
  };

  const recalculateGoalProgress = () => {
    goals.forEach(goal => {
      const linkedHabitProgress = goal.linkedHabits
        .map((habitId: string) => habits.find((h: any) => h.id === habitId)?.completionRate)
        .filter((progress: any): progress is number => progress !== undefined);

      const linkedTaskProgress = goal.linkedTasks
        .map((taskId: string) => tasks.find((t: any) => t.id === taskId)?.status === 'done' ? 100 : 0);

      const progressSources = [...linkedHabitProgress, ...linkedTaskProgress];
      if (progressSources.length === 0) return;

      const progress = Math.round(
        progressSources.reduce((total: number, value: number) => total + value, 0) / progressSources.length
      );

      const goalIndex = goals.findIndex(g => g.id === goal.id);
      if (goalIndex !== -1) {
        goals[goalIndex] = {
          ...goals[goalIndex],
          progress,
          status: goal.status === 'paused' ? 'paused' : progress >= 100 ? 'completed' : 'active'
        };
      }
    });
  };

  const addDecision = (decisionData: any) => {
    decisions.push({
      ...decisionData,
      id: generateId()
    });
  };

  const updateDecision = (id: string, updates: any) => {
    const index = decisions.findIndex(d => d.id === id);
    if (index !== -1) {
      decisions[index] = { ...decisions[index], ...updates };
    }
  };

  const deleteDecision = (id: string) => {
    const index = decisions.findIndex(d => d.id === id);
    if (index !== -1) {
      decisions.splice(index, 1);
    }
  };

  const addNote = (noteData: any) => {
    notes.push({
      ...noteData,
      id: generateId(),
      createdAt: new Date().toISOString()
    });
  };

  const updateNote = (id: string, updates: any) => {
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
      notes[index] = { ...notes[index], ...updates };
    }
  };

  const deleteNote = (id: string) => {
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
      notes.splice(index, 1);
    }
  };

  const togglePlugin = (id: string) => {
    const index = plugins.findIndex(p => p.id === id);
    if (index !== -1) {
      plugins[index] = { ...plugins[index], enabled: !plugins[index].enabled };
    }
  };

  const addExperiment = (expData: any) => {
    const now = new Date();
    const endDate = new Date(now.getTime() + expData.periodDays * 24 * 60 * 60 * 1000);
    experiments.push({
      id: generateId(),
      name: expData.name,
      description: expData.description,
      type: expData.type,
      periodDays: expData.periodDays,
      linkedHabits: expData.linkedHabits || [],
      linkedTasks: expData.linkedTasks || [],
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      progress: 0,
      status: 'active'
    });
  };

  const updateExperiment = (id: string, updates: any) => {
    const index = experiments.findIndex(e => e.id === id);
    if (index !== -1) {
      experiments[index] = { ...experiments[index], ...updates };
    }
  };

  const completeExperiment = (id: string) => {
    const index = experiments.findIndex(e => e.id === id);
    if (index !== -1) {
      experiments[index] = { ...experiments[index], status: 'completed', endDate: new Date().toISOString() };
    }
  };

  const pauseExperiment = (id: string) => {
    const index = experiments.findIndex(e => e.id === id);
    if (index !== -1) {
      experiments[index] = { ...experiments[index], status: 'paused' };
    }
  };

  const resumeExperiment = (id: string) => {
    const index = experiments.findIndex(e => e.id === id);
    if (index !== -1) {
      experiments[index] = { ...experiments[index], status: 'active' };
    }
  };

  const deleteExperiment = (id: string) => {
    const index = experiments.findIndex(e => e.id === id);
    if (index !== -1) {
      experiments.splice(index, 1);
    }
  };

  const recalculateExperimentProgress = () => {
    experiments.forEach(exp => {
      if (exp.status !== 'active') return;

      if (exp.type === 'habits') {
        const linkedHabits = habits.filter((h: any) => exp.linkedHabits.includes(h.id));
        if (linkedHabits.length === 0) return;

        const completedCount = linkedHabits.filter((h: any) => {
          const today = new Date().toISOString().split('T')[0];
          return h.lastCompleted && h.lastCompleted.startsWith(today);
        }).length;

        const overallRate = linkedHabits.reduce((acc: number, h: any) => acc + h.completionRate, 0) / linkedHabits.length;
        const newProgress = Math.round(Math.min(100, Math.max(completedCount / linkedHabits.length * 100, overallRate * 0.3)));
        const expIndex = experiments.findIndex(e => e.id === exp.id);
        if (expIndex !== -1) {
          experiments[expIndex] = { ...experiments[expIndex], progress: newProgress };
        }
      } else {
        const linkedTasks = tasks.filter((t: any) => exp.linkedTasks.includes(t.id));
        if (linkedTasks.length === 0) return;

        const completedCount = linkedTasks.filter((t: any) => t.status === 'done').length;
        const newProgress = Math.round((completedCount / linkedTasks.length) * 100);
        const expIndex = experiments.findIndex(e => e.id === exp.id);
        if (expIndex !== -1) {
          experiments[expIndex] = { ...experiments[expIndex], progress: newProgress };
        }
      }
    });
  };

  const runProtocol = (protocolId: string) => {
    const index = protocols.findIndex(p => p.id === protocolId);
    if (index !== -1) {
      const protocol = protocols[index];
      const newTimesCompleted = protocol.timesCompleted + 1;
      protocols[index] = {
        ...protocol,
        timesCompleted: newTimesCompleted,
        effectiveness: (protocol.effectiveness * protocol.timesCompleted + Math.random() * 30 + 70) / newTimesCompleted
      };
    }
  };

  const updateProtocol = (id: string, updates: any) => {
    const index = protocols.findIndex(p => p.id === id);
    if (index !== -1) {
      protocols[index] = { ...protocols[index], ...updates };
    }
  };

  const recalculateProtocolProgress = () => {
    protocols.forEach(protocol => {
      if (protocol.status !== 'active') return;

      const linkedHabits = habits.filter((h: any) => protocol.linkedHabits.includes(h.id));
      const linkedTasks = tasks.filter((t: any) => protocol.linkedTasks.includes(t.id));

      const habitProgress = linkedHabits.length > 0
        ? linkedHabits.reduce((acc: number, h: any) => acc + h.completionRate, 0) / linkedHabits.length
        : 0;

      const taskProgress = linkedTasks.length > 0
        ? (linkedTasks.filter((t: any) => t.status === 'done').length / linkedTasks.length) * 100
        : 0;

      const totalItems = protocol.linkedHabits.length + protocol.linkedTasks.length;
      const progress = totalItems > 0
        ? Math.round((habitProgress + taskProgress) / totalItems)
        : 0;

      const stepsCompleted = protocol.steps.filter((s: any) => s.completed).length;
      const stepsProgress = protocol.steps.length > 0
        ? Math.round((stepsCompleted / protocol.steps.length) * 100)
        : 0;

      const finalProgress = Math.round((progress + stepsProgress) / 2);

      const protocolIndex = protocols.findIndex(p => p.id === protocol.id);
      if (protocolIndex !== -1) {
        protocols[protocolIndex] = {
          ...protocols[protocolIndex],
          progress: finalProgress,
          status: finalProgress >= 100 ? 'completed' as const : 'active' as const
        };
      }
    });
  };

  const toggleProtocolStep = (protocolId: string, stepIndex: number) => {
    const protocolIndex = protocols.findIndex(p => p.id === protocolId);
    if (protocolIndex !== -1) {
      const steps = [...protocols[protocolIndex].steps];
      if (steps[stepIndex]) {
        steps[stepIndex] = { ...steps[stepIndex], completed: !steps[stepIndex].completed };
      }
      protocols[protocolIndex] = { ...protocols[protocolIndex], steps };
    }
  };

  const linkHabitToProtocol = (protocolId: string, habitId: string) => {
    const protocolIndex = protocols.findIndex(p => p.id === protocolId);
    if (protocolIndex !== -1) {
      const protocol = protocols[protocolIndex];
      if (!protocol.linkedHabits.includes(habitId)) {
        protocols[protocolIndex] = { ...protocol, linkedHabits: [...protocol.linkedHabits, habitId] };
      }
    }
  };

  const linkTaskToProtocol = (protocolId: string, taskId: string) => {
    const protocolIndex = protocols.findIndex(p => p.id === protocolId);
    if (protocolIndex !== -1) {
      const protocol = protocols[protocolIndex];
      if (!protocol.linkedTasks.includes(taskId)) {
        protocols[protocolIndex] = { ...protocol, linkedTasks: [...protocol.linkedTasks, taskId] };
      }
    }
  };

  const unlinkHabitFromProtocol = (protocolId: string, habitId: string) => {
    const protocolIndex = protocols.findIndex(p => p.id === protocolId);
    if (protocolIndex !== -1) {
      const protocol = protocols[protocolIndex];
      protocols[protocolIndex] = { ...protocol, linkedHabits: protocol.linkedHabits.filter((id: string) => id !== habitId) };
    }
  };

  const unlinkTaskFromProtocol = (protocolId: string, taskId: string) => {
    const protocolIndex = protocols.findIndex(p => p.id === protocolId);
    if (protocolIndex !== -1) {
      const protocol = protocols[protocolIndex];
      protocols[protocolIndex] = { ...protocol, linkedTasks: protocol.linkedTasks.filter((id: string) => id !== taskId) };
    }
  };

  const checkAndResetDaily = () => {
    const today = new Date().toISOString().split('T')[0];
    if (lastResetDate !== today) {
      habits.forEach((h: any, index: number) => {
        habits[index] = { ...h, status: 'pending' };
      });
      lastResetDate = today;
      return true;
    }
    return false;
  };

  const updateStats = () => {
    const totalHabits = habits.length;
    const today = new Date().toISOString().split('T')[0];
    const completedToday = logs.filter((l: any) =>
      l.status === 'completed' && l.completedAt.startsWith(today)
    ).length;
    const overallRate = totalHabits > 0"
      ? Math.round(habits.reduce((acc: number, h: any) => acc + (h.completionRate || 0), 0) / totalHabits)
      : 0;
    const maxStreak = Math.max(
      ...streaks.map((s: any) => s.currentStreak || 0),
      ...habits.map((h: any) => h.currentStreak || 0),
      0"
    );
    const newScore = completedToday * 10 + maxStreak * 5 + overallRate;
    const newLevel = Math.floor(newScore / 100) + 1;

    stats.totalHabits = totalHabits;
    stats.completedToday = completedToday;
    stats.completionRate = overallRate;
    stats.currentStreak = maxStreak;
    stats.disciplinaryScore = newScore;
    stats.level = newLevel;
  };

  const toggleExtremeMode = () => {
    settings.extremeMode = !settings.extremeMode;
  };

  const updateSettings = (updates: any) => {
    Object.assign(settings, updates);
    return settings;
  };

  const stats = {
    totalHabits: habits.length,
    completedToday: 0,
    completionRate: 0,
    currentStreak: 0,
    disciplinaryScore: 0,
    level: 1
  };

  const settings = {
    extremeMode: false,
    notificationsEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    punishmentMode: false,
    pomodoroLength: 25,
    breakLength: 5,
    maxReschedules: 3
  };

  return {
    habits,
    tasks,
    logs,
    notifications,
    alarms,
    streaks,
    penalties,
    stats,
    settings,
    pomodoroSessions,
    disciplineHistory,
    patternInsights,
    auditLogs,
    accountabilityPartners,
    sensorData,
    autoPenalties,
    goals,
    decisions,
    notes,
    plugins,
    experiments,
    protocols,
    lastResetDate,
    addHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    missHabit,
    rescheduleHabit,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    advanceTask,
    checkTaskDependencies,
    addNotification,
    acknowledgeNotification,
    clearNotifications,
    triggerAlarm,
    stopAlarm,
    startPomodoro,
    endPomodoro,
    addDisciplineScore,
    generatePatternInsights,
    detectAbandonedHabits,
    addAuditLog,
    addAccountabilityPartner,
    removeAccountabilityPartner,
    notifyPartner,
    updateSensorData,
    checkAutoMarkHabit,
    applyAutoPenalty,
    togglePunishmentMode,
    addGoal,
    updateGoal,
    deleteGoal,
    recalculateGoalProgress,
    addDecision,
    updateDecision,
    deleteDecision,
    addNote,
    updateNote,
    deleteNote,
    togglePlugin,
    addExperiment,
    updateExperiment,
    completeExperiment,
    pauseExperiment,
    resumeExperiment,
    deleteExperiment,
    recalculateExperimentProgress,
    runProtocol,
    updateProtocol,
    recalculateProtocolProgress,
    toggleProtocolStep,
    linkHabitToProtocol,
    linkTaskToProtocol,
    unlinkHabitFromProtocol,
    unlinkTaskFromProtocol,
    checkAndResetDaily,
    updateStats,
    toggleExtremeMode,
    updateSettings
  };
};

global.__TEST_STORE__ = createFreshStore();

beforeEach(() => {
  global.__TEST_STORE__ = createFreshStore();
});

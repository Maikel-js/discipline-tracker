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
  
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addHabit = (habitData: any) => {
    const id = generateId();
    const now = new Date().toISOString();
    habits.push({
      ...habitData,
      id,
      currentStreak: 0,
      completionRate: 0,
      createdAt: now
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
      const logFilter = (l: any) => l.habitId !== id;
      const streakFilter = (s: any) => s.habitId !== id;
      const filteredLogs: any[] = [];
      const filteredStreaks: any[] = [];
      for (let i = 0; i < logs.length; i++) { if (logFilter(logs[i])) filteredLogs.push(logs[i]); }
      for (let i = 0; i < streaks.length; i++) { if (streakFilter(streaks[i])) filteredStreaks.push(streaks[i]); }
      logs.length = 0; logs.push(...filteredLogs);
      streaks.length = 0; streaks.push(...filteredStreaks);
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

  const addTask = (taskData: any) => {
    const id = generateId();
    tasks.push({
      ...taskData,
      id,
      createdAt: new Date().toISOString(),
      allowReset: taskData.allowReset ?? false
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
    const filter = notifications.filter(n => n.habitId !== habitId);
    notifications.length = 0;
    notifications.push(...filter);
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

  const toggleExtremeMode = () => {
    return;
  };

  const updateSettings = (updates: any) => {
    return;
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
    vibrationEnabled: true
  };

  return {
    habits,
    tasks,
    logs,
    notifications,
    alarms,
    streaks,
    stats,
    settings,
    addHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    missHabit,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    advanceTask,
    addNotification,
    acknowledgeNotification,
    clearNotifications,
    triggerAlarm,
    stopAlarm,
    toggleExtremeMode,
    updateSettings
  };
};

global.__TEST_STORE__ = createFreshStore();

beforeEach(() => {
  global.__TEST_STORE__ = createFreshStore();
});
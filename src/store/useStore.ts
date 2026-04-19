import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Habit, 
  Task, 
  HabitLog, 
  Notification, 
  Alarm, 
  Streak, 
  Penalty,
  Stats,
  UserSettings,
  HabitStatus,
  TaskStatus,
  NotificationLevel,
  PomodoroSession,
  DisciplineScoreHistory,
  PatternInsight,
  AuditLog,
  AccountabilityPartner,
  SensorData,
  AutoPenalty
} from '@/types';

interface StoreState {
  habits: Habit[];
  tasks: Task[];
  logs: HabitLog[];
  notifications: Notification[];
  alarms: Alarm[];
  streaks: Streak[];
  penalties: Penalty[];
  stats: Stats;
  settings: UserSettings;
  pomodoroSessions: PomodoroSession[];
  disciplineHistory: DisciplineScoreHistory[];
  patternInsights: PatternInsight[];
  auditLogs: AuditLog[];
  accountabilityPartners: AccountabilityPartner[];
  sensorData: SensorData[];
  autoPenalties: AutoPenalty[];

  addHabit: (habit: Omit<Habit, 'id' | 'currentStreak' | 'completionRate' | 'createdAt' | 'missedCount' | 'rescheduleCount' | 'pomodoroSessions'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  completeHabit: (id: string) => void;
  missHabit: (id: string) => void;
  rescheduleHabit: (id: string, newTime: string) => void;

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'pomodoroMinutes' | 'isBlocked' | 'blockReason'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  advanceTask: (id: string) => void;
  checkTaskDependencies: (taskId: string) => boolean;

  addNotification: (habitId: string, level: NotificationLevel) => void;
  acknowledgeNotification: (id: string) => void;
  clearNotifications: (habitId: string) => void;

  triggerAlarm: (habitId: string) => void;
  stopAlarm: (id: string) => void;

  startPomodoro: (taskId?: string, habitId?: string) => void;
  endPomodoro: (id: string, completed: boolean) => void;

  addDisciplineScore: (change: number, reason: string) => void;
  generatePatternInsights: () => void;
  detectAbandonedHabits: () => Habit[];

  addAuditLog: (habitId: string, habitName: string, action: 'missed' | 'completed' | 'rescheduled' | 'penalty', details?: string) => void;

  addAccountabilityPartner: (partner: Omit<AccountabilityPartner, 'id' | 'lastNotified'>) => void;
  removeAccountabilityPartner: (id: string) => void;
  notifyPartner: (partnerId: string, habitId: string, status: 'missed' | 'completed') => void;

  updateSensorData: (type: 'steps' | 'sleep' | 'activity' | 'heartRate', value: number) => void;
  checkAutoMarkHabit: (habitId: string, type: 'steps' | 'sleep' | 'activity') => boolean;

  applyAutoPenalty: (habitId: string) => void;
  togglePunishmentMode: () => void;

  updateStats: () => void;
  toggleExtremeMode: () => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const calculateStreak = (logs: HabitLog[], habitId: string, frequency: string): number => {
  const habitLogs = logs
    .filter(l => l.habitId === habitId && l.status === 'completed')
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  
  if (habitLogs.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    const hasLog = habitLogs.some(l => l.completedAt.startsWith(dateStr));
    if (hasLog) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  
  return streak;
};

const calculateCompletionRate = (logs: HabitLog[], habitId: string): number => {
  const habitLogs = logs.filter(l => l.habitId === habitId);
  if (habitLogs.length === 0) return 0;
  
  const completed = habitLogs.filter(l => l.status === 'completed').length;
  return Math.round((completed / habitLogs.length) * 100);
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      habits: [],
      tasks: [],
      logs: [],
      notifications: [],
      alarms: [],
      streaks: [],
      penalties: [],
      stats: {
        totalHabits: 0,
        completedToday: 0,
        completionRate: 0,
        currentStreak: 0,
        disciplinaryScore: 0,
        level: 1
      },
      settings: {
        extremeMode: false,
        notificationsEnabled: true,
        soundEnabled: true,
        vibrationEnabled: true,
        punishmentMode: false,
        pomodoroLength: 25,
        breakLength: 5,
        maxReschedules: 3
      },
      pomodoroSessions: [],
      disciplineHistory: [],
      patternInsights: [],
      auditLogs: [],
      accountabilityPartners: [],
      sensorData: [],
      autoPenalties: [],

      addHabit: (habitData) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newHabit: Habit = {
          ...habitData,
          id,
          currentStreak: 0,
          completionRate: 0,
          createdAt: now,
          missedCount: 0,
          rescheduleCount: 0,
          pomodoroSessions: 0,
          prerequisites: habitData.prerequisites || []
        };
        
        const newStreak: Streak = {
          id: generateId(),
          habitId: id,
          currentStreak: 0,
          longestStreak: 0,
          lastUpdated: now
        };
        
        set(state => ({
          habits: [...state.habits, newHabit],
          streaks: [...state.streaks, newStreak]
        }));
        get().updateStats();
      },

      updateHabit: (id, updates) => {
        set(state => ({
          habits: state.habits.map(h => h.id === id ? { ...h, ...updates } : h)
        }));
      },

      deleteHabit: (id) => {
        set(state => ({
          habits: state.habits.filter(h => h.id !== id),
          logs: state.logs.filter(l => l.habitId !== id),
          streaks: state.streaks.filter(s => s.habitId !== id)
        }));
        get().updateStats();
      },

      completeHabit: (id) => {
        const now = new Date().toISOString();
        const habit = get().habits.find(h => h.id === id);
        if (!habit) return;

        const newLog: HabitLog = {
          id: generateId(),
          habitId: id,
          completedAt: now,
          status: 'completed'
        };

        const streak = calculateStreak([...get().logs, newLog], id, habit.frequency);
        const completionRate = calculateCompletionRate([...get().logs, newLog], id);

        set(state => ({
          habits: state.habits.map(h => h.id === id ? {
            ...h,
            status: 'completed' as HabitStatus,
            currentStreak: streak,
            completionRate,
            lastCompleted: now
          } : h),
          logs: [...state.logs, newLog],
          streaks: state.streaks.map(s => s.habitId === id ? {
            ...s,
            currentStreak: streak,
            longestStreak: Math.max(s.longestStreak, streak),
            lastUpdated: now
          } : s),
          notifications: state.notifications.filter(n => n.habitId !== id || n.acknowledged)
        }));
        get().updateStats();
      },

      missHabit: (id) => {
        const now = new Date().toISOString();
        const habit = get().habits.find(h => h.id === id);
        if (!habit) return;

        const newLog: HabitLog = {
          id: generateId(),
          habitId: id,
          completedAt: now,
          status: 'missed'
        };

        set(state => ({
          habits: state.habits.map(h => h.id === id ? {
            ...h,
            status: 'missed' as HabitStatus,
            currentStreak: 0,
            missedCount: (h.missedCount || 0) + 1
          } : h),
          logs: [...state.logs, newLog],
          streaks: state.streaks.map(s => s.habitId === id ? {
            ...s,
            currentStreak: 0,
            lastUpdated: now
          } : s)
        }));

        get().addAuditLog(id, habit.name, 'missed', `Racha perdida: ${habit.currentStreak}`);
        
        if (get().settings.punishmentMode) {
          get().applyAutoPenalty(id);
        }
        
        get().addDisciplineScore(-10, `Incumplido: ${habit.name}`);
        get().updateStats();
      },

      rescheduleHabit: (id, newTime) => {
        const habit = get().habits.find(h => h.id === id);
        if (!habit) return;

        const newRescheduleCount = (habit.rescheduleCount || 0) + 1;
        const maxReschedules = get().settings.maxReschedules;

        set(state => ({
          habits: state.habits.map(h => h.id === id ? {
            ...h,
            scheduledTime: newTime,
            rescheduleCount: newRescheduleCount
          } : h)
        }));

        get().addAuditLog(id, habit.name, 'rescheduled', `Nueva hora: ${newTime}`);

        if (newRescheduleCount >= maxReschedules) {
          get().addDisciplineScore(-5, `Reprogramación excesiva: ${habit.name}`);
        }
        get().updateStats();
      },

      addTask: (taskData) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newTask: Task = {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          status: taskData.status,
          allowReset: taskData.allowReset ?? false,
          subtasks: taskData.subtasks,
          dependencies: taskData.dependencies,
          reminders: taskData.reminders,
          id,
          createdAt: now,
          pomodoroMinutes: 0,
          isBlocked: false,
          blockReason: undefined,
          prerequisites: taskData.dependencies || []
        };
        set(state => ({ tasks: [...state.tasks, newTask] }));
      },

      updateTask: (id, updates) => {
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
        }));
      },

      deleteTask: (id) => {
        set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
      },

      moveTask: (id, status) => {
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, status } : t)
        }));
      },

      advanceTask: (id) => {
        const task = get().tasks.find(t => t.id === id);
        if (!task) return;

        if (task.isBlocked) return;

        const canAdvance = get().checkTaskDependencies(id);
        if (!canAdvance) return;

        const transitions: Record<TaskStatus, TaskStatus> = {
          'todo': 'doing',
          'doing': 'done',
          'done': task.allowReset ? 'todo' : 'done'
        };

        const newStatus = transitions[task.status];
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, status: newStatus } : t)
        }));
      },

      checkTaskDependencies: (taskId) => {
        const task = get().tasks.find(t => t.id === taskId);
        if (!task || task.dependencies.length === 0) return true;

        const deps = get().tasks.filter(t => task.dependencies.includes(t.id));
        const allDone = deps.every(d => d.status === 'done');
        
        if (!allDone && deps.length > 0) {
          set(state => ({
            tasks: state.tasks.map(t => t.id === taskId ? { 
              ...t, 
              isBlocked: true, 
              blockReason: `Depende de: ${deps.map(d => d.title).join(', ')}` 
            } : t)
          }));
        }
        
        return allDone;
      },

      addNotification: (habitId, level) => {
        const notification: Notification = {
          id: generateId(),
          habitId,
          level,
          sentAt: new Date().toISOString(),
          acknowledged: false
        };
        set(state => ({ notifications: [...state.notifications, notification] }));
      },

      acknowledgeNotification: (id) => {
        set(state => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, acknowledged: true } : n
          )
        }));
      },

      clearNotifications: (habitId) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.habitId !== habitId)
        }));
      },

      triggerAlarm: (habitId) => {
        const alarm: Alarm = {
          id: generateId(),
          habitId,
          triggeredAt: new Date().toISOString(),
          sound: 'alarm-sound',
          vibration: true,
          repeated: 1
        };
        set(state => ({ alarms: [...state.alarms, alarm] }));
      },

      stopAlarm: (id) => {
        set(state => ({ alarms: state.alarms.filter(a => a.id !== id) }));
      },

      updateStats: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        
        const completedToday = state.logs.filter(l => 
          l.completedAt.startsWith(today) && l.status === 'completed'
        ).length;
        
        const totalHabits = state.habits.length;
        const overallRate = totalHabits > 0 
          ? Math.round(state.habits.reduce((acc, h) => acc + h.completionRate, 0) / totalHabits)
          : 0;
        
        const maxStreak = Math.max(...state.streaks.map(s => s.currentStreak), 0);
        
        const disciplinaryScore = completedToday * 10 + maxStreak * 5 + overallRate;
        const level = Math.floor(disciplinaryScore / 100) + 1;

        set({
          stats: {
            totalHabits,
            completedToday,
            completionRate: overallRate,
            currentStreak: maxStreak,
            disciplinaryScore,
            level
          }
        });
      },

      toggleExtremeMode: () => {
        set(state => ({
          settings: { ...state.settings, extremeMode: !state.settings.extremeMode }
        }));
      },

      updateSettings: (updates) => {
        set(state => ({
          settings: { ...state.settings, ...updates }
        }));
      },

      startPomodoro: (taskId, habitId) => {
        const session: PomodoroSession = {
          id: generateId(),
          taskId,
          habitId,
          startTime: new Date().toISOString(),
          duration: 0,
          completed: false
        };
        set(state => ({ pomodoroSessions: [...state.pomodoroSessions, session] }));
      },

      endPomodoro: (id, completed) => {
        const now = new Date().toISOString();
        const currentSessions = get().pomodoroSessions;
        const session = currentSessions.find(s => s.id === id);
        
        set(state => ({
          pomodoroSessions: state.pomodoroSessions.map(s => s.id === id ? {
            ...s,
            endTime: now,
            duration: Math.round((new Date(now).getTime() - new Date(s.startTime).getTime()) / 60000),
            completed
          } : s)
        }));

        if (completed && session) {
          if (session.taskId) {
            get().addDisciplineScore(5, 'Sesión Pomodoro completada');
          }
          if (session.habitId) {
            set(state => ({
              habits: state.habits.map(h => {
                if (h.id === session.habitId) {
                  return { ...h, pomodoroSessions: (h.pomodoroSessions || 0) + 1 };
                }
                return h;
              })
            }));
          }
        }
        get().updateStats();
      },

      addDisciplineScore: (change, reason) => {
        const currentScore = get().stats.disciplinaryScore;
        const newScore = Math.max(0, currentScore + change);
        const newEntry: DisciplineScoreHistory = {
          id: generateId(),
          score: newScore,
          date: new Date().toISOString(),
          reason
        };
        set(state => ({
          stats: { ...state.stats, disciplinaryScore: newScore },
          disciplineHistory: [...state.disciplineHistory, newEntry]
        }));
      },

      generatePatternInsights: () => {
        const logs = get().logs;
        const insights: PatternInsight[] = [];

        const dayCounts = new Map<string, number>();
        const hourCounts = new Map<number, number>();

        logs.forEach(log => {
          const date = new Date(log.completedAt);
          const day = date.toLocaleDateString('es-ES', { weekday: 'long' });
          dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
          
          const hour = date.getHours();
          hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        });

        let bestDay = '', maxDayCount = 0;
        let worstDay = '', minDayCount = Infinity;
        dayCounts.forEach((count, day) => {
          if (count > maxDayCount) { maxDayCount = count; bestDay = day; }
          if (count < minDayCount) { minDayCount = count; worstDay = day; }
        });

        let bestHour = 0, maxHourCount = 0;
        hourCounts.forEach((count, hour) => {
          if (count > maxHourCount) { maxHourCount = count; bestHour = hour; }
        });

        if (bestDay) {
          insights.push({
            id: generateId(), type: 'bestDay', message: 'Mejor día de cumplimiento', value: bestDay
          });
        }
        if (worstDay && worstDay !== bestDay) {
          insights.push({
            id: generateId(), type: 'worstDay', message: 'Día con más dificultades', value: worstDay
          });
        }
        if (bestHour > 0) {
          insights.push({
            id: generateId(), type: 'bestHour', message: 'Hora más productiva', value: `${bestHour}:00`
          });
        }

        set({ patternInsights: insights });
      },

      detectAbandonedHabits: () => {
        const habits = get().habits;
        const abandoned: Habit[] = [];

        habits.forEach(habit => {
          if (habit.missedCount >= 3 || habit.currentStreak === 0 && habit.completionRate < 30) {
            abandoned.push(habit);
          }
        });

        return abandoned;
      },

      addAuditLog: (habitId, habitName, action, details) => {
        const log: AuditLog = {
          id: generateId(),
          habitId,
          habitName,
          action,
          timestamp: new Date().toISOString(),
          details
        };
        set(state => ({ auditLogs: [...state.auditLogs, log] }));
      },

      addAccountabilityPartner: (partner) => {
        const newPartner: AccountabilityPartner = {
          ...partner,
          id: generateId()
        };
        set(state => ({ accountabilityPartners: [...state.accountabilityPartners, newPartner] }));
      },

      removeAccountabilityPartner: (id) => {
        set(state => ({ 
          accountabilityPartners: state.accountabilityPartners.filter(p => p.id !== id) 
        }));
      },

      notifyPartner: (partnerId, habitId, status) => {
        const partner = get().accountabilityPartners.find(p => p.id === partnerId);
        if (!partner) return;
        if ((status === 'missed' && !partner.notifyOnMiss) || 
            (status === 'completed' && !partner.notifyOnComplete)) return;

        set(state => ({
          accountabilityPartners: state.accountabilityPartners.map(p => 
            p.id === partnerId ? { ...p, lastNotified: new Date().toISOString() } : p
          )
        }));
      },

      updateSensorData: (type, value) => {
        const data: SensorData = {
          id: generateId(),
          type,
          value,
          unit: type === 'steps' ? 'pasos' : type === 'sleep' ? 'horas' : type === 'activity' ? 'minutos' : 'lpm',
          timestamp: new Date().toISOString()
        };
        set(state => ({ sensorData: [...state.sensorData, data] }));
      },

      checkAutoMarkHabit: (habitId, type) => {
        const habit = get().habits.find(h => h.id === habitId);
        if (!habit) return false;

        const latestData = get().sensorData
          .filter(s => s.type === type)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        if (!latestData) return false;

        if (type === 'steps' && latestData.value >= 10000 && habit.category === 'exercise') {
          get().completeHabit(habitId);
          return true;
        }
        if (type === 'sleep' && latestData.value >= 7 && habit.category === 'health') {
          get().completeHabit(habitId);
          return true;
        }

        return false;
      },

      applyAutoPenalty: (habitId) => {
        const habit = get().habits.find(h => h.id === habitId);
        if (!habit) return;

        const penaltyTask: Omit<Task, 'id' | 'createdAt' | 'pomodoroMinutes' | 'isBlocked' | 'blockReason'> = {
          title: `20 min extra de ${habit.name} mañana`,
          description: `Penalización por incumplimiento de ${habit.name}`,
          priority: 'high',
          status: 'todo',
          allowReset: false,
          subtasks: [],
          dependencies: [],
          reminders: [],
          prerequisites: []
        };

        get().addTask(penaltyTask);
        get().addAuditLog(habitId, habit.name, 'penalty', 'Tarea correctiva creada');
        get().addDisciplineScore(-5, `Penalización: ${habit.name}`);
      },

      togglePunishmentMode: () => {
        set(state => ({
          settings: { ...state.settings, punishmentMode: !state.settings.punishmentMode }
        }));
      }
    }),
    {
      name: 'discipline-tracker-storage'
    }
  )
);
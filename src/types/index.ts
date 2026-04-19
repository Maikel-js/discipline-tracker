export type HabitFrequency = 'daily' | 'weekly' | 'monthly';
export type HabitStatus = 'completed' | 'pending' | 'missed';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Category = 'health' | 'study' | 'exercise' | 'work' | 'personal' | 'other';
export type TaskStatus = 'todo' | 'doing' | 'done';
export type NotificationLevel = 1 | 2 | 3 | 4 | 5;

export interface Habit {
  id: string;
  name: string;
  scheduledTime: string;
  frequency: HabitFrequency;
  priority: Priority;
  streakGoal: number;
  category: Category;
  status: HabitStatus;
  currentStreak: number;
  completionRate: number;
  createdAt: string;
  lastCompleted?: string;
  prerequisites: string[];
  missedCount: number;
  rescheduleCount: number;
  pomodoroSessions: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  status: TaskStatus;
  allowReset: boolean;
  subtasks: Subtask[];
  dependencies: string[];
  reminders: string[];
  createdAt: string;
  pomodoroMinutes: number;
  isBlocked: boolean;
  blockReason?: string;
  prerequisites: string[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  completedAt: string;
  status: HabitStatus;
}

export interface Notification {
  id: string;
  habitId: string;
  level: NotificationLevel;
  sentAt: string;
  acknowledged: boolean;
}

export interface Alarm {
  id: string;
  habitId: string;
  triggeredAt: string;
  sound: string;
  vibration: boolean;
  repeated: number;
}

export interface Streak {
  id: string;
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastUpdated: string;
}

export interface Penalty {
  id: string;
  habitId: string;
  missedCount: number;
  extraTask?: string;
  appliedAt: string;
}

export interface Stats {
  totalHabits: number;
  completedToday: number;
  completionRate: number;
  currentStreak: number;
  disciplinaryScore: number;
  level: number;
}

export interface UserSettings {
  extremeMode: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  punishmentMode: boolean;
  pomodoroLength: number;
  breakLength: number;
  maxReschedules: number;
}

export interface PomodoroSession {
  id: string;
  taskId?: string;
  habitId?: string;
  startTime: string;
  endTime?: string;
  duration: number;
  completed: boolean;
}

export interface DisciplineScoreHistory {
  id: string;
  score: number;
  date: string;
  reason: string;
}

export interface PatternInsight {
  id: string;
  type: 'bestDay' | 'worstDay' | 'bestHour' | 'worstHour' | 'trend';
  message: string;
  value: string;
}

export interface AuditLog {
  id: string;
  habitId: string;
  habitName: string;
  action: 'missed' | 'completed' | 'rescheduled' | 'penalty';
  timestamp: string;
  details?: string;
}

export interface AccountabilityPartner {
  id: string;
  name: string;
  email: string;
  notifyOnMiss: boolean;
  notifyOnComplete: boolean;
  lastNotified?: string;
}

export interface SensorData {
  id: string;
  type: 'steps' | 'sleep' | 'activity' | 'heartRate';
  value: number;
  unit: string;
  timestamp: string;
}

export interface AutoPenalty {
  id: string;
  habitId: string;
  originalHabit: string;
  extraTask: string;
  appliedAt: string;
}
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

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLogin?: string;
  profileImage?: string;
  disciplineLevel: number;
  totalScore: number;
  settings: UserSettings;
}

export interface AuthSession {
  userId: string;
  token: string;
  expiresAt: string;
}

export interface CloudSyncStatus {
  lastSynced: string;
  pendingChanges: number;
  isSyncing: boolean;
}

export interface EmailLog {
  id: string;
  userId: string;
  type: 'reminder' | 'insistent' | 'critical';
  subject: string;
  body: string;
  sentAt: string;
  opened: boolean;
}

export interface EmailPreferences {
  enabled: boolean;
  frequency: 'low' | 'medium' | 'high';
  reminderTypes: ('habit_missed' | 'task_overdue' | 'ignored')[];
}

export interface AIRecommendation {
  id: string;
  type: 'schedule' | 'habit' | 'time' | 'pattern';
  message: string;
  confidence: number;
  action?: string;
  createdAt: string;
}

export interface Prediction {
  id: string;
  habitId: string;
  probability: number;
  factors: string[];
  lastUpdated: string;
}

export interface Evidence {
  id: string;
  habitId: string;
  type: 'photo' | 'gps' | 'sensor' | 'time';
  data: string;
  verified: boolean;
  timestamp: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'streak' | 'score' | 'completion';
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  score: number;
  streak: number;
}

export interface AntiCheatAlert {
  id: string;
  userId: string;
  type: 'rapid_complete' | 'suspicious_pattern' | 'fake_completion';
  details: string;
  timestamp: string;
  resolved: boolean;
}

export interface TimeBlock {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'habit' | 'task' | 'work' | 'break';
  color: string;
  completed: boolean;
}

export interface DailyPlan {
  id: string;
  date: string;
  blocks: TimeBlock[];
  totalBlocks: number;
  completedBlocks: number;
}

export interface ConsistencyScore {
  score: number;
  level: number;
  trend: 'up' | 'down' | 'stable';
  weeklyAverage: number;
  lastUpdated: string;
}

export interface Theme {
  mode: 'dark' | 'light';
  accentColor: string;
}

export interface HistoryEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  previousValue?: string;
  newValue?: string;
}

export interface Backup {
  id: string;
  date: string;
  data: string;
  size: number;
}

export interface AnalyticsData {
  productivityTrend: number[];
  procrastinationIndex: number;
  effectiveHours: number;
  weeklyProductivity: number;
  consistencyScore: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'quarterly' | 'monthly' | 'yearly' | 'okr';
  progress: number;
  dueDate: string;
  linkedHabits: string[];
  linkedTasks: string[];
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

export interface Decision {
  id: string;
  title: string;
  options: DecisionOption[];
  matrix: 'eisenhower' | 'weighted' | 'simple';
  selectedOption?: string;
  decidedAt?: string;
  status: 'pending' | 'decided';
}

export interface DecisionOption {
  id: string;
  name: string;
  score: number;
  pros: string[];
  cons: string[];
  weight?: number;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  version: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  linkedTasks: string[];
  linkedHabits: string[];
  tags: string[];
  createdAt: string;
}

export interface GraphNode {
  id: string;
  type: 'habit' | 'task' | 'goal' | 'note' | 'decision';
  label: string;
  connections: string[];
}

export interface DigitalTwin {
  profile: {
    chronotype: 'morning' | 'night' | 'afternoon';
    decisionStyle: 'intuitive' | 'analytical' | 'balanced';
    riskTolerance: number;
    motivationType: 'reward' | 'avoidance' | 'social';
  };
  predictions: {
    id: string;
    habitId: string;
    probability: number;
    confidence: number;
  }[];
  lastUpdated: string;
}

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  type: 'habits' | 'tasks';
  periodDays: number;
  linkedHabits: string[];
  linkedTasks: string[];
  startDate: string;
  endDate?: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
}

export interface Protocol {
  id: string;
  name: string;
  description?: string;
  steps: { time: string; action: string; duration: number; completed?: boolean }[];
  linkedHabits: string[];
  linkedTasks: string[];
  timesCompleted: number;
  effectiveness: number;
  progress: number;
  status: 'active' | 'completed' | 'paused';
}

export interface EmailExperiment {
  id: string;
  experimentId: string;
  experimentName: string;
  sentAt: string;
  opened: boolean;
}
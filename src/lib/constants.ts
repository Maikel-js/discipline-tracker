export const PRIORITY_LEVELS = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4
} as const;

export const FREQUENCY = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly'
} as const;

export const TASK_STATUS = {
  todo: 'todo',
  doing: 'doing',
  done: 'done'
} as const;

export const NOTIFICATION_LEVELS = {
  reminder: 1,
  urgent: 2,
  repetition: 3,
  alarm: 4,
  extreme: 5
} as const;

export const COLORS = {
  purple: '#8b5cf6',
  green: '#22c55e',
  blue: '#3b82f6',
  red: '#ef4444',
  yellow: '#eab308',
  orange: '#f97316',
  cyan: '#06b6d4'
} as const;

export const RETENTION_MS = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000
} as const;

export const STORAGE_KEYS = {
  habits: 'discipline_habits',
  tasks: 'discipline_tasks',
  settings: 'discipline_settings',
  stats: 'discipline_stats',
  logs: 'discipline_logs',
  users: 'discipline_users',
  session: 'discipline_session',
  history: 'discipline_history'
} as const;
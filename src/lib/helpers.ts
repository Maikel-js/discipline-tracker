export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

export function getDateKey(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function calculateStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;
  
  const sorted = [...completedDates].sort().reverse();
  let streak = 0;
  let currentDate = new Date();
  
  for (const dateStr of sorted) {
    const date = new Date(dateStr);
    const diffDays = Math.floor(
      (currentDate.getTime() - date.getTime()) / (24 * 60 * 60 * 1000)
    );
    
    if (diffDays <= 1) {
      streak++;
      currentDate = date;
    } else {
      break;
    }
  }
  
  return streak;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const groupKey = String(item[key]);
    (acc[groupKey] = acc[groupKey] || []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}
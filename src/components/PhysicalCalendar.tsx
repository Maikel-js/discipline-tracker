'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, ListTodo, CalendarDays } from 'lucide-react';

export default function PhysicalCalendar() {
  const { habits, tasks, logs } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { locale: es });
  const calendarEnd = endOfWeek(monthEnd, { locale: es });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const habitsByDate = useMemo(() => {
    const map: Record<string, { completed: number; total: number; missed: number }> = {};
    habits.forEach(h => {
      const dateKey = format(new Date(h.createdAt), 'yyyy-MM-dd');
      if (!map[dateKey]) map[dateKey] = { completed: 0, total: 0, missed: 0 };
      map[dateKey].total++;
      if (h.status === 'completed') map[dateKey].completed++;
      if (h.status === 'missed') map[dateKey].missed++;
    });
    logs.forEach(log => {
      const dateKey = log.completedAt.slice(0, 10);
      if (!map[dateKey]) map[dateKey] = { completed: 0, total: 0, missed: 0 };
      if (log.status === 'completed') map[dateKey].completed++;
      if (log.status === 'missed') map[dateKey].missed++;
    });
    return map;
  }, [habits, logs]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.dueDate) {
        const dateKey = t.dueDate.slice(0, 10);
        map[dateKey] = (map[dateKey] || 0) + 1;
      }
    });
    return map;
  }, [tasks]);

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;

  const dayDetailItems = useMemo(() => {
    if (!selectedDateStr) return [];
    const selHabits = habits.filter(h => format(new Date(h.createdAt), 'yyyy-MM-dd') === selectedDateStr);
    const selLogs = logs.filter(l => l.completedAt.startsWith(selectedDateStr));
    const selTasks = tasks.filter(t => t.dueDate?.startsWith(selectedDateStr));

    const items: { icon: React.ReactNode; label: string; color: string }[] = [];
    selLogs.forEach(log => {
      const habit = habits.find(h => h.id === log.habitId);
      if (habit) {
        items.push({
          icon: log.status === 'completed' ? <CheckCircle size={14} /> : <XCircle size={14} />,
          label: `${log.status === 'completed' ? 'Completado' : 'Fallado'}: ${habit.name}`,
          color: log.status === 'completed' ? 'text-green-400' : 'text-red-400'
        });
      }
    });
    selHabits.forEach(h => {
      if (!selLogs.find(l => l.habitId === h.id)) {
        items.push({
          icon: <CheckCircle size={14} />,
          label: `Programado: ${h.name}`,
          color: 'text-gray-400'
        });
      }
    });
    selTasks.forEach(t => {
      items.push({
        icon: <ListTodo size={14} />,
        label: `Tarea: ${t.title}`,
        color: 'text-blue-400'
      });
    });
    return items;
  }, [selectedDateStr, habits, logs, tasks]);

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <CalendarDays className="text-blue-400" />
          Calendario
        </h2>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-gray-900/50 border-b border-gray-700">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-lg font-bold text-white capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h3>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-700">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayData = habitsByDate[dateKey];
            const taskCount = tasksByDate[dateKey] || 0;
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);
            const hasCompleted = dayData && dayData.completed > 0;
            const hasMissed = dayData && dayData.missed > 0;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={`p-1.5 md:p-2 border-b border-r border-gray-700/50 min-h-[56px] md:min-h-[72px] relative transition-colors ${
                  !isCurrentMonth ? 'bg-gray-900/30' : ''
                } ${
                  isSelected ? 'bg-blue-900/30 ring-2 ring-inset ring-blue-500' : 'hover:bg-gray-700/50'
                }`}
              >
                <span className={`text-xs md:text-sm font-medium ${
                  isTodayDate ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center mx-auto' :
                  isSelected ? 'text-blue-300' :
                  !isCurrentMonth ? 'text-gray-600' :
                  'text-gray-300'
                }`}>
                  {format(day, 'd')}
                </span>
                <div className="flex justify-center gap-0.5 mt-1">
                  {hasCompleted && (
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500" title={`${dayData?.completed} completados`} />
                  )}
                  {hasMissed && (
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500" title={`${dayData?.missed} fallados`} />
                  )}
                  {taskCount > 0 && (
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500" title={`${taskCount} tareas`} />
                  )}
                </div>
                {dayData && dayData.total > 0 && (
                  <div className="hidden md:flex mt-1 justify-center">
                    <div className="w-8 h-1 rounded-full bg-gray-700 overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${Math.round((dayData.completed / dayData.total) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
          <h3 className="text-lg font-bold text-white mb-3 capitalize">
            {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
          </h3>
          {dayDetailItems.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">Sin actividad registrada</p>
          ) : (
            <div className="space-y-2">
              {dayDetailItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-900/50 rounded-lg">
                  <span className={item.color}>{item.icon}</span>
                  <span className={`text-sm ${item.color}`}>{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

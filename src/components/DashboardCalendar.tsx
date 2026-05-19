'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import type { CalendarEvent } from '@/types';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, ListTodo, CalendarDays, Plus, X, Edit2, Trash2 } from 'lucide-react';

export default function DashboardCalendar() {
  const { habits, tasks, logs, events, addEvent, updateEvent, deleteEvent } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({ title: '', time: '', description: '', color: '#22C55E' });

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

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;

  const dayDetailItems = useMemo(() => {
    if (!selectedDateStr) return [];
    const selLogs = logs.filter(l => l.completedAt.startsWith(selectedDateStr));
    const selTasks = tasks.filter(t => t.dueDate?.startsWith(selectedDateStr));
    const selEvents = events.filter(e => e.date === selectedDateStr);

    const items: { icon: React.ReactNode; label: string; color: string; type: string; id?: string }[] = [];
    selLogs.forEach(log => {
      const habit = habits.find(h => h.id === log.habitId);
      if (habit) {
        items.push({
          icon: log.status === 'completed' ? <CheckCircle size={14} /> : <XCircle size={14} />,
          label: `${log.status === 'completed' ? 'Completado' : 'Fallado'}: ${habit.name}`,
          color: log.status === 'completed' ? 'text-green-400' : 'text-red-400',
          type: 'habit'
        });
      }
    });
    selTasks.forEach(t => {
      items.push({
        icon: <ListTodo size={14} />,
        label: `Tarea: ${t.title}`,
        color: 'text-blue-400',
        type: 'task'
      });
    });
    selEvents.forEach(e => {
      items.push({
        icon: <CalendarDays size={14} style={{ color: e.color }} />,
        label: `${e.time ? e.time + ' - ' : ''}${e.title}`,
        color: 'text-yellow-400',
        type: 'event',
        id: e.id
      });
    });
    return items;
  }, [selectedDateStr, habits, logs, tasks, events]);

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const openNewEvent = () => {
    setEditingEvent(null);
    setEventForm({ title: '', time: '', description: '', color: '#22C55E' });
    setShowEventModal(true);
  };

  const openEditEvent = (id: string) => {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    setEditingEvent(id);
    setEventForm({ title: ev.title, time: ev.time || '', description: ev.description || '', color: ev.color });
    setShowEventModal(true);
  };

  const saveEvent = () => {
    if (!eventForm.title.trim() || !selectedDateStr) return;
    if (editingEvent) {
      updateEvent(editingEvent, {
        title: eventForm.title,
        time: eventForm.time || undefined,
        description: eventForm.description || undefined,
        color: eventForm.color
      });
    } else {
      addEvent({
        title: eventForm.title,
        date: selectedDateStr,
        time: eventForm.time || undefined,
        description: eventForm.description || undefined,
        color: eventForm.color
      });
    }
    setShowEventModal(false);
  };

  const handleDeleteEvent = (id: string) => {
    deleteEvent(id);
  };

  const eventColors = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <CalendarDays className="text-blue-400" size={18} />
          Calendario
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-300 font-medium capitalize min-w-[120px] text-center">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekDays.map(d => (
          <div key={d} className="text-center text-[10px] text-gray-500 font-bold py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, idx) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayData = habitsByDate[dateKey];
          const taskCount = tasksByDate[dateKey] || 0;
          const eventCount = (eventsByDate[dateKey] || []).length;
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);
          const hasCompleted = dayData && dayData.completed > 0;
          const hasMissed = dayData && dayData.missed > 0;

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(day)}
              className={`text-center py-1.5 rounded text-xs relative transition-colors ${
                !isCurrentMonth ? 'opacity-20' : ''
              } ${
                isSelected ? 'ring-1 ring-blue-500 bg-blue-900/20' : 'hover:bg-gray-700/50'
              }`}
            >
              <span className={`font-medium ${
                isTodayDate ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center mx-auto' :
                isSelected ? 'text-blue-300' :
                isCurrentMonth ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {format(day, 'd')}
              </span>
              <div className="flex justify-center gap-0.5 mt-0.5">
                {hasCompleted && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                {hasMissed && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                {taskCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                {eventCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />}
              </div>
              {(dayData && dayData.total > 0) && (
                <div className="text-[8px] text-green-400 leading-none mt-0.5">{dayData.completed}/{dayData.total}</div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Hecho</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Fallado</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Tareas</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Eventos</div>
        </div>
      </div>

      {selectedDate && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-white capitalize">
              {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
            </h4>
            <button
              onClick={openNewEvent}
              className="flex items-center gap-1 px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs font-bold transition-colors"
            >
              <Plus size={12} />
              Evento
            </button>
          </div>
          {dayDetailItems.length === 0 ? (
            <p className="text-gray-500 text-xs py-2 text-center">Sin actividad registrada</p>
          ) : (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {dayDetailItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-2 p-1.5 bg-gray-900/30 rounded">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0">{item.icon}</span>
                    <span className={`text-xs truncate ${item.color}`}>{item.label}</span>
                  </div>
                  {item.type === 'event' && item.id && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditEvent(item.id!); }}
                        className="p-0.5 hover:bg-gray-700 rounded text-gray-500 hover:text-white transition"
                      >
                        <Edit2 size={10} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteEvent(item.id!); }}
                        className="p-0.5 hover:bg-gray-700 rounded text-gray-500 hover:text-red-400 transition"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowEventModal(false)}>
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-white">{editingEvent ? 'Editar Evento' : 'Nuevo Evento'}</h4>
              <button onClick={() => setShowEventModal(false)} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Título</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Nombre del evento"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Hora (opcional)</label>
                <input
                  type="time"
                  value={eventForm.time}
                  onChange={e => setEventForm(f => ({ ...f, time: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Descripción (opcional)</label>
                <input
                  type="text"
                  value={eventForm.description}
                  onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Descripción"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Color</label>
                <div className="flex gap-1.5">
                  {eventColors.map(c => (
                    <button
                      key={c}
                      onClick={() => setEventForm(f => ({ ...f, color: c }))}
                      className={`w-6 h-6 rounded-full transition-all ${eventForm.color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-800 scale-110' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEvent}
                  className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-bold transition-colors"
                >
                  {editingEvent ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Download, TrendingUp, Target, CheckCircle, XCircle, Clock, Calendar, BarChart3 } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function StatsDashboard() {
  const { habits, tasks, logs, stats, disciplineHistory, goals, protocols } = useStore();

  const completionData = useMemo(() => {
    const completed = habits.filter(h => h.status === 'completed').length;
    const pending = habits.filter(h => h.status === 'pending').length;
    const missed = habits.filter(h => h.status === 'missed').length;
    return [
      { name: 'Completados', value: completed, color: '#22c55e' },
      { name: 'Pendientes', value: pending, color: '#f59e0b' },
      { name: 'Fallados', value: missed, color: '#ef4444' }
    ].filter(d => d.value > 0);
  }, [habits]);

  const weeklyData = useMemo(() => {
    const last7 = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
    return last7.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayLogs = logs.filter(l => l.completedAt.startsWith(dayStr));
      const dayHabits = habits.filter(h => h.createdAt.startsWith(dayStr));
      return {
        date: format(day, 'EEE', { locale: es }),
        completados: dayLogs.filter(l => l.status === 'completed').length,
        fallados: dayLogs.filter(l => l.status === 'missed').length,
        nuevos: dayHabits.length
      };
    });
  }, [logs, habits]);

  const scoreTrend = useMemo(() => {
    const last14 = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() });
    return last14.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayScores = disciplineHistory.filter(h => h.date.startsWith(dayStr));
      const avgScore = dayScores.length > 0
        ? Math.round(dayScores.reduce((acc, s) => acc + s.score, 0) / dayScores.length)
        : null;
      return {
        date: format(day, 'dd/MM'),
        puntuacion: avgScore || 0
      };
    });
  }, [disciplineHistory]);

  const categoryData = useMemo(() => {
    const cats: Record<string, { total: number; completed: number }> = {};
    habits.forEach(h => {
      if (!cats[h.category]) cats[h.category] = { total: 0, completed: 0 };
      cats[h.category].total++;
      if (h.status === 'completed') cats[h.category].completed++;
    });
    return Object.entries(cats).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      total: data.total,
      completados: data.completed,
      tasa: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
    }));
  }, [habits]);

  const taskStatusData = useMemo(() => {
    const todo = tasks.filter(t => t.status === 'todo').length;
    const doing = tasks.filter(t => t.status === 'doing').length;
    const done = tasks.filter(t => t.status === 'done').length;
    return [
      { name: 'Por Hacer', value: todo, color: '#6b7280' },
      { name: 'En Progreso', value: doing, color: '#3b82f6' },
      { name: 'Completadas', value: done, color: '#22c55e' }
    ].filter(d => d.value > 0);
  }, [tasks]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('Discipline Tracker - Reporte de Rendimiento', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${format(new Date(), "d 'de' MMMM yyyy, HH:mm", { locale: es })}`, pageWidth / 2, 28, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Resumen General', 14, 40);

    (doc as any).autoTable({
      startY: 45,
      head: [['Métrica', 'Valor']],
      body: [
        ['Puntuación Disciplinaria', `${stats.disciplinaryScore} pts`],
        ['Nivel', `${stats.level}`],
        ['Racha Actual', `${stats.currentStreak} días`],
        ['Tasa de Completado', `${stats.completionRate}%`],
        ['Hábitos Completados Hoy', `${stats.completedToday}`],
        ['Total de Hábitos', `${stats.totalHabits}`],
        ['Total de Tareas', `${tasks.length}`],
        ['Objetivos Activos', `${goals.filter(g => g.status === 'active').length}`],
        ['Protocolos Activos', `${protocols.filter(p => p.status === 'active').length}`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('Estado de Hábitos', 14, finalY);

    const habitData = habits.map(h => [
      h.name,
      h.category,
      h.status === 'completed' ? 'Completado' : h.status === 'missed' ? 'Fallado' : 'Pendiente',
      `${h.currentStreak} días`,
      `${h.completionRate}%`
    ]);

    (doc as any).autoTable({
      startY: finalY + 5,
      head: [['Hábito', 'Categoría', 'Estado', 'Racha', 'Tasa']],
      body: habitData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 9 }
    });

    const finalY2 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('Estado de Tareas', 14, finalY2);

    const taskData = tasks.map(t => [
      t.title,
      t.priority,
      t.status === 'done' ? 'Completada' : t.status === 'doing' ? 'En Progreso' : 'Por Hacer',
      t.dueDate ? format(new Date(t.dueDate), 'dd/MM/yyyy') : 'N/A'
    ]);

    (doc as any).autoTable({
      startY: finalY2 + 5,
      head: [['Tarea', 'Prioridad', 'Estado', 'Vencimiento']],
      body: taskData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 }
    });

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Discipline Tracker - discipline-tracker-rho.vercel.app', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    doc.save(`reporte-disciplina-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="text-blue-400" />
          Analytics Avanzado
        </h2>
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
        >
          <Download size={18} />
          Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Puntuación', value: stats.disciplinaryScore, icon: TrendingUp, color: 'text-blue-400' },
          { label: 'Racha Actual', value: `${stats.currentStreak}d`, icon: Target, color: 'text-green-400' },
          { label: 'Tasa Completado', value: `${stats.completionRate}%`, icon: CheckCircle, color: 'text-purple-400' },
          { label: 'Hábitos Hoy', value: `${stats.completedToday}/${stats.totalHabits}`, icon: Calendar, color: 'text-yellow-400' }
        ].map((stat, i) => (
          <div key={i} className="bg-gray-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={18} className={stat.color} />
              <span className="text-gray-400 text-sm">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded-xl">
          <h3 className="text-white font-bold mb-4">Distribución de Hábitos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={completionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {completionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl">
          <h3 className="text-white font-bold mb-4">Estado de Tareas</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-xl">
        <h3 className="text-white font-bold mb-4">Progreso Semanal</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
            <Legend />
            <Bar dataKey="completados" fill="#22c55e" name="Completados" />
            <Bar dataKey="fallados" fill="#ef4444" name="Fallados" />
            <Bar dataKey="nuevos" fill="#3b82f6" name="Nuevos" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-800 p-4 rounded-xl">
        <h3 className="text-white font-bold mb-4">Tendencia de Puntuación (14 días)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={scoreTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
            <Legend />
            <Line type="monotone" dataKey="puntuacion" stroke="#8b5cf6" strokeWidth={2} name="Puntuación" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-800 p-4 rounded-xl">
        <h3 className="text-white font-bold mb-4">Rendimiento por Categoría</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9ca3af" />
            <YAxis dataKey="name" type="category" stroke="#9ca3af" width={80} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
            <Legend />
            <Bar dataKey="total" fill="#6b7280" name="Total" />
            <Bar dataKey="completados" fill="#22c55e" name="Completados" />
            <Bar dataKey="tasa" fill="#f59e0b" name="Tasa %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded-xl">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Target size={18} className="text-blue-400" />
            Objetivos ({goals.length})
          </h3>
          <div className="space-y-3">
            {goals.slice(0, 5).map(goal => (
              <div key={goal.id} className="bg-gray-700 p-3 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-white font-medium">{goal.title}</span>
                  <span className={`text-xs px-2 py-1 rounded ${goal.status === 'completed' ? 'bg-green-900/50 text-green-400' : goal.status === 'paused' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-blue-900/50 text-blue-400'}`}>
                    {goal.status}
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${goal.progress}%` }} />
                </div>
                <div className="text-xs text-gray-400 mt-1">{goal.progress}% completado</div>
              </div>
            ))}
            {goals.length === 0 && (
              <div className="text-center text-gray-500 py-4">No hay objetivos creados</div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Clock size={18} className="text-purple-400" />
            Protocolos ({protocols.length})
          </h3>
          <div className="space-y-3">
            {protocols.slice(0, 5).map(protocol => (
              <div key={protocol.id} className="bg-gray-700 p-3 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-white font-medium">{protocol.name}</span>
                  <span className="text-xs text-gray-400">{protocol.timesCompleted} ejecuciones</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${protocol.progress}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{protocol.progress}% progreso</span>
                  <span>{protocol.effectiveness.toFixed(1)}% efectividad</span>
                </div>
              </div>
            ))}
            {protocols.length === 0 && (
              <div className="text-center text-gray-500 py-4">No hay protocolos creados</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

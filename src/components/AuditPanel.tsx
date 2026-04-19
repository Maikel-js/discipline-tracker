'use client';

import { useStore } from '@/store/useStore';
import { AlertTriangle, CheckCircle, XCircle, Clock, BarChart3, Trash2 } from 'lucide-react';

export default function AuditPanel() {
  const { auditLogs, habits, detectAbandonedHabits, patternInsights, disciplineHistory } = useStore();
  const abandonedHabits = detectAbandonedHabits();
  const recentLogs = [...auditLogs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 20);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'completed': return <CheckCircle size={14} className="text-green-500" />;
      case 'missed': return <XCircle size={14} className="text-red-500" />;
      case 'rescheduled': return <Clock size={14} className="text-yellow-500" />;
      case 'penalty': return <AlertTriangle size={14} className="text-orange-500" />;
      default: return null;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'completed': return 'Completado';
      case 'missed': return 'Incumplido';
      case 'rescheduled': return 'Reprogramado';
      case 'penalty': return 'Penalización';
      default: return action;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Trash2 size={18} />
          Historial de Auditoría
        </h3>
        
        {abandonedHabits.length > 0 && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 text-sm mb-2">
              <AlertTriangle size={14} />
              Hábitos en riesgo de abandono
            </div>
            <div className="space-y-1">
              {abandonedHabits.map(h => (
                <div key={h.id} className="text-sm text-gray-300">
                  • {h.name} (incumplidos: {h.missedCount})
                </div>
              ))}
            </div>
          </div>
        )}

        {recentLogs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No hay registros de auditoría
          </div>
        ) : (
          <div className="space-y-2">
            {recentLogs.map(log => (
              <div key={log.id} className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg">
                {getActionIcon(log.action)}
                <div className="flex-1">
                  <div className="text-sm text-white">{log.habitName}</div>
                  <div className="text-xs text-gray-500">{log.details}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(log.timestamp)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {patternInsights.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={18} />
            Insights de Patrones
          </h3>
          <div className="grid gap-2">
            {patternInsights.map(insight => (
              <div key={insight.id} className="p-3 bg-gray-800/50 rounded-lg">
                <div className="text-sm text-gray-400">{insight.message}</div>
                <div className="text-lg font-medium text-white">{insight.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {disciplineHistory.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Historial de Puntuación
          </h3>
          <div className="space-y-2">
            {disciplineHistory.slice(-10).reverse().map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                <div>
                  <div className="text-sm text-white">{entry.reason}</div>
                  <div className="text-xs text-gray-500">{formatDate(entry.date)}</div>
                </div>
                <div className={`text-sm font-medium ${entry.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {entry.score > 0 ? '+' : ''}{entry.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
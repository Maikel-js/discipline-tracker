import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { Protocol } from '@/types';

export default function Protocols() {
  const {
    protocols, runProtocol,
    toggleProtocolStep, linkHabitToProtocol, linkTaskToProtocol,
    unlinkHabitFromProtocol, unlinkTaskFromProtocol, habits, tasks
  } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggleStep = (protocolId: string, stepIndex: number) => {
    toggleProtocolStep(protocolId, stepIndex);
  };

  const handleLinkHabit = (protocolId: string, habitId: string) => {
    const protocol = protocols.find(p => p.id === protocolId);
    if (protocol?.linkedHabits.includes(habitId)) {
      unlinkHabitFromProtocol(protocolId, habitId);
    } else {
      linkHabitToProtocol(protocolId, habitId);
    }
  };

  const handleLinkTask = (protocolId: string, taskId: string) => {
    const protocol = protocols.find(p => p.id === protocolId);
    if (protocol?.linkedTasks.includes(taskId)) {
      unlinkTaskFromProtocol(protocolId, taskId);
    } else {
      linkTaskToProtocol(protocolId, taskId);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Protocolos</h2>

      {protocols.map(protocol => (
        <div key={protocol.id} className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white">{protocol.name}</h3>
              {protocol.description && (
                <p className="text-gray-400 text-sm mt-1">{protocol.description}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => runProtocol(protocol.id)}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
              >
                Ejecutar
              </button>
              <button
                onClick={() => setExpandedId(expandedId === protocol.id ? null : protocol.id)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
              >
                {expandedId === protocol.id ? 'Ocultar' : 'Gestionar'}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Progreso General</span>
              <span>{protocol.progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${protocol.progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 mb-3">
            <div>
              <span className="font-semibold text-white">{protocol.timesCompleted}</span> ejecuciones
            </div>
            <div>
              <span className="font-semibold text-white">{protocol.effectiveness.toFixed(1)}%</span> efectividad
            </div>
            <div>
              <span className="font-semibold text-white">{protocol.status}</span> estado
            </div>
          </div>

          {expandedId === protocol.id && (
            <div className="space-y-4 border-t border-gray-700 pt-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Pasos del Protocolo</h4>
                <div className="space-y-2">
                  {protocol.steps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-700 p-3 rounded cursor-pointer hover:bg-gray-600 transition"
                      onClick={() => handleToggleStep(protocol.id, index)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={step.completed || false}
                          onChange={() => {}}
                          className="rounded"
                        />
                        <div>
                          <div className="text-white font-medium">{step.action}</div>
                          <div className="text-gray-400 text-sm">{step.time} - {step.duration} min</div>
                        </div>
                      </div>
                      {step.completed && (
                        <span className="text-green-400 text-sm">✓ Completado</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Vincular Hábitos</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {habits.map(habit => (
                    <label key={habit.id} className="flex items-center space-x-2 text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={protocol.linkedHabits.includes(habit.id)}
                        onChange={() => handleLinkHabit(protocol.id, habit.id)}
                        className="rounded"
                      />
                      <span>{habit.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Vincular Tareas</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {tasks.map(task => (
                    <label key={task.id} className="flex items-center space-x-2 text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={protocol.linkedTasks.includes(task.id)}
                        onChange={() => handleLinkTask(protocol.id, task.id)}
                        className="rounded"
                      />
                      <span>{task.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {protocol.linkedHabits.map(habitId => {
                  const habit = habits.find(h => h.id === habitId);
                  return habit ? (
                    <span key={habitId} className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                      {habit.name}
                    </span>
                  ) : null;
                })}
                {protocol.linkedTasks.map(taskId => {
                  const task = tasks.find(t => t.id === taskId);
                  return task ? (
                    <span key={taskId} className="text-xs bg-orange-600 text-white px-2 py-1 rounded">
                      {task.title}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

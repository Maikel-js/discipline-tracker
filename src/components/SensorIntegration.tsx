'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Activity, Moon, Footprints, Heart, Smartphone, CheckCircle } from 'lucide-react';

export default function SensorIntegration() {
  const { updateSensorData, checkAutoMarkHabit, sensorData, habits } = useStore();
  const [simulating, setSimulating] = useState(false);
  const [lastAutoMark, setLastAutoMark] = useState<string | null>(null);

  const simulateSensorData = async (type: 'steps' | 'sleep' | 'activity') => {
    setSimulating(true);
    
    let value: number;
    switch (type) {
      case 'steps':
        value = Math.floor(Math.random() * 5000) + 8000;
        break;
      case 'sleep':
        value = Math.floor(Math.random() * 4) + 6;
        break;
      case 'activity':
        value = Math.floor(Math.random() * 60) + 30;
        break;
    }
    
    updateSensorData(type, value);

    habits
      .filter(h => h.category === (type === 'steps' || type === 'activity' ? 'exercise' : 'health'))
      .forEach(h => {
        if (checkAutoMarkHabit(h.id, type)) {
          setLastAutoMark(`${h.name} marcado automáticamente por ${type}`);
        }
      });

    setSimulating(false);
  };

  const latestData = (type: string) => {
    const data = sensorData
      .filter(s => s.type === type)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    return data;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const stepsData = latestData('steps');
      const sleepData = latestData('sleep');
      const activityData = latestData('activity');

      habits
        .filter(h => h.category === 'exercise' || h.category === 'health')
        .forEach(h => {
          if (stepsData && checkAutoMarkHabit(h.id, 'steps')) {
            setLastAutoMark(`${h.name} marcado automáticamente`);
          }
          if (sleepData && checkAutoMarkHabit(h.id, 'sleep')) {
            setLastAutoMark(`${h.name} marcado automáticamente`);
          }
          if (activityData && checkAutoMarkHabit(h.id, 'activity')) {
            setLastAutoMark(`${h.name} marcado automáticamente`);
          }
        });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Integración de Sensores</h3>

      <div className="text-xs text-gray-500 mb-4">
        Simula datos de sensores para marcar hábitos automáticamente
      </div>

      {lastAutoMark && (
        <div className="flex items-center gap-2 p-2 bg-green-900/30 border border-green-500/50 rounded-lg text-green-400 text-sm">
          <CheckCircle size={14} />
          {lastAutoMark}
        </div>
      )}

      <div className="grid gap-3">
        <button
          onClick={() => simulateSensorData('steps')}
          disabled={simulating}
          className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700"
        >
          <div className="flex items-center gap-3">
            <Footprints size={20} className="text-blue-400" />
            <div className="text-left">
              <div className="text-sm text-white">Pasos</div>
              <div className="text-xs text-gray-500">
                Meta: 10,000 pasos
              </div>
            </div>
          </div>
          <div className="text-right">
            {latestData('steps') ? (
              <>
                <div className="text-sm text-white">{latestData('steps')?.value}</div>
                <div className="text-xs text-gray-500">pasos</div>
              </>
            ) : (
              <div className="text-sm text-gray-500">Sin datos</div>
            )}
          </div>
        </button>

        <button
          onClick={() => simulateSensorData('sleep')}
          disabled={simulating}
          className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700"
        >
          <div className="flex items-center gap-3">
            <Moon size={20} className="text-purple-400" />
            <div className="text-left">
              <div className="text-sm text-white">Sueño</div>
              <div className="text-xs text-gray-500">
                Meta: 7+ horas
              </div>
            </div>
          </div>
          <div className="text-right">
            {latestData('sleep') ? (
              <>
                <div className="text-sm text-white">{latestData('sleep')?.value}</div>
                <div className="text-xs text-gray-500">horas</div>
              </>
            ) : (
              <div className="text-sm text-gray-500">Sin datos</div>
            )}
          </div>
        </button>

        <button
          onClick={() => simulateSensorData('activity')}
          disabled={simulating}
          className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700"
        >
          <div className="flex items-center gap-3">
            <Activity size={20} className="text-green-400" />
            <div className="text-left">
              <div className="text-sm text-white">Actividad Física</div>
              <div className="text-xs text-gray-500">
                Meta: 30+ minutos
              </div>
            </div>
          </div>
          <div className="text-right">
            {latestData('activity') ? (
              <>
                <div className="text-sm text-white">{latestData('activity')?.value}</div>
                <div className="text-xs text-gray-500">minutos</div>
              </>
            ) : (
              <div className="text-sm text-gray-500">Sin datos</div>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
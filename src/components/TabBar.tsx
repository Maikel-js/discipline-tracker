'use client';

import { useState } from 'react';
import { Home, Flame, ListTodo, BarChart3, Calendar, Settings, Plus, Bell, Layers, Brain, LineChart, Download, Target, StickyNote, ClipboardList } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabBar({ activeTab, onTabChange }: Props) {
  const { notifications, stats, settings } = useStore();
  const unacknowledged = notifications.filter(n => !n.acknowledged).length;

  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Inicio' },
    { id: 'habits', icon: Flame, label: 'Hábitos' },
    { id: 'tasks', icon: ListTodo, label: 'Tareas' },
    { id: 'goals', icon: Target, label: 'Metas' },
    { id: 'notes', icon: StickyNote, label: 'Notas' },
    { id: 'protocols', icon: ClipboardList, label: 'Protocolos' },
    { id: 'schedule', icon: Calendar, label: 'Día' },
    { id: 'life-os', icon: Layers, label: 'Life OS' },
    { id: 'ai', icon: Brain, label: 'AI' },
    { id: 'stats', icon: LineChart, label: 'Analytics' },
    { id: 'download', icon: Download, label: 'Descargar' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-40">
      <div className="flex items-center gap-3 py-2 px-4 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
              activeTab === tab.id 
                ? 'text-blue-400 bg-blue-400/10' 
                : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            <tab.icon size={20} />
            <span className="text-xs">{tab.label}</span>
            {tab.id === 'dashboard' && unacknowledged > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unacknowledged}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
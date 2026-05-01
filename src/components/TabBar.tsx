'use client';

import { useState } from 'react';
import { Home, Flame, ListTodo, Download, Settings, Layers, Brain, LineChart, Target, StickyNote, ClipboardList, Calendar, Zap } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabBar({ activeTab, onTabChange }: Props) {
  const { notifications } = useStore();
  const unacknowledged = notifications.filter(n => !n.acknowledged).length;
  const [showMore, setShowMore] = useState(false);

  const allTabs = [
    { id: 'dashboard', icon: Home, label: 'Inicio' },
    { id: 'habits', icon: Flame, label: 'Hábitos' },
    { id: 'tasks', icon: ListTodo, label: 'Tareas' },
    { id: 'download', icon: Download, label: 'Descargar' },
    { id: 'more', icon: Settings, label: 'Más' },
  ];

  const moreTabs = [
    { id: 'goals', icon: Target, label: 'Metas' },
    { id: 'notes', icon: StickyNote, label: 'Notas' },
    { id: 'protocols', icon: ClipboardList, label: 'Protocolos' },
    { id: 'schedule', icon: Calendar, label: 'Día' },
    { id: 'life-os', icon: Layers, label: 'Life OS' },
    { id: 'ai', icon: Brain, label: 'AI' },
    { id: 'stats', icon: LineChart, label: 'Analytics' }
  ];

  return (
    <>
      {/* Mobile bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-40 md:hidden">
        <div className="flex items-center justify-start gap-1 px-2 overflow-x-auto relative">
          {allTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'more') {
                  setShowMore(true);
                } else {
                  onTabChange(tab.id);
                }
              }}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors flex-shrink-0 min-w-[60px] relative ${
                activeTab === tab.id
                  ? 'text-blue-400 bg-blue-400/10'
                  : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              <tab.icon size={18} />
              <span className="text-xs">{tab.label}</span>
              {tab.id === 'dashboard' && unacknowledged > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unacknowledged}
                </span>
              )}
            </button>
          ))}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-gray-900 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* More modal for mobile */}
      {showMore && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowMore(false)} />
          <div className="relative w-full bg-gray-900 rounded-t-2xl p-4 pb-24 max-h-[60vh] overflow-y-auto">
            <div className="text-center mb-4 text-gray-400 text-sm">Más opciones</div>
            <div className="grid grid-cols-3 gap-3">
              {moreTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setShowMore(false);
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-400 bg-blue-400/10'
                      : 'text-gray-400 bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <tab.icon size={24} />
                  <span className="text-xs">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 bg-gray-900 border-r border-gray-800 z-40 flex-col py-6 px-3">
        <div className="mb-8 px-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            Discipline Tracker
          </h2>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {[...allTabs.filter(t => t.id !== 'more'), ...moreTabs].map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 bg-blue-400/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon size={22} />
              <span className="text-sm font-medium">{tab.label}</span>
              {tab.id === 'dashboard' && unacknowledged > 0 && (
                <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unacknowledged}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

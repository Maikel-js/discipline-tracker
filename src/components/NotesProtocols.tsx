'use client';

import { useState } from 'react';
import Protocols from '@/components/Protocols';
import Notes from '@/components/Notes';
import { StickyNote, Activity } from 'lucide-react';

export default function NotesProtocols() {
  const [activeView, setActiveView] = useState<'notes' | 'protocols'>('notes');

  return (
    <div className="space-y-6">
      <div className="flex bg-gray-800 p-1 rounded-2xl border border-gray-700 w-fit mx-auto sm:mx-0">
        <button
          type="button"
          onClick={() => setActiveView('notes')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
            activeView === 'notes' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <StickyNote size={18} />
          Notas
        </button>
        <button
          type="button"
          onClick={() => setActiveView('protocols')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
            activeView === 'protocols' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Activity size={18} />
          Protocolos
        </button>
      </div>

      <div className="animate-in fade-in duration-300">
        {activeView === 'notes' ? <Notes /> : <Protocols />}
      </div>
    </div>
  );
}

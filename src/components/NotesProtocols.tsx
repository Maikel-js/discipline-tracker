'use client';

import { useState } from 'react';
import Notes from '@/components/Notes';
import Protocols from '@/components/Protocols';
import { StickyNote, ClipboardList } from 'lucide-react';

export default function NotesProtocols() {
  const [activeSection, setActiveSection] = useState<'notes' | 'protocols'>('notes');

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setActiveSection('notes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeSection === 'notes'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <StickyNote size={18} />
          Notas
        </button>
        <button
          onClick={() => setActiveSection('protocols')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeSection === 'protocols'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <ClipboardList size={18} />
          Protocolos
        </button>
      </div>

      {activeSection === 'notes' ? <Notes /> : <Protocols />}
    </div>
  );
}

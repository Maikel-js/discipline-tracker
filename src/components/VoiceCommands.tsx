'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { Mic, MicOff, Volume2 } from 'lucide-react';

const COMMANDS: Record<string, () => void> = {};

export default function VoiceCommands() {
  const { habits, completeHabit, addTask, tasks, toggleExtremeMode, togglePunishmentMode, addDisciplineScore } = useStore();
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results as any[])
          .map((result: any) => result[0].transcript)
          .join('')
          .toLowerCase();
        setTranscript(transcript);
        processCommand(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const processCommand = (text: string) => {
    console.log('[Voice] Command:', text);

    if (text.includes('completar') || text.includes('hecho') || text.includes('listo')) {
      const habitName = extractHabitName(text, habits.map(h => h.name));
      if (habitName) {
        const habit = habits.find(h => h.name.toLowerCase().includes(habitName));
        if (habit) {
          completeHabit(habit.id);
          setLastCommand(`Completado: ${habit.name}`);
          speak(`Perfecto, completado ${habit.name}`);
        }
      }
    }

    if (text.includes('nueva tarea') || text.includes('crear tarea')) {
      const taskMatch = text.match(/tarea[:\s]+(.+)/i);
      if (taskMatch) {
        addTask({
          title: taskMatch[1].trim(),
          priority: 'medium',
          status: 'todo',
          allowReset: false,
          subtasks: [],
          dependencies: [],
          reminders: [],
          prerequisites: []
        });
        setLastCommand(`Tarea creada: ${taskMatch[1].trim()}`);
        speak(`Tarea creada: ${taskMatch[1].trim()}`);
      }
    }

    if (text.includes('modo extremo') || text.includes('disciplina extrema')) {
      toggleExtremeMode();
      setLastCommand('Modo Extremo activado');
      speak('Modo extremo activado');
    }

    if (text.includes('modo castigo') || text.includes('castigo')) {
      togglePunishmentMode();
      setLastCommand('Modo Castigo activado');
      speak('Modo castigo activado');
    }

    if (text.includes('puntaje') || text.includes('puntos')) {
      const state = useStore.getState();
      speak(`Tu puntaje actual es ${state.stats.disciplinaryScore} puntos`);
    }
  };

  const extractHabitName = (text: string, habitNames: string[]): string | null => {
    for (const name of habitNames) {
      if (text.includes(name.toLowerCase())) {
        return name;
      }
    }
    return null;
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="fixed bottom-24 left-4 z-40">
      <button
        onClick={toggleListening}
        className={`p-3 rounded-full shadow-lg transition-colors ${
          isListening 
            ? 'bg-blue-600 animate-pulse' 
            : 'bg-gray-800'
        }`}
      >
        {isListening ? (
          <Mic className="w-6 h-6 text-white" />
        ) : (
          <MicOff className="w-6 h-6 text-gray-400" />
        )}
      </button>

      {transcript && (
        <div className="absolute left-0 bottom-14 bg-gray-900 border border-gray-700 rounded-lg p-2 w-48">
          <p className="text-xs text-gray-400">Dijiste:</p>
          <p className="text-white text-sm">{transcript}</p>
        </div>
      )}

      {lastCommand && (
        <div className="absolute left-14 bottom-14 bg-green-900/50 border border-green-500 rounded-lg p-2">
          <p className="text-green-400 text-sm">{lastCommand}</p>
        </div>
      )}
    </div>
  );
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
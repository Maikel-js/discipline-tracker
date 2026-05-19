'use client';

import { Zap } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Zap className="w-12 h-12 text-yellow-400 mx-auto animate-pulse" />
        <p className="text-gray-500 mt-4">Cargando...</p>
      </div>
    </div>
  );
}
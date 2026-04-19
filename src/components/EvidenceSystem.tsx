'use client';

import { useState, useRef } from 'react';
import type { Evidence } from '@/types';
import { Camera, MapPin, Clock, Shield, Check, X } from 'lucide-react';

interface Props {
  habitId: string;
  onVerified: () => void;
  onCancel: () => void;
}

export default function EvidenceSystem({ habitId, onVerified, onCancel }: Props) {
  const [evidenceType, setEvidenceType] = useState<'photo' | 'gps' | 'time' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoCapture = async () => {
    setEvidenceType('photo');
    setLoading(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream.getTracks().forEach(track => track.stop());
      
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara');
    } finally {
      setLoading(false);
    }
  };

  const handleGPSCheck = () => {
    setEvidenceType('gps');
    setLoading(true);

    if (!navigator.geolocation) {
      setError('GPS no disponible');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const evidence: Evidence = {
          id: Math.random().toString(36).substr(2, 9),
          habitId,
          type: 'gps',
          data: JSON.stringify({ lat: position.coords.latitude, lng: position.coords.longitude }),
          verified: true,
          timestamp: new Date().toISOString()
        };
        setLoading(false);
        onVerified();
      },
      () => {
        setError('No se pudo obtener ubicación');
        setLoading(false);
      }
    );
  };

  const handleTimeCheck = () => {
    setEvidenceType('time');
    const now = new Date();
    
    if (now.getHours() >= 6 && now.getHours() <= 22) {
      const evidence: Evidence = {
        id: Math.random().toString(36).substr(2, 9),
        habitId,
        type: 'time',
        data: now.toISOString(),
        verified: true,
        timestamp: now.toISOString()
      };
      onVerified();
    } else {
      setError('Solo puedes completar este hábito entre 6am y 10pm');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onCancel} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold text-white mb-4 text-center">
          Verificación de Evidencia
        </h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          Este hábito requiere evidencia para completar
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handlePhotoCapture}
            disabled={loading}
            className="w-full p-4 bg-gray-800 border border-gray-600 rounded-xl flex items-center gap-3 hover:bg-gray-700"
          >
            <Camera className="w-6 h-6 text-blue-400" />
            <div className="text-left">
              <div className="text-white font-medium">Tomar Foto</div>
              <div className="text-xs text-gray-400">Evidencia visual</div>
            </div>
          </button>

          <button
            onClick={handleGPSCheck}
            disabled={loading}
            className="w-full p-4 bg-gray-800 border border-gray-600 rounded-xl flex items-center gap-3 hover:bg-gray-700"
          >
            <MapPin className="w-6 h-6 text-green-400" />
            <div className="text-left">
              <div className="text-white font-medium">Verificar Ubicación</div>
              <div className="text-xs text-gray-400">Check-in GPS</div>
            </div>
          </button>

          <button
            onClick={handleTimeCheck}
            disabled={loading}
            className="w-full p-4 bg-gray-800 border border-gray-600 rounded-xl flex items-center gap-3 hover:bg-gray-700"
          >
            <Clock className="w-6 h-6 text-purple-400" />
            <div className="text-left">
              <div className="text-white font-medium">Verificar Hora</div>
              <div className="text-xs text-gray-400">Tiempo mínimo requerido</div>
            </div>
          </button>
        </div>

        <button
          onClick={onCancel}
          className="w-full mt-4 p-3 bg-gray-700 rounded-xl text-gray-400 hover:bg-gray-600"
        >
          Cancelar
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={() => onVerified()}
        />
      </div>
    </div>
  );
}
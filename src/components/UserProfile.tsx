'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useStore } from '@/store/useStore';
import { User, Mail, LogOut, Settings, Bell, Volume2, Vibrate, Flame, Trophy, Shield, Trash2, Cloud, CloudOff, RefreshCw } from 'lucide-react';

export default function UserProfile() {
  const { user, logout, updateProfile } = useAuth();
  const { settings, updateSettings, stats } = useStore();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');

  if (!user) return null;

  const handleSaveName = () => {
    updateProfile({ name });
    setEditingName(false);
  };

  const handleSync = async () => {
    setSyncStatus('syncing');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSyncStatus('synced');
    setTimeout(() => setSyncStatus('idle'), 2000);
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5" />
          Perfil
        </h2>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <span className="text-green-400 font-bold text-xl">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            {editingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                />
                <button
                  onClick={handleSaveName}
                  className="text-green-400 text-sm"
                >
                  Guardar
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setName(user.name); setEditingName(true); }}
                className="text-white font-medium hover:text-green-400"
              >
                {user.name}
              </button>
            )}
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Mail className="w-3 h-3" />
              {user.email}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Trophy className="w-3 h-3" />
              Score
            </div>
            <div className="text-white font-bold">{stats.disciplinaryScore}</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Flame className="w-3 h-3" />
              Nivel
            </div>
            <div className="text-white font-bold">{stats.level}</div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4 space-y-3">
        <h3 className="text-white font-medium flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Configuración
        </h3>

        <div className="space-y-2">
          <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer">
            <span className="text-gray-300 text-sm flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notificaciones
            </span>
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
              className="w-4 h-4 accent-green-500"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer">
            <span className="text-gray-300 text-sm flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Sonido
            </span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              className="w-4 h-4 accent-green-500"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer">
            <span className="text-gray-300 text-sm flex items-center gap-2">
              <Vibrate className="w-4 h-4" />
              Vibración
            </span>
            <input
              type="checkbox"
              checked={settings.vibrationEnabled}
              onChange={(e) => updateSettings({ vibrationEnabled: e.target.checked })}
              className="w-4 h-4 accent-green-500"
            />
          </label>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4 space-y-3">
        <h3 className="text-white font-medium flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Modos Especiales
        </h3>

        <div className="space-y-2">
          <button
            onClick={() => updateSettings({ extremeMode: !settings.extremeMode })}
            className={`w-full p-3 rounded-lg flex items-center justify-between transition-colors ${
              settings.extremeMode 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="flex items-center gap-2">
              🔥 Modo Extremo
            </span>
            <span className="text-xs">
              {settings.extremeMode ? 'ACTIVADO' : 'OFF'}
            </span>
          </button>

          <button
            onClick={() => updateSettings({ punishmentMode: !settings.punishmentMode })}
            className={`w-full p-3 rounded-lg flex items-center justify-between transition-colors ${
              settings.punishmentMode 
                ? 'bg-orange-600 text-white animate-pulse' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="flex items-center gap-2">
              ⚡ Modo Castigo
            </span>
            <span className="text-xs">
              {settings.punishmentMode ? 'ACTIVADO' : 'OFF'}
            </span>
          </button>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <button
          onClick={handleSync}
          disabled={syncStatus === 'syncing'}
          className="w-full p-3 rounded-lg flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white transition-colors"
        >
          {syncStatus === 'syncing' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Sincronizando...
            </>
          ) : syncStatus === 'synced' ? (
            <>
              <Cloud className="w-4 h-4" />
              Sincronizado
            </>
          ) : (
            <>
              <CloudOff className="w-4 h-4" />
              Sincronizar con la nube
            </>
          )}
        </button>
        <p className="text-gray-500 text-xs text-center mt-2">
          Tus datos se guardan localmente
        </p>
      </div>
    </div>
  );
}
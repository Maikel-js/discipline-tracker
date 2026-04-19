'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useStore } from '@/store/useStore';
import { 
  Smartphone, Monitor, Download, Globe, Apple, 
  ChevronDown, X, Check, Settings, Bell, MessageCircle,
  Clock, User, Shield, Wifi
} from 'lucide-react';

export default function DownloadPortal() {
  const { user } = useAuth();
  const { settings, updateSettings, addDisciplineScore } = useStore();
  const [activeSection, setActiveSection] = useState<'download' | 'settings' | 'whatsapp'>('download');
  const [showSettings, setShowSettings] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const appUrl = 'https://discipline-tracker-rho.vercel.app';

  const savePreference = (key: string, value: any) => {
    addDisciplineScore(2, `Preferencia actualizada: ${key}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Centro de Descargas y Ajustes</h2>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 bg-gray-700 rounded-lg"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveSection('download')}
          className={`p-2 rounded-lg text-sm ${activeSection === 'download' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          <Download className="w-4 h-4 inline mr-1" />
          Descargar
        </button>
        <button
          onClick={() => setActiveSection('settings')}
          className={`p-2 rounded-lg text-sm ${activeSection === 'settings' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          <Settings className="w-4 h-4 inline mr-1" />
          Ajustes
        </button>
        <button
          onClick={() => setActiveSection('whatsapp')}
          className={`p-2 rounded-lg text-sm ${activeSection === 'whatsapp' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          <MessageCircle className="w-4 h-4 inline mr-1" />
          WhatsApp
        </button>
      </div>

      {activeSection === 'download' && (
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              📱 Instalar en Celular
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Android (APK)</div>
                    <div className="text-xs text-gray-400">Instala directamente desde Chrome</div>
                  </div>
                  <button
                    onClick={() => window.open(appUrl, '_blank')}
                    className="px-3 py-1 bg-green-600 rounded-lg text-sm"
                  >
                    Instalar
                  </button>
                </div>
              </div>

              <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">iPhone (iOS)</div>
                    <div className="text-xs text-gray-400">Desde Safari - Agregar a pantalla</div>
                  </div>
                  <button
                    onClick={() => window.open(appUrl, '_blank')}
                    className="px-3 py-1 bg-blue-600 rounded-lg text-sm"
                  >
                    Instalar
                  </button>
                </div>
              </div>

              <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">PWA Web</div>
                    <div className="text-xs text-gray-400">Funciona en cualquier dispositivo</div>
                  </div>
                  <button
                    onClick={() => window.open(appUrl, '_blank')}
                    className="px-3 py-1 bg-purple-600 rounded-lg text-sm"
                  >
                    Abrir
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              💻 PC / Escritorio
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-gray-700/50 rounded-lg opacity-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Windows</div>
                    <div className="text-xs text-gray-400">Próximamente...</div>
                  </div>
                  <span className="px-3 py-1 bg-gray-600 rounded-lg text-xs">Pronto</span>
                </div>
              </div>

              <div className="p-3 bg-gray-700/50 rounded-lg opacity-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">macOS</div>
                    <div className="text-xs text-gray-400">Próximamente...</div>
                  </div>
                  <span className="px-3 py-1 bg-gray-600 rounded-lg text-xs">Pronto</span>
                </div>
              </div>

              <div className="p-3 bg-gray-700/50 rounded-lg opacity-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Linux</div>
                    <div className="text-xs text-gray-400">Próximamente...</div>
                  </div>
                  <span className="px-3 py-1 bg-gray-600 rounded-lg text-xs">Pronto</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="text-sm text-blue-300">
                💡 <strong>Consejo:</strong> Usa la versión web en tu PC. 
                Guarda en favoritos o crea acceso directo para experiencia similar a app.
              </div>
            </div>
          </div>

          <div className="text-center text-gray-500 text-sm">
            <Globe className="w-4 h-4 inline mr-1" />
            Versión web: {appUrl}
          </div>
        </div>
      )}

      {activeSection === 'settings' && (
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              ⏱️ Pomodoro Configurable
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Bloque de enfoque (minutos)</label>
                <input
                  type="number"
                  value={settings.pomodoroLength}
                  onChange={(e) => {
                    updateSettings({ pomodoroLength: parseInt(e.target.value) || 25 });
                    savePreference('pomodoro', e.target.value);
                  }}
                  className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg p-2"
                  min={5}
                  max={60}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Descanso corto (minutos)</label>
                <input
                  type="number"
                  value={settings.breakLength}
                  onChange={(e) => {
                    updateSettings({ breakLength: parseInt(e.target.value) || 5 });
                    savePreference('break', e.target.value);
                  }}
                  className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg p-2"
                  min={1}
                  max={30}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Bloques antes de largo descanso</label>
                <input
                  type="number"
                  value={4}
                  onChange={() => {}}
                  className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg p-2"
                  min={2}
                  max={8}
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              🔔 Notificaciones
            </h3>
            
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer">
                <span className="text-gray-300">Notificaciones push</span>
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => {
                    updateSettings({ notificationsEnabled: e.target.checked });
                    savePreference('notifications', e.target.checked);
                  }}
                  className="w-4 h-4 accent-green-500"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer">
                <span className="text-gray-300">Sonido</span>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => {
                    updateSettings({ soundEnabled: e.target.checked });
                    savePreference('sound', e.target.checked);
                  }}
                  className="w-4 h-4 accent-green-500"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer">
                <span className="text-gray-300">Vibración</span>
                <input
                  type="checkbox"
                  checked={settings.vibrationEnabled}
                  onChange={(e) => {
                    updateSettings({ vibrationEnabled: e.target.checked });
                    savePreference('vibration', e.target.checked);
                  }}
                  className="w-4 h-4 accent-green-500"
                />
              </label>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              🔒 Cuenta
            </h3>
            
            <div className="space-y-2">
              <div className="p-3 bg-gray-700/50 rounded-lg">
                <div className="text-sm text-gray-400">Email</div>
                <div className="text-white">{user?.email || 'No registrado'}</div>
              </div>
              <div className="p-3 bg-gray-700/50 rounded-lg">
                <div className="text-sm text-gray-400">Nombre</div>
                <div className="text-white">{user?.name || 'No registrado'}</div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                ✅ Una cuenta por usuario - Verificación por email activa
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'whatsapp' && (
        <div className="space-y-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              📱 Notificaciones WhatsApp
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer">
                <span className="text-gray-300">Activar WhatsApp</span>
                <input
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  className="w-4 h-4 accent-green-500"
                />
              </label>

              {whatsappEnabled && (
                <>
                  <div>
                    <label className="text-sm text-gray-400">Número telefónico</label>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+1234567890"
                      className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg p-2"
                    />
                  </div>

                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">Recibirás notificaciones por:</div>
                    <ul className="text-sm space-y-1">
                      <li>✓ Hábitos pendientes</li>
                      <li>✓ Tareas vencidas</li>
                      <li>✓ Alarmas</li>
                      <li>✓ Recordatorios</li>
                    </ul>
                  </div>

                  <button className="w-full py-2 bg-green-600 rounded-lg">
                    Activar WhatsApp
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="text-center text-gray-500 text-sm p-4">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Powered by Twilio API</p>
            <p className="text-xs">Próximamente disponible</p>
          </div>
        </div>
      )}
    </div>
  );
}
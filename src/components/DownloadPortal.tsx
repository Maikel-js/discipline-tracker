'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useStore } from '@/store/useStore';
import {
  Smartphone, Monitor, Download, Globe,
  Settings, MessageCircle, Clock, Bell, Shield,
  Terminal, Copy, Check
} from 'lucide-react';

import { getOS, triggerSafeDownload } from '@/lib/platform';
import { R2_WINDOWS_EXE } from '@/lib/r2';

type Platform = 'android' | 'windows' | 'linux' | 'ios' | 'web';

const GITHUB_BASE = 'https://github.com/Maikel-js/discipline-tracker/releases/download/v0.1.0';
const APK_URL = `${GITHUB_BASE}/Discipline-Tracker-v0.1.0.apk`;

export default function DownloadPortal() {
  const { user } = useAuth();
  const { settings, updateSettings, addDisciplineScore } = useStore();
  const [activeSection, setActiveSection] = useState<'download' | 'settings' | 'whatsapp'>('download');
  const [platform, setPlatform] = useState<Platform>('web');
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const appUrl = 'https://discipline-tracker-rho.vercel.app';

  useEffect(() => {
    setPlatform(getOS());
  }, []);

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleDownload = (url: string, filename: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerSafeDownload(url, filename);
  };

  const linuxCommands = [
    {
      id: 'appimage',
      name: 'AppImage',
      icon: '🐧',
      color: 'orange',
      desc: 'Universal - Cualquier distro',
      build: 'npm run electron:build:linux:appimage',
      install: 'chmod +x dist/Discipline-Tracker-*.AppImage && ./dist/Discipline-Tracker-*.AppImage'
    },
    {
      id: 'deb',
      name: 'DEB',
      icon: '📦',
      color: 'blue',
      desc: 'Ubuntu / Debian',
      build: 'npm run electron:build:linux:deb',
      install: 'sudo dpkg -i dist/Discipline-Tracker-*.deb && sudo apt-get install -f'
    },
    {
      id: 'rpm',
      name: 'RPM',
      icon: '📦',
      color: 'red',
      desc: 'Fedora / RHEL',
      build: 'npm run electron:build:linux:rpm',
      install: 'sudo dnf install dist/Discipline-Tracker-*.rpm'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Centro de Descargas</h2>
        <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">
          Sistema: {platform}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setActiveSection('download')}
          className={`p-2 rounded-lg text-sm transition-all ${activeSection === 'download' ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'bg-gray-800 hover:bg-gray-700'}`}
        >
          <Download className="w-4 h-4 inline mr-1" />
          Descargar
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('settings')}
          className={`p-2 rounded-lg text-sm transition-all ${activeSection === 'settings' ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'bg-gray-800 hover:bg-gray-700'}`}
        >
          <Settings className="w-4 h-4 inline mr-1" />
          Ajustes
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('whatsapp')}
          className={`p-2 rounded-lg text-sm transition-all ${activeSection === 'whatsapp' ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'bg-gray-800 hover:bg-gray-700'}`}
        >
          <MessageCircle className="w-4 h-4 inline mr-1" />
          WhatsApp
        </button>
      </div>

      {activeSection === 'download' && (
        <div className="space-y-4">
          {/* ANDROID */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-400" />
              📱 Celular
            </h3>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-3 bg-green-900/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      🤖 Android (APK)
                    </div>
                    <div className="text-xs text-gray-400">Instalador directo sin Play Store</div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDownload(APK_URL, 'Discipline-Tracker-v0.1.0.apk', e)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold transition-colors"
                  >
                    Descargar
                  </button>
                </div>
              </div>

              <div className="p-3 bg-gray-700/30 border border-gray-600/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium flex items-center gap-2 text-purple-300">
                      🌐 PWA Web
                    </div>
                    <div className="text-xs text-gray-400">Instalar desde el navegador</div>
                  </div>
                  <a
                    href={appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-bold transition-colors"
                  >
                    Abrir
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* WINDOWS */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-400" />
              💻 Windows
            </h3>

            <div className="p-3 bg-blue-900/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    🪟 Windows (EXE)
                  </div>
                  <div className="text-xs text-gray-400">Instalador portable - Ejecutar y listo</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDownload(R2_WINDOWS_EXE, 'Discipline-Tracker-Setup.exe', e)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-colors"
                >
                  Descargar
                </button>
              </div>
            </div>
          </div>

          {/* LINUX */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-orange-400" />
              🐧 Linux
            </h3>
            <p className="text-xs text-gray-400 mb-3">Compila desde el código fuente</p>

            <div className="space-y-3">
              {linuxCommands.map((item) => (
                <div key={item.id} className={`p-3 bg-${item.color}-900/10 border border-${item.color}-500/20 rounded-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium flex items-center gap-2">
                      {item.icon} {item.name}
                    </div>
                    <span className="text-xs text-gray-400">{item.desc}</span>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-2 font-mono text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500"># Build</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-${item.color}-400`}>$ {item.build}</span>
                      <button
                        type="button"
                        onClick={() => copyCommand(item.build)}
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        {copiedCmd === item.build ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500"># Instalar</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-400">$ {item.install}</span>
                      <button
                        type="button"
                        onClick={() => copyCommand(item.install)}
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        {copiedCmd === item.install ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 bg-gray-900 rounded-lg p-2 font-mono text-xs">
              <div className="text-gray-500 mb-1"># Requisitos previos</div>
              <div className="text-gray-400">sudo apt install nodejs npm git gcc make libsecret-1-dev</div>
            </div>
          </div>

          <div className="text-center text-gray-500 text-sm py-4 border-t border-gray-800">
            <Globe className="w-4 h-4 inline mr-1" />
            <strong>Servidor:</strong> {appUrl.replace('https://', '')}
          </div>
        </div>
      )}

      {activeSection === 'settings' && (
        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              ⏱️ Pomodoro
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Enfoque (min)</label>
                <input
                  type="number"
                  value={settings.pomodoroLength}
                  onChange={(e) => updateSettings({ pomodoroLength: parseInt(e.target.value) || 25 })}
                  className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg p-2"
                  min={5}
                  max={60}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Descanso (min)</label>
                <input
                  type="number"
                  value={settings.breakLength}
                  onChange={(e) => updateSettings({ breakLength: parseInt(e.target.value) || 5 })}
                  className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg p-2"
                  min={1}
                  max={30}
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
              <label className="flex items-center justify-between p-2 rounded-lg">
                <span className="text-gray-300">Push</span>
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
                  className="w-4 h-4 accent-green-500"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg">
                <span className="text-gray-300">Sonido</span>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                  className="w-4 h-4 accent-green-500"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg">
                <span className="text-gray-300">Vibración</span>
                <input
                  type="checkbox"
                  checked={settings.vibrationEnabled}
                  onChange={(e) => updateSettings({ vibrationEnabled: e.target.checked })}
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
            
            <div className="p-3 bg-gray-700/50 rounded-lg">
              <div className="text-sm text-gray-400">Email</div>
              <div className="text-white">{user?.email || 'No registrado'}</div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'whatsapp' && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            📱 WhatsApp
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between p-2 rounded-lg bg-gray-800">
              <span className="text-gray-300">Activar</span>
              <input
                type="checkbox"
                checked={whatsappEnabled}
                onChange={(e) => setWhatsappEnabled(e.target.checked)}
                className="w-4 h-4 accent-green-500"
              />
            </label>

            {whatsappEnabled && (
              <div>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2"
                />
              </div>
            )}

            <div className="text-xs text-gray-500 text-center">
              Powered by Twilio API - Próximamente
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

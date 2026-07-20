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

const GITHUB = 'https://github.com/Maikel-js/discipline-tracker/releases/download/v0.1.0';
const APK_URL = `${GITHUB}/Discipline-Tracker-v0.1.0.apk`;
const LINUX_APPIMAGE = `${GITHUB}/Discipline-Tracker-0.1.0-Linux.AppImage`;
const LINUX_DEB = `${GITHUB}/Discipline-Tracker-0.1.0-Linux-amd64.deb`;

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
            <div className="p-3 bg-green-900/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">🤖 Android (APK)</div>
                  <div className="text-xs text-gray-400">Instalador directo sin Play Store</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDownload(APK_URL, 'Discipline-Tracker-v0.1.0.apk', e)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold transition-colors"
                >
                  Descargar APK
                </button>
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
                  <div className="font-medium">🪟 Windows (EXE)</div>
                  <div className="text-xs text-gray-400">Instalador portable - Ejecutar y listo</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDownload(R2_WINDOWS_EXE, 'Discipline-Tracker-Setup.exe', e)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-colors"
                >
                  Descargar EXE
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

            <div className="space-y-3">
              {/* AppImage */}
              <div className="p-3 bg-orange-900/10 border border-orange-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">🐧 AppImage (Universal)</div>
                    <div className="text-xs text-gray-400">Funciona en cualquier distro Linux</div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDownload(LINUX_APPIMAGE, 'Discipline-Tracker-0.1.0-Linux.AppImage', e)}
                    className="px-3 py-1 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm font-bold transition-colors"
                  >
                    Descargar
                  </button>
                </div>
                <div className="bg-gray-900 rounded-lg p-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-orange-400">$ chmod +x Discipline-Tracker-*.AppImage && ./Discipline-Tracker-*.AppImage</span>
                    <button
                      type="button"
                      onClick={() => copyCommand('chmod +x Discipline-Tracker-*.AppImage && ./Discipline-Tracker-*.AppImage')}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      {copiedCmd === 'appimage' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* DEB */}
              <div className="p-3 bg-blue-900/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">📦 DEB (Ubuntu / Debian)</div>
                    <div className="text-xs text-gray-400">Para Ubuntu, Debian, Linux Mint</div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDownload(LINUX_DEB, 'Discipline-Tracker-0.1.0-Linux-amd64.deb', e)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-colors"
                  >
                    Descargar
                  </button>
                </div>
                <div className="bg-gray-900 rounded-lg p-2 font-mono text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400">$ sudo apt install ./Discipline-Tracker-*.deb</span>
                    <button
                      type="button"
                      onClick={() => copyCommand('sudo apt install ./Discipline-Tracker-*.deb')}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      {copiedCmd === 'apt' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="text-gray-500 text-[10px]">O manualmente: sudo dpkg -i archivo.deb && sudo apt-get install -f</div>
                </div>
              </div>

              {/* RPM */}
              <div className="p-3 bg-red-900/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">📦 RPM (Fedora / RHEL)</div>
                    <div className="text-xs text-gray-400">Para Fedora, CentOS, RHEL</div>
                  </div>
                  <div className="text-xs text-yellow-500">Próximamente</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-red-400">$ sudo dnf install ./Discipline-Tracker-*.rpm</span>
                    <button
                      type="button"
                      onClick={() => copyCommand('sudo dnf install ./Discipline-Tracker-*.rpm')}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      {copiedCmd === 'dnf' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
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

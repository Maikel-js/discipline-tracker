'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useStore } from '@/store/useStore';
import {
  Smartphone, Monitor, Download, Globe,
  Settings, MessageCircle, Clock, Bell, Shield,
  Box
} from 'lucide-react';

type Platform = 'android' | 'windows' | 'linux' | 'unknown';

export default function DownloadPortal() {
  const { user } = useAuth();
  const { settings, updateSettings, addDisciplineScore } = useStore();
  const [activeSection, setActiveSection] = useState<'download' | 'settings' | 'whatsapp'>('download');
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const appUrl = 'https://discipline-tracker-rho.vercel.app';
  const githubUrl = 'https://github.com/Maikel-js/discipline-tracker';
  const releasesUrl = `${githubUrl}/releases`;

  useEffect(() => {
    const detectPlatform = (): Platform => {
      const userAgent = navigator.userAgent.toLowerCase();

      if (userAgent.includes('android')) return 'android';
      if (userAgent.includes('win')) return 'windows';
      if (userAgent.includes('linux')) return 'linux';

      return 'unknown';
    };
    
    setPlatform(detectPlatform());
  }, []);

  const savePreference = (key: string, value: any) => {
    addDisciplineScore(2, `Preferencia actualizada: ${key}`);
  };

  const getRecommendedDownload = () => {
    switch (platform) {
      case 'android':
        return { icon: '📱', title: 'Android', action: 'Instalar App' };
      case 'windows':
        return { icon: '🪟', title: 'Windows', action: 'Descargar' };
      default:
        return { icon: '🌐', title: 'Web', action: 'Abrir App' };
    }
  };

  const recommended = getRecommendedDownload();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Centro de Descargas</h2>
        <div className="text-xs text-gray-500">
          Detectado: {platform === 'unknown' ? 'Web' : platform}
        </div>
      </div>

       <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
          {platform !== 'unknown' && (
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{recommended.icon}</div>
                <div className="flex-1">
                  <div className="font-bold text-white">Te recomendamos:</div>
                  <div className="text-sm text-gray-300">{recommended.title} - {recommended.action}</div>
                </div>
                <button
                  onClick={() => window.open(appUrl, '_blank')}
                  className="px-4 py-2 bg-blue-600 rounded-lg font-medium"
                >
                  {recommended.action}
                </button>
              </div>
            </div>
          )}

           <div className="bg-gray-800/50 rounded-xl p-4">
             <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
               <Smartphone className="w-5 h-5" />
               📱 Celular
             </h3>

             <div className="grid md:grid-cols-2 gap-3">
               <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                 <div className="flex items-center justify-between">
                   <div>
                     <div className="font-medium flex items-center gap-2">
                       🤖 Android (APK)
                     </div>
                     <div className="text-xs text-gray-400">Instalable directo</div>
                   </div>
                   <a
                     href={`${releasesUrl}/latest/download/app-release.apk`}
                     className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded-lg text-sm"
                     onClick={(e) => {
                       fetch('/downloads/app-release.apk').catch(() => {
                         window.open(`${releasesUrl}/latest`, '_blank');
                       });
                     }}
                   >
                     Descargar
                   </a>
                 </div>
               </div>

               <div className="p-3 bg-gray-700/50 rounded-lg">
                 <div className="flex items-center justify-between">
                   <div>
                     <div className="font-medium flex items-center gap-2">
                       🌐 PWA Web
                     </div>
                     <div className="text-xs text-gray-400">Funciona en cualquier dispositivo</div>
                   </div>
                   <a
                     href={appUrl}
                     target="_blank"
                     className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm"
                   >
                     Abrir
                   </a>
                 </div>
               </div>
             </div>
           </div>

           <div className="bg-gray-800/50 rounded-xl p-4">
             <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
               <Monitor className="w-5 h-5" />
               💻 PC / Desktop
             </h3>

             <div className="space-y-3">
               <div className="p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                 <div className="flex items-center justify-between">
                   <div>
                     <div className="font-medium flex items-center gap-2">
                       🪟 Windows App
                     </div>
                     <div className="text-xs text-gray-400">Aplicación de escritorio</div>
                   </div>
                   <a
                     href={`${releasesUrl}/latest/download/Discipline-Tracker-Windows.zip`}
                     className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
                     onClick={(e) => {
                       fetch('/downloads/Discipline-Tracker-Windows.zip').catch(() => {
                         window.open(`${releasesUrl}/latest`, '_blank');
                       });
                     }}
                   >
                     Descargar
                   </a>
                 </div>
               </div>

               <div className="p-3 bg-gray-700/50 rounded-lg">
                 <div className="flex items-center justify-between">
                   <div>
                     <div className="font-medium flex items-center gap-2">
                       🪟 Windows
                     </div>
                     <div className="text-xs text-gray-400">Usa la versión web o instala PWA</div>
                   </div>
                   <a
                     href={appUrl}
                     target="_blank"
                     className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm"
                   >
                     Abrir Web
                   </a>
                 </div>
               </div>

               <div className="p-3 bg-gray-700/50 rounded-lg">
                 <div className="flex items-center justify-between">
                   <div>
                     <div className="font-medium flex items-center gap-2">
                       🐧 Linux
                     </div>
                     <div className="text-xs text-gray-400">Usa la versión web</div>
                   </div>
                   <a
                     href={appUrl}
                     target="_blank"
                     className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm"
                   >
                     Abrir Web
                   </a>
                 </div>
               </div>
             </div>
           </div>

          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Box className="w-5 h-5" />
              📦 Código Fuente
            </h3>
            
            <div className="space-y-2">
              <a
                href={githubUrl}
                target="_blank"
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700"
              >
                <div>
                  <div className="font-medium">Ver en GitHub</div>
                  <div className="text-xs text-gray-400">Código fuente completo</div>
                </div>
<Box className="w-5 h-5" />
              </a>
              
              <a
                href={releasesUrl}
                target="_blank"
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700"
              >
                <div>
                  <div className="font-medium">Releases</div>
                  <div className="text-xs text-gray-400">APK, Windows EXE y paquetes oficiales</div>
                </div>
                <Download className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="text-center text-gray-500 text-sm">
            <Globe className="w-4 h-4 inline mr-1" />
            <strong>Versión Web:</strong> {appUrl}
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
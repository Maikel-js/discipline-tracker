/**
 * Platform Utility Layer
 * Handles OS detection and platform-specific execution
 */

export type OS = 'android' | 'windows' | 'linux' | 'ios' | 'web';

export const getOS = (): OS => {
  if (typeof window === 'undefined') return 'web';
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('android')) return 'android';
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('linux')) return 'linux';
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
  
  return 'web';
};

/**
 * Professional Download Handler
 * Ensures no form resets or redirects to external pages
 */
export const triggerSafeDownload = (url: string, filename: string) => {
  // Use a temporary hidden anchor to trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
};

/**
 * Checks if the app is running in a native container (Electron/Capacitor/Tauri)
 */
export const isNative = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check for Capacitor
  if ((window as any).Capacitor) return true;
  
  // Check for Electron
  if (navigator.userAgent.toLowerCase().includes('electron')) return true;
  
  // Check for Tauri
  if ((window as any).__TAURI__) return true;
  
  return false;
};

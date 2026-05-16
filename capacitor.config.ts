import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.discipline.tracker',
  appName: 'Discipline Tracker',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash'
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#000000',
      sound: 'alarm.wav'
    }
  }
};

export default config;

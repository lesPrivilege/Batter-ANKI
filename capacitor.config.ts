import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lesprivilege.minisrs',
  appName: 'Mnemos',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;

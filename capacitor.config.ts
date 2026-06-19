import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.almoharif.cryptotrading',
  appName: 'منصة حمزه المحترف',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  }
};

export default config;

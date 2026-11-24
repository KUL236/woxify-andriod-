import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.woxify.app',
  appName: 'Woxify',
  webDir: 'dist',
  server: {
    // http scheme => https backend aur http backend dono mixed-content ke bina chalte hain
    androidScheme: 'http',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#010316',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#010316',
      overlaysWebView: false,
    },
  },
};

export default config;

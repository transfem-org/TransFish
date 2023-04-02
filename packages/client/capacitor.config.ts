import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.calckey.app',
  appName: 'Calckey',
  webDir: '../../built/_client_dist_',
  bundledWebRuntime: false,
	plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;

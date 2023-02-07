import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cloud.calckey.Calckey',
  appName: 'Calckey',
  webDir: '../../built/_client_dist_',
  bundledWebRuntime: false,
	// remove server section before making production build
	/*server: {
		// for android only, below settings will work out of the box
		// for iOS or both, change the url to http://your-device-ip 
		// To discover your workstation IP, just run ifconfig
		url: "http://10.0.2.2:5001",
		cleartext: true
	}*/
};

export default config;

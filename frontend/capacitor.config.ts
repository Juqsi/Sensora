import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'de.justilian.sensora.app',
  appName: 'Sensora',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: '#ffffffff',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
}

export default config

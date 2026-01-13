import 'dotenv/config'

export default ({ config }: { config: any }) => ({
  ...config,
  name: 'BagusGo',
  slug: 'bagusgo-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './src/images/Logo.png',
  splash: {
    image: './src/images/SplashScreen.png',
    resizeMode: 'cover',
    backgroundColor: '#ffffff'
  },
  ios: {
    bundleIdentifier: 'com.bagusgo.mobile',
    supportsTablet: true,
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ''
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'Aplikasi memerlukan akses lokasi untuk optimisasi rute perjalanan.'
    }
  },
  android: {
    package: 'com.bagusgo.mobile',
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION'
    ],
    usesCleartextTraffic: true,
    adaptiveIcon: {
      foregroundImage: './src/images/Logo.png',
      backgroundColor: '#ffffff'
    },
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY || ''
      }
    }
  },
  web: {
    bundler: 'metro'
  },
  plugins: [],
  extra: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || ''
  }
})

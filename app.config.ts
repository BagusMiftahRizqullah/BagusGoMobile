import 'dotenv/config'

export default ({ config }: { config: any }) => ({
  ...config,
  name: 'BagusGo',
  slug: 'bagusgo-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './src/images/ic_launcher.png',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: 'com.bagusgo.mobile',
    supportsTablet: true,
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ''
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'Aplikasi memerlukan akses lokasi untuk optimisasi rute perjalanan.',
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true
      }
    }
  },
  android: {
    package: 'com.bagusgo.mobile',
    permissions: [
      'INTERNET',
      'ACCESS_NETWORK_STATE',
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION'
    ],
    usesCleartextTraffic: true,
    adaptiveIcon: {
      foregroundImage: './src/images/ic_launcher.png',
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
  plugins: [
    [
      'expo-build-properties',
      {
        android: {
          usesCleartextTraffic: true
        }
      }
    ]
  ],
  extra: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://144.202.24.24/bagusgo',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
    eas: {
      projectId: 'b274ad4f-23fc-4fff-b833-0b3de4729e63'
    }
  }
})

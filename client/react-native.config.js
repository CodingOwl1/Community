module.exports = {
  project: {
    ios: {},
    android: {}
  },
  assets: ['./src/assets/fonts/'],
  dependencies: {
    '@react-native-clipboard/clipboard': {
      platforms: {
        ios: null // disable Android platform, other platforms will still autolink
      }
    },
    '@react-native-community/async-storage': {
      platforms: {
        ios: null // disable Android platform, other platforms will still autolink
      }
    },
    '@react-native-community/checkbox': {
      platforms: {
        ios: null // disable Android platform, other platforms will still autolink
      }
    },
    '@react-native-community/push-notification-ios': {
      platforms: {
        ios: null // disable Android platform, other platforms will still autolink
      }
    },
    '@react-native-firebase/app': {
      platforms: {
        ios: null // disable Android platform, other platforms will still autolink
      }
    },
    '@react-native-firebase/firestore': {
      platforms: {
        ios: null // disable Android platform, other platforms will still autolink
      }
    },
    '@react-native-firebase/messaging': {
      platforms: {
        ios: null // disable Android platform, other platforms will still autolink
      }
    },
    'react-native-gesture-handler': {
      platforms: {
        ios: null // disable Android platform, other platforms will still autolink
      }
    },
    'react-native-image-crop-picker': {
      platforms: {
        ios: null // disable Android platform, other platforms will still autolink
      }
    },
    'react-native-safe-area-context': {
      platforms: {
        ios: null // disable Android platform, other platforms will still autolink
      }
    },
    'react-native-svg': {
      platforms: {
        ios: null // disable Android platform, other platforms will still autolink
      }
    },
    'react-native-webview': {
      platforms: {
        ios: null // disable Android platform, other platforms will still autolink
      }
    },
    '@react-native-community/masked-view': {
      platforms: {
        ios: null // disable Android platform, other platforms will still autolink
      }
    },
    'react-native-reanimated': {
      platforms: {
        ios: null // disable Android platform, other platforms will still autolink
      }
    },
    'react-native-screens': {
      platforms: {
        ios: null // disable Android platform, other platforms will still autolink
      }
    }
  }
}

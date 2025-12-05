# React Native Deep Linking Configuration

You are a senior React Native developer. You must configure deep linking (iOS universal links, Android app links) for the application.

## Arguments
$ARGUMENTS

Arguments:
- Domain (e.g., `example.com`, `app.mysite.com`)
- (Optional) Custom scheme (e.g., `myapp`)

Example: `/reactnative:deep-link example.com myapp`

## MISSION

### Step 1: React Navigation Configuration

```typescript
// src/navigation/linking.ts
import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  // Accepted prefixes
  prefixes: [
    'https://example.com',
    'https://www.example.com',
    'myapp://',  // Custom scheme
  ],

  // Route configuration
  config: {
    // Initial screen if no match
    initialRouteName: 'Home',

    screens: {
      // Simple route
      Home: '',
      About: 'about',

      // Route with parameter
      ProductDetail: {
        path: 'product/:id',
        parse: {
          id: (id: string) => id,
        },
      },

      // Route with multiple parameters
      UserProfile: {
        path: 'user/:userId/post/:postId',
        parse: {
          userId: (userId: string) => userId,
          postId: (postId: string) => parseInt(postId, 10),
        },
      },

      // Nested routes (Tab Navigator)
      Main: {
        screens: {
          HomeTab: {
            path: 'home',
            screens: {
              Feed: 'feed',
              Trending: 'trending',
            },
          },
          ProfileTab: {
            path: 'profile',
            screens: {
              MyProfile: '',
              Settings: 'settings',
            },
          },
        },
      },

      // Route with query params
      Search: {
        path: 'search',
        parse: {
          query: (query: string) => decodeURIComponent(query),
          category: (cat: string) => cat,
        },
        stringify: {
          query: (query: string) => encodeURIComponent(query),
        },
      },

      // Catch-all route for 404
      NotFound: '*',
    },
  },

  // Function to get initial URL
  async getInitialURL() {
    // Check if app was opened via deep link
    const url = await Linking.getInitialURL();
    if (url != null) {
      return url;
    }

    // Check push notifications (if applicable)
    const notification = await messaging().getInitialNotification();
    if (notification?.data?.link) {
      return notification.data.link as string;
    }

    return null;
  },

  // Listener for links while app is open
  subscribe(listener) {
    // Listen to React Native links
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      listener(url);
    });

    // Listen to push notifications
    const unsubscribeNotification = messaging().onNotificationOpenedApp(
      (notification) => {
        const link = notification.data?.link;
        if (link) {
          listener(link as string);
        }
      }
    );

    return () => {
      linkingSubscription.remove();
      unsubscribeNotification();
    };
  },
};
```

```typescript
// src/navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { linking } from './linking';

export function RootNavigator() {
  return (
    <NavigationContainer
      linking={linking}
      fallback={<LoadingScreen />}
      onStateChange={(state) => {
        // Analytics tracking
        const currentRoute = state?.routes[state.index];
        analytics.screen(currentRoute?.name);
      }}
    >
      <RootStack.Navigator>
        {/* ... screens ... */}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
```

### Step 2: iOS Configuration (Universal Links)

#### 2.1 Associated Domains

```swift
// ios/{AppName}/{AppName}.entitlements
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.associated-domains</key>
    <array>
        <string>applinks:example.com</string>
        <string>applinks:www.example.com</string>
        <string>webcredentials:example.com</string>
    </array>
</dict>
</plist>
```

#### 2.2 URL Schemes (Custom)

```xml
<!-- ios/{AppName}/Info.plist -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLName</key>
        <string>com.example.myapp</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>myapp</string>
        </array>
    </dict>
</array>

<!-- Allow schemes -->
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>myapp</string>
</array>
```

#### 2.3 AppDelegate

```swift
// ios/{AppName}/AppDelegate.swift
import UIKit
import React
import RCTLinkingManager

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

  // Handle custom URL scheme
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey : Any] = [:]
  ) -> Bool {
    return RCTLinkingManager.application(app, open: url, options: options)
  }

  // Handle Universal Links
  func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    return RCTLinkingManager.application(
      application,
      continue: userActivity,
      restorationHandler: restorationHandler
    )
  }
}
```

#### 2.4 AASA File (on server)

```json
// https://example.com/.well-known/apple-app-site-association
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appIDs": ["TEAMID.com.example.myapp"],
        "components": [
          {
            "/": "/product/*",
            "comment": "Product detail pages"
          },
          {
            "/": "/user/*",
            "comment": "User profiles"
          },
          {
            "/": "/search",
            "?": { "query": "*" },
            "comment": "Search with query"
          }
        ]
      }
    ]
  },
  "webcredentials": {
    "apps": ["TEAMID.com.example.myapp"]
  }
}
```

### Step 3: Android Configuration (App Links)

#### 3.1 AndroidManifest.xml

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:name=".MainApplication"
        android:label="@string/app_name">

        <activity
            android:name=".MainActivity"
            android:launchMode="singleTask"
            android:exported="true">

            <!-- Intent Filter for Universal Links -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="https"
                    android:host="example.com"
                    android:pathPrefix="/product" />
                <data
                    android:scheme="https"
                    android:host="example.com"
                    android:pathPrefix="/user" />
                <data
                    android:scheme="https"
                    android:host="www.example.com"
                    android:pathPrefix="/product" />
            </intent-filter>

            <!-- Intent Filter for Custom Scheme -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="myapp" />
            </intent-filter>

        </activity>
    </application>
</manifest>
```

#### 3.2 assetlinks.json File (on server)

```json
// https://example.com/.well-known/assetlinks.json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.example.myapp",
      "sha256_cert_fingerprints": [
        "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
      ]
    }
  }
]
```

```bash
# Get SHA256 fingerprint
cd android
./gradlew signingReport

# Or from keystore
keytool -list -v -keystore app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Step 4: Hooks and Utils

```typescript
// src/hooks/useDeepLink.ts
import { useEffect, useCallback } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface DeepLinkHandler {
  pattern: RegExp;
  handler: (matches: RegExpMatchArray, navigate: any) => void;
}

const deepLinkHandlers: DeepLinkHandler[] = [
  {
    pattern: /\/product\/([a-zA-Z0-9-]+)/,
    handler: (matches, navigate) => {
      navigate('ProductDetail', { id: matches[1] });
    },
  },
  {
    pattern: /\/user\/(\d+)/,
    handler: (matches, navigate) => {
      navigate('UserProfile', { userId: matches[1] });
    },
  },
  {
    pattern: /\/search\?query=([^&]+)/,
    handler: (matches, navigate) => {
      navigate('Search', { query: decodeURIComponent(matches[1]) });
    },
  },
];

export function useDeepLinkHandler() {
  const navigation = useNavigation();

  const handleDeepLink = useCallback(
    (url: string) => {
      console.log('Deep link received:', url);

      for (const { pattern, handler } of deepLinkHandlers) {
        const matches = url.match(pattern);
        if (matches) {
          handler(matches, navigation.navigate);
          return;
        }
      }

      console.warn('No handler for deep link:', url);
    },
    [navigation]
  );

  useEffect(() => {
    // Handle initial link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for links during runtime
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);
}

// Utility function to create links
export function createDeepLink(
  route: string,
  params?: Record<string, string | number>
): string {
  const baseUrl = 'https://example.com';
  let url = `${baseUrl}${route}`;

  if (params) {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    url += `?${queryString}`;
  }

  return url;
}
```

### Step 5: Tests

```typescript
// __tests__/deepLink.test.ts
import { linking } from '../src/navigation/linking';
import { getPathFromState, getStateFromPath } from '@react-navigation/native';

describe('Deep Linking', () => {
  describe('URL to State', () => {
    it('parses product detail URL', () => {
      const state = getStateFromPath(
        'https://example.com/product/abc-123',
        linking.config
      );

      expect(state?.routes[0]).toMatchObject({
        name: 'ProductDetail',
        params: { id: 'abc-123' },
      });
    });

    it('parses search URL with query', () => {
      const state = getStateFromPath(
        'https://example.com/search?query=shoes&category=fashion',
        linking.config
      );

      expect(state?.routes[0]).toMatchObject({
        name: 'Search',
        params: {
          query: 'shoes',
          category: 'fashion',
        },
      });
    });

    it('handles custom scheme', () => {
      const state = getStateFromPath('myapp://product/xyz', linking.config);

      expect(state?.routes[0]).toMatchObject({
        name: 'ProductDetail',
        params: { id: 'xyz' },
      });
    });
  });

  describe('State to URL', () => {
    it('generates correct URL', () => {
      const state = {
        routes: [
          {
            name: 'ProductDetail',
            params: { id: 'abc-123' },
          },
        ],
      };

      const path = getPathFromState(state, linking.config);

      expect(path).toBe('/product/abc-123');
    });
  });
});
```

```bash
# Manual testing
# iOS Simulator
xcrun simctl openurl booted "myapp://product/123"
xcrun simctl openurl booted "https://example.com/product/123"

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "myapp://product/123"
adb shell am start -W -a android.intent.action.VIEW -d "https://example.com/product/123"
```

### Summary

```
══════════════════════════════════════════════════════════════
✅ DEEP LINKING CONFIGURED
══════════════════════════════════════════════════════════════

📁 Modified files:

React Native:
- src/navigation/linking.ts
- src/navigation/RootNavigator.tsx
- src/hooks/useDeepLink.ts

iOS:
- ios/{App}/{App}.entitlements
- ios/{App}/Info.plist
- ios/{App}/AppDelegate.swift

Android:
- android/app/src/main/AndroidManifest.xml

Server (to deploy):
- /.well-known/apple-app-site-association
- /.well-known/assetlinks.json

📝 Configured routes:
| Pattern | Screen | Example |
|---------|--------|---------|
| /product/:id | ProductDetail | /product/abc-123 |
| /user/:userId | UserProfile | /user/456 |
| /search?query= | Search | /search?query=shoes |

🔧 Test commands:
# iOS
xcrun simctl openurl booted "myapp://product/123"

# Android
adb shell am start -W -a android.intent.action.VIEW -d "myapp://product/123"

⚠️ Next steps:
1. Deploy .well-known files on server
2. Add domain in Apple Developer Console
3. Verify SHA256 fingerprints for Android
4. Test on physical devices
```

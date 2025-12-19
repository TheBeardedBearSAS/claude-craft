---
description: React Native Deep Linking Konfiguration
argument-hint: [arguments]
---

# React Native Deep Linking Konfiguration

Sie sind ein Senior React Native Entwickler. Sie müssen Deep Linking (iOS Universal Links, Android App Links) für die Anwendung konfigurieren.

## Argumente
$ARGUMENTS

Argumente:
- Domain (z.B. `example.com`, `app.mysite.com`)
- (Optional) Custom Scheme (z.B. `myapp`)

Beispiel: `/reactnative:deep-link example.com myapp`

## MISSION

### Schritt 1: React Navigation Konfiguration

```typescript
// src/navigation/linking.ts
import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  // Akzeptierte Präfixe
  prefixes: [
    'https://example.com',
    'https://www.example.com',
    'myapp://',  // Custom Scheme
  ],

  // Routen-Konfiguration
  config: {
    // Initial-Screen falls keine Übereinstimmung
    initialRouteName: 'Home',

    screens: {
      // Einfache Route
      Home: '',
      About: 'about',

      // Route mit Parameter
      ProductDetail: {
        path: 'product/:id',
        parse: {
          id: (id: string) => id,
        },
      },

      // Route mit mehreren Parametern
      UserProfile: {
        path: 'user/:userId/post/:postId',
        parse: {
          userId: (userId: string) => userId,
          postId: (postId: string) => parseInt(postId, 10),
        },
      },

      // Verschachtelte Routen (Tab Navigator)
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

      // Route mit Query-Parametern
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

      // Catch-all Route für 404
      NotFound: '*',
    },
  },

  // Funktion zum Abrufen der Initial-URL
  async getInitialURL() {
    // Prüfen, ob App über Deep Link geöffnet wurde
    const url = await Linking.getInitialURL();
    if (url != null) {
      return url;
    }

    // Push-Benachrichtigungen prüfen (falls zutreffend)
    const notification = await messaging().getInitialNotification();
    if (notification?.data?.link) {
      return notification.data.link as string;
    }

    return null;
  },

  // Listener für Links während App geöffnet ist
  subscribe(listener) {
    // React Native Links lauschen
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      listener(url);
    });

    // Push-Benachrichtigungen lauschen
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
        // Analytics-Tracking
        const currentRoute = state?.routes[state.index];
        analytics.screen(currentRoute?.name);
      }}
    >
      <RootStack.Navigator>
        {/* ... Screens ... */}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
```

### Schritt 2: iOS Konfiguration (Universal Links)

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

<!-- Schemes erlauben -->
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

  // Custom URL Scheme behandeln
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey : Any] = [:]
  ) -> Bool {
    return RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Links behandeln
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

#### 2.4 AASA-Datei (auf Server)

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
            "comment": "Produktdetailseiten"
          },
          {
            "/": "/user/*",
            "comment": "Benutzerprofile"
          },
          {
            "/": "/search",
            "?": { "query": "*" },
            "comment": "Suche mit Query"
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

### Schritt 3: Android Konfiguration (App Links)

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

            <!-- Intent Filter für Universal Links -->
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

            <!-- Intent Filter für Custom Scheme -->
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

#### 3.2 assetlinks.json Datei (auf Server)

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
# SHA256 Fingerprint abrufen
cd android
./gradlew signingReport

# Oder aus Keystore
keytool -list -v -keystore app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Schritt 4: Hooks und Utils

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
      console.log('Deep Link empfangen:', url);

      for (const { pattern, handler } of deepLinkHandlers) {
        const matches = url.match(pattern);
        if (matches) {
          handler(matches, navigation.navigate);
          return;
        }
      }

      console.warn('Kein Handler für Deep Link:', url);
    },
    [navigation]
  );

  useEffect(() => {
    // Initial Link behandeln
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Links während Laufzeit lauschen
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);
}

// Utility-Funktion zum Erstellen von Links
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

### Schritt 5: Tests

```typescript
// __tests__/deepLink.test.ts
import { linking } from '../src/navigation/linking';
import { getPathFromState, getStateFromPath } from '@react-navigation/native';

describe('Deep Linking', () => {
  describe('URL zu State', () => {
    it('parst Produktdetail-URL', () => {
      const state = getStateFromPath(
        'https://example.com/product/abc-123',
        linking.config
      );

      expect(state?.routes[0]).toMatchObject({
        name: 'ProductDetail',
        params: { id: 'abc-123' },
      });
    });

    it('parst Such-URL mit Query', () => {
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

    it('behandelt Custom Scheme', () => {
      const state = getStateFromPath('myapp://product/xyz', linking.config);

      expect(state?.routes[0]).toMatchObject({
        name: 'ProductDetail',
        params: { id: 'xyz' },
      });
    });
  });

  describe('State zu URL', () => {
    it('generiert korrekte URL', () => {
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
# Manuelles Testen
# iOS Simulator
xcrun simctl openurl booted "myapp://product/123"
xcrun simctl openurl booted "https://example.com/product/123"

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "myapp://product/123"
adb shell am start -W -a android.intent.action.VIEW -d "https://example.com/product/123"
```

### Zusammenfassung

```
══════════════════════════════════════════════════════════════
✅ DEEP LINKING KONFIGURIERT
══════════════════════════════════════════════════════════════

📁 Geänderte Dateien:

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

Server (zu deployen):
- /.well-known/apple-app-site-association
- /.well-known/assetlinks.json

📝 Konfigurierte Routen:
| Pattern | Screen | Beispiel |
|---------|--------|---------|
| /product/:id | ProductDetail | /product/abc-123 |
| /user/:userId | UserProfile | /user/456 |
| /search?query= | Search | /search?query=shoes |

🔧 Test-Befehle:
# iOS
xcrun simctl openurl booted "myapp://product/123"

# Android
adb shell am start -W -a android.intent.action.VIEW -d "myapp://product/123"

⚠️ Nächste Schritte:
1. .well-known Dateien auf Server deployen
2. Domain in Apple Developer Console hinzufügen
3. SHA256 Fingerprints für Android überprüfen
4. Auf physischen Geräten testen
```

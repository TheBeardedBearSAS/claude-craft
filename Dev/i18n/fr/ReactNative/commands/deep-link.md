---
description: Configuration Deep Linking React Native
argument-hint: [arguments]
---

# Configuration Deep Linking React Native

Tu es un développeur React Native senior. Tu dois configurer le deep linking (universal links iOS, app links Android) pour l'application.

## Arguments
$ARGUMENTS

Arguments :
- Domaine (ex: `example.com`, `app.mysite.com`)
- (Optionnel) Scheme personnalisé (ex: `myapp`)

Exemple : `/reactnative:deep-link example.com myapp`

## MISSION

### Étape 1 : Configuration React Navigation

```typescript
// src/navigation/linking.ts
import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  // Préfixes acceptés
  prefixes: [
    'https://example.com',
    'https://www.example.com',
    'myapp://',  // Custom scheme
  ],

  // Configuration des routes
  config: {
    // Écran initial si pas de match
    initialRouteName: 'Home',

    screens: {
      // Route simple
      Home: '',
      About: 'about',

      // Route avec paramètre
      ProductDetail: {
        path: 'product/:id',
        parse: {
          id: (id: string) => id,
        },
      },

      // Route avec paramètres multiples
      UserProfile: {
        path: 'user/:userId/post/:postId',
        parse: {
          userId: (userId: string) => userId,
          postId: (postId: string) => parseInt(postId, 10),
        },
      },

      // Routes imbriquées (Tab Navigator)
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

      // Route avec query params
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

      // Route catch-all pour le 404
      NotFound: '*',
    },
  },

  // Fonction pour récupérer l'URL initiale
  async getInitialURL() {
    // Vérifier si l'app a été ouverte via un deep link
    const url = await Linking.getInitialURL();
    if (url != null) {
      return url;
    }

    // Vérifier les notifications push (si applicable)
    const notification = await messaging().getInitialNotification();
    if (notification?.data?.link) {
      return notification.data.link as string;
    }

    return null;
  },

  // Listener pour les liens pendant que l'app est ouverte
  subscribe(listener) {
    // Écouter les liens React Native
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      listener(url);
    });

    // Écouter les notifications push
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

### Étape 2 : Configuration iOS (Universal Links)

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

<!-- Autoriser les schemes -->
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

#### 2.4 Fichier AASA (sur le serveur)

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

### Étape 3 : Configuration Android (App Links)

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

            <!-- Intent Filter pour Universal Links -->
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

            <!-- Intent Filter pour Custom Scheme -->
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

#### 3.2 Fichier assetlinks.json (sur le serveur)

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
# Obtenir le fingerprint SHA256
cd android
./gradlew signingReport

# Ou depuis le keystore
keytool -list -v -keystore app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Étape 4 : Hooks et Utils

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
    // Gérer le lien initial
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Écouter les liens pendant l'exécution
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);
}

// Fonction utilitaire pour créer des liens
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

### Étape 5 : Tests

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
# Tester manuellement
# iOS Simulator
xcrun simctl openurl booted "myapp://product/123"
xcrun simctl openurl booted "https://example.com/product/123"

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "myapp://product/123"
adb shell am start -W -a android.intent.action.VIEW -d "https://example.com/product/123"
```

### Résumé

```
══════════════════════════════════════════════════════════════
✅ DEEP LINKING CONFIGURÉ
══════════════════════════════════════════════════════════════

📁 Fichiers modifiés :

React Native :
- src/navigation/linking.ts
- src/navigation/RootNavigator.tsx
- src/hooks/useDeepLink.ts

iOS :
- ios/{App}/{App}.entitlements
- ios/{App}/Info.plist
- ios/{App}/AppDelegate.swift

Android :
- android/app/src/main/AndroidManifest.xml

Serveur (à déployer) :
- /.well-known/apple-app-site-association
- /.well-known/assetlinks.json

📝 Routes configurées :
| Pattern | Screen | Exemple |
|---------|--------|---------|
| /product/:id | ProductDetail | /product/abc-123 |
| /user/:userId | UserProfile | /user/456 |
| /search?query= | Search | /search?query=shoes |

🔧 Commandes de test :
# iOS
xcrun simctl openurl booted "myapp://product/123"

# Android
adb shell am start -W -a android.intent.action.VIEW -d "myapp://product/123"

⚠️ Prochaines étapes :
1. Déployer les fichiers .well-known sur le serveur
2. Ajouter le domaine dans Apple Developer Console
3. Vérifier les fingerprints SHA256 pour Android
4. Tester sur devices physiques
```

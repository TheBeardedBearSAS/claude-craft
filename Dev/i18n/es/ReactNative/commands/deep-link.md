---
description: Configuración de Deep Linking en React Native
argument-hint: [argumentos]
---

# Configuración de Deep Linking en React Native

Eres un desarrollador senior de React Native. Debes configurar el deep linking (universal links de iOS, app links de Android) para la aplicación.

## Argumentos
$ARGUMENTS

Argumentos:
- Dominio (p. ej., `example.com`, `app.mysite.com`)
- (Opcional) Esquema personalizado (p. ej., `myapp`)

Ejemplo: `/reactnative:deep-link example.com myapp`

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el código impactado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio.

## MISIÓN

### Paso 1: Configuración de React Navigation

```typescript
// src/navigation/linking.ts
import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  // Prefijos aceptados
  prefixes: [
    'https://example.com',
    'https://www.example.com',
    'myapp://',  // Esquema personalizado
  ],

  // Configuración de rutas
  config: {
    // Pantalla inicial si no hay coincidencia
    initialRouteName: 'Home',

    screens: {
      // Ruta simple
      Home: '',
      About: 'about',

      // Ruta con parámetro
      ProductDetail: {
        path: 'product/:id',
        parse: {
          id: (id: string) => id,
        },
      },

      // Ruta con múltiples parámetros
      UserProfile: {
        path: 'user/:userId/post/:postId',
        parse: {
          userId: (userId: string) => userId,
          postId: (postId: string) => parseInt(postId, 10),
        },
      },

      // Rutas anidadas (Tab Navigator)
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

      // Ruta con query params
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

      // Ruta catch-all para 404
      NotFound: '*',
    },
  },

  // Función para obtener la URL inicial
  async getInitialURL() {
    // Comprobar si la app fue abierta vía deep link
    const url = await Linking.getInitialURL();
    if (url != null) {
      return url;
    }

    // Comprobar notificaciones push (si aplica)
    const notification = await messaging().getInitialNotification();
    if (notification?.data?.link) {
      return notification.data.link as string;
    }

    return null;
  },

  // Listener de links mientras la app está abierta
  subscribe(listener) {
    // Escuchar links de React Native
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      listener(url);
    });

    // Escuchar notificaciones push
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
        // Seguimiento de analytics
        const currentRoute = state?.routes[state.index];
        analytics.screen(currentRoute?.name);
      }}
    >
      <RootStack.Navigator>
        {/* ... pantallas ... */}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
```

### Paso 2: Configuración iOS (Universal Links)

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

#### 2.2 URL Schemes (Personalizado)

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

<!-- Permitir esquemas -->
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

  // Manejar esquema de URL personalizado
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey : Any] = [:]
  ) -> Bool {
    return RCTLinkingManager.application(app, open: url, options: options)
  }

  // Manejar Universal Links
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

#### 2.4 Archivo AASA (en el servidor)

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
            "comment": "Páginas de detalle de producto"
          },
          {
            "/": "/user/*",
            "comment": "Perfiles de usuario"
          },
          {
            "/": "/search",
            "?": { "query": "*" },
            "comment": "Búsqueda con query"
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

### Paso 3: Configuración Android (App Links)

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

            <!-- Intent Filter para Universal Links -->
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

            <!-- Intent Filter para Esquema Personalizado -->
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

#### 3.2 Archivo assetlinks.json (en el servidor)

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
# Obtener la huella SHA256
cd android
./gradlew signingReport

# O desde el keystore
keytool -list -v -keystore app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Paso 4: Hooks y Utilidades

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
      console.log('Deep link recibido:', url);

      for (const { pattern, handler } of deepLinkHandlers) {
        const matches = url.match(pattern);
        if (matches) {
          handler(matches, navigation.navigate);
          return;
        }
      }

      console.warn('Sin handler para deep link:', url);
    },
    [navigation]
  );

  useEffect(() => {
    // Manejar link inicial
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Escuchar links durante la ejecución
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);
}

// Función utilitaria para crear links
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

### Paso 5: Tests

```typescript
// __tests__/deepLink.test.ts
import { linking } from '../src/navigation/linking';
import { getPathFromState, getStateFromPath } from '@react-navigation/native';

describe('Deep Linking', () => {
  describe('URL a Estado', () => {
    it('parsea URL de detalle de producto', () => {
      const state = getStateFromPath(
        'https://example.com/product/abc-123',
        linking.config
      );

      expect(state?.routes[0]).toMatchObject({
        name: 'ProductDetail',
        params: { id: 'abc-123' },
      });
    });

    it('parsea URL de búsqueda con query', () => {
      const state = getStateFromPath(
        'https://example.com/search?query=zapatos&category=moda',
        linking.config
      );

      expect(state?.routes[0]).toMatchObject({
        name: 'Search',
        params: {
          query: 'zapatos',
          category: 'moda',
        },
      });
    });

    it('maneja esquema personalizado', () => {
      const state = getStateFromPath('myapp://product/xyz', linking.config);

      expect(state?.routes[0]).toMatchObject({
        name: 'ProductDetail',
        params: { id: 'xyz' },
      });
    });
  });

  describe('Estado a URL', () => {
    it('genera la URL correcta', () => {
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
# Pruebas manuales
# Simulador iOS
xcrun simctl openurl booted "myapp://product/123"
xcrun simctl openurl booted "https://example.com/product/123"

# Emulador Android
adb shell am start -W -a android.intent.action.VIEW -d "myapp://product/123"
adb shell am start -W -a android.intent.action.VIEW -d "https://example.com/product/123"
```

### Resumen

```
══════════════════════════════════════════════════════════════
✅ DEEP LINKING CONFIGURADO
══════════════════════════════════════════════════════════════

📁 Archivos modificados:

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

Servidor (a desplegar):
- /.well-known/apple-app-site-association
- /.well-known/assetlinks.json

📝 Rutas configuradas:
| Patrón | Pantalla | Ejemplo |
|--------|----------|---------|
| /product/:id | ProductDetail | /product/abc-123 |
| /user/:userId | UserProfile | /user/456 |
| /search?query= | Search | /search?query=zapatos |

🔧 Comandos de prueba:
# iOS
xcrun simctl openurl booted "myapp://product/123"

# Android
adb shell am start -W -a android.intent.action.VIEW -d "myapp://product/123"

⚠️ Próximos pasos:
1. Desplegar los archivos .well-known en el servidor
2. Añadir el dominio en Apple Developer Console
3. Verificar las huellas SHA256 para Android
4. Probar en dispositivos físicos
```

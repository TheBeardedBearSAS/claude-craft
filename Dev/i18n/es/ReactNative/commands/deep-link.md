---
description: Generación de Deep Link
---

# Generación de Deep Link

Crea e implementa deep links para la aplicación React Native.

## Deep Link Estructura

```
# URL Scheme
myapp://screen/id

# Universal Links (iOS)
https://myapp.com/screen/id

# App Links (Android)
https://myapp.com/screen/id
```

## 1. Configuración Expo

```typescript
// app.json
{
  "expo": {
    "scheme": "myapp",
    "ios": {
      "associatedDomains": ["applinks:myapp.com"]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "myapp.com",
              "pathPrefix": "/"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

## 2. Manejo de Deep Links

```typescript
import * as Linking from 'expo-linking';
import { useURL } from 'expo-linking';

// Hook personalizado
export const useDeepLink = () => {
  const url = useURL();

  useEffect(() => {
    if (url) {
      handleDeepLink(url);
    }
  }, [url]);

  const handleDeepLink = (url: string) => {
    const { hostname, path, queryParams } = Linking.parse(url);

    // Navegar según la URL
    if (path === 'product') {
      navigation.navigate('Product', { id: queryParams.id });
    }
  };
};
```

## 3. Generación de Deep Links

```typescript
// Crear deep link
const createDeepLink = (screen: string, params?: object) => {
  return Linking.createURL(screen, { queryParams: params });
};

// Ejemplo
const productLink = createDeepLink('product', { id: '123' });
// Result: myapp://product?id=123

// Compartir
await Share.share({
  message: 'Check out this product!',
  url: productLink
});
```

## 4. Testing

```bash
# iOS
xcrun simctl openurl booted "myapp://product?id=123"

# Android
adb shell am start -W -a android.intent.action.VIEW -d "myapp://product?id=123"

# Universal Links
adb shell am start -W -a android.intent.action.VIEW -d "https://myapp.com/product/123"
```

## 5. Validación

```typescript
// Validar deep link
const isValidDeepLink = (url: string): boolean => {
  const validSchemes = ['myapp', 'https'];
  const validHosts = ['myapp.com'];

  const { scheme, hostname } = Linking.parse(url);

  return validSchemes.includes(scheme) &&
         (!hostname || validHosts.includes(hostname));
};
```

## Casos de Uso

- Notificaciones push
- Compartir contenido
- Email marketing
- QR codes
- Redes sociales

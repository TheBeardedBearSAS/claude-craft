---
description: Preparación para las Tiendas
---

# Preparación para las Tiendas

Prepara la aplicación para publicación en App Store y Google Play.

## 1. Assets Requeridos

### iOS App Store

**Iconos:**
- App Icon: 1024x1024px (sin alpha)

**Capturas de Pantalla:**
- iPhone 6.7": 1290x2796px
- iPhone 6.5": 1284x2778px
- iPhone 5.5": 1242x2208px
- iPad Pro 12.9": 2048x2732px

**Otros:**
- Privacy Policy URL
- Support URL
- Marketing URL (opcional)

### Google Play Store

**Iconos:**
- App Icon: 512x512px (PNG, 32-bit)
- Feature Graphic: 1024x500px

**Capturas de Pantalla:**
- Phone: 16:9 o 9:16, mín 320px
- Tablet 7": min 1024px
- Tablet 10": min 1920px

**Otros:**
- Privacy Policy URL
- Short Description (80 chars)
- Full Description (4000 chars)

## 2. Metadatos

### app.json / app.config.js

```json
{
  "expo": {
    "name": "My App",
    "slug": "my-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.company.myapp",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "Permite tomar fotos",
        "NSPhotoLibraryUsageDescription": "Permite acceder a fotos"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.company.myapp",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

## 3. Build de Producción

### Con EAS Build

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar proyecto
eas build:configure

# Build iOS
eas build --platform ios --profile production

# Build Android
eas build --platform android --profile production
```

### eas.json

```json
{
  "build": {
    "production": {
      "releaseChannel": "production",
      "env": {
        "APP_ENV": "production"
      },
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD1234"
      },
      "android": {
        "serviceAccountKeyPath": "./pc-api-key.json",
        "track": "internal"
      }
    }
  }
}
```

## 4. Configuración iOS

### Certificates y Provisioning

```bash
# Con EAS
eas credentials

# Manual
# 1. Crear App ID en Apple Developer
# 2. Crear Certificates
# 3. Crear Provisioning Profiles
# 4. Configurar en Xcode
```

### App Store Connect

1. Crear nueva app
2. Llenar información
3. Cargar screenshots
4. Configurar precio
5. Agregar build
6. Submit para revisión

## 5. Configuración Android

### Signing Key

```bash
# Generar keystore
keytool -genkeypair -v -storetype PKCS12 \
  -keystore my-app.keystore \
  -alias my-app-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Guardar en secrets
```

### Google Play Console

1. Crear nueva app
2. Llenar información
3. Cargar screenshots
4. Configurar precios
5. Crear release
6. Cargar AAB/APK
7. Roll out

## 6. Checklist Pre-Launch

### Técnico
- [ ] App testada en dispositivos reales
- [ ] No hay console.logs
- [ ] Environment variables correctas
- [ ] Analytics configurado
- [ ] Crash reporting activado
- [ ] Deep links funcionando
- [ ] Push notifications probadas
- [ ] Performance optimizado
- [ ] Bundle size aceptable

### Contenido
- [ ] Iconos de todas las sizes
- [ ] Screenshots actualizadas
- [ ] Descripción completa
- [ ] Keywords optimizadas
- [ ] Privacy policy publicada
- [ ] Support URL funcional
- [ ] Términos de servicio

### Legal
- [ ] Privacy policy completa
- [ ] GDPR compliance
- [ ] Términos de uso
- [ ] Permisos justificados
- [ ] Copyright correcto

## 7. Submission

```bash
# iOS
eas submit --platform ios --profile production

# Android
eas submit --platform android --profile production
```

## 8. Post-Launch

- Monitorear crashes
- Responder reviews
- Analizar métricas
- Preparar updates
- Planear siguiente versión

## Timeline Estimado

- **iOS Review**: 1-7 días
- **Android Review**: 1-3 días
- **Preparación total**: 1-2 semanas

## Recursos

- [Apple App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)

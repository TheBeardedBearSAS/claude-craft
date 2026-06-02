---
description: Lista de Verificación para Publicación en Tiendas de React Native
argument-hint: [argumentos]
---

# Lista de Verificación para Publicación en Tiendas de React Native

Eres un experto en publicación de aplicaciones móviles. Debes preparar la aplicación para su envío a la App Store (iOS) y Google Play Store (Android).

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Tienda: ios, android, both
- (Opcional) Tipo: new, update

Ejemplo: `/reactnative:store-prepare both new`

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

### Paso 1: Lista de Verificación Pre-Envío

```
══════════════════════════════════════════════════════════════
📱 LISTA DE VERIFICACIÓN PARA PUBLICACIÓN EN TIENDAS
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🔧 CONFIGURACIÓN TÉCNICA
──────────────────────────────────────────────────────────────

### Versión y Build

[ ] Versión incrementada (semver)
    - iOS: CFBundleShortVersionString
    - Android: versionName

[ ] Número de build incrementado
    - iOS: CFBundleVersion (entero)
    - Android: versionCode (entero)

[ ] Changelog preparado para esta versión

### Build de Release

[ ] Modo release configurado (sin modo dev)
[ ] Bundle JS optimizado
[ ] ProGuard/R8 habilitado (Android)
[ ] Bitcode deshabilitado si es necesario (iOS)
[ ] Hermes habilitado (recomendado)

### Seguridad

[ ] Claves API en variables de entorno
[ ] Sin secretos en el código
[ ] Certificate pinning si es necesario
[ ] Keystore firmado correctamente (Android)
[ ] Perfil de aprovisionamiento válido (iOS)
```

### Paso 2: Configuración iOS

```xml
<!-- ios/{App}/Info.plist -->

<!-- Versión -->
<key>CFBundleShortVersionString</key>
<string>1.2.0</string>
<key>CFBundleVersion</key>
<string>45</string>

<!-- Permisos (con descripciones para el usuario) -->
<key>NSCameraUsageDescription</key>
<string>Esta aplicación usa la cámara para escanear códigos QR.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Esta aplicación accede a tus fotos para permitirte subir imágenes.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Esta aplicación usa tu ubicación para mostrar tiendas cercanas.</string>

<key>NSFaceIDUsageDescription</key>
<string>Esta aplicación usa Face ID para asegurar el acceso a tu cuenta.</string>

<key>NSMicrophoneUsageDescription</key>
<string>Esta aplicación usa el micrófono para mensajes de voz.</string>

<!-- App Transport Security -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <!-- Excepciones si es necesario -->
</dict>

<!-- Capacidades requeridas -->
<key>UIRequiredDeviceCapabilities</key>
<array>
    <string>armv7</string>
</array>

<!-- Orientaciones soportadas -->
<key>UISupportedInterfaceOrientations</key>
<array>
    <string>UIInterfaceOrientationPortrait</string>
</array>
<key>UISupportedInterfaceOrientations~ipad</key>
<array>
    <string>UIInterfaceOrientationPortrait</string>
    <string>UIInterfaceOrientationLandscapeLeft</string>
    <string>UIInterfaceOrientationLandscapeRight</string>
</array>
```

```ruby
# ios/Podfile - Configuración de Release
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # iOS mínimo
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'

      # Bitcode
      config.build_settings['ENABLE_BITCODE'] = 'NO'

      # Arquitectura
      config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
    end
  end
end
```

### Paso 3: Configuración Android

```groovy
// android/app/build.gradle

android {
    compileSdkVersion 34
    buildToolsVersion "34.0.0"

    defaultConfig {
        applicationId "com.example.myapp"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 45
        versionName "1.2.0"
    }

    signingConfigs {
        release {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }
    }

    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }

    // App Bundle (recomendado)
    bundle {
        language {
            enableSplit = false // Mantener todos los idiomas
        }
        density {
            enableSplit = true
        }
        abi {
            enableSplit = true
        }
    }
}
```

```properties
# android/gradle.properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=***
MYAPP_UPLOAD_KEY_PASSWORD=***

# Optimización de build
org.gradle.jvmargs=-Xmx4g
org.gradle.daemon=true
org.gradle.parallel=true
```

### Paso 4: Recursos de Marketing

```
══════════════════════════════════════════════════════════════
🎨 RECURSOS REQUERIDOS
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🍎 APP STORE (iOS)
──────────────────────────────────────────────────────────────

### Ícono de la App
- 1024x1024 px (PNG, sin transparencia, sin esquinas redondeadas)

### Capturas de Pantalla iPhone
Tamaños requeridos (al menos uno):
- iPhone 6.7" (1290 × 2796 px) - iPhone 15 Pro Max
- iPhone 6.5" (1242 × 2688 px) - iPhone 11 Pro Max
- iPhone 5.5" (1242 × 2208 px) - iPhone 8 Plus

### Capturas de Pantalla iPad
Tamaños requeridos (si se soporta iPad):
- iPad Pro 12.9" (2048 × 2732 px)
- iPad Pro 11" (1668 × 2388 px)

### Vista Previa de la App (video opcional)
- 15-30 segundos
- Formato .mov o .mp4
- Mismas resoluciones que las capturas de pantalla

### Textos
- Nombre de la app (máximo 30 caracteres)
- Subtítulo (máximo 30 caracteres)
- Descripción (máximo 4000 caracteres)
- Palabras clave (máximo 100 caracteres, separadas por comas)
- URL de soporte
- URL de política de privacidad
- Notas de la versión (máximo 4000 caracteres)

──────────────────────────────────────────────────────────────
🤖 GOOGLE PLAY (Android)
──────────────────────────────────────────────────────────────

### Ícono de la App
- 512x512 px (PNG 32-bit con alpha)

### Gráfico Destacado
- 1024x500 px (PNG o JPG)

### Capturas de Pantalla de Teléfono
- Mínimo 2, máximo 8
- 16:9 o 9:16
- Mínimo 320px, máximo 3840px
- PNG o JPG

### Capturas de Pantalla de Tablet 7"
- Opcional pero recomendado
- Mismas especificaciones que teléfono

### Capturas de Pantalla de Tablet 10"
- Opcional pero recomendado

### Video promocional (opcional)
- URL de YouTube
- No listado o público

### Textos
- Título (máximo 50 caracteres)
- Descripción corta (máximo 80 caracteres)
- Descripción completa (máximo 4000 caracteres)
- Notas de la versión (máximo 500 caracteres)
- URL de política de privacidad
- Email del desarrollador
```

### Paso 5: Build y Firma

```bash
#!/bin/bash
# scripts/build-release.sh

set -e

echo "📱 Construyendo Release..."

# Variables
VERSION=$(node -p "require('./package.json').version")
BUILD_NUMBER=$(date +%Y%m%d%H%M)

echo "Versión: $VERSION"
echo "Build: $BUILD_NUMBER"

# iOS
echo "🍎 Construyendo iOS..."
cd ios

# Actualizar número de build
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $BUILD_NUMBER" {App}/Info.plist

# Archivar
xcodebuild -workspace {App}.xcworkspace \
  -scheme {App} \
  -configuration Release \
  -archivePath build/{App}.xcarchive \
  archive

# Exportar IPA
xcodebuild -exportArchive \
  -archivePath build/{App}.xcarchive \
  -exportPath build \
  -exportOptionsPlist ExportOptions.plist

cd ..

# Android
echo "🤖 Construyendo Android..."
cd android

# Actualizar versionCode en build.gradle o mediante variable
./gradlew bundleRelease

# Opcional: también generar APK
./gradlew assembleRelease

cd ..

echo "✅ ¡Build completado!"
echo "iOS: ios/build/{App}.ipa"
echo "Android: android/app/build/outputs/bundle/release/app-release.aab"
```

```plist
<!-- ios/ExportOptions.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>XXXXXXXXXX</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
```

### Paso 6: Envío

#### iOS - App Store Connect

```bash
# Mediante Xcode
# Xcode > Product > Archive > Distribute App

# Mediante línea de comandos (Transporter)
xcrun altool --upload-app \
  -f build/{App}.ipa \
  -t ios \
  -u "apple-id@example.com" \
  -p "@keychain:AC_PASSWORD"

# O mediante Fastlane
fastlane ios release
```

#### Android - Google Play Console

```bash
# Mediante Play Console web
# https://play.google.com/console

# O mediante Fastlane
fastlane android release

# O mediante bundletool
bundletool build-apks --bundle=app-release.aab --output=app.apks

# Mediante Google Play Developer API
# (requiere cuenta de servicio)
```

### Paso 7: Lista de Verificación Final

```
══════════════════════════════════════════════════════════════
✅ LISTA DE VERIFICACIÓN FINAL PRE-ENVÍO
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📱 TESTS
──────────────────────────────────────────────────────────────

[ ] App probada en dispositivo iOS físico
[ ] App probada en dispositivo Android físico
[ ] Tests en versiones antiguas de SO (iOS 13, Android 7)
[ ] Tests en diferentes tamaños de pantalla
[ ] Tests de modo oscuro
[ ] Tests sin conexión
[ ] Tests con datos reales
[ ] Tests de rendimiento
[ ] Tests de crashes/ANR
[ ] Tests de accesibilidad (VoiceOver, TalkBack)

──────────────────────────────────────────────────────────────
🔒 CUMPLIMIENTO
──────────────────────────────────────────────────────────────

[ ] Política de privacidad accesible
[ ] Términos de servicio
[ ] Cumplimiento GDPR (si aplica en Europa)
    - Consentimiento de cookies
    - Derecho a eliminación
    - Exportación de datos
[ ] Cumplimiento COPPA (si es para niños)
[ ] Declaraciones de permisos
[ ] Sin contenido prohibido

──────────────────────────────────────────────────────────────
🍎 ESPECÍFICO iOS
──────────────────────────────────────────────────────────────

[ ] App Review Guidelines cumplidas
[ ] Sin enlaces a tiendas externas
[ ] In-App Purchase si hay contenido digital
[ ] Sign in with Apple si hay otras autenticaciones sociales
[ ] App Tracking Transparency si hay seguimiento
[ ] Perfil de aprovisionamiento válido
[ ] Notificaciones push configuradas (si aplica)
[ ] TestFlight probado

──────────────────────────────────────────────────────────────
🤖 ESPECÍFICO ANDROID
──────────────────────────────────────────────────────────────

[ ] Nivel de API objetivo reciente (34+)
[ ] Políticas de Play Store cumplidas
[ ] Formulario de seguridad de datos completado
[ ] Cuestionario de clasificación de contenido
[ ] Firma de app por Google Play
[ ] Pruebas internas/cerradas realizadas
[ ] Lanzamiento gradual planificado

──────────────────────────────────────────────────────────────
📄 DOCUMENTOS LISTOS
──────────────────────────────────────────────────────────────

[ ] Capturas de pantalla en todos los idiomas soportados
[ ] Gráfico destacado (Android)
[ ] Ícono de la app en alta resolución
[ ] Descripciones en todos los idiomas
[ ] Notas de la versión
[ ] Video promocional (opcional)

──────────────────────────────────────────────────────────────
🚀 ENVÍO
──────────────────────────────────────────────────────────────

[ ] Build subido a App Store Connect
[ ] Build subido a Play Console
[ ] Metadatos completos
[ ] Precio y disponibilidad configurados
[ ] Fecha de lanzamiento elegida (inmediata o programada)
[ ] Preguntas de revisión preparadas
```

### Paso 8: Post-Publicación

```
══════════════════════════════════════════════════════════════
📊 DESPUÉS DE LA PUBLICACIÓN
══════════════════════════════════════════════════════════════

[ ] Monitoreo de crashes (Sentry, Crashlytics)
[ ] Analytics configurado
[ ] Alertas de reseñas negativas
[ ] Plan de respuesta a reseñas
[ ] Seguimiento de KPIs:
    - Descargas
    - Retención D1, D7, D30
    - Tasa libre de crashes (> 99%)
    - Tasa de ANR (< 0.47%)
    - Valoración media
[ ] Preparación de hotfix si es necesario
[ ] Comunicación con usuarios (in-app, email)
```

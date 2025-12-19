---
description: Análisis del Tamaño de Aplicación React Native
argument-hint: [arguments]
---

# Análisis del Tamaño de Aplicación React Native

Eres un experto en rendimiento de React Native. Debes analizar el tamaño de la aplicación, identificar elementos grandes y proponer optimizaciones.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Plataforma: ios, android, both
- (Opcional) Modo: full, assets, code, native

Ejemplo: `/reactnative:app-size android` o `/reactnative:app-size both full`

## MISIÓN

### Paso 1: Generar Builds de Análisis

```bash
# Android - APK Release
cd android
./gradlew assembleRelease

# Android - AAB Bundle
./gradlew bundleRelease

# iOS - Archive
cd ios
xcodebuild -workspace {App}.xcworkspace \
  -scheme {App} \
  -configuration Release \
  -archivePath build/{App}.xcarchive \
  archive

# Tamaño del bundle JS
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output /tmp/bundle.js \
  --sourcemap-output /tmp/bundle.js.map
```

### Paso 2: Herramientas de Análisis

#### Android

```bash
# APK Analyzer (Android Studio)
# Build > Analyze APK...

# Línea de comandos
bundletool build-apks --bundle=app.aab --output=app.apks
bundletool get-size total --apks=app.apks

# Detalle por ABI
bundletool get-size total --apks=app.apks --dimensions=ABI

# Analizar con apkanalyzer
apkanalyzer apk summary app-release.apk
apkanalyzer dex list app-release.apk
apkanalyzer files list app-release.apk | sort -k2 -n -r | head -20
```

#### iOS

```bash
# Tamaño estimado de App Store
xcrun altool --validate-app -f {App}.ipa -t ios

# Con app-size-report
npx react-native-bundle-visualizer

# Tamaño del .ipa
ls -lh build/{App}.ipa
```

#### Bundle JavaScript

```bash
# Analizar bundle
npx source-map-explorer /tmp/bundle.js /tmp/bundle.js.map

# O con react-native-bundle-visualizer
npx react-native-bundle-visualizer
```

### Paso 3: Puntos de Atención

#### Assets (Imágenes, Fuentes, etc.)

```bash
# Listar imágenes por tamaño
find android/app/src/main/res -name "*.png" -o -name "*.jpg" | \
  xargs ls -la | sort -k5 -n -r | head -20

find ios/{App}/Images.xcassets -name "*.png" | \
  xargs ls -la | sort -k5 -n -r | head -20

# Verificar assets en bundle
find assets -type f | xargs ls -la | sort -k5 -n -r | head -20
```

#### Dependencias NPM

```bash
# Tamaño de node_modules
du -sh node_modules/* | sort -h -r | head -20

# Analizar con npm
npm ls --depth=0

# Costo de módulos (aproximado)
npx bundlephobia-cli react-native-maps
```

#### Código Nativo

```bash
# Android - Librerías nativas
find android -name "*.so" | xargs ls -la | sort -k5 -n -r

# iOS - Frameworks
find ios/Pods -name "*.a" -o -name "*.framework" | \
  xargs du -sh 2>/dev/null | sort -h -r | head -20
```

### Paso 4: Optimizaciones

#### 1. Optimizar Imágenes

```javascript
// metro.config.js - Compresión automática
const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();

  return {
    transformer: {
      // Compresión de imágenes
      assetPlugins: ['react-native-asset-optimizer/plugin'],
    },
  };
})();
```

```bash
# Convertir PNG a WebP (Android)
cwebp image.png -o image.webp -q 80

# Optimizar PNG
pngquant --quality=65-80 --ext=.png --force image.png

# Eliminar metadatos
exiftool -all= image.jpg
```

#### 2. Reducir Bundle JS

```javascript
// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Tree shaking para lodash
    ['lodash', { id: ['lodash'] }],
    // Eliminar console.log en prod
    'transform-remove-console',
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
```

```typescript
// Lazy loading de pantallas
const HeavyScreen = React.lazy(() => import('./screens/HeavyScreen'));

// Importación selectiva
// ❌
import _ from 'lodash';
// ✅
import debounce from 'lodash/debounce';
```

#### 3. Optimizar Código Nativo

```groovy
// android/app/build.gradle

android {
    buildTypes {
        release {
            // Habilitar Proguard/R8
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    // Dividir por ABI
    splits {
        abi {
            enable true
            reset()
            include 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
            universalApk false
        }
    }

    // Eliminar recursos no usados
    defaultConfig {
        resConfigs "en", "fr"  // Mantener solo estos idiomas
    }
}
```

```ruby
# ios/Podfile
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Strip símbolos de debug en release
      config.build_settings['STRIP_STYLE'] = 'non-global'
      config.build_settings['DEPLOYMENT_POSTPROCESSING'] = 'YES'
    end
  end
end
```

#### 4. Eliminar Dependencias No Usadas

```bash
# Encontrar dependencias no usadas
npx depcheck

# Analizar imports
npx madge --circular --extensions ts,tsx src/

# Eliminar una dependencia
npm uninstall nombre-paquete
cd ios && pod install
```

### Paso 5: Generar Reporte

```
══════════════════════════════════════════════════════════════
📱 REPORTE DE TAMAÑO DE APLICACIÓN
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📊 TAMAÑO GENERAL
──────────────────────────────────────────────────────────────

| Plataforma | Descarga | Instalación | Umbral | Estado |
|----------|----------|---------|-----------|--------|
| Android (APK) | 45 MB | 120 MB | < 50 MB | ✅ |
| Android (AAB) | 35 MB | 95 MB | < 40 MB | ✅ |
| iOS | 55 MB | 150 MB | < 60 MB | ✅ |

──────────────────────────────────────────────────────────────
📦 DESGLOSE ANDROID
──────────────────────────────────────────────────────────────

| Componente | Tamaño | % Total |
|-----------|------|---------|
| classes.dex | 15 MB | 33% |
| lib/ (nativo) | 12 MB | 27% |
| res/ (recursos) | 8 MB | 18% |
| assets/ | 6 MB | 13% |
| META-INF/ | 2 MB | 4% |
| otros | 2 MB | 5% |

### Detalle de lib/ (librerías nativas)
| Archivo | Tamaño |
|------|------|
| libhermes.so | 4.2 MB |
| libreact_nativemodule.so | 3.1 MB |
| libmaps.so | 2.8 MB |
| libreactnativejni.so | 1.5 MB |

### Detalle de assets/
| Carpeta | Tamaño | Archivos |
|--------|------|-------|
| fonts/ | 2.5 MB | 8 |
| images/ | 2.0 MB | 45 |
| lottie/ | 1.5 MB | 12 |

──────────────────────────────────────────────────────────────
🍎 DESGLOSE iOS
──────────────────────────────────────────────────────────────

| Componente | Tamaño | % Total |
|-----------|------|---------|
| Frameworks/ | 28 MB | 51% |
| main.jsbundle | 8 MB | 15% |
| Assets.car | 12 MB | 22% |
| otros | 7 MB | 12% |

### Principales Frameworks
| Framework | Tamaño |
|-----------|------|
| Hermes.framework | 8.5 MB |
| React.framework | 6.2 MB |
| GoogleMaps.framework | 5.8 MB |
| Firebase.framework | 3.2 MB |

──────────────────────────────────────────────────────────────
📜 BUNDLE JAVASCRIPT
──────────────────────────────────────────────────────────────

Tamaño total: 4.2 MB (minificado)
Tamaño gzipped: 1.1 MB

### Principales Dependencias
| Paquete | Tamaño | % Bundle |
|---------|------|----------|
| react-native | 1.2 MB | 29% |
| @react-navigation | 450 KB | 11% |
| moment | 320 KB | 8% |
| lodash | 280 KB | 7% |
| axios | 95 KB | 2% |
| código de app | 850 KB | 20% |
| otros | 1.0 MB | 23% |

──────────────────────────────────────────────────────────────
⚠️ PROBLEMAS DETECTADOS
──────────────────────────────────────────────────────────────

### 1. Moment.js incluido con todos los locales

**Impacto:** +280 KB
**Solución:** Reemplazar con date-fns o dayjs

```javascript
// Antes
import moment from 'moment';

// Después
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
```

### 2. Imágenes PNG no optimizadas

**Archivos afectados:**
| Imagen | Tamaño actual | Tamaño optimizado |
|-------|--------------|----------------|
| hero-banner.png | 850 KB | ~200 KB |
| background.png | 620 KB | ~150 KB |
| splash.png | 480 KB | ~120 KB |

**Impacto total:** -1.5 MB posible

### 3. Librerías nativas no usadas

**Detectadas:**
- react-native-camera (no usado): +2.1 MB
- react-native-video (no usado): +1.8 MB

### 4. Sin división ABI para Android

**Impacto:** APK universal 45 MB vs ~25 MB por ABI

──────────────────────────────────────────────────────────────
💡 OPTIMIZACIONES RECOMENDADAS
──────────────────────────────────────────────────────────────

### Impacto ALTO

1. **Habilitar división ABI** (-15-20 MB Android)
```groovy
splits {
    abi {
        enable true
        universalApk false
    }
}
```

2. **Eliminar dependencias no usadas** (-4 MB)
```bash
npm uninstall react-native-camera react-native-video
cd ios && pod install
```

3. **Migrar de Moment.js a date-fns** (-280 KB bundle)

### Impacto MEDIO

4. **Optimizar imágenes PNG** (-1.5 MB)
```bash
# Convertir a WebP para Android
cwebp image.png -o image.webp -q 80
```

5. **Habilitar Hermes para iOS** (-1-2 MB, +perf)
```ruby
# Podfile
:hermes_enabled => true
```

6. **Limitar locales** (-500 KB)
```groovy
resConfigs "en", "fr"
```

### Impacto BAJO

7. **Tree-shaking de lodash** (-150 KB)
8. **Eliminar console.log en prod** (-50 KB)

──────────────────────────────────────────────────────────────
📈 IMPACTO ESTIMADO
──────────────────────────────────────────────────────────────

| Optimización | Antes | Después | Ganancia |
|--------------|--------|-------|------|
| División ABI | 45 MB | 28 MB | -38% |
| Deps no usadas | 45 MB | 41 MB | -9% |
| Imágenes | 45 MB | 43.5 MB | -3% |
| Bundle JS | 4.2 MB | 3.5 MB | -17% |
| **Total Android** | **45 MB** | **~25 MB** | **-44%** |

──────────────────────────────────────────────────────────────
🔧 COMANDOS
──────────────────────────────────────────────────────────────

# Generar APK release
cd android && ./gradlew assembleRelease

# Analizar APK
apkanalyzer apk summary app-release.apk

# Analizar bundle JS
npx react-native-bundle-visualizer

# Encontrar dependencias no usadas
npx depcheck

# Optimizar imágenes
find . -name "*.png" -exec pngquant --ext=.png --force {} \;

──────────────────────────────────────────────────────────────
🎯 PRIORIDADES
──────────────────────────────────────────────────────────────

1. [ ] Habilitar división ABI (Quick win)
2. [ ] Eliminar react-native-camera y react-native-video
3. [ ] Optimizar 3 imágenes más grandes
4. [ ] Migrar Moment.js → date-fns
5. [ ] Habilitar Hermes en iOS
6. [ ] Limitar locales de Android
```

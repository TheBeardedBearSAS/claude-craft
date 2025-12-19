---
description: React Native Anwendungsgrößenanalyse
argument-hint: [arguments]
---

# React Native Anwendungsgrößenanalyse

Sie sind ein React Native Performance-Experte. Sie müssen die Anwendungsgröße analysieren, große Elemente identifizieren und Optimierungen vorschlagen.

## Argumente
$ARGUMENTS

Argumente:
- (Optional) Plattform: ios, android, both
- (Optional) Modus: full, assets, code, native

Beispiel: `/reactnative:app-size android` oder `/reactnative:app-size both full`

## MISSION

### Schritt 1: Analyse-Builds generieren

```bash
# Android - Release APK
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

# JS-Bundle-Größe
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output /tmp/bundle.js \
  --sourcemap-output /tmp/bundle.js.map
```

### Schritt 2: Analyse-Tools

#### Android

```bash
# APK Analyzer (Android Studio)
# Build > Analyze APK...

# Befehlszeile
bundletool build-apks --bundle=app.aab --output=app.apks
bundletool get-size total --apks=app.apks

# Detail nach ABI
bundletool get-size total --apks=app.apks --dimensions=ABI

# Analyse mit apkanalyzer
apkanalyzer apk summary app-release.apk
apkanalyzer dex list app-release.apk
apkanalyzer files list app-release.apk | sort -k2 -n -r | head -20
```

#### iOS

```bash
# Geschätzte App Store-Größe
xcrun altool --validate-app -f {App}.ipa -t ios

# Mit app-size-report
npx react-native-bundle-visualizer

# .ipa-Größe
ls -lh build/{App}.ipa
```

#### JavaScript Bundle

```bash
# Bundle analysieren
npx source-map-explorer /tmp/bundle.js /tmp/bundle.js.map

# Oder mit react-native-bundle-visualizer
npx react-native-bundle-visualizer
```

### Schritt 3: Aufmerksamkeitspunkte

#### Assets (Bilder, Schriften, etc.)

```bash
# Bilder nach Größe auflisten
find android/app/src/main/res -name "*.png" -o -name "*.jpg" | \
  xargs ls -la | sort -k5 -n -r | head -20

find ios/{App}/Images.xcassets -name "*.png" | \
  xargs ls -la | sort -k5 -n -r | head -20

# Assets im Bundle prüfen
find assets -type f | xargs ls -la | sort -k5 -n -r | head -20
```

#### NPM-Abhängigkeiten

```bash
# node_modules-Größe
du -sh node_modules/* | sort -h -r | head -20

# Mit npm analysieren
npm ls --depth=0

# Kosten der Module (ungefähr)
npx bundlephobia-cli react-native-maps
```

#### Nativer Code

```bash
# Android - Native Bibliotheken
find android -name "*.so" | xargs ls -la | sort -k5 -n -r

# iOS - Frameworks
find ios/Pods -name "*.a" -o -name "*.framework" | \
  xargs du -sh 2>/dev/null | sort -h -r | head -20
```

### Schritt 4: Optimierungen

#### 1. Bilder optimieren

```javascript
// metro.config.js - Automatische Komprimierung
const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();

  return {
    transformer: {
      // Bildkomprimierung
      assetPlugins: ['react-native-asset-optimizer/plugin'],
    },
  };
})();
```

```bash
# PNG zu WebP konvertieren (Android)
cwebp image.png -o image.webp -q 80

# PNG optimieren
pngquant --quality=65-80 --ext=.png --force image.png

# Metadaten entfernen
exiftool -all= image.jpg
```

#### 2. JS-Bundle reduzieren

```javascript
// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Tree shaking für lodash
    ['lodash', { id: ['lodash'] }],
    // console.log in Produktion entfernen
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
// Lazy Loading von Screens
const HeavyScreen = React.lazy(() => import('./screens/HeavyScreen'));

// Selektiver Import
// ❌
import _ from 'lodash';
// ✅
import debounce from 'lodash/debounce';
```

#### 3. Nativen Code optimieren

```groovy
// android/app/build.gradle

android {
    buildTypes {
        release {
            // Proguard/R8 aktivieren
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    // Nach ABI aufteilen
    splits {
        abi {
            enable true
            reset()
            include 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
            universalApk false
        }
    }

    // Ungenutzte Ressourcen entfernen
    defaultConfig {
        resConfigs "en", "fr"  // Nur diese Sprachen behalten
    }
}
```

```ruby
# ios/Podfile
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Debug-Symbole in Release entfernen
      config.build_settings['STRIP_STYLE'] = 'non-global'
      config.build_settings['DEPLOYMENT_POSTPROCESSING'] = 'YES'
    end
  end
end
```

#### 4. Ungenutzte Abhängigkeiten entfernen

```bash
# Ungenutzte Abhängigkeiten finden
npx depcheck

# Imports analysieren
npx madge --circular --extensions ts,tsx src/

# Abhängigkeit entfernen
npm uninstall package-name
cd ios && pod install
```

### Schritt 5: Bericht erstellen

```
══════════════════════════════════════════════════════════════
📱 ANWENDUNGSGRÖSSEN-BERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📊 GESAMTGRÖSSE
──────────────────────────────────────────────────────────────

| Plattform | Download | Installation | Schwelle | Status |
|-----------|----------|--------------|----------|--------|
| Android (APK) | 45 MB | 120 MB | < 50 MB | ✅ |
| Android (AAB) | 35 MB | 95 MB | < 40 MB | ✅ |
| iOS | 55 MB | 150 MB | < 60 MB | ✅ |

──────────────────────────────────────────────────────────────
📦 ANDROID-AUFSCHLÜSSELUNG
──────────────────────────────────────────────────────────────

| Komponente | Größe | % Gesamt |
|-----------|------|----------|
| classes.dex | 15 MB | 33% |
| lib/ (nativ) | 12 MB | 27% |
| res/ (Ressourcen) | 8 MB | 18% |
| assets/ | 6 MB | 13% |
| META-INF/ | 2 MB | 4% |
| andere | 2 MB | 5% |

### lib/ Detail (native Bibliotheken)
| Datei | Größe |
|------|------|
| libhermes.so | 4.2 MB |
| libreact_nativemodule.so | 3.1 MB |
| libmaps.so | 2.8 MB |
| libreactnativejni.so | 1.5 MB |

### assets/ Detail
| Ordner | Größe | Dateien |
|--------|------|---------|
| fonts/ | 2.5 MB | 8 |
| images/ | 2.0 MB | 45 |
| lottie/ | 1.5 MB | 12 |

──────────────────────────────────────────────────────────────
🍎 iOS-AUFSCHLÜSSELUNG
──────────────────────────────────────────────────────────────

| Komponente | Größe | % Gesamt |
|-----------|------|----------|
| Frameworks/ | 28 MB | 51% |
| main.jsbundle | 8 MB | 15% |
| Assets.car | 12 MB | 22% |
| andere | 7 MB | 12% |

### Top Frameworks
| Framework | Größe |
|-----------|------|
| Hermes.framework | 8.5 MB |
| React.framework | 6.2 MB |
| GoogleMaps.framework | 5.8 MB |
| Firebase.framework | 3.2 MB |

──────────────────────────────────────────────────────────────
📜 JAVASCRIPT-BUNDLE
──────────────────────────────────────────────────────────────

Gesamtgröße: 4.2 MB (minifiziert)
Gzip-Größe: 1.1 MB

### Top-Abhängigkeiten
| Paket | Größe | % Bundle |
|---------|------|----------|
| react-native | 1.2 MB | 29% |
| @react-navigation | 450 KB | 11% |
| moment | 320 KB | 8% |
| lodash | 280 KB | 7% |
| axios | 95 KB | 2% |
| App-Code | 850 KB | 20% |
| andere | 1.0 MB | 23% |

──────────────────────────────────────────────────────────────
⚠️ ERKANNTE PROBLEME
──────────────────────────────────────────────────────────────

### 1. Moment.js mit allen Gebietsschemas enthalten

**Auswirkung:** +280 KB
**Lösung:** Durch date-fns oder dayjs ersetzen

```javascript
// Vorher
import moment from 'moment';

// Nachher
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
```

### 2. Nicht optimierte PNG-Bilder

**Betroffene Dateien:**
| Bild | Aktuelle Größe | Optimierte Größe |
|-------|----------------|------------------|
| hero-banner.png | 850 KB | ~200 KB |
| background.png | 620 KB | ~150 KB |
| splash.png | 480 KB | ~120 KB |

**Gesamtauswirkung:** -1.5 MB möglich

### 3. Ungenutzte native Bibliotheken

**Erkannt:**
- react-native-camera (ungenutzt): +2.1 MB
- react-native-video (ungenutzt): +1.8 MB

### 4. Keine ABI-Aufteilung für Android

**Auswirkung:** Universelles APK 45 MB vs. ~25 MB pro ABI

──────────────────────────────────────────────────────────────
💡 EMPFOHLENE OPTIMIERUNGEN
──────────────────────────────────────────────────────────────

### HOHE Auswirkung

1. **ABI-Aufteilung aktivieren** (-15-20 MB Android)
```groovy
splits {
    abi {
        enable true
        universalApk false
    }
}
```

2. **Ungenutzte Abhängigkeiten entfernen** (-4 MB)
```bash
npm uninstall react-native-camera react-native-video
cd ios && pod install
```

3. **Von Moment.js zu date-fns migrieren** (-280 KB Bundle)

### MITTLERE Auswirkung

4. **PNG-Bilder optimieren** (-1.5 MB)
```bash
# Zu WebP für Android konvertieren
cwebp image.png -o image.webp -q 80
```

5. **Hermes für iOS aktivieren** (-1-2 MB, +Perf)
```ruby
# Podfile
:hermes_enabled => true
```

6. **Gebietsschemas begrenzen** (-500 KB)
```groovy
resConfigs "en", "fr"
```

### NIEDRIGE Auswirkung

7. **Tree-Shaking für lodash** (-150 KB)
8. **console.log in Produktion entfernen** (-50 KB)

──────────────────────────────────────────────────────────────
📈 GESCHÄTZTE AUSWIRKUNG
──────────────────────────────────────────────────────────────

| Optimierung | Vorher | Nachher | Gewinn |
|--------------|--------|---------|------|
| ABI-Aufteilung | 45 MB | 28 MB | -38% |
| Ungenutzte Deps | 45 MB | 41 MB | -9% |
| Bilder | 45 MB | 43.5 MB | -3% |
| JS-Bundle | 4.2 MB | 3.5 MB | -17% |
| **Total Android** | **45 MB** | **~25 MB** | **-44%** |

──────────────────────────────────────────────────────────────
🔧 BEFEHLE
──────────────────────────────────────────────────────────────

# Release-APK generieren
cd android && ./gradlew assembleRelease

# APK analysieren
apkanalyzer apk summary app-release.apk

# JS-Bundle analysieren
npx react-native-bundle-visualizer

# Ungenutzte Abhängigkeiten finden
npx depcheck

# Bilder optimieren
find . -name "*.png" -exec pngquant --ext=.png --force {} \;

──────────────────────────────────────────────────────────────
🎯 PRIORITÄTEN
──────────────────────────────────────────────────────────────

1. [ ] ABI-Aufteilung aktivieren (Schneller Gewinn)
2. [ ] react-native-camera und react-native-video entfernen
3. [ ] 3 größte Bilder optimieren
4. [ ] Moment.js → date-fns migrieren
5. [ ] Hermes auf iOS aktivieren
6. [ ] Android-Gebietsschemas begrenzen
```

# Analyse Taille Application React Native

Tu es un expert performance React Native. Tu dois analyser la taille de l'application, identifier les éléments volumineux et proposer des optimisations.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Plateforme : ios, android, both
- (Optionnel) Mode : full, assets, code, native

Exemple : `/reactnative:app-size android` ou `/reactnative:app-size both full`

## MISSION

### Étape 1 : Générer les Builds d'Analyse

```bash
# Android - APK de release
cd android
./gradlew assembleRelease

# Android - Bundle AAB
./gradlew bundleRelease

# iOS - Archive
cd ios
xcodebuild -workspace {App}.xcworkspace \
  -scheme {App} \
  -configuration Release \
  -archivePath build/{App}.xcarchive \
  archive

# Taille du bundle JS
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output /tmp/bundle.js \
  --sourcemap-output /tmp/bundle.js.map
```

### Étape 2 : Outils d'Analyse

#### Android

```bash
# APK Analyzer (Android Studio)
# Build > Analyze APK...

# En ligne de commande
bundletool build-apks --bundle=app.aab --output=app.apks
bundletool get-size total --apks=app.apks

# Détail par ABI
bundletool get-size total --apks=app.apks --dimensions=ABI

# Analyser avec apkanalyzer
apkanalyzer apk summary app-release.apk
apkanalyzer dex list app-release.apk
apkanalyzer files list app-release.apk | sort -k2 -n -r | head -20
```

#### iOS

```bash
# Taille estimée App Store
xcrun altool --validate-app -f {App}.ipa -t ios

# Avec app-size-report
npx react-native-bundle-visualizer

# Taille du .ipa
ls -lh build/{App}.ipa
```

#### Bundle JavaScript

```bash
# Analyser le bundle
npx source-map-explorer /tmp/bundle.js /tmp/bundle.js.map

# Ou avec react-native-bundle-visualizer
npx react-native-bundle-visualizer
```

### Étape 3 : Points d'Attention

#### Assets (Images, Fonts, etc.)

```bash
# Lister les images par taille
find android/app/src/main/res -name "*.png" -o -name "*.jpg" | \
  xargs ls -la | sort -k5 -n -r | head -20

find ios/{App}/Images.xcassets -name "*.png" | \
  xargs ls -la | sort -k5 -n -r | head -20

# Vérifier les assets dans le bundle
find assets -type f | xargs ls -la | sort -k5 -n -r | head -20
```

#### Dépendances NPM

```bash
# Taille des node_modules
du -sh node_modules/* | sort -h -r | head -20

# Analyser avec npm
npm ls --depth=0

# Cost of modules (approximatif)
npx bundlephobia-cli react-native-maps
```

#### Code Natif

```bash
# Android - Bibliothèques natives
find android -name "*.so" | xargs ls -la | sort -k5 -n -r

# iOS - Frameworks
find ios/Pods -name "*.a" -o -name "*.framework" | \
  xargs du -sh 2>/dev/null | sort -h -r | head -20
```

### Étape 4 : Optimisations

#### 1. Optimiser les Images

```javascript
// metro.config.js - Compression automatique
const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();

  return {
    transformer: {
      // Compression des images
      assetPlugins: ['react-native-asset-optimizer/plugin'],
    },
  };
})();
```

```bash
# Convertir PNG en WebP (Android)
cwebp image.png -o image.webp -q 80

# Optimiser PNG
pngquant --quality=65-80 --ext=.png --force image.png

# Supprimer les métadonnées
exiftool -all= image.jpg
```

#### 2. Réduire le Bundle JS

```javascript
// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Tree shaking pour lodash
    ['lodash', { id: ['lodash'] }],
    // Supprimer les console.log en prod
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
// Lazy loading des écrans
const HeavyScreen = React.lazy(() => import('./screens/HeavyScreen'));

// Import sélectif
// ❌
import _ from 'lodash';
// ✅
import debounce from 'lodash/debounce';
```

#### 3. Optimiser le Code Natif

```groovy
// android/app/build.gradle

android {
    buildTypes {
        release {
            // Activer Proguard/R8
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    // Séparer par ABI
    splits {
        abi {
            enable true
            reset()
            include 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
            universalApk false
        }
    }

    // Supprimer les ressources inutilisées
    defaultConfig {
        resConfigs "en", "fr"  // Garder seulement ces langues
    }
}
```

```ruby
# ios/Podfile
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Strip les symboles de debug en release
      config.build_settings['STRIP_STYLE'] = 'non-global'
      config.build_settings['DEPLOYMENT_POSTPROCESSING'] = 'YES'
    end
  end
end
```

#### 4. Supprimer les Dépendances Inutiles

```bash
# Trouver les dépendances inutilisées
npx depcheck

# Analyser les imports
npx madge --circular --extensions ts,tsx src/

# Supprimer une dépendance
npm uninstall package-name
cd ios && pod install
```

### Étape 5 : Générer le Rapport

```
══════════════════════════════════════════════════════════════
📱 RAPPORT TAILLE APPLICATION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📊 TAILLE GLOBALE
──────────────────────────────────────────────────────────────

| Plateforme | Download | Install | Seuil | Status |
|------------|----------|---------|-------|--------|
| Android (APK) | 45 MB | 120 MB | < 50 MB | ✅ |
| Android (AAB) | 35 MB | 95 MB | < 40 MB | ✅ |
| iOS | 55 MB | 150 MB | < 60 MB | ✅ |

──────────────────────────────────────────────────────────────
📦 RÉPARTITION ANDROID
──────────────────────────────────────────────────────────────

| Composant | Taille | % Total |
|-----------|--------|---------|
| classes.dex | 15 MB | 33% |
| lib/ (native) | 12 MB | 27% |
| res/ (resources) | 8 MB | 18% |
| assets/ | 6 MB | 13% |
| META-INF/ | 2 MB | 4% |
| autres | 2 MB | 5% |

### Détail lib/ (bibliothèques natives)
| Fichier | Taille |
|---------|--------|
| libhermes.so | 4.2 MB |
| libreact_nativemodule.so | 3.1 MB |
| libmaps.so | 2.8 MB |
| libreactnativejni.so | 1.5 MB |

### Détail assets/
| Dossier | Taille | Fichiers |
|---------|--------|----------|
| fonts/ | 2.5 MB | 8 |
| images/ | 2.0 MB | 45 |
| lottie/ | 1.5 MB | 12 |

──────────────────────────────────────────────────────────────
🍎 RÉPARTITION iOS
──────────────────────────────────────────────────────────────

| Composant | Taille | % Total |
|-----------|--------|---------|
| Frameworks/ | 28 MB | 51% |
| main.jsbundle | 8 MB | 15% |
| Assets.car | 12 MB | 22% |
| autres | 7 MB | 12% |

### Top Frameworks
| Framework | Taille |
|-----------|--------|
| Hermes.framework | 8.5 MB |
| React.framework | 6.2 MB |
| GoogleMaps.framework | 5.8 MB |
| Firebase.framework | 3.2 MB |

──────────────────────────────────────────────────────────────
📜 BUNDLE JAVASCRIPT
──────────────────────────────────────────────────────────────

Taille totale : 4.2 MB (minifié)
Taille gzippé : 1.1 MB

### Top Dépendances
| Package | Taille | % Bundle |
|---------|--------|----------|
| react-native | 1.2 MB | 29% |
| @react-navigation | 450 KB | 11% |
| moment | 320 KB | 8% |
| lodash | 280 KB | 7% |
| axios | 95 KB | 2% |
| app code | 850 KB | 20% |
| autres | 1.0 MB | 23% |

──────────────────────────────────────────────────────────────
⚠️ PROBLÈMES DÉTECTÉS
──────────────────────────────────────────────────────────────

### 1. Moment.js inclus avec toutes les locales

**Impact :** +280 KB
**Solution :** Remplacer par date-fns ou dayjs

```javascript
// Avant
import moment from 'moment';

// Après
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
```

### 2. Images PNG non optimisées

**Fichiers concernés :**
| Image | Taille actuelle | Taille optimisée |
|-------|-----------------|------------------|
| hero-banner.png | 850 KB | ~200 KB |
| background.png | 620 KB | ~150 KB |
| splash.png | 480 KB | ~120 KB |

**Impact total :** -1.5 MB possible

### 3. Bibliothèques natives non utilisées

**Détectées :**
- react-native-camera (non utilisé) : +2.1 MB
- react-native-video (non utilisé) : +1.8 MB

### 4. Pas de séparation ABI pour Android

**Impact :** APK universel 45 MB vs ~25 MB par ABI

──────────────────────────────────────────────────────────────
💡 OPTIMISATIONS RECOMMANDÉES
──────────────────────────────────────────────────────────────

### Impact ÉLEVÉ

1. **Activer la séparation ABI** (-15-20 MB Android)
```groovy
splits {
    abi {
        enable true
        universalApk false
    }
}
```

2. **Supprimer les dépendances inutilisées** (-4 MB)
```bash
npm uninstall react-native-camera react-native-video
cd ios && pod install
```

3. **Migrer de Moment.js à date-fns** (-280 KB bundle)

### Impact MOYEN

4. **Optimiser les images PNG** (-1.5 MB)
```bash
# Convertir en WebP pour Android
cwebp image.png -o image.webp -q 80
```

5. **Activer Hermes pour iOS** (-1-2 MB, +perf)
```ruby
# Podfile
:hermes_enabled => true
```

6. **Limiter les locales** (-500 KB)
```groovy
resConfigs "en", "fr"
```

### Impact FAIBLE

7. **Tree-shaking lodash** (-150 KB)
8. **Supprimer console.log en prod** (-50 KB)

──────────────────────────────────────────────────────────────
📈 IMPACT ESTIMÉ
──────────────────────────────────────────────────────────────

| Optimisation | Avant | Après | Gain |
|--------------|-------|-------|------|
| Séparation ABI | 45 MB | 28 MB | -38% |
| Deps inutilisées | 45 MB | 41 MB | -9% |
| Images | 45 MB | 43.5 MB | -3% |
| Bundle JS | 4.2 MB | 3.5 MB | -17% |
| **Total Android** | **45 MB** | **~25 MB** | **-44%** |

──────────────────────────────────────────────────────────────
🔧 COMMANDES
──────────────────────────────────────────────────────────────

# Générer APK de release
cd android && ./gradlew assembleRelease

# Analyser l'APK
apkanalyzer apk summary app-release.apk

# Analyser le bundle JS
npx react-native-bundle-visualizer

# Trouver les dépendances inutilisées
npx depcheck

# Optimiser les images
find . -name "*.png" -exec pngquant --ext=.png --force {} \;

──────────────────────────────────────────────────────────────
🎯 PRIORITÉS
──────────────────────────────────────────────────────────────

1. [ ] Activer séparation ABI (Quick win)
2. [ ] Supprimer react-native-camera et react-native-video
3. [ ] Optimiser les 3 plus grosses images
4. [ ] Migrer Moment.js → date-fns
5. [ ] Activer Hermes sur iOS
6. [ ] Limiter les locales Android
```

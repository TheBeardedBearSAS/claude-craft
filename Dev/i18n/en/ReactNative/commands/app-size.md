---
description: React Native Application Size Analysis
argument-hint: [arguments]
---

# React Native Application Size Analysis

You are a React Native performance expert. You must analyze the application size, identify large elements, and propose optimizations.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Platform: ios, android, both
- (Optional) Mode: full, assets, code, native

Example: `/reactnative:app-size android` or `/reactnative:app-size both full`

## MISSION

### Step 1: Generate Analysis Builds

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

# JS bundle size
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output /tmp/bundle.js \
  --sourcemap-output /tmp/bundle.js.map
```

### Step 2: Analysis Tools

#### Android

```bash
# APK Analyzer (Android Studio)
# Build > Analyze APK...

# Command line
bundletool build-apks --bundle=app.aab --output=app.apks
bundletool get-size total --apks=app.apks

# Detail by ABI
bundletool get-size total --apks=app.apks --dimensions=ABI

# Analyze with apkanalyzer
apkanalyzer apk summary app-release.apk
apkanalyzer dex list app-release.apk
apkanalyzer files list app-release.apk | sort -k2 -n -r | head -20
```

#### iOS

```bash
# Estimated App Store size
xcrun altool --validate-app -f {App}.ipa -t ios

# With app-size-report
npx react-native-bundle-visualizer

# .ipa size
ls -lh build/{App}.ipa
```

#### JavaScript Bundle

```bash
# Analyze bundle
npx source-map-explorer /tmp/bundle.js /tmp/bundle.js.map

# Or with react-native-bundle-visualizer
npx react-native-bundle-visualizer
```

### Step 3: Points of Attention

#### Assets (Images, Fonts, etc.)

```bash
# List images by size
find android/app/src/main/res -name "*.png" -o -name "*.jpg" | \
  xargs ls -la | sort -k5 -n -r | head -20

find ios/{App}/Images.xcassets -name "*.png" | \
  xargs ls -la | sort -k5 -n -r | head -20

# Check assets in bundle
find assets -type f | xargs ls -la | sort -k5 -n -r | head -20
```

#### NPM Dependencies

```bash
# node_modules size
du -sh node_modules/* | sort -h -r | head -20

# Analyze with npm
npm ls --depth=0

# Cost of modules (approximate)
npx bundlephobia-cli react-native-maps
```

#### Native Code

```bash
# Android - Native libraries
find android -name "*.so" | xargs ls -la | sort -k5 -n -r

# iOS - Frameworks
find ios/Pods -name "*.a" -o -name "*.framework" | \
  xargs du -sh 2>/dev/null | sort -h -r | head -20
```

### Step 4: Optimizations

#### 1. Optimize Images

```javascript
// metro.config.js - Automatic compression
const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();

  return {
    transformer: {
      // Image compression
      assetPlugins: ['react-native-asset-optimizer/plugin'],
    },
  };
})();
```

```bash
# Convert PNG to WebP (Android)
cwebp image.png -o image.webp -q 80

# Optimize PNG
pngquant --quality=65-80 --ext=.png --force image.png

# Remove metadata
exiftool -all= image.jpg
```

#### 2. Reduce JS Bundle

```javascript
// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Tree shaking for lodash
    ['lodash', { id: ['lodash'] }],
    // Remove console.log in prod
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
// Lazy loading screens
const HeavyScreen = React.lazy(() => import('./screens/HeavyScreen'));

// Selective import
// ❌
import _ from 'lodash';
// ✅
import debounce from 'lodash/debounce';
```

#### 3. Optimize Native Code

```groovy
// android/app/build.gradle

android {
    buildTypes {
        release {
            // Enable Proguard/R8
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    // Split by ABI
    splits {
        abi {
            enable true
            reset()
            include 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
            universalApk false
        }
    }

    // Remove unused resources
    defaultConfig {
        resConfigs "en", "fr"  // Keep only these languages
    }
}
```

```ruby
# ios/Podfile
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Strip debug symbols in release
      config.build_settings['STRIP_STYLE'] = 'non-global'
      config.build_settings['DEPLOYMENT_POSTPROCESSING'] = 'YES'
    end
  end
end
```

#### 4. Remove Unused Dependencies

```bash
# Find unused dependencies
npx depcheck

# Analyze imports
npx madge --circular --extensions ts,tsx src/

# Remove a dependency
npm uninstall package-name
cd ios && pod install
```

### Step 5: Generate Report

```
══════════════════════════════════════════════════════════════
📱 APPLICATION SIZE REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📊 OVERALL SIZE
──────────────────────────────────────────────────────────────

| Platform | Download | Install | Threshold | Status |
|----------|----------|---------|-----------|--------|
| Android (APK) | 45 MB | 120 MB | < 50 MB | ✅ |
| Android (AAB) | 35 MB | 95 MB | < 40 MB | ✅ |
| iOS | 55 MB | 150 MB | < 60 MB | ✅ |

──────────────────────────────────────────────────────────────
📦 ANDROID BREAKDOWN
──────────────────────────────────────────────────────────────

| Component | Size | % Total |
|-----------|------|---------|
| classes.dex | 15 MB | 33% |
| lib/ (native) | 12 MB | 27% |
| res/ (resources) | 8 MB | 18% |
| assets/ | 6 MB | 13% |
| META-INF/ | 2 MB | 4% |
| others | 2 MB | 5% |

### lib/ detail (native libraries)
| File | Size |
|------|------|
| libhermes.so | 4.2 MB |
| libreact_nativemodule.so | 3.1 MB |
| libmaps.so | 2.8 MB |
| libreactnativejni.so | 1.5 MB |

### assets/ detail
| Folder | Size | Files |
|--------|------|-------|
| fonts/ | 2.5 MB | 8 |
| images/ | 2.0 MB | 45 |
| lottie/ | 1.5 MB | 12 |

──────────────────────────────────────────────────────────────
🍎 iOS BREAKDOWN
──────────────────────────────────────────────────────────────

| Component | Size | % Total |
|-----------|------|---------|
| Frameworks/ | 28 MB | 51% |
| main.jsbundle | 8 MB | 15% |
| Assets.car | 12 MB | 22% |
| others | 7 MB | 12% |

### Top Frameworks
| Framework | Size |
|-----------|------|
| Hermes.framework | 8.5 MB |
| React.framework | 6.2 MB |
| GoogleMaps.framework | 5.8 MB |
| Firebase.framework | 3.2 MB |

──────────────────────────────────────────────────────────────
📜 JAVASCRIPT BUNDLE
──────────────────────────────────────────────────────────────

Total size: 4.2 MB (minified)
Gzipped size: 1.1 MB

### Top Dependencies
| Package | Size | % Bundle |
|---------|------|----------|
| react-native | 1.2 MB | 29% |
| @react-navigation | 450 KB | 11% |
| moment | 320 KB | 8% |
| lodash | 280 KB | 7% |
| axios | 95 KB | 2% |
| app code | 850 KB | 20% |
| others | 1.0 MB | 23% |

──────────────────────────────────────────────────────────────
⚠️ DETECTED ISSUES
──────────────────────────────────────────────────────────────

### 1. Moment.js included with all locales

**Impact:** +280 KB
**Solution:** Replace with date-fns or dayjs

```javascript
// Before
import moment from 'moment';

// After
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
```

### 2. Unoptimized PNG images

**Affected files:**
| Image | Current size | Optimized size |
|-------|--------------|----------------|
| hero-banner.png | 850 KB | ~200 KB |
| background.png | 620 KB | ~150 KB |
| splash.png | 480 KB | ~120 KB |

**Total impact:** -1.5 MB possible

### 3. Unused native libraries

**Detected:**
- react-native-camera (unused): +2.1 MB
- react-native-video (unused): +1.8 MB

### 4. No ABI split for Android

**Impact:** Universal APK 45 MB vs ~25 MB per ABI

──────────────────────────────────────────────────────────────
💡 RECOMMENDED OPTIMIZATIONS
──────────────────────────────────────────────────────────────

### HIGH Impact

1. **Enable ABI split** (-15-20 MB Android)
```groovy
splits {
    abi {
        enable true
        universalApk false
    }
}
```

2. **Remove unused dependencies** (-4 MB)
```bash
npm uninstall react-native-camera react-native-video
cd ios && pod install
```

3. **Migrate from Moment.js to date-fns** (-280 KB bundle)

### MEDIUM Impact

4. **Optimize PNG images** (-1.5 MB)
```bash
# Convert to WebP for Android
cwebp image.png -o image.webp -q 80
```

5. **Enable Hermes for iOS** (-1-2 MB, +perf)
```ruby
# Podfile
:hermes_enabled => true
```

6. **Limit locales** (-500 KB)
```groovy
resConfigs "en", "fr"
```

### LOW Impact

7. **Tree-shaking lodash** (-150 KB)
8. **Remove console.log in prod** (-50 KB)

──────────────────────────────────────────────────────────────
📈 ESTIMATED IMPACT
──────────────────────────────────────────────────────────────

| Optimization | Before | After | Gain |
|--------------|--------|-------|------|
| ABI split | 45 MB | 28 MB | -38% |
| Unused deps | 45 MB | 41 MB | -9% |
| Images | 45 MB | 43.5 MB | -3% |
| JS Bundle | 4.2 MB | 3.5 MB | -17% |
| **Total Android** | **45 MB** | **~25 MB** | **-44%** |

──────────────────────────────────────────────────────────────
🔧 COMMANDS
──────────────────────────────────────────────────────────────

# Generate release APK
cd android && ./gradlew assembleRelease

# Analyze APK
apkanalyzer apk summary app-release.apk

# Analyze JS bundle
npx react-native-bundle-visualizer

# Find unused dependencies
npx depcheck

# Optimize images
find . -name "*.png" -exec pngquant --ext=.png --force {} \;

──────────────────────────────────────────────────────────────
🎯 PRIORITIES
──────────────────────────────────────────────────────────────

1. [ ] Enable ABI split (Quick win)
2. [ ] Remove react-native-camera and react-native-video
3. [ ] Optimize 3 largest images
4. [ ] Migrate Moment.js → date-fns
5. [ ] Enable Hermes on iOS
6. [ ] Limit Android locales
```

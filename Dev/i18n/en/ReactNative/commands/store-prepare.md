---
description: React Native Store Publication Checklist
argument-hint: [arguments]
---

# React Native Store Publication Checklist

You are a mobile publication expert. You must prepare the application for submission to the App Store (iOS) and Google Play Store (Android).

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Store: ios, android, both
- (Optional) Type: new, update

Example: `/reactnative:store-prepare both new`

## MISSION

### Step 1: Pre-Submission Checklist

```
══════════════════════════════════════════════════════════════
📱 STORE PUBLICATION CHECKLIST
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🔧 TECHNICAL CONFIGURATION
──────────────────────────────────────────────────────────────

### Version and Build

[ ] Version incremented (semver)
    - iOS: CFBundleShortVersionString
    - Android: versionName

[ ] Build number incremented
    - iOS: CFBundleVersion (integer)
    - Android: versionCode (integer)

[ ] Changelog prepared for this version

### Release Build

[ ] Release mode configured (no dev mode)
[ ] JS Bundle optimized
[ ] ProGuard/R8 enabled (Android)
[ ] Bitcode disabled if necessary (iOS)
[ ] Hermes enabled (recommended)

### Security

[ ] API keys in environment variables
[ ] No secrets in code
[ ] Certificate pinning if necessary
[ ] Keystore signed correctly (Android)
[ ] Valid provisioning profile (iOS)
```

### Step 2: iOS Configuration

```xml
<!-- ios/{App}/Info.plist -->

<!-- Version -->
<key>CFBundleShortVersionString</key>
<string>1.2.0</string>
<key>CFBundleVersion</key>
<string>45</string>

<!-- Permissions (with user descriptions) -->
<key>NSCameraUsageDescription</key>
<string>This app uses the camera to scan QR codes.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>This app accesses your photos to allow you to upload images.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>This app uses your location to display nearby stores.</string>

<key>NSFaceIDUsageDescription</key>
<string>This app uses Face ID to secure access to your account.</string>

<key>NSMicrophoneUsageDescription</key>
<string>This app uses the microphone for voice messages.</string>

<!-- App Transport Security -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <!-- Exceptions if necessary -->
</dict>

<!-- Required capabilities -->
<key>UIRequiredDeviceCapabilities</key>
<array>
    <string>armv7</string>
</array>

<!-- Supported orientations -->
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
# ios/Podfile - Release configuration
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # iOS minimum
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'

      # Bitcode
      config.build_settings['ENABLE_BITCODE'] = 'NO'

      # Architecture
      config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
    end
  end
end
```

### Step 3: Android Configuration

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

    // App Bundle (recommended)
    bundle {
        language {
            enableSplit = false // Keep all languages
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

# Build optimization
org.gradle.jvmargs=-Xmx4g
org.gradle.daemon=true
org.gradle.parallel=true
```

### Step 4: Marketing Assets

```
══════════════════════════════════════════════════════════════
🎨 REQUIRED ASSETS
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🍎 APP STORE (iOS)
──────────────────────────────────────────────────────────────

### App Icon
- 1024x1024 px (PNG, no transparency, no rounded corners)

### iPhone Screenshots
Required sizes (at least one):
- iPhone 6.7" (1290 × 2796 px) - iPhone 15 Pro Max
- iPhone 6.5" (1242 × 2688 px) - iPhone 11 Pro Max
- iPhone 5.5" (1242 × 2208 px) - iPhone 8 Plus

### iPad Screenshots
Required sizes (if iPad supported):
- iPad Pro 12.9" (2048 × 2732 px)
- iPad Pro 11" (1668 × 2388 px)

### App Preview (optional video)
- 15-30 seconds
- Format .mov or .mp4
- Same resolutions as screenshots

### Texts
- App name (30 characters max)
- Subtitle (30 characters max)
- Description (4000 characters max)
- Keywords (100 characters max, comma-separated)
- Support URL
- Privacy policy URL
- Release notes (4000 characters max)

──────────────────────────────────────────────────────────────
🤖 GOOGLE PLAY (Android)
──────────────────────────────────────────────────────────────

### App Icon
- 512x512 px (PNG 32-bit with alpha)

### Feature Graphic
- 1024x500 px (PNG or JPG)

### Phone Screenshots
- Min 2, max 8
- 16:9 or 9:16
- Min 320px, max 3840px
- PNG or JPG

### Tablet 7" Screenshots
- Optional but recommended
- Same specs as phone

### Tablet 10" Screenshots
- Optional but recommended

### Promo video (optional)
- YouTube URL
- Unlisted or public

### Texts
- Title (50 characters max)
- Short description (80 characters max)
- Full description (4000 characters max)
- Release notes (500 characters max)
- Privacy policy URL
- Developer email
```

### Step 5: Build and Signing

```bash
#!/bin/bash
# scripts/build-release.sh

set -e

echo "📱 Building Release..."

# Variables
VERSION=$(node -p "require('./package.json').version")
BUILD_NUMBER=$(date +%Y%m%d%H%M)

echo "Version: $VERSION"
echo "Build: $BUILD_NUMBER"

# iOS
echo "🍎 Building iOS..."
cd ios

# Update build number
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $BUILD_NUMBER" {App}/Info.plist

# Archive
xcodebuild -workspace {App}.xcworkspace \
  -scheme {App} \
  -configuration Release \
  -archivePath build/{App}.xcarchive \
  archive

# Export IPA
xcodebuild -exportArchive \
  -archivePath build/{App}.xcarchive \
  -exportPath build \
  -exportOptionsPlist ExportOptions.plist

cd ..

# Android
echo "🤖 Building Android..."
cd android

# Update versionCode in build.gradle or via variable
./gradlew bundleRelease

# Optional: also generate APK
./gradlew assembleRelease

cd ..

echo "✅ Build complete!"
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

### Step 6: Submission

#### iOS - App Store Connect

```bash
# Via Xcode
# Xcode > Product > Archive > Distribute App

# Via command line (Transporter)
xcrun altool --upload-app \
  -f build/{App}.ipa \
  -t ios \
  -u "apple-id@example.com" \
  -p "@keychain:AC_PASSWORD"

# Or via Fastlane
fastlane ios release
```

#### Android - Google Play Console

```bash
# Via Play Console web
# https://play.google.com/console

# Or via Fastlane
fastlane android release

# Or via bundletool
bundletool build-apks --bundle=app-release.aab --output=app.apks

# Via Google Play Developer API
# (requires service account)
```

### Step 7: Final Checklist

```
══════════════════════════════════════════════════════════════
✅ FINAL PRE-SUBMISSION CHECKLIST
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📱 TESTS
──────────────────────────────────────────────────────────────

[ ] App tested on physical iOS device
[ ] App tested on physical Android device
[ ] Tests on older OS versions (iOS 13, Android 7)
[ ] Tests on different screen sizes
[ ] Dark mode tests
[ ] Offline tests
[ ] Tests with real data
[ ] Performance tests
[ ] Crash/ANR tests
[ ] Accessibility tests (VoiceOver, TalkBack)

──────────────────────────────────────────────────────────────
🔒 COMPLIANCE
──────────────────────────────────────────────────────────────

[ ] Privacy policy accessible
[ ] Terms of service
[ ] GDPR compliance (if Europe)
    - Cookie consent
    - Right to deletion
    - Data export
[ ] COPPA compliance (if children)
[ ] Permission declarations
[ ] No prohibited content

──────────────────────────────────────────────────────────────
🍎 iOS SPECIFIC
──────────────────────────────────────────────────────────────

[ ] App Review Guidelines complied
[ ] No links to external stores
[ ] In-App Purchase if digital content
[ ] Sign in with Apple if other social auth
[ ] App Tracking Transparency if tracking
[ ] Valid provisioning profile
[ ] Push notifications configured (if applicable)
[ ] TestFlight tested

──────────────────────────────────────────────────────────────
🤖 ANDROID SPECIFIC
──────────────────────────────────────────────────────────────

[ ] Recent target API level (34+)
[ ] Play Store policies complied
[ ] Data safety form filled
[ ] Content rating questionnaire
[ ] App signing by Google Play
[ ] Internal/Closed testing performed
[ ] Staged rollout planned

──────────────────────────────────────────────────────────────
📄 DOCUMENTS READY
──────────────────────────────────────────────────────────────

[ ] Screenshots in all supported languages
[ ] Feature graphic (Android)
[ ] High-resolution app icon
[ ] Descriptions in all languages
[ ] Release notes
[ ] Promo video (optional)

──────────────────────────────────────────────────────────────
🚀 SUBMISSION
──────────────────────────────────────────────────────────────

[ ] Build uploaded to App Store Connect
[ ] Build uploaded to Play Console
[ ] Complete metadata
[ ] Price and availability configured
[ ] Release date chosen (immediate or scheduled)
[ ] Review questions prepared
```

### Step 8: Post-Publication

```
══════════════════════════════════════════════════════════════
📊 AFTER PUBLICATION
══════════════════════════════════════════════════════════════

[ ] Crash monitoring (Sentry, Crashlytics)
[ ] Analytics configured
[ ] Negative review alerts
[ ] Review response plan
[ ] Track KPIs:
    - Downloads
    - Retention D1, D7, D30
    - Crash-free rate (> 99%)
    - ANR rate (< 0.47%)
    - Average rating
[ ] Hotfix preparation if necessary
[ ] User communication (in-app, email)
```

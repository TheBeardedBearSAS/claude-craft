# React Native Store Veröffentlichungs-Checkliste

Sie sind ein Experte für Mobile-Veröffentlichungen. Sie müssen die Anwendung für die Einreichung beim App Store (iOS) und Google Play Store (Android) vorbereiten.

## Argumente
$ARGUMENTS

Argumente:
- (Optional) Store: ios, android, both
- (Optional) Typ: new, update

Beispiel: `/reactnative:store-prepare both new`

## MISSION

### Schritt 1: Vor-Einreichungs-Checkliste

```
══════════════════════════════════════════════════════════════
📱 STORE VERÖFFENTLICHUNGS-CHECKLISTE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🔧 TECHNISCHE KONFIGURATION
──────────────────────────────────────────────────────────────

### Version und Build

[ ] Version inkrementiert (semver)
    - iOS: CFBundleShortVersionString
    - Android: versionName

[ ] Build-Nummer inkrementiert
    - iOS: CFBundleVersion (Integer)
    - Android: versionCode (Integer)

[ ] Changelog für diese Version vorbereitet

### Release Build

[ ] Release-Modus konfiguriert (kein Dev-Modus)
[ ] JS Bundle optimiert
[ ] ProGuard/R8 aktiviert (Android)
[ ] Bitcode deaktiviert falls nötig (iOS)
[ ] Hermes aktiviert (empfohlen)

### Sicherheit

[ ] API-Schlüssel in Umgebungsvariablen
[ ] Keine Secrets im Code
[ ] Certificate Pinning falls erforderlich
[ ] Keystore korrekt signiert (Android)
[ ] Gültiges Provisioning Profile (iOS)
```

### Schritt 2: iOS Konfiguration

```xml
<!-- ios/{App}/Info.plist -->

<!-- Version -->
<key>CFBundleShortVersionString</key>
<string>1.2.0</string>
<key>CFBundleVersion</key>
<string>45</string>

<!-- Berechtigungen (mit Benutzerbeschreibungen) -->
<key>NSCameraUsageDescription</key>
<string>Diese App verwendet die Kamera zum Scannen von QR-Codes.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Diese App greift auf Ihre Fotos zu, um Bilder hochladen zu können.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Diese App verwendet Ihren Standort, um nahe gelegene Geschäfte anzuzeigen.</string>

<key>NSFaceIDUsageDescription</key>
<string>Diese App verwendet Face ID, um den Zugriff auf Ihr Konto zu sichern.</string>

<key>NSMicrophoneUsageDescription</key>
<string>Diese App verwendet das Mikrofon für Sprachnachrichten.</string>

<!-- App Transport Security -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <!-- Ausnahmen falls nötig -->
</dict>

<!-- Erforderliche Capabilities -->
<key>UIRequiredDeviceCapabilities</key>
<array>
    <string>armv7</string>
</array>

<!-- Unterstützte Orientierungen -->
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
# ios/Podfile - Release-Konfiguration
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # iOS Minimum
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'

      # Bitcode
      config.build_settings['ENABLE_BITCODE'] = 'NO'

      # Architektur
      config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
    end
  end
end
```

### Schritt 3: Android Konfiguration

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

    // App Bundle (empfohlen)
    bundle {
        language {
            enableSplit = false // Alle Sprachen behalten
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

# Build-Optimierung
org.gradle.jvmargs=-Xmx4g
org.gradle.daemon=true
org.gradle.parallel=true
```

### Schritt 4: Marketing Assets

```
══════════════════════════════════════════════════════════════
🎨 ERFORDERLICHE ASSETS
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🍎 APP STORE (iOS)
──────────────────────────────────────────────────────────────

### App-Icon
- 1024x1024 px (PNG, keine Transparenz, keine abgerundeten Ecken)

### iPhone Screenshots
Erforderliche Größen (mindestens eine):
- iPhone 6.7" (1290 × 2796 px) - iPhone 15 Pro Max
- iPhone 6.5" (1242 × 2688 px) - iPhone 11 Pro Max
- iPhone 5.5" (1242 × 2208 px) - iPhone 8 Plus

### iPad Screenshots
Erforderliche Größen (falls iPad unterstützt):
- iPad Pro 12.9" (2048 × 2732 px)
- iPad Pro 11" (1668 × 2388 px)

### App Preview (optionales Video)
- 15-30 Sekunden
- Format .mov oder .mp4
- Gleiche Auflösungen wie Screenshots

### Texte
- App-Name (max. 30 Zeichen)
- Untertitel (max. 30 Zeichen)
- Beschreibung (max. 4000 Zeichen)
- Schlüsselwörter (max. 100 Zeichen, kommagetrennt)
- Support-URL
- Datenschutzrichtlinien-URL
- Versionshinweise (max. 4000 Zeichen)

──────────────────────────────────────────────────────────────
🤖 GOOGLE PLAY (Android)
──────────────────────────────────────────────────────────────

### App-Icon
- 512x512 px (PNG 32-bit mit Alpha)

### Feature Graphic
- 1024x500 px (PNG oder JPG)

### Telefon Screenshots
- Min. 2, max. 8
- 16:9 oder 9:16
- Min. 320px, max. 3840px
- PNG oder JPG

### Tablet 7" Screenshots
- Optional aber empfohlen
- Gleiche Specs wie Telefon

### Tablet 10" Screenshots
- Optional aber empfohlen

### Promo-Video (optional)
- YouTube-URL
- Nicht gelistet oder öffentlich

### Texte
- Titel (max. 50 Zeichen)
- Kurzbeschreibung (max. 80 Zeichen)
- Vollständige Beschreibung (max. 4000 Zeichen)
- Versionshinweise (max. 500 Zeichen)
- Datenschutzrichtlinien-URL
- Entwickler-E-Mail
```

### Schritt 5: Build und Signierung

```bash
#!/bin/bash
# scripts/build-release.sh

set -e

echo "📱 Building Release..."

# Variablen
VERSION=$(node -p "require('./package.json').version")
BUILD_NUMBER=$(date +%Y%m%d%H%M)

echo "Version: $VERSION"
echo "Build: $BUILD_NUMBER"

# iOS
echo "🍎 Building iOS..."
cd ios

# Build-Nummer aktualisieren
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $BUILD_NUMBER" {App}/Info.plist

# Archivieren
xcodebuild -workspace {App}.xcworkspace \
  -scheme {App} \
  -configuration Release \
  -archivePath build/{App}.xcarchive \
  archive

# IPA exportieren
xcodebuild -exportArchive \
  -archivePath build/{App}.xcarchive \
  -exportPath build \
  -exportOptionsPlist ExportOptions.plist

cd ..

# Android
echo "🤖 Building Android..."
cd android

# versionCode in build.gradle oder via Variable aktualisieren
./gradlew bundleRelease

# Optional: auch APK generieren
./gradlew assembleRelease

cd ..

echo "✅ Build abgeschlossen!"
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

### Schritt 6: Einreichung

#### iOS - App Store Connect

```bash
# Via Xcode
# Xcode > Product > Archive > Distribute App

# Via Kommandozeile (Transporter)
xcrun altool --upload-app \
  -f build/{App}.ipa \
  -t ios \
  -u "apple-id@example.com" \
  -p "@keychain:AC_PASSWORD"

# Oder via Fastlane
fastlane ios release
```

#### Android - Google Play Console

```bash
# Via Play Console Web
# https://play.google.com/console

# Oder via Fastlane
fastlane android release

# Oder via bundletool
bundletool build-apks --bundle=app-release.aab --output=app.apks

# Via Google Play Developer API
# (erfordert Service Account)
```

### Schritt 7: Abschließende Checkliste

```
══════════════════════════════════════════════════════════════
✅ ABSCHLIESSENDE VOR-EINREICHUNGS-CHECKLISTE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📱 TESTS
──────────────────────────────────────────────────────────────

[ ] App auf physischem iOS-Gerät getestet
[ ] App auf physischem Android-Gerät getestet
[ ] Tests auf älteren OS-Versionen (iOS 13, Android 7)
[ ] Tests auf verschiedenen Bildschirmgrößen
[ ] Dark Mode Tests
[ ] Offline-Tests
[ ] Tests mit echten Daten
[ ] Performance-Tests
[ ] Crash/ANR-Tests
[ ] Barrierefreiheits-Tests (VoiceOver, TalkBack)

──────────────────────────────────────────────────────────────
🔒 COMPLIANCE
──────────────────────────────────────────────────────────────

[ ] Datenschutzrichtlinie zugänglich
[ ] Nutzungsbedingungen
[ ] DSGVO-Konformität (falls Europa)
    - Cookie-Einwilligung
    - Recht auf Löschung
    - Datenexport
[ ] COPPA-Konformität (falls Kinder)
[ ] Berechtigungsdeklarationen
[ ] Keine verbotenen Inhalte

──────────────────────────────────────────────────────────────
🍎 iOS SPEZIFISCH
──────────────────────────────────────────────────────────────

[ ] App Review Guidelines eingehalten
[ ] Keine Links zu externen Stores
[ ] In-App Purchase bei digitalem Inhalt
[ ] Sign in with Apple bei anderer Social Auth
[ ] App Tracking Transparency bei Tracking
[ ] Gültiges Provisioning Profile
[ ] Push-Benachrichtigungen konfiguriert (falls zutreffend)
[ ] TestFlight getestet

──────────────────────────────────────────────────────────────
🤖 ANDROID SPEZIFISCH
──────────────────────────────────────────────────────────────

[ ] Aktuelles Target API Level (34+)
[ ] Play Store Richtlinien eingehalten
[ ] Data Safety Formular ausgefüllt
[ ] Inhaltsbewertungsfragebogen
[ ] App-Signierung durch Google Play
[ ] Internal/Closed Testing durchgeführt
[ ] Gestaffelter Rollout geplant

──────────────────────────────────────────────────────────────
📄 DOKUMENTE BEREIT
──────────────────────────────────────────────────────────────

[ ] Screenshots in allen unterstützten Sprachen
[ ] Feature Graphic (Android)
[ ] Hochauflösendes App-Icon
[ ] Beschreibungen in allen Sprachen
[ ] Versionshinweise
[ ] Promo-Video (optional)

──────────────────────────────────────────────────────────────
🚀 EINREICHUNG
──────────────────────────────────────────────────────────────

[ ] Build zu App Store Connect hochgeladen
[ ] Build zur Play Console hochgeladen
[ ] Metadaten vollständig
[ ] Preis und Verfügbarkeit konfiguriert
[ ] Veröffentlichungsdatum gewählt (sofort oder geplant)
[ ] Review-Fragen vorbereitet
```

### Schritt 8: Nach Veröffentlichung

```
══════════════════════════════════════════════════════════════
📊 NACH VERÖFFENTLICHUNG
══════════════════════════════════════════════════════════════

[ ] Crash-Monitoring (Sentry, Crashlytics)
[ ] Analytics konfiguriert
[ ] Negative Bewertungs-Alerts
[ ] Bewertungsantwort-Plan
[ ] KPIs verfolgen:
    - Downloads
    - Retention D1, D7, D30
    - Crash-Free Rate (> 99%)
    - ANR Rate (< 0.47%)
    - Durchschnittliche Bewertung
[ ] Hotfix-Vorbereitung falls erforderlich
[ ] Benutzerkommunikation (In-App, E-Mail)
```

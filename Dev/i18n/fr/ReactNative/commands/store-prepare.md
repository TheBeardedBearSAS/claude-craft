---
description: Checklist Publication Store React Native
argument-hint: [arguments]
---

# Checklist Publication Store React Native

Tu es un expert publication mobile. Tu dois préparer l'application pour la soumission sur l'App Store (iOS) et le Google Play Store (Android).

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Store : ios, android, both
- (Optionnel) Type : new, update

Exemple : `/reactnative:store-prepare both new`

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## MISSION

### Étape 1 : Checklist Pré-Soumission

```
══════════════════════════════════════════════════════════════
📱 CHECKLIST PUBLICATION STORE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🔧 CONFIGURATION TECHNIQUE
──────────────────────────────────────────────────────────────

### Version et Build

[ ] Version incrémentée (semver)
    - iOS: CFBundleShortVersionString
    - Android: versionName

[ ] Build number incrémenté
    - iOS: CFBundleVersion (entier)
    - Android: versionCode (entier)

[ ] Changelog préparé pour cette version

### Build de Release

[ ] Mode release configuré (pas de dev mode)
[ ] Bundle JS optimisé
[ ] ProGuard/R8 activé (Android)
[ ] Bitcode désactivé si nécessaire (iOS)
[ ] Hermes activé (recommandé)

### Sécurité

[ ] Clés API en variables d'environnement
[ ] Pas de secrets dans le code
[ ] Certificate pinning si nécessaire
[ ] Keystore signé correctement (Android)
[ ] Provisioning profile valide (iOS)
```

### Étape 2 : Configuration iOS

```xml
<!-- ios/{App}/Info.plist -->

<!-- Version -->
<key>CFBundleShortVersionString</key>
<string>1.2.0</string>
<key>CFBundleVersion</key>
<string>45</string>

<!-- Permissions (avec descriptions utilisateur) -->
<key>NSCameraUsageDescription</key>
<string>Cette app utilise la caméra pour scanner des QR codes.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Cette app accède à vos photos pour vous permettre de télécharger des images.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Cette app utilise votre position pour afficher les magasins proches.</string>

<key>NSFaceIDUsageDescription</key>
<string>Cette app utilise Face ID pour sécuriser l'accès à votre compte.</string>

<key>NSMicrophoneUsageDescription</key>
<string>Cette app utilise le microphone pour les messages vocaux.</string>

<!-- App Transport Security -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <!-- Exceptions si nécessaire -->
</dict>

<!-- Capabilities requises -->
<key>UIRequiredDeviceCapabilities</key>
<array>
    <string>armv7</string>
</array>

<!-- Orientations supportées -->
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
# ios/Podfile - Configuration release
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

### Étape 3 : Configuration Android

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

    // App Bundle (recommandé)
    bundle {
        language {
            enableSplit = false // Garder toutes les langues
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

# Optimisation build
org.gradle.jvmargs=-Xmx4g
org.gradle.daemon=true
org.gradle.parallel=true
```

### Étape 4 : Assets Marketing

```
══════════════════════════════════════════════════════════════
🎨 ASSETS REQUIS
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🍎 APP STORE (iOS)
──────────────────────────────────────────────────────────────

### Icône App
- 1024x1024 px (PNG, pas de transparence, pas de coins arrondis)

### Screenshots iPhone
Tailles requises (au moins une) :
- iPhone 6.7" (1290 × 2796 px) - iPhone 15 Pro Max
- iPhone 6.5" (1242 × 2688 px) - iPhone 11 Pro Max
- iPhone 5.5" (1242 × 2208 px) - iPhone 8 Plus

### Screenshots iPad
Tailles requises (si iPad supporté) :
- iPad Pro 12.9" (2048 × 2732 px)
- iPad Pro 11" (1668 × 2388 px)

### App Preview (vidéo optionnelle)
- 15-30 secondes
- Format .mov ou .mp4
- Mêmes résolutions que screenshots

### Textes
- Nom de l'app (30 caractères max)
- Sous-titre (30 caractères max)
- Description (4000 caractères max)
- Mots-clés (100 caractères max, séparés par virgules)
- URL support
- URL politique de confidentialité
- Notes de version (4000 caractères max)

──────────────────────────────────────────────────────────────
🤖 GOOGLE PLAY (Android)
──────────────────────────────────────────────────────────────

### Icône App
- 512x512 px (PNG 32-bit avec alpha)

### Feature Graphic
- 1024x500 px (PNG ou JPG)

### Screenshots Phone
- Min 2, max 8
- 16:9 ou 9:16
- Min 320px, max 3840px
- PNG ou JPG

### Screenshots Tablet 7"
- Optionnel mais recommandé
- Mêmes specs que phone

### Screenshots Tablet 10"
- Optionnel mais recommandé

### Vidéo promo (optionnelle)
- URL YouTube
- Non listée ou publique

### Textes
- Titre (50 caractères max)
- Description courte (80 caractères max)
- Description complète (4000 caractères max)
- Notes de version (500 caractères max)
- URL politique de confidentialité
- Email développeur
```

### Étape 5 : Build et Signature

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

# Mettre à jour le build number
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

# Mettre à jour versionCode dans build.gradle ou via variable
./gradlew bundleRelease

# Optionnel: générer aussi l'APK
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

### Étape 6 : Soumission

#### iOS - App Store Connect

```bash
# Via Xcode
# Xcode > Product > Archive > Distribute App

# Via ligne de commande (Transporter)
xcrun altool --upload-app \
  -f build/{App}.ipa \
  -t ios \
  -u "apple-id@example.com" \
  -p "@keychain:AC_PASSWORD"

# Ou via Fastlane
fastlane ios release
```

#### Android - Google Play Console

```bash
# Via Play Console web
# https://play.google.com/console

# Ou via Fastlane
fastlane android release

# Ou via bundletool
bundletool build-apks --bundle=app-release.aab --output=app.apks

# Via Google Play Developer API
# (nécessite service account)
```

### Étape 7 : Checklist Finale

```
══════════════════════════════════════════════════════════════
✅ CHECKLIST FINALE PRÉ-SOUMISSION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📱 TESTS
──────────────────────────────────────────────────────────────

[ ] App testée sur device physique iOS
[ ] App testée sur device physique Android
[ ] Tests sur anciennes versions OS (iOS 13, Android 7)
[ ] Tests sur différentes tailles d'écran
[ ] Tests mode sombre
[ ] Tests hors-ligne
[ ] Tests avec données réelles
[ ] Tests de performance
[ ] Tests de crash/ANR
[ ] Tests accessibilité (VoiceOver, TalkBack)

──────────────────────────────────────────────────────────────
🔒 CONFORMITÉ
──────────────────────────────────────────────────────────────

[ ] Politique de confidentialité accessible
[ ] Conditions d'utilisation
[ ] RGPD compliance (si Europe)
    - Consentement cookies
    - Droit à l'oubli
    - Export des données
[ ] COPPA compliance (si enfants)
[ ] Déclaration des permissions
[ ] Pas de contenu interdit

──────────────────────────────────────────────────────────────
🍎 SPÉCIFIQUE iOS
──────────────────────────────────────────────────────────────

[ ] App Review Guidelines respectées
[ ] Pas de liens vers stores externes
[ ] In-App Purchase si contenu digital
[ ] Sign in with Apple si autres auth sociales
[ ] App Tracking Transparency si tracking
[ ] Provisioning profile valide
[ ] Push notifications configurées (si applicable)
[ ] TestFlight testé

──────────────────────────────────────────────────────────────
🤖 SPÉCIFIQUE ANDROID
──────────────────────────────────────────────────────────────

[ ] Target API level récent (34+)
[ ] Play Store policies respectées
[ ] Data safety form rempli
[ ] Content rating questionnaire
[ ] App signing by Google Play
[ ] Internal/Closed testing effectué
[ ] Staged rollout planifié

──────────────────────────────────────────────────────────────
📄 DOCUMENTS PRÊTS
──────────────────────────────────────────────────────────────

[ ] Screenshots dans toutes les langues supportées
[ ] Feature graphic (Android)
[ ] App icon haute résolution
[ ] Descriptions dans toutes les langues
[ ] Notes de version
[ ] Vidéo promo (optionnel)

──────────────────────────────────────────────────────────────
🚀 SOUMISSION
──────────────────────────────────────────────────────────────

[ ] Build uploadé sur App Store Connect
[ ] Build uploadé sur Play Console
[ ] Métadonnées complètes
[ ] Prix et disponibilité configurés
[ ] Date de sortie choisie (immédiate ou planifiée)
[ ] Réponses aux questions de review préparées
```

### Étape 8 : Post-Publication

```
══════════════════════════════════════════════════════════════
📊 APRÈS PUBLICATION
══════════════════════════════════════════════════════════════

[ ] Monitoring crashes (Sentry, Crashlytics)
[ ] Analytics configurées
[ ] Alertes reviews négatives
[ ] Plan de réponse aux reviews
[ ] Suivi des KPIs :
    - Téléchargements
    - Rétention J1, J7, J30
    - Crash-free rate (> 99%)
    - ANR rate (< 0.47%)
    - Rating moyen
[ ] Préparation hotfix si nécessaire
[ ] Communication utilisateurs (in-app, email)
```

# Tooling React Native - Expo & EAS

## Introduction

Ce document couvre les outils essentiels pour le développement React Native avec Expo.

---

## Expo CLI

### Installation

```bash
# Global
npm install -g expo-cli

# Ou utiliser npx (recommandé)
npx expo
```

### Commandes Essentielles

```bash
# Créer nouveau projet
npx create-expo-app my-app --template
npx create-expo-app my-app --template blank-typescript

# Démarrer dev server
npx expo start
npx expo start --clear  # Clear cache
npx expo start --tunnel # Expose via tunnel (LAN)

# Run on specific platform
npx expo start --ios
npx expo start --android
npx expo start --web

# Prebuild (generate native folders)
npx expo prebuild
npx expo prebuild --clean

# Install packages
npx expo install expo-camera
npx expo install --fix  # Fix version mismatches

# Doctor (check setup)
npx expo-doctor

# Upgrade project
npx expo install expo@latest
npx expo install --fix
```

---

## EAS (Expo Application Services)

### Installation

```bash
npm install -g eas-cli
eas login
```

### EAS Build

```bash
# Configure
eas build:configure

# Build iOS
eas build --platform ios
eas build --platform ios --profile preview

# Build Android
eas build --platform android
eas build --platform android --profile preview

# Build both
eas build --platform all

# Local build
eas build --platform ios --local
```

### eas.json Configuration

```json
{
  "cli": {
    "version": ">= 5.9.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m1-medium"
      },
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD1234"
      },
      "android": {
        "serviceAccountKeyPath": "./service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### EAS Update

```bash
# Configure
eas update:configure

# Publish update
eas update --branch production --message "Bug fixes"

# View updates
eas update:list
```

---

## Metro Bundler

### metro.config.js

```javascript
// Learn more: https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file types
config.resolver.assetExts.push(
  'db',
  'mp3',
  'ttf',
  'obj',
  'png',
  'jpg'
);

// Add support for .cjs files
config.resolver.sourceExts.push('cjs');

module.exports = config;
```

### Clear Cache

```bash
# Clear Metro cache
npx expo start --clear

# Or manually
rm -rf node_modules/.cache
```

---

## Development Tools

### React Native Debugger

```bash
# Install
brew install --cask react-native-debugger

# Or download from GitHub
# https://github.com/jhen0409/react-native-debugger
```

### Flipper

```bash
# Install
brew install --cask flipper

# Plugins
# - Network
# - AsyncStorage
# - React DevTools
# - Hermes Debugger
```

### VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "dsznajder.es7-react-js-snippets",
    "expo.vscode-expo-tools",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "gruntfuggly.todo-tree"
  ]
}
```

---

## Package Management

### npm vs yarn

```bash
# npm
npm install
npm install package-name
npm install --save-dev package-name
npm run script-name

# yarn
yarn
yarn add package-name
yarn add -D package-name
yarn script-name

# Prefer npm for Expo projects (better compatibility)
```

### Version Management

```bash
# Check outdated
npm outdated

# Update packages
npx expo install --fix

# Update specific package
npx expo install expo-camera@latest
```

---

## Checklist Tooling

- [ ] Expo CLI installé
- [ ] EAS CLI configuré
- [ ] Metro config optimisé
- [ ] Debugger choisi (RN Debugger / Flipper)
- [ ] VS Code extensions installées
- [ ] Package manager cohérent (npm)
- [ ] Scripts npm configurés

---

**Les bons outils rendent le développement plus efficace et agréable.**

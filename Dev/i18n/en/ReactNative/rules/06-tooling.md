# Tooling React Native - Expo & EAS

## Introduction

Ce document couvre les outils essentiels pour le développement React Native avec Expo.

---

## System Requirements

### Node.js >= 20 LTS (required for RN 0.85)

React Native 0.85 **drops support for Node versions < 20**. The minimum required version is **Node.js 20.19.4 LTS**.

```bash
# Check version
node --version  # Must be >= 20.19.4

# Install via nvm (recommended)
nvm install 20
nvm use 20
nvm alias default 20
```

> Node 16 and 18 are no longer supported with RN 0.85. Upgrade before migrating.

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

### React Native DevTools (0.85+)

Flipper is deprecated since React Native 0.73. The official replacement is **React Native DevTools**, natively integrated in Metro. RN 0.85 makes it the default debugger and stabilizes key features.

```bash
# Start with debugger (RN 0.73+)
npx react-native start --experimental-debugger

# Open from app via dev menu
# iOS: Cmd+D (simulator) or shake device
# Android: Cmd+M (emulator) or shake device
# Select "Open DevTools" in the menu
```

#### React Native DevTools 0.85+ Features

| Tool | Description |
|------|-------------|
| **Network Inspector** | Inspect HTTP/WebSocket requests — replaces Flipper Network plugin |
| **React Component Inspector** | Component tree, props, state — integrated React DevTools |
| **Hermes CDP Debugger** | Breakpoints, step-through, watch expressions via Chrome DevTools Protocol |
| **Console & Profiler** | Logs, JS thread profiling, flamegraphs |
| **Source maps** | Navigate TypeScript source code (Hermes + sourcemaps) |

> **Historical note:** Flipper (`brew install --cask flipper`) worked with versions < 0.73. It is no longer maintained for the New Architecture and must not be used on RN 0.73+.

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

- [ ] Node.js >= 20.19.4 LTS installed
- [ ] Expo CLI installé
- [ ] EAS CLI configuré
- [ ] Metro config optimisé
- [ ] Debugger configured (React Native DevTools 0.85+ via `--experimental-debugger`)
- [ ] VS Code extensions installées
- [ ] Package manager cohérent (npm)
- [ ] Scripts npm configurés

---

**Les bons outils rendent le développement plus efficace et agréable.**

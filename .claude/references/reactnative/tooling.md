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

### React Native DevTools (recommandé — RN 0.73+)

Flipper est déprécié depuis React Native 0.73. Le remplacement officiel est **React Native DevTools**, intégré nativement dans Metro.

```bash
# Démarrer avec le debugger expérimental (RN 0.73+)
npx react-native start --experimental-debugger

# Ouvrir depuis l'app via le dev menu
# iOS : Cmd+D (simulateur) ou secouer le device
# Android : Cmd+M (émulateur) ou secouer le device
# Sélectionner "Open DevTools" dans le menu
```

Fonctionnalités disponibles :
- Inspection réseau (remplace Flipper Network plugin)
- React DevTools intégrés
- Hermes debugger (sources, breakpoints)
- Console et profiler

> **Note historique :** Flipper (`brew install --cask flipper`) fonctionnait avec les versions < 0.73. Il n'est plus maintenu pour la New Architecture et ne doit pas être utilisé sur RN 0.73+.

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

## Claude Code LSP Plugin

The LSP plugin gives Claude structural code understanding via the Language Server Protocol: automatic diagnostics after each edit, go-to-definition, find references, and type information on hover.

### Capabilities

| Capability | Description |
|------------|-------------|
| **Automatic diagnostics** | TypeScript errors and warnings detected after each modification |
| **Go to Definition** | Navigate to the exact definition of a symbol |
| **Find References** | All usages of a symbol across the project |
| **Hover** | Type information and documentation |
| **Workspace Symbols** | Search symbols across the entire project |
| **Call Hierarchy** | Trace incoming/outgoing calls |

### Installation

```bash
# 1. Install the language server
npm install -g @vtsls/language-server typescript

# 2. Install the Claude Code plugin (official marketplace)
/plugins install typescript-lsp@claude-plugins-official
```

### Benefits for React Native

- Real-time TypeScript diagnostics across platform-specific files
- Navigation through Expo modules and native bridge types
- React Navigation type parameter inference
- Reanimated worklet and shared value type tracking

---

## Checklist Tooling

- [ ] Expo CLI installé
- [ ] EAS CLI configuré
- [ ] Metro config optimisé
- [ ] Debugger configuré (React Native DevTools via `--experimental-debugger`)
- [ ] VS Code extensions installées
- [ ] Package manager cohérent (npm)
- [ ] Scripts npm configurés
- [ ] Claude Code LSP plugin installed

---

**Les bons outils rendent le développement plus efficace et agréable.**

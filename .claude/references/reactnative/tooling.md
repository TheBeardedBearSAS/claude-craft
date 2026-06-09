# Tooling React Native - Expo & EAS

## Introduction

Ce document couvre les outils essentiels pour le développement React Native avec Expo.

---

## Prérequis système

### Node.js >= 20 LTS (obligatoire pour RN 0.85)

React Native 0.85 **supprime le support des versions de Node < 20**. La version minimale requise est **Node.js 20.19.4 LTS**.

```bash
# Vérifier la version
node --version  # Doit être >= 20.19.4

# Installer via nvm (recommandé)
nvm install 20
nvm use 20
nvm alias default 20
```

> Les versions Node 16 et 18 ne sont plus supportées avec RN 0.85. Mettre à jour avant migration.

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

## Metro TLS (0.85+)

Depuis RN 0.85, Metro accepte un objet `server.tls` dans `metro.config.js`, activant HTTPS et WSS (WebSocket sécurisé pour Fast Refresh) pendant le développement local.

### Cas d'usage

| Cas | Pourquoi Metro TLS |
|-----|--------------------|
| Deep links HTTPS | Tester `applinks:` et Universal Links sans serveur distant |
| APIs à origine sécurisée | Certaines APIs refusent les origines non-HTTPS (CSP, CORS strict) |
| Réseaux d'entreprise | Proxys qui bloquent le trafic HTTP non chiffré |
| Service Workers / PWA web | Requiert HTTPS même en développement |

### Configuration

```javascript
// metro.config.js (bare RN 0.85+)
const { getDefaultConfig } = require('@react-native/metro-config');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Activer TLS pour Metro dev server
config.server = {
  ...config.server,
  tls: {
    // Générer avec : mkcert localhost 127.0.0.1
    key: fs.readFileSync('./certs/localhost-key.pem'),
    cert: fs.readFileSync('./certs/localhost.pem'),
  },
};

module.exports = config;
```

### Générer un certificat local de confiance

```bash
# Installer mkcert (macOS)
brew install mkcert
mkcert -install  # Installe la CA locale dans le keystore système

# Générer le certificat
mkdir -p certs
mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost 127.0.0.1

# .gitignore : ne jamais commiter les certificats
echo "certs/" >> .gitignore
```

### Démarrer Metro en HTTPS

```bash
# Bare RN
npx react-native start

# Expo (passe la config metro.config.js automatiquement)
npx expo start
```

> **Note :** La configuration `server.tls` n'est disponible que pour le serveur Metro bare RN (`@react-native/metro-config`). Sous Expo avec `expo/metro-config`, le support est identique — Metro lit la même clé `server.tls`.

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

Flipper est déprécié depuis React Native 0.73. Le remplacement officiel est **React Native DevTools**, intégré nativement dans Metro. RN 0.85 en fait le debugger par défaut et stabilise plusieurs fonctionnalités.

```bash
# Démarrer avec le debugger (RN 0.73+)
npx react-native start --experimental-debugger

# Ouvrir depuis l'app via le dev menu
# iOS : Cmd+D (simulateur) ou secouer le device
# Android : Cmd+M (émulateur) ou secouer le device
# Sélectionner "Open DevTools" dans le menu
```

#### Fonctionnalités React Native DevTools 0.85+

| Outil | Description |
|-------|-------------|
| **Network Inspector** | Inspecter requêtes HTTP/WebSocket — remplace Flipper Network plugin |
| **React Component Inspector** | Arborescence des composants, props, state — React DevTools intégrés |
| **Hermes CDP Debugger** | Breakpoints, step-through, watch expressions via Chrome DevTools Protocol |
| **Console & Profiler** | Logs, profiling JS thread, flamegraphs |
| **Source maps** | Navigation dans le code TypeScript source (Hermes + sourcemaps) |

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

- [ ] Node.js >= 20.19.4 LTS installé
- [ ] Expo CLI installé
- [ ] EAS CLI configuré
- [ ] Metro config optimisé
- [ ] Debugger configuré (React Native DevTools 0.85+ via `--experimental-debugger`)
- [ ] Metro TLS configuré si HTTPS local requis (deep links, origines sécurisées)
- [ ] VS Code extensions installées
- [ ] Package manager cohérent (npm)
- [ ] Scripts npm configurés
- [ ] Claude Code LSP plugin installed

---

**Les bons outils rendent le développement plus efficace et agréable.**

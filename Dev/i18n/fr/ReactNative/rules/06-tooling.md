# Tooling React Native - Expo & EAS

## Introduction

Ce document couvre les outils essentiels pour le développement React Native avec Expo.

---

## Prérequis Système

### Node.js >= 22 LTS (requis pour RN 0.85)

React Native 0.85 requiert **Node.js 22.x LTS** minimum (RN 0.85 nécessitait Node 20). La version recommandée est **Node.js 22.x active LTS**.

```bash
# Vérifier la version
node --version  # Doit être >= 22.0.0

# Installer via nvm (recommandé)
nvm install 22
nvm use 22
nvm alias default 22
```

> Les versions Node < 22 ne sont plus supportées avec RN 0.85. Mettre à jour avant de migrer.

### React Native Gesture Handler 3.0.0 — Changements Breaking

RNGH 3.0.0 introduit des changements de rupture avec RN 0.85 :

```typescript
// ✅ RNGH 3.0 — GestureHandlerRootView obligatoire au niveau racine
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* ... */}
    </GestureHandlerRootView>
  );
}

// Breaking : ancienne API composants (PanGestureHandler, TapGestureHandler)
// → migrer vers : Gesture.Pan(), Gesture.Tap() (nouvelle API Gesture)
```

**Source :** [Guide de migration RNGH 3.0](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/migrating-from-2.x/)

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

### Vider le Cache

```bash
# Vider le cache Metro
npx expo start --clear

# Ou manuellement
rm -rf node_modules/.cache
```

---

## Metro TLS (0.85+ / 0.85+)

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
// metro.config.js (bare RN 0.85+ / 0.85+)
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

> **Note :** La configuration `server.tls` est disponible aussi bien pour bare RN (`@react-native/metro-config`) que pour Expo (`expo/metro-config`) — Metro lit la même clé `server.tls` dans les deux cas.

---

## Outils de Développement

### React Native Debugger

```bash
# Install
brew install --cask react-native-debugger

# Or download from GitHub
# https://github.com/jhen0409/react-native-debugger
```

### React Native DevTools (stable depuis RN 0.76, défaut depuis RN 0.85+)

Flipper est déprécié depuis React Native 0.73. Le remplacement officiel est **React Native DevTools**, intégré nativement dans Metro. DevTools est stable depuis RN 0.76 et est le débogueur par défaut depuis RN 0.85 — aucun flag CLI n'est requis.

```bash
# Démarrer Metro normalement — DevTools s'ouvre via le menu dev ou en appuyant sur `j`
npx react-native start

# Ouvrir depuis l'app via le menu dev
# iOS : Cmd+D (simulateur) ou secouer l'appareil
# Android : Cmd+M (émulateur) ou secouer l'appareil
# Sélectionner "Open DevTools" dans le menu

# Ou appuyer sur `j` dans le terminal Metro pour ouvrir DevTools directement
```

#### Fonctionnalités React Native DevTools 0.85+

| Outil | Description |
|-------|-------------|
| **Network Inspector** | Inspecter les requêtes HTTP/WebSocket — remplace le plugin Flipper Network |
| **React Component Inspector** | Arbre de composants, props, state — React DevTools intégré |
| **Hermes CDP Debugger** | Points d'arrêt, exécution pas à pas, expressions de surveillance via Chrome DevTools Protocol |
| **Console & Profiler** | Logs, profilage du thread JS, flamegraphs |
| **Source maps** | Naviguer dans le code source TypeScript (Hermes + sourcemaps) |

> **Note historique :** Flipper (`brew install --cask flipper`) fonctionnait avec les versions < 0.73. Il n'est plus maintenu pour la Nouvelle Architecture et ne doit pas être utilisé sur RN 0.73+.

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

- [ ] Node.js >= 20.19.4 LTS installé
- [ ] Expo CLI installé
- [ ] EAS CLI configuré
- [ ] Metro config optimisé
- [ ] Débogueur configuré (React Native DevTools — défaut depuis RN 0.85+, aucun flag requis, appuyer sur `j` dans Metro ou menu dev)
- [ ] Metro TLS configuré si HTTPS local requis (deep links, origines sécurisées)
- [ ] VS Code extensions installées
- [ ] Package manager cohérent (npm)
- [ ] Scripts npm configurés

---

**Les bons outils rendent le développement plus efficace et agréable.**

# Tooling React Native - Expo & EAS

## Introducción

Este documento cubre las herramientas esenciales para el desarrollo de React Native con Expo.

---

## Expo CLI

### Instalación

```bash
# Global
npm install -g expo-cli

# O usar npx (recomendado)
npx expo
```

### Comandos Esenciales

```bash
# Crear nuevo proyecto
npx create-expo-app my-app --template
npx create-expo-app my-app --template blank-typescript

# Iniciar dev server
npx expo start
npx expo start --clear  # Limpiar caché
npx expo start --tunnel # Exponer vía tunnel (LAN)

# Ejecutar en plataforma específica
npx expo start --ios
npx expo start --android
npx expo start --web

# Prebuild (generar carpetas nativas)
npx expo prebuild
npx expo prebuild --clean

# Instalar paquetes
npx expo install expo-camera
npx expo install --fix  # Corregir incompatibilidades de versión

# Doctor (verificar configuración)
npx expo-doctor

# Actualizar proyecto
npx expo install expo@latest
npx expo install --fix
```

---

## EAS (Expo Application Services)

### Instalación

```bash
npm install -g eas-cli
eas login
```

### EAS Build

```bash
# Configurar
eas build:configure

# Build iOS
eas build --platform ios
eas build --platform ios --profile preview

# Build Android
eas build --platform android
eas build --platform android --profile preview

# Build ambos
eas build --platform all

# Build local
eas build --platform ios --local
```

### eas.json Configuración

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
# Configurar
eas update:configure

# Publicar actualización
eas update --branch production --message "Bug fixes"

# Ver actualizaciones
eas update:list
```

---

## Metro Bundler

### metro.config.js

```javascript
// Más información: https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Agregar soporte para tipos de archivos adicionales
config.resolver.assetExts.push(
  'db',
  'mp3',
  'ttf',
  'obj',
  'png',
  'jpg'
);

// Agregar soporte para archivos .cjs
config.resolver.sourceExts.push('cjs');

module.exports = config;
```

### Limpiar Caché

```bash
# Limpiar caché de Metro
npx expo start --clear

# O manualmente
rm -rf node_modules/.cache
```

---

## Herramientas de Desarrollo

### React Native Debugger

```bash
# Instalar
brew install --cask react-native-debugger

# O descargar desde GitHub
# https://github.com/jhen0409/react-native-debugger
```

### Flipper

```bash
# Instalar
brew install --cask flipper

# Plugins
# - Network
# - AsyncStorage
# - React DevTools
# - Hermes Debugger
```

### Extensiones VS Code

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

## Gestión de Paquetes

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

# Preferir npm para proyectos Expo (mejor compatibilidad)
```

### Gestión de Versiones

```bash
# Verificar desactualizados
npm outdated

# Actualizar paquetes
npx expo install --fix

# Actualizar paquete específico
npx expo install expo-camera@latest
```

---

## Checklist Tooling

- [ ] Expo CLI instalado
- [ ] EAS CLI configurado
- [ ] Metro config optimizado
- [ ] Debugger elegido (RN Debugger / Flipper)
- [ ] Extensiones VS Code instaladas
- [ ] Package manager consistente (npm)
- [ ] Scripts npm configurados

---

**Las buenas herramientas hacen el desarrollo más eficiente y agradable.**

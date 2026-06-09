# Tooling React Native - Expo & EAS

## Introducción

Este documento cubre las herramientas esenciales para el desarrollo de React Native con Expo.

---

## Requisitos del Sistema

### Node.js >= 20 LTS (requerido para RN 0.85)

React Native 0.85 **elimina el soporte para versiones de Node < 20**. La versión mínima requerida es **Node.js 20.19.4 LTS**.

```bash
# Verificar versión
node --version  # Debe ser >= 20.19.4

# Instalar vía nvm (recomendado)
nvm install 20
nvm use 20
nvm alias default 20
```

> Node 16 y 18 ya no son compatibles con RN 0.85. Actualizar antes de migrar.

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

## Metro TLS (0.85+)

Desde RN 0.85, Metro acepta un objeto `server.tls` en `metro.config.js`, habilitando HTTPS y WSS (WebSocket seguro para Fast Refresh) durante el desarrollo local.

### Casos de Uso

| Caso | Por qué Metro TLS |
|------|-------------------|
| Deep links HTTPS | Probar `applinks:` y Universal Links sin servidor remoto |
| APIs de origen seguro | Algunas APIs rechazan orígenes no-HTTPS (CSP, CORS estricto) |
| Redes corporativas | Proxies que bloquean el tráfico HTTP no cifrado |
| Service Workers / PWA web | Requiere HTTPS incluso en desarrollo |

### Configuración

```javascript
// metro.config.js (bare RN 0.85+)
const { getDefaultConfig } = require('@react-native/metro-config');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Habilitar TLS para Metro dev server
config.server = {
  ...config.server,
  tls: {
    // Generar con: mkcert localhost 127.0.0.1
    key: fs.readFileSync('./certs/localhost-key.pem'),
    cert: fs.readFileSync('./certs/localhost.pem'),
  },
};

module.exports = config;
```

### Generar un Certificado Local de Confianza

```bash
# Instalar mkcert (macOS)
brew install mkcert
mkcert -install  # Instala la CA local en el keystore del sistema

# Generar certificado
mkdir -p certs
mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost 127.0.0.1

# .gitignore: nunca subir certificados al repositorio
echo "certs/" >> .gitignore
```

### Iniciar Metro con HTTPS

```bash
# Bare RN
npx react-native start

# Expo (pasa la configuración metro.config.js automáticamente)
npx expo start
```

> **Nota:** La configuración `server.tls` está disponible tanto para bare RN (`@react-native/metro-config`) como para Expo (`expo/metro-config`) — Metro lee la misma clave `server.tls` en ambos casos.

---

## Herramientas de Desarrollo

### React Native Debugger

```bash
# Instalar
brew install --cask react-native-debugger

# O descargar desde GitHub
# https://github.com/jhen0409/react-native-debugger
```

### React Native DevTools (0.85+)

Flipper está deprecado desde React Native 0.73. El reemplazo oficial son las **React Native DevTools**, integradas de forma nativa en Metro. RN 0.85 las convierte en el depurador predeterminado y estabiliza funciones clave.

```bash
# Iniciar con depurador (RN 0.73+)
npx react-native start --experimental-debugger

# Abrir desde la app mediante el menú dev
# iOS: Cmd+D (simulador) o agitar el dispositivo
# Android: Cmd+M (emulador) o agitar el dispositivo
# Seleccionar "Open DevTools" en el menú
```

#### Funcionalidades React Native DevTools 0.85+

| Herramienta | Descripción |
|-------------|-------------|
| **Network Inspector** | Inspeccionar solicitudes HTTP/WebSocket — reemplaza el plugin Flipper Network |
| **React Component Inspector** | Árbol de componentes, props, state — React DevTools integrado |
| **Hermes CDP Debugger** | Puntos de interrupción, ejecución paso a paso, expresiones de vigilancia via Chrome DevTools Protocol |
| **Console & Profiler** | Logs, perfilado del hilo JS, flamegraphs |
| **Source maps** | Navegar por el código fuente TypeScript (Hermes + sourcemaps) |

> **Nota histórica:** Flipper (`brew install --cask flipper`) funcionaba con versiones < 0.73. Ya no se mantiene para la Nueva Arquitectura y no debe usarse en RN 0.73+.

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

- [ ] Node.js >= 20.19.4 LTS instalado
- [ ] Expo CLI instalado
- [ ] EAS CLI configurado
- [ ] Metro config optimizado
- [ ] Depurador configurado (React Native DevTools 0.85+ via `--experimental-debugger`)
- [ ] Metro TLS configurado si se requiere HTTPS local (deep links, orígenes seguros)
- [ ] Extensiones VS Code instaladas
- [ ] Package manager consistente (npm)
- [ ] Scripts npm configurados

---

**Las buenas herramientas hacen el desarrollo más eficiente y agradable.**

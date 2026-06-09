# Tooling React Native - Expo & EAS

## Einführung

Dieses Dokument behandelt die wesentlichen Werkzeuge für die React Native Entwicklung mit Expo.

---

## Systemvoraussetzungen

### Node.js >= 20 LTS (erforderlich für RN 0.85)

React Native 0.85 **stellt die Unterstützung für Node-Versionen < 20 ein**. Die minimal erforderliche Version ist **Node.js 20.19.4 LTS**.

```bash
# Version prüfen
node --version  # Muss >= 20.19.4 sein

# Installation via nvm (empfohlen)
nvm install 20
nvm use 20
nvm alias default 20
```

> Node 16 und 18 werden mit RN 0.85 nicht mehr unterstützt. Vor der Migration aktualisieren.

---

## Expo CLI

### Installation

```bash
# Global
npm install -g expo-cli

# Oder npx verwenden (empfohlen)
npx expo
```

### Wichtige Befehle

```bash
# Neues Projekt erstellen
npx create-expo-app my-app --template
npx create-expo-app my-app --template blank-typescript

# Dev-Server starten
npx expo start
npx expo start --clear  # Cache leeren
npx expo start --tunnel # Via Tunnel freigeben (LAN)

# Auf bestimmter Plattform ausführen
npx expo start --ios
npx expo start --android
npx expo start --web

# Prebuild (native Ordner generieren)
npx expo prebuild
npx expo prebuild --clean

# Pakete installieren
npx expo install expo-camera
npx expo install --fix  # Versionsinkonsistenzen beheben

# Doctor (Setup prüfen)
npx expo-doctor

# Projekt aktualisieren
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
# Konfigurieren
eas build:configure

# iOS Build
eas build --platform ios
eas build --platform ios --profile preview

# Android Build
eas build --platform android
eas build --platform android --profile preview

# Beide Plattformen
eas build --platform all

# Lokaler Build
eas build --platform ios --local
```

### eas.json Konfiguration

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
# Konfigurieren
eas update:configure

# Update veröffentlichen
eas update --branch production --message "Bug fixes"

# Updates anzeigen
eas update:list
```

---

## Metro Bundler

### metro.config.js

```javascript
// Mehr erfahren: https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Unterstützung für zusätzliche Dateitypen hinzufügen
config.resolver.assetExts.push(
  'db',
  'mp3',
  'ttf',
  'obj',
  'png',
  'jpg'
);

// Unterstützung für .cjs-Dateien hinzufügen
config.resolver.sourceExts.push('cjs');

module.exports = config;
```

### Cache leeren

```bash
# Metro-Cache leeren
npx expo start --clear

# Oder manuell
rm -rf node_modules/.cache
```

---

## Metro TLS (0.85+)

Seit RN 0.85 akzeptiert Metro ein `server.tls`-Objekt in `metro.config.js` und ermöglicht damit HTTPS und WSS (sicheres WebSocket für Fast Refresh) während der lokalen Entwicklung.

### Anwendungsfälle

| Fall | Warum Metro TLS |
|------|----------------|
| HTTPS Deep Links | `applinks:` und Universal Links ohne Remote-Server testen |
| APIs mit sicherem Ursprung | Manche APIs lehnen non-HTTPS-Ursprünge ab (CSP, striktes CORS) |
| Unternehmensnetzwerke | Proxys, die unverschlüsselten HTTP-Verkehr blockieren |
| Service Workers / PWA Web | HTTPS auch in der Entwicklung erforderlich |

### Konfiguration

```javascript
// metro.config.js (bare RN 0.85+)
const { getDefaultConfig } = require('@react-native/metro-config');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// TLS für Metro Dev Server aktivieren
config.server = {
  ...config.server,
  tls: {
    // Generieren mit: mkcert localhost 127.0.0.1
    key: fs.readFileSync('./certs/localhost-key.pem'),
    cert: fs.readFileSync('./certs/localhost.pem'),
  },
};

module.exports = config;
```

### Lokal vertrauenswürdiges Zertifikat erstellen

```bash
# mkcert installieren (macOS)
brew install mkcert
mkcert -install  # Lokale CA im System-Keystore installieren

# Zertifikat generieren
mkdir -p certs
mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost 127.0.0.1

# .gitignore: Zertifikate niemals ins Repository einchecken
echo "certs/" >> .gitignore
```

### Metro mit HTTPS starten

```bash
# Bare RN
npx react-native start

# Expo (übergibt metro.config.js automatisch)
npx expo start
```

> **Hinweis:** Die `server.tls`-Konfiguration ist sowohl für bare RN (`@react-native/metro-config`) als auch für Expo (`expo/metro-config`) verfügbar — Metro liest denselben `server.tls`-Schlüssel in beiden Fällen.

---

## Entwicklungswerkzeuge

### React Native Debugger

```bash
# Installieren
brew install --cask react-native-debugger

# Oder von GitHub herunterladen
# https://github.com/jhen0409/react-native-debugger
```

### React Native DevTools (0.85+)

Flipper ist seit React Native 0.73 veraltet. Der offizielle Ersatz sind die **React Native DevTools**, nativ in Metro integriert. RN 0.85 macht sie zum Standard-Debugger und stabilisiert zentrale Funktionen.

```bash
# Mit Debugger starten (RN 0.73+)
npx react-native start --experimental-debugger

# Aus der App über das Dev-Menü öffnen
# iOS: Cmd+D (Simulator) oder Gerät schütteln
# Android: Cmd+M (Emulator) oder Gerät schütteln
# Im Menü "Open DevTools" auswählen
```

#### React Native DevTools 0.85+ — Funktionen

| Werkzeug | Beschreibung |
|---------|--------------|
| **Network Inspector** | HTTP/WebSocket-Anfragen inspizieren — ersetzt das Flipper Network Plugin |
| **React Component Inspector** | Komponentenbaum, Props, State — integrierte React DevTools |
| **Hermes CDP Debugger** | Breakpoints, Einzelschrittausführung, Watch-Ausdrücke via Chrome DevTools Protocol |
| **Console & Profiler** | Logs, JS-Thread-Profiling, Flamegraphs |
| **Source maps** | TypeScript-Quellcode navigieren (Hermes + Sourcemaps) |

> **Historischer Hinweis:** Flipper (`brew install --cask flipper`) funktionierte mit Versionen < 0.73. Es wird für die Neue Architektur nicht mehr gewartet und darf bei RN 0.73+ nicht verwendet werden.

### VS Code Erweiterungen

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

## Paketverwaltung

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

# npm für Expo-Projekte bevorzugen (bessere Kompatibilität)
```

### Versionsverwaltung

```bash
# Veraltete Pakete prüfen
npm outdated

# Pakete aktualisieren
npx expo install --fix

# Einzelnes Paket aktualisieren
npx expo install expo-camera@latest
```

---

## Tooling-Checkliste

- [ ] Node.js >= 20.19.4 LTS installiert
- [ ] Expo CLI installiert
- [ ] EAS CLI konfiguriert
- [ ] Metro-Konfiguration optimiert
- [ ] Debugger konfiguriert (React Native DevTools 0.85+ via `--experimental-debugger`)
- [ ] Metro TLS konfiguriert, wenn lokales HTTPS erforderlich (Deep Links, sichere Ursprünge)
- [ ] VS Code-Erweiterungen installiert
- [ ] Einheitlicher Package Manager (npm)
- [ ] npm-Skripte konfiguriert

---

**Gute Werkzeuge machen die Entwicklung effizienter und angenehmer.**

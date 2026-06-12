# Tooling React Native - Expo & EAS

## Introdução

Este documento cobre as ferramentas essenciais para o desenvolvimento React Native com Expo.

---

## Requisitos do Sistema

### Node.js >= 22 LTS (obrigatório para RN 0.86)

React Native 0.86 requer **Node.js 22.x LTS** no mínimo (o RN 0.85 exigia Node 20). A versão recomendada é **Node.js 22.x active LTS**.

```bash
# Verificar versão
node --version  # Deve ser >= 22.0.0

# Instalar via nvm (recomendado)
nvm install 22
nvm use 22
nvm alias default 22
```

> Versões Node < 22 não são mais suportadas com RN 0.86. Atualizar antes de migrar.

### React Native Gesture Handler 3.0.0 — Mudanças Breaking

RNGH 3.0.0 introduz mudanças breaking com RN 0.86:

```typescript
// ✅ RNGH 3.0 — GestureHandlerRootView obrigatório no nível raiz
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* ... */}
    </GestureHandlerRootView>
  );
}

// Breaking: API de componentes antiga (PanGestureHandler, TapGestureHandler)
// → migrar para: Gesture.Pan(), Gesture.Tap() (nova API Gesture)
```

**Fonte:** [Guia de migração RNGH 3.0](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/migrating-from-2.x/)

---

## Expo CLI

### Instalação

```bash
# Global
npm install -g expo-cli

# Ou usar npx (recomendado)
npx expo
```

### Comandos Essenciais

```bash
# Criar novo projeto
npx create-expo-app my-app --template
npx create-expo-app my-app --template blank-typescript

# Iniciar dev server
npx expo start
npx expo start --clear  # Limpar cache
npx expo start --tunnel # Expor via tunnel (LAN)

# Executar em plataforma específica
npx expo start --ios
npx expo start --android
npx expo start --web

# Prebuild (gerar pastas nativas)
npx expo prebuild
npx expo prebuild --clean

# Instalar pacotes
npx expo install expo-camera
npx expo install --fix  # Corrigir incompatibilidades de versão

# Doctor (verificar configuração)
npx expo-doctor

# Atualizar projeto
npx expo install expo@latest
npx expo install --fix
```

---

## EAS (Expo Application Services)

### Instalação

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

### Configuração eas.json

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

# Publicar update
eas update --branch production --message "Bug fixes"

# Ver updates
eas update:list
```

---

## Metro Bundler

### metro.config.js

```javascript
// Saiba mais: https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Adicionar suporte para tipos de arquivo adicionais
config.resolver.assetExts.push(
  'db',
  'mp3',
  'ttf',
  'obj',
  'png',
  'jpg'
);

// Adicionar suporte para arquivos .cjs
config.resolver.sourceExts.push('cjs');

module.exports = config;
```

### Limpar Cache

```bash
# Limpar cache do Metro
npx expo start --clear

# Ou manualmente
rm -rf node_modules/.cache
```

---

## Metro TLS (0.85+ / 0.86+)

Desde o RN 0.85, o Metro aceita um objeto `server.tls` no `metro.config.js`, habilitando HTTPS e WSS (WebSocket seguro para Fast Refresh) durante o desenvolvimento local.

### Casos de Uso

| Caso | Por que Metro TLS |
|------|-------------------|
| Deep links HTTPS | Testar `applinks:` e Universal Links sem servidor remoto |
| APIs de origem segura | Algumas APIs rejeitam origens não-HTTPS (CSP, CORS estrito) |
| Redes corporativas | Proxies que bloqueiam tráfego HTTP não criptografado |
| Service Workers / PWA web | Requer HTTPS mesmo em desenvolvimento |

### Configuração

```javascript
// metro.config.js (bare RN 0.85+ / 0.86+)
const { getDefaultConfig } = require('@react-native/metro-config');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Habilitar TLS para o Metro dev server
config.server = {
  ...config.server,
  tls: {
    // Gerar com: mkcert localhost 127.0.0.1
    key: fs.readFileSync('./certs/localhost-key.pem'),
    cert: fs.readFileSync('./certs/localhost.pem'),
  },
};

module.exports = config;
```

### Gerar um Certificado Local Confiável

```bash
# Instalar mkcert (macOS)
brew install mkcert
mkcert -install  # Instala a CA local no keystore do sistema

# Gerar certificado
mkdir -p certs
mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost 127.0.0.1

# .gitignore: nunca comitar certificados no repositório
echo "certs/" >> .gitignore
```

### Iniciar Metro com HTTPS

```bash
# Bare RN
npx react-native start

# Expo (passa a configuração metro.config.js automaticamente)
npx expo start
```

> **Nota:** A configuração `server.tls` está disponível tanto para bare RN (`@react-native/metro-config`) quanto para Expo (`expo/metro-config`) — o Metro lê a mesma chave `server.tls` nos dois casos.

---

## Ferramentas de Desenvolvimento

### React Native Debugger

```bash
# Instalar
brew install --cask react-native-debugger

# Ou baixar do GitHub
# https://github.com/jhen0409/react-native-debugger
```

### React Native DevTools (0.85+)

O Flipper está deprecado desde React Native 0.73. O substituto oficial são as **React Native DevTools**, integradas nativamente no Metro. O RN 0.85 torna-as o depurador padrão e estabiliza funcionalidades essenciais.

```bash
# Iniciar com depurador (RN 0.73+)
npx react-native start --experimental-debugger

# Abrir pelo app via menu dev
# iOS: Cmd+D (simulador) ou sacudir o dispositivo
# Android: Cmd+M (emulador) ou sacudir o dispositivo
# Selecionar "Open DevTools" no menu
```

#### Funcionalidades React Native DevTools 0.85+

| Ferramenta | Descrição |
|-----------|-----------|
| **Network Inspector** | Inspecionar requisições HTTP/WebSocket — substitui o plugin Flipper Network |
| **React Component Inspector** | Árvore de componentes, props, state — React DevTools integrado |
| **Hermes CDP Debugger** | Breakpoints, execução passo a passo, expressões de observação via Chrome DevTools Protocol |
| **Console & Profiler** | Logs, profiling do thread JS, flamegraphs |
| **Source maps** | Navegar pelo código-fonte TypeScript (Hermes + sourcemaps) |

> **Nota histórica:** O Flipper (`brew install --cask flipper`) funcionava com versões < 0.73. Não é mais mantido para a Nova Arquitetura e não deve ser usado no RN 0.73+.

### Extensões VS Code

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

## Gerenciamento de Pacotes

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

# Preferir npm para projetos Expo (melhor compatibilidade)
```

### Gerenciamento de Versões

```bash
# Verificar desatualizados
npm outdated

# Atualizar pacotes
npx expo install --fix

# Atualizar pacote específico
npx expo install expo-camera@latest
```

---

## Checklist Tooling

- [ ] Node.js >= 20.19.4 LTS instalado
- [ ] Expo CLI instalado
- [ ] EAS CLI configurado
- [ ] Metro config otimizado
- [ ] Depurador configurado (React Native DevTools 0.85+ via `--experimental-debugger`)
- [ ] Metro TLS configurado se HTTPS local for necessário (deep links, origens seguras)
- [ ] Extensões VS Code instaladas
- [ ] Package manager consistente (npm)
- [ ] Scripts npm configurados

---

**As ferramentas certas tornam o desenvolvimento mais eficiente e agradável.**

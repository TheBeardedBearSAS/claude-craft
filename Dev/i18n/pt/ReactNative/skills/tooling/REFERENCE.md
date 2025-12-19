# Tooling React Native - Expo & EAS

## Introdução

Este documento cobre as ferramentas essenciais para o desenvolvimento React Native com Expo.

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

## Ferramentas de Desenvolvimento

### React Native Debugger

```bash
# Instalar
brew install --cask react-native-debugger

# Ou baixar do GitHub
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

- [ ] Expo CLI instalado
- [ ] EAS CLI configurado
- [ ] Metro config otimizado
- [ ] Debugger escolhido (RN Debugger / Flipper)
- [ ] Extensões VS Code instaladas
- [ ] Package manager consistente (npm)
- [ ] Scripts npm configurados

---

**As ferramentas certas tornam o desenvolvimento mais eficiente e agradável.**

---
description: Análise do Tamanho da Aplicação React Native
argument-hint: [arguments]
---

# Análise do Tamanho da Aplicação React Native

Você é um especialista em performance React Native. Você deve analisar o tamanho da aplicação, identificar elementos volumosos e propor otimizações.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Plataforma: ios, android, both
- (Opcional) Modo: full, assets, code, native

Exemplo: `/reactnative:app-size android` ou `/reactnative:app-size both full`

## Modo de Planejamento

> O modo de planejamento é ativado automaticamente quando o escopo abrange múltiplos módulos ou requer uma investigação transversal.

## MISSÃO

### Etapa 1: Gerar Builds de Análise

```bash
# Android - APK de Release
cd android
./gradlew assembleRelease

# Android - Bundle AAB
./gradlew bundleRelease

# iOS - Archive
cd ios
xcodebuild -workspace {App}.xcworkspace \
  -scheme {App} \
  -configuration Release \
  -archivePath build/{App}.xcarchive \
  archive

# Tamanho do bundle JS
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output /tmp/bundle.js \
  --sourcemap-output /tmp/bundle.js.map
```

### Etapa 2: Ferramentas de Análise

#### Android

```bash
# APK Analyzer (Android Studio)
# Build > Analyze APK...

# Linha de comando
bundletool build-apks --bundle=app.aab --output=app.apks
bundletool get-size total --apks=app.apks

# Detalhe por ABI
bundletool get-size total --apks=app.apks --dimensions=ABI

# Analisar com apkanalyzer
apkanalyzer apk summary app-release.apk
apkanalyzer dex list app-release.apk
apkanalyzer files list app-release.apk | sort -k2 -n -r | head -20
```

#### iOS

```bash
# Tamanho estimado na App Store
xcrun altool --validate-app -f {App}.ipa -t ios

# Com app-size-report
npx react-native-bundle-visualizer

# Tamanho do .ipa
ls -lh build/{App}.ipa
```

#### Bundle JavaScript

```bash
# Analisar bundle
npx source-map-explorer /tmp/bundle.js /tmp/bundle.js.map

# Ou com react-native-bundle-visualizer
npx react-native-bundle-visualizer
```

### Etapa 3: Pontos de Atenção

#### Assets (Imagens, Fontes, etc.)

```bash
# Listar imagens por tamanho
find android/app/src/main/res -name "*.png" -o -name "*.jpg" | \
  xargs ls -la | sort -k5 -n -r | head -20

find ios/{App}/Images.xcassets -name "*.png" | \
  xargs ls -la | sort -k5 -n -r | head -20

# Verificar assets no bundle
find assets -type f | xargs ls -la | sort -k5 -n -r | head -20
```

#### Dependências NPM

```bash
# Tamanho do node_modules
du -sh node_modules/* | sort -h -r | head -20

# Analisar com npm
npm ls --depth=0

# Custo dos módulos (aproximado)
npx bundlephobia-cli react-native-maps
```

#### Código Nativo

```bash
# Android - Bibliotecas nativas
find android -name "*.so" | xargs ls -la | sort -k5 -n -r

# iOS - Frameworks
find ios/Pods -name "*.a" -o -name "*.framework" | \
  xargs du -sh 2>/dev/null | sort -h -r | head -20
```

### Etapa 4: Otimizações

#### 1. Otimizar Imagens

```javascript
// metro.config.js - Compressão automática
const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();

  return {
    transformer: {
      // Compressão de imagens
      assetPlugins: ['react-native-asset-optimizer/plugin'],
    },
  };
})();
```

```bash
# Converter PNG para WebP (Android)
cwebp image.png -o image.webp -q 80

# Otimizar PNG
pngquant --quality=65-80 --ext=.png --force image.png

# Remover metadados
exiftool -all= image.jpg
```

#### 2. Reduzir o Bundle JS

```javascript
// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Tree shaking para lodash
    ['lodash', { id: ['lodash'] }],
    // Remover console.log em produção
    'transform-remove-console',
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
```

```typescript
// Carregamento preguiçoso de telas
const HeavyScreen = React.lazy(() => import('./screens/HeavyScreen'));

// Importação seletiva
// ❌
import _ from 'lodash';
// ✅
import debounce from 'lodash/debounce';
```

#### 3. Otimizar Código Nativo

```groovy
// android/app/build.gradle

android {
    buildTypes {
        release {
            // Habilitar Proguard/R8
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    // Divisão por ABI
    splits {
        abi {
            enable true
            reset()
            include 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
            universalApk false
        }
    }

    // Remover recursos não utilizados
    defaultConfig {
        resConfigs "en", "fr"  // Manter apenas esses idiomas
    }
}
```

```ruby
# ios/Podfile
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Remover símbolos de debug na versão release
      config.build_settings['STRIP_STYLE'] = 'non-global'
      config.build_settings['DEPLOYMENT_POSTPROCESSING'] = 'YES'
    end
  end
end
```

#### 4. Remover Dependências Não Utilizadas

```bash
# Encontrar dependências não utilizadas
npx depcheck

# Analisar importações
npx madge --circular --extensions ts,tsx src/

# Remover uma dependência
npm uninstall package-name
cd ios && pod install
```

### Etapa 5: Gerar Relatório

```
══════════════════════════════════════════════════════════════
📱 RELATÓRIO DE TAMANHO DA APLICAÇÃO
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📊 TAMANHO GERAL
──────────────────────────────────────────────────────────────

| Plataforma     | Download | Instalado | Limite   | Status |
|----------------|----------|-----------|----------|--------|
| Android (APK)  | 45 MB    | 120 MB    | < 50 MB  | ✅     |
| Android (AAB)  | 35 MB    | 95 MB     | < 40 MB  | ✅     |
| iOS            | 55 MB    | 150 MB    | < 60 MB  | ✅     |

──────────────────────────────────────────────────────────────
📦 DETALHAMENTO ANDROID
──────────────────────────────────────────────────────────────

| Componente        | Tamanho | % Total |
|-------------------|---------|---------|
| classes.dex       | 15 MB   | 33%     |
| lib/ (nativo)     | 12 MB   | 27%     |
| res/ (recursos)   | 8 MB    | 18%     |
| assets/           | 6 MB    | 13%     |
| META-INF/         | 2 MB    | 4%      |
| outros            | 2 MB    | 5%      |

### Detalhe de lib/ (bibliotecas nativas)
| Arquivo                       | Tamanho |
|-------------------------------|---------|
| libhermes.so                  | 4,2 MB  |
| libreact_nativemodule.so      | 3,1 MB  |
| libmaps.so                    | 2,8 MB  |
| libreactnativejni.so          | 1,5 MB  |

### Detalhe de assets/
| Pasta    | Tamanho | Arquivos |
|----------|---------|----------|
| fonts/   | 2,5 MB  | 8        |
| images/  | 2,0 MB  | 45       |
| lottie/  | 1,5 MB  | 12       |

──────────────────────────────────────────────────────────────
🍎 DETALHAMENTO iOS
──────────────────────────────────────────────────────────────

| Componente      | Tamanho | % Total |
|-----------------|---------|---------|
| Frameworks/     | 28 MB   | 51%     |
| main.jsbundle   | 8 MB    | 15%     |
| Assets.car      | 12 MB   | 22%     |
| outros          | 7 MB    | 12%     |

### Principais Frameworks
| Framework              | Tamanho |
|------------------------|---------|
| Hermes.framework       | 8,5 MB  |
| React.framework        | 6,2 MB  |
| GoogleMaps.framework   | 5,8 MB  |
| Firebase.framework     | 3,2 MB  |

──────────────────────────────────────────────────────────────
📜 BUNDLE JAVASCRIPT
──────────────────────────────────────────────────────────────

Tamanho total: 4,2 MB (minificado)
Tamanho gzipado: 1,1 MB

### Principais Dependências
| Pacote              | Tamanho | % Bundle |
|---------------------|---------|----------|
| react-native        | 1,2 MB  | 29%      |
| @react-navigation   | 450 KB  | 11%      |
| moment              | 320 KB  | 8%       |
| lodash              | 280 KB  | 7%       |
| axios               | 95 KB   | 2%       |
| código da app       | 850 KB  | 20%      |
| outros              | 1,0 MB  | 23%      |

──────────────────────────────────────────────────────────────
⚠️ PROBLEMAS DETECTADOS
──────────────────────────────────────────────────────────────

### 1. Moment.js incluído com todos os locales

**Impacto:** +280 KB
**Solução:** Substituir por date-fns ou dayjs

```javascript
// Antes
import moment from 'moment';

// Depois
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
```

### 2. Imagens PNG não otimizadas

**Arquivos afetados:**
| Imagem            | Tamanho atual | Tamanho otimizado |
|-------------------|---------------|-------------------|
| hero-banner.png   | 850 KB        | ~200 KB           |
| background.png    | 620 KB        | ~150 KB           |
| splash.png        | 480 KB        | ~120 KB           |

**Impacto total:** -1,5 MB possível

### 3. Bibliotecas nativas não utilizadas

**Detectadas:**
- react-native-camera (não utilizado): +2,1 MB
- react-native-video (não utilizado): +1,8 MB

### 4. Sem divisão por ABI para Android

**Impacto:** APK universal de 45 MB vs ~25 MB por ABI

──────────────────────────────────────────────────────────────
💡 OTIMIZAÇÕES RECOMENDADAS
──────────────────────────────────────────────────────────────

### Impacto ALTO

1. **Habilitar divisão por ABI** (-15-20 MB Android)
```groovy
splits {
    abi {
        enable true
        universalApk false
    }
}
```

2. **Remover dependências não utilizadas** (-4 MB)
```bash
npm uninstall react-native-camera react-native-video
cd ios && pod install
```

3. **Migrar de Moment.js para date-fns** (-280 KB no bundle)

### Impacto MÉDIO

4. **Otimizar imagens PNG** (-1,5 MB)
```bash
# Converter para WebP no Android
cwebp image.png -o image.webp -q 80
```

5. **Habilitar Hermes para iOS** (-1-2 MB, +performance)
```ruby
# Podfile
:hermes_enabled => true
```

6. **Limitar locales** (-500 KB)
```groovy
resConfigs "en", "fr"
```

### Impacto BAIXO

7. **Tree-shaking do lodash** (-150 KB)
8. **Remover console.log em produção** (-50 KB)

──────────────────────────────────────────────────────────────
📈 IMPACTO ESTIMADO
──────────────────────────────────────────────────────────────

| Otimização          | Antes   | Depois  | Ganho  |
|---------------------|---------|---------|--------|
| Divisão por ABI     | 45 MB   | 28 MB   | -38%   |
| Deps não utilizadas | 45 MB   | 41 MB   | -9%    |
| Imagens             | 45 MB   | 43,5 MB | -3%    |
| Bundle JS           | 4,2 MB  | 3,5 MB  | -17%   |
| **Total Android**   | **45 MB** | **~25 MB** | **-44%** |

──────────────────────────────────────────────────────────────
🔧 COMANDOS
──────────────────────────────────────────────────────────────

# Gerar APK de release
cd android && ./gradlew assembleRelease

# Analisar APK
apkanalyzer apk summary app-release.apk

# Analisar bundle JS
npx react-native-bundle-visualizer

# Encontrar dependências não utilizadas
npx depcheck

# Otimizar imagens
find . -name "*.png" -exec pngquant --ext=.png --force {} \;

──────────────────────────────────────────────────────────────
🎯 PRIORIDADES
──────────────────────────────────────────────────────────────

1. [ ] Habilitar divisão por ABI (Ganho rápido)
2. [ ] Remover react-native-camera e react-native-video
3. [ ] Otimizar as 3 maiores imagens
4. [ ] Migrar Moment.js → date-fns
5. [ ] Habilitar Hermes no iOS
6. [ ] Limitar locales no Android
```

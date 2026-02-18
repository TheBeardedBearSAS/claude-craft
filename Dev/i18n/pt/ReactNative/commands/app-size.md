---
description: Comando: Analisar Tamanho do App
---

# Comando: Analisar Tamanho do App

Analise o tamanho do bundle e identifique oportunidades de otimização para aplicações React Native.

---

## Objetivo

Este comando analisa o tamanho do seu aplicativo React Native e fornece recomendações para reduzir o tamanho do bundle, melhorando tempos de download e instalação.

---

## Modo Plano

> O modo plano é ativado automaticamente quando o escopo abrange vários módulos ou requer investigação transversal.

## Etapas de Análise

### 1. Análise do Bundle

**Execute a análise do bundle:**

```bash
# Para Expo
npx expo export --platform ios --output-dir dist/ios
npx expo export --platform android --output-dir dist/android

# Analizar tamanho
du -sh dist/ios
du -sh dist/android

# Para análise detalhada com webpack-bundle-analyzer (se usando)
npx react-native-bundle-visualizer
```

**Coisas a verificar:**

- [ ] Tamanho total do bundle iOS
- [ ] Tamanho total do bundle Android
- [ ] Tamanho dos assets (imagens, fontes, etc.)
- [ ] Tamanho do código JavaScript
- [ ] Dependências mais pesadas

### 2. Análise de Dependências

**Verificar tamanhos de dependências:**

```bash
# Instalar ferramenta de análise
npm install -g cost-of-modules

# Analisar node_modules
cost-of-modules

# Ou usar
npx package-size

# Verificar dependências não utilizadas
npx depcheck
```

**Reportar:**

```markdown
## Análise de Dependências

### Top 10 Maiores Dependências
1. [nome] - [tamanho] - [justificada? sim/não]
2. [nome] - [tamanho] - [justificada? sim/não]
...

### Dependências não Utilizadas
- [lista de dependências que podem ser removidas]

### Duplicatas
- [pacotes com múltiplas versões instaladas]
```

### 3. Análise de Assets

**Verificar assets:**

```bash
# Listar assets por tamanho
find src/assets -type f -exec du -h {} + | sort -rh | head -20

# Verificar imagens grandes
find src/assets/images -type f -size +500k -exec ls -lh {} \;
```

**Verificar:**

- [ ] Imagens não otimizadas
- [ ] Imagens não usadas
- [ ] Imagens muito grandes
- [ ] Fontes não usadas
- [ ] Assets duplicados
- [ ] Vídeos ou animações pesados

### 4. Análise de Código

**Verificar código não utilizado:**

```bash
# Usar ferramenta de análise
npx unimported

# Verificar imports não utilizados
npx eslint . --ext .ts,.tsx --no-eslintrc --plugin unused-imports
```

**Identificar:**

- [ ] Arquivos não importados
- [ ] Exports não utilizados
- [ ] Componentes não utilizados
- [ ] Hooks não utilizados
- [ ] Utils não utilizados

---

## Relatório de Análise

### Métricas Atuais

```markdown
## Tamanho do App

### iOS
- Bundle JavaScript: [X] MB
- Assets: [X] MB
- Total: [X] MB
- Tamanho de instalação estimado: [X] MB

### Android
- Bundle JavaScript: [X] MB
- Assets: [X] MB
- Total APK: [X] MB
- AAB: [X] MB

### Comparação com Limites Recomendados
- iOS: [X] MB / 4 MB (alerta se > 4MB)
- Android: [X] MB / 15 MB (alerta se > 15MB)
```

### Problemas Identificados

```markdown
## Problemas Encontrados

### 🔴 Críticos
1. **[Nome do problema]**
   - Impacto: [+X] MB
   - Descrição: [detalhes]
   - Ação recomendada: [ação]

### 🟡 Avisos
1. **[Nome do problema]**
   - Impacto: [+X] KB
   - Descrição: [detalhes]
   - Ação recomendada: [ação]

### 🟢 Otimizações Sugeridas
1. **[Sugestão]**
   - Economia potencial: [~X] KB
   - Esforço: [Baixo/Médio/Alto]
   - Prioridade: [Alta/Média/Baixa]
```

---

## Recomendações de Otimização

### 1. Dependências

**Ações:**

- [ ] **Remover dependências não utilizadas**
  ```bash
  npm uninstall [pacote-não-usado]
  ```

- [ ] **Substituir dependências pesadas por alternativas leves**
  ```
  Exemplo:
  - moment.js (232KB) → date-fns (13KB) ou Day.js (2KB)
  - lodash (530KB) → lodash-es com tree-shaking
  - axios (52KB) → fetch nativo
  ```

- [ ] **Usar imports nomeados para tree-shaking**
  ```typescript
  // ❌ Importa tudo
  import _ from 'lodash';

  // ✅ Importa apenas o necessário
  import { debounce } from 'lodash-es';
  ```

- [ ] **Lazy load de dependências pesadas**
  ```typescript
  // Carregar apenas quando necessário
  const HeavyComponent = lazy(() => import('./HeavyComponent'));
  ```

### 2. Imagens e Assets

**Ações:**

- [ ] **Otimizar imagens**
  ```bash
  # Instalar ferramenta
  npm install -g sharp-cli

  # Otimizar PNGs
  npx sharp-cli -i input.png -o output.png --quality 85

  # Converter para WebP (melhor compressão)
  npx sharp-cli -i input.png -o output.webp
  ```

- [ ] **Usar formato apropriado**
  ```
  - Ícones: SVG (escala infinita, pequeno)
  - Fotos: WebP ou JPG otimizado
  - Transparência: PNG ou WebP
  - Animações: Lottie ao invés de GIF/vídeo
  ```

- [ ] **Implementar lazy loading de imagens**
  ```typescript
  import { Image } from 'expo-image';

  <Image
    source={{ uri: imageUrl }}
    placeholder={placeholderImage}
    contentFit="cover"
    transition={200}
  />
  ```

- [ ] **Usar CDN para assets grandes**
  ```typescript
  // ❌ Assets locais pesados
  import largeImage from './assets/large-image.png';

  // ✅ Servir de CDN
  const imageUrl = 'https://cdn.example.com/large-image.webp';
  ```

### 3. Code Splitting

**Ações:**

- [ ] **Lazy load de telas**
  ```typescript
  // app/(tabs)/settings.tsx
  import { lazy } from 'react';

  const SettingsScreen = lazy(() => import('@/features/settings/SettingsScreen'));

  export default function Settings() {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <SettingsScreen />
      </Suspense>
    );
  }
  ```

- [ ] **Separar vendor chunks**
  ```javascript
  // metro.config.js
  module.exports = {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true, // Reduz tamanho inicial
        },
      }),
    },
  };
  ```

### 4. Hermes Engine

**Habilitar Hermes (se ainda não habilitado):**

```javascript
// android/app/build.gradle
project.ext.react = [
    enableHermes: true  // Reduz bundle size em ~30%
]

// ios/Podfile
use_react_native!(
  :hermes_enabled => true
)
```

**Benefícios:**
- Menor tamanho do bundle (~30% de redução)
- Startup mais rápido
- Menor uso de memória

### 5. ProGuard / R8 (Android)

**Habilitar minificação:**

```gradle
// android/app/build.gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 6. Remove Dead Code

**Configurar:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "removeComments": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

```javascript
// .eslintrc.js
{
  "rules": {
    "no-unused-vars": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

---

## Plano de Ação

### Prioridade Alta (Economia > 500KB)

1. **[Ação 1]**
   - Economia: [X] MB
   - Esforço: [horas]
   - Owner: [pessoa]
   - Prazo: [data]

2. **[Ação 2]**
   - Economia: [X] KB
   - Esforço: [horas]
   - Owner: [pessoa]
   - Prazo: [data]

### Prioridade Média (Economia 100KB - 500KB)

1. **[Ação]**
   - Economia: [X] KB
   - Esforço: [horas]
   - Owner: [pessoa]
   - Prazo: [data]

### Prioridade Baixa (Economia < 100KB)

1. **[Ação]**
   - Economia: [X] KB
   - Esforço: [horas]
   - Owner: [pessoa]
   - Prazo: [data]

---

## Metas de Otimização

```markdown
## Objetivos

### Metas de Curto Prazo (1 semana)
- Reduzir bundle de [X] MB para [Y] MB
- Remover [N] dependências não utilizadas
- Otimizar [N] imagens

### Metas de Médio Prazo (1 mês)
- Implementar code splitting para rotas principais
- Migrar assets grandes para CDN
- Atingir tamanho de bundle < [X] MB

### Metas de Longo Prazo (3 meses)
- Bundle size otimizado consistentemente
- Processo de CI/CD verificando tamanho de bundle
- Budget de performance configurado
```

---

## Monitoramento Contínuo

### Configurar Budget de Bundle

```javascript
// app.json
{
  "expo": {
    "packagerOpts": {
      "config": "metro.config.js"
    }
  }
}

// Adicionar ao CI/CD
"scripts": {
  "check-size": "bundlesize"
}

// .bundlesizerc
{
  "files": [
    {
      "path": "./dist/**/*.js",
      "maxSize": "4 MB"
    }
  ]
}
```

### Alertas Automáticos

```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check

on: [pull_request]

jobs:
  check-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check bundle size
        run: npm run check-size
      - name: Comment on PR
        if: failure()
        uses: actions/github-script@v5
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ Bundle size exceeded! Please optimize.'
            })
```

---

## Ferramentas Úteis

- **Análise de Bundle**: webpack-bundle-analyzer, source-map-explorer
- **Análise de Dependências**: cost-of-modules, package-size, bundlephobia.com
- **Otimização de Imagens**: sharp, imagemin, squoosh
- **Dead Code**: unimported, depcheck, knip
- **Monitoramento**: bundlesize, size-limit

---

## Checklist Final

- [ ] Bundle size analisado
- [ ] Dependências otimizadas
- [ ] Assets otimizados
- [ ] Code splitting implementado
- [ ] Hermes habilitado
- [ ] ProGuard/R8 configurado
- [ ] Dead code removido
- [ ] Monitoramento contínuo configurado
- [ ] Metas definidas
- [ ] Plano de ação criado
- [ ] CI/CD verificando bundle size

---

**O tamanho do app impacta diretamente a taxa de download e retenção de usuários. Monitore constantemente!**

---
description: Análise do Tamanho do Bundle
---

# Análise do Tamanho do Bundle

Analise o bundle de produção para identificar oportunidades de otimização.

## O Que Este Comando Faz

1. **Análise do Bundle**
   - Visualizar a composição do bundle
   - Identificar dependências volumosas
   - Detectar código duplicado
   - Verificar a divisão de código (code splitting)
   - Analisar tamanhos de chunks

2. **Ferramentas Utilizadas**
   - rollup-plugin-visualizer (Vite)
   - webpack-bundle-analyzer (Webpack)
   - source-map-explorer

3. **Relatório Gerado**
   - Treemap interativo
   - Detalhamento de tamanho por módulo
   - Tamanhos comprimidos (gzip)
   - Recomendações de otimização

## Como Usar

```bash
# Analisar bundle
npm run build:analyze

# Ou com pnpm
pnpm build:analyze
```

## Modo de Planejamento

> O modo de planejamento é ativado automaticamente quando o escopo abrange múltiplos módulos ou requer investigação transversal.

## Configuração

### Vite (rollup-plugin-visualizer)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap' // ou 'sunburst', 'network'
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'query-vendor': ['@tanstack/react-query'],
          'form-vendor': ['react-hook-form', 'zod']
        }
      }
    }
  }
});
```

### Webpack (webpack-bundle-analyzer)

```typescript
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html',
      openAnalyzer: true
    })
  ]
};
```

## O Que Verificar

### 1. Dependências Volumosas

```typescript
// ❌ Ruim - Importando biblioteca inteira
import _ from 'lodash';
import moment from 'moment';

// ✅ Bom - Importando apenas o necessário
import debounce from 'lodash/debounce';
import { format } from 'date-fns';
```

### 2. Código Duplicado

```typescript
// ❌ Ruim - Duplicado em múltiplos chunks
// Verificar se o mesmo código aparece em múltiplos bundles

// ✅ Bom - Extrair para chunk compartilhado
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'shared': ['./src/utils/common.ts']
      }
    }
  }
}
```

### 3. Divisão de Código (Code Splitting)

```typescript
// ❌ Ruim - Carregando tudo de uma vez
import { HeavyComponent } from './HeavyComponent';

// ✅ Bom - Carregamento preguiçoso (lazy loading)
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

### 4. Tree Shaking

```typescript
// ❌ Ruim - Impede o tree shaking
import * as Utils from './utils';

// ✅ Bom - Permite o tree shaking
import { formatDate, validateEmail } from './utils';
```

## Estratégias de Otimização

### 1. Carregamento Preguiçoso de Rotas

```typescript
// App.tsx
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. Importações Dinâmicas

```typescript
// Carregar biblioteca pesada somente quando necessário
const loadChart = async () => {
  const Chart = await import('chart.js');
  return Chart;
};

function ChartComponent() {
  useEffect(() => {
    loadChart().then((Chart) => {
      // Usar Chart.js
    });
  }, []);
}
```

### 3. Substituir Bibliotecas Pesadas

```bash
# Substituir moment.js (290KB) por date-fns (13KB)
npm uninstall moment
npm install date-fns

# Substituir lodash (71KB) por lodash-es (tree-shakeable)
npm uninstall lodash
npm install lodash-es
```

### 4. Remover Código Não Utilizado

```bash
# Encontrar exportações não utilizadas
npx ts-prune

# Remover dependências não utilizadas
npx depcheck
```

## Metas de Tamanho

### Tamanhos de Bundle Recomendados

- **Bundle Inicial**: < 200KB (gzipped)
- **JavaScript Total**: < 500KB (gzipped)
- **Chunks Individuais**: < 100KB cada
- **Maior Chunk**: < 200KB

### Configuração de Budget

```json
// vite.config.ts
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 500, // KB
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});
```

## Budget de Performance (Lighthouse)

```json
// budget.json
[
  {
    "resourceSizes": [
      {
        "resourceType": "script",
        "budget": 200
      },
      {
        "resourceType": "total",
        "budget": 500
      }
    ]
  }
]
```

## Monitoramento Contínuo

### Integração CI/CD

```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check

on: [pull_request]

jobs:
  check-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Problemas Comuns

### Problema 1: Bundle de Vendor Grande

**Solução**: Dividir o código de vendor
```typescript
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'router-vendor': ['react-router'],
  'query-vendor': ['@tanstack/react-query']
}
```

### Problema 2: Dependências Duplicadas

**Solução**: Verificar e desduplicar
```bash
npm dedupe
# ou
pnpm dedupe
```

### Problema 3: CSS Não Utilizado

**Solução**: PurgeCSS
```bash
npm install -D @fullhuman/postcss-purgecss
```

## Ferramentas

- [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer)
- [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [source-map-explorer](https://github.com/danvk/source-map-explorer)
- [bundlephobia](https://bundlephobia.com/)
- [Package Phobia](https://packagephobia.com/)

## Boas Práticas

1. **Analisar regularmente** após adicionar dependências
2. **Definir budgets de tamanho** e aplicá-los no CI
3. **Carregar preguiçosamente** código não crítico
4. **Aplicar tree shaking** de forma agressiva
5. **Monitorar** o tamanho do bundle ao longo do tempo
6. **Dividir o código** de forma inteligente
7. **Escolher alternativas leves** para bibliotecas pesadas
8. **Remover dependências** não utilizadas

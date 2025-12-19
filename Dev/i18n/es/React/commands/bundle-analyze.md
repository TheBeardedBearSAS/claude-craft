---
description: Comando: Analizar Bundle
---

# Comando: Analizar Bundle

Analiza el tamaño del bundle de producción e identifica oportunidades de optimización.

## Ejecución

```bash
npm run bundle-analyze
```

## Configuración

### Instalar webpack-bundle-analyzer

```bash
npm install -D webpack-bundle-analyzer
# o para Vite
npm install -D rollup-plugin-visualizer
```

### Configuración para Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: './dist/stats.html'
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'query-vendor': ['@tanstack/react-query']
        }
      }
    }
  }
});
```

## Análisis

### 1. Generar y Visualizar Bundle

```bash
# Build con análisis
npm run build

# Ver reporte visual
open dist/stats.html
```

### 2. Analizar Dependencias

```bash
# Ver tamaños de dependencias
npx vite-bundle-visualizer

# Analizar con source-map-explorer
npx source-map-explorer 'dist/**/*.js'
```

### 3. Verificar Tamaños

```bash
# Listar archivos del build
ls -lh dist/assets/

# Ver tamaño total
du -sh dist/
```

## Métricas Objetivo

### Tamaños Recomendados
- **Bundle inicial**: < 200 KB (gzipped)
- **Bundle total**: < 500 KB (gzipped)
- **JavaScript por chunk**: < 150 KB (gzipped)
- **CSS**: < 50 KB (gzipped)

### Lighthouse Budget

```json
// budget.json
{
  "resourceSizes": [
    {
      "resourceType": "script",
      "budget": 200
    },
    {
      "resourceType": "stylesheet",
      "budget": 50
    },
    {
      "resourceType": "image",
      "budget": 300
    },
    {
      "resourceType": "total",
      "budget": 500
    }
  ],
  "resourceCounts": [
    {
      "resourceType": "script",
      "budget": 10
    },
    {
      "resourceType": "third-party",
      "budget": 5
    }
  ]
}
```

## Optimizaciones

### 1. Code Splitting por Rutas

```typescript
// App.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load de páginas
const HomePage = lazy(() => import('@/pages/HomePage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

const App = () => (
  <BrowserRouter>
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);
```

### 2. Dynamic Imports

```typescript
// Cargar componentes bajo demanda
const handleOpenModal = async () => {
  const { Modal } = await import('@/components/Modal');
  setModalComponent(<Modal />);
};

// Cargar utilidades bajo demanda
const handleExport = async () => {
  const { exportToCSV } = await import('@/utils/export');
  exportToCSV(data);
};
```

### 3. Optimizar Dependencias

```typescript
// ❌ Mal - Importa toda la librería
import _ from 'lodash';
import moment from 'moment';

// ✅ Bien - Importa solo lo necesario
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import dayjs from 'dayjs';  // Alternativa más ligera
```

### 4. Tree Shaking

```typescript
// Asegurar que el código es tree-shakeable
// package.json
{
  "sideEffects": [
    "*.css",
    "*.scss"
  ]
}

// Usar imports nombrados
// ❌ Mal
import utils from './utils';

// ✅ Bien
import { formatDate, parseDate } from './utils';
```

### 5. Manual Chunks

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'react-vendor';
            }
            if (id.includes('@tanstack')) {
              return 'query-vendor';
            }
            if (id.includes('zod')) {
              return 'validation-vendor';
            }
            return 'vendor';
          }

          // Feature chunks
          if (id.includes('/features/auth/')) {
            return 'auth-feature';
          }
          if (id.includes('/features/dashboard/')) {
            return 'dashboard-feature';
          }
        }
      }
    }
  }
});
```

## Análisis de Problemas Comunes

### 1. Dependencias Grandes

```bash
# Identificar dependencias grandes
npx webpack-bundle-analyzer dist/stats.json

# Alternativas ligeras:
# - moment → dayjs (97% más pequeño)
# - lodash → lodash-es o imports individuales
# - axios → fetch API nativo
# - material-ui → headless UI + tailwind
```

### 2. Código Duplicado

```bash
# Encontrar duplicación
npx jscpd --pattern "src/**/*.{ts,tsx}"

# Refactorizar código duplicado en:
# - Hooks compartidos
# - Utilidades comunes
# - Componentes reutilizables
```

### 3. Imports No Usados

```bash
# Detectar imports no usados
npx unimported

# Remover con ESLint
npx eslint --fix src/
```

## Performance Budget en CI

```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check

on: [pull_request]

jobs:
  check-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build

      - name: Check bundle size
        uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

### size-limit Configuration

```json
// .size-limit.json
[
  {
    "name": "Initial JS",
    "path": "dist/assets/index-*.js",
    "limit": "200 KB"
  },
  {
    "name": "Initial CSS",
    "path": "dist/assets/index-*.css",
    "limit": "50 KB"
  },
  {
    "name": "Total",
    "path": "dist/**/*.{js,css}",
    "limit": "500 KB"
  }
]
```

## Informe de Análisis

```markdown
# Informe de Análisis de Bundle

## Resumen
- **Fecha**: [fecha]
- **Branch**: [branch]
- **Tamaño Total**: [tamaño] KB (gzipped)
- **Chunks**: [número]

## Métricas

### JavaScript
- Bundle inicial: XXX KB
- Lazy chunks: XXX KB
- Vendor chunks: XXX KB

### CSS
- Estilos iniciales: XXX KB
- Lazy styles: XXX KB

## Dependencias Principales

| Librería | Tamaño | % del Total |
|----------|--------|-------------|
| react | XX KB | XX% |
| react-dom | XX KB | XX% |
| @tanstack/react-query | XX KB | XX% |

## Problemas Identificados

1. ❌ [Problema 1]
   - Impacto: XX KB
   - Solución propuesta: [solución]

2. ❌ [Problema 2]
   - Impacto: XX KB
   - Solución propuesta: [solución]

## Recomendaciones

1. [ ] Implementar code splitting para rutas
2. [ ] Lazy load de componentes pesados
3. [ ] Reemplazar [dependencia] por alternativa más ligera
4. [ ] Optimizar imports de [librería]

## Comparación con Main

- Diferencia: +/- XX KB
- Nuevas dependencias: [lista]
- Dependencias removidas: [lista]
```

## Comandos Útiles

```bash
# Analizar bundle
npm run build && npx vite-bundle-visualizer

# Ver dependencias por tamaño
npm list --depth=0

# Auditar dependencias
npm audit

# Encontrar paquetes duplicados
npm dedupe

# Ver tamaño instalado de dependencias
npx cost-of-modules

# Analizar con Lighthouse
npx lighthouse http://localhost:3000 --view

# Bundle phobia (antes de instalar)
# Visitar: https://bundlephobia.com/package/[package-name]
```

## Mejores Prácticas

### DO ✅
- Lazy load de rutas y componentes pesados
- Code splitting estratégico
- Tree shaking habilitado
- Usar alternativas ligeras de librerías
- Monitorear tamaño en CI/CD
- Analizar antes de agregar dependencias

### DON'T ❌
- Importar librerías completas
- Duplicar código entre chunks
- Incluir dev dependencies en producción
- Ignorar warnings de bundle size
- Cargar todo upfront
- Agregar dependencias sin revisar tamaño

## Recursos

- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Vite Bundle Visualizer](https://github.com/btd/rollup-plugin-visualizer)
- [Bundle Phobia](https://bundlephobia.com/)
- [Size Limit](https://github.com/ai/size-limit)
- [Import Cost Extension](https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost)

---

**Objetivo**: Mantener bundle inicial < 200 KB (gzipped)

**Frecuencia**: Verificar en cada PR que agregue dependencias

**Versión**: 1.0
**Última actualización**: 2025-12-03

---
description: Bundle-Größenanalyse
---

# Bundle-Größenanalyse

Das Produktions-Bundle analysieren, um Optimierungsmöglichkeiten zu identifizieren.

## Was dieser Befehl tut

1. **Bundle-Analyse**
   - Bundle-Zusammensetzung visualisieren
   - Große Abhängigkeiten identifizieren
   - Duplizierten Code erkennen
   - Code-Splitting prüfen
   - Chunk-Größen analysieren

2. **Verwendete Tools**
   - rollup-plugin-visualizer (Vite)
   - webpack-bundle-analyzer (Webpack)
   - source-map-explorer

3. **Generierter Bericht**
   - Interaktive Treemap
   - Größenaufschlüsselung nach Modul
   - Komprimierte Größen (Gzip)
   - Optimierungsempfehlungen

## Verwendung

```bash
# Bundle analysieren
npm run build:analyze

# Oder mit pnpm
pnpm build:analyze
```

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## Konfiguration

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
      template: 'treemap' // oder 'sunburst', 'network'
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
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

## Was zu prüfen ist

### 1. Große Abhängigkeiten

```typescript
// ❌ Schlecht - Gesamte Bibliothek importieren
import _ from 'lodash';
import moment from 'moment';

// ✅ Gut - Nur das Benötigte importieren
import debounce from 'lodash/debounce';
import { format } from 'date-fns';
```

### 2. Duplizierter Code

```typescript
// ❌ Schlecht - In mehreren Chunks dupliziert
// Prüfen, ob derselbe Code in mehreren Bundles erscheint

// ✅ Gut - In gemeinsamen Chunk extrahieren
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

### 3. Code-Splitting

```typescript
// ❌ Schlecht - Alles auf einmal laden
import { HeavyComponent } from './HeavyComponent';

// ✅ Gut - Lazy Loading
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

### 4. Tree Shaking

```typescript
// ❌ Schlecht - Verhindert Tree Shaking
import * as Utils from './utils';

// ✅ Gut - Ermöglicht Tree Shaking
import { formatDate, validateEmail } from './utils';
```

## Optimierungsstrategien

### 1. Lazy Loading für Routen

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

### 2. Dynamische Imports

```typescript
// Schwere Bibliothek nur bei Bedarf laden
const loadChart = async () => {
  const Chart = await import('chart.js');
  return Chart;
};

function ChartComponent() {
  useEffect(() => {
    loadChart().then((Chart) => {
      // Chart.js verwenden
    });
  }, []);
}
```

### 3. Schwere Bibliotheken ersetzen

```bash
# moment.js (290KB) durch date-fns (13KB) ersetzen
npm uninstall moment
npm install date-fns

# lodash (71KB) durch lodash-es (tree-shakeable) ersetzen
npm uninstall lodash
npm install lodash-es
```

### 4. Ungenutzten Code entfernen

```bash
# Ungenutzte Exporte finden
npx ts-prune

# Ungenutzte Abhängigkeiten entfernen
npx depcheck
```

## Größenziele

### Empfohlene Bundle-Größen

- **Initial-Bundle**: < 200 KB (gzip-komprimiert)
- **Gesamt-JavaScript**: < 500 KB (gzip-komprimiert)
- **Einzelne Chunks**: < 100 KB je Chunk
- **Größter Chunk**: < 200 KB

### Budget-Konfiguration

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

## Performance-Budget (Lighthouse)

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

## Kontinuierliche Überwachung

### CI/CD-Integration

```yaml
# .github/workflows/bundle-size.yml
name: Bundle-Größenprüfung

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

## Häufige Probleme

### Problem 1: Großes Vendor-Bundle

**Lösung**: Vendor-Code aufteilen
```typescript
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'router-vendor': ['react-router-dom'],
  'query-vendor': ['@tanstack/react-query']
}
```

### Problem 2: Duplizierte Abhängigkeiten

**Lösung**: Prüfen und deduplizieren
```bash
npm dedupe
# oder
pnpm dedupe
```

### Problem 3: Ungenutztes CSS

**Lösung**: PurgeCSS verwenden
```bash
npm install -D @fullhuman/postcss-purgecss
```

## Tools

- [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer)
- [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [source-map-explorer](https://github.com/danvk/source-map-explorer)
- [bundlephobia](https://bundlephobia.com/)
- [Package Phobia](https://packagephobia.com/)

## Best Practices

1. **Regelmäßig analysieren** nach dem Hinzufügen von Abhängigkeiten
2. **Größenbudgets festlegen** und in CI durchsetzen
3. **Nicht-kritischen Code** lazy laden
4. **Tree Shaking** aggressiv einsetzen
5. **Bundle-Größe** im Laufe der Zeit überwachen
6. **Code intelligent aufteilen**
7. **Leichtgewichtige Alternativen** wählen
8. **Ungenutzte** Abhängigkeiten entfernen

---
description: Analyse du Bundle React
argument-hint: [arguments]
---

# Analyse du Bundle React

Tu es un expert performance React. Tu dois analyser la taille du bundle, identifier les dépendances volumineuses et proposer des optimisations.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Mode : full, dependencies, chunks

Exemple : `/react:bundle-analyze` ou `/react:bundle-analyze dependencies`

## MISSION

### Étape 1 : Outils d'Analyse

```bash
# Webpack Bundle Analyzer
npm install --save-dev webpack-bundle-analyzer

# Pour Vite
npm install --save-dev rollup-plugin-visualizer

# Pour Next.js
npm install --save-dev @next/bundle-analyzer

# Source Map Explorer (alternative)
npm install --save-dev source-map-explorer
```

### Étape 2 : Configuration

#### Webpack (CRA / Custom)

```javascript
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html',
      openAnalyzer: false,
      generateStatsFile: true,
      statsFilename: 'bundle-stats.json',
    }),
  ],
};
```

```json
// package.json
{
  "scripts": {
    "analyze": "npm run build && npx webpack-bundle-analyzer build/bundle-stats.json",
    "analyze:server": "BUNDLE_ANALYZE=true npm run build"
  }
}
```

#### Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'bundle-report.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

#### Next.js

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // Next.js config
});
```

```json
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}
```

### Étape 3 : Lancer l'Analyse

```bash
# Build avec stats
npm run build -- --stats

# Analyser
npx webpack-bundle-analyzer dist/stats.json

# Ou avec source-map-explorer
npx source-map-explorer dist/assets/*.js
```

### Étape 4 : Identifier les Problèmes

#### Dépendances Volumineuses Courantes

| Package | Taille | Alternative |
|---------|--------|-------------|
| moment | ~300KB | date-fns (~30KB), dayjs (~7KB) |
| lodash | ~70KB | lodash-es (tree-shake), just-* |
| axios | ~15KB | fetch natif, ky (~3KB) |
| uuid | ~9KB | crypto.randomUUID() natif |
| classnames | ~2KB | clsx (~1KB) |
| react-icons (all) | ~1MB | @react-icons/* (tree-shake) |

### Étape 5 : Optimisations

#### 1. Code Splitting

```typescript
// Lazy loading des routes
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Suspense>
  );
}

// Lazy loading de composants lourds
const HeavyChart = lazy(() => import('./components/HeavyChart'));
const PdfViewer = lazy(() => import('./components/PdfViewer'));
```

#### 2. Dynamic Imports

```typescript
// Import dynamique conditionnel
async function loadAnalytics() {
  if (process.env.NODE_ENV === 'production') {
    const { initAnalytics } = await import('./analytics');
    initAnalytics();
  }
}

// Import dynamique de features
const featureModules = {
  'feature-a': () => import('./features/feature-a'),
  'feature-b': () => import('./features/feature-b'),
};

async function loadFeature(name: string) {
  const loader = featureModules[name];
  if (loader) {
    const module = await loader();
    return module.default;
  }
  return null;
}
```

#### 3. Tree Shaking

```typescript
// ❌ MAUVAIS - Importe tout lodash
import _ from 'lodash';
_.debounce(fn, 300);

// ✅ BON - Import sélectif
import debounce from 'lodash/debounce';
debounce(fn, 300);

// ✅ ENCORE MIEUX - lodash-es (ESM)
import { debounce } from 'lodash-es';

// ❌ MAUVAIS - Importe toutes les icônes
import { FaHome, FaUser } from 'react-icons/fa';

// ✅ BON - Import direct
import FaHome from '@react-icons/fa/FaHome';
import FaUser from '@react-icons/fa/FaUser';
```

#### 4. Externaliser les Dépendances (CDN)

```html
<!-- index.html -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
```

```javascript
// webpack.config.js
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};
```

#### 5. Compression

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
});
```

### Étape 6 : Générer le Rapport

```
══════════════════════════════════════════════════════════════
📦 RAPPORT ANALYSE BUNDLE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📊 MÉTRIQUES GLOBALES
──────────────────────────────────────────────────────────────

| Métrique | Valeur | Seuil | Status |
|----------|--------|-------|--------|
| Total (raw) | 1.8 MB | < 1 MB | ❌ |
| Total (gzip) | 485 KB | < 250 KB | ⚠️ |
| Total (brotli) | 398 KB | < 200 KB | ⚠️ |
| Initial JS | 320 KB | < 200 KB | ⚠️ |
| Largest chunk | 180 KB | < 100 KB | ⚠️ |

──────────────────────────────────────────────────────────────
📁 RÉPARTITION PAR CHUNK
──────────────────────────────────────────────────────────────

| Chunk | Taille (gzip) | % Total |
|-------|---------------|---------|
| main.js | 180 KB | 37% |
| vendor.js | 150 KB | 31% |
| pages/Dashboard | 45 KB | 9% |
| pages/Settings | 30 KB | 6% |
| shared.js | 25 KB | 5% |
| ... | ... | ... |

──────────────────────────────────────────────────────────────
🏋️ DÉPENDANCES LES PLUS LOURDES
──────────────────────────────────────────────────────────────

| Package | Taille | % Bundle | Tree-Shaked? |
|---------|--------|----------|--------------|
| react-dom | 120 KB | 25% | N/A |
| @mui/material | 85 KB | 18% | Partiel |
| lodash | 70 KB | 14% | ❌ Non |
| moment | 65 KB | 13% | ❌ Non |
| chart.js | 45 KB | 9% | ✅ Oui |
| axios | 15 KB | 3% | ✅ Oui |

──────────────────────────────────────────────────────────────
⚠️ PROBLÈMES DÉTECTÉS
──────────────────────────────────────────────────────────────

### 1. Lodash complet importé (70 KB)

**Fichiers concernés :**
- src/utils/helpers.ts (ligne 5)
- src/components/Table.tsx (ligne 12)

**Impact :** +70 KB

**Correction :**
```typescript
// Avant
import _ from 'lodash';

// Après
import debounce from 'lodash/debounce';
import groupBy from 'lodash/groupBy';
```

### 2. Moment.js avec toutes les locales (65 KB)

**Fichiers concernés :**
- src/utils/date.ts

**Impact :** +55 KB (locales inutilisées)

**Correction :**
```typescript
// Option 1: Utiliser date-fns
import { format, parseISO } from 'date-fns';

// Option 2: Limiter les locales moment
// webpack.config.js
new webpack.ContextReplacementPlugin(
  /moment[/\\]locale$/,
  /fr|en/
);
```

### 3. Pas de code splitting sur les routes

**Impact :** Initial load +150 KB

**Correction :**
```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

### 4. Duplications de dépendances

**Détectés :**
- `tslib` x2 versions (3.7.1 et 4.0.0)
- `lodash` et `lodash-es` ensemble

**Impact :** +25 KB

**Correction :**
```json
// package.json resolutions
{
  "resolutions": {
    "tslib": "^2.6.0"
  }
}
```

──────────────────────────────────────────────────────────────
💡 OPTIMISATIONS SUGGÉRÉES
──────────────────────────────────────────────────────────────

### Impact ÉLEVÉ

1. **Remplacer Moment.js par date-fns**
   - Gain estimé : ~55 KB
   - Effort : Moyen
   ```bash
   npm uninstall moment
   npm install date-fns
   ```

2. **Ajouter code splitting aux routes**
   - Gain estimé : Initial -150 KB
   - Effort : Faible

3. **Import sélectif Lodash**
   - Gain estimé : ~60 KB
   - Effort : Faible

### Impact MOYEN

4. **Externaliser React/React-DOM via CDN**
   - Gain estimé : ~120 KB (du bundle)
   - Effort : Faible

5. **Lazy load des composants lourds**
   - Charts, Editors, PDF viewers
   - Gain estimé : Initial -80 KB

6. **Activer compression Brotli**
   - Gain estimé : 20% sur gzip
   - Effort : Faible

──────────────────────────────────────────────────────────────
📈 IMPACT ESTIMÉ DES OPTIMISATIONS
──────────────────────────────────────────────────────────────

| Optimisation | Avant | Après | Gain |
|--------------|-------|-------|------|
| Code splitting | 485 KB | 320 KB | -34% |
| Replace moment | 485 KB | 430 KB | -11% |
| Lodash imports | 485 KB | 415 KB | -14% |
| Fix duplications | 485 KB | 460 KB | -5% |
| **Cumulé** | 485 KB | 260 KB | **-46%** |

──────────────────────────────────────────────────────────────
🔧 COMMANDES
──────────────────────────────────────────────────────────────

# Analyser le bundle
npm run analyze

# Visualiser avec source-map-explorer
npx source-map-explorer dist/assets/*.js

# Vérifier les duplications
npx depcheck

# Trouver les packages inutilisés
npx depcheck --ignores="@types/*"

──────────────────────────────────────────────────────────────
🎯 PRIORITÉS
──────────────────────────────────────────────────────────────

1. [ ] Ajouter code splitting aux routes (impact immédiat)
2. [ ] Migrer Moment.js → date-fns
3. [ ] Corriger imports Lodash
4. [ ] Résoudre duplications tslib
5. [ ] Lazy load des composants Charts/PDF
6. [ ] Configurer compression Brotli
```

### Configuration CI/CD

```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size

on: [pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Analyze bundle
        uses: preactjs/compressed-size-action@v2
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          pattern: './dist/**/*.{js,css}'
          compression: 'gzip'
```

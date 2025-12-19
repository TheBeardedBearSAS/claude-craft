---
description: Bundle Size Analysis
---

# Bundle Size Analysis

Analyze the production bundle to identify optimization opportunities.

## What This Command Does

1. **Bundle Analysis**
   - Visualize bundle composition
   - Identify large dependencies
   - Detect duplicate code
   - Check code splitting
   - Analyze chunk sizes

2. **Tools Used**
   - rollup-plugin-visualizer (Vite)
   - webpack-bundle-analyzer (Webpack)
   - source-map-explorer

3. **Generated Report**
   - Interactive treemap
   - Size breakdown by module
   - Gzipped sizes
   - Optimization recommendations

## How to Use

```bash
# Analyze bundle
npm run build:analyze

# Or with pnpm
pnpm build:analyze
```

## Configuration

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
      template: 'treemap' // or 'sunburst', 'network'
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

## What to Check

### 1. Large Dependencies

```typescript
// ❌ Bad - Importing entire library
import _ from 'lodash';
import moment from 'moment';

// ✅ Good - Importing only what's needed
import debounce from 'lodash/debounce';
import { format } from 'date-fns';
```

### 2. Duplicate Code

```typescript
// ❌ Bad - Duplicated in multiple chunks
// Check if the same code appears in multiple bundles

// ✅ Good - Extract to shared chunk
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

### 3. Code Splitting

```typescript
// ❌ Bad - Loading everything at once
import { HeavyComponent } from './HeavyComponent';

// ✅ Good - Lazy loading
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

### 4. Tree Shaking

```typescript
// ❌ Bad - Prevents tree shaking
import * as Utils from './utils';

// ✅ Good - Allows tree shaking
import { formatDate, validateEmail } from './utils';
```

## Optimization Strategies

### 1. Lazy Loading Routes

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

### 2. Dynamic Imports

```typescript
// Load heavy library only when needed
const loadChart = async () => {
  const Chart = await import('chart.js');
  return Chart;
};

function ChartComponent() {
  useEffect(() => {
    loadChart().then((Chart) => {
      // Use Chart.js
    });
  }, []);
}
```

### 3. Replace Heavy Libraries

```bash
# Replace moment.js (290KB) with date-fns (13KB)
npm uninstall moment
npm install date-fns

# Replace lodash (71KB) with lodash-es (tree-shakeable)
npm uninstall lodash
npm install lodash-es
```

### 4. Remove Unused Code

```bash
# Find unused exports
npx ts-prune

# Remove unused dependencies
npx depcheck
```

## Size Targets

### Recommended Bundle Sizes

- **Initial Bundle**: < 200KB (gzipped)
- **Total JavaScript**: < 500KB (gzipped)
- **Individual Chunks**: < 100KB each
- **Largest Chunk**: < 200KB

### Budget Configuration

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

## Performance Budget (Lighthouse)

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

## Continuous Monitoring

### CI/CD Integration

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

## Common Issues

### Issue 1: Large Vendor Bundle

**Solution**: Split vendor code
```typescript
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'router-vendor': ['react-router-dom'],
  'query-vendor': ['@tanstack/react-query']
}
```

### Issue 2: Duplicate Dependencies

**Solution**: Check and deduplicate
```bash
npm dedupe
# or
pnpm dedupe
```

### Issue 3: Unused CSS

**Solution**: PurgeCSS
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

1. **Analyze regularly** after adding dependencies
2. **Set size budgets** and enforce them in CI
3. **Lazy load** non-critical code
4. **Tree shake** aggressively
5. **Monitor** bundle size over time
6. **Split code** intelligently
7. **Choose lightweight** alternatives
8. **Remove unused** dependencies

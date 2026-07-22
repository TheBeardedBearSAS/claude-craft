# Vite 8.1 (framework-agnostic) - Quick Reference

> ⚠️ **Tier-3 / Community** — This stack is community-maintained and scoped strictly to **framework-agnostic** Vite usage. It does **not** cover React/Vue/Angular/Svelte's own Vite dev-server integration — those are documented in each stack's own `tooling.md` (`@.claude/references/react/`, `@.claude/references/vuejs/`, `@.claude/references/angular/`, `@.claude/references/svelte/`).

> Scope framework-agnostic uniquement. Pour Vite en tant que dev-server React/Vue/Angular/Svelte, voir le tooling.md de ce stack.

## Versions Requises (2026)

| Composant | Version | Notes |
|-----------|---------|-------|
| Vite | 8.1.x | Rolldown bundler par défaut (voir `rolldown.md`) |
| TypeScript | 5.6+ | Strict mode obligatoire |
| Vitest | 4.1+ | Browser Mode stable pour workers/WASM |
| Node.js | 22+ | LTS requis par Vite 8 |
| vite-plugin-dts | 4.x | Génération `.d.ts` pour `build.lib` |

**Source :** [Vite 8 blog](https://vite.dev/blog/) | [Rolldown](https://rolldown.rs/)

## Ce que couvre ce stack

Vite n'a **pas de modèle de composant propre** — c'est un build tool et un dev server. Ce stack documente les 4 usages **framework-agnostic** de Vite :

| Shape | Description | Doc |
|-------|-------------|-----|
| **Vanilla SPA** | `index.html` comme point d'entrée source, TypeScript/JS pur ou Web Components (Lit) | `architecture.md` §1 |
| **Library authoring** | `build.lib` + `vite-plugin-dts`, publication npm ESM/CJS | `architecture.md` §2 |
| **Multi-page app (MPA)** | `build.rollupOptions.input` avec plusieurs entrées HTML | `architecture.md` §3 |
| **Workers / WASM** | Entrées `?worker`, `?worker&inline`, modules WebAssembly | `architecture.md` §4 |

## Hors scope (explicitement)

- Intégration Vite comme dev-server pour **React** (`@vitejs/plugin-react`) → voir `@.claude/references/react/`
- Intégration Vite comme dev-server pour **Vue.js** (`@vitejs/plugin-vue`) → voir `@.claude/references/vuejs/`
- Intégration Vite comme dev-server pour **Angular** (`@angular/build` basé sur esbuild/Vite) → voir `@.claude/references/angular/`
- Intégration Vite comme dev-server pour **Svelte/SvelteKit** (`@sveltejs/vite-plugin-svelte`) → voir `@.claude/references/svelte/`

Ce stack ne documente **aucun modèle de composant** (pas de JSX, pas de SFC, pas de runes) — uniquement la configuration de build, les entrées, les plugins et l'outillage Vite lui-même.

## Points clés 2026

### Vite 8 — Rolldown par défaut

Depuis Vite 8, **Rolldown** (port Rust de Rollup, par l'équipe Vite/VoidZero) remplace esbuild comme bundler de production par défaut. Build 3-5× plus rapide, API de configuration largement compatible avec `rollupOptions` historique — voir `rolldown.md` pour les différences (ex : `manualChunks` objet supprimé au profit de `codeSplitting.groups`).

### Vanilla SPA — point d'entrée `index.html`

```html
<!-- index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Vite App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

Vite traite `index.html` comme un **fichier source**, pas un template statique : les balises `<script type="module">` et les chemins relatifs sont résolus et transformés au build.

### Library authoring — `build.lib`

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts({ include: ['src'], rollupTypes: true })],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['some-peer-dependency'],
    },
  },
});
```

### Multi-page app — `rollupOptions.input`

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
      },
    },
  },
});
```

### Workers / WASM

```typescript
// Worker dédié (module worker, pattern supporté nativement par Vite)
const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

// WASM (import direct, instancié via ?init)
import init, { compute } from './pkg/compute.wasm?init';
await init();
console.log(compute(42));
```

## Checklist Rapide

- [ ] Vite 8.1.x avec Rolldown (défaut) — pas de `manualChunks` objet
- [ ] Project shape unique et non ambigu (vanilla SPA / library / MPA / workers-wasm)
- [ ] TypeScript strict mode + `vite-env.d.ts` référencé
- [ ] Vitest >= 80% coverage, Browser Mode pour workers/WASM
- [ ] ESLint flat config (`eslint.config.js`)
- [ ] `vite-plugin-dts` pour toute library — `.d.ts` vérifiés dans `dist/`
- [ ] Aucun secret exposé via `envPrefix` (`VITE_*`)

## Documentation Complète

- `architecture.md` — Les 4 project shapes, arborescences ASCII
- `coding-standards.md` — Conventions `vite.config.ts`, nommage `vite-plugin-*`
- `tooling.md` — ESLint flat config, `tsc --noEmit`, scripts npm
- `quality-tools.md` — CI/CD, bundle analysis, pre-commit hooks
- `testing.md` — Vitest framework-agnostic (modules, plugins, workers/WASM)
- `security.md` — `envPrefix`, `define()`, CSP multi-page, sandboxing WASM
- `rolldown.md` — Migration esbuild → Rolldown (Vite 8)
- `project-context.md` — Template de contexte projet

# Vite 8 — Rolldown (bundler par défaut)

> Scope framework-agnostic uniquement. Pour Vite en tant que dev-server React/Vue/Angular/Svelte, voir le tooling.md de ce stack.

> **Status :** Rolldown est le bundler de **production par défaut** depuis Vite 8.0 (précédemment opt-in via `rolldown-vite` sur Vite 7). esbuild reste utilisé pour la transformation TypeScript/JSX à la volée en dev (pré-bundling des dépendances), Rolldown remplace Rollup uniquement pour le **build de production**.

## Pourquoi Rolldown ?

Rolldown est un bundler écrit en **Rust** par l'équipe Vite/VoidZero, conçu comme un remplacement drop-in de Rollup avec une API de configuration très proche (`rollupOptions` reste le point d'entrée conceptuel), mais une exécution native bien plus rapide.

| Aspect | Rollup (Vite ≤7 legacy) | Rolldown (Vite 8 défaut) |
|--------|--------------------------|---------------------------|
| Langage d'implémentation | JavaScript | Rust |
| Vitesse de build (projets moyens/larges) | Référence | 3-5× plus rapide |
| API de configuration | `build.rollupOptions` | `build.rolldownOptions` (superset compatible) |
| `manualChunks` (forme objet) | Supporté | **Supprimé** — remplacé par `codeSplitting.groups` |
| Plugins Rollup tiers | 100% compatibles | Majorité compatible (API `Plugin` partagée), quelques hooks avancés en cours de portage |
| Résolution de modules | `@rollup/plugin-node-resolve` | Résolveur natif intégré, plus rapide |

Bénéfices typiques : builds de production 3 à 5 fois plus rapides sur des projets de taille moyenne à large (centaines de modules), sans changement de sortie fonctionnelle pour la grande majorité des configurations.

## Configuration — `rolldownOptions`

`build.rolldownOptions` est le pendant direct de l'ancien `build.rollupOptions` : mêmes concepts (`input`, `output`, `external`, `plugins`), API largement compatible champ par champ.

```typescript
// vite.config.ts — Vite 8 / Rolldown (défaut)
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        main: 'index.html',
      },
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor', test: /node_modules/ },
            { name: 'wasm-runtime', test: /src\/wasm/ },
          ],
        },
      },
      external: ['some-peer-dependency'],
    },
  },
})
```

### Breaking Change : `manualChunks` (forme objet) supprimée

L'API historique `output.manualChunks` acceptant un objet `{ chunkName: ['module', ...] }` **n'est plus supportée** par Rolldown. Elle est remplacée par `output.codeSplitting.groups`, qui utilise des patterns de test (RegExp ou fonction) au lieu de listes de modules explicites.

```typescript
// ❌ Vite ≤7 / Rollup — forme objet supprimée sous Rolldown
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['lodash', 'date-fns'],
        },
      },
    },
  },
})
```

```typescript
// ✅ Vite 8 / Rolldown (défaut) — codeSplitting.groups
export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor', test: /node_modules\/(lodash|date-fns)/ },
          ],
        },
      },
    },
  },
})
```

**Forme fonction** de `manualChunks` (`(id) => string | void`) : toujours supportée telle quelle sous `rolldownOptions.output.manualChunks`, seule la forme objet a disparu.

```typescript
// ✅ Forme fonction — inchangée, fonctionne sous Rolldown
export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
  },
})
```

## Désactiver Rolldown (legacy, Rollup classique)

Pour un projet nécessitant temporairement la compatibilité stricte avec un plugin Rollup non encore porté :

```bash
npm install -D rollup vite@npm:rollup-vite@latest
```

```typescript
// vite.config.ts — legacy Rollup (uniquement si Rolldown cause une régression avérée)
export default defineConfig({
  build: {
    // Only if Rolldown is explicitly disabled
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['lodash'],
        },
      },
    },
  },
})
```

**Règle** : ne désactiver Rolldown qu'après avoir confirmé qu'un plugin critique est réellement incompatible — la majorité des plugins Rollup tiers fonctionnent sans modification sous Rolldown grâce à l'API `Plugin` partagée.

## Impact sur `vite-plugin-dts` et les libraries

`vite-plugin-dts` génère les `.d.ts` via une passe TypeScript indépendante du bundler (Rollup ou Rolldown) — aucun changement de configuration requis lors de la migration vers Vite 8. Vérifier uniquement que `rollupTypes: true` continue de produire un `.d.ts` unique cohérent avec la sortie JS bundlée par Rolldown (voir `check-library-build.md`).

## Impact sur les Workers / WASM

Le bundling des entrées `?worker` et `?init` (WASM) traverse le même pipeline Rolldown que le reste du build — aucune configuration spécifique requise. Le `worker.format: 'es'` reste la seule option pertinente à vérifier (voir `architecture.md` §4).

## Checklist Migration Vite 7 → 8 (Rolldown)

- [ ] Remplacer toute forme objet de `manualChunks` par `rolldownOptions.output.codeSplitting.groups`
- [ ] Renommer `build.rollupOptions` en `build.rolldownOptions` (les deux clés coexistent, mais `rolldownOptions` est prioritaire et recommandée)
- [ ] Vérifier que chaque plugin Rollup tiers custom fonctionne sans avertissement (`vite-plugin-inspect` pour visualiser les transforms)
- [ ] Mesurer le temps de build avant/après (`time npm run build`) — un gain nul ou négatif signale une régression à investiguer
- [ ] Confirmer que `vite-plugin-dts` produit toujours un `.d.ts` correct (`arethetypeswrong --pack .`)
- [ ] Ne pas désactiver Rolldown "par précaution" — seulement en cas d'incompatibilité de plugin avérée et documentée

## Ressources

- [Vite 8 blog post](https://vite.dev/blog/)
- [Rolldown](https://rolldown.rs/)
- [Rolldown — Rollup compatibility notes](https://rolldown.rs/guide/rollup-compat)

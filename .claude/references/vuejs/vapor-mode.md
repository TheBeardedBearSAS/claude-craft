# Vue.js 3.6 — Vapor Mode (beta)

> **Status :** documentation bootstrapped 2026-05-18 (audit P0 #9). Vapor Mode is **beta** in Vue 3.6 — not yet recommended for new greenfield apps unless you understand the trade-offs. Production-grade Vue 3 stays on 3.5+ Virtual DOM rendering.

## Pourquoi Vapor Mode ?

Vue 3.6 introduit un compilateur alternatif qui **supprime le Virtual DOM** pour les composants où Vapor est activé. Le résultat compilé est proche du code Solid.js / Svelte : du JS impératif qui modifie directement le DOM via les **Alien Signals** (rendu fin-grained).

| Aspect | Virtual DOM (3.5 défaut) | Vapor Mode (3.6 beta) |
|--------|--------------------------|----------------------|
| Re-render granularity | Composant | Effet réactif (signal) |
| Bundle size component | ~3-4 KB | ~1 KB (pas de VDOM runtime) |
| Hot path memory | Diff tree complet | Mutations directes |
| Compatibilité écosystème | 100 % | Subset (cf. limitations) |

Bénéfices typiques :
- **40-60 % memory reduction** sur applications avec milliers de composants (dashboards, tableurs).
- **Bundle initial -20 à -30 %** quand 100 % Vapor (mais runtime mixte garde le VDOM).
- **First Input Delay** réduit (moins de JS à parser/exécuter au boot).

## Activation

Vapor est **opt-in par composant** via une option SFC :

```vue
<script setup lang="ts" vapor>
import {ref} from 'vue';

const count = ref(0);
const increment = () => count.value++;
</script>

<template>
  <button @click="increment">Count: {{ count }}</button>
</template>
```

Ou au niveau application pour activer Vapor par défaut sur tous les composants :

```ts
// main.ts
import {createVaporApp} from 'vue/vapor';
import App from './App.vue';

createVaporApp(App).mount('#app');
```

**Mode mixte** (Vapor + VDOM) : possible via `<VaporInterop>`. Coût : double runtime → ne jamais l'utiliser en prod permanente, seulement pour migration.

## Alien Signals : modèle de réactivité

Vapor repose sur les **Alien Signals**, une refonte du système réactif Vue.

- Le tracking est **push-based** (vs pull en Vue 3.5).
- Les effets s'exécutent en **batch micro-task** par défaut (cohérent avec React 19).
- API publique inchangée : `ref()`, `reactive()`, `computed()` continuent à fonctionner.

```ts
// Identique en Virtual DOM ou Vapor — seul le compilateur change.
import {ref, computed} from 'vue';

const items = ref<Item[]>([]);
const total = computed(() => items.value.reduce((n, i) => n + i.qty, 0));
```

## Limitations beta (mai 2026)

- **Pas de transitions** Vue (`<Transition>`, `<TransitionGroup>`) dans un composant Vapor → utiliser CSS pur ou GSAP.
- **Pas de `<KeepAlive>`** : le runtime Vapor ne sait pas mettre en cache un sous-tree (suivi WG-1432).
- **DevTools** : support partiel — l'inspecteur de composants fonctionne, l'inspecteur de réactivité (timeline) pas encore.
- **SSR** : pas encore stable. Vue 3.6 Vapor ciblé SPA d'abord, SSR prévu Vue 3.7.
- **Bibliothèques tierces** : Pinia 3 et Vue Router 5 supportent Vapor. **Pinia 2 et Vue Router 4 ne supportent pas Vapor** → migration préalable obligatoire.

## Quand utiliser Vapor

| Cas d'usage | Vapor pertinent ? |
|------------|-------------------|
| SPA performance-critique (dashboards temps réel, éditeurs) | ✅ Mesurer en POC |
| App SSR / SEO | ❌ Attendre 3.7 |
| Composants animés lourds (transitions Vue) | ❌ Limitations |
| Mobile WebView (poids JS critique) | ✅ Si bibliothèques compatibles |
| App enterprise existante 3.5 | ❌ Ne pas migrer en bloc, attendre Vapor 1.0 stable (Vue 3.7) |

## Migration progressive (recommandée)

1. **Upgrade Vue 3.5 → 3.6** : pas de breaking change si vous n'activez pas Vapor.
2. **Identifier les composants "hot"** via Vue DevTools > Performance. Cibler ceux avec re-renders fréquents.
3. **Activer `<script setup vapor>`** un composant à la fois.
4. **Tests de non-régression** : Vitest 4 + Vue Test Utils 3 supportent Vapor.
5. **Mesurer** : Lighthouse + Memory profiler avant/après. Sans gain mesurable, repasser en VDOM.

## Checklist Vapor production-ready

- [ ] Vue 3.6+ installé, Pinia 3+, Vue Router 5+
- [ ] Composant cible identifié via profiling (pas par "bonne pratique")
- [ ] Pas de `<Transition>` / `<KeepAlive>` dans l'arbre Vapor
- [ ] Tests Vitest 4 verts avec Vapor compiler
- [ ] Lighthouse / Memory profiler mesurés avant/après
- [ ] Pas de mode mixte permanent (`<VaporInterop>` uniquement transitoire)
- [ ] Veille suivie sur RFC Vue 3.7 SSR Vapor (avant migration SSR)

## Ressources

- [Vue 3.6 release plan + Vapor RFC](https://github.com/vuejs/rfcs)
- [Alien Signals — design doc](https://github.com/stackblitz/alien-signals)
- [Vapor Mode playground](https://play.vuejs.org/) (activer `<script setup vapor>`)
- [Pinia 3 migration](https://pinia.vuejs.org/migration/) (prérequis Vapor)

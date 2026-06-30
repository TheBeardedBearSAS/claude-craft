# Vue.js 3.5+ / 3.6 beta Vapor - Quick Reference

## Versions Requises (2026)

| Composant | Version | Notes |
|-----------|---------|-------|
| Vue.js | 3.5.x (stable) / 3.6.x beta | Vapor Mode : feature-complete, instable (SSR dispo en 3.7) |
| Pinia | 3.x | Requis pour Vapor Mode |
| Vue Router | 5.x | File-based routing via `@vue-router/auto` |
| Vite | 8.x | Rolldown bundler par défaut (3-5× plus rapide) |
| TypeScript | 5.x+ | Strict mode obligatoire |

**Source :** [Vue 3.6 Vapor blog](https://blog.vuejs.org/) | [Vite 8](https://vite.dev/blog/)

## Architecture Composition API

```
src/
├── assets/               # Static assets
├── components/           # Composants partagés (base/, layout/, ui/)
├── composables/          # Fonctions réutilisables (use*)
├── modules/              # Feature modules (domain-driven)
│   └── [feature]/
│       ├── components/
│       ├── composables/
│       ├── stores/
│       ├── views/
│       └── types/
├── router/               # Vue Router config
├── stores/               # Stores Pinia globaux
├── services/             # Services API
├── types/                # Types TypeScript globaux
├── App.vue
└── main.ts
```

## Points clés 2026

### Composition API + `<script setup>` (obligatoire)
```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUsersStore } from '@/modules/users/stores/users.store';

const store = useUsersStore();
const search = ref('');
const filtered = computed(() => store.users.filter(u => u.name.includes(search.value)));
</script>
```

### Pinia 3 (store composition style)
```typescript
// stores/users.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([]);
  const loading = ref(false);

  const activeUsers = computed(() => users.value.filter(u => u.active));

  async function fetchUsers() {
    loading.value = true;
    users.value = await api.getUsers();
    loading.value = false;
  }

  return { users, loading, activeUsers, fetchUsers };
});
```

> **Pinia 2 → 3 :** l'API `defineStore` reste compatible ; la migration principale concerne la suppression des `mapState`/`mapActions` dans les Options API. Préférer le setup store style (ci-dessus) en Pinia 3.

### Vite 8 — Rolldown
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [Vue()],
  // Vite 8 / Rolldown (default): object form of manualChunks removed — use codeSplitting.groups
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vue-vendor', test: /node_modules\/(vue|pinia|vue-router)/ },
          ],
        },
      },
    },
  },
});
```

> **Vite 8 / Rolldown (défaut) :** la forme objet de `manualChunks` est **supprimée** (non supportée). Utiliser `build.rolldownOptions.output.codeSplitting.groups`.
> **Vite 7 / Rolldown désactivé (legacy) :**
> ```ts
> build: { rollupOptions: { output: { manualChunks: { 'vue-vendor': ['vue', 'vue-router', 'pinia'] } } } }
> // Only if Rolldown is explicitly disabled
> ```

### Vue Router 5 — File-Based Routing
```typescript
// vite.config.ts — file-based routing (optionnel)
import VueRouter from 'unplugin-vue-router/vite';

export default defineConfig({
  plugins: [
    VueRouter({ routesFolder: 'src/pages' }), // avant Vue()
    Vue(),
  ],
});
```
Structure `src/pages/` → routes auto-générées avec types précis. Pour un router manuel classique, configurer dans `src/router/index.ts` (voir `architecture.md`).

### Alien Signals (Vue 3.5+)
Vue 3.5 migre en interne vers **Alien Signals** pour la réactivité : performances +2× sur les graphes larges. Aucun changement d'API côté utilisateur.

### Vapor Mode (Vue 3.6 beta — ne pas utiliser en prod)
- Feature-complete mais **instable** — SSR prévu en Vue 3.7
- Nécessite Pinia 3 et `@vue-router/auto`
- Voir `vapor-mode.md` pour les détails et caveats

## Checklist Rapide

- [ ] Vue 3.5.x stable (3.6 réservé expérimental)
- [ ] Composition API + `<script setup>` uniquement
- [ ] Pinia 3 setup store style
- [ ] Vue Router 5 (file-based ou manuel selon besoin)
- [ ] Vite 8 + Rolldown (`manualChunks` supprimé → migrer vers `rolldownOptions.output.codeSplitting.groups`)
- [ ] TypeScript strict mode
- [ ] Tests >= 80% coverage (Vitest)
- [ ] ESLint + `@vue/eslint-plugin-vue`

## Documentation Complète

- `architecture.md` — Structure modulaire, patterns composables, routing
- `coding-standards.md` — TypeScript, conventions, Composition API rules
- `tooling.md` — Vite 8, Vue Router 5, Pinia 3, migrations
- `quality-tools.md` — ESLint, Vitest, audit qualité
- `testing.md` — Vitest, Vue Test Utils, stratégies TDD
- `security.md` — XSS, CSRF, validation, CSP
- `vapor-mode.md` — Vue 3.6 Vapor (expérimental)
- `project-context.md` — Template de contexte projet

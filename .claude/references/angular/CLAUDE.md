# Angular 22 - Quick Reference

**Version documentée :** Angular 22 (stable, sorti le 03/06/2026)

## Versions Requises (2026)

| Composant | Version | Notes |
|-----------|---------|-------|
| Angular | 22 | Stable depuis 03/06/2026 |
| TypeScript | **6.x** | TS 5.x non supporté depuis Angular 22 |
| Node.js | **22.x ou 24.x** | Node 20 supprimé depuis Angular 22 |
| Angular CLI | 22.x | `npm install -g @angular/cli` |

**Source :** [Angular version compatibility](https://angular.dev/reference/versions) | [Angular 22 release](https://blog.ninja-squad.com/2026/06/03/what-is-new-angular-22.0)

## Architecture Domain-Driven

```
src/app/
├── core/           # Singleton services, guards, interceptors, modèles
├── shared/         # Composants, pipes, directives réutilisables
├── features/       # Modules métier (feature-based, standalone)
│   └── [feature]/
│       ├── components/
│       ├── services/
│       ├── store/
│       └── [feature].routes.ts
├── layout/         # Shell, header, sidebar, footer
├── app.component.ts
├── app.config.ts   # Bootstrapping + providers
└── app.routes.ts   # Root routing
```

## Points clés Angular 22

### Standalone Components (défaut)
Toujours utiliser `standalone: true` — NgModules réservés aux libs legacy.

### Signals — gestion d'état par défaut
`signal()`, `computed()`, `effect()` — alternative moderne aux BehaviorSubject.

### Zoneless par défaut
```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(), // ← Zoneless (Angular 22)
    provideRouter(routes),
    provideHttpClient(),
  ]
};
```
> `provideZoneChangeDetection()` reste disponible pour migrer progressivement.

### Signal Forms (stable Angular 22)
Remplace FormGroup/FormControl par une API signal-based pour les formulaires réactifs :
```typescript
import { FormField, FormGroup } from '@angular/forms';

const form = new FormGroup({
  email: new FormField(''),
  password: new FormField(''),
});

// Accès signal
console.log(form.value()); // { email: '', password: '' }
```
Voir `coding-standards.md` pour les exemples de migration Reactive Forms → Signal Forms.

### httpResource — chargement HTTP déclaratif
```typescript
import { httpResource } from '@angular/core';

@Component({ ... })
export class UsersComponent {
  // Chargement déclaratif avec signal — remplace HttpClient + subscribe
  usersResource = httpResource<User[]>('/api/users');

  users = this.usersResource.value;       // Signal<User[] | undefined>
  loading = this.usersResource.isLoading; // Signal<boolean>
  error = this.usersResource.error;       // Signal<unknown>
}
```

### @defer — Deferrable Views (lazy subtrees)
```typescript
@Component({
  template: `
    @defer (on viewport) {
      <app-heavy-chart [data]="data()" />
    } @placeholder {
      <div class="skeleton" />
    } @loading (minimum 300ms) {
      <app-spinner />
    }
  `
})
```

### ChangeDetection.OnPush par défaut
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush // ← obligatoire
})
```

## Checklist Rapide

- [ ] Angular 22, TypeScript 6, Node 22/24
- [ ] Standalone components (`standalone: true`)
- [ ] Zoneless bootstrapping (`provideExperimentalZonelessChangeDetection`)
- [ ] Signals pour l'état réactif (`signal`, `computed`, `effect`)
- [ ] Signal Forms pour les formulaires (pas FormGroup classique)
- [ ] `httpResource()` pour les chargements HTTP déclaratifs
- [ ] `@defer` pour le lazy loading des sous-arbres
- [ ] `ChangeDetectionStrategy.OnPush` sur tous les composants
- [ ] `inject()` au lieu du constructeur injection
- [ ] Tests >= 80% coverage

## Documentation Complète

- `architecture.md` — Principes DDD, Smart/Dumb, lazy routing, DI
- `coding-standards.md` — TypeScript strict, ESLint, Signal Forms, conventions
- `tooling.md` — Angular CLI, prérequis système, scripts
- `quality-tools.md` — TypeScript strict, ESLint, Vitest, audit
- `testing.md` — TDD, Vitest, TestBed, stratégies
- `security.md` — XSS, CSRF, CSP, auth
- `project-context.md` — Template de contexte projet

# Angular Architecture - Principles and Organization

**Version documentée :** Angular 22 (stable, sorti le 03/06/2026)

## Fundamental Architectural Principles

### 1. Standalone Components (Angular 14+, par défaut Angular 17+)

Angular utilise par défaut les **standalone components** (défaut depuis Angular 19 : `standalone: true` est redondant et ne doit plus être écrit), éliminant le besoin de NgModules dans la plupart des cas.

```typescript
// ✅ Modern - Standalone Component
@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, RouterModule, UserAvatarComponent],
  template: `...`
})
export class UserProfileComponent {}

// ❌ Legacy - NgModule-based (avoid for new projects)
@NgModule({
  declarations: [UserProfileComponent],
  imports: [CommonModule]
})
export class UserModule {}
```

### 2. Signals for Reactive State (Angular 16+, mature en v20+)

Utilisez **Signals** comme primitive de gestion d'état principale (alternative moderne aux BehaviorSubject pour l'état synchrone) :

```typescript
import { signal, computed, effect } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <p>Count: {{ count() }}</p>
    <p>Double: {{ doubleCount() }}</p>
    <button (click)="increment()">+</button>
  `
})
export class CounterComponent {
  // Signal - reactive state
  count = signal(0);

  // Computed - derived state
  doubleCount = computed(() => this.count() * 2);

  constructor() {
    // Effect - side effects on signal changes
    effect(() => {
      console.log('Count changed:', this.count());
    });
  }

  increment() {
    this.count.update(c => c + 1);
  }
}
```

### 3. Separation of Concerns

Each part of the code should have a single, well-defined responsibility:

- **Components**: Display and user interaction
- **Services**: Business logic and data management
- **Guards**: Route protection
- **Interceptors**: HTTP request/response handling
- **Pipes**: Data transformation for display
- **Directives**: DOM manipulation

## Domain-Driven Folder Structure

### Recommended Organization

```
src/
├── app/
│   ├── core/                         # Singleton services, guards, interceptors
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── api.service.ts
│   │   │   └── storage.service.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── role.guard.ts
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts
│   │   │   ├── error.interceptor.ts
│   │   │   └── loading.interceptor.ts
│   │   └── models/
│   │       ├── user.model.ts
│   │       └── api-response.model.ts
│   │
│   ├── shared/                       # Reusable components, pipes, directives
│   │   ├── components/
│   │   │   ├── button/
│   │   │   │   ├── button.component.ts
│   │   │   │   ├── button.component.html
│   │   │   │   ├── button.component.scss
│   │   │   │   └── button.component.spec.ts
│   │   │   ├── modal/
│   │   │   ├── data-table/
│   │   │   └── form-field/
│   │   ├── directives/
│   │   │   ├── highlight.directive.ts
│   │   │   └── click-outside.directive.ts
│   │   ├── pipes/
│   │   │   ├── date-format.pipe.ts
│   │   │   ├── currency.pipe.ts
│   │   │   └── truncate.pipe.ts
│   │   └── validators/
│   │       ├── email.validator.ts
│   │       └── password.validator.ts
│   │
│   ├── features/                     # Business features (domain-driven)
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.component.ts
│   │   │   │   │   ├── login.component.html
│   │   │   │   │   └── login.component.spec.ts
│   │   │   │   ├── register/
│   │   │   │   └── forgot-password/
│   │   │   ├── services/
│   │   │   │   └── auth-api.service.ts
│   │   │   ├── store/               # Feature state (NgRx or Signals)
│   │   │   │   ├── auth.store.ts
│   │   │   │   └── auth.selectors.ts
│   │   │   └── auth.routes.ts
│   │   │
│   │   ├── users/
│   │   │   ├── components/
│   │   │   │   ├── user-list/
│   │   │   │   ├── user-detail/
│   │   │   │   └── user-form/
│   │   │   ├── services/
│   │   │   │   └── users-api.service.ts
│   │   │   ├── store/
│   │   │   │   └── users.store.ts
│   │   │   └── users.routes.ts
│   │   │
│   │   ├── dashboard/
│   │   └── settings/
│   │
│   ├── layout/                       # Layout components
│   │   ├── header/
│   │   │   ├── header.component.ts
│   │   │   └── header.component.html
│   │   ├── sidebar/
│   │   ├── footer/
│   │   └── shell/
│   │       └── shell.component.ts
│   │
│   ├── app.component.ts
│   ├── app.config.ts                 # Application configuration
│   └── app.routes.ts                 # Root routing
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── i18n/
│
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
│
└── styles/
    ├── _variables.scss
    ├── _mixins.scss
    ├── _reset.scss
    └── styles.scss
```

## Smart/Dumb Components Pattern

### Container (Smart) Components

Handle logic, services, and state management:

```typescript
// features/users/components/user-list/user-list.container.ts
@Component({
  selector: 'app-user-list-container',
  imports: [UserListComponent, AsyncPipe],
  template: `
    <app-user-list
      [users]="users()"
      [loading]="loading()"
      (userSelected)="onUserSelect($event)"
      (pageChange)="onPageChange($event)"
    />
  `
})
export class UserListContainerComponent {
  private usersService = inject(UsersService);

  users = this.usersService.users;
  loading = this.usersService.loading;

  onUserSelect(userId: string) {
    this.usersService.selectUser(userId);
  }

  onPageChange(page: number) {
    this.usersService.loadPage(page);
  }
}
```

### Presentational (Dumb) Components

Pure display components, receive data via inputs:

```typescript
// features/users/components/user-list/user-list.component.ts
@Component({
  selector: 'app-user-list',
  imports: [CommonModule, UserCardComponent],
  template: `
    @if (loading()) {
      <app-skeleton />
    } @else {
      <div class="user-grid">
        @for (user of users(); track user.id) {
          <app-user-card
            [user]="user"
            (click)="userSelected.emit(user.id)"
          />
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent {
  readonly users = input.required<User[]>();
  readonly loading = input(false);

  readonly userSelected = output<string>();
  readonly pageChange = output<number>();
}
```

## State Management with Signals

### Signal-based Store Pattern

```typescript
// features/users/store/users.store.ts
import { Injectable, signal, computed } from '@angular/core';

interface UsersState {
  users: User[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class UsersStore {
  // Private state
  private state = signal<UsersState>({
    users: [],
    selectedId: null,
    loading: false,
    error: null
  });

  // Public selectors (computed signals)
  users = computed(() => this.state().users);
  selectedId = computed(() => this.state().selectedId);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);

  selectedUser = computed(() =>
    this.state().users.find(u => u.id === this.state().selectedId)
  );

  // Actions
  setUsers(users: User[]) {
    this.state.update(s => ({ ...s, users, loading: false }));
  }

  selectUser(id: string) {
    this.state.update(s => ({ ...s, selectedId: id }));
  }

  setLoading(loading: boolean) {
    this.state.update(s => ({ ...s, loading }));
  }

  setError(error: string | null) {
    this.state.update(s => ({ ...s, error, loading: false }));
  }
}
```

### NgRx for Complex State (Optional)

For large applications with complex state requirements:

```typescript
// features/users/store/users.actions.ts
import { createActionGroup, props, emptyProps } from '@ngrx/store';

export const UsersActions = createActionGroup({
  source: 'Users',
  events: {
    'Load Users': emptyProps(),
    'Load Users Success': props<{ users: User[] }>(),
    'Load Users Failure': props<{ error: string }>(),
    'Select User': props<{ userId: string }>(),
  }
});
```

## Routing Best Practices

### Lazy Loading with Standalone Routes

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component')
      .then(m => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent),
        canActivate: [authGuard]
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes')
          .then(m => m.USERS_ROUTES),
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
      .then(m => m.AUTH_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
```

## Dependency Injection Best Practices

### inject() Function (Modern)

```typescript
// ✅ Modern - inject() function
@Component({...})
export class UserListComponent {
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
}

// ❌ Legacy - Constructor injection (still valid but verbose)
@Component({...})
export class UserListComponent {
  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
}
```

### Providing Services

```typescript
// Root-level (singleton)
@Injectable({ providedIn: 'root' })
export class AuthService {}

// Component-level (new instance per component)
@Component({
  providers: [LocalStateService]
})
export class MyComponent {}

// Route-level
export const routes: Routes = [
  {
    path: 'feature',
    providers: [FeatureService],
    loadComponent: () => import('./feature.component')
  }
];
```

## Architecture Best Practices

### 1. Change Detection Strategy (OnPush par défaut depuis Angular 22.0.0)

Depuis Angular 22.0.0 (breaking change), **les composants dont `changeDetection` est indéfini sont `OnPush` par défaut**. Déclarer `changeDetection: ChangeDetectionStrategy.Eager` pour conserver l'ancien comportement ; la migration `ng update` `change-detection-eager` (22.0.0) ajoute `Eager` à tous les composants existants.

```typescript
// Angular 22 — OnPush implicite (ne pas déclarer changeDetection)
@Component({
  selector: 'app-my-component',
  template: `...`
  // changeDetection omis → OnPush par défaut
})
export class MyComponent {}

// Opt-out explicite si l'ancien comportement est requis (rare)
@Component({
  selector: 'app-legacy',
  template: `...`,
  changeDetection: ChangeDetectionStrategy.Eager
})
export class LegacyComponent {}
```

**Impact migration :** les composants existants sans `changeDetection` passent à OnPush lors de la montée en 22.0.0 ; la migration `change-detection-eager` insère `ChangeDetectionStrategy.Eager` pour préserver leur comportement, à retirer progressivement.

Source : https://github.com/angular/angular/blob/main/CHANGELOG.md (22.0.0, core)

### 2. Typed Reactive Forms (applications existantes — préférer Signal Forms pour le nouveau code)

```typescript
interface UserForm {
  name: FormControl<string>;
  email: FormControl<string>;
  age: FormControl<number | null>;
}

const form = new FormGroup<UserForm>({
  name: new FormControl('', { nonNullable: true }),
  email: new FormControl('', { nonNullable: true }),
  age: new FormControl(null)
});
```

### 3. Control Flow (@if, @for, @switch)

Use new control flow syntax (Angular 17+):

```html
<!-- ✅ Modern -->
@if (loading) {
  <app-spinner />
} @else if (error) {
  <app-error [message]="error" />
} @else {
  @for (item of items; track item.id) {
    <app-item [data]="item" />
  } @empty {
    <p>No items found</p>
  }
}

<!-- ❌ Legacy -->
<app-spinner *ngIf="loading"></app-spinner>
<ng-container *ngIf="!loading">
  <app-item *ngFor="let item of items; trackBy: trackById" [data]="item"></app-item>
</ng-container>
```

## Angular 22 — Nouvelles Fonctionnalités

### Zoneless Change Detection (par défaut depuis Angular v21)

Zoneless est le défaut depuis Angular v21 (donc en v22), ce qui élimine la dépendance à Zone.js (~33 KB économisés). Les gains de performance varient selon l'application (l'ancien chiffre « 30-40 % » provenait d'une source de 2024, non reproduite par la doc officielle : à mesurer plutôt qu'à supposer). Source : https://angular.dev/guide/zoneless

```typescript
// app.config.ts (Angular 22) — rien à ajouter : zoneless est actif par défaut.
// provideZonelessChangeDetection() n'est requis qu'en Angular v20.
// Vérifier qu'aucun provideZoneChangeDetection() ne réactive Zone.js.
export const appConfig = {
  providers: [provideRouter(routes)]
};
```

**Migration requise :** tous les états locaux doivent utiliser Signals. Les event bindings continuent de fonctionner automatiquement.

### Resource API (stable v20+)

La **Resource API** simplifie le chargement de données avec états automatiques (loading, error, data).

```typescript
import { httpResource } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({...})
export class UserListComponent {
  private http = inject(HttpClient);

  // Déclaratif : httpResource gère automatiquement loading, error, data
  users = httpResource({
    url: '/api/users',
    loader: () => this.http.get<User[]>('/api/users')
  });

  // Accès dans le template
  // @if (users.isLoading()) { <spinner /> }
  // @if (users.error()) { <error /> }
  // @for (user of users.value(); track user.id) { ... }
}
```

**Streaming resources** (WebSockets, SSE) : `resource()` avec abortable reads pour les flux temps réel.

Source : https://blog.angular.dev/announcing-angular-v20-b5c9c06cf301

### Signal Forms (stable v22)

Alternative aux Reactive Forms avec APIs signales natives. Disponible dans `@angular/forms/signals`.

```typescript
import { Component, signal, computed } from '@angular/core';
import { form, FormField, required, email } from '@angular/forms/signals';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormField],
  template: `
    <form novalidate (submit)="onSubmit($event)">
      <input type="email" [formField]="loginForm.email" />
      <input type="password" [formField]="loginForm.password" />
      <button type="submit">Connexion</button>
    </form>
  `
})
export class LoginComponent {
  loginModel = signal<LoginData>({ email: '', password: '' });

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Email requis' });
    email(schemaPath.email, { message: 'Email invalide' });
    required(schemaPath.password, { message: 'Mot de passe requis' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    const credentials = this.loginModel();
    // traitement...
  }
}
```

**API Signal Forms v22 :** `form(model, schemaFn)` + directive `FormField` (`[formField]`) + validators (`required`, `email`, `debounce`, etc.) depuis `@angular/forms/signals`. Interopérabilité avec les Reactive Forms existantes via `SignalFormControl` bridge. Les API Signal Forms sont passées en API publique en 22.0.0.

**Soumission :** la directive `FormRoot` (`<form [formRoot]="loginForm">`, depuis `@angular/forms/signals`) pose `novalidate`, empêche la navigation native et appelle `submit()` ; l'action se configure via l'option `submission` de `form()` (`action`, `onInvalid`, `ignoreValidators`) ou via `await submit(form, async (field) => ...)` (retourne `Promise<boolean>`). Source : https://angular.dev/guide/forms/signals/form-submission

Source : https://angular.dev/essentials/signal-forms

### afterNextRender() stable (v20)

Hook de cycle de vie pour le code browser-only (meilleure intégration SSR que `afterRender()` conditionnel).

```typescript
import { afterNextRender } from '@angular/core';

constructor() {
  afterNextRender(() => {
    // Code exécuté uniquement côté client après le premier rendu
    console.log('Document width:', document.body.clientWidth);
  });
}
```

### PendingTasks API (v20)

Gestion du state de chargement global. SSR amélioration : bloque l'hydration pendant les tâches critiques.

```typescript
import { inject } from '@angular/core';
import { PendingTasks } from '@angular/core';

private pendingTasks = inject(PendingTasks);

async loadData() {
  const taskId = this.pendingTasks.add();
  try {
    await this.fetchData();
  } finally {
    this.pendingTasks.remove(taskId);
  }
}
```

## Conclusion

Angular architecture priorities for 2026 (v22 stable) :

1. **Standalone Components**: Par défaut pour tous les nouveaux composants
2. **Signals**: Primitive réactive principale (état synchrone)
3. **Zoneless (par défaut depuis v21)**: aucun provider requis en v22 (`provideZonelessChangeDetection()` seulement en v20) — gains de performance à mesurer
4. **httpResource()**: Chargement déclaratif avec états automatiques (stable v20+)
5. **OnPush par défaut (22.0.0)**: Stratégie de change detection par défaut de tout composant sans `changeDetection` — opt-out via `ChangeDetectionStrategy.Eager`
6. **HttpClient Fetch par défaut (v22)**: `HttpClient` utilise désormais l'API `fetch` native au lieu de `XMLHttpRequest` — meilleure intégration SSR et streaming
7. **Signal Forms (stable v22)**: `form(model, schemaFn)` depuis `@angular/forms/signals`
7. **Domain-Driven Structure**: Organisation par feature
8. **Smart/Dumb Pattern**: Séparation claire des responsabilités
9. **Lazy Loading**: Routes et composants
10. **Modern Control Flow**: @if, @for, @switch

**Angular 22 nouveautés clés :** Signal Forms stables (`@angular/forms/signals`), **OnPush par défaut** (`Eager` pour l'opt-out), **HttpClient utilise Fetch par défaut** (plus XHR), TypeScript 6 requis, Resource API stable, Node.js 22.x ou 24.x requis (Node 20 supprimé).

### Breaking changes Angular 22.0.0

Source : https://github.com/angular/angular/blob/main/CHANGELOG.md (section 22.0.0).

| Domaine | Changement | Action |
|---------|------------|--------|
| core | `changeDetection` indéfini = `OnPush` | `ChangeDetectionStrategy.Eager` pour l'ancien comportement (migration `ng update`) |
| core | Retrait de `ComponentFactoryResolver`, `ComponentFactory`, `createNgModuleRef`, `ChangeDetectorRef.checkNoChanges` | Passer la classe du composant à `ViewContainerRef.createComponent` / `createComponent` ; `createNgModule` ; `fixture.detectChanges()` en test |
| core | TypeScript < 6.0 non supporté | Monter TypeScript en 6.x |
| router | `paramsInheritanceStrategy` vaut `'always'` | Définir `'emptyOnly'` pour restaurer l'ancien comportement |
| router | `provideRoutes()` supprimé | `provideRouter()` ou token multi `ROUTES` |
| router | `currentSnapshot` requis dans `CanMatchFn` / `CanMatch.canMatch` | Migration fournie ; ajouter le 3e argument aux classes |
| forms | `min` / `max` refusent les chaînes | Lier des nombres ou `null` |
| http | `FetchBackend` par défaut ; progression d'upload | `provideHttpClient(withXhr())` pour conserver les rapports de progression d'upload (schematic fourni) ; `withFetch` déprécié ; `reportProgress` déprécié (`reportUploadProgress` / `reportDownloadProgress`) |
| platform-browser | Hammer.js supprimé ; hydratation incrémentale par défaut | Implémentation maison pour les gestes |
| compiler | Diagnostics `nullishCoalescingNotNullable` / `optionalChainNotNullable` actifs sur les projets existants ; attributs `data-*` ne lient plus d'inputs/outputs ; liaisons input/output dupliquées = erreur ; `in` interdit dans les expressions | Désactiver temporairement les diagnostics dans `tsconfig` si besoin |
| compiler-cli | Éléments avec plusieurs sélecteurs correspondants = erreur de compilation (NG8023) | Désambiguïser les sélecteurs |

### Nouveautés Angular 22.2

- `ErrorBoundary` : API programmatiques dans core (blocs `@boundary` pris en charge par le language service).
- Router : `containsTree` en API publique, `throw new RedirectCommand(...)` déclenche une redirection, ressources du router exposées.
- Signal Forms : champs cachés permanents autorisés.
- Compilateur : accès des templates aux membres privés ; option `strictUnclaimedEventNames` pour détecter les outputs mal orthographiés.

Source : https://github.com/angular/angular/blob/main/CHANGELOG.md (section 22.2.0)

### @Service decorator (v22)

Angular 22 introduit le décorateur `@Service` comme alias ergonomique de `@Injectable({ providedIn: 'root' })` :

```typescript
import { Service } from '@angular/core';

// Angular 22 — équivalent à @Injectable({ providedIn: 'root' })
@Service()
export class UserService {
  getUsers() { /* ... */ }
}
```

**Compatibilité :** `@Injectable` continue de fonctionner. `@Service` est la forme courte recommandée pour les services root-scoped.

### injectAsync() (v22)

`injectAsync()` (`@angular/core`, API publique depuis 22.0) retourne une fonction qui résout le service à la demande : `injectAsync<T>(loader: () => Promise<ProviderToken<T>>, options?: { prefetch?: PrefetchTrigger }): () => Promise<T>`. Il doit être appelé dans un contexte d'injection, et le service chargé doit être auto-fourni (`@Injectable({providedIn: 'root'})` ou `@Service()`) :

```typescript
import { Component, injectAsync, onIdle } from '@angular/core';

@Component({ ... })
export class DashboardComponent {
  private analytics = injectAsync(() => import('./analytics.service'), { prefetch: onIdle });

  async onClick() {
    (await this.analytics()).track('click');
  }
}
```

**Usage :** charger paresseusement un service lourd (chunk séparé) sans le payer au démarrage. Source : https://angular.dev/guide/di/lazy-loading-services

### Angular Aria (v22)

Le package `@angular/aria` existe sur npm (latest 22.2.6) ; le tag « developer preview » a été retiré dans 22.0.0 (CHANGELOG d'`angular/components`). Il fournit des directives headless accessibles par sous-entrée (`@angular/aria/listbox`, `/combobox`, `/menu`, `/tabs`, `/tree`, `/toolbar`, `/accordion`, `/grid`) ; sélecteurs `ngListbox`, `ngOption`, etc. (source : https://angular.dev/guide/aria/listbox). `cdkTrapFocus`, `cdkAriaLive` et `cdkVisuallyHidden` restent dans `@angular/cdk/a11y`.

```typescript
import { Listbox, Option } from '@angular/aria/listbox';

@Component({
  imports: [Listbox, Option],
  template: `
    <div ngListbox aria-label="Options">
      @for (o of options; track o) { <div ngOption [value]="o">{{ o }}</div> }
    </div>
  `
})
export class AccessibleListComponent {
  options = ['Option 1', 'Option 2'];
}
```

**SSRF (v22) :** le CHANGELOG 22.0.0 liste des correctifs SSRF dans `platform-server` (« prevent SSRF bypasses via backslash URLs in HttpClient », « secure location and document initialization against SSRF and path hijack ») ; la mention précédente d'un non-forward des cookies par `withClientHydration()` n'est confirmée par aucune source officielle et a été retirée. `ServerXhr` (`@angular/platform-server`) est déprécié ; JSONP est déprécié depuis 22.1.

**Source :** https://blog.ninja-squad.com/2026/06/03/what-is-new-angular-22.0

**Golden rule**: Les composants doivent être petits, focalisés et faciles à tester.

**Sources :** 
- Angular v20 : https://blog.angular.dev/announcing-angular-v20-b5c9c06cf301
- Angular v22 : https://blog.ninja-squad.com/2026/06/03/what-is-new-angular-22.0
- Signal Forms : https://angular.dev/essentials/signal-forms
- Zoneless : https://blog.angular.dev/zoneless-change-detection-f1622c3c5c51

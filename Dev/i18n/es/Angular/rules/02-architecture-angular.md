# Angular Architecture - Principles and Organization

## Fundamental Architectural Principles

### 1. Standalone Components (Angular 14+)

Angular now defaults to **standalone components**, eliminating the need for NgModules in most cases.

```typescript
// ✅ Modern - Standalone Component
@Component({
  selector: 'app-user-profile',
  standalone: true,
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

### 2. Signals for Reactive State (Angular 16+)

Use **Signals** as the primary state management primitive:

```typescript
import { signal, computed, effect } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
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
  standalone: true,
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
  standalone: true,
  imports: [CommonModule, UserCardComponent],
  template: `
    @if (loading) {
      <app-skeleton />
    } @else {
      <div class="user-grid">
        @for (user of users; track user.id) {
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
  @Input({ required: true }) users!: User[];
  @Input() loading = false;

  @Output() userSelected = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();
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

### 1. Change Detection Strategy

Always use OnPush for performance:

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyComponent {}
```

### 2. Typed Forms

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

## Conclusion

Angular architecture priorities for 2026:

1. **Standalone Components**: Default for all new components
2. **Signals**: Primary reactive primitive
3. **OnPush**: Default change detection strategy
4. **Domain-Driven Structure**: Organize by feature
5. **Smart/Dumb Pattern**: Clear separation of concerns
6. **Lazy Loading**: Routes and components
7. **Typed Forms**: Full type safety
8. **Modern Control Flow**: @if, @for, @switch

**Golden rule**: Components should be small, focused, and easy to test.

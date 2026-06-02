# Angular TypeScript Coding Standards

**Version documentée :** Angular 21 (latest stable, LTS) / Angular 22 (en RC)

## TypeScript Strict Mode

### tsconfig.json Configuration

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "declaration": false,
    "experimentalDecorators": true,
    "moduleResolution": "bundler",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "dom"],
    "useDefineForClassFields": false,
    "paths": {
      "@app/*": ["src/app/*"],
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"],
      "@env/*": ["src/environments/*"]
    }
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

## ESLint Configuration

### Installation

```bash
ng add @angular-eslint/schematics
npm install -D eslint-plugin-rxjs eslint-plugin-ngrx
```

### eslint.config.js (Flat Config)

```javascript
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import typescript from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import templateParser from '@angular-eslint/template-parser';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      '@angular-eslint': angular
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/prefer-readonly': 'error',

      // Angular
      '@angular-eslint/component-class-suffix': 'error',
      '@angular-eslint/directive-class-suffix': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-standalone': 'error'
    }
  },
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: templateParser
    },
    plugins: {
      '@angular-eslint/template': angularTemplate
    },
    rules: {
      '@angular-eslint/template/button-has-type': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/use-track-by-function': 'error',
      '@angular-eslint/template/prefer-control-flow': 'error'
    }
  }
];
```

## Naming Conventions

### 1. Files

```
✅ Components: kebab-case with suffix
- user-profile.component.ts
- user-profile.component.html
- user-profile.component.scss
- user-profile.component.spec.ts

✅ Services: kebab-case with suffix
- user.service.ts
- auth-api.service.ts

✅ Guards: kebab-case with suffix
- auth.guard.ts
- role.guard.ts

✅ Interceptors: kebab-case with suffix
- auth.interceptor.ts
- error.interceptor.ts

✅ Pipes: kebab-case with suffix
- date-format.pipe.ts
- currency.pipe.ts

✅ Directives: kebab-case with suffix
- highlight.directive.ts
- click-outside.directive.ts

✅ Models/Interfaces: kebab-case with suffix
- user.model.ts
- api-response.model.ts

✅ Store: kebab-case with suffix
- users.store.ts
- users.actions.ts
- users.selectors.ts
```

### 2. Classes and Decorators

```typescript
// ✅ Components: PascalCase + Component suffix
@Component({ selector: 'app-user-profile' })
export class UserProfileComponent {}

// ✅ Services: PascalCase + Service suffix
@Injectable({ providedIn: 'root' })
export class UserService {}

// ✅ Guards: camelCase function
export const authGuard: CanActivateFn = () => {};

// ✅ Interceptors: camelCase function
export const authInterceptor: HttpInterceptorFn = (req, next) => {};

// ✅ Pipes: PascalCase + Pipe suffix
@Pipe({ name: 'dateFormat', standalone: true })
export class DateFormatPipe implements PipeTransform {}

// ✅ Directives: PascalCase + Directive suffix
@Directive({ selector: '[appHighlight]', standalone: true })
export class HighlightDirective {}
```

### 3. Variables and Functions

```typescript
// ✅ Variables: camelCase
const userName = 'John';
const isAuthenticated = true;

// ✅ Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;

// ✅ Signals: camelCase (without $ suffix)
const count = signal(0);
const users = signal<User[]>([]);

// ✅ Observables: camelCase with $ suffix
const users$ = this.http.get<User[]>('/api/users');
const isLoading$ = new BehaviorSubject<boolean>(false);

// ✅ Functions: camelCase, action verb
function getUserById(id: string): User {}
function calculateTotal(items: Product[]): number {}

// ✅ Event handlers: 'on' prefix
onUserSelect(userId: string) {}
onFormSubmit(event: SubmitEvent) {}
```

### 4. Selectors and Component Selectors

```typescript
// ✅ Component selectors: app- prefix, kebab-case
@Component({
  selector: 'app-user-profile'
})

// ✅ Directive selectors: app prefix, camelCase
@Directive({
  selector: '[appHighlight]'
})

// ✅ Pipe names: camelCase
@Pipe({
  name: 'dateFormat'
})
```

## Component Patterns

### 1. Standalone Component Structure

```typescript
// user-profile.component.ts
import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ButtonComponent } from '@shared/components/button/button.component';
import { UserService } from '@core/services/user.service';

import type { User } from '@core/models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent {
  // 1. Dependency injection
  private readonly userService = inject(UserService);

  // 2. Inputs (signals preferred)
  @Input({ required: true }) user!: User;
  @Input() showActions = true;

  // 3. Outputs
  @Output() userUpdated = new EventEmitter<User>();

  // 4. Internal state (signals)
  protected readonly isEditing = signal(false);

  // 5. Computed values
  protected readonly fullName = computed(() =>
    `${this.user.firstName} ${this.user.lastName}`
  );

  // 6. Lifecycle hooks
  ngOnInit(): void {
    // Initialization logic
  }

  // 7. Public methods (event handlers)
  onEdit(): void {
    this.isEditing.set(true);
  }

  onSave(): void {
    this.userService.updateUser(this.user).subscribe({
      next: (updated) => {
        this.userUpdated.emit(updated);
        this.isEditing.set(false);
      }
    });
  }
}
```

### 2. Signal Inputs (Angular 17.1+)

```typescript
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-user-card',
  standalone: true,
  template: `
    <div class="card">
      <h3>{{ user().name }}</h3>
      @if (showEmail()) {
        <p>{{ user().email }}</p>
      }
      <button (click)="selected.emit(user().id)">Select</button>
    </div>
  `
})
export class UserCardComponent {
  // Required input
  user = input.required<User>();

  // Optional input with default
  showEmail = input(true);

  // Output
  selected = output<string>();
}
```

### 3. Inject Function Pattern

```typescript
// ✅ Modern - inject() function
@Component({...})
export class MyComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Use constructor only for initialization logic
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        // Handle params
      });
  }
}
```

## Service Patterns

### 1. API Service Structure

```typescript
// users-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import type { User, CreateUserDto, UpdateUserDto } from '@core/models/user.model';
import type { PaginatedResponse } from '@core/models/api.model';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  getAll(page = 1, limit = 10): Observable<PaginatedResponse<User>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    return this.http.get<PaginatedResponse<User>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateUserDto): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

### 2. State Service with Signals

```typescript
// users.store.ts
import { Injectable, computed, signal } from '@angular/core';

interface UsersState {
  users: User[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  selectedId: null,
  loading: false,
  error: null
};

@Injectable({ providedIn: 'root' })
export class UsersStore {
  // State
  private readonly state = signal<UsersState>(initialState);

  // Selectors
  readonly users = computed(() => this.state().users);
  readonly selectedId = computed(() => this.state().selectedId);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  readonly selectedUser = computed(() =>
    this.users().find(u => u.id === this.selectedId())
  );

  // Reducers
  setUsers(users: User[]): void {
    this.state.update(s => ({ ...s, users, loading: false, error: null }));
  }

  addUser(user: User): void {
    this.state.update(s => ({ ...s, users: [...s.users, user] }));
  }

  updateUser(updated: User): void {
    this.state.update(s => ({
      ...s,
      users: s.users.map(u => u.id === updated.id ? updated : u)
    }));
  }

  removeUser(id: string): void {
    this.state.update(s => ({
      ...s,
      users: s.users.filter(u => u.id !== id)
    }));
  }

  selectUser(id: string | null): void {
    this.state.update(s => ({ ...s, selectedId: id }));
  }

  setLoading(loading: boolean): void {
    this.state.update(s => ({ ...s, loading }));
  }

  setError(error: string | null): void {
    this.state.update(s => ({ ...s, error, loading: false }));
  }

  reset(): void {
    this.state.set(initialState);
  }
}
```

## Guard and Interceptor Patterns

### 1. Functional Guard

```typescript
// auth.guard.ts
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};

// Role-based guard
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const userRole = authService.currentUser()?.role;

    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    return router.createUrlTree(['/unauthorized']);
  };
};
```

### 2. Functional Interceptor

```typescript
// auth.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};
```

## Template Best Practices

### 1. Modern Control Flow

```html
<!-- ✅ Good - New control flow syntax -->
@if (loading()) {
  <app-spinner />
} @else if (error()) {
  <app-error [message]="error()" />
} @else {
  @for (user of users(); track user.id) {
    <app-user-card [user]="user" />
  } @empty {
    <p>No users found</p>
  }
}

<!-- @switch for multiple conditions -->
@switch (status()) {
  @case ('pending') {
    <span class="badge pending">Pending</span>
  }
  @case ('active') {
    <span class="badge active">Active</span>
  }
  @default {
    <span class="badge">Unknown</span>
  }
}
```

### 2. Event Binding

```html
<!-- ✅ Good - Proper event binding -->
<button (click)="onSave()">Save</button>
<input (input)="onSearchChange($event)" />
<form (ngSubmit)="onSubmit()">

<!-- ✅ Good - Prevent default -->
<form (submit)="$event.preventDefault(); onSubmit()">

<!-- ✅ Good - Key events -->
<input (keyup.enter)="onSearch()" />
```

### 3. Two-way Binding with Signals

```typescript
// Component
export class SearchComponent {
  searchTerm = signal('');

  // For ngModel compatibility
  protected readonly searchTermModel = {
    get: () => this.searchTerm(),
    set: (value: string) => this.searchTerm.set(value)
  };
}
```

```html
<!-- Template -->
<input [(ngModel)]="searchTermModel" />

<!-- Or with separate bindings -->
<input [value]="searchTerm()" (input)="searchTerm.set($event.target.value)" />
```

## NPM Scripts

```json
{
  "scripts": {
    "start": "ng serve",
    "build": "ng build",
    "build:prod": "ng build --configuration=production",
    "test": "ng test",
    "test:ci": "ng test --no-watch --code-coverage",
    "lint": "ng lint",
    "lint:fix": "ng lint --fix",
    "e2e": "ng e2e",
    "format": "prettier --write \"src/**/*.{ts,html,scss}\"",
    "format:check": "prettier --check \"src/**/*.{ts,html,scss}\""
  }
}
```

## Conclusion

Angular coding standards ensure:

1. **Consistency**: Same patterns across the team
2. **Maintainability**: Easy to understand and modify
3. **Performance**: OnPush, signals, lazy loading
4. **Type Safety**: Strict TypeScript, typed forms
5. **Modern Practices**: Standalone components, signals, new control flow

**Golden rule**: Write code that is easy to read, test, and maintain.

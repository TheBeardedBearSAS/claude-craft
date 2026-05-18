---
description: Angular Architecture Review
model: haiku

---

# Angular Architecture Review

Analyze the Angular project architecture and provide recommendations for improvement.

## What This Command Does

1. **Structure Analysis**
   - Folder organization
   - Feature modularity
   - Dependency flow
   - Layer separation

2. **Pattern Verification**
   - Smart/Dumb components
   - Service patterns
   - State management
   - Routing structure

3. **Generated Report**
   - Architecture score
   - Violations found
   - Improvement recommendations

## Architecture Standards

### 1. Folder Structure

```
✅ Expected Structure:
src/app/
├── core/                    # Singleton services, guards, interceptors
│   ├── services/
│   ├── guards/
│   ├── interceptors/
│   └── models/
├── shared/                  # Reusable components, pipes, directives
│   ├── components/
│   ├── pipes/
│   ├── directives/
│   └── validators/
├── features/                # Business features
│   └── {feature}/
│       ├── components/
│       ├── services/
│       ├── store/
│       └── {feature}.routes.ts
├── layout/                  # Layout components
│   ├── header/
│   ├── sidebar/
│   └── shell/
├── app.config.ts
├── app.component.ts
└── app.routes.ts
```

### 2. Dependency Rules

```
✅ Allowed Dependencies:
- features → core, shared
- shared → core (types only)
- core → (external only)

❌ Forbidden Dependencies:
- core → features
- core → shared (components)
- shared → features
- features → features (cross-feature)
```

### 3. Smart/Dumb Pattern

```typescript
// ✅ Container (Smart) Component
// - Injects services
// - Manages state
// - Handles side effects
@Component({
  selector: 'app-user-list-container',
  template: `
    <app-user-list
      [users]="users()"
      [loading]="loading()"
      (userSelected)="onSelect($event)"
    />
  `
})
export class UserListContainerComponent {
  private usersService = inject(UsersService);
  users = this.usersService.users;
  loading = this.usersService.loading;
}

// ✅ Presenter (Dumb) Component
// - Only @Input/@Output
// - No service injection
// - Pure display logic
@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent {
  @Input({ required: true }) users!: User[];
  @Input() loading = false;
  @Output() userSelected = new EventEmitter<string>();
}
```

### 4. Service Layer

```typescript
// ✅ API Service (Data access)
@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
}

// ✅ Store Service (State management)
@Injectable({ providedIn: 'root' })
export class UsersStore {
  private state = signal<UsersState>(initialState);

  users = computed(() => this.state().users);
  loading = computed(() => this.state().loading);

  setUsers(users: User[]): void {
    this.state.update(s => ({ ...s, users }));
  }
}

// ✅ Facade Service (Orchestration)
@Injectable({ providedIn: 'root' })
export class UsersService {
  private api = inject(UsersApiService);
  private store = inject(UsersStore);

  users = this.store.users;
  loading = this.store.loading;

  loadUsers(): void {
    this.store.setLoading(true);
    this.api.getUsers().subscribe({
      next: users => this.store.setUsers(users),
      error: err => this.store.setError(err.message)
    });
  }
}
```

### 5. Routing Structure

```typescript
// ✅ Root routes with lazy loading
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component'),
    children: [
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes'),
        canActivate: [authGuard]
      }
    ]
  }
];

// ✅ Feature routes
export const USERS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./user-list.component') },
  { path: ':id', loadComponent: () => import('./user-detail.component') }
];
```

## Scoring Criteria

| Category | Weight | Criteria |
|----------|--------|----------|
| Folder Structure | 20% | Correct organization |
| Dependency Flow | 20% | No circular/forbidden deps |
| Smart/Dumb Pattern | 15% | Proper separation |
| Service Layer | 15% | API/Store/Facade pattern |
| Lazy Loading | 15% | Routes properly lazy loaded |
| Feature Isolation | 15% | No cross-feature imports |

## Output Format

```
══════════════════════════════════════════════════════════════
ANGULAR ARCHITECTURE REVIEW
══════════════════════════════════════════════════════════════

📊 SCORE: 78/100

📁 FOLDER STRUCTURE: 90/100
──────────────────────────────────────────────────────────────
✅ core/ properly organized
✅ shared/ properly organized
✅ features/ properly organized
⚠️ Missing layout/ folder

🔗 DEPENDENCY FLOW: 70/100
──────────────────────────────────────────────────────────────
✅ features → core: OK
✅ features → shared: OK
❌ Forbidden: features/users → features/auth
   - src/app/features/users/user-profile.component.ts:5
     imports { AuthService } from '../auth/services'

🧩 SMART/DUMB PATTERN: 80/100
──────────────────────────────────────────────────────────────
✅ 16/20 components follow pattern
⚠️ 4 components mix concerns:
   - src/app/features/users/user-list.component.ts
     Smart component with display logic

🔧 SERVICE LAYER: 75/100
──────────────────────────────────────────────────────────────
✅ API services: OK
✅ Store services: OK
⚠️ Missing facade pattern in:
   - features/auth/
   - features/dashboard/

🚀 LAZY LOADING: 85/100
──────────────────────────────────────────────────────────────
✅ Feature routes lazy loaded
⚠️ Shared components not lazy loaded

📋 RECOMMENDATIONS
──────────────────────────────────────────────────────────────
1. Create layout/ folder for Header, Sidebar, Shell
2. Remove cross-feature import (users → auth)
   → Move AuthService to core/
3. Separate smart/dumb components in user-list
4. Add facade services for auth and dashboard features
5. Consider lazy loading large shared components

══════════════════════════════════════════════════════════════
```

## Architecture Checklist

- [ ] Correct folder structure (core/shared/features/layout)
- [ ] No forbidden dependencies
- [ ] No cross-feature imports
- [ ] Smart/Dumb pattern followed
- [ ] Service layer properly structured
- [ ] All feature routes lazy loaded
- [ ] Standalone components used
- [ ] Guards and interceptors in core/
- [ ] Reusable components in shared/
- [ ] Feature-specific code in features/

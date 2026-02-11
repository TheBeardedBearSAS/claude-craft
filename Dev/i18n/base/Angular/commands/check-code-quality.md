---
description: Angular Code Quality Analysis
---

# Angular Code Quality Analysis

Analyze code quality and identify areas for improvement in the Angular project.

## What This Command Does

1. **Code Quality Metrics**
   - TypeScript strict compliance
   - ESLint violations
   - Code complexity
   - Duplicated code

2. **Angular-Specific Quality**
   - Component best practices
   - RxJS patterns
   - Memory leak prevention
   - Performance patterns

3. **Generated Report**
   - Quality score
   - Issues by severity
   - Actionable recommendations

## Quality Criteria

### 1. TypeScript Quality

```typescript
// ✅ Good - Explicit types, null safety
interface User {
  id: string;
  name: string;
  email: string | null;
}

function getUser(id: string): User | undefined {
  return users.find(u => u.id === id);
}

const userName = getUser('1')?.name ?? 'Unknown';

// ❌ Bad - Implicit any, no null handling
function getUser(id) {
  return users.find(u => u.id === id);
}

const userName = getUser('1').name; // Potential null error
```

### 2. Component Quality

```typescript
// ✅ Good - Small, focused component
@Component({
  selector: 'app-user-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <img [src]="avatarUrl()" [alt]="user().name" class="avatar" />
  `
})
export class UserAvatarComponent {
  user = input.required<User>();
  avatarUrl = computed(() => this.user().avatar ?? '/default-avatar.png');
}

// ❌ Bad - Large component doing too much
@Component({
  selector: 'app-user-page',
  template: `<!-- 500 lines of HTML -->`
})
export class UserPageComponent {
  // 50+ methods, multiple responsibilities
}
```

### 3. RxJS Best Practices

```typescript
// ✅ Good - Proper subscription management
export class UserListComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.userService.users$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(users => this.handleUsers(users));
  }
}

// ❌ Bad - Memory leak (no unsubscribe)
export class UserListComponent implements OnInit {
  ngOnInit(): void {
    this.userService.users$.subscribe(users => {
      this.users = users; // Never unsubscribed!
    });
  }
}
```

### 4. Performance Patterns

```typescript
// ✅ Good - trackBy for lists
@Component({
  template: `
    @for (user of users(); track user.id) {
      <app-user-card [user]="user" />
    }
  `
})

// ❌ Bad - No trackBy (causes re-render issues)
@Component({
  template: `
    @for (user of users(); track $index) {
      <app-user-card [user]="user" />
    }
  `
})
```

### 5. Error Handling

```typescript
// ✅ Good - Proper error handling
loadUsers(): void {
  this.loading.set(true);
  this.error.set(null);

  this.api.getUsers().subscribe({
    next: users => {
      this.users.set(users);
      this.loading.set(false);
    },
    error: (err: HttpErrorResponse) => {
      this.error.set(this.getErrorMessage(err));
      this.loading.set(false);
    }
  });
}

private getErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) return 'Network error. Please check your connection.';
  if (error.status === 404) return 'Users not found.';
  return 'An unexpected error occurred.';
}

// ❌ Bad - No error handling
loadUsers(): void {
  this.api.getUsers().subscribe(users => {
    this.users = users;
  });
}
```

## Scoring Criteria

| Category | Weight | Criteria |
|----------|--------|----------|
| TypeScript Strict | 20% | No any, null safety |
| Component Size | 15% | <300 lines, single responsibility |
| Subscription Mgmt | 15% | All subscriptions cleaned up |
| Error Handling | 15% | Proper error handling patterns |
| Performance | 15% | trackBy, OnPush, lazy loading |
| Code Duplication | 10% | <5% duplicated code |
| Complexity | 10% | Cyclomatic complexity <10 |

## Output Format

```
══════════════════════════════════════════════════════════════
ANGULAR CODE QUALITY REPORT
══════════════════════════════════════════════════════════════

📊 QUALITY SCORE: 82/100

📝 TYPESCRIPT QUALITY: 90/100
──────────────────────────────────────────────────────────────
✅ Strict mode enabled
✅ No implicit any
⚠️ 3 instances of type assertions
   - src/app/features/users/user.service.ts:45

🧩 COMPONENT QUALITY: 85/100
──────────────────────────────────────────────────────────────
✅ Average component size: 120 lines
⚠️ 2 components exceed 300 lines:
   - src/app/features/dashboard/dashboard.component.ts (450 lines)
   - src/app/features/users/user-form.component.ts (380 lines)

🔄 RXJS PATTERNS: 75/100
──────────────────────────────────────────────────────────────
✅ takeUntilDestroyed used: 18/20 subscriptions
❌ Potential memory leaks:
   - src/app/features/chat/chat.component.ts:34
   - src/app/core/services/websocket.service.ts:67

⚡ PERFORMANCE: 80/100
──────────────────────────────────────────────────────────────
✅ OnPush: 24/24 components
✅ trackBy: 15/18 @for loops
⚠️ Missing trackBy:
   - src/app/shared/dropdown/dropdown.component.html:12

🚨 ERROR HANDLING: 85/100
──────────────────────────────────────────────────────────────
✅ Global error handler configured
✅ HTTP errors handled: 12/14 API calls
⚠️ Missing error handling:
   - src/app/features/upload/upload.service.ts:28

📋 RECOMMENDATIONS
──────────────────────────────────────────────────────────────
1. Split large components into smaller pieces
2. Add takeUntilDestroyed to remaining subscriptions
3. Add trackBy to all @for loops
4. Add error handling to upload service

══════════════════════════════════════════════════════════════
```

## Quality Checklist

- [ ] TypeScript strict mode enabled
- [ ] No explicit `any` types
- [ ] All subscriptions properly managed
- [ ] Error handling on all API calls
- [ ] Components <300 lines
- [ ] Cyclomatic complexity <10
- [ ] trackBy on all @for loops
- [ ] OnPush on all components
- [ ] <5% code duplication
- [ ] No console.log in production code

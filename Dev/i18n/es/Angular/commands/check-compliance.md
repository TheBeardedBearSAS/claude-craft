---
description: Angular Standards Compliance Check
---

# Angular Standards Compliance Check

Verify that the Angular project follows established coding standards and best practices.

## What This Command Does

1. **Standards Verification**
   - Check coding conventions
   - Verify naming conventions
   - Validate file organization
   - Check import order
   - Verify documentation standards

2. **Angular-Specific Checks**
   - Standalone components usage
   - Signals implementation
   - OnPush change detection
   - Modern control flow (@if, @for)
   - Typed forms

3. **Generated Report**
   - Non-compliant files
   - Severity levels
   - Remediation recommendations
   - Compliance score (/100)

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## Compliance Areas

### 1. Component Standards

```typescript
// ✅ Compliant
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class UserProfileComponent {}

// ❌ Non-compliant
@Component({
  selector: 'user-profile',     // Missing app- prefix
  // standalone: missing       // Not standalone
  // changeDetection: missing  // Not OnPush
})
export class UserProfile {}    // Missing Component suffix
```

### 2. Signal Usage

```typescript
// ✅ Compliant - Using signals
export class CounterComponent {
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);
}

// ❌ Non-compliant - Using observables for local state
export class CounterComponent {
  count$ = new BehaviorSubject(0);
}
```

### 3. Template Syntax

```html
<!-- ✅ Compliant - Modern control flow -->
@if (loading()) {
  <app-spinner />
}

@for (item of items(); track item.id) {
  <app-item [data]="item" />
}

<!-- ❌ Non-compliant - Legacy syntax -->
<app-spinner *ngIf="loading"></app-spinner>
<app-item *ngFor="let item of items" [data]="item"></app-item>
```

### 4. Dependency Injection

```typescript
// ✅ Compliant - inject() function
export class MyComponent {
  private readonly userService = inject(UserService);
}

// ⚠️ Warning - Constructor injection (valid but verbose)
export class MyComponent {
  constructor(private userService: UserService) {}
}
```

### 5. File Naming

```
✅ Compliant:
- user-profile.component.ts
- auth.service.ts
- auth.guard.ts
- date-format.pipe.ts

❌ Non-compliant:
- UserProfile.component.ts (PascalCase)
- authService.ts (missing suffix)
- AuthGuard.ts (PascalCase)
```

## Scoring Criteria

| Category | Weight | Criteria |
|----------|--------|----------|
| Standalone Components | 20% | All components are standalone |
| Signals Usage | 15% | Local state uses signals |
| OnPush Strategy | 15% | All components use OnPush |
| Modern Control Flow | 10% | @if/@for instead of *ngIf/*ngFor |
| Typed Forms | 10% | Forms are strongly typed |
| Naming Conventions | 10% | Correct file/class naming |
| Import Organization | 10% | Imports properly ordered |
| Documentation | 10% | Key components documented |

## Output Format

```
══════════════════════════════════════════════════════════════
ANGULAR COMPLIANCE REPORT
══════════════════════════════════════════════════════════════

📊 SCORE: 85/100

✅ PASSING (6)
──────────────────────────────────────────────────────────────
• Standalone components: 100% (24/24 components)
• OnPush strategy: 100% (24/24 components)
• Typed forms: 100% (8/8 forms)
• Import organization: 100%
• File naming: 100%
• Documentation: 90%

⚠️ WARNINGS (2)
──────────────────────────────────────────────────────────────
• Modern control flow: 75% (18/24 templates)
  - src/app/features/users/user-list.component.html:15 - Uses *ngFor
  - src/app/shared/modal/modal.component.html:8 - Uses *ngIf

• Signals usage: 80% (16/20 components with local state)
  - src/app/features/auth/login.component.ts - Uses BehaviorSubject

❌ ERRORS (1)
──────────────────────────────────────────────────────────────
• Constructor injection detected (prefer inject()):
  - src/app/core/services/api.service.ts:15

📋 RECOMMENDATIONS
──────────────────────────────────────────────────────────────
1. Migrate remaining *ngFor to @for with track
2. Replace BehaviorSubject with signal() for local state
3. Use inject() function instead of constructor injection

══════════════════════════════════════════════════════════════
```

## Automated Checks

Run these commands to verify compliance:

```bash
# Lint check
ng lint

# Type check
npx tsc --noEmit

# Test coverage
npm run test:ci

# Build check
ng build --configuration=production
```

## Checklist

- [ ] All components are standalone
- [ ] All components use OnPush change detection
- [ ] Local state uses signals (not BehaviorSubject)
- [ ] Templates use @if/@for/@switch
- [ ] Forms are typed (FormGroup<T>)
- [ ] inject() used for dependency injection
- [ ] File naming follows conventions
- [ ] Imports are organized
- [ ] Public API documented
- [ ] Tests pass with >80% coverage

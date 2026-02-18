---
description: Angular Test Coverage and Quality Analysis
---

# Angular Test Coverage and Quality Analysis

Analyze test coverage and quality in the Angular project.

## What This Command Does

1. **Coverage Analysis**
   - Line coverage
   - Branch coverage
   - Function coverage
   - Statement coverage

2. **Test Quality**
   - Test patterns (AAA)
   - Mock usage
   - Async handling
   - Edge case coverage

3. **Generated Report**
   - Coverage metrics
   - Missing tests
   - Quality recommendations

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## Testing Standards

### 1. Component Testing

```typescript
// ✅ Good - Comprehensive component test
describe('UserCardComponent', () => {
  let fixture: ComponentFixture<UserCardComponent>;
  let component: UserCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserCardComponent);
    component = fixture.componentInstance;
  });

  describe('rendering', () => {
    it('should display user name', () => {
      // Arrange
      const user = { id: '1', name: 'John Doe', email: 'john@test.com' };

      // Act
      fixture.componentRef.setInput('user', user);
      fixture.detectChanges();

      // Assert
      expect(fixture.nativeElement.textContent).toContain('John Doe');
    });

    it('should show loading state', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.loading')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should emit selected event on click', () => {
      // Arrange
      const user = { id: '1', name: 'John' };
      fixture.componentRef.setInput('user', user);
      fixture.detectChanges();

      const spy = vi.fn();
      component.selected.subscribe(spy);

      // Act
      fixture.nativeElement.querySelector('button').click();

      // Assert
      expect(spy).toHaveBeenCalledWith('1');
    });
  });
});
```

### 2. Service Testing

```typescript
// ✅ Good - Service test with mocked HTTP
describe('UsersApiService', () => {
  let service: UsersApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UsersApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(UsersApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify no outstanding requests
  });

  describe('getUsers', () => {
    it('should return users list', () => {
      const mockUsers = [{ id: '1', name: 'John' }];

      service.getUsers().subscribe(users => {
        expect(users).toEqual(mockUsers);
      });

      const req = httpMock.expectOne('/api/users');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should handle error', () => {
      service.getUsers().subscribe({
        error: err => expect(err.status).toBe(500)
      });

      const req = httpMock.expectOne('/api/users');
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });
});
```

### 3. Store Testing

```typescript
// ✅ Good - Signal store test
describe('UsersStore', () => {
  let store: UsersStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UsersStore]
    });
    store = TestBed.inject(UsersStore);
  });

  it('should initialize with empty state', () => {
    expect(store.users()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should set users', () => {
    const users = [{ id: '1', name: 'John' }];

    store.setUsers(users);

    expect(store.users()).toEqual(users);
  });

  it('should compute selected user', () => {
    store.setUsers([
      { id: '1', name: 'John' },
      { id: '2', name: 'Jane' }
    ]);

    store.selectUser('2');

    expect(store.selectedUser()?.name).toBe('Jane');
  });
});
```

### 4. Guard Testing

```typescript
// ✅ Good - Functional guard test
describe('authGuard', () => {
  let authService: { isAuthenticated: ReturnType<typeof signal> };
  let router: { createUrlTree: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = { isAuthenticated: signal(false) };
    router = { createUrlTree: vi.fn().mockReturnValue('/login') };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });
  });

  it('should allow access when authenticated', () => {
    authService.isAuthenticated.set(true);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);
      expect(result).toBe(true);
    });
  });

  it('should redirect to login when not authenticated', () => {
    TestBed.runInInjectionContext(() => {
      authGuard({} as any, {} as any);
      expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    });
  });
});
```

## Coverage Requirements

| Metric | Minimum | Target |
|--------|---------|--------|
| Lines | 80% | 90% |
| Functions | 80% | 90% |
| Branches | 75% | 85% |
| Statements | 80% | 90% |

## Output Format

```
══════════════════════════════════════════════════════════════
ANGULAR TEST COVERAGE REPORT
══════════════════════════════════════════════════════════════

📊 COVERAGE SCORE: 85/100

📈 COVERAGE METRICS
──────────────────────────────────────────────────────────────
Lines:      87.5%  ████████▊  (target: 80%) ✅
Functions:  82.3%  ████████▏  (target: 80%) ✅
Branches:   76.8%  ███████▋   (target: 75%) ✅
Statements: 86.2%  ████████▌  (target: 80%) ✅

🧪 TEST DISTRIBUTION
──────────────────────────────────────────────────────────────
Components: 45 tests (18 files)
Services:   32 tests (12 files)
Guards:     8 tests (4 files)
Pipes:      6 tests (3 files)
Stores:     15 tests (5 files)

⚠️ LOW COVERAGE FILES
──────────────────────────────────────────────────────────────
• src/app/features/dashboard/dashboard.component.ts: 45%
  - Missing: error state, loading state, empty state
• src/app/core/services/websocket.service.ts: 52%
  - Missing: reconnection logic, error handling
• src/app/shared/modal/modal.component.ts: 60%
  - Missing: keyboard events, focus trap

❌ MISSING TESTS
──────────────────────────────────────────────────────────────
• src/app/features/upload/upload.service.ts
• src/app/core/interceptors/error.interceptor.ts
• src/app/shared/validators/password.validator.ts

📋 TEST QUALITY ISSUES
──────────────────────────────────────────────────────────────
• 3 tests missing AAA pattern
• 2 tests with hardcoded timeouts (use fakeAsync)
• 5 tests without proper cleanup

📋 RECOMMENDATIONS
──────────────────────────────────────────────────────────────
1. Add tests for dashboard component states
2. Create tests for upload service
3. Replace setTimeout with fakeAsync/tick
4. Add cleanup in afterEach blocks

══════════════════════════════════════════════════════════════
```

## Test Quality Checklist

- [ ] Coverage meets minimum thresholds
- [ ] All components have tests
- [ ] All services have tests
- [ ] All guards have tests
- [ ] Tests follow AAA pattern
- [ ] HTTP tests verify all request properties
- [ ] Async tests use fakeAsync or async/await
- [ ] Tests clean up after themselves
- [ ] Edge cases covered
- [ ] Error scenarios tested

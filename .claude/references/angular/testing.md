# Angular Testing Standards

**Version documentée :** Angular 21 (latest stable, LTS) / Angular 22 (en RC)

## Testing Strategy

### Testing Pyramid

```
        /\
       /  \      E2E Tests (Cypress/Playwright)
      /----\     10% - Critical user journeys
     /      \
    /--------\   Integration Tests
   /          \  20% - Component interactions
  /------------\
 /              \ Unit Tests
/________________\ 70% - Components, services, pipes
```

### Coverage Requirements

| Metric | Minimum | Target |
|--------|---------|--------|
| Lines | 80% | 90% |
| Functions | 80% | 90% |
| Branches | 75% | 85% |
| Statements | 80% | 90% |

## Unit Testing with Vitest (Recommended)

### Setup

```bash
npm install -D vitest @analogjs/vitest-angular jsdom
```

**vite.config.ts**
```typescript
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/app/**/*.ts'],
      exclude: ['src/app/**/*.module.ts', 'src/app/**/*.routes.ts']
    }
  }
});
```

**src/test-setup.ts**
```typescript
import '@analogjs/vitest-angular/setup-zone';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
```

## Component Testing

### Basic Component Test

```typescript
// user-card.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserCardComponent } from './user-card.component';

describe('UserCardComponent', () => {
  let component: UserCardComponent;
  let fixture: ComponentFixture<UserCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user name', () => {
    // Arrange
    const user = { id: '1', name: 'John Doe', email: 'john@example.com' };

    // Act
    fixture.componentRef.setInput('user', user);
    fixture.detectChanges();

    // Assert
    const element = fixture.nativeElement;
    expect(element.textContent).toContain('John Doe');
  });

  it('should emit selected event when clicked', () => {
    // Arrange
    const user = { id: '1', name: 'John Doe', email: 'john@example.com' };
    fixture.componentRef.setInput('user', user);
    fixture.detectChanges();

    const spy = vi.fn();
    component.selected.subscribe(spy);

    // Act
    const button = fixture.nativeElement.querySelector('button');
    button.click();

    // Assert
    expect(spy).toHaveBeenCalledWith('1');
  });
});
```

### Testing Components with Signals

```typescript
// counter.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CounterComponent } from './counter.component';

describe('CounterComponent', () => {
  let component: CounterComponent;
  let fixture: ComponentFixture<CounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CounterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with count 0', () => {
    expect(component.count()).toBe(0);
  });

  it('should increment count', () => {
    // Act
    component.increment();

    // Assert
    expect(component.count()).toBe(1);
  });

  it('should compute double count', () => {
    // Act
    component.count.set(5);

    // Assert
    expect(component.doubleCount()).toBe(10);
  });

  it('should update view when count changes', () => {
    // Act
    component.count.set(42);
    fixture.detectChanges();

    // Assert
    const element = fixture.nativeElement;
    expect(element.textContent).toContain('42');
  });
});
```

### Testing Components with Dependencies

```typescript
// user-list.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UserListComponent } from './user-list.component';
import { UsersService } from './users.service';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        UsersService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load users on init', () => {
    // Arrange
    const mockUsers = [
      { id: '1', name: 'John' },
      { id: '2', name: 'Jane' }
    ];

    // Act
    fixture.detectChanges();

    // Assert - Handle HTTP request
    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);

    fixture.detectChanges();
    expect(component.users().length).toBe(2);
  });
});
```

### Testing with Mocks

```typescript
// user-profile.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { UserProfileComponent } from './user-profile.component';
import { AuthService } from '@core/services/auth.service';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
    // Create mock
    mockAuthService = {
      currentUser: signal({ id: '1', name: 'John', email: 'john@test.com' }),
      isAuthenticated: signal(true),
      logout: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [UserProfileComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display current user name', () => {
    const element = fixture.nativeElement;
    expect(element.textContent).toContain('John');
  });

  it('should call logout on AuthService', () => {
    // Act
    component.onLogout();

    // Assert
    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
```

## Service Testing

### API Service Test

```typescript
// users-api.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UsersApiService } from './users-api.service';

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
    httpMock.verify();
  });

  describe('getAll', () => {
    it('should return users list', () => {
      const mockUsers = [
        { id: '1', name: 'John' },
        { id: '2', name: 'Jane' }
      ];

      service.getAll().subscribe(users => {
        expect(users.length).toBe(2);
        expect(users[0].name).toBe('John');
      });

      const req = httpMock.expectOne('/api/users?page=1&limit=10');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should pass pagination params', () => {
      service.getAll(2, 20).subscribe();

      const req = httpMock.expectOne('/api/users?page=2&limit=20');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe('20');
      req.flush([]);
    });
  });

  describe('create', () => {
    it('should send POST request with user data', () => {
      const newUser = { name: 'Test', email: 'test@example.com' };
      const createdUser = { id: '3', ...newUser };

      service.create(newUser).subscribe(user => {
        expect(user.id).toBe('3');
      });

      const req = httpMock.expectOne('/api/users');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newUser);
      req.flush(createdUser);
    });
  });

  describe('error handling', () => {
    it('should handle 404 error', () => {
      service.getById('999').subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne('/api/users/999');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });
});
```

### Store Service Test

```typescript
// users.store.spec.ts
import { TestBed } from '@angular/core/testing';
import { UsersStore } from './users.store';

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

  describe('setUsers', () => {
    it('should update users and clear loading', () => {
      const users = [{ id: '1', name: 'John' }];

      store.setLoading(true);
      store.setUsers(users);

      expect(store.users()).toEqual(users);
      expect(store.loading()).toBe(false);
    });
  });

  describe('addUser', () => {
    it('should add user to list', () => {
      const user = { id: '1', name: 'John' };

      store.addUser(user);

      expect(store.users()).toContainEqual(user);
    });
  });

  describe('selectedUser', () => {
    it('should return selected user', () => {
      const users = [
        { id: '1', name: 'John' },
        { id: '2', name: 'Jane' }
      ];

      store.setUsers(users);
      store.selectUser('2');

      expect(store.selectedUser()?.name).toBe('Jane');
    });

    it('should return undefined if no user selected', () => {
      expect(store.selectedUser()).toBeUndefined();
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      store.setUsers([{ id: '1', name: 'John' }]);
      store.setLoading(true);
      store.setError('Error');

      store.reset();

      expect(store.users()).toEqual([]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });
  });
});
```

## Pipe Testing

```typescript
// date-format.pipe.spec.ts
import { DateFormatPipe } from './date-format.pipe';

describe('DateFormatPipe', () => {
  let pipe: DateFormatPipe;

  beforeEach(() => {
    pipe = new DateFormatPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format date with default format', () => {
    const date = new Date('2024-03-15T10:30:00');
    expect(pipe.transform(date)).toBe('Mar 15, 2024');
  });

  it('should format date with custom format', () => {
    const date = new Date('2024-03-15T10:30:00');
    expect(pipe.transform(date, 'short')).toBe('3/15/24');
  });

  it('should return empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should handle invalid date', () => {
    expect(pipe.transform('invalid')).toBe('Invalid Date');
  });
});
```

## Guard Testing

```typescript
// auth.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { signal } from '@angular/core';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let mockAuthService: Partial<AuthService>;
  let mockRouter: Partial<Router>;

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: signal(false)
    };

    mockRouter = {
      createUrlTree: vi.fn().mockReturnValue('/auth/login')
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  it('should allow access when authenticated', () => {
    mockAuthService.isAuthenticated = signal(true);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
      expect(result).toBe(true);
    });
  });

  it('should redirect to login when not authenticated', () => {
    mockAuthService.isAuthenticated = signal(false);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    });
  });
});
```

## Interceptor Testing

```typescript
// auth.interceptor.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let mockAuthService: Partial<AuthService>;

  beforeEach(() => {
    mockAuthService = {
      getToken: vi.fn().mockReturnValue('test-token'),
      logout: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header', () => {
    http.get('/api/data').subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush({});
  });

  it('should not add header if no token', () => {
    mockAuthService.getToken = vi.fn().mockReturnValue(null);

    http.get('/api/data').subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should logout on 401 error', () => {
    http.get('/api/data').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/data');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
```

## E2E Testing with Cypress

### Setup

```typescript
// cypress/support/commands.ts
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth/login');
  cy.get('[data-cy=email]').type(email);
  cy.get('[data-cy=password]').type(password);
  cy.get('[data-cy=submit]').click();
  cy.url().should('include', '/dashboard');
});
```

### E2E Test Example

```typescript
// cypress/e2e/users.cy.ts
describe('Users Feature', () => {
  beforeEach(() => {
    cy.login('admin@test.com', 'password');
  });

  it('should display users list', () => {
    cy.visit('/users');

    cy.get('[data-cy=users-list]').should('be.visible');
    cy.get('[data-cy=user-card]').should('have.length.greaterThan', 0);
  });

  it('should create new user', () => {
    cy.visit('/users');
    cy.get('[data-cy=add-user]').click();

    cy.get('[data-cy=user-name]').type('New User');
    cy.get('[data-cy=user-email]').type('new@test.com');
    cy.get('[data-cy=save]').click();

    cy.get('[data-cy=toast]').should('contain', 'User created');
    cy.get('[data-cy=users-list]').should('contain', 'New User');
  });

  it('should search users', () => {
    cy.visit('/users');

    cy.get('[data-cy=search]').type('John');
    cy.get('[data-cy=user-card]').should('have.length', 1);
    cy.get('[data-cy=user-card]').should('contain', 'John');
  });
});
```

## Testing Best Practices

### 1. Follow AAA Pattern

```typescript
it('should calculate total', () => {
  // Arrange
  const items = [{ price: 10 }, { price: 20 }];

  // Act
  const result = calculateTotal(items);

  // Assert
  expect(result).toBe(30);
});
```

### 2. Use data-cy Attributes

```html
<button data-cy="submit-btn" (click)="onSubmit()">Submit</button>
<input data-cy="email-input" [(ngModel)]="email" />
```

### 3. Test User Behavior, Not Implementation

```typescript
// ❌ Bad - Testing implementation details
it('should call service method', () => {
  component.loadData();
  expect(service.getData).toHaveBeenCalled();
});

// ✅ Good - Testing user behavior
it('should display data after loading', async () => {
  fixture.detectChanges();
  await fixture.whenStable();

  expect(fixture.nativeElement.textContent).toContain('Expected Data');
});
```

### 4. Isolate Tests

```typescript
// Each test should be independent
beforeEach(() => {
  // Reset state before each test
  store.reset();
});
```

## Summary

| Test Type | Tool | Coverage |
|-----------|------|----------|
| Unit | Vitest/Jest | 70% |
| Integration | TestBed | 20% |
| E2E | Cypress | 10% |

Testing priorities:
1. Critical business logic
2. User interactions
3. Edge cases and error handling
4. Integration points

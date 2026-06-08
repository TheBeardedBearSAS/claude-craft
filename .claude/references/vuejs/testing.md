# Vue.js Testing Guidelines

## Testing Stack

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit & component testing |
| **Vue Test Utils** | Component mounting & interaction |
| **Testing Library** | User-centric component testing |
| **Playwright/Cypress** | End-to-end testing |
| **MSW** | API mocking |

## Vitest Browser Mode (recommandé 2026)

Depuis Vitest 4, le **Browser Mode** est stable et recommandé pour les tests de composants Vue — il exécute les tests dans un vrai navigateur (Chromium/Firefox/WebKit via Playwright) au lieu de simuler le DOM avec jsdom. Résultat : comportement réel du navigateur, pas de faux positifs jsdom.

**Stratégie 2026 :**
- Tests de **composants Vue** → Browser Mode (vrai DOM)
- Tests de **composables purs** (sans lifecycle ou DOM) → jsdom (plus rapide, pas de browser nécessaire)

### Installation

```bash
npm install -D @vitest/browser playwright
npx playwright install chromium
```

### Configuration avec workspaces

```typescript
// vitest.config.ts — workspace séparant browser et node
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    workspace: [
      {
        // Tests de composants Vue — vrai navigateur
        extends: true,
        test: {
          name: 'browser',
          include: ['src/**/*.component.{test,spec}.ts'],
          browser: {
            enabled: true,
            name: 'chromium',
            provider: 'playwright',
            headless: true,
          },
        },
      },
      {
        // Composables purs et stores — jsdom (rapide)
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.{test,spec}.ts'],
          exclude: ['src/**/*.component.{test,spec}.ts'],
          environment: 'jsdom',
        },
      },
    ],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

### Exemple de test de composant en Browser Mode

```typescript
// components/UserCard.component.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserCard from './UserCard.vue'

// Ce test s'exécute dans Chromium — accès réel à document, window, etc.
describe('UserCard (browser)', () => {
  it('renders user name in real DOM', () => {
    const wrapper = mount(UserCard, {
      props: { user: { id: '1', name: 'Jane', email: 'jane@example.com' } },
      attachTo: document.body, // possible car vrai navigateur
    })

    expect(wrapper.text()).toContain('Jane')
  })
})
```

> **Migration jsdom → Browser Mode :** remplacer `environment: 'jsdom'` par la config browser ci-dessus. Les tests `@vue/test-utils` (mount/shallowMount) fonctionnent sans modification. Supprimer `jsdom` des dépendances si tous les tests composants migrent en Browser Mode.

## Vitest Configuration (jsdom simple — projets sans Browser Mode)

> Utiliser cette config uniquement si le projet ne nécessite pas Browser Mode (ex : lib de composables, pas de tests de composants). Pour les apps Vue standard, préférer la config workspace ci-dessus.

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

### Test Setup

```typescript
// src/test/setup.ts
import { config } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'

// Global plugins for all tests
config.global.plugins = [
  createTestingPinia({
    createSpy: vi.fn,
  }),
]

// Global stubs
config.global.stubs = {
  // Stub router-link and router-view
  RouterLink: true,
  RouterView: true,
}

// Global mocks
config.global.mocks = {
  $t: (key: string) => key, // i18n mock
}
```

## Component Testing

### Basic Component Test

```typescript
// components/UserCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserCard from './UserCard.vue'

describe('UserCard', () => {
  const defaultProps = {
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    },
  }

  it('renders user name', () => {
    const wrapper = mount(UserCard, {
      props: defaultProps,
    })

    expect(wrapper.text()).toContain('John Doe')
  })

  it('renders user email', () => {
    const wrapper = mount(UserCard, {
      props: defaultProps,
    })

    expect(wrapper.find('[data-testid="user-email"]').text())
      .toBe('john@example.com')
  })

  it('emits select event when clicked', async () => {
    const wrapper = mount(UserCard, {
      props: defaultProps,
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')![0]).toEqual([defaultProps.user])
  })
})
```

### Testing with Slots

```typescript
// components/BaseCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseCard from './BaseCard.vue'

describe('BaseCard', () => {
  it('renders default slot content', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        default: '<p>Card content</p>',
      },
    })

    expect(wrapper.html()).toContain('<p>Card content</p>')
  })

  it('renders named slots', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        header: '<h2>Card Title</h2>',
        footer: '<button>Action</button>',
      },
    })

    expect(wrapper.find('.card-header').html()).toContain('Card Title')
    expect(wrapper.find('.card-footer').html()).toContain('Action')
  })
})
```

### Testing Props and Events

```typescript
// components/Counter.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Counter from './Counter.vue'

describe('Counter', () => {
  it('renders initial count', () => {
    const wrapper = mount(Counter, {
      props: { initialCount: 5 },
    })

    expect(wrapper.find('[data-testid="count"]').text()).toBe('5')
  })

  it('increments count when button clicked', async () => {
    const wrapper = mount(Counter, {
      props: { initialCount: 0 },
    })

    await wrapper.find('[data-testid="increment"]').trigger('click')

    expect(wrapper.find('[data-testid="count"]').text()).toBe('1')
  })

  it('emits change event with new count', async () => {
    const wrapper = mount(Counter, {
      props: { initialCount: 0 },
    })

    await wrapper.find('[data-testid="increment"]').trigger('click')

    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(wrapper.emitted('change')![0]).toEqual([1])
  })
})
```

### Testing v-model

```typescript
// components/TextInput.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TextInput from './TextInput.vue'

describe('TextInput', () => {
  it('updates modelValue on input', async () => {
    const wrapper = mount(TextInput, {
      props: {
        modelValue: '',
        'onUpdate:modelValue': (e: string) => wrapper.setProps({ modelValue: e }),
      },
    })

    await wrapper.find('input').setValue('Hello World')

    expect(wrapper.props('modelValue')).toBe('Hello World')
  })

  it('emits update:modelValue event', async () => {
    const wrapper = mount(TextInput, {
      props: { modelValue: '' },
    })

    await wrapper.find('input').setValue('Test')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['Test'])
  })
})
```

## Composable Testing

### Testing Standalone Composables

```typescript
// composables/useCounter.test.ts
import { describe, it, expect } from 'vitest'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('starts with initial value', () => {
    const { count } = useCounter(10)
    expect(count.value).toBe(10)
  })

  it('increments count', () => {
    const { count, increment } = useCounter(0)

    increment()

    expect(count.value).toBe(1)
  })

  it('decrements count', () => {
    const { count, decrement } = useCounter(5)

    decrement()

    expect(count.value).toBe(4)
  })

  it('respects min boundary', () => {
    const { count, decrement } = useCounter(0, { min: 0 })

    decrement()

    expect(count.value).toBe(0)
  })

  it('respects max boundary', () => {
    const { count, increment } = useCounter(10, { max: 10 })

    increment()

    expect(count.value).toBe(10)
  })
})
```

### Testing Composables with Lifecycle

```typescript
// composables/useFetch.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useFetch } from './useFetch'

describe('useFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches data on mount', async () => {
    const mockData = { id: 1, name: 'Test' }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    })

    const TestComponent = defineComponent({
      setup() {
        const { data, isLoading, error } = useFetch('/api/test')
        return { data, isLoading, error }
      },
      template: '<div>{{ data }}</div>',
    })

    const wrapper = mount(TestComponent)

    // Initially loading
    expect(wrapper.vm.isLoading).toBe(true)

    // Wait for fetch to complete
    await flushPromises()

    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.vm.data).toEqual(mockData)
    expect(wrapper.vm.error).toBeNull()
  })

  it('handles fetch error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const TestComponent = defineComponent({
      setup() {
        const { data, isLoading, error } = useFetch('/api/test')
        return { data, isLoading, error }
      },
      template: '<div>{{ error }}</div>',
    })

    const wrapper = mount(TestComponent)
    await flushPromises()

    expect(wrapper.vm.error).toBe('Network error')
    expect(wrapper.vm.data).toBeNull()
  })
})
```

## Pinia Store Testing

### Store Test Setup

```typescript
// stores/counter.store.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from './counter.store'

describe('Counter Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('has initial state', () => {
    const store = useCounterStore()

    expect(store.count).toBe(0)
    expect(store.doubleCount).toBe(0)
  })

  it('increments count', () => {
    const store = useCounterStore()

    store.increment()

    expect(store.count).toBe(1)
  })

  it('computes doubleCount correctly', () => {
    const store = useCounterStore()

    store.increment()
    store.increment()

    expect(store.count).toBe(2)
    expect(store.doubleCount).toBe(4)
  })

  it('resets state', () => {
    const store = useCounterStore()

    store.increment()
    store.increment()
    store.$reset()

    expect(store.count).toBe(0)
  })
})
```

### Testing Async Store Actions

```typescript
// stores/users.store.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUsersStore } from './users.store'
import * as api from '@/services/api/users.api'

vi.mock('@/services/api/users.api')

describe('Users Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetches users successfully', async () => {
    const mockUsers = [
      { id: '1', name: 'User 1' },
      { id: '2', name: 'User 2' },
    ]
    vi.mocked(api.getUsers).mockResolvedValue(mockUsers)

    const store = useUsersStore()
    await store.fetchUsers()

    expect(store.users).toEqual(mockUsers)
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('handles fetch error', async () => {
    vi.mocked(api.getUsers).mockRejectedValue(new Error('API Error'))

    const store = useUsersStore()

    await expect(store.fetchUsers()).rejects.toThrow('API Error')
    expect(store.error).toBe('API Error')
  })
})
```

## Mocking

### Mocking Modules

```typescript
// Mock entire module
vi.mock('@/services/api/users.api', () => ({
  getUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}))

// Mock with implementation
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: ref(true),
    user: ref({ id: '1', name: 'Test User' }),
    login: vi.fn(),
    logout: vi.fn(),
  }),
}))
```

### Mocking API with MSW

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'John' },
      { id: '2', name: 'Jane' },
    ])
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: '3', ...body }, { status: 201 })
  }),
]
```

```typescript
// src/test/setup.ts
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

export const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## E2E Testing with Playwright

### Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E Test Example

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[data-testid="email"]', 'user@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-button"]')

    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid="welcome-message"]'))
      .toContainText('Welcome')
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[data-testid="email"]', 'wrong@example.com')
    await page.fill('[data-testid="password"]', 'wrongpassword')
    await page.click('[data-testid="login-button"]')

    await expect(page.locator('[data-testid="error-message"]'))
      .toBeVisible()
  })
})
```

## Testing Best Practices

### Test Organization

```
src/
├── components/
│   ├── UserCard.vue
│   └── UserCard.test.ts      # Co-located test
├── composables/
│   ├── useAuth.ts
│   └── useAuth.test.ts       # Co-located test
├── stores/
│   ├── user.store.ts
│   └── user.store.test.ts    # Co-located test
└── test/
    ├── setup.ts              # Global test setup
    ├── utils.ts              # Test utilities
    └── mocks/
        └── handlers.ts       # MSW handlers
```

### Data-testid Attributes

```vue
<template>
  <div data-testid="user-card">
    <h2 data-testid="user-name">{{ user.name }}</h2>
    <button data-testid="edit-button" @click="handleEdit">Edit</button>
  </div>
</template>
```

### Coverage Requirements

| Metric | Minimum |
|--------|---------|
| Statements | 80% |
| Branches | 80% |
| Functions | 80% |
| Lines | 80% |

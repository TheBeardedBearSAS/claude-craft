# Estrategia de Testes React

## Piramide de Testes

```
              /\
             /  \
            / E2E\     <- Poucos testes, lentos, cobrem caminhos criticos
           /------\
          /        \
         /Integracao\ <- Testes de multiplos componentes juntos
        /------------\
       /              \
      /    Unitarios  \ <- Muitos testes, rapidos, isolados
     /------------------\
```

### Distribuicao Recomendada

- **70%**: Testes unitarios (componentes, hooks, utils)
- **20%**: Testes de integracao (funcionalidades completas)
- **10%**: Testes E2E (jornadas criticas do usuario)

## Vitest - Framework de Testes

### Instalacao

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event jsdom
npm install -D @vitest/coverage-v8
```

### Configuracao vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/types.ts',
        '**/*.d.ts',
        'vite.config.ts'
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### Arquivo de Setup (src/test/setup.ts)

```typescript
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Limpeza apos cada teste
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;
```

## Testes Unitarios - React Testing Library

### Teste de Componente Simples

```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('deve renderizar com children', () => {
    render(<Button>Clique aqui</Button>);

    expect(screen.getByRole('button', { name: /clique aqui/i })).toBeInTheDocument();
  });

  it('deve chamar onClick quando clicado', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Clique aqui</Button>);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('deve estar desabilitado quando prop disabled e true', () => {
    render(<Button disabled>Clique aqui</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('deve renderizar com a classe de variante correta', () => {
    render(<Button variant="primary">Clique aqui</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-primary');
  });

  it('deve mostrar estado de loading', () => {
    render(<Button isLoading>Clique aqui</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
```

### Teste de Componente com Estado

```typescript
// Counter.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Counter } from './Counter';

describe('Counter', () => {
  it('deve renderizar contador inicial', () => {
    render(<Counter initialCount={5} />);

    expect(screen.getByText('Contador: 5')).toBeInTheDocument();
  });

  it('deve incrementar contador ao clicar no botao incrementar', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={0} />);

    await user.click(screen.getByRole('button', { name: /incrementar/i }));

    expect(screen.getByText('Contador: 1')).toBeInTheDocument();
  });

  it('deve decrementar contador ao clicar no botao decrementar', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={5} />);

    await user.click(screen.getByRole('button', { name: /decrementar/i }));

    expect(screen.getByText('Contador: 4')).toBeInTheDocument();
  });

  it('deve resetar contador ao clicar no botao resetar', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={0} />);

    await user.click(screen.getByRole('button', { name: /incrementar/i }));
    await user.click(screen.getByRole('button', { name: /incrementar/i }));
    await user.click(screen.getByRole('button', { name: /resetar/i }));

    expect(screen.getByText('Contador: 0')).toBeInTheDocument();
  });
});
```

### Teste de Formulario

```typescript
// LoginForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('deve renderizar campos do formulario', () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('deve mostrar erros de validacao ao enviar formulario vazio', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/email e obrigatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/senha e obrigatoria/i)).toBeInTheDocument();
    });
  });

  it('deve mostrar erro para email invalido', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText(/email/i), 'email-invalido');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/email invalido/i)).toBeInTheDocument();
    });
  });

  it('deve chamar onSubmit com dados do formulario quando valido', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'usuario@exemplo.com');
    await user.type(screen.getByLabelText(/senha/i), 'senha123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'usuario@exemplo.com',
        password: 'senha123'
      });
    });
  });

  it('deve desabilitar botao de envio durante submissao', async () => {
    const handleSubmit = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));
    const user = userEvent.setup();

    render(<LoginForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'usuario@exemplo.com');
    await user.type(screen.getByLabelText(/senha/i), 'senha123');

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
```

## Testes de Hooks Personalizados

### @testing-library/react-hooks

```typescript
// useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('deve inicializar com valor padrao', () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);
  });

  it('deve inicializar com valor personalizado', () => {
    const { result } = renderHook(() => useCounter(10));

    expect(result.current.count).toBe(10);
  });

  it('deve incrementar contador', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('deve decrementar contador', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });

  it('deve resetar contador', () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });

    expect(result.current.count).toBe(0);
  });
});
```

### Teste de Hook com Dependencias

```typescript
// useAuth.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { authService } from '@/services/auth.service';

// Mock do servico
vi.mock('@/services/auth.service');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAuth', () => {
  it('deve fazer login com sucesso', async () => {
    const mockUser = { id: '1', email: 'usuario@exemplo.com' };
    vi.mocked(authService.login).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    result.current.login({ email: 'usuario@exemplo.com', password: 'senha' });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('deve tratar erro de login', async () => {
    const error = new Error('Credenciais invalidas');
    vi.mocked(authService.login).mockRejectedValue(error);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    result.current.login({ email: 'usuario@exemplo.com', password: 'errada' });

    await waitFor(() => {
      expect(result.current.error).toEqual(error);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  it('deve fazer logout com sucesso', async () => {
    const mockUser = { id: '1', email: 'usuario@exemplo.com' };
    vi.mocked(authService.login).mockResolvedValue(mockUser);
    vi.mocked(authService.logout).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    // Fazer login primeiro
    result.current.login({ email: 'usuario@exemplo.com', password: 'senha' });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Depois fazer logout
    result.current.logout();

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
```

## MSW (Mock Service Worker) - Mock de API

### Instalacao

```bash
npm install -D msw
```

### Configuracao (src/test/mocks/handlers.ts)

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // GET /api/users
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'Joao Silva', email: 'joao@exemplo.com' },
      { id: '2', name: 'Maria Santos', email: 'maria@exemplo.com' }
    ]);
  }),

  // GET /api/users/:id
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      name: 'Joao Silva',
      email: 'joao@exemplo.com'
    });
  }),

  // POST /api/users
  http.post('/api/users', async ({ request }) => {
    const newUser = await request.json();
    return HttpResponse.json(
      {
        id: '3',
        ...newUser
      },
      { status: 201 }
    );
  }),

  // PUT /api/users/:id
  http.put('/api/users/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();
    return HttpResponse.json({
      id,
      ...updates
    });
  }),

  // DELETE /api/users/:id
  http.delete('/api/users/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Tratamento de erro
  http.get('/api/error', () => {
    return new HttpResponse(null, { status: 500 });
  })
];
```

### Configuracao do Servidor (src/test/mocks/server.ts)

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Configuracao no setup.ts

```typescript
// src/test/setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

// Iniciar servidor antes de todos os testes
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Resetar handlers apos cada teste
afterEach(() => server.resetHandlers());

// Limpar apos todos os testes
afterAll(() => server.close());
```

### Uso nos Testes

```typescript
// UserList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { UserList } from './UserList';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('UserList', () => {
  it('deve exibir lista de usuarios', async () => {
    render(<UserList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Joao Silva')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    });
  });

  it('deve exibir estado de carregamento', () => {
    render(<UserList />, { wrapper: createWrapper() });

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro em caso de falha de busca', async () => {
    // Sobrescrever handler para este teste
    server.use(
      http.get('/api/users', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(<UserList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/erro/i)).toBeInTheDocument();
    });
  });

  it('deve exibir estado vazio quando nao ha usuarios', async () => {
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.json([]);
      })
    );

    render(<UserList />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/nenhum usuario encontrado/i)).toBeInTheDocument();
    });
  });
});
```

## Testes de Integracao

```typescript
// UserManagement.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserManagement } from '@/features/users/UserManagement';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('UserManagement Integration', () => {
  it('deve completar fluxo completo de criacao de usuario', async () => {
    const user = userEvent.setup();
    render(<UserManagement />, { wrapper: createWrapper() });

    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.getByText('Joao Silva')).toBeInTheDocument();
    });

    // Clicar no botao adicionar usuario
    await user.click(screen.getByRole('button', { name: /adicionar usuario/i }));

    // Preencher formulario
    await user.type(screen.getByLabelText(/nome/i), 'Novo Usuario');
    await user.type(screen.getByLabelText(/email/i), 'novo@exemplo.com');

    // Enviar
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    // Verificar que usuario foi adicionado
    await waitFor(() => {
      expect(screen.getByText('Novo Usuario')).toBeInTheDocument();
      expect(screen.getByText('novo@exemplo.com')).toBeInTheDocument();
    });
  });

  it('deve completar fluxo completo de edicao de usuario', async () => {
    const user = userEvent.setup();
    render(<UserManagement />, { wrapper: createWrapper() });

    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.getByText('Joao Silva')).toBeInTheDocument();
    });

    // Clicar em editar no primeiro usuario
    const editButtons = screen.getAllByRole('button', { name: /editar/i });
    await user.click(editButtons[0]);

    // Modificar nome
    const nameInput = screen.getByLabelText(/nome/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Nome Atualizado');

    // Enviar
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    // Verificar que usuario foi atualizado
    await waitFor(() => {
      expect(screen.getByText('Nome Atualizado')).toBeInTheDocument();
      expect(screen.queryByText('Joao Silva')).not.toBeInTheDocument();
    });
  });

  it('deve completar fluxo completo de exclusao de usuario', async () => {
    const user = userEvent.setup();
    render(<UserManagement />, { wrapper: createWrapper() });

    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.getByText('Joao Silva')).toBeInTheDocument();
    });

    // Clicar em excluir no primeiro usuario
    const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
    await user.click(deleteButtons[0]);

    // Confirmar exclusao
    await user.click(screen.getByRole('button', { name: /confirmar/i }));

    // Verificar que usuario foi excluido
    await waitFor(() => {
      expect(screen.queryByText('Joao Silva')).not.toBeInTheDocument();
    });
  });
});
```

## Playwright - Testes E2E

### Instalacao

```bash
npm install -D @playwright/test
npx playwright install
```

### Configuracao (playwright.config.ts)

```typescript
import { defineConfig, devices } from '@playwright/test';

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
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

### Exemplo de Teste E2E

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Autenticacao', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve fazer login com sucesso', async ({ page }) => {
    // Clicar no botao de login
    await page.click('text=Login');

    // Preencher formulario
    await page.fill('input[name="email"]', 'usuario@exemplo.com');
    await page.fill('input[name="password"]', 'senha123');

    // Enviar
    await page.click('button[type="submit"]');

    // Verificar redirecionamento para dashboard
    await expect(page).toHaveURL('/dashboard');

    // Verificar que usuario esta logado
    await expect(page.locator('text=Bem-vindo de volta')).toBeVisible();
  });

  test('deve mostrar erro com credenciais invalidas', async ({ page }) => {
    await page.click('text=Login');

    await page.fill('input[name="email"]', 'usuario@exemplo.com');
    await page.fill('input[name="password"]', 'senhaerrada');

    await page.click('button[type="submit"]');

    // Verificar mensagem de erro
    await expect(page.locator('text=Credenciais invalidas')).toBeVisible();

    // Verificar que ainda esta na pagina de login
    await expect(page).toHaveURL('/login');
  });

  test('deve fazer logout com sucesso', async ({ page }) => {
    // Fazer login primeiro
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'usuario@exemplo.com');
    await page.fill('input[name="password"]', 'senha123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');

    // Fazer logout
    await page.click('button[aria-label="Menu do usuario"]');
    await page.click('text=Logout');

    // Verificar redirecionamento para home
    await expect(page).toHaveURL('/');

    // Verificar que botao de login esta visivel
    await expect(page.locator('text=Login')).toBeVisible();
  });
});
```

## Utilitarios e Helpers de Teste

### Render Personalizado

```typescript
// src/test/utils/customRender.tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### Factories de Dados de Teste

```typescript
// src/test/factories/user.factory.ts
import { User } from '@/types/user.types';

export const createUser = (overrides?: Partial<User>): User => ({
  id: '1',
  name: 'Usuario de Teste',
  email: 'teste@exemplo.com',
  role: 'user',
  createdAt: new Date().toISOString(),
  ...overrides
});

export const createUsers = (count: number): User[] => {
  return Array.from({ length: count }, (_, i) =>
    createUser({
      id: String(i + 1),
      name: `Usuario ${i + 1}`,
      email: `usuario${i + 1}@exemplo.com`
    })
  );
};
```

## Organizacao de Testes

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       ├── Button.test.tsx         # Testes unitarios
│       └── Button.stories.tsx      # Storybook
│
├── features/
│   └── users/
│       ├── components/
│       │   └── UserList/
│       │       ├── UserList.tsx
│       │       └── UserList.test.tsx
│       ├── hooks/
│       │   └── useUsers.test.ts
│       └── UserManagement.integration.test.tsx  # Testes de integracao
│
├── test/
│   ├── setup.ts                    # Configuracao global
│   ├── mocks/
│   │   ├── handlers.ts             # Handlers MSW
│   │   └── server.ts               # Servidor MSW
│   ├── utils/
│   │   └── customRender.tsx        # Helpers de teste
│   └── factories/
│       └── user.factory.ts         # Factories de dados
│
└── e2e/                            # Testes E2E Playwright
    ├── auth.spec.ts
    ├── users.spec.ts
    └── dashboard.spec.ts
```

## Scripts de Teste

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

## Melhores Praticas

### 1. Padrao AAA (Arrange, Act, Assert)

```typescript
it('deve incrementar contador', async () => {
  // Arrange
  const user = userEvent.setup();
  render(<Counter initialCount={0} />);

  // Act
  await user.click(screen.getByRole('button', { name: /incrementar/i }));

  // Assert
  expect(screen.getByText('Contador: 1')).toBeInTheDocument();
});
```

### 2. Testar Comportamento do Usuario, Nao Implementacao

```typescript
// ❌ Ruim - Testa implementacao
it('deve chamar setState com count + 1', () => {
  const setStateSpy = vi.spyOn(React, 'useState');
  // ...
});

// ✅ Bom - Testa comportamento do usuario
it('deve exibir contador incrementado quando botao clicado', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  await user.click(screen.getByRole('button', { name: /incrementar/i }));

  expect(screen.getByText('Contador: 1')).toBeInTheDocument();
});
```

### 3. Prioridade de Queries

```typescript
// 1. Acessivel a todos (melhor)
screen.getByRole('button', { name: /enviar/i });
screen.getByLabelText(/email/i);
screen.getByPlaceholderText(/buscar/i);
screen.getByText(/bem-vindo/i);

// 2. Queries semanticas
screen.getByAltText(/foto de perfil/i);
screen.getByTitle(/fechar/i);

// 3. Test IDs (ultimo recurso)
screen.getByTestId('elemento-customizado');
```

## Conclusao

Uma estrategia de testes completa garante:

1. ✅ **Confianca**: Codigo funciona como esperado
2. ✅ **Documentacao**: Testes documentam comportamento
3. ✅ **Refatoracao**: Modificar sem quebrar
4. ✅ **Qualidade**: Detectar bugs cedo
5. ✅ **Regressao**: Prevenir regressoes

**Regra de ouro**: Escrever testes que testam comportamento do usuario, nao implementacao tecnica.

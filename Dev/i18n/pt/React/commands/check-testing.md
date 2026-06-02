---
description: Verificação da Estratégia de Testes
---

# Verificação da Estratégia de Testes

Verifique se a aplicação React possui cobertura de testes abrangente e segue as melhores práticas de teste.

## O Que Este Comando Faz

1. **Análise de Testes**
   - Verificar a cobertura de testes
   - Validar a qualidade dos testes
   - Confirmar os padrões de teste utilizados
   - Verificar a organização dos testes
   - Analisar o desempenho dos testes

2. **Métricas Medidas**
   - Cobertura de código (linhas, funções, branches)
   - Quantidade de testes por tipo (unitário, integração, e2e)
   - Tempo de execução dos testes
   - Detecção de testes instáveis (flaky tests)
   - Caminhos críticos sem cobertura

3. **Relatório Gerado**
   - Relatório de cobertura
   - Testes ausentes
   - Pontuação de qualidade dos testes
   - Recomendações

## Como Usar

```bash
# Executar todos os testes com cobertura
npm run test:coverage

# Modo observação
npm run test:watch

# Modo UI
npm run test:ui

# Testes E2E
npm run test:e2e
```

## Modo Plano

> O modo plano é ativado automaticamente quando o escopo abrange vários módulos ou exige investigação transversal.

## Análise de Cobertura de Testes

### Metas de Cobertura

```json
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/*.d.ts',
        'vite.config.ts'
      ]
    }
  }
});
```

### Verificar Cobertura

```bash
# Gerar relatório de cobertura
npm run test:coverage

# Visualizar relatório HTML
open coverage/index.html

# Verificar limite específico
npm run test:coverage -- --coverage.lines=90
```

## Tipos de Testes

### 1. Testes Unitários (70% dos testes)

```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('deve renderizar com texto', () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Clique aqui');
  });

  it('deve chamar onClick ao ser clicado', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Clique aqui</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('deve estar desabilitado quando a prop disabled for true', () => {
    render(<Button disabled>Clique aqui</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 2. Testes de Integração (20% dos testes)

```typescript
// UserManagement.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { UserManagement } from './UserManagement';

describe('Integração UserManagement', () => {
  it('deve concluir o fluxo completo de criação de usuário', async () => {
    const user = userEvent.setup();
    render(<UserManagement />);

    // Aguardar carregamento
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Clicar no botão adicionar
    await user.click(screen.getByRole('button', { name: /add user/i }));

    // Preencher formulário
    await user.type(screen.getByLabelText(/name/i), 'Novo Usuário');
    await user.type(screen.getByLabelText(/email/i), 'novo@example.com');

    // Enviar
    await user.click(screen.getByRole('button', { name: /save/i }));

    // Verificar
    await waitFor(() => {
      expect(screen.getByText('Novo Usuário')).toBeInTheDocument();
    });
  });
});
```

### 3. Testes E2E (10% dos testes)

```typescript
// auth.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test.describe('Autenticação', () => {
  test('deve fazer login com sucesso', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Login');

    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });
});
```

## Verificações de Qualidade dos Testes

### 1. Padrão AAA

```typescript
// ✅ BOM - Arrange, Act, Assert
it('deve incrementar o contador', async () => {
  // Arrange (Preparar)
  const user = userEvent.setup();
  render(<Counter initialCount={0} />);

  // Act (Agir)
  await user.click(screen.getByRole('button', { name: /increment/i }));

  // Assert (Verificar)
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### 2. Testar Comportamento, Não Implementação

```typescript
// ❌ RUIM - Testar implementação
it('deve chamar setState', () => {
  const setStateSpy = vi.spyOn(React, 'useState');
  // ...
});

// ✅ BOM - Testar comportamento
it('deve exibir o contador incrementado', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  await user.click(screen.getByRole('button', { name: /increment/i }));

  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### 3. Nomes de Teste Descritivos

```typescript
// ❌ RUIM - Nomes vagos
it('funciona');
it('teste 1');
it('deve renderizar');

// ✅ BOM - Nomes descritivos
it('deve exibir o nome do usuário quando os dados são carregados');
it('deve mostrar mensagem de erro quando o e-mail é inválido');
it('deve desabilitar o botão de envio enquanto o formulário está sendo submetido');
```

### 4. Prioridade de Consultas

```typescript
// ✅ BOM - Consultas acessíveis (melhor opção)
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);
screen.getByText(/welcome/i);

// ⚠️ OK - Consultas semânticas
screen.getByAltText(/profile/i);
screen.getByTitle(/close/i);

// ❌ EVITAR - IDs de teste (último recurso)
screen.getByTestId('custom-element');
```

## Organização dos Testes

### Estrutura de Pastas

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       ├── Button.test.tsx       # Testes unitários
│       └── Button.stories.tsx    # Storybook
│
├── features/
│   └── users/
│       ├── components/
│       │   └── UserList/
│       │       ├── UserList.tsx
│       │       └── UserList.test.tsx
│       ├── hooks/
│       │   └── useUsers.test.ts
│       └── UserManagement.integration.test.tsx  # Integração
│
├── test/
│   ├── setup.ts                  # Configuração dos testes
│   ├── mocks/
│   │   └── handlers.ts           # Handlers MSW
│   └── utils/
│       └── test-utils.tsx        # Utilitários de teste
│
└── e2e/                          # Testes E2E
    ├── auth.spec.ts
    └── users.spec.ts
```

### Utilitários de Teste

```typescript
// test/utils/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const AllProviders = ({ children }: { children: React.ReactNode }) => {
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

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
```

## Problemas Comuns em Testes

### Problema 1: Testes Instáveis (Flaky Tests)

```typescript
// ❌ RUIM - Condição de corrida
it('deve carregar dados', () => {
  render(<DataComponent />);
  expect(screen.getByText('Dados carregados')).toBeInTheDocument();
  // Falha aleatoriamente se os dados demoram a carregar
});

// ✅ BOM - Aguardar os dados
it('deve carregar dados', async () => {
  render(<DataComponent />);
  await waitFor(() => {
    expect(screen.getByText('Dados carregados')).toBeInTheDocument();
  });
});
```

### Problema 2: Avisos de Act Ausente

```typescript
// ❌ RUIM - Atualização de estado fora do act
it('deve atualizar o contador', () => {
  const { result } = renderHook(() => useCounter());
  result.current.increment(); // Aviso!
});

// ✅ BOM - Envolver no act
it('deve atualizar o contador', () => {
  const { result } = renderHook(() => useCounter());
  act(() => {
    result.current.increment();
  });
});
```

### Problema 3: Limpeza Não Realizada

```typescript
// ✅ BOM - Limpeza automática
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

## MSW (Mock Service Worker)

### Configuração

```typescript
// test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Smith' }
    ]);
  }),

  http.post('/api/users', async ({ request }) => {
    const newUser = await request.json();
    return HttpResponse.json({ id: '3', ...newUser }, { status: 201 });
  })
];

// test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Uso

```typescript
// test/setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Testes de Desempenho

```typescript
// Verificar desempenho de renderização
it('deve renderizar a lista de forma eficiente', () => {
  const start = performance.now();

  render(<LargeList items={items} />);

  const duration = performance.now() - start;
  expect(duration).toBeLessThan(100); // ms
});
```

## Relatórios de Teste

### Relatório de Cobertura

```bash
# Gerar relatório HTML
npm run test:coverage

# Visualizar relatório
open coverage/index.html

# CI: Enviar para o Codecov
bash <(curl -s https://codecov.io/bash)
```

### Resultados dos Testes no CI

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Instalar dependências
        run: npm ci

      - name: Executar testes
        run: npm run test:coverage

      - name: Enviar cobertura
        uses: codecov/codecov-action@v3
```

## Checklist de Testes

- [ ] Testes unitários para todos os componentes
- [ ] Testes unitários para todos os hooks
- [ ] Testes unitários para todos os utilitários
- [ ] Testes de integração para as features
- [ ] Testes E2E para os fluxos críticos
- [ ] Cobertura > 80%
- [ ] Sem testes instáveis (flaky tests)
- [ ] Testes rápidos (< 1s cada)
- [ ] MSW para simulação de API
- [ ] Utilitários de teste extraídos
- [ ] Testes seguem o padrão AAA
- [ ] Testes possuem nomes descritivos
- [ ] Testes utilizam consultas acessíveis

## Ferramentas

- **Vitest**: Executor de testes unitários
- **React Testing Library**: Testes de componentes
- **Playwright**: Testes E2E
- **MSW**: Simulação de API
- **Testing Library User Event**: Interações do usuário
- **Codecov**: Relatório de cobertura

## Recursos

- [React Testing Library](https://testing-library.com/react)
- [Documentação do Vitest](https://vitest.dev/)
- [Documentação do Playwright](https://playwright.dev/)
- [Documentação do MSW](https://mswjs.io/)
- [Melhores Práticas de Teste](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

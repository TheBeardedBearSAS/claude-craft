---
description: Verificação de Qualidade de Código
---

# Verificação de Qualidade de Código

Realize uma análise abrangente da qualidade de código da aplicação React.

## O Que Este Comando Faz

1. **Análise de Qualidade**
   - Executar linting (ESLint)
   - Verificação de tipos (TypeScript)
   - Formatação de código (Prettier)
   - Análise de complexidade
   - Detecção de code smells
   - Verificação de cobertura de testes

2. **Métricas Medidas**
   - Complexidade ciclomática
   - Duplicação de código
   - Cobertura de testes
   - Dívida técnica
   - Índice de manutenibilidade

3. **Relatório Gerado**
   - Pontuação de qualidade
   - Problemas por severidade
   - Recomendações de refatoração
   - Tendências ao longo do tempo

## Como Usar

```bash
# Verificação completa de qualidade
npm run quality

# Verificações individuais
npm run lint
npm run type-check
npm run format:check
npm run test:coverage
```

## Modo Plano

> O modo plano é ativado automaticamente quando o escopo abrange vários módulos ou exige investigação transversal.

## Verificações de Qualidade

### 1. Linting (ESLint)

```bash
# Verificar erros
npm run lint

# Corrigir erros automaticamente
npm run lint:fix
```

**Configuração**:
```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-debugger": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### 2. Verificação de Tipos (TypeScript)

```bash
# Verificar tipos
npm run type-check

# Modo observação
npm run type-check:watch
```

**Problemas Comuns**:
```typescript
// ❌ Ruim - Tipo any
const data: any = fetchData();

// ✅ Bom - Tipos adequados
interface User {
  id: string;
  name: string;
}
const data: User = fetchData();

// ❌ Ruim - any implícito
const handleClick = (event) => {};

// ✅ Bom - Tipos explícitos
const handleClick = (event: React.MouseEvent) => {};
```

### 3. Formatação de Código (Prettier)

```bash
# Verificar formatação
npm run format:check

# Formatar todos os arquivos
npm run format
```

**Configuração**:
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### 4. Análise de Complexidade

```typescript
// ❌ Ruim - Alta complexidade (10+)
function processUser(user, options) {
  if (user.isActive) {
    if (user.role === 'admin') {
      if (options.includeStats) {
        if (user.lastLogin) {
          // ... lógica aninhada
        }
      }
    }
  }
  // Complexidade: 15
}

// ✅ Bom - Baixa complexidade
function processUser(user, options) {
  if (!user.isActive) return null;
  if (user.role !== 'admin') return formatBasicUser(user);
  if (!options.includeStats) return formatAdminUser(user);
  return formatAdminUserWithStats(user);
  // Complexidade: 4
}
```

### 5. Duplicação de Código

```typescript
// ❌ Ruim - Código duplicado
export const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);
};

export const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);
};

// ✅ Bom - Hook reutilizável
export const useFetch = <T>(url: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading };
};
```

## Métricas de Qualidade de Código

### Complexidade Ciclomática

**Meta**: < 10 por função

```bash
# Instalar verificador de complexidade
npm install -D eslint-plugin-complexity

# Adicionar à configuração do ESLint
{
  "rules": {
    "complexity": ["error", 10]
  }
}
```

### Cobertura de Testes

**Metas**:
- Linhas: > 80%
- Funções: > 80%
- Branches: > 75%
- Declarações: > 80%

```bash
# Gerar relatório de cobertura
npm run test:coverage
```

```json
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80
    }
  }
});
```

### Duplicação de Código

**Meta**: < 3% de duplicação

```bash
# Instalar jscpd
npm install -D jscpd

# Executar verificação de duplicação
npx jscpd src/
```

## Portões de Qualidade

### Verificações de Pré-Commit

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "vitest related --run --passWithNoTests"
    ]
  }
}
```

### Portões de Qualidade no CI/CD

```yaml
# .github/workflows/quality.yml
name: Quality Check

on: [pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Instalar dependências
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Verificação de tipos
        run: npm run type-check

      - name: Verificação de formatação
        run: npm run format:check

      - name: Testes com cobertura
        run: npm run test:coverage

      - name: Verificar cobertura
        uses: codecov/codecov-action@v3
```

## Code Smells

### 1. Listas de Parâmetros Longas

```typescript
// ❌ Ruim - Muitos parâmetros
function createUser(
  name: string,
  email: string,
  age: number,
  address: string,
  phone: string,
  role: string
) {}

// ✅ Bom - Usar parâmetro de objeto
interface CreateUserParams {
  name: string;
  email: string;
  age: number;
  address: string;
  phone: string;
  role: string;
}

function createUser(params: CreateUserParams) {}
```

### 2. Funções Muito Longas

```typescript
// ❌ Ruim - Função muito longa (100+ linhas)
function handleSubmit() {
  // ... 100 linhas de código
}

// ✅ Bom - Dividir em funções menores
function handleSubmit() {
  validateForm();
  processData();
  submitToAPI();
}
```

### 3. Números Mágicos

```typescript
// ❌ Ruim - Números mágicos
if (user.age > 18 && cart.total > 100) {}

// ✅ Bom - Constantes nomeadas
const ADULT_AGE = 18;
const FREE_SHIPPING_THRESHOLD = 100;

if (user.age > ADULT_AGE && cart.total > FREE_SHIPPING_THRESHOLD) {}
```

### 4. Aninhamento Profundo

```typescript
// ❌ Ruim - Aninhamento profundo
if (user) {
  if (user.isActive) {
    if (user.role === 'admin') {
      if (hasPermission) {
        // ...
      }
    }
  }
}

// ✅ Bom - Guard clauses (cláusulas de guarda)
if (!user) return;
if (!user.isActive) return;
if (user.role !== 'admin') return;
if (!hasPermission) return;
// ...
```

## Integração com SonarQube

```bash
# Instalar o SonarScanner
npm install -D sonarqube-scanner

# Executar análise
npx sonar-scanner \
  -Dsonar.projectKey=my-project \
  -Dsonar.sources=src \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=your-token
```

## Melhoria Contínua

### Acompanhar Métricas ao Longo do Tempo

```json
// .qualityrc
{
  "metrics": {
    "complexity": {
      "current": 8,
      "target": 10,
      "trend": "improving"
    },
    "coverage": {
      "current": 85,
      "target": 80,
      "trend": "stable"
    },
    "duplication": {
      "current": 2,
      "target": 3,
      "trend": "improving"
    }
  }
}
```

### Dashboard de Qualidade

Crie um dashboard para visualizar:
- Tendências de cobertura de código
- Tendências de complexidade
- Número de problemas por severidade
- Estimativa da dívida técnica

## Ferramentas

- **ESLint**: Análise estática de código
- **TypeScript**: Verificação de tipos
- **Prettier**: Formatação de código
- **Vitest**: Cobertura de testes
- **SonarQube**: Plataforma de qualidade de código
- **jscpd**: Detecção de duplicação
- **Lighthouse**: Auditoria de desempenho

## Melhores Práticas

1. **Executar verificações localmente** antes de fazer push
2. **Automatizar no CI/CD** para impor padrões
3. **Definir portões de qualidade** que devem ser aprovados
4. **Monitorar tendências** ao longo do tempo
5. **Refatorar regularmente** para reduzir a dívida técnica
6. **Documentar padrões** para a equipe
7. **Revisar métricas** nas reuniões de equipe
8. **Celebrar melhorias**

## Recursos

- [Regras do ESLint](https://eslint.org/docs/rules/)
- [Manual do TypeScript](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Princípios de Código Limpo](https://github.com/ryanmcdermott/clean-code-javascript)
- [Refactoring Guru](https://refactoring.guru/)

# Code Quality Check

Perform a comprehensive code quality analysis of the React application.

## What This Command Does

1. **Quality Analysis**
   - Run linting (ESLint)
   - Type checking (TypeScript)
   - Code formatting (Prettier)
   - Complexity analysis
   - Code smells detection
   - Test coverage check

2. **Metrics Measured**
   - Cyclomatic complexity
   - Code duplication
   - Test coverage
   - Technical debt
   - Maintainability index

3. **Generated Report**
   - Quality score
   - Issues by severity
   - Refactoring recommendations
   - Trends over time

## How to Use

```bash
# Complete quality check
npm run quality

# Individual checks
npm run lint
npm run type-check
npm run format:check
npm run test:coverage
```

## Quality Checks

### 1. Linting (ESLint)

```bash
# Check for errors
npm run lint

# Auto-fix errors
npm run lint:fix
```

**Configuration**:
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

### 2. Type Checking (TypeScript)

```bash
# Check types
npm run type-check

# Watch mode
npm run type-check:watch
```

**Common Issues**:
```typescript
// ❌ Bad - Any type
const data: any = fetchData();

// ✅ Good - Proper types
interface User {
  id: string;
  name: string;
}
const data: User = fetchData();

// ❌ Bad - Implicit any
const handleClick = (event) => {};

// ✅ Good - Explicit types
const handleClick = (event: React.MouseEvent) => {};
```

### 3. Code Formatting (Prettier)

```bash
# Check formatting
npm run format:check

# Format all files
npm run format
```

**Configuration**:
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

### 4. Complexity Analysis

```typescript
// ❌ Bad - High complexity (10+)
function processUser(user, options) {
  if (user.isActive) {
    if (user.role === 'admin') {
      if (options.includeStats) {
        if (user.lastLogin) {
          // ... nested logic
        }
      }
    }
  }
  // Complexity: 15
}

// ✅ Good - Low complexity
function processUser(user, options) {
  if (!user.isActive) return null;
  if (user.role !== 'admin') return formatBasicUser(user);
  if (!options.includeStats) return formatAdminUser(user);
  return formatAdminUserWithStats(user);
  // Complexity: 4
}
```

### 5. Code Duplication

```typescript
// ❌ Bad - Duplicated code
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

// ✅ Good - Reusable hook
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

## Code Quality Metrics

### Cyclomatic Complexity

**Target**: < 10 per function

```bash
# Install complexity checker
npm install -D eslint-plugin-complexity

# Add to ESLint config
{
  "rules": {
    "complexity": ["error", 10]
  }
}
```

### Test Coverage

**Targets**:
- Lines: > 80%
- Functions: > 80%
- Branches: > 75%
- Statements: > 80%

```bash
# Generate coverage report
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

### Code Duplication

**Target**: < 3% duplication

```bash
# Install jscpd
npm install -D jscpd

# Run duplication check
npx jscpd src/
```

## Quality Gates

### Pre-Commit Checks

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

### CI/CD Quality Gates

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

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Format check
        run: npm run format:check

      - name: Test with coverage
        run: npm run test:coverage

      - name: Check coverage
        uses: codecov/codecov-action@v3
```

## Code Smells

### 1. Long Parameter Lists

```typescript
// ❌ Bad - Too many parameters
function createUser(
  name: string,
  email: string,
  age: number,
  address: string,
  phone: string,
  role: string
) {}

// ✅ Good - Use object parameter
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

### 2. Large Functions

```typescript
// ❌ Bad - Function too long (100+ lines)
function handleSubmit() {
  // ... 100 lines of code
}

// ✅ Good - Break down into smaller functions
function handleSubmit() {
  validateForm();
  processData();
  submitToAPI();
}
```

### 3. Magic Numbers

```typescript
// ❌ Bad - Magic numbers
if (user.age > 18 && cart.total > 100) {}

// ✅ Good - Named constants
const ADULT_AGE = 18;
const FREE_SHIPPING_THRESHOLD = 100;

if (user.age > ADULT_AGE && cart.total > FREE_SHIPPING_THRESHOLD) {}
```

### 4. Deep Nesting

```typescript
// ❌ Bad - Deep nesting
if (user) {
  if (user.isActive) {
    if (user.role === 'admin') {
      if (hasPermission) {
        // ...
      }
    }
  }
}

// ✅ Good - Guard clauses
if (!user) return;
if (!user.isActive) return;
if (user.role !== 'admin') return;
if (!hasPermission) return;
// ...
```

## SonarQube Integration

```bash
# Install SonarScanner
npm install -D sonarqube-scanner

# Run analysis
npx sonar-scanner \
  -Dsonar.projectKey=my-project \
  -Dsonar.sources=src \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=your-token
```

## Continuous Improvement

### Track Metrics Over Time

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

### Quality Dashboard

Create a dashboard to visualize:
- Code coverage trends
- Complexity trends
- Number of issues by severity
- Technical debt estimation

## Tools

- **ESLint**: Code linting
- **TypeScript**: Type checking
- **Prettier**: Code formatting
- **Vitest**: Test coverage
- **SonarQube**: Code quality platform
- **jscpd**: Duplication detection
- **Lighthouse**: Performance audit

## Best Practices

1. **Run checks locally** before pushing
2. **Automate in CI/CD** to enforce standards
3. **Set quality gates** that must pass
4. **Monitor trends** over time
5. **Refactor regularly** to reduce technical debt
6. **Document standards** for the team
7. **Review metrics** in team meetings
8. **Celebrate improvements**

## Resources

- [ESLint Rules](https://eslint.org/docs/rules/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)
- [Refactoring Guru](https://refactoring.guru/)

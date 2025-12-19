---
description: Verificacion de Calidad del Codigo
---

# Verificacion de Calidad del Codigo

Realiza un analisis exhaustivo de la calidad del codigo de la aplicacion React.

## Que Hace Este Comando

1. **Analisis de Calidad**
   - Ejecutar linting (ESLint)
   - Verificacion de tipos (TypeScript)
   - Formato de codigo (Prettier)
   - Analisis de complejidad
   - Deteccion de code smells
   - Verificacion de cobertura de tests

2. **Metricas Medidas**
   - Complejidad ciclomatica
   - Duplicacion de codigo
   - Cobertura de tests
   - Deuda tecnica
   - Indice de mantenibilidad

3. **Informe Generado**
   - Puntuacion de calidad
   - Problemas por severidad
   - Recomendaciones de refactorizacion
   - Tendencias en el tiempo

## Como Usar

```bash
# Verificacion completa de calidad
npm run quality

# Verificaciones individuales
npm run lint
npm run type-check
npm run format:check
npm run test:coverage
```

## Verificaciones de Calidad

### 1. Linting (ESLint)

```bash
# Verificar errores
npm run lint

# Corregir errores automaticamente
npm run lint:fix
```

**Configuracion**:
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

### 2. Verificacion de Tipos (TypeScript)

```bash
# Verificar tipos
npm run type-check

# Modo watch
npm run type-check:watch
```

**Problemas Comunes**:
```typescript
// ❌ Mal - Tipo any
const data: any = fetchData();

// ✅ Bien - Tipos apropiados
interface User {
  id: string;
  name: string;
}
const data: User = fetchData();

// ❌ Mal - Any implicito
const handleClick = (event) => {};

// ✅ Bien - Tipos explicitos
const handleClick = (event: React.MouseEvent) => {};
```

### 3. Formato de Codigo (Prettier)

```bash
# Verificar formato
npm run format:check

# Formatear todos los archivos
npm run format
```

**Configuracion**:
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

### 4. Analisis de Complejidad

```typescript
// ❌ Mal - Alta complejidad (10+)
function processUser(user, options) {
  if (user.isActive) {
    if (user.role === 'admin') {
      if (options.includeStats) {
        if (user.lastLogin) {
          // ... logica anidada
        }
      }
    }
  }
  // Complejidad: 15
}

// ✅ Bien - Baja complejidad
function processUser(user, options) {
  if (!user.isActive) return null;
  if (user.role !== 'admin') return formatBasicUser(user);
  if (!options.includeStats) return formatAdminUser(user);
  return formatAdminUserWithStats(user);
  // Complejidad: 4
}
```

### 5. Duplicacion de Codigo

```typescript
// ❌ Mal - Codigo duplicado
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

// ✅ Bien - Hook reutilizable
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

## Metricas de Calidad del Codigo

### Complejidad Ciclomatica

**Objetivo**: < 10 por funcion

```bash
# Instalar verificador de complejidad
npm install -D eslint-plugin-complexity

# Anadir a configuracion ESLint
{
  "rules": {
    "complexity": ["error", 10]
  }
}
```

### Cobertura de Tests

**Objetivos**:
- Lineas: > 80%
- Funciones: > 80%
- Ramas: > 75%
- Sentencias: > 80%

```bash
# Generar reporte de cobertura
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

### Duplicacion de Codigo

**Objetivo**: < 3% de duplicacion

```bash
# Instalar jscpd
npm install -D jscpd

# Ejecutar verificacion de duplicacion
npx jscpd src/
```

## Puertas de Calidad

### Verificaciones Pre-Commit

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

### Puertas de Calidad CI/CD

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

### 1. Listas Largas de Parametros

```typescript
// ❌ Mal - Demasiados parametros
function createUser(
  name: string,
  email: string,
  age: number,
  address: string,
  phone: string,
  role: string
) {}

// ✅ Bien - Usar parametro objeto
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

### 2. Funciones Grandes

```typescript
// ❌ Mal - Funcion demasiado larga (100+ lineas)
function handleSubmit() {
  // ... 100 lineas de codigo
}

// ✅ Bien - Dividir en funciones pequenas
function handleSubmit() {
  validateForm();
  processData();
  submitToAPI();
}
```

### 3. Numeros Magicos

```typescript
// ❌ Mal - Numeros magicos
if (user.age > 18 && cart.total > 100) {}

// ✅ Bien - Constantes nombradas
const ADULT_AGE = 18;
const FREE_SHIPPING_THRESHOLD = 100;

if (user.age > ADULT_AGE && cart.total > FREE_SHIPPING_THRESHOLD) {}
```

### 4. Anidamiento Profundo

```typescript
// ❌ Mal - Anidamiento profundo
if (user) {
  if (user.isActive) {
    if (user.role === 'admin') {
      if (hasPermission) {
        // ...
      }
    }
  }
}

// ✅ Bien - Clausulas de guardia
if (!user) return;
if (!user.isActive) return;
if (user.role !== 'admin') return;
if (!hasPermission) return;
// ...
```

## Integracion SonarQube

```bash
# Instalar SonarScanner
npm install -D sonarqube-scanner

# Ejecutar analisis
npx sonar-scanner \
  -Dsonar.projectKey=my-project \
  -Dsonar.sources=src \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=your-token
```

## Mejora Continua

### Seguimiento de Metricas a lo Largo del Tiempo

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

### Panel de Calidad

Crear un panel para visualizar:
- Tendencias de cobertura de codigo
- Tendencias de complejidad
- Numero de problemas por severidad
- Estimacion de deuda tecnica

## Herramientas

- **ESLint**: Linting de codigo
- **TypeScript**: Verificacion de tipos
- **Prettier**: Formato de codigo
- **Vitest**: Cobertura de tests
- **SonarQube**: Plataforma de calidad de codigo
- **jscpd**: Deteccion de duplicacion
- **Lighthouse**: Auditoria de rendimiento

## Mejores Practicas

1. **Ejecutar verificaciones localmente** antes de hacer push
2. **Automatizar en CI/CD** para forzar estandares
3. **Establecer puertas de calidad** que deben pasar
4. **Monitorear tendencias** a lo largo del tiempo
5. **Refactorizar regularmente** para reducir deuda tecnica
6. **Documentar estandares** para el equipo
7. **Revisar metricas** en reuniones de equipo
8. **Celebrar mejoras**

## Recursos

- [Reglas ESLint](https://eslint.org/docs/rules/)
- [Manual de TypeScript](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Principios de Codigo Limpio](https://github.com/ryanmcdermott/clean-code-javascript)
- [Refactoring Guru](https://refactoring.guru/)

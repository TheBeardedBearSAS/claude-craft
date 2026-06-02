---
description: Code-Qualitätsprüfung
---

# Code-Qualitätsprüfung

Eine umfassende Code-Qualitätsanalyse der React-Anwendung durchführen.

## Was dieser Befehl tut

1. **Qualitätsanalyse**
   - Linting ausführen (ESLint)
   - Typprüfung (TypeScript)
   - Code-Formatierung (Prettier)
   - Komplexitätsanalyse
   - Code-Smells-Erkennung
   - Test-Coverage-Prüfung

2. **Gemessene Metriken**
   - Zyklomatische Komplexität
   - Code-Duplikation
   - Test-Coverage
   - Technische Schuld
   - Wartbarkeitsindex

3. **Generierter Bericht**
   - Qualitätspunktzahl
   - Probleme nach Schweregrad
   - Refactoring-Empfehlungen
   - Entwicklungstrends im Zeitverlauf

## Verwendung

```bash
# Vollständige Qualitätsprüfung
npm run quality

# Einzelne Prüfungen
npm run lint
npm run type-check
npm run format:check
npm run test:coverage
```

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## Qualitätsprüfungen

### 1. Linting (ESLint)

```bash
# Auf Fehler prüfen
npm run lint

# Fehler automatisch beheben
npm run lint:fix
```

**Konfiguration**:
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

### 2. Typprüfung (TypeScript)

```bash
# Typen prüfen
npm run type-check

# Watch-Modus
npm run type-check:watch
```

**Häufige Probleme**:
```typescript
// ❌ Schlecht - Any-Typ
const data: any = fetchData();

// ✅ Gut - Korrekte Typen
interface User {
  id: string;
  name: string;
}
const data: User = fetchData();

// ❌ Schlecht - Implizites Any
const handleClick = (event) => {};

// ✅ Gut - Explizite Typen
const handleClick = (event: React.MouseEvent) => {};
```

### 3. Code-Formatierung (Prettier)

```bash
# Formatierung prüfen
npm run format:check

# Alle Dateien formatieren
npm run format
```

**Konfiguration**:
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

### 4. Komplexitätsanalyse

```typescript
// ❌ Schlecht - Hohe Komplexität (10+)
function processUser(user, options) {
  if (user.isActive) {
    if (user.role === 'admin') {
      if (options.includeStats) {
        if (user.lastLogin) {
          // ... verschachtelte Logik
        }
      }
    }
  }
  // Komplexität: 15
}

// ✅ Gut - Niedrige Komplexität
function processUser(user, options) {
  if (!user.isActive) return null;
  if (user.role !== 'admin') return formatBasicUser(user);
  if (!options.includeStats) return formatAdminUser(user);
  return formatAdminUserWithStats(user);
  // Komplexität: 4
}
```

### 5. Code-Duplikation

```typescript
// ❌ Schlecht - Duplizierter Code
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

// ✅ Gut - Wiederverwendbarer Hook
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

## Code-Qualitätsmetriken

### Zyklomatische Komplexität

**Ziel**: < 10 pro Funktion

```bash
# Komplexitätsprüfer installieren
npm install -D eslint-plugin-complexity

# Zu ESLint-Konfiguration hinzufügen
{
  "rules": {
    "complexity": ["error", 10]
  }
}
```

### Test-Coverage

**Ziele**:
- Zeilen: > 80%
- Funktionen: > 80%
- Branches: > 75%
- Anweisungen: > 80%

```bash
# Coverage-Bericht generieren
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

### Code-Duplikation

**Ziel**: < 3% Duplikation

```bash
# jscpd installieren
npm install -D jscpd

# Duplikationsprüfung ausführen
npx jscpd src/
```

## Quality Gates

### Pre-Commit-Prüfungen

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
name: Qualitätsprüfung

on: [pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Abhängigkeiten installieren
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typprüfung
        run: npm run type-check

      - name: Formatierungsprüfung
        run: npm run format:check

      - name: Tests mit Coverage
        run: npm run test:coverage

      - name: Coverage prüfen
        uses: codecov/codecov-action@v3
```

## Code-Smells

### 1. Lange Parameterlisten

```typescript
// ❌ Schlecht - Zu viele Parameter
function createUser(
  name: string,
  email: string,
  age: number,
  address: string,
  phone: string,
  role: string
) {}

// ✅ Gut - Objekt-Parameter verwenden
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

### 2. Große Funktionen

```typescript
// ❌ Schlecht - Funktion zu lang (100+ Zeilen)
function handleSubmit() {
  // ... 100 Zeilen Code
}

// ✅ Gut - In kleinere Funktionen aufteilen
function handleSubmit() {
  validateForm();
  processData();
  submitToAPI();
}
```

### 3. Magic Numbers

```typescript
// ❌ Schlecht - Magic Numbers
if (user.age > 18 && cart.total > 100) {}

// ✅ Gut - Benannte Konstanten
const ADULT_AGE = 18;
const FREE_SHIPPING_THRESHOLD = 100;

if (user.age > ADULT_AGE && cart.total > FREE_SHIPPING_THRESHOLD) {}
```

### 4. Tiefe Verschachtelung

```typescript
// ❌ Schlecht - Tiefe Verschachtelung
if (user) {
  if (user.isActive) {
    if (user.role === 'admin') {
      if (hasPermission) {
        // ...
      }
    }
  }
}

// ✅ Gut - Guard Clauses
if (!user) return;
if (!user.isActive) return;
if (user.role !== 'admin') return;
if (!hasPermission) return;
// ...
```

## SonarQube-Integration

```bash
# SonarScanner installieren
npm install -D sonarqube-scanner

# Analyse ausführen
npx sonar-scanner \
  -Dsonar.projectKey=mein-projekt \
  -Dsonar.sources=src \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=ihr-token
```

## Kontinuierliche Verbesserung

### Metriken über Zeit verfolgen

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

### Qualitäts-Dashboard

Ein Dashboard erstellen, um Folgendes zu visualisieren:
- Entwicklung der Code-Coverage
- Komplexitätstrends
- Anzahl der Probleme nach Schweregrad
- Schätzung der technischen Schuld

## Tools

- **ESLint**: Code-Linting
- **TypeScript**: Typprüfung
- **Prettier**: Code-Formatierung
- **Vitest**: Test-Coverage
- **SonarQube**: Code-Qualitätsplattform
- **jscpd**: Duplikationserkennung
- **Lighthouse**: Performance-Audit

## Best Practices

1. **Prüfungen lokal ausführen** vor dem Pushen
2. **Im CI/CD automatisieren** zur Durchsetzung von Standards
3. **Quality Gates setzen** die bestanden werden müssen
4. **Trends überwachen** im Laufe der Zeit
5. **Regelmäßig refaktorieren** um technische Schuld zu reduzieren
6. **Standards dokumentieren** für das Team
7. **Metriken in Teambesprechungen** überprüfen
8. **Verbesserungen feiern**

## Ressourcen

- [ESLint-Regeln](https://eslint.org/docs/rules/)
- [TypeScript-Handbuch](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Clean Code Prinzipien](https://github.com/ryanmcdermott/clean-code-javascript)
- [Refactoring Guru](https://refactoring.guru/)

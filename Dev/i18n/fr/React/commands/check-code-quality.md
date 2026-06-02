---
description: Vérification de la Qualité du Code
---

# Vérification de la Qualité du Code

Effectue une analyse complète de la qualité du code de l'application React.

## Ce que fait cette commande

1. **Analyse de Qualité**
   - Lancer le linting (ESLint)
   - Vérification des types (TypeScript)
   - Formatage du code (Prettier)
   - Analyse de la complexité
   - Détection des odeurs de code
   - Vérification de la couverture de tests

2. **Métriques Mesurées**
   - Complexité cyclomatique
   - Duplication de code
   - Couverture de tests
   - Dette technique
   - Indice de maintenabilité

3. **Rapport Généré**
   - Score de qualité
   - Problèmes par sévérité
   - Recommandations de refactoring
   - Tendances dans le temps

## Comment Utiliser

```bash
# Vérification complète de qualité
npm run quality

# Vérifications individuelles
npm run lint
npm run type-check
npm run format:check
npm run test:coverage
```

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## Vérifications de Qualité

### 1. Linting (ESLint)

```bash
# Vérifier les erreurs
npm run lint

# Corriger automatiquement les erreurs
npm run lint:fix
```

**Configuration** :
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

### 2. Vérification des Types (TypeScript)

```bash
# Vérifier les types
npm run type-check

# Mode watch
npm run type-check:watch
```

**Configuration TypeScript** :

**Score sur 25 points :**
- Configuration TypeScript : 6 points (tsconfig strict, noImplicitAny, strictNullChecks)
- Qualité du typage : 7 points (interfaces, génériques, discriminated unions)
- Configuration ESLint : 4 points
- Code style : 4 points
- Conventions de nommage : 4 points

**Problèmes Courants** :
```typescript
// ❌ Mauvais - Type any
const data: any = fetchData();

// ✅ Bon - Types appropriés
interface User {
  id: string;
  name: string;
}
const data: User = fetchData();

// ❌ Mauvais - any implicite
const handleClick = (event) => {};

// ✅ Bon - Types explicites
const handleClick = (event: React.MouseEvent) => {};
```

### 3. Formatage du Code (Prettier)

```bash
# Vérifier le formatage
npm run format:check

# Formater tous les fichiers
npm run format
```

**Configuration** :
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

### 4. Analyse de Complexité

```typescript
// ❌ Mauvais - Complexité élevée (10+)
function processUser(user, options) {
  if (user.isActive) {
    if (user.role === 'admin') {
      if (options.includeStats) {
        if (user.lastLogin) {
          // ... logique imbriquée
        }
      }
    }
  }
  // Complexité : 15
}

// ✅ Bon - Faible complexité
function processUser(user, options) {
  if (!user.isActive) return null;
  if (user.role !== 'admin') return formatBasicUser(user);
  if (!options.includeStats) return formatAdminUser(user);
  return formatAdminUserWithStats(user);
  // Complexité : 4
}
```

### 5. Duplication de Code

```typescript
// ❌ Mauvais - Code dupliqué
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

// ✅ Bon - Hook réutilisable
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

## Métriques de Qualité du Code

### Complexité Cyclomatique

**Objectif** : < 10 par fonction

```bash
# Installer le vérificateur de complexité
npm install -D eslint-plugin-complexity

# Ajouter à la config ESLint
{
  "rules": {
    "complexity": ["error", 10]
  }
}
```

### Couverture de Tests

**Objectifs** :
- Lignes : > 80%
- Fonctions : > 80%
- Branches : > 75%
- Instructions : > 80%

```bash
# Générer le rapport de couverture
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

### Duplication de Code

**Objectif** : < 3% de duplication

```bash
# Installer jscpd
npm install -D jscpd

# Lancer la vérification de duplication
npx jscpd src/
```

## Portes de Qualité

### Vérifications Pré-Commit

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

### Portes de Qualité CI/CD

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

## Odeurs de Code

### 1. Longues Listes de Paramètres

```typescript
// ❌ Mauvais - Trop de paramètres
function createUser(
  name: string,
  email: string,
  age: number,
  address: string,
  phone: string,
  role: string
) {}

// ✅ Bon - Utiliser un paramètre objet
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

### 2. Grandes Fonctions

```typescript
// ❌ Mauvais - Fonction trop longue (100+ lignes)
function handleSubmit() {
  // ... 100 lignes de code
}

// ✅ Bon - Décomposer en fonctions plus petites
function handleSubmit() {
  validateForm();
  processData();
  submitToAPI();
}
```

### 3. Nombres Magiques

```typescript
// ❌ Mauvais - Nombres magiques
if (user.age > 18 && cart.total > 100) {}

// ✅ Bon - Constantes nommées
const ADULT_AGE = 18;
const FREE_SHIPPING_THRESHOLD = 100;

if (user.age > ADULT_AGE && cart.total > FREE_SHIPPING_THRESHOLD) {}
```

### 4. Imbrication Profonde

```typescript
// ❌ Mauvais - Imbrication profonde
if (user) {
  if (user.isActive) {
    if (user.role === 'admin') {
      if (hasPermission) {
        // ...
      }
    }
  }
}

// ✅ Bon - Guard clauses
if (!user) return;
if (!user.isActive) return;
if (user.role !== 'admin') return;
if (!hasPermission) return;
// ...
```

## Intégration SonarQube

```bash
# Installer SonarScanner
npm install -D sonarqube-scanner

# Lancer l'analyse
npx sonar-scanner \
  -Dsonar.projectKey=my-project \
  -Dsonar.sources=src \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=your-token
```

## Rapport de Conformité

```
═══════════════════════════════════════════════════
💎 AUDIT QUALITÉ DU CODE REACT
═══════════════════════════════════════════════════

📊 SCORE GLOBAL : XX/25

🔷 TYPESCRIPT CONFIGURATION : XX/6
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

📝 QUALITÉ DU TYPAGE : XX/7
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

Exemples de problèmes détectés :
• Fichier : path/to/file.tsx:42
  Problème : Utilisation de 'any' sans justification
  Suggestion : Définir une interface explicite

🔧 ESLINT & FORMATTING : XX/4
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

✨ CODE STYLE : XX/4
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

🏷️  CONVENTIONS DE NOMMAGE : XX/4
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

Exemples de violations :
• get_user_data() → devrait être getUserData()
• MyComponent.tsx contient plusieurs composants
• Constantes en camelCase au lieu de UPPER_CASE

═══════════════════════════════════════════════════
🎯 TOP 3 ACTIONS PRIORITAIRES
═══════════════════════════════════════════════════

1. [Priorité HAUTE] ...
2. [Priorité HAUTE] ...
3. [Priorité MOYENNE] ...

═══════════════════════════════════════════════════
📚 RÉFÉRENCES
═══════════════════════════════════════════════════

• rules/03-coding-standards.md - Standards de code
• rules/04-solid-principles.md - Principes SOLID
• rules/05-kiss-dry-yagni.md - Principes de simplicité
• rules/08-quality-tools.md - Outils de qualité
```

## Amélioration Continue

### Suivi des Métriques dans le Temps

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

### Tableau de Bord Qualité

Créer un tableau de bord pour visualiser :
- Tendances de la couverture de code
- Tendances de la complexité
- Nombre de problèmes par sévérité
- Estimation de la dette technique

## Métriques de Qualité Calculées

Calculer et afficher :
- Pourcentage de fichiers avec strict mode TypeScript
- Nombre de `any` détectés vs types explicites
- Taux de conformité ESLint
- Nombre de fichiers non formatés par Prettier
- Complexité cyclomatique moyenne
- Dette technique estimée (en heures de refactoring)

## Outils

- **ESLint** : Linting du code
- **TypeScript** : Vérification des types
- **Prettier** : Formatage du code
- **Vitest** : Couverture de tests
- **SonarQube** : Plateforme de qualité du code
- **jscpd** : Détection de duplication
- **Lighthouse** : Audit de performance

## Bonnes Pratiques

1. **Lancer les vérifications localement** avant de pousser
2. **Automatiser en CI/CD** pour appliquer les standards
3. **Définir des portes de qualité** qui doivent passer
4. **Surveiller les tendances** dans le temps
5. **Refactoriser régulièrement** pour réduire la dette technique
6. **Documenter les standards** pour l'équipe
7. **Revoir les métriques** en réunion d'équipe
8. **Célébrer les améliorations**

## Ressources

- [ESLint Rules](https://eslint.org/docs/rules/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)
- [Refactoring Guru](https://refactoring.guru/)

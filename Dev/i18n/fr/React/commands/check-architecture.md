---
description: Vérification de la Conformité Architecturale
---

# Vérification de la Conformité Architecturale

Vérifie que le projet suit les patterns architecturaux établis et les meilleures pratiques.

## Ce que fait cette commande

1. **Analyse Architecturale**
   - Vérifier la structure des dossiers
   - Contrôler la séparation des responsabilités
   - Valider l'organisation des composants
   - Vérifier les directions de dépendance
   - Vérifier les patterns de conception

2. **Points de Vérification**
   - Structure orientée fonctionnalités (feature-based)
   - Hiérarchie des composants
   - Gestion d'état
   - Séparation de la couche API
   - Définitions de types

3. **Rapport Généré**
   - Violations architecturales
   - Recommandations
   - Opportunités de refactoring
   - Score de conformité

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## Architecture Attendue

### Structure des Dossiers

```
src/
├── app/                    # Configuration de l'application
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers.tsx
│
├── features/              # Fonctionnalités (logique métier)
│   └── users/
│       ├── components/    # Composants spécifiques à la feature
│       ├── hooks/         # Hooks spécifiques à la feature
│       ├── services/      # Appels API
│       ├── stores/        # Gestion d'état
│       ├── types/         # Types TypeScript
│       └── utils/         # Fonctions utilitaires
│
├── components/            # Composants partagés
│   ├── ui/               # Primitives UI (Button, Input)
│   ├── layout/           # Composants de mise en page
│   └── common/           # Composants communs
│
├── hooks/                 # Hooks partagés
├── services/             # Services partagés
├── stores/               # État global
├── types/                # Types globaux
├── utils/                # Fonctions utilitaires
├── constants/            # Constantes
└── config/               # Configuration
```

## Ce qu'il faut Vérifier

### 1. Organisation des Composants

```typescript
// ❌ Mauvais - Tout dans un seul fichier
src/components/UserList.tsx (1000 lignes)

// ✅ Bon - Organisation appropriée
src/features/users/
  ├── components/
  │   ├── UserList/
  │   │   ├── UserList.tsx
  │   │   ├── UserList.test.tsx
  │   │   ├── UserListItem.tsx
  │   │   └── index.ts
  │   └── UserForm/
  │       ├── UserForm.tsx
  │       └── UserForm.test.tsx
  ├── hooks/
  │   └── useUsers.ts
  └── services/
      └── user.service.ts
```

### 2. Séparation des Responsabilités

```typescript
// ❌ Mauvais - Responsabilités mélangées
export const UserList: FC = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers);
  }, []);

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
};

// ✅ Bon - Responsabilités séparées
// hooks/useUsers.ts
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll()
  });
};

// services/user.service.ts
export const userService = {
  getAll: () => apiClient.get<User[]>('/users')
};

// components/UserList.tsx
export const UserList: FC = () => {
  const { data: users, isLoading } = useUsers();

  if (isLoading) return <Spinner />;

  return (
    <ul>
      {users?.map(user => (
        <UserListItem key={user.id} user={user} />
      ))}
    </ul>
  );
};
```

### 3. Direction des Dépendances

```typescript
// ✅ Bon - Les dépendances vont vers l'intérieur
features/users/
  └── components/     → Peut utiliser hooks/
      └── hooks/      → Peut utiliser services/
          └── services/ → Peut utiliser utils/

// ❌ Mauvais - Dépendances circulaires
services/user.service.ts importe depuis components/
```

### 4. Types de Composants

```typescript
// Composants de Présentation (UI uniquement)
export const Button: FC<ButtonProps> = ({ children, ...props }) => {
  return <button {...props}>{children}</button>;
};

// Composants Conteneurs (logique)
export const UserListContainer: FC = () => {
  const { data: users } = useUsers();
  const deleteUser = useDeleteUser();

  return <UserListPresenter users={users} onDelete={deleteUser} />;
};

// Composants de Page (routage)
export const UsersPage: FC = () => {
  return (
    <MainLayout>
      <PageHeader title="Users" />
      <UserListContainer />
    </MainLayout>
  );
};
```

### 5. Gestion d'État

```typescript
// ❌ Mauvais - État dupliqué en plusieurs endroits
const [users, setUsers] = useState([]);
// Mêmes données dans 5 composants différents

// ✅ Bon - État centralisé
// stores/userStore.ts
export const useUserStore = create<UserStore>((set) => ({
  users: [],
  setUsers: (users) => set({ users })
}));

// Ou React Query pour l'état serveur
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll()
  });
};
```

## Patterns Architecturaux

### 1. Structure Orientée Fonctionnalités

```
src/features/
├── auth/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── stores/
├── users/
└── products/
```

### 2. Couches de Clean Architecture

```
Couche Présentation (Composants)
    ↓
Couche Logique Métier (Hooks, Services)
    ↓
Couche Données (API, Store)
```

### 3. Atomic Design

```
src/components/
├── atoms/        # Button, Input, Label
├── molecules/    # FormField, SearchBar
├── organisms/    # UserForm, Header
├── templates/    # PageLayout, DashboardLayout
└── pages/        # HomePage, UsersPage
```

## Règles de Validation

### Règle 1 : Pas de Logique Métier dans les Composants

```typescript
// ❌ Mauvais
export const UserForm: FC = () => {
  const [email, setEmail] = useState('');

  const validate = () => {
    return email.includes('@') && email.length > 5;
  };

  // ... logique de validation complexe
};

// ✅ Bon
export const UserForm: FC = () => {
  const form = useForm({
    resolver: zodResolver(userSchema)
  });

  // Validation dans le schéma, logique dans le hook
};
```

### Règle 2 : Appels API via les Services

```typescript
// ❌ Mauvais - fetch direct dans le composant
const response = await fetch('/api/users');

// ✅ Bon - Via le service
const users = await userService.getAll();
```

### Règle 3 : Types Centralisés

```typescript
// ✅ Bonne structure
src/features/users/types/
  ├── user.types.ts
  ├── dto.types.ts
  └── index.ts
```

## Vérifications Automatisées

### Règles ESLint pour l'Architecture

```json
// .eslintrc.json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["../**/features/*"],
            "message": "Les features ne doivent pas importer d'autres features"
          },
          {
            "group": ["**/components/**/services/*"],
            "message": "Les composants ne doivent pas importer les services directement"
          }
        ]
      }
    ]
  }
}
```

### Script Personnalisé

```typescript
// scripts/check-architecture.ts
import { glob } from 'glob';
import { readFile } from 'fs/promises';

const checkImports = async () => {
  const files = await glob('src/**/*.{ts,tsx}');
  const violations = [];

  for (const file of files) {
    const content = await readFile(file, 'utf-8');

    // Vérifier les violations
    if (file.includes('/components/') && content.includes('fetch(')) {
      violations.push({
        file,
        rule: 'Pas d\'appels API directs dans les composants',
        line: content.split('\n').findIndex(l => l.includes('fetch('))
      });
    }
  }

  return violations;
};
```

## Rapport de Conformité

```
═══════════════════════════════════════════════════
🏗️  AUDIT ARCHITECTURE REACT
═══════════════════════════════════════════════════

📊 SCORE GLOBAL : XX/25

📁 ORGANISATION DES DOSSIERS : XX/8
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

⚛️  ATOMIC DESIGN : XX/7
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

🎯 STRUCTURE DES FEATURES : XX/5
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

🔄 GESTION D'ÉTAT : XX/5
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

═══════════════════════════════════════════════════
🎯 TOP 3 ACTIONS PRIORITAIRES
═══════════════════════════════════════════════════

1. [Priorité HAUTE] ...
2. [Priorité HAUTE] ...
3. [Priorité MOYENNE] ...

═══════════════════════════════════════════════════
📚 RÉFÉRENCES
═══════════════════════════════════════════════════

• rules/02-architecture.md - Standards architecturaux
• rules/03-coding-standards.md - Conventions de code
```

## Bonnes Pratiques

1. **Isolation des features** : Chaque feature est autonome
2. **Frontières claires** : Couches présentation, logique, données
3. **Injection de dépendances** : Services via hooks/context
4. **Sécurité des types** : TypeScript partout
5. **Nommage cohérent** : Respecter les conventions
6. **Responsabilité unique** : Un composant, une tâche
7. **Composition plutôt qu'héritage** : Utiliser la composition
8. **Documentation** : Documenter les décisions architecturales

## Violations Courantes

### Violation 1 : Composants Dieux

**Problème** : Le composant fait trop de choses
**Solution** : Décomposer en composants plus petits

### Violation 2 : Dépendances Circulaires

**Problème** : A importe B, B importe A
**Solution** : Extraire le code commun ou repenser la structure

### Violation 3 : Prop Drilling

**Problème** : Passage de props à travers de nombreux niveaux
**Solution** : Utiliser le Context ou la gestion d'état

### Violation 4 : Responsabilités Mélangées

**Problème** : UI et logique métier mélangées
**Solution** : Séparer en composant présentateur et conteneur

## Outils

- ESLint avec règles personnalisées
- Dependency cruiser
- Madge (graphe de dépendances)
- SonarQube
- Scripts personnalisés

## Ressources

- [React Architecture Best Practices](https://react.dev/learn/thinking-in-react)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

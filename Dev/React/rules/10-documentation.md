# Standards de Documentation

## Documentation du Code

### JSDoc / TSDoc pour TypeScript

#### Documenter les Fonctions

```typescript
/**
 * Calcule le total d'une commande incluant les taxes et la livraison.
 *
 * @param items - Liste des articles de la commande
 * @param taxRate - Taux de taxe (par défaut 0.20 pour 20%)
 * @param shippingCost - Frais de livraison optionnels
 *
 * @returns Le montant total de la commande
 *
 * @throws {ValidationError} Si le tableau d'articles est vide
 * @throws {RangeError} Si le taux de taxe est négatif
 *
 * @example
 * ```typescript
 * const items = [
 *   { name: 'Product 1', price: 10, quantity: 2 },
 *   { name: 'Product 2', price: 15, quantity: 1 }
 * ];
 *
 * const total = calculateOrderTotal(items, 0.20, 5);
 * // Returns: 47 (20 + 15 + tax 7 + shipping 5)
 * ```
 *
 * @see {@link https://docs.example.com/pricing | Pricing Documentation}
 */
export function calculateOrderTotal(
  items: OrderItem[],
  taxRate: number = 0.20,
  shippingCost?: number
): number {
  if (items.length === 0) {
    throw new ValidationError('Items array cannot be empty');
  }

  if (taxRate < 0) {
    throw new RangeError('Tax rate cannot be negative');
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const tax = subtotal * taxRate;
  const shipping = shippingCost ?? 0;

  return subtotal + tax + shipping;
}
```

#### Documenter les Interfaces et Types

```typescript
/**
 * Représente un article de commande.
 *
 * @interface OrderItem
 */
export interface OrderItem {
  /**
   * Identifiant unique de l'article
   * @example "prod_123abc"
   */
  id: string;

  /**
   * Nom du produit
   * @example "MacBook Pro 14\""
   */
  name: string;

  /**
   * Prix unitaire en euros
   * @minimum 0
   * @example 1999.99
   */
  price: number;

  /**
   * Quantité commandée
   * @minimum 1
   * @example 2
   */
  quantity: number;

  /**
   * Catégorie du produit (optionnel)
   * @example "electronics"
   */
  category?: ProductCategory;
}

/**
 * Catégories de produits disponibles
 *
 * @enum {string}
 */
export enum ProductCategory {
  /** Produits électroniques */
  ELECTRONICS = 'electronics',

  /** Vêtements et accessoires */
  CLOTHING = 'clothing',

  /** Livres et médias */
  BOOKS = 'books',

  /** Articles pour la maison */
  HOME = 'home'
}

/**
 * Options de configuration pour le calcul de commande
 *
 * @typedef {Object} OrderCalculationOptions
 * @property {number} [taxRate=0.20] - Taux de taxe appliqué
 * @property {number} [shippingCost] - Frais de livraison fixes
 * @property {boolean} [includeTax=true] - Inclure la taxe dans le calcul
 * @property {DiscountCode} [discountCode] - Code promo optionnel
 */
export type OrderCalculationOptions = {
  taxRate?: number;
  shippingCost?: number;
  includeTax?: boolean;
  discountCode?: DiscountCode;
};
```

#### Documenter les Composants React

```typescript
/**
 * Composant de carte utilisateur affichant les informations principales.
 *
 * @component
 * @example
 * ```tsx
 * <UserCard
 *   user={userData}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   showActions
 * />
 * ```
 */
export const UserCard: FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  showActions = false
}) => {
  // Implementation
};

/**
 * Props du composant UserCard
 *
 * @interface UserCardProps
 */
export interface UserCardProps {
  /**
   * Données de l'utilisateur à afficher
   */
  user: User;

  /**
   * Callback appelé lors du clic sur "Éditer"
   * @param user - L'utilisateur à éditer
   */
  onEdit?: (user: User) => void;

  /**
   * Callback appelé lors du clic sur "Supprimer"
   * @param userId - L'ID de l'utilisateur à supprimer
   */
  onDelete?: (userId: string) => void;

  /**
   * Afficher ou masquer les boutons d'action
   * @default false
   */
  showActions?: boolean;

  /**
   * Classes CSS additionnelles
   */
  className?: string;
}
```

#### Documenter les Hooks Custom

```typescript
/**
 * Hook personnalisé pour gérer l'authentification de l'utilisateur.
 *
 * Gère la connexion, la déconnexion et l'état d'authentification.
 * Utilise React Query pour le cache et la synchronisation.
 *
 * @hook
 *
 * @returns {UseAuthReturn} Objet contenant l'état d'authentification et les méthodes
 *
 * @throws {AuthError} Si les credentials sont invalides
 * @throws {NetworkError} Si la connexion réseau échoue
 *
 * @example
 * ```tsx
 * function LoginPage() {
 *   const { user, login, logout, isAuthenticated, isLoading } = useAuth();
 *
 *   const handleLogin = async () => {
 *     try {
 *       await login({ email: 'user@example.com', password: 'pass123' });
 *       navigate('/dashboard');
 *     } catch (error) {
 *       console.error('Login failed:', error);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       {isAuthenticated ? (
 *         <button onClick={logout}>Logout</button>
 *       ) : (
 *         <button onClick={handleLogin}>Login</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @see {@link AuthService} pour l'implémentation du service
 * @see {@link https://docs.example.com/auth | Documentation d'authentification}
 */
export const useAuth = (): UseAuthReturn => {
  // Implementation
};

/**
 * Valeur de retour du hook useAuth
 *
 * @interface UseAuthReturn
 */
export interface UseAuthReturn {
  /**
   * Utilisateur actuellement connecté (null si non connecté)
   */
  user: User | null;

  /**
   * Indique si l'utilisateur est authentifié
   */
  isAuthenticated: boolean;

  /**
   * Indique si une opération d'authentification est en cours
   */
  isLoading: boolean;

  /**
   * Erreur d'authentification éventuelle
   */
  error: Error | null;

  /**
   * Se connecter avec email et mot de passe
   *
   * @param credentials - Email et mot de passe
   * @returns Promise résolue avec l'utilisateur connecté
   */
  login: (credentials: LoginCredentials) => Promise<User>;

  /**
   * Se déconnecter
   *
   * @returns Promise résolue quand la déconnexion est terminée
   */
  logout: () => Promise<void>;

  /**
   * Rafraîchir le token d'authentification
   *
   * @returns Promise résolue avec le nouveau token
   */
  refreshToken: () => Promise<string>;
}
```

### Commentaires dans le Code

#### Quand Commenter

```typescript
// ✅ BON - Explication du "pourquoi"
// On utilise requestAnimationFrame pour éviter le layout thrashing
// qui causerait des lags sur les animations complexes
const optimizedScroll = () => {
  requestAnimationFrame(() => {
    updateScrollPosition();
  });
};

// ✅ BON - Workaround ou solution non-évidente
// HACK: Safari ne supporte pas scrollTo avec behavior: 'smooth'
// Utiliser une solution alternative pour Safari
if (isSafari) {
  window.scrollTo(0, targetPosition);
} else {
  window.scrollTo({ top: targetPosition, behavior: 'smooth' });
}

// ✅ BON - TODO avec contexte
// TODO(john): Implémenter la pagination côté serveur
// Actuellement limité à 100 items, refactorer quand on aura l'API v2
// Ticket: #USER-456

// ✅ BON - Complexité algorithmique
// Time complexity: O(n log n) - tri nécessaire pour la recherche binaire
// Space complexity: O(n) - copie du tableau pour éviter la mutation

// ❌ MAUVAIS - Commentaire évident
// Incrémente le compteur de 1
counter++;

// ❌ MAUVAIS - Code commenté (supprimer à la place)
// const oldFunction = () => {
//   // ancien code...
// };
```

#### Types de Commentaires Utiles

```typescript
// ========== Sections ==========
// Utiliser pour séparer les parties logiques

// ========== Configuration ==========
const API_BASE_URL = 'https://api.example.com';
const TIMEOUT = 30000;

// ========== State Management ==========
const [users, setUsers] = useState<User[]>([]);
const [isLoading, setIsLoading] = useState(false);

// ========== Effects ==========
useEffect(() => {
  fetchUsers();
}, []);

// ---------- Sous-sections ----------
// Utiliser pour des sous-parties

// WARNING: Ne pas modifier cette valeur sans consulter l'équipe backend
// Elle est synchronisée avec la configuration serveur
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// NOTE: Cette fonction est temporaire et sera remplacée par l'API v2
function getLegacyData() {
  // ...
}

// FIXME: Cette validation n'est pas correcte pour les emails internationaux
// Voir https://github.com/project/issues/123
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

## README.md du Projet

### Structure Recommandée

```markdown
# Nom du Projet

![Build Status](https://img.shields.io/github/workflow/status/user/repo/CI)
![Coverage](https://img.shields.io/codecov/c/github/user/repo)
![License](https://img.shields.io/github/license/user/repo)

Brève description du projet (1-2 phrases).

## Table des Matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Scripts Disponibles](#scripts-disponibles)
- [Architecture](#architecture)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Contribution](#contribution)
- [License](#license)

## Aperçu

Description détaillée du projet, son objectif et son contexte.

### Technologies Utilisées

- React 18.3
- TypeScript 5.4
- Vite 5.2
- TanStack Query v5
- React Router v6
- Tailwind CSS 3.4
- Vitest
- Playwright

## Fonctionnalités

- ✅ Authentification avec JWT
- ✅ Gestion des utilisateurs (CRUD)
- ✅ Dashboard avec statistiques
- ✅ Thème clair/sombre
- ✅ Responsive design
- ✅ Tests unitaires et E2E
- ✅ CI/CD avec GitHub Actions

## Prérequis

- Node.js >= 20.0.0
- pnpm >= 8.0.0 (ou npm >= 9.0.0)
- Git

## Installation

```bash
# Cloner le repository
git clone https://github.com/user/project.git
cd project

# Installer les dépendances
pnpm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Configurer les variables d'environnement
# Éditer .env.local avec vos valeurs
```

## Configuration

### Variables d'Environnement

```env
# API
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000

# Authentication
VITE_AUTH_DOMAIN=auth.example.com
VITE_AUTH_CLIENT_ID=your-client-id

# Features
VITE_FEATURE_NEW_DASHBOARD=true
VITE_FEATURE_ANALYTICS=false

# Analytics (optionnel)
VITE_ANALYTICS_ID=GA-XXXXXXXXX
```

### Configuration Additionnelle

Voir [docs/configuration.md](docs/configuration.md) pour plus de détails.

## Utilisation

### Développement

```bash
# Démarrer le serveur de développement
pnpm dev

# Accessible à http://localhost:3000
```

### Build

```bash
# Build pour production
pnpm build

# Preview du build
pnpm preview
```

### Docker

```bash
# Build l'image
docker build -t my-app .

# Lancer le container
docker run -p 3000:80 my-app

# Ou utiliser docker-compose
docker-compose up
```

## Scripts Disponibles

```bash
pnpm dev          # Serveur de développement
pnpm build        # Build production
pnpm preview      # Preview du build

pnpm test         # Tests unitaires
pnpm test:e2e     # Tests E2E
pnpm test:coverage # Coverage

pnpm lint         # Linter
pnpm lint:fix     # Fix linting
pnpm format       # Formater le code
pnpm type-check   # Vérifier les types

pnpm quality      # Linter + Types + Tests
```

## Architecture

```
src/
├── components/        # Composants réutilisables
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
├── features/         # Fonctionnalités métier
│   ├── auth/
│   ├── users/
│   └── dashboard/
├── hooks/            # Hooks custom
├── services/         # Services API
├── utils/            # Utilitaires
├── types/            # Types TypeScript
└── config/           # Configuration

```

Voir [docs/architecture.md](docs/architecture.md) pour plus de détails.

## Tests

### Tests Unitaires

```bash
# Lancer tous les tests
pnpm test

# Mode watch
pnpm test:watch

# Coverage
pnpm test:coverage
```

### Tests E2E

```bash
# Lancer les tests E2E
pnpm test:e2e

# Mode UI
pnpm test:e2e:ui
```

## Déploiement

### Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Netlify

```bash
# Build
pnpm build

# Le dossier dist/ est prêt pour le déploiement
```

### Docker

```bash
# Build et push
docker build -t registry.example.com/my-app:latest .
docker push registry.example.com/my-app:latest
```

Voir [docs/deployment.md](docs/deployment.md) pour plus de détails.

## Contribution

Les contributions sont les bienvenues ! Veuillez lire [CONTRIBUTING.md](CONTRIBUTING.md).

### Workflow

1. Fork le projet
2. Créer une branch (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'feat: add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

### Standards

- Suivre [Conventional Commits](https://www.conventionalcommits.org/)
- Écrire des tests pour les nouvelles fonctionnalités
- Maintenir le coverage > 80%
- Respecter les règles ESLint et Prettier

## License

Ce projet est sous licence MIT. Voir [LICENSE](LICENSE) pour plus de détails.

## Contact

- Auteur: Votre Nom
- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

## Remerciements

- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [TanStack Query](https://tanstack.com/query)
```

## Storybook - Documentation des Composants

### Installation

```bash
npx storybook@latest init
```

### Story Example

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

/**
 * Le composant Button est utilisé pour déclencher des actions.
 * Il supporte différentes variantes, tailles et états.
 */
const meta = {
  title: 'Components/Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Un bouton personnalisable avec plusieurs variantes et tailles.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
      description: 'La variante visuelle du bouton'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'La taille du bouton'
    },
    disabled: {
      control: 'boolean',
      description: 'Désactive le bouton'
    },
    isLoading: {
      control: 'boolean',
      description: 'Affiche un état de chargement'
    }
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Bouton primaire par défaut
 */
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
};

/**
 * Bouton secondaire
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button'
  }
};

/**
 * Bouton avec outline
 */
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button'
  }
};

/**
 * Bouton danger
 */
export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Delete'
  }
};

/**
 * Bouton désactivé
 */
export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Disabled Button'
  }
};

/**
 * Bouton en chargement
 */
export const Loading: Story = {
  args: {
    variant: 'primary',
    isLoading: true,
    children: 'Loading...'
  }
};

/**
 * Différentes tailles
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  )
};

/**
 * Toutes les variantes
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  )
};
```

## Documentation Technique

### docs/architecture.md

```markdown
# Architecture

## Vue d'Ensemble

L'application suit une architecture feature-based organisée selon le pattern Atomic Design.

## Principes

1. **Feature-Based** : Code organisé par fonctionnalité métier
2. **Atomic Design** : Composants hiérarchisés (atoms, molecules, organisms)
3. **Separation of Concerns** : Logique séparée de la présentation
4. **Type Safety** : TypeScript strict activé

## Structure

[Détails de la structure...]

## Flux de Données

[Diagrammes et explications...]
```

### docs/api-reference.md

```markdown
# API Reference

## Endpoints

### Authentication

#### POST /api/auth/login

Authentifie un utilisateur.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-here"
}
```

[Plus de détails...]
```

### docs/deployment.md

```markdown
# Déploiement

## Prérequis

- Node.js 20+
- Accès aux services cloud (Vercel, AWS, etc.)

## Environnements

### Development

[Configuration...]

### Staging

[Configuration...]

### Production

[Configuration...]
```

## Changelog

### CHANGELOG.md

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Dark mode support
- User profile editing

### Changed

- Improved performance of user list

### Fixed

- Email validation regex issue

## [1.2.0] - 2024-01-15

### Added

- OAuth2 authentication
- Dashboard with analytics
- Export data to CSV

### Changed

- Updated React to v18.3
- Migrated to Vite 5

### Deprecated

- Old API endpoints (will be removed in v2.0.0)

### Security

- Fixed XSS vulnerability in user input

## [1.1.0] - 2023-12-01

### Added

- User management CRUD operations
- Role-based access control

### Fixed

- Login redirect issue
- Memory leak in DataTable component

## [1.0.0] - 2023-11-01

### Added

- Initial release
- User authentication
- Basic dashboard
- User list

[unreleased]: https://github.com/user/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/user/repo/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/user/repo/releases/tag/v1.0.0
```

## Conclusion

Une bonne documentation permet :

1. ✅ **Onboarding** : Nouveaux développeurs productifs rapidement
2. ✅ **Maintenance** : Comprendre le code rapidement
3. ✅ **Collaboration** : Communication claire entre équipes
4. ✅ **Qualité** : Réduire les bugs et malentendus
5. ✅ **Évolution** : Faciliter les changements futurs

**Règle d'or** : Le code se documente lui-même (bon nommage), les commentaires expliquent le "pourquoi", la documentation explique le "comment utiliser".

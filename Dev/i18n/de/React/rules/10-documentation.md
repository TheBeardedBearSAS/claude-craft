# Documentation Standards

## Code Documentation

### JSDoc / TSDoc for TypeScript

#### Documenting Functions

```typescript
/**
 * Calculates the total for an order including taxes and shipping.
 *
 * @param items - List of order items
 * @param taxRate - Tax rate (default 0.20 for 20%)
 * @param shippingCost - Optional shipping costs
 *
 * @returns The total order amount
 *
 * @throws {ValidationError} If the items array is empty
 * @throws {RangeError} If the tax rate is negative
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

#### Documenting Interfaces and Types

```typescript
/**
 * Represents an order item.
 *
 * @interface OrderItem
 */
export interface OrderItem {
  /**
   * Unique item identifier
   * @example "prod_123abc"
   */
  id: string;

  /**
   * Product name
   * @example "MacBook Pro 14\""
   */
  name: string;

  /**
   * Unit price in euros
   * @minimum 0
   * @example 1999.99
   */
  price: number;

  /**
   * Ordered quantity
   * @minimum 1
   * @example 2
   */
  quantity: number;

  /**
   * Product category (optional)
   * @example "electronics"
   */
  category?: ProductCategory;
}

/**
 * Available product categories
 *
 * @enum {string}
 */
export enum ProductCategory {
  /** Electronic products */
  ELECTRONICS = 'electronics',

  /** Clothing and accessories */
  CLOTHING = 'clothing',

  /** Books and media */
  BOOKS = 'books',

  /** Home goods */
  HOME = 'home'
}

/**
 * Configuration options for order calculation
 *
 * @typedef {Object} OrderCalculationOptions
 * @property {number} [taxRate=0.20] - Applied tax rate
 * @property {number} [shippingCost] - Fixed shipping costs
 * @property {boolean} [includeTax=true] - Include tax in calculation
 * @property {DiscountCode} [discountCode] - Optional promo code
 */
export type OrderCalculationOptions = {
  taxRate?: number;
  shippingCost?: number;
  includeTax?: boolean;
  discountCode?: DiscountCode;
};
```

#### Documenting React Components

```typescript
/**
 * User card component displaying main information.
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
 * Props for UserCard component
 *
 * @interface UserCardProps
 */
export interface UserCardProps {
  /**
   * User data to display
   */
  user: User;

  /**
   * Callback called when "Edit" is clicked
   * @param user - The user to edit
   */
  onEdit?: (user: User) => void;

  /**
   * Callback called when "Delete" is clicked
   * @param userId - The ID of the user to delete
   */
  onDelete?: (userId: string) => void;

  /**
   * Show or hide action buttons
   * @default false
   */
  showActions?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}
```

#### Documenting Custom Hooks

```typescript
/**
 * Custom hook to manage user authentication.
 *
 * Handles login, logout and authentication state.
 * Uses React Query for cache and synchronization.
 *
 * @hook
 *
 * @returns {UseAuthReturn} Object containing authentication state and methods
 *
 * @throws {AuthError} If credentials are invalid
 * @throws {NetworkError} If network connection fails
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
 * @see {@link AuthService} for service implementation
 * @see {@link https://docs.example.com/auth | Authentication Documentation}
 */
export const useAuth = (): UseAuthReturn => {
  // Implementation
};

/**
 * Return value of the useAuth hook
 *
 * @interface UseAuthReturn
 */
export interface UseAuthReturn {
  /**
   * Currently logged in user (null if not logged in)
   */
  user: User | null;

  /**
   * Indicates if the user is authenticated
   */
  isAuthenticated: boolean;

  /**
   * Indicates if an authentication operation is in progress
   */
  isLoading: boolean;

  /**
   * Possible authentication error
   */
  error: Error | null;

  /**
   * Login with email and password
   *
   * @param credentials - Email and password
   * @returns Promise resolved with the logged-in user
   */
  login: (credentials: LoginCredentials) => Promise<User>;

  /**
   * Logout
   *
   * @returns Promise resolved when logout is complete
   */
  logout: () => Promise<void>;

  /**
   * Refresh authentication token
   *
   * @returns Promise resolved with the new token
   */
  refreshToken: () => Promise<string>;
}
```

### Code Comments

#### When to Comment

```typescript
// ✅ GUT - Explain the "why"
// We use requestAnimationFrame to avoid layout thrashing
// which would cause lags on complex animations
const optimizedScroll = () => {
  requestAnimationFrame(() => {
    updateScrollPosition();
  });
};

// ✅ GUT - Workaround or non-obvious solution
// HACK: Safari doesn't support scrollTo with behavior: 'smooth'
// Use alternative solution for Safari
if (isSafari) {
  window.scrollTo(0, targetPosition);
} else {
  window.scrollTo({ top: targetPosition, behavior: 'smooth' });
}

// ✅ GUT - TODO with context
// TODO(john): Implement server-side pagination
// Currently limited to 100 items, refactor when we have API v2
// Ticket: #USER-456

// ✅ GUT - Algorithmic complexity
// Time complexity: O(n log n) - sorting required for binary search
// Space complexity: O(n) - array copy to avoid mutation

// ❌ SCHLECHT - Obvious comment
// Increment the counter by 1
counter++;

// ❌ SCHLECHT - Commented code (delete instead)
// const oldFunction = () => {
//   // old code...
// };
```

#### Useful Comment Types

```typescript
// ========== Sections ==========
// Use to separate logical parts

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

// ---------- Sub-sections ----------
// Use for sub-parts

// WARNING: Don't modify this value without consulting the backend team
// It's synchronized with the server configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// NOTE: This function is temporary and will be replaced by API v2
function getLegacyData() {
  // ...
}

// FIXME: This validation isn't correct for international emails
// See https://github.com/project/issues/123
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

## Project README.md

### Recommended Structure

```markdown
# Project Name

![Build Status](https://img.shields.io/github/workflow/status/user/repo/CI)
![Coverage](https://img.shields.io/codecov/c/github/user/repo)
![License](https://img.shields.io/github/license/user/repo)

Brief project description (1-2 sentences).

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Available Scripts](#available-scripts)
- [Architecture](#architecture)
- [Tests](#tests)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

Detailed project description, its purpose and context.

### Technologies Used

- React 18.3
- TypeScript 5.4
- Vite 5.2
- TanStack Query v5
- React Router v6
- Tailwind CSS 3.4
- Vitest
- Playwright

## Features

- ✅ Authentication with JWT
- ✅ User management (CRUD)
- ✅ Dashboard with statistics
- ✅ Light/dark theme
- ✅ Responsive design
- ✅ Unit and E2E tests
- ✅ CI/CD with GitHub Actions

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0 (or npm >= 9.0.0)
- Git

## Installation

```bash
# Clone the repository
git clone https://github.com/user/project.git
cd project

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Configure environment variables
# Edit .env.local with your values
```

## Configuration

### Environment Variables

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

# Analytics (optional)
VITE_ANALYTICS_ID=GA-XXXXXXXXX
```

### Additional Configuration

See [docs/configuration.md](docs/configuration.md) for more details.

## Usage

### Development

```bash
# Start development server
pnpm dev

# Accessible at http://localhost:3000
```

### Build

```bash
# Build for production
pnpm build

# Preview the build
pnpm preview
```

### Docker

```bash
# Build the image
docker build -t my-app .

# Run the container
docker run -p 3000:80 my-app

# Or use docker-compose
docker-compose up
```

## Available Scripts

```bash
pnpm dev          # Development server
pnpm build        # Production build
pnpm preview      # Preview build

pnpm test         # Unit tests
pnpm test:e2e     # E2E tests
pnpm test:coverage # Coverage

pnpm lint         # Linter
pnpm lint:fix     # Fix linting
pnpm format       # Format code
pnpm type-check   # Check types

pnpm quality      # Linter + Types + Tests
```

## Architecture

```
src/
├── components/        # Reusable components
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
├── features/         # Business features
│   ├── auth/
│   ├── users/
│   └── dashboard/
├── hooks/            # Custom hooks
├── services/         # API services
├── utils/            # Utilities
├── types/            # TypeScript types
└── config/           # Configuration

```

See [docs/architecture.md](docs/architecture.md) for more details.

## Tests

### Unit Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

### E2E Tests

```bash
# Run E2E tests
pnpm test:e2e

# UI mode
pnpm test:e2e:ui
```

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build
pnpm build

# The dist/ folder is ready for deployment
```

### Docker

```bash
# Build and push
docker build -t registry.example.com/my-app:latest .
docker push registry.example.com/my-app:latest
```

See [docs/deployment.md](docs/deployment.md) for more details.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md).

### Workflow

1. Fork the project
2. Create a branch (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'feat: add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Standards

- Follow [Conventional Commits](https://www.conventionalcommits.org/)
- Write tests for new features
- Maintain coverage > 80%
- Respect ESLint and Prettier rules

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more details.

## Contact

- Author: Your Name
- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

## Acknowledgments

- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [TanStack Query](https://tanstack.com/query)
```

## Storybook - Component Documentation

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
 * The Button component is used to trigger actions.
 * It supports different variants, sizes and states.
 */
const meta = {
  title: 'Components/Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable button with multiple variants and sizes.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
      description: 'The visual variant of the button'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the button'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button'
    },
    isLoading: {
      control: 'boolean',
      description: 'Show a loading state'
    }
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Primary button by default
 */
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
};

/**
 * Secondary button
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button'
  }
};

/**
 * Outline button
 */
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button'
  }
};

/**
 * Danger button
 */
export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Delete'
  }
};

/**
 * Disabled button
 */
export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Disabled Button'
  }
};

/**
 * Loading button
 */
export const Loading: Story = {
  args: {
    variant: 'primary',
    isLoading: true,
    children: 'Loading...'
  }
};

/**
 * Different sizes
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
 * All variants
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

## Technical Documentation

### docs/architecture.md

```markdown
# Architecture

## Overview

The application follows a feature-based architecture organized according to the Atomic Design pattern.

## Principles

1. **Feature-Based**: Code organized by business feature
2. **Atomic Design**: Hierarchical components (atoms, molecules, organisms)
3. **Separation of Concerns**: Logic separated from presentation
4. **Type Safety**: TypeScript strict enabled

## Structure

[Structure details...]

## Data Flow

[Diagrams and explanations...]
```

### docs/api-reference.md

```markdown
# API Reference

## Endpoints

### Authentication

#### POST /api/auth/login

Authenticates a user.

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

[More details...]
```

### docs/deployment.md

```markdown
# Deployment

## Prerequisites

- Node.js 20+
- Access to cloud services (Vercel, AWS, etc.)

## Environments

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

Good documentation enables:

1. ✅ **Onboarding**: New developers productive quickly
2. ✅ **Maintenance**: Understand code quickly
3. ✅ **Collaboration**: Clear communication between teams
4. ✅ **Quality**: Reduce bugs and misunderstandings
5. ✅ **Evolution**: Facilitate future changes

**Golden rule**: Code documents itself (good naming), comments explain the "why", documentation explains "how to use".

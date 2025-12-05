# Documentation Standards

## Code Documentation

### JSDoc Comments

```typescript
/**
 * Fetches user data from the API
 *
 * @param userId - The unique identifier of the user
 * @returns A promise that resolves to the user object
 * @throws {ApiError} When the API request fails
 *
 * @example
 * ```typescript
 * const user = await fetchUser('123');
 * console.log(user.name);
 * ```
 */
export async function fetchUser(userId: string): Promise<User> {
  const response = await apiClient.get(\`/users/\${userId}\`);
  return response.data;
}
```

### Component Documentation

```typescript
/**
 * A reusable button component with multiple variants
 *
 * @component
 * @example
 * ```tsx
 * <Button variant="primary" onPress={handlePress}>
 *   Click me
 * </Button>
 * ```
 */
export const Button: FC<ButtonProps> = ({ variant, onPress, children }) => {
  // Implementation
};
```

---

## README.md Structure

```markdown
# Project Name

Brief description

## Features

- Feature 1
- Feature 2

## Prerequisites

- Node.js 18+
- npm 9+
- Expo CLI

## Installation

```bash
npm install
```

## Configuration

Copy \`.env.example\` to \`.env\`:
```bash
cp .env.example .env
```

## Running

```bash
npx expo start
```

## Testing

```bash
npm test
```

## Building

```bash
eas build --platform all
```

## Project Structure

```
src/
├── app/
├── components/
└── services/
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT
```

---

## Inline Comments

### When to Comment

```typescript
// ✅ GOOD: Explique le "pourquoi"
// Workaround for iOS keyboard bug in React Native 0.72
if (Platform.OS === 'ios') {
  Keyboard.dismiss();
}

// ✅ GOOD: Explique business logic complexe
// Users with premium subscription get 3 retries,
// free users get only 1 retry
const maxRetries = user.isPremium ? 3 : 1;

// ❌ BAD: Explique le "quoi" (déjà évident)
// Set count to 0
setCount(0);

// ❌ BAD: Commentaire obsolète
// TODO: Fix this later (from 2 years ago)
```

---

## Architecture Decision Records (ADR)

### Template

```markdown
# ADR-001: Use Zustand for Global State

## Status
Accepted

## Context
We need a state management solution for global app state
(theme, user session, settings).

## Decision
Use Zustand with MMKV persistence.

## Consequences

### Positive
- Lightweight (< 1kb)
- Simple API
- TypeScript support
- Fast persistence with MMKV

### Negative
- Less ecosystem than Redux
- No middleware system

## Alternatives Considered
1. Redux Toolkit - Too heavy
2. Context API - Performance issues
3. Jotai - Less mature

## References
- [Zustand Docs](https://github.com/pmndrs/zustand)
```

---

## API Documentation

```typescript
/**
 * Users API Service
 *
 * Handles all user-related API calls.
 */
export class UsersService {
  /**
   * Get all users with optional filtering
   *
   * @param filters - Optional filters (name, email, role)
   * @returns Paginated list of users
   *
   * @example
   * ```typescript
   * const users = await usersService.getAll({ role: 'admin' });
   * ```
   */
  async getAll(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    // Implementation
  }
}
```

---

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
- Offline mode for articles

### Changed
- Improved performance of article list

### Fixed
- Login crash on Android

## [1.2.0] - 2024-01-15

### Added
- Social login (Google, Apple)
- Push notifications
- Image upload

### Changed
- Updated to Expo SDK 50

### Deprecated
- Old auth API endpoints

### Removed
- Legacy navigation system

### Fixed
- Memory leak in profile screen

### Security
- Updated dependencies with security vulnerabilities

## [1.1.0] - 2023-12-01

...
```

---

## Checklist Documentation

- [ ] README.md à jour
- [ ] JSDoc pour fonctions publiques
- [ ] Commentaires inline pertinents
- [ ] ADR pour décisions importantes
- [ ] CHANGELOG.md maintenu
- [ ] API documentée
- [ ] Architecture documentée

---

**Une bonne documentation fait gagner du temps à toute l'équipe.**

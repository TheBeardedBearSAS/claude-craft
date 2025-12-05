# Contexte du Projet - {{PROJECT_NAME}}

## Vue d'ensemble

Ce document définit le contexte et les paramètres spécifiques du projet **{{PROJECT_NAME}}**.

---

## Informations Générales

### Nom du Projet
```
{{PROJECT_NAME}}
```

### Stack Technique
```
{{TECH_STACK}}
```

### Type d'Application
- [ ] Application mobile native (iOS + Android)
- [ ] Application iOS uniquement
- [ ] Application Android uniquement
- [ ] Application avec tablet support
- [ ] Application avec web support (Expo Web)

---

## Configuration Expo

### SDK Version
```json
{
  "expo": {
    "sdkVersion": "{{EXPO_SDK_VERSION}}"
  }
}
```

### Supported Platforms
```json
{
  "platforms": ["ios", "android", "web"]
}
```

---

## Architecture du Projet

### Structure des Dossiers

```
{{PROJECT_NAME}}/
├── src/
│   ├── app/                      # App Router (Expo Router)
│   │   ├── (auth)/              # Auth group
│   │   ├── (tabs)/              # Main tabs group
│   │   └── _layout.tsx          # Root layout
│   ├── components/              # Composants réutilisables
│   │   ├── ui/                  # Composants UI de base
│   │   ├── forms/               # Composants de formulaires
│   │   └── shared/              # Composants partagés
│   ├── screens/                 # Écrans de l'application
│   ├── features/                # Features par domaine métier
│   │   ├── auth/
│   │   ├── profile/
│   │   └── settings/
│   ├── hooks/                   # Custom hooks
│   ├── services/                # Services (API, storage, etc.)
│   ├── stores/                  # State management
│   ├── navigation/              # Configuration navigation
│   ├── utils/                   # Utilitaires
│   ├── constants/               # Constantes
│   ├── types/                   # TypeScript types/interfaces
│   ├── config/                  # Configuration app
│   ├── assets/                  # Images, fonts, etc.
│   └── theme/                   # Thème (colors, spacing, etc.)
├── __tests__/                   # Tests
├── .expo/                       # Expo config
├── app.json                     # Expo app config
├── tsconfig.json                # TypeScript config
├── package.json
└── README.md
```

---

## Stack Technique Détaillé

### Core

- **React Native**: {{REACT_NATIVE_VERSION}}
- **Expo SDK**: {{EXPO_SDK_VERSION}}
- **TypeScript**: {{TYPESCRIPT_VERSION}}
- **Node.js**: {{NODE_VERSION}}

### Navigation

- **Expo Router**: {{EXPO_ROUTER_VERSION}}
- **React Navigation**: (via Expo Router)

### State Management

- **React Query / TanStack Query**: {{REACT_QUERY_VERSION}}
- **Zustand**: {{ZUSTAND_VERSION}}
- **MMKV**: {{MMKV_VERSION}}

### UI/UX

- **React Native Paper**: {{PAPER_VERSION}} (optionnel)
- **NativeWind** (Tailwind CSS): {{NATIVEWIND_VERSION}} (optionnel)
- **React Native Reanimated**: {{REANIMATED_VERSION}}
- **React Native Gesture Handler**: {{GESTURE_HANDLER_VERSION}}

### Forms & Validation

- **React Hook Form**: {{REACT_HOOK_FORM_VERSION}}
- **Zod**: {{ZOD_VERSION}}

### API & Networking

- **Axios**: {{AXIOS_VERSION}}
- **React Query**: pour le caching et synchronisation

### Storage

- **Expo SecureStore**: Pour données sensibles
- **MMKV**: Pour storage performant
- **AsyncStorage**: Pour données simples (fallback)

### Testing

- **Jest**: {{JEST_VERSION}}
- **React Native Testing Library**: {{TESTING_LIBRARY_VERSION}}
- **Detox**: {{DETOX_VERSION}} (E2E)

### Quality Tools

- **ESLint**: {{ESLINT_VERSION}}
- **Prettier**: {{PRETTIER_VERSION}}
- **TypeScript**: Strict mode enabled
- **Husky**: Pre-commit hooks

### Dev Tools

- **Expo CLI**: {{EXPO_CLI_VERSION}}
- **EAS CLI**: {{EAS_CLI_VERSION}}
- **React Native Debugger** / **Flipper**

---

## Environnements

### Development
```typescript
// config/env.dev.ts
export const ENV = {
  API_URL: '{{DEV_API_URL}}',
  ENV: 'development',
  DEBUG: true,
};
```

### Staging
```typescript
// config/env.staging.ts
export const ENV = {
  API_URL: '{{STAGING_API_URL}}',
  ENV: 'staging',
  DEBUG: true,
};
```

### Production
```typescript
// config/env.prod.ts
export const ENV = {
  API_URL: '{{PROD_API_URL}}',
  ENV: 'production',
  DEBUG: false,
};
```

---

## APIs et Services Externes

### Backend API
- **URL**: {{API_URL}}
- **Documentation**: {{API_DOCS_URL}}
- **Authentication**: {{AUTH_METHOD}} (JWT, OAuth2, etc.)

### Services Tiers
- **Analytics**: {{ANALYTICS_SERVICE}} (Firebase, Amplitude, etc.)
- **Crash Reporting**: {{CRASH_REPORTING}} (Sentry, Bugsnag, etc.)
- **Push Notifications**: {{PUSH_SERVICE}} (Expo Notifications, FCM, etc.)
- **Storage Cloud**: {{CLOUD_STORAGE}} (S3, Firebase Storage, etc.)

---

## Authentification

### Méthode
```typescript
// {{AUTH_METHOD}}
// Options: JWT, OAuth2, Social Login, etc.
```

### Flow
1. Login/Register
2. Token storage (SecureStore)
3. Token refresh
4. Logout

### Providers
- [ ] Email/Password
- [ ] Google
- [ ] Apple
- [ ] Facebook
- [ ] Other: {{OTHER_AUTH_PROVIDERS}}

---

## Features Principales

### Must Have (MVP)
1. {{FEATURE_1}}
2. {{FEATURE_2}}
3. {{FEATURE_3}}

### Nice to Have
1. {{NICE_TO_HAVE_1}}
2. {{NICE_TO_HAVE_2}}

### Future
1. {{FUTURE_FEATURE_1}}
2. {{FUTURE_FEATURE_2}}

---

## Contraintes Techniques

### Performance
- Target: **60 FPS** sur les animations
- **Hermes** engine activé
- Lazy loading des screens
- Image optimization
- Liste virtualisées (FlatList)

### Compatibilité
- **iOS**: {{MIN_IOS_VERSION}}+
- **Android**: {{MIN_ANDROID_VERSION}}+ (API {{MIN_API_LEVEL}})

### Offline Support
- [ ] Oui - Full offline
- [ ] Partiel - Lecture seule
- [ ] Non - Online only

### Internationalisation (i18n)
- [ ] Oui - Multilingue
- [ ] Non - Langue unique: {{DEFAULT_LANGUAGE}}

Languages supportés:
- {{LANG_1}}
- {{LANG_2}}

---

## Build & Deployment

### Build Service
- **EAS Build**: {{EAS_BUILD_ENABLED}}
- **Local Build**: {{LOCAL_BUILD_ENABLED}}

### Distribution
- **iOS**: App Store / TestFlight
- **Android**: Google Play Store / Internal Testing

### CI/CD
- **Service**: {{CI_CD_SERVICE}} (GitHub Actions, GitLab CI, etc.)
- **Workflow**:
  1. Tests automatiques
  2. Build preview (PR)
  3. Build staging
  4. Build production

---

## Équipe

### Développeurs
- {{DEV_1_NAME}} - {{DEV_1_ROLE}}
- {{DEV_2_NAME}} - {{DEV_2_ROLE}}

### Stakeholders
- **Product Owner**: {{PO_NAME}}
- **Designer**: {{DESIGNER_NAME}}
- **Backend Lead**: {{BACKEND_LEAD}}

---

## Conventions de Nommage

### Fichiers
- **Composants**: PascalCase (e.g., `Button.tsx`, `UserProfile.tsx`)
- **Hooks**: camelCase avec prefix `use` (e.g., `useAuth.ts`)
- **Utils**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
- **Types**: PascalCase (e.g., `User.types.ts`)

### Variables & Fonctions
- **Variables**: camelCase
- **Constantes**: UPPER_SNAKE_CASE
- **Fonctions**: camelCase
- **Composants**: PascalCase
- **Types/Interfaces**: PascalCase avec prefix `I` pour interfaces (optionnel)

### Git
- **Branches**: `feature/`, `bugfix/`, `hotfix/`, `release/`
- **Commits**: Conventional Commits (voir règle 09)

---

## Règles Spécifiques au Projet

### Code Style
- **Indentation**: 2 espaces
- **Quotes**: Simple quotes pour strings
- **Semicolons**: Oui
- **Trailing commas**: Oui (multiline)

### Imports Order
```typescript
// 1. React & React Native
import React from 'react';
import { View, Text } from 'react-native';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';

// 3. Expo
import { router } from 'expo-router';

// 4. Internal - Absolute imports
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

// 5. Types
import type { User } from '@/types/User.types';

// 6. Relative imports
import { styles } from './MyComponent.styles';

// 7. Assets
import logo from '@/assets/logo.png';
```

### Path Aliases
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"],
      "@services/*": ["src/services/*"],
      "@stores/*": ["src/stores/*"],
      "@constants/*": ["src/constants/*"],
      "@theme/*": ["src/theme/*"],
      "@assets/*": ["src/assets/*"]
    }
  }
}
```

---

## Métriques de Qualité

### Code Coverage
- **Target**: {{CODE_COVERAGE_TARGET}}% (recommandé: 80%+)

### Performance
- **JS Bundle Size**: < {{MAX_BUNDLE_SIZE}}MB
- **App Size**: < {{MAX_APP_SIZE}}MB
- **Startup Time**: < {{MAX_STARTUP_TIME}}s

### Code Quality
- **ESLint**: 0 errors, 0 warnings
- **TypeScript**: 0 errors (strict mode)
- **Prettier**: Auto-format

---

## Ressources

### Documentation
- **Confluence/Notion**: {{DOCS_URL}}
- **API Docs**: {{API_DOCS_URL}}
- **Figma**: {{FIGMA_URL}}

### Repositories
- **Frontend**: {{FRONTEND_REPO}}
- **Backend**: {{BACKEND_REPO}}

### Communication
- **Slack/Teams**: {{TEAM_CHANNEL}}
- **JIRA/Linear**: {{PROJECT_BOARD}}

---

## Notes Importantes

{{ADDITIONAL_NOTES}}

---

**Dernière mise à jour**: {{LAST_UPDATE_DATE}}
**Version du document**: {{DOC_VERSION}}

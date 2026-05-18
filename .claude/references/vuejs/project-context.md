# {{PROJECT_NAME}} - Project Context

## Overview

{{PROJECT_DESCRIPTION}}

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Vue.js | 3.5.x |
| Language | TypeScript | {{TS_VERSION}} |
| Build Tool | Vite | {{VITE_VERSION}} |
| State Management | Pinia | 2.2+ |
| Router | Vue Router | {{ROUTER_VERSION}} |
| UI Framework | {{UI_FRAMEWORK}} | {{UI_VERSION}} |

## Architecture Pattern

**Pattern**: {{ARCHITECTURE_PATTERN}}

### Project Structure

```
src/
├── assets/                    # Static assets
├── components/                # Shared components
│   ├── base/                  # Base/generic components
│   ├── layout/                # Layout components
│   └── ui/                    # UI components
│
├── composables/               # Reusable composition functions
│
├── modules/                   # Feature modules
│   └── {{MODULE}}/
│       ├── components/
│       ├── composables/
│       ├── stores/
│       ├── views/
│       └── types/
│
├── router/                    # Vue Router configuration
├── stores/                    # Global Pinia stores
├── services/                  # API services
├── types/                     # TypeScript types
├── utils/                     # Utility functions
│
├── App.vue
└── main.ts
```

## Coding Standards

### Vue Standards
- **API Style**: Composition API with `<script setup>`
- **State Management**: Pinia (composition style stores)
- **TypeScript**: Strict mode enabled
- **Components**: Single File Components (.vue)

### Naming Conventions
- Components: PascalCase, multi-word
- Composables: `use` prefix (useAuth, useFetch)
- Stores: `use{Name}Store` pattern
- Types: PascalCase with suffix (UserDTO, ProductEntity)

### Code Quality
- **Linter**: ESLint with Vue plugin
- **Formatter**: Prettier
- **Type Checker**: vue-tsc
- **Coverage**: Minimum 80%

## Key Modules

### {{MODULE_1}}
{{MODULE_1_DESCRIPTION}}

### {{MODULE_2}}
{{MODULE_2_DESCRIPTION}}

## External Integrations

| Service | Purpose | Documentation |
|---------|---------|---------------|
| {{SERVICE_1}} | {{PURPOSE_1}} | {{DOC_URL_1}} |
| {{SERVICE_2}} | {{PURPOSE_2}} | {{DOC_URL_2}} |

## Development Workflow

### Git Flow
- **Main**: Production-ready code
- **Develop**: Integration branch
- **Feature**: `feature/{ticket}-{description}`
- **Hotfix**: `hotfix/{ticket}-{description}`

### Pull Request Requirements
- [ ] All tests pass
- [ ] Type check passes (vue-tsc)
- [ ] ESLint passes
- [ ] Coverage >= 80%
- [ ] Code reviewed

## Commands Reference

### Development
```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm preview          # Preview production build
```

### Testing
```bash
pnpm test             # Run tests in watch mode
pnpm test:unit        # Run tests once
pnpm test:coverage    # Run with coverage
pnpm test:e2e         # Run e2e tests
```

### Quality
```bash
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm type-check       # Run vue-tsc
pnpm format           # Format with Prettier
```

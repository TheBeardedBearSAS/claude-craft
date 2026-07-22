# {{PROJECT_NAME}} - Project Context

> Scope framework-agnostic uniquement. Pour Vite en tant que dev-server React/Vue/Angular/Svelte, voir le tooling.md de ce stack.

## Overview

{{PROJECT_DESCRIPTION}}

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Build Tool | Vite | {{VITE_VERSION}} |
| Language | TypeScript | {{TS_VERSION}} |
| Project Shape | {{PROJECT_SHAPE}} | vanilla-spa / library / multi-page / workers-wasm |
| Test Runner | Vitest | {{VITEST_VERSION}} |
| Library Types (if shape=library) | vite-plugin-dts | {{DTS_VERSION}} |
| UI Layer (if any, non-framework) | {{UI_LAYER}} | {{UI_LAYER_VERSION}} |

## Architecture Pattern

**Pattern**: {{ARCHITECTURE_PATTERN}} (one of: Vanilla SPA / Library Authoring / Multi-Page App / Workers-WASM — see `architecture.md`)

### Project Structure

```
{{PROJECT_ROOT}}/
├── {{ENTRY_HTML_OR_INDEX_TS}}        # index.html (app/MPA) or src/index.ts (library)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vite-env.d.ts
├── public/                            # Static, unprocessed assets (app shapes only)
└── src/
    ├── {{MODULE_1}}/
    ├── {{MODULE_2}}/
    └── {{SHARED_DIR}}/
```

## Coding Standards

### Vite Standards
- **Config style**: `defineConfig(({ mode }) => ({ ... }))` function form
- **Project shape**: {{PROJECT_SHAPE}} — see `architecture.md` for the matching `vite.config.ts` template
- **TypeScript**: strict mode enabled, `vite-env.d.ts` extends `ImportMetaEnv`
- **Custom plugins**: named `vite-plugin-<purpose>`, typed options

### Naming Conventions
- Custom plugins: `vite-plugin-{{PURPOSE}}`
- Worker modules: `{{NAME}}.worker.ts` (imported with `?worker`)
- WASM loaders: `load{{Name}}.ts` (wraps a `?init` import)
- Types: PascalCase with suffix (`{{Entity}}DTO`, `{{Entity}}Options`)

### Code Quality
- **Linter**: ESLint flat config (`eslint.config.js`)
- **Formatter**: Prettier
- **Type Checker**: `tsc --noEmit`
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
- [ ] All tests pass (`vitest run`)
- [ ] Type check passes (`tsc --noEmit`)
- [ ] ESLint passes
- [ ] Coverage >= 80%
- [ ] (Library shape) `vite-plugin-dts` output reviewed, `dist/` inventory matches `package.json` "files"
- [ ] Code reviewed

## Commands Reference

### Development
```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build
```

### Testing
```bash
npm run test              # Run tests (vitest run)
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run with coverage
```

### Quality
```bash
npm run lint              # Run ESLint
npm run lint:fix          # Fix ESLint issues
npm run type-check        # tsc --noEmit
npm run format             # Format with Prettier
```

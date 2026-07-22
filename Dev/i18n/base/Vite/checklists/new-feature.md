# Vite New Feature Checklist

> For Vite as a React/Vue/Angular/Svelte dev-server, see that stack's own new-feature checklist — this covers **only** framework-agnostic Vite usage.

## Before Starting

- [ ] **Requirements clear** - Expected behavior and acceptance criteria defined
- [ ] **Project shape identified** - vanilla-spa / library / multi-page / worker-wasm (see `02-architecture-vite.md`)
- [ ] **Dependencies checked** - Required libraries available, peer-dependency implications considered (library shape)

## Vanilla SPA Feature

- [ ] **New module created** under `src/`, no framework import introduced
- [ ] **HMR wired manually** if the module holds mutable state (`import.meta.hot.accept`/`dispose`)
- [ ] **`data-*` attributes** added for testability, if the DOM is manipulated directly

## Library Feature (new export)

- [ ] **Exported from `src/index.ts`** - single public entry stays the source of truth
- [ ] **Peer dependency added** to both `package.json` "peerDependencies" and `build.rollupOptions.external`, if applicable
- [ ] **Type declarations verified** - `vite-plugin-dts` output includes the new export with correct types
- [ ] **Build-output smoke test updated** - `test/build-output.test.ts` covers the new public API surface

## Multi-Page Feature (new page)

- [ ] **HTML entry created** and added to `build.rollupOptions.input`
- [ ] **Entry key is stable, kebab-case**, matches folder/file naming convention
- [ ] **Shared code factored** into `src/shared/`, not duplicated across page entries
- [ ] **CSP verified** for the new entry (see `11-security-vite.md`)

## Worker/WASM Feature

- [ ] **Worker instantiated via `new URL(..., import.meta.url)`**, never a bare string
- [ ] **Message-handling logic extracted** into a plain, directly testable function
- [ ] **Message payload validated** before use (shape/type check)
- [ ] **WASM `?init` import used** (not raw byte loading), wrapped in a thin `.ts` module
- [ ] **Cross-origin isolation headers** added if threads/`SharedArrayBuffer` are used

## TypeScript & Config

- [ ] **`moduleResolution: "bundler"`** confirmed in `tsconfig.json`
- [ ] **No `any`** introduced without justification
- [ ] **`vite.config.ts` functional form** used for any new env-dependent behavior

## Testing

### Unit Tests

- [ ] **New functions/classes tested** in isolation
- [ ] **Edge cases covered**
- [ ] **Coverage >= 80%**

### Worker/WASM Tests

- [ ] **Worker handler tested** as a plain function (valid + invalid messages)
- [ ] **WASM `?init` import mocked** in unit tests; one integration test loads the real binary

### Library Tests

- [ ] **Build-output test** confirms the new export resolves from `dist/` under both ESM and CJS

## Performance

- [ ] **Bundle size checked** against `chunkSizeWarningLimit`
- [ ] **Code splitting** reviewed if the feature adds a large dependency
- [ ] **Worker used** for genuinely CPU-heavy logic instead of blocking the main thread

## Documentation

- [ ] **JSDoc comments** on new public functions/exports
- [ ] **README updated** (if the feature changes the public API, for a library)
- [ ] **Types exported** from `src/index.ts` alongside the value they describe

## Final Checks

- [ ] **Lint passes** - `npx eslint .`
- [ ] **Types pass** - `tsc -b --noEmit`
- [ ] **Tests pass** - `npx vitest run`
- [ ] **Build works** - `npm run build`
- [ ] **`vite preview`** checked manually for production-only behavior

## Pull Request

- [ ] **Descriptive title**
- [ ] **Linked to issue/ticket**
- [ ] **Breaking changes documented** (especially for a library's public API)
- [ ] **Reviewers assigned**

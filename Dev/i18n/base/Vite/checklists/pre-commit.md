# Vite Pre-Commit Checklist

> For Vite as a React/Vue/Angular/Svelte dev-server, see that stack's own pre-commit checklist — this covers **only** framework-agnostic Vite usage.

## Quick Checks

Run before every commit:

```bash
npx eslint . && tsc -b --noEmit && npx vitest run
```

## Checklist

### Code Quality

- [ ] **ESLint passes** - `npx eslint .`
- [ ] **No TypeScript errors** - `tsc -b --noEmit`
- [ ] **No console.log** (except warn/error)
- [ ] **No debugger statements**
- [ ] **No accidental framework import** (`no-restricted-imports` clean — React/Vue/Angular/Svelte)

### Vite Config Standards

- [ ] **`vite.config.ts` uses `defineConfig`**, functional `(mode, command)` form for env-dependent logic
- [ ] **Custom plugins extracted** to `vite-plugins/vite-plugin-{purpose}.ts`, not inlined
- [ ] **Worker/WASM entries use static references** (`new URL(..., import.meta.url)`, `?init`), never bare strings
- [ ] **No secret referenced via `import.meta.env.VITE_*` or `define()`**

### Shape-Specific

- [ ] **Vanilla SPA**: `index.html` stayed at project root, not moved into `public/`
- [ ] **Library**: peer dependencies externalized in `build.rollupOptions.external`, not bundled
- [ ] **Multi-page**: `build.rollupOptions.input` keys unchanged/stable if renaming was not intentional
- [ ] **Worker/WASM**: worker message handler validates payload shape

### Testing

- [ ] **Tests pass** - `npx vitest run`
- [ ] **New code has tests**
- [ ] **Coverage maintained** (>= 80%)

### Security

- [ ] **No hardcoded secrets**
- [ ] **`.env*` files gitignored** (except `.env.example`)
- [ ] **CSP verified** across every HTML entry, if multi-page

## Commands

```bash
# Full pre-commit check
npx eslint . && tsc -b --noEmit && npx vitest run

# Auto-fix issues
npx eslint . --fix

# Check for secret leakage in env-exposed variables
grep -rniE "VITE_.*_(SECRET|KEY|TOKEN|PASSWORD)" .env*
```

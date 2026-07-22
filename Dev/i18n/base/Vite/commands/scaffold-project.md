---
description: Scaffold a new Vite project (vanilla-ts or lit-ts template) or a library skeleton
argument-hint: <project-name> [--template=vanilla-ts|vanilla|lit-ts|lit] [--shape=app|library|multi-page|worker-wasm] [--pm=npm|pnpm|yarn]
---

# Scaffold Vite Project

You are an expert Vite project bootstrapper. Generate a new framework-agnostic Vite project using the official CLI, then adjust it to the requested project shape.

> This command replaces `generate-component.md` for this stack: framework-agnostic Vite has no component model of its own, so there is nothing analogous to generate beyond the project skeleton itself.
>
> For scaffolding a React/Vue/Angular/Svelte app, use that stack's own generator instead — this command only wraps the framework-agnostic `create vite` templates.

## ARGUMENTS

$ARGUMENTS

- `project-name`: Directory/package name to create (required)
- `--template=<template>`: One of `vanilla-ts` (default), `vanilla`, `lit-ts`, `lit`
- `--shape=<shape>`: One of `app` (default), `library`, `multi-page`, `worker-wasm` — determines post-scaffold adjustments
- `--pm=<pm>`: Package manager, `npm` (default), `pnpm`, or `yarn`

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to confirm project name, template, and shape, and to present the post-scaffold adjustment plan before making any changes.

## MISSION

1. Run the official scaffolding CLI with the requested template
2. Apply shape-specific adjustments (library build config, MPA entry map, or worker/WASM skeleton)
3. Set up TypeScript project references, ESLint flat config, and Vitest
4. Report the resulting file tree

## Step 1: Run the Official CLI

```bash
# Non-interactive, recommended for scripted use
npm create vite@latest {{project-name}} -- --template {{template:-vanilla-ts}}
cd {{project-name}}
npm install
```

Only `vanilla`, `vanilla-ts`, `lit`, and `lit-ts` are in scope for this stack — reject any other template argument (react, vue, svelte, angular, preact, solid, qwik) and point the user to that framework's own generator command instead.

## Step 2: Apply Shape-Specific Adjustments

### Shape: `app` (default — vanilla SPA)

No structural change needed beyond what `create vite` scaffolds. Verify `index.html` stayed at the project root (never move it to `public/`).

### Shape: `library`

Replace the generated app shell with a library layout (see `02-architecture-vite.md`, Shape 2):

```bash
npm install -D vite-plugin-dts
```

- Move app entry logic out; create `src/index.ts` as the single public entry
- Rewrite `vite.config.ts` using `templates/vite.config.template.ts` (library section) + `templates/library-entry.template.ts`
- Add `"main"`, `"module"`, `"types"`, `"exports"`, `"files": ["dist"]`, `"sideEffects": false` to `package.json`
- Declare any host dependency as a peer dependency, and externalize it in `build.rollupOptions.external`

### Shape: `multi-page`

- Create one HTML file per page (`about.html`, `admin/index.html`, ...) alongside `index.html`
- Configure `build.rollupOptions.input` as an object map (page name → HTML path) — see `02-architecture-vite.md`, Shape 3
- Create one `src/<page>.ts` entry per HTML page

### Shape: `worker-wasm`

- Create `src/<name>.worker.ts` with a message-handling function extracted into a separate, testable module (see `07-testing-vite.md`)
- Wire it via `new Worker(new URL('./<name>.worker.ts', import.meta.url), { type: 'module' })` in `src/main.ts`
- If WASM is involved, add `src/wasm/<name>.ts` wrapping the `?init` import

## Step 3: Tooling Setup

```bash
npm install -D typescript eslint @eslint/js @typescript-eslint/eslint-plugin @typescript-eslint/parser vitest @vitest/coverage-v8
```

- Split `tsconfig.json` into `tsconfig.app.json` + `tsconfig.node.json` with project references (see `08-quality-tools.md`)
- Add `eslint.config.js` (flat config, no framework plugin — see `08-quality-tools.md`)
- Add the `test` block to `vite.config.ts` (see `07-testing-vite.md`)

## OUTPUT STRUCTURE (shape: app)

```
{{project-name}}/
├── index.html
├── public/
│   └── favicon.svg
├── src/
│   ├── main.ts
│   ├── style.css
│   └── vite-env.d.ts
├── eslint.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── package.json
```

## OUTPUT STRUCTURE (shape: library)

```
{{project-name}}/
├── src/
│   └── index.ts
├── vite-plugins/
├── eslint.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── package.json
```

## PROCESS

1. Validate `template` is one of `vanilla-ts` / `vanilla` / `lit-ts` / `lit` — reject otherwise
2. Run `npm create vite@latest` with the validated template
3. Install dependencies
4. Apply shape-specific adjustments (Step 2)
5. Set up TypeScript project references, ESLint, Vitest (Step 3)
6. Report the final file tree and next commands (`npm run dev`, `npm run build`, `npm run test`)

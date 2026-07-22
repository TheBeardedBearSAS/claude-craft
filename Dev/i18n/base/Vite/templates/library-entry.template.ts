// src/index.ts
//
// Library entry-point skeleton — the SINGLE public surface of the package.
// Everything a consumer can import must be re-exported from this file;
// nothing under src/internal/ or src/core/ should be imported directly
// by a consumer (enforce via package.json "exports" — see below).

export { {{PublicClassOrFunction}} } from './core/{{public-module}}'
export type { {{PublicType}}, {{PublicOptions}} } from './core/{{public-module}}'

// Re-export a namespaced group, if the library has several cohesive areas:
// export * as {{subArea}} from './{{sub-area}}'

// ============================================================================
// vite.config.ts — build.lib entry + rollupOptions.external example
// ============================================================================
//
// import { resolve } from 'node:path'
// import { defineConfig } from 'vite'
// import dts from 'vite-plugin-dts'
//
// export default defineConfig({
//   plugins: [dts({ rollupTypes: true })],
//   build: {
//     lib: {
//       entry: resolve(__dirname, 'src/index.ts'),
//       formats: ['es', 'cjs'],
//       fileName: (format) => `{{PACKAGE_NAME}}.${format === 'es' ? 'js' : 'cjs'}`,
//     },
//     rollupOptions: {
//       // Peer deps: declared in package.json "peerDependencies" AND excluded
//       // from the bundle here — never both bundle AND declare as a peer dep.
//       external: ['{{peer-dependency-name}}', /^{{peer-dependency-name}}\//],
//       output: {
//         // Preserve named exports for consumers using the UMD/CJS build
//         exports: 'named',
//         globals: {
//           '{{peer-dependency-name}}': '{{PeerDependencyGlobalName}}',
//         },
//       },
//     },
//   },
// })

// ============================================================================
// package.json — exports map (keep in sync with the build output above)
// ============================================================================
//
// {
//   "name": "{{PACKAGE_NAME}}",
//   "type": "module",
//   "main": "./dist/{{PACKAGE_NAME}}.cjs",
//   "module": "./dist/{{PACKAGE_NAME}}.js",
//   "types": "./dist/{{PACKAGE_NAME}}.d.ts",
//   "exports": {
//     ".": {
//       "import": "./dist/{{PACKAGE_NAME}}.js",
//       "require": "./dist/{{PACKAGE_NAME}}.cjs",
//       "types": "./dist/{{PACKAGE_NAME}}.d.ts"
//     }
//   },
//   "files": ["dist"],
//   "sideEffects": false,
//   "peerDependencies": {
//     "{{peer-dependency-name}}": "^{{peer-dependency-version}}"
//   },
//   "peerDependenciesMeta": {
//     "{{peer-dependency-name}}": { "optional": false }
//   }
// }

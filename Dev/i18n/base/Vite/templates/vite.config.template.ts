// vite.config.ts
//
// Generic dev+build config skeleton for framework-agnostic Vite projects.
// Delete whichever {{SHAPE}} block does not apply to this project — keep exactly one.
// See Dev/i18n/base/Vite/rules/02-architecture-vite.md for the four supported shapes.

import { resolve } from 'node:path'
import { defineConfig } from 'vite'
// {{IF_SHAPE_LIBRARY}} import dts from 'vite-plugin-dts'

export default defineConfig(({ mode, command }) => ({
  plugins: [
    // {{CUSTOM_PLUGINS}} — import from ./vite-plugins/vite-plugin-{{purpose}}.ts, one per concern
    // {{IF_SHAPE_LIBRARY}} dts({ rollupTypes: true }),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  // {{IF_SECRETS_NEVER_HERE}} — never move a secret into `define`; see 11-security-vite.md
  define: {
    // __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },

  // Only override if the project needs a non-default prefix (audit the change — see 11-security-vite.md)
  // envPrefix: 'VITE_',

  server: {
    port: 5173,
    strictPort: true,
    headers: {
      // Dev-only headers — production CSP must be enforced by the real server/CDN
      'X-Content-Type-Options': 'nosniff',
    },
  },

  preview: {
    port: 4173,
  },

  build: {
    target: 'es2022',
    sourcemap: mode === 'production' ? false : true,
    chunkSizeWarningLimit: 500, // KB

    // ============================================================
    // {{SHAPE: vanilla-spa}} — nothing extra needed; index.html at
    // project root is the implicit entry.
    // ============================================================

    // ============================================================
    // {{SHAPE: library}} — see templates/library-entry.template.ts
    // ============================================================
    // lib: {
    //   entry: resolve(__dirname, 'src/index.ts'),
    //   formats: ['es', 'cjs'],
    //   fileName: (format) => `{{PACKAGE_NAME}}.${format === 'es' ? 'js' : 'cjs'}`,
    // },
    // rollupOptions: {
    //   external: [/* peer deps, e.g. 'some-peer-lib' */],
    // },

    // ============================================================
    // {{SHAPE: multi-page}} — object map of page name -> HTML path
    // ============================================================
    // rollupOptions: {
    //   input: {
    //     main: resolve(__dirname, 'index.html'),
    //     about: resolve(__dirname, 'about.html'),
    //     admin: resolve(__dirname, 'admin/index.html'),
    //   },
    // },

    // ============================================================
    // Vite 8 / Rolldown (default) code splitting — replaces the
    // object form of manualChunks (removed under Rolldown).
    // ============================================================
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor', test: /node_modules/ },
          ],
        },
      },
    },
    // Legacy Rollup mode (Rolldown explicitly disabled) — use instead:
    // rollupOptions: { output: { manualChunks: { vendor: ['some-lib'] } } },
  },

  // ============================================================
  // {{SHAPE: worker-wasm}} — worker build options (chunk format)
  // ============================================================
  worker: {
    format: 'es',
  },

  test: {
    globals: true,
    environment: 'node', // 'jsdom' only if src/ code touches document/window directly
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.d.ts', '**/*.config.*', 'src/main.ts'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
}))

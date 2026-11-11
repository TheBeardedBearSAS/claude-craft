// System palette changes (forced colours switched on or off, light / dark system palette). A canvas keeps the colours
// it was drawn with, so the charts (BurndownView) and the dependency graph (DepsView) read `palette.version` and are
// rebuilt when it changes; in forced colours their tokens become system colours (views.css).
export const palette = $state({ version: 0 });

if (typeof globalThis.matchMedia === 'function') {
  for (const query of ['(forced-colors: active)', '(prefers-color-scheme: dark)']) {
    globalThis.matchMedia(query).addEventListener('change', () => palette.version++);
  }
}

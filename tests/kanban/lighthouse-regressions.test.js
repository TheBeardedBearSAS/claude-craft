import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Regression guards for the "Lighthouse 100 on every board screen" goal.
// Each assertion locks in a fix for a specific audit that scored < 100 in the
// baseline (see scratchpad harness): SEO meta-description, Best-Practices
// console/CSP errors (data: font inlining + favicon 404), and Accessibility
// (aria-prohibited-attr on avatars + color-contrast on the faint text tier).
// Written BEFORE the fixes — they fail on the pre-fix tree (true TDD).

const here = path.dirname(fileURLToPath(import.meta.url));
const CLIENT = path.resolve(here, '../../cli/kanban/client');
const read = (rel) => readFileSync(path.join(CLIENT, rel), 'utf8');

describe('SEO — meta description', () => {
  it('index.html declares a non-empty meta description', () => {
    const html = read('index.html');
    const m = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    expect(m, 'missing <meta name="description">').not.toBeNull();
    expect(m[1].trim().length).toBeGreaterThan(20);
  });
});

describe('Best Practices — no console / CSP errors', () => {
  it('declares a favicon so the browser does not 404 on /favicon.ico', () => {
    const html = read('index.html');
    expect(/<link\s+rel=["']icon["']/i.test(html), 'missing <link rel="icon">').toBe(true);
  });

  it('vite disables asset inlining so fonts stay self-hosted files (no data: URIs blocked by CSP)', () => {
    const cfg = read('vite.config.js');
    // assetsInlineLimit: 0 forces every font to a same-origin file URL,
    // eliminating the data:font/woff base64 URLs that violate `default-src 'self'`.
    expect(/assetsInlineLimit\s*:\s*0\b/.test(cfg), 'vite build.assetsInlineLimit must be 0').toBe(true);
  });

  it('index.html CSP declares font-src (else self-hosted fonts fall back to default-src)', () => {
    // A build without an explicit `font-src` made the browser fall back to
    // `default-src 'self'` and log "font-src was not explicitly set" for every
    // glyph. The directive must be present in the meta CSP.
    const html = read('index.html');
    const csp = html.match(/Content-Security-Policy["']\s+content="([^"]+)"/i);
    expect(csp, 'missing meta Content-Security-Policy').not.toBeNull();
    expect(/font-src\s+[^;]+/.test(csp[1]), 'CSP must declare font-src').toBe(true);
  });

  it('DepsView normalises oklch design tokens for the cytoscape canvas renderer', () => {
    // getComputedStyle resolves the oklch() tokens to lab()/oklch() strings that
    // cytoscape's parser rejects → ~20 "style property `…: lab(…)` is invalid" +
    // "Custom function mappers may not return invalid values" warnings, and the
    // node status colour is lost. normalizeColor() rasterises them back to sRGB.
    const deps = read('src/views/DepsView.svelte');
    expect(/normalizeColor/.test(deps), 'DepsView must route resolved tokens through normalizeColor').toBe(true);
  });

  it('DepsView avoids the deprecated cytoscape width/height:"label" auto-sizing', () => {
    // cytoscape 3.34 logs "The style value of `label` is deprecated for width/height".
    // Node dimensions come from estimateNodeWidth/NODE_HEIGHT instead.
    const deps = read('src/views/DepsView.svelte');
    expect(/width:\s*['"]label['"]/.test(deps), 'must not use width: "label"').toBe(false);
    expect(/height:\s*['"]label['"]/.test(deps), 'must not use height: "label"').toBe(false);
    expect(/estimateNodeWidth/.test(deps), 'node width must come from estimateNodeWidth').toBe(true);
  });
});

describe('Accessibility — single main landmark', () => {
  it('no view component renders its own <main> (the App shell owns the sole <main>)', () => {
    // axe landmark-no-duplicate-main / landmark-main-is-top-level fired on a
    // nested <main> in SprintsView while App already wraps views in <main id="main">.
    const views = ['KanbanView', 'BacklogView', 'SprintsView', 'BurndownView', 'DepsView', 'DocsView'];
    for (const v of views) {
      const src = read(`src/views/${v}.svelte`);
      expect(/<main[\s>]/.test(src), `${v}.svelte must not declare a <main>`).toBe(false);
    }
  });
});

describe('Performance — heavy viz off the LCP critical path', () => {
  const deps = read('src/views/DepsView.svelte');

  it('cytoscape is dynamically imported, not a static top-level import', () => {
    // A static `import cytoscape from 'cytoscape'` would bundle 435 KB into the
    // view chunk and load it on the LCP critical path.
    expect(/import\s+cytoscape\s+from/.test(deps), 'cytoscape must not be a static import').toBe(false);
    expect(/import\(\s*['"]cytoscape['"]\s*\)/.test(deps), 'cytoscape must be dynamically imported').toBe(true);
  });

  it('the graph build is deferred until after the load event (no bandwidth contention during LCP)', () => {
    expect(/addEventListener\(\s*['"]load['"]/.test(deps), 'must defer viz init to the load event').toBe(true);
  });
});

describe('Accessibility — aria-prohibited-attr', () => {
  it('the avatar carries role="img" so its aria-label is permitted', () => {
    const svelte = read('src/components/Avatar.svelte');
    // A <span> with aria-label but no role is flagged by axe (aria-prohibited-attr).
    // Both branches (assigned + unassigned) use aria-label, so both need a role.
    const spanBlocks = svelte.split('<span').slice(1);
    const ariaSpans = spanBlocks.filter((s) => /aria-label/.test(s.slice(0, s.indexOf('>'))));
    expect(ariaSpans.length).toBeGreaterThan(0);
    for (const s of ariaSpans) {
      const openTag = s.slice(0, s.indexOf('>'));
      expect(/role=["']img["']/.test(openTag), `avatar span missing role="img": ${openTag.trim()}`).toBe(true);
    }
  });
});

// --- OKLCH → sRGB → WCAG relative luminance (Björn Ottosson matrices) ---
function oklchToLinearRgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  let l = L + 0.3963377774 * a + 0.2158037573 * b;
  let m = L - 0.1055613458 * a - 0.0638541728 * b;
  let s = L - 0.0894841775 * a - 1.291485548 * b;
  l = l ** 3;
  m = m ** 3;
  s = s ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
function relLuminance(L, C, h) {
  const [r, g, b] = oklchToLinearRgb(L, C, h).map((v) => Math.max(0, Math.min(1, v)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(fg, bg) {
  const Lf = relLuminance(...fg);
  const Lb = relLuminance(...bg);
  const [hi, lo] = Lf > Lb ? [Lf, Lb] : [Lb, Lf];
  return (hi + 0.05) / (lo + 0.05);
}
function token(css, name) {
  const m = css.match(new RegExp(`--${name}:\\s*oklch\\(([^)]+)\\)`));
  if (!m) throw new Error(`token --${name} not found`);
  const [L, C, h] = m[1].trim().split(/\s+/).map(Number);
  return [L, C, h];
}

describe('Accessibility — color contrast (WCAG AA, small text ≥ 4.5:1)', () => {
  const css = read('src/app.css');
  // The lightest surface that ever hosts faint/dim text (proj-card, search kbd,
  // sprint-pill, chips). Passing here implies passing on every darker surface.
  const lightestSurface = '--bg-elev-2'; // oklch(0.245 …) — worst case

  for (const fgName of ['--fg-faint', '--fg-dim']) {
    it(`${fgName} reaches 4.5:1 against ${lightestSurface}`, () => {
      const ratio = contrast(token(css, fgName.slice(2)), token(css, lightestSurface.slice(2)));
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  }

  it('sanity: the converter reproduces the baseline failing ratio (~3.7) for the old faint value', () => {
    // oklch(0.55 0.012 264) on oklch(0.205) was reported by Lighthouse at ~3.71.
    const ratio = contrast([0.55, 0.012, 264], [0.205, 0.013, 264]);
    expect(ratio).toBeGreaterThan(3.4);
    expect(ratio).toBeLessThan(4.0);
  });
});

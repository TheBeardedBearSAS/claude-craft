import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ACCENTS, PRIORITY, TDD } from '../../cli/kanban/client/src/lib/config.js';

// WCAG 1.4.3 (text >= 4.5:1) and 1.4.11 (controls, borders, focus ring >= 3:1) for every
// text/background and control/background pair the Kanban UI really uses (audit K-30).
// Colours are the oklch tokens of app.css; alpha layers are composited in encoded sRGB, like a browser.

const here = path.dirname(fileURLToPath(import.meta.url));
const CSS = readFileSync(path.resolve(here, '../../cli/kanban/client/src/app.css'), 'utf8');

// --- oklch -> sRGB (Bjorn Ottosson matrices) ---
function parseOklch(str) {
  const m = str.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/);
  if (!m) throw new Error(`not an oklch() colour: ${str}`);
  return { L: +m[1], C: +m[2], h: +m[3], a: m[4] === undefined ? 1 : +m[4] };
}

function toLinear({ L, C, h }) {
  const r = (h * Math.PI) / 180;
  const a = C * Math.cos(r);
  const b = C * Math.sin(r);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const encode = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
const decode = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

/** Encoded sRGB triple (0..1) of an oklch colour, opaque. */
const rgb = (color) => toLinear(color).map((v) => encode(clamp01(v)));

/** `fg` (with its own alpha, optionally overridden) over an opaque encoded-sRGB `bg`. */
const over = (fg, bg, alpha = fg.a) => rgb(fg).map((c, i) => alpha * c + (1 - alpha) * bg[i]);

function luminance(encoded) {
  const [r, g, b] = encoded.map(decode);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(fg, bg) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// --- tokens ---
function tokens() {
  const root = CSS.match(/:root\s*{([\s\S]*?)\n}/)[1];
  const out = {};
  for (const [, name, value] of root.matchAll(/--([\w-]+):\s*(oklch\([^;]+\));/g)) out[name] = parseOklch(value);
  return out;
}
const T = tokens();
const tok = (name) => {
  if (!T[name]) throw new Error(`token --${name} not found in :root of app.css`);
  return T[name];
};
const opaque = (name) => rgb(tok(name));

const SURFACES = ['bg', 'bg-sidebar', 'bg-topbar', 'bg-elev', 'bg-elev-2', 'bg-inset'];
const ACCENT_NAMES = Object.keys(ACCENTS);
const accent = (name, key) => parseOklch(ACCENTS[name][key]);

/** Selected-sprint style background: the accent at 13 % over a surface. */
const accentSoftOver = (name, surface) => over(accent(name, 'a'), opaque(surface), 0.13);

const AA_TEXT = 4.5;
const AA_UI = 3;

describe('contrast — text on surfaces (>= 4.5:1)', () => {
  for (const fg of ['fg', 'fg-dim', 'fg-faint']) {
    for (const surface of SURFACES) {
      it(`${fg} on ${surface}`, () => {
        expect(ratio(opaque(fg), opaque(surface))).toBeGreaterThanOrEqual(AA_TEXT);
      });
    }
  }

  for (const name of ACCENT_NAMES) {
    for (const fg of ['fg', 'fg-dim', 'fg-faint']) {
      for (const surface of ['bg', 'bg-sidebar', 'bg-elev']) {
        it(`${fg} on the selected state (${name} accent at 13% over ${surface})`, () => {
          expect(ratio(opaque(fg), accentSoftOver(name, surface))).toBeGreaterThanOrEqual(AA_TEXT);
        });
      }
    }
  }

  for (const name of ['danger', 'success', 'warning']) {
    it(`${name} text on bg and bg-elev`, () => {
      for (const surface of ['bg', 'bg-elev']) {
        expect(ratio(opaque(name), opaque(surface))).toBeGreaterThanOrEqual(AA_TEXT);
      }
    });
  }

  // A status colour used as text on its own "soft" background (hover of the destructive button, error summaries):
  // the hovered state must keep 4.5:1 too. WebKit keeps :hover on the button behind a modal, which is how axe saw it.
  for (const name of ['danger', 'success']) {
    it(`${name} text on --${name}-soft over bg and bg-elev`, () => {
      for (const surface of ['bg', 'bg-elev']) {
        const soft = over(tok(name), opaque(surface), tok(`${name}-soft`).a);
        expect(ratio(opaque(name), soft), surface).toBeGreaterThanOrEqual(AA_TEXT);
      }
    });
  }
});

describe('contrast — accents (>= 4.5:1)', () => {
  for (const name of ACCENT_NAMES) {
    it(`${name}: text on accent`, () => {
      expect(ratio(rgb(parseOklch(ACCENTS[name].f)), rgb(accent(name, 'a')))).toBeGreaterThanOrEqual(AA_TEXT);
    });
    it(`${name}: text on accent-dim (hover of the primary button)`, () => {
      expect(ratio(rgb(parseOklch(ACCENTS[name].f)), rgb(accent(name, 'd')))).toBeGreaterThanOrEqual(AA_TEXT);
    });
    it(`${name}: accent text on bg, bg-elev and the selected state`, () => {
      const fg = rgb(accent(name, 'a'));
      for (const surface of ['bg', 'bg-sidebar', 'bg-elev']) {
        expect(ratio(fg, opaque(surface))).toBeGreaterThanOrEqual(AA_TEXT);
        expect(ratio(fg, accentSoftOver(name, surface))).toBeGreaterThanOrEqual(AA_TEXT);
      }
    });
  }

  it('the default accent is lime (visual identity)', () => {
    expect(tok('accent').h).toBe(parseOklch(ACCENTS.lime.a).h);
    expect(tok('accent').L).toBe(parseOklch(ACCENTS.lime.a).L);
  });
});

describe('contrast — chips on cards, normal and hovered (>= 4.5:1)', () => {
  const chipTokens = [
    ...Object.entries(PRIORITY).map(([key, v]) => [`priority ${key}`, v.cssVar, 0.16]),
    ...Object.entries(TDD)
      .filter(([, v]) => v.cssVar.startsWith('--tdd'))
      .map(([key, v]) => [`tdd ${key}`, v.cssVar, 0.15]),
  ];
  for (const [label, cssVar, alpha] of chipTokens) {
    for (const card of ['bg-elev', 'bg-elev-2']) {
      it(`${label} chip on ${card}`, () => {
        const fg = tok(cssVar.slice(2));
        const bg = over(fg, opaque(card), alpha);
        expect(ratio(rgb(fg), bg)).toBeGreaterThanOrEqual(AA_TEXT);
      });
    }
  }
});

describe('contrast — controls, borders and focus ring (>= 3:1)', () => {
  for (const surface of ['bg', 'bg-sidebar', 'bg-topbar', 'bg-elev', 'bg-elev-2', 'bg-inset']) {
    it(`border-control (fields, buttons, toggles) on ${surface}`, () => {
      expect(ratio(opaque('border-control'), opaque(surface))).toBeGreaterThanOrEqual(AA_UI);
    });
  }

  for (const name of ACCENT_NAMES) {
    for (const surface of SURFACES) {
      it(`focus ring (${name} accent) on ${surface}`, () => {
        expect(ratio(rgb(accent(name, 'a')), opaque(surface))).toBeGreaterThanOrEqual(AA_UI);
      });
    }
  }
});

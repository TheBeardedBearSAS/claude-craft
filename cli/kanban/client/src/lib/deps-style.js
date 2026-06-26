// Pure helpers for the cytoscape dependency graph (no DOM, no cytoscape) —
// unit-tested in tests/kanban/deps-style.test.js.
//
// Console-warning fix (deps view): the acid-lime design tokens are authored in
// `oklch()`. getComputedStyle resolves CSS custom properties to their computed
// value — a `lab()`/`oklch()` string in modern Chrome — which cytoscape's canvas
// colour parser cannot read. It logged ~20 "style property `…: lab(…)` is
// invalid" + "Custom function mappers may not return invalid values" warnings
// and dropped the node status colour. We detect such values and let the caller
// normalise them through a Canvas 2D context (its `fillStyle` setter parses any
// CSS Color 4 value and serialises it back to an sRGB string cytoscape accepts).

/** CSS Color 4 functions cytoscape's parser rejects. */
const CSS_COLOR4 = /\b(?:lab|lch|oklab|oklch|color)\(/i;

/**
 * @param {unknown} color
 * @returns {boolean} true when `color` is a CSS Color 4 value cytoscape can't parse.
 */
export function needsColorNormalization(color) {
  return typeof color === 'string' && CSS_COLOR4.test(color);
}

/**
 * Normalise a CSS colour to a value cytoscape's canvas renderer understands.
 * sRGB values (hex/rgb/named) pass straight through. lab()/oklch()/color()
 * values are *rasterised* — painted onto a 1px canvas and read back as raw RGBA
 * bytes — yielding an `rgb()`/`rgba()` string. Reading `ctx.fillStyle` back is
 * NOT enough: modern Chrome preserves the colour space, so `fillStyle = 'lab(…)'`
 * round-trips to `lab(…)`, which cytoscape still rejects. getImageData forces sRGB.
 * @param {string} color
 * @param {CanvasRenderingContext2D|null} [ctx] - injected for testability.
 * @returns {string} an sRGB colour, or `color` unchanged when no ctx is available.
 */
export function normalizeColor(color, ctx) {
  if (!needsColorNormalization(color)) return color;
  if (!ctx || typeof ctx.getImageData !== 'function') return color;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${+(a / 255).toFixed(3)})`;
}

// Node label box sizing — replaces cytoscape's deprecated `width/height: 'label'`
// auto-sizing (3.34 logs "The style value of `label` is deprecated for width").
// JetBrains Mono 11px ≈ 6.7px per glyph; PAD_X mirrors the 10px+10px padding.
const CHAR_W = 6.7;
const PAD_X = 20;
const MIN_W = 24;

/** Height = 11px line + 7px+7px vertical padding ≈ 28px. */
export const NODE_HEIGHT = 28;

/**
 * Deterministic node width from its label (monospace), in px.
 * @param {unknown} label
 * @returns {number} integer width, never below MIN_W.
 */
export function estimateNodeWidth(label, { charW = CHAR_W, padX = PAD_X, min = MIN_W } = {}) {
  const text = String(label ?? '');
  return Math.max(min, Math.round(text.length * charW + padX));
}

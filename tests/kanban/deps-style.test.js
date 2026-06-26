import { describe, it, expect } from 'vitest';
import {
  needsColorNormalization,
  normalizeColor,
  estimateNodeWidth,
  NODE_HEIGHT,
} from '../../cli/kanban/client/src/lib/deps-style.js';

// Regression guards for the cytoscape console warnings observed on the deps
// graph (Wrandly project): the acid-lime design tokens are authored in oklch();
// getComputedStyle resolves them to lab()/oklch() strings, which cytoscape's
// canvas colour parser rejects → 20+ "style property `… : lab(…)` is invalid"
// + "Custom function mappers may not return invalid values" warnings, and the
// nodes lose their status colour. A canvas 2D context normalises any CSS Color 4
// value back to an sRGB string cytoscape understands. Written BEFORE the fix.

describe('needsColorNormalization', () => {
  it('flags CSS Color 4 values cytoscape cannot parse', () => {
    for (const c of [
      'lab(32.6566% -.301272 -5.22689)',
      'lch(58% 67 28)',
      'oklab(0.7 -0.1 -0.04)',
      'oklch(0.165 0.012 264)',
      'color(display-p3 0.5 0.2 0.9)',
      'LAB(50% 0 0)', // case-insensitive
    ]) {
      expect(needsColorNormalization(c), c).toBe(true);
    }
  });

  it('leaves sRGB values cytoscape already understands untouched', () => {
    for (const c of ['#111', '#c5f72b', 'rgb(20, 20, 20)', 'rgba(0,0,0,.5)', 'red', 'monospace']) {
      expect(needsColorNormalization(c), c).toBe(false);
    }
  });

  it('is null/undefined safe', () => {
    expect(needsColorNormalization('')).toBe(false);
    expect(needsColorNormalization(undefined)).toBe(false);
    expect(needsColorNormalization(null)).toBe(false);
  });
});

describe('normalizeColor', () => {
  // A stub mimicking a 1px CanvasRenderingContext2D: getImageData returns fixed
  // RGBA bytes, the way a real canvas rasterises a painted colour to sRGB.
  const fakeCtx = (rgba = [51, 102, 153, 255]) => ({
    fillStyle: '#000',
    fillRect() {},
    getImageData: () => ({ data: rgba }),
  });

  it('passes already-sRGB colours straight through (no canvas needed)', () => {
    expect(normalizeColor('#c5f72b', null)).toBe('#c5f72b');
    expect(normalizeColor('rgb(1,2,3)', fakeCtx())).toBe('rgb(1,2,3)');
  });

  it('rasterises lab()/oklch() to an sRGB rgb() string cytoscape accepts', () => {
    expect(normalizeColor('oklch(0.165 0.012 264)', fakeCtx())).toBe('rgb(51, 102, 153)');
    expect(normalizeColor('lab(32% -.3 -5)', fakeCtx())).toBe('rgb(51, 102, 153)');
  });

  it('preserves alpha via rgba() when not fully opaque', () => {
    expect(normalizeColor('oklch(0.5 0.1 200 / 0.5)', fakeCtx([10, 20, 30, 128]))).toBe('rgba(10, 20, 30, 0.502)');
  });

  it('returns the input unchanged when no usable context is available (fallback)', () => {
    expect(normalizeColor('oklch(0.165 0.012 264)', null)).toBe('oklch(0.165 0.012 264)');
    expect(normalizeColor('lab(32% -.3 -5)', {})).toBe('lab(32% -.3 -5)');
  });
});

describe('estimateNodeWidth / NODE_HEIGHT', () => {
  it('replaces the deprecated cytoscape width/height:"label" auto-sizing', () => {
    // cytoscape 3.34 warns "The style value of `label` is deprecated for width".
    // A deterministic char-count estimate sizes the node without the literal.
    expect(estimateNodeWidth('A')).toBeLessThan(estimateNodeWidth('US-E4-08b-FIN'));
    expect(typeof NODE_HEIGHT).toBe('number');
    expect(NODE_HEIGHT).toBeGreaterThan(0);
  });

  it('never goes below a sane minimum and is integer-valued', () => {
    const w = estimateNodeWidth('');
    expect(w).toBeGreaterThanOrEqual(24);
    expect(Number.isInteger(w)).toBe(true);
  });

  it('is null/undefined safe', () => {
    expect(estimateNodeWidth(undefined)).toBeGreaterThanOrEqual(24);
    expect(estimateNodeWidth(null)).toBeGreaterThanOrEqual(24);
  });
});

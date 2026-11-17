import { describe, it, expect } from 'vitest';
import { byCodeUnit, descriptionFromFrontmatter, trimTrailingPathPunctuation } from '../../scripts/lib/plugin-text.mjs';

// The helpers replace regular expressions flagged by SonarCloud (S8786) and bare sorts (S2871): they must give
// exactly the former results, otherwise the generated marketplaces would change.
const oldTrim = (s) => s.replace(/[./-]+$/, '');
const oldDescription = (text) => /^description:\s*(.*)$/m.exec(text)?.[1]?.replace(/^["']|["']$/g, '') ?? '';

const TRIM_CASES = [
  '',
  'a',
  'a.',
  'a/b.md',
  'a/b.md.',
  'a/b/',
  'a-b--',
  '...',
  '/',
  'a.b.c../',
  'x-.-/.',
  'é.',
  'a/b-c.md)',
];
const DESC_CASES = [
  '',
  'name: x',
  'description: Plain text',
  'description:   spaced',
  'description: "Quoted: with colon"',
  "description: 'single'",
  'name: x\ndescription: second line\nother: y',
  'x\r\ndescription: crlf\r\nz: 1',
  'description:\nnext line value',
  'description: ',
  'not description: inside a line\ndescription: real',
  'description: "unterminated',
  'description: trailing"',
  'description: ""',
  'description: a\ndescription: b',
];

describe('plugin-text helpers', () => {
  it.each(TRIM_CASES)('trimTrailingPathPunctuation(%j) equals the former regex', (input) => {
    expect(trimTrailingPathPunctuation(input)).toBe(oldTrim(input));
  });

  it.each(DESC_CASES)('descriptionFromFrontmatter(%j) equals the former regex', (input) => {
    expect(descriptionFromFrontmatter(input)).toBe(oldDescription(input));
  });

  it('runs in linear time on adversarial input', () => {
    const start = performance.now();
    trimTrailingPathPunctuation(`${'a.'.repeat(200000)}x${'./-'.repeat(200000)}`);
    descriptionFromFrontmatter(`${' description:'.repeat(50000)}\n${' '.repeat(100000)}`);
    expect(performance.now() - start).toBeLessThan(1000);
  });

  it('byCodeUnit orders exactly like a bare sort()', () => {
    const items = [
      'b',
      'B',
      'a',
      'é',
      'z',
      '_x',
      '-y',
      'bear-hooks',
      'bear-hooks-full',
      'bear-hooks-memory',
      'a/b',
      'a.b',
    ];
    expect([...items].sort(byCodeUnit)).toEqual([...items].sort());
  });
});

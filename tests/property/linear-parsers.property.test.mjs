// SonarCloud S8786: the parsers below used regular expressions with super-linear backtracking.
// Each rewrite is checked against the regular expression it replaces (the oracle) on generated
// input, and against an adversarial input that took quadratic time before.
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { splitFrontmatter } from '../../cli/kanban/server/services/frontmatter.js';
import { splitTags } from '../../cli/kanban/client/src/lib/markdown.js';
import { sprintSlug, parseSprintGoal } from '../../cli/kanban/server/services/sprint-ops.js';
import { slugify, splitItem } from '../../cli/kanban/server/services/story-files.js';
import { extractVersion } from '../../scripts/collect-freshness-signals.mjs';
import { PRICE_RE, loadTruth, scanText } from '../../scripts/scan-claude-claims.mjs';

const textOf = (alphabet, maxLength = 40) =>
  fc.array(fc.constantFrom(...alphabet), { maxLength }).map((chars) => chars.join(''));

// Pathological inputs must parse in well under the time the old patterns needed (seconds).
const fast = (fn) => {
  const start = performance.now();
  fn();
  return performance.now() - start;
};
const N = 50_000;

describe('splitFrontmatter', () => {
  const OLD = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n)?([\s\S]*)$/;
  const oracle = (raw) => {
    const m = OLD.exec(raw);
    return m ? [m[1], m[2]] : null;
  };

  it('matches the former regular expression', () => {
    fc.assert(
      fc.property(textOf(['-', '-', '-', '\n', '\r', ' ', '\t', 'a', ':']), (body) => {
        for (const raw of [body, `---\n${body}`, `---\r\n${body}`]) expect(splitFrontmatter(raw)).toEqual(oracle(raw));
      }),
      { numRuns: 2000 }
    );
  });

  it('is linear on an unterminated block', () => {
    expect(fast(() => splitFrontmatter(`---\n${'\r\n-'.repeat(N)}`))).toBeLessThan(200);
  });
});

describe('splitTags', () => {
  it('matches String#split on /(<[^>]*>)/', () => {
    fc.assert(
      fc.property(textOf(['<', '>', 'a', ' ', '/']), (html) => {
        expect(splitTags(html)).toEqual(html.split(/(<[^>]*>)/));
      }),
      { numRuns: 2000 }
    );
  });

  it('is linear on unclosed tags', () => {
    expect(fast(() => splitTags('<'.repeat(N)))).toBeLessThan(200);
  });
});

describe('slugs', () => {
  it('sprintSlug and slugify match the former trims', () => {
    const oldSprint = (name) =>
      name
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 40)
        .replace(/^-+|-+$/g, '') || 'sprint';
    const oldStory = (title) =>
      title
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+/, '')
        .slice(0, 50)
        .replace(/-+$/, '') || 'story';
    fc.assert(
      fc.property(textOf(['-', ' ', 'a', 'B', 'é', '9', '!'], 80), (name) => {
        expect(sprintSlug(name)).toBe(oldSprint(name));
        expect(slugify(name)).toBe(oldStory(name));
      }),
      { numRuns: 2000 }
    );
  });
});

describe('parseSprintGoal', () => {
  const oneLine = (text) => text.replace(/\s+/g, ' ').trim();
  const oldGoal = (text) => {
    const section = /^##\s+Sprint Goal\s*\n([\s\S]*?)(?=^##\s|(?![\s\S]))/m.exec(text)?.[1] ?? '';
    return oneLine(section.replace(/^\s*>\s?/gm, '').replace(/^\s*["“”]|["“”]\s*$/g, ''));
  };
  const oldName = (text, id) =>
    (/^#\s+(.+)$/m.exec(text)?.[1] ?? '').replace(/^Sprint\s*\d+\s*[:—–-]?\s*/i, '').trim() || id;
  const LINES = [
    '# Sprint 3 : Paiement',
    '# Titre ',
    '## Sprint Goal',
    '## Sprint Goal  ',
    '## Sprint Goal\r',
    '##',
    '## Informations',
    '> Livrer le paiement',
    '>  "Livrer" ',
    '  > “cité”',
    '>',
    '',
    ' ',
    '\r',
    'texte libre',
    '| Début | 2026-01-05 |',
  ];

  it('matches the former regular expressions on sprint-goal.md shaped files', () => {
    fc.assert(
      fc.property(fc.array(fc.constantFrom(...LINES), { maxLength: 12 }), (lines) => {
        const text = lines.join('\n');
        const parsed = parseSprintGoal(text, 'sprint-x');
        expect(parsed.goal).toBe(oldGoal(text));
        expect(parsed.name).toBe(oldName(text, 'sprint-x'));
      }),
      { numRuns: 3000 }
    );
  });

  it('is linear on long whitespace and quote runs', () => {
    expect(fast(() => parseSprintGoal(`## Sprint Goal\n${'>'.repeat(N)}\n#${' '.repeat(N)}`, 'x'))).toBeLessThan(200);
  });
});

describe('splitItem', () => {
  const OLD = /^(\s*[-*]\s+\*\*)([^*]+?)(\*\*\s*:\s*)(.*?)(\s*)$/;

  it('matches the former regular expression on metadata lines', () => {
    fc.assert(
      fc.property(textOf(['-', '*', ' ', '\t', ':', 'a', 'B'], 30), textOf([' ', '\r', 'v', ':'], 10), (head, tail) => {
        for (const line of [
          head + tail,
          `- **Points**${tail}`,
          `- **Points**:${tail}`,
          `  * **Epic** : ${head}${tail}`,
        ]) {
          const m = OLD.exec(line);
          expect(splitItem(line)).toEqual(m ? m.slice(1, 6) : null);
        }
      }),
      { numRuns: 2000 }
    );
  });

  it('is linear on trailing whitespace', () => {
    expect(fast(() => splitItem(`- **Points**: 3${' '.repeat(N)}x`))).toBeLessThan(200);
  });
});

describe('version and price extraction', () => {
  it('extractVersion matches the former regular expression', () => {
    const old = (tag) =>
      String(tag)
        .replace(/_/g, '.')
        .match(/\d+(?:\.\d+)+/)?.[0] ?? null;
    fc.assert(
      fc.property(textOf(['1', '2', '.', '_', 'v', '-']), (tag) => {
        expect(extractVersion(tag)).toBe(old(tag));
      }),
      { numRuns: 2000 }
    );
  });

  it('extractVersion is linear on a long digit run', () => {
    expect(fast(() => extractVersion('1'.repeat(N)))).toBeLessThan(200);
  });

  it('PRICE_RE matches the former regular expression', () => {
    const OLD = /\$(\d+(?:\.\d+)?)\s*\/\s*\$(\d+(?:\.\d+)?)|(\d+(?:[.,]\d+)?)\s?\$\s*\/\s*(\d+(?:[.,]\d+)?)\s?\$/g;
    const all = (re, line) => [...line.matchAll(re)].map((m) => [m.index, ...m]);
    fc.assert(
      fc.property(textOf(['1', '2', '.', ',', '$', '/', ' ', 'a']), (line) => {
        expect(all(PRICE_RE, line)).toEqual(all(OLD, line));
      }),
      { numRuns: 3000 }
    );
  });

  it('price scanning is linear on a long digit run', () => {
    expect(fast(() => scanText('x.md', '1'.repeat(N), loadTruth()))).toBeLessThan(500);
  });
});

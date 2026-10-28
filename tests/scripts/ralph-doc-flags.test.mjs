import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const RALPH_SH = path.join(PROJECT_ROOT, 'Tools/Ralph/ralph.sh');
const DOC_DIRS = [
  '.claude/commands',
  '.claude/agents',
  ...['base', 'en', 'fr', 'es', 'de', 'pt'].map((l) => `Dev/i18n/${l}`),
];
const EXTRA_FILES = ['Tools/Ralph/README.md'];

// `--name` not glued to a word char or `-` (skips `foo--bar`, `---`).
const FLAG_RE = /(?<![\w-])--([a-z][a-z0-9-]*)/g;

function listMd(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listMd(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

// Flags accepted by the `case` labels of `parse_args()` (`--config=*)`, `--help|-h)`...).
function parserFlags() {
  const src = fs.readFileSync(RALPH_SH, 'utf8');
  const body = src.slice(src.indexOf('parse_args() {'));
  const fn = body.slice(0, body.indexOf('\n}\n'));
  const flags = new Set();
  for (const [, label] of fn.matchAll(/^\s*([-\w=*|]+)\)\s*$/gm)) {
    for (const [, name] of label.matchAll(FLAG_RE)) flags.add(name);
  }
  return flags;
}

// `--xxx` written after `ralph.sh`, up to the closing backtick of the code span or end of line.
function documentedFlags(files) {
  const found = [];
  for (const file of files) {
    fs.readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        let idx = line.indexOf('ralph.sh');
        while (idx !== -1) {
          const rest = line.slice(idx + 'ralph.sh'.length);
          const end = rest.indexOf('`');
          const segment = end === -1 ? rest : rest.slice(0, end);
          for (const [, name] of segment.matchAll(FLAG_RE)) {
            found.push({ where: `${path.relative(PROJECT_ROOT, file)}:${i + 1}`, name });
          }
          idx = line.indexOf('ralph.sh', idx + 1);
        }
      });
  }
  return found;
}

describe('ralph.sh flags documented in docs exist in the parser', () => {
  it('parses a realistic set of flags from ralph.sh', () => {
    const flags = parserFlags();
    expect(flags.size).toBeGreaterThan(10);
    for (const f of ['config', 'continue', 'auto-detect', 'help']) expect(flags.has(f)).toBe(true);
  });

  it('every documented `ralph.sh --flag` is accepted by parse_args()', () => {
    const files = [
      ...DOC_DIRS.flatMap((d) => listMd(path.join(PROJECT_ROOT, d))),
      ...EXTRA_FILES.map((f) => path.join(PROJECT_ROOT, f)),
    ];
    const valid = parserFlags();
    const documented = documentedFlags(files);
    expect(documented.length).toBeGreaterThan(0);
    const unknown = documented.filter((d) => !valid.has(d.name)).map((d) => `${d.where} --${d.name}`);
    expect(unknown, `Flags unknown to ralph.sh:\n${unknown.join('\n')}`).toEqual([]);
  });
});

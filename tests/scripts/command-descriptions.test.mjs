import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import * as yaml from 'js-yaml';

/**
 * Garde-fou : toute commande slash DOIT exposer une `description` non vide dans
 * son frontmatter YAML.
 *
 * Pourquoi : `scripts/generate-references.mjs` lit la description via js-yaml
 * STRICT. Un frontmatter dont le YAML ne parse pas (ex: `argument-hint:
 * [a] [b]` interprété comme une séquence flow invalide, ou un `description:
 * Mot: ...` à deux-points non quoté) fait silencieusement tomber la description
 * à `_no description_` dans la doc générée — sans erreur. Ce test reproduit le
 * parsing de production et échoue si une commande perd sa description, que ce
 * soit par absence ou par frontmatter malformé.
 */

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');

// Mêmes layouts que scripts/generate-references.mjs :
//   - .claude/commands/<namespace>/<name>.md
//   - Dev|Infra|Project/i18n/<lang>/<Namespace>/commands/<name>.md
//   - Project/i18n/<lang>/commands/<name>.md
// Règle : tout fichier .md situé sous un répertoire littéralement nommé
// "commands" est une commande.
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

function listCommandFiles() {
  const files = new Set();
  for (const f of walk(path.join(PROJECT_ROOT, '.claude', 'commands'))) files.add(f);
  for (const base of ['Dev', 'Infra', 'Project']) {
    for (const f of walk(path.join(PROJECT_ROOT, base))) {
      if (f.split(path.sep).includes('commands')) files.add(f);
    }
  }
  return [...files].sort();
}

const COMMAND_FILES = listCommandFiles();

describe('command descriptions', () => {
  it('sanity: command files are discovered', () => {
    expect(COMMAND_FILES.length).toBeGreaterThan(100);
  });

  it('every command has a frontmatter block', () => {
    const offenders = COMMAND_FILES.filter((f) => {
      const raw = fs.readFileSync(f, 'utf8');
      return !FRONTMATTER_RE.test(raw);
    }).map((f) => path.relative(PROJECT_ROOT, f));

    expect(offenders, `${offenders.length} command(s) without a YAML frontmatter block`).toEqual([]);
  });

  it('every command frontmatter parses as strict YAML (no silent description drop)', () => {
    const offenders = [];
    for (const f of COMMAND_FILES) {
      const raw = fs.readFileSync(f, 'utf8');
      const match = FRONTMATTER_RE.exec(raw);
      if (!match) continue; // covered by the previous test
      try {
        yaml.load(match[1]);
      } catch (err) {
        offenders.push(`${path.relative(PROJECT_ROOT, f)} :: ${String(err.message).split('\n')[0]}`);
      }
    }
    expect(offenders, `${offenders.length} command(s) with malformed YAML frontmatter`).toEqual([]);
  });

  it('every command has a non-empty description', () => {
    const offenders = [];
    for (const f of COMMAND_FILES) {
      const raw = fs.readFileSync(f, 'utf8');
      const match = FRONTMATTER_RE.exec(raw);
      let data = null;
      if (match) {
        try {
          data = yaml.load(match[1]);
        } catch {
          // malformed YAML reported by the dedicated test ; still flag here so
          // a missing description never hides behind a parse error.
        }
      }
      const desc = data && typeof data === 'object' ? data.description : undefined;
      if (!desc || String(desc).trim() === '') {
        offenders.push(path.relative(PROJECT_ROOT, f));
      }
    }
    expect(offenders, `${offenders.length} command(s) missing a description`).toEqual([]);
  });
});

/**
 * Deprecation stubs (roadmap PM 86 → 34): an old command kept until 9.0 as a
 * redirect. Contract: `deprecated: true`, `replaced-by: /ns:cmd` pointing to a
 * live (non-deprecated) command of the same language, and a body small enough
 * (< 500 bytes) to be exempt from the i18n size-parity check.
 */
const STUB_MAX_BYTES = 500;

function frontmatterOf(raw) {
  const match = FRONTMATTER_RE.exec(raw);
  if (!match) return null;
  try {
    return yaml.load(match[1]);
  } catch {
    return null;
  }
}

// `/ns:cmd` -> candidate files next to the stub (same i18n language, or base).
function resolveCommand(stubFile, ref) {
  const m = /^\/([a-z][a-z0-9]*):([a-z0-9][a-z0-9-]*)$/.exec(ref ?? '');
  if (!m) return null;
  const [, ns, name] = m;
  const rel = path.relative(PROJECT_ROOT, stubFile).split(path.sep);
  if (rel[0] === '.claude') return [path.join(PROJECT_ROOT, '.claude/commands', ns, `${name}.md`)];
  const lang = rel[2];
  const out = [];
  for (const root of ['Dev', 'Infra', 'Project']) {
    for (const l of [lang, 'base']) {
      const langDir = path.join(PROJECT_ROOT, root, 'i18n', l);
      if (!fs.existsSync(langDir)) continue;
      if (ns === root.toLowerCase()) out.push(path.join(langDir, 'commands', `${name}.md`));
      for (const d of fs.readdirSync(langDir)) {
        if (d.toLowerCase() === ns) out.push(path.join(langDir, d, 'commands', `${name}.md`));
      }
    }
  }
  return out;
}

function stubViolations(file, raw) {
  const data = frontmatterOf(raw);
  if (!data || data.deprecated !== true) return [];
  const where = path.relative(PROJECT_ROOT, file);
  const out = [];
  if (Buffer.byteLength(raw) >= STUB_MAX_BYTES) out.push(`${where}: stub is ${Buffer.byteLength(raw)} bytes (max ${STUB_MAX_BYTES - 1})`);
  const candidates = resolveCommand(file, data['replaced-by']);
  if (!candidates) return [...out, `${where}: replaced-by must be "/ns:cmd", got ${JSON.stringify(data['replaced-by'])}`];
  const target = candidates.find((f) => fs.existsSync(f));
  if (!target) out.push(`${where}: replaced-by ${data['replaced-by']} does not resolve`);
  else if (frontmatterOf(fs.readFileSync(target, 'utf8'))?.deprecated === true) out.push(`${where}: replaced-by ${data['replaced-by']} is itself deprecated`);
  return out;
}

describe('deprecation stubs', () => {
  const sample = path.join(PROJECT_ROOT, 'Project/i18n/en/commands/sample-stub.md');

  it('accepts a small stub redirecting to a live command', () => {
    const raw = '---\ndescription: "Deprecated: use /project:backlog add story"\ndeprecated: true\nreplaced-by: /project:backlog\n---\n\nRun /project:backlog add story $ARGUMENTS.\n';
    expect(stubViolations(sample, raw)).toEqual([]);
  });

  it('rejects an unresolvable replaced-by, a missing one and an oversized body', () => {
    const fm = (by) => `---\ndescription: d\ndeprecated: true\n${by}---\n`;
    expect(stubViolations(sample, fm('replaced-by: /project:nope\n'))).toHaveLength(1);
    expect(stubViolations(sample, fm(''))).toHaveLength(1);
    expect(stubViolations(sample, fm('replaced-by: /project:backlog\n') + 'x'.repeat(600))).toHaveLength(1);
  });

  it('every deprecated command honours the stub contract', () => {
    const offenders = COMMAND_FILES.flatMap((f) => stubViolations(f, fs.readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});

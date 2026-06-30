import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

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

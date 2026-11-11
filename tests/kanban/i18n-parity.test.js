/**
 * Garde-fous i18n du Kanban (état FINAL : 5 langues, vues entièrement traduites).
 * Trois blocs indépendants pour que chaque agent voie ce qui le concerne :
 *  - locales parity              : en/fr/es/de/pt ont les mêmes clés, jetons et pluriels
 *  - keys used in source exist   : toute clé littérale t('…') / tn('…') existe dans en
 *  - no hard-coded attribute strings : plus de texte en dur dans aria-label / placeholder / title
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { SUPPORTED_LOCALES } from '../../cli/kanban/client/src/lib/i18n/translate.js';

const SRC = path.resolve(import.meta.dirname, '../../cli/kanban/client/src');
const LOCALES_DIR = path.join(SRC, 'lib/i18n/locales');
const ALLOWED_PREFIXES = [
  'app', 'nav', 'board', 'backlog', 'sprint', 'burndown', 'deps', 'docs', 'story', 'form',
  'error', 'a11y', 'settings', 'status', 'priority', 'tdd', 'toast', 'common',
]; // prettier-ignore
// Codes d'erreur du serveur (design §1.3 + app.js existant) : le client les traduit via error.<code>.
const SERVER_ERROR_CODES = [
  'invalid_json', 'invalid_payload', 'invalid_path', 'invalid_transition', 'invalid_result', 'forbidden',
  'readonly', 'read_only_source', 'not_found', 'conflict', 'locked', 'sprint_status_invalid',
  'payload_too_large', 'write_failed', 'events_disabled', 'archived', 'sprint_not_found',
  'no_backing_file', 'status_line_forbidden', 'id_collision', 'story_active', 'has_dependents',
  'task_not_found', 'sprint_exists', 'sprint_already_active', 'not_active',
]; // prettier-ignore
const TOKEN_RE = /\{(\w+)\}/g;

const localeFile = (code) => path.join(LOCALES_DIR, `${code}.js`);

async function loadCatalog(code) {
  const file = localeFile(code);
  if (!fs.existsSync(file)) return null;
  return (await import(pathToFileURL(file).href)).default;
}

const tokensOf = (text) =>
  [...String(text).matchAll(TOKEN_RE)]
    .map((m) => m[1])
    .sort()
    .join(',');
const lineOf = (text, index) => text.slice(0, index).split('\n').length;

function walk(dir, exts) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full, exts);
    return exts.some((e) => entry.name.endsWith(e)) ? [full] : [];
  });
}

const rel = (file) => path.relative(path.resolve(SRC, '../../../..'), file);
const en = await loadCatalog('en');

describe('locales parity', () => {
  it('has a catalog file for each supported locale', () => {
    const missing = SUPPORTED_LOCALES.filter((c) => !fs.existsSync(localeFile(c)));
    expect(missing, `missing locale files in ${rel(LOCALES_DIR)}`).toEqual([]);
  });

  it('en has no duplicated key in its source', () => {
    const src = fs.readFileSync(localeFile('en'), 'utf8');
    const keys = [...src.matchAll(/^\s*'([^']+)':/gm)].map((m) => m[1]);
    const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
    expect(dupes).toEqual([]);
  });

  it('en keys use an allowed zone prefix', () => {
    const bad = Object.keys(en).filter((k) => !ALLOWED_PREFIXES.includes(k.split('.')[0]));
    expect(bad).toEqual([]);
  });

  it('en defines error.<code> for every server error code, plus unknown and network', () => {
    const wanted = [...SERVER_ERROR_CODES.map((c) => `error.${c}`), 'error.unknown', 'error.network'];
    expect(wanted.filter((k) => !(k in en))).toEqual([]);
  });

  it('en plural keys come in .one / .other pairs', () => {
    const keys = new Set(Object.keys(en));
    const bad = [...keys].filter((k) => k.endsWith('.one') && !keys.has(k.replace(/\.one$/, '.other')));
    expect(bad).toEqual([]);
  });

  for (const code of SUPPORTED_LOCALES) {
    describe(code, () => {
      it('has no empty value', async () => {
        const cat = await loadCatalog(code);
        const empty = cat ? Object.entries(cat).filter(([, v]) => typeof v !== 'string' || v.trim() === '') : null;
        expect(
          empty?.map(([k]) => k),
          `catalog ${code} missing or has empty values`
        ).toEqual([]);
      });

      if (code === 'en') return;

      it('has exactly the keys of en', async () => {
        const cat = (await loadCatalog(code)) ?? {};
        const missing = Object.keys(en).filter((k) => !(k in cat));
        const extra = Object.keys(cat).filter((k) => !(k in en));
        expect({ missing, extra }, `key drift in ${code}`).toEqual({ missing: [], extra: [] });
      });

      it('uses the same {param} tokens as en for every key', async () => {
        const cat = (await loadCatalog(code)) ?? {};
        const bad = Object.keys(en)
          .filter((k) => k in cat && tokensOf(cat[k]) !== tokensOf(en[k]))
          .map((k) => `${k}: en {${tokensOf(en[k])}} vs ${code} {${tokensOf(cat[k])}}`);
        expect(bad).toEqual([]);
      });
    });
  }
});

describe('keys used in source exist', () => {
  const files = walk(SRC, ['.svelte', '.js']);
  const CALL_RE = /(?<![\w$.])(t|tn)\(\s*(['"])([A-Za-z][\w.-]*)\2/g;

  it('every literal t()/tn() key is defined in en', () => {
    const missing = [];
    for (const file of files) {
      const text = fs.readFileSync(file, 'utf8');
      for (const m of text.matchAll(CALL_RE)) {
        const [, fn, , key] = m;
        const ok = fn === 'tn' ? `${key}.other` in en : key in en;
        if (!ok) missing.push(`${rel(file)}:${lineOf(text, m.index)} ${fn}('${key}')`);
      }
    }
    expect(missing, 'keys missing from locales/en.js').toEqual([]);
  });
});

describe('every en key is used', () => {
  // Keys built at run time from a prefix (`t(\`status.${s}\`)`, errorKey → `error.<code>`, …): every key under one of
  // these prefixes counts as used. Any other key must appear quoted somewhere in src/ (t('…'), tn('…'), or a map of
  // keys such as LABELS / WARNING_TOASTS).
  const DYNAMIC_PREFIXES = [
    'error.', 'status.', 'priority.', 'tdd.', 'toast.gate.', 'board.empty.', 'board.legend.', 'board.wip.',
    'burndown.status.', 'common.sort.key.', 'settings.accent.', 'settings.density.', 'settings.language.',
    'settings.scheme.', 'sprint.state.',
  ]; // prettier-ignore
  const source = walk(SRC, ['.svelte', '.js'])
    .filter((f) => !f.startsWith(LOCALES_DIR))
    .map((f) => fs.readFileSync(f, 'utf8'))
    .join('\n');
  const quoted = new Set([...source.matchAll(/['"`]([A-Za-z][\w.-]*)['"`]/g)].map((m) => m[1]));

  it('has no key that nothing in src/ references (dead keys are removed from the 5 catalogues)', () => {
    const base = (k) => k.replace(/\.(one|other)$/, '');
    const unused = [...new Set(Object.keys(en).map(base))].filter(
      (k) => !quoted.has(k) && !DYNAMIC_PREFIXES.some((p) => k.startsWith(p))
    );
    expect(unused).toEqual([]);
  });
});

describe('no hard-coded attribute strings', () => {
  const files = walk(SRC, ['.svelte']);
  const ATTRS = 'aria-label|placeholder|title|alt|aria-description';
  const QUOTED_RE = new RegExp(`(?<![\\w-])(${ATTRS})="([^"]*)"`, 'g');
  const EXPR_RE = new RegExp(`(?<![\\w-])(${ATTRS})=\\{\\s*(['"\`])([\\s\\S]*?)\\2\\s*\\}`, 'g');
  const hasText = (value) => /\p{L}/u.test(value.replace(/\$?\{[^}]*\}/g, ''));

  it('has no literal text in aria-label / placeholder / title / alt', () => {
    const found = [];
    for (const file of files) {
      const text = fs.readFileSync(file, 'utf8').replace(/<style[\s\S]*?<\/style>/g, (s) => s.replace(/[^\n]/g, ' '));
      for (const re of [QUOTED_RE, EXPR_RE]) {
        for (const m of text.matchAll(re)) {
          const value = re === QUOTED_RE ? m[2] : m[3];
          if (hasText(value)) found.push(`${rel(file)}:${lineOf(text, m.index)} ${m[1]}="${value}"`);
        }
      }
    }
    expect(found, 'use t(…) instead of literal text').toEqual([]);
  });
});

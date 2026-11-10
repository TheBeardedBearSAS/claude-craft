import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Schéma officiel : { hooks: { <Event>: [ { matcher?, hooks: [ { type, command, timeout } ] } ] } }.
// Les entrées plates, un matcher contenant `(` (traité comme regex, ne correspond
// jamais à un nom d'outil), `once` (ignoré dans settings) et PostCompact (aucun canal
// vers le modèle) sont des erreurs silencieuses : on les interdit dans ce qu'on distribue.
const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const BASE_HOOKS = 'Dev/i18n/base/Common/hooks';
const FILES = [
  '.claude/settings.json',
  `${BASE_HOOKS}/templates/hooks.default.json`,
  `${BASE_HOOKS}/templates/hooks.full.json`,
];
const SCRIPTS_DIR = path.join(PROJECT_ROOT, BASE_HOOKS, 'scripts');

const load = (rel) => JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, rel), 'utf8'));
const handlers = (settings) =>
  Object.entries(settings.hooks).flatMap(([event, groups]) =>
    groups.flatMap((g) => g.hooks.map((h) => ({ event, g, h })))
  );

describe.each(FILES)('%s', (rel) => {
  const settings = load(rel);

  it('utilise le schéma imbriqué {matcher, hooks:[{type, command, timeout}]}', () => {
    for (const [event, groups] of Object.entries(settings.hooks)) {
      expect(Array.isArray(groups), event).toBe(true);
      for (const g of groups) {
        expect(Array.isArray(g.hooks), `${event} group`).toBe(true);
        expect(Object.keys(g).sort(), event).toEqual(g.matcher === undefined ? ['hooks'] : ['hooks', 'matcher']);
        for (const h of g.hooks) {
          expect(h.type, h.command).toBe('command');
          expect(typeof h.command, event).toBe('string');
        }
      }
    }
  });

  it('timeouts en secondes (1..600)', () => {
    for (const { h } of handlers(settings)) {
      expect(h.timeout, h.command).toBeGreaterThanOrEqual(1);
      expect(h.timeout, h.command).toBeLessThanOrEqual(600);
    }
  });

  it('aucun matcher ne contient `(`', () => {
    for (const { event, g } of handlers(settings)) expect(g.matcher ?? '', event).not.toContain('(');
  });

  it('ni `once` ni PostCompact', () => {
    expect(settings.hooks.PostCompact).toBeUndefined();
    for (const { h } of handlers(settings)) expect(h, h.command).not.toHaveProperty('once');
  });
});

describe('fragments distribués', () => {
  it.each(FILES.slice(1))('%s ne référence que des scripts de la source unique', (rel) => {
    const scripts = handlers(load(rel)).flatMap(({ h }) =>
      [...h.command.matchAll(/\.claude\/hooks\/([\w.-]+\.sh)/g)].map((m) => m[1])
    );
    expect(scripts.length).toBeGreaterThan(0);
    for (const s of scripts) expect(fs.existsSync(path.join(SCRIPTS_DIR, s)), s).toBe(true);
  });

  it('chaque commande invoque bash explicitement avec $CLAUDE_PROJECT_DIR', () => {
    for (const rel of FILES.slice(1)) {
      for (const { h } of handlers(load(rel)).filter(({ h }) => h.command.includes('.claude/hooks/'))) {
        expect(h.command).toMatch(/^bash "\$CLAUDE_PROJECT_DIR\/\.claude\/hooks\/[\w.-]+\.sh"$/);
      }
    }
  });

  it('default et full ne se recouvrent pas (full = extras seulement)', () => {
    const cmds = (rel) => handlers(load(rel)).map(({ h }) => h.command);
    const def = new Set(cmds(FILES[1]));
    expect(cmds(FILES[2]).filter((c) => def.has(c))).toEqual([]);
  });
});

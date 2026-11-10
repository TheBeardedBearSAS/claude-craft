import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Schéma officiel : { hooks: { <Event>: [ { matcher?, hooks: [ { type, command, timeout } ] } ] } }.
// Les entrées plates, un matcher contenant `(` (traité comme regex, ne correspond
// jamais à un nom d'outil), `once` (ignoré dans settings) et PostCompact (aucun canal
// vers le modèle) sont des erreurs silencieuses : on les interdit dans ce qu'on distribue.
const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const BASE_HOOKS = 'Dev/i18n/base/Common/hooks';
const FRAGMENTS = ['default', 'full', 'memory'].map((p) => `${BASE_HOOKS}/templates/hooks.${p}.json`);
const EXAMPLES_DIR = `${BASE_HOOKS}/templates/examples`;
const EXAMPLES = fs
  .readdirSync(path.join(PROJECT_ROOT, EXAMPLES_DIR))
  .filter((f) => f.endsWith('.json'))
  .map((f) => `${EXAMPLES_DIR}/${f}`);
const FILES = ['.claude/settings.json', ...FRAGMENTS, ...EXAMPLES];
const SCRIPTS_DIR = path.join(PROJECT_ROOT, BASE_HOOKS, 'scripts');
// Les scripts memory-lifecycle sont installés dans .claude/hooks/memory-lifecycle/.
const scriptSource = (rel) =>
  rel.startsWith('memory-lifecycle/')
    ? path.join(PROJECT_ROOT, 'Dev/scripts', rel)
    : path.join(SCRIPTS_DIR, rel);

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

describe('fragments et exemples distribués', () => {
  const refs = (rel) =>
    handlers(load(rel)).flatMap(({ h }) =>
      [...h.command.matchAll(/\.claude\/hooks\/([\w./-]+\.sh)/g)].map((m) => m[1])
    );

  it.each(FRAGMENTS)('%s référence des scripts qui existent', (rel) => {
    expect(refs(rel).length).toBeGreaterThan(0);
    for (const s of refs(rel)) expect(fs.existsSync(scriptSource(s)), s).toBe(true);
  });

  it.each(EXAMPLES)('%s : les scripts cités existent', (rel) => {
    for (const s of refs(rel)) expect(fs.existsSync(scriptSource(s)), s).toBe(true);
  });

  it('chaque commande invoque bash explicitement avec $CLAUDE_PROJECT_DIR', () => {
    for (const rel of [...FRAGMENTS, ...EXAMPLES]) {
      for (const { h } of handlers(load(rel)).filter(({ h }) => h.command.includes('.claude/hooks/'))) {
        expect(h.command).toMatch(/^bash "\$CLAUDE_PROJECT_DIR\/\.claude\/hooks\/[\w./-]+\.sh"$/);
      }
    }
  });

  it('les exemples ne reproduisent plus les regex inline des anciens gardes', () => {
    for (const rel of EXAMPLES) {
      for (const { h } of handlers(load(rel))) expect(h.command, rel).not.toMatch(/grep -qE '\(/);
    }
  });

  it('PreCompact émet du texte brut (aucun JSON / systemMessage)', () => {
    for (const rel of [...FRAGMENTS, ...EXAMPLES]) {
      for (const { event, h } of handlers(load(rel)).filter(({ event }) => event === 'PreCompact')) {
        expect(h.command, `${rel} ${event}`).not.toMatch(/systemMessage|jq -n|additionalContext/);
      }
    }
  });

  it('default, full et memory ne se recouvrent pas (extras seulement)', () => {
    const cmds = (rel) => handlers(load(rel)).map(({ h }) => h.command);
    const seen = new Set(cmds(FRAGMENTS[0]));
    for (const rel of FRAGMENTS.slice(1)) {
      expect(cmds(rel).filter((c) => seen.has(c))).toEqual([]);
      cmds(rel).forEach((c) => seen.add(c));
    }
  });
});

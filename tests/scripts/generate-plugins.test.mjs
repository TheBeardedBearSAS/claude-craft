import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import * as yaml from 'js-yaml';
import { TECH_REGISTRY } from '../../cli/lib/tech-registry.js';

// Distribution « un plugin Claude Code par namespace » : le générateur lance les vrais
// installeurs, remodèle leur sortie et garantit que chaque plugin est autonome.
const ROOT = path.resolve(import.meta.dirname, '../..');
const SCRIPT = path.join(ROOT, 'scripts/generate-plugins.mjs');
const TMP = path.join(ROOT, '.test-tmp', 'generate-plugins-test');
const GEN_A = path.join(TMP, 'a');
const GEN_B = path.join(TMP, 'b');
const COMMITTED = path.join(ROOT, 'plugins');
const MARKETPLACE = path.join(ROOT, '.claude-plugin', 'marketplace.json');

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const versions = yaml.load(fs.readFileSync(path.join(ROOT, 'config/versions.yaml'), 'utf8'));

const FIXED = ['common', 'workflow', 'team', 'qa', 'uiux', 'gate', 'project'];
const STACKS = Object.entries(TECH_REGISTRY)
  .filter(([, e]) => e.tier !== null)
  .map(([k]) => k);
const EXPECTED = [...new Set([...FIXED, ...STACKS])].sort();

const run = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { cwd: ROOT, encoding: 'utf8' });

const walk = (dir, base = dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p, base) : [path.relative(base, p)];
  });

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const plugins = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

beforeAll(() => {
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  for (const out of [GEN_A, GEN_B]) {
    const r = run('--out', out);
    expect(r.status, r.stderr + r.stdout).toBe(0);
  }
}, 300_000);
afterAll(() => fs.rmSync(TMP, { recursive: true, force: true }));

describe('generate-plugins : plugins produits', () => {
  it('produit un plugin par namespace de commandes et par stack', () => {
    expect(plugins(GEN_A)).toEqual(EXPECTED.map((n) => `bear-${n}`));
  });

  it('chaque manifeste porte les champs requis (version = package.json, engines = minimum)', () => {
    for (const name of EXPECTED) {
      const m = readJson(path.join(GEN_A, `bear-${name}`, '.claude-plugin/plugin.json'));
      expect(m.name, name).toBe(`bear-${name}`);
      expect(m.displayName, name).toMatch(/^Bear Craft — /);
      expect(m.description.length, name).toBeGreaterThan(20);
      expect(m.version, name).toBe(pkg.version);
      expect(m.author).toEqual({ name: 'The Bearded Bear', url: 'https://the-bearded-bear.com' });
      expect(m.repository).toBe('https://github.com/TheBeardedBearSAS/bear-craft');
      expect(m.homepage).toBe('https://github.com/TheBeardedBearSAS/bear-craft');
      expect(m.license).toBe('MIT');
      expect(m.engines).toEqual({ 'claude-code': `>=${versions.claudeCode.minimum}` });
    }
  });

  it('chaque plugin a LICENSE, README (installation depuis la marketplace) et icône', () => {
    for (const name of EXPECTED) {
      const dir = path.join(GEN_A, `bear-${name}`);
      expect(fs.existsSync(path.join(dir, 'LICENSE')), name).toBe(true);
      expect(fs.existsSync(path.join(dir, '.claude-plugin/icon.png')), name).toBe(true);
      const readme = fs.readFileSync(path.join(dir, 'README.md'), 'utf8');
      expect(readme.split(/\s+/).length, name).toBeGreaterThanOrEqual(40);
      expect(readme).toContain('/plugin marketplace add TheBeardedBearSAS/bear-craft');
      expect(readme).toContain(`/plugin install bear-${name}@bear-craft`);
    }
  });

  it('les commandes gardent leur nom de namespace (react → /react:check)', () => {
    expect(fs.existsSync(path.join(GEN_A, 'bear-react/commands/check.md'))).toBe(true);
    expect(fs.existsSync(path.join(GEN_A, 'bear-workflow/commands/init.md'))).toBe(true);
    expect(fs.existsSync(path.join(GEN_A, 'bear-react/agents/react-reviewer.md'))).toBe(true);
    expect(fs.existsSync(path.join(GEN_A, 'bear-common/agents/tdd-coach.md'))).toBe(true);
  });
});

describe('generate-plugins : autonomie des plugins', () => {
  it('chaque ${CLAUDE_PLUGIN_ROOT}/<chemin> cité existe dans le même plugin', () => {
    let seen = 0;
    for (const name of EXPECTED) {
      const dir = path.join(GEN_A, `bear-${name}`);
      for (const file of walk(dir)) {
        if (/\.(png|ico)$/.test(file)) continue;
        const text = fs.readFileSync(path.join(dir, file), 'utf8');
        for (const m of text.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([A-Za-z0-9_./-]*[A-Za-z0-9_])/g)) {
          seen += 1;
          expect(fs.existsSync(path.join(dir, m[1])), `${name}/${file} → ${m[1]}`).toBe(true);
        }
      }
    }
    expect(seen).toBeGreaterThan(50);
  });

  it("aucune référence .claude/(rules|references|templates|checklists|skills|agents) résolue n'est laissée telle quelle", () => {
    // Une référence non résolue est tolérée (rapportée), mais jamais une référence dont la cible existe dans le plugin.
    for (const name of EXPECTED) {
      const dir = path.join(GEN_A, `bear-${name}`);
      for (const file of walk(dir).filter((f) => f.endsWith('.md'))) {
        const text = fs.readFileSync(path.join(dir, file), 'utf8');
        for (const m of text.matchAll(
          /(?<![\w~$}-])\.claude\/((?:rules|references|templates|checklists|skills|agents)\/[A-Za-z0-9_./-]*[A-Za-z0-9_])/g
        )) {
          const target = path.join(dir, m[1]);
          const isFile = fs.existsSync(target) && fs.statSync(target).isFile();
          expect(isFile, `${name}/${file} cite encore .claude/${m[1]}`).toBe(false);
        }
      }
    }
  });

  it('aucun stub déprécié (deprecated: true) ni commande retirée/programmée', () => {
    const removed = yaml.load(fs.readFileSync(path.join(ROOT, 'config/removed-commands.yaml'), 'utf8'));
    const listed = new Set([...(removed.removed ?? []), ...Object.keys(removed.scheduled ?? {})]);
    for (const name of EXPECTED) {
      const cmdDir = path.join(GEN_A, `bear-${name}`, 'commands');
      if (!fs.existsSync(cmdDir)) continue;
      for (const f of fs.readdirSync(cmdDir)) {
        const text = fs.readFileSync(path.join(cmdDir, f), 'utf8');
        expect(text, `${name}/${f}`).not.toMatch(/^deprecated:\s*true\s*$/m);
        expect(listed.has(`${name}/${f}`), `${name}/${f}`).toBe(false);
      }
    }
    expect(fs.existsSync(path.join(GEN_A, 'bear-react/commands/check-security.md'))).toBe(false);
  });
});

describe('generate-plugins : références slash préfixées', () => {
  const NS = new RegExp(String.raw`(^|[\s\`'"(\[|>])/(${EXPECTED.join('|')}):[A-Za-z]`, 'm');

  it("aucune référence /<ns>: non préfixée ne subsiste pour un namespace généré", () => {
    for (const name of EXPECTED) {
      const dir = path.join(GEN_A, `bear-${name}`);
      for (const file of walk(dir).filter((f) => /\.(md|json|ya?ml|txt|template)$/.test(f))) {
        const text = fs.readFileSync(path.join(dir, file), 'utf8');
        for (const line of text.split('\n')) expect(line, `${name}/${file}`).not.toMatch(NS);
      }
    }
  });

  it('réécrit les références citées (/workflow:plan → /bear-workflow:plan) sans toucher aux URL', () => {
    const all = EXPECTED.flatMap((n) => walk(path.join(GEN_A, `bear-${n}`)).map((f) => path.join(GEN_A, `bear-${n}`, f)));
    const texts = all.filter((f) => f.endsWith('.md')).map((f) => fs.readFileSync(f, 'utf8'));
    expect(texts.some((t) => t.includes('/bear-workflow:plan'))).toBe(true);
    expect(texts.some((t) => t.includes('/bear-react:check'))).toBe(true);
    expect(texts.some((t) => /(^|[\s`'"(\[|>])\/(workflow|react):/m.test(t))).toBe(false);
  });
});

describe('generate-plugins : hooks (plugin common uniquement)', () => {
  it('common porte hooks.json (enveloppe hooks, onFailure conservé) et les scripts', () => {
    const hooks = readJson(path.join(GEN_A, 'bear-common/hooks/hooks.json'));
    const commands = Object.values(hooks.hooks).flatMap((groups) => groups.flatMap((g) => g.hooks));
    expect(commands.some((h) => h.onFailure === 'block')).toBe(true);
    for (const h of commands) expect(h.command).not.toContain('$CLAUDE_PROJECT_DIR/.claude/hooks/');
    expect(JSON.stringify(hooks)).toContain('${CLAUDE_PLUGIN_ROOT}/hooks/scripts/guard-network.sh');
    expect(fs.existsSync(path.join(GEN_A, 'bear-common/hooks/scripts/lib/hook-io.sh'))).toBe(true);
  });

  it('un script de hook généré bloque une commande destructrice (exécuté depuis le plugin)', () => {
    const r = spawnSync('bash', [path.join(GEN_A, 'bear-common/hooks/scripts/block-dangerous-commands.sh')], {
      input: JSON.stringify({ tool_input: { command: 'rm -rf /' } }),
      encoding: 'utf8',
    });
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/BLOCKED/);
  });

  it("aucun autre plugin n'embarque de hooks", () => {
    for (const name of EXPECTED.filter((n) => n !== 'common')) {
      expect(fs.existsSync(path.join(GEN_A, `bear-${name}`, 'hooks')), name).toBe(false);
    }
  });
});

describe('generate-plugins : déterminisme et mode --check', () => {
  it('deux générations successives sont identiques', () => {
    expect(walk(GEN_A).sort()).toEqual(walk(GEN_B).sort());
    for (const f of walk(GEN_A)) {
      expect(fs.readFileSync(path.join(GEN_A, f)).equals(fs.readFileSync(path.join(GEN_B, f))), f).toBe(true);
    }
  });

  it('vide sa sortie avant de générer (un fichier orphelin disparaît)', () => {
    const orphan = path.join(GEN_B, 'bear-react', 'orphan.md');
    fs.writeFileSync(orphan, 'x');
    const r = run('--out', GEN_B);
    expect(r.status, r.stderr).toBe(0);
    expect(fs.existsSync(orphan)).toBe(false);
  }, 120_000);

  it("--check passe sur l'arbre committé", () => {
    const r = run('--check');
    expect(r.status, r.stderr + r.stdout).toBe(0);
  }, 120_000);

  it("--check échoue après modification d'un fichier généré", () => {
    const copy = path.join(TMP, 'drift-modified');
    fs.cpSync(COMMITTED, copy, { recursive: true });
    fs.appendFileSync(path.join(copy, 'bear-react/commands/check.md'), '\nderive\n');
    const r = run('--check', '--out', copy);
    expect(r.status).not.toBe(0);
    expect(r.stderr + r.stdout).toContain('bear-react/commands/check.md');
  }, 120_000);

  it('--check échoue si un fichier en trop existe dans plugins/ (sens inverse)', () => {
    const copy = path.join(TMP, 'drift-extra');
    fs.cpSync(COMMITTED, copy, { recursive: true });
    fs.writeFileSync(path.join(copy, 'bear-bear-react/commands/extra.md'), 'en trop\n');
    const r = run('--check', '--out', copy);
    expect(r.status).not.toBe(0);
    expect(r.stderr + r.stdout).toContain('bear-react/commands/extra.md');
  }, 120_000);
});

describe('marketplace.json', () => {
  it('liste exactement les dossiers de plugins/, avec source ./plugins/<nom> et la version courante', () => {
    const market = readJson(MARKETPLACE);
    expect(market.name).toBe('bear-craft');
    expect(market.plugins.map((p) => p.name).sort()).toEqual(plugins(COMMITTED));
    for (const p of market.plugins) {
      expect(p.source).toBe(`./plugins/${p.name}`);
      expect(p.version).toBe(pkg.version);
    }
  });

  it('la racine ne porte plus de plugin.json ni d’icône', () => {
    expect(fs.existsSync(path.join(ROOT, '.claude-plugin/plugin.json'))).toBe(false);
    expect(fs.existsSync(path.join(ROOT, '.claude-plugin/icon.png'))).toBe(false);
  });
});

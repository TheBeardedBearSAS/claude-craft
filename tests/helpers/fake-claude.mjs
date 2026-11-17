import fs from 'node:fs';
import path from 'node:path';

/**
 * A fake `claude` executable for tests that run the real bear-craft CLI: it never touches Claude Code.
 * It answers `--version`, and for `plugin marketplace add|list` and `plugin install` it writes into the
 * project's .claude/settings.json what the real binary writes (an ABSOLUTE directory path, enabledPlugins),
 * logging every call to <dir>/calls.log.
 * @param {string} dir - directory that will hold the executable (put it first in PATH)
 * @param {{version?: string}} [opts]
 * @returns {{dir: string, env: (base?: NodeJS.ProcessEnv) => NodeJS.ProcessEnv, calls: () => string[]}}
 */
export function installFakeClaude(dir, { version = '2.1.326' } = {}) {
  fs.mkdirSync(dir, { recursive: true });
  const script = `#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
fs.appendFileSync(path.join(here, 'calls.log'), args.join(' ') + '\\n');
if (args[0] === '--version') { console.log('${version} (Claude Code)'); process.exit(0); }
const file = path.join(process.cwd(), '.claude', 'settings.json');
const read = () => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {});
const write = (s) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(s, null, 2)); };
if (args[1] === 'marketplace' && args[2] === 'add') {
  const dir = path.resolve(process.cwd(), args[3]);
  const name = JSON.parse(fs.readFileSync(path.join(dir, '.claude-plugin', 'marketplace.json'), 'utf8')).name;
  const s = read();
  s.extraKnownMarketplaces = { ...s.extraKnownMarketplaces, [name]: { source: { source: 'directory', path: dir } } };
  write(s);
} else if (args[1] === 'marketplace' && args[2] === 'list') {
  console.log('[]');
} else if (args[1] === 'install') {
  const s = read();
  s.enabledPlugins = { ...s.enabledPlugins, [args[2]]: true };
  write(s);
}
process.exit(0);
`;
  const bin = path.join(dir, 'claude');
  fs.writeFileSync(bin, script, { mode: 0o755 });
  return {
    dir,
    env: (base = process.env) => ({ ...base, PATH: `${dir}${path.delimiter}${base.PATH}` }),
    calls: () => {
      const log = path.join(dir, 'calls.log');
      return fs.existsSync(log) ? fs.readFileSync(log, 'utf8').split('\n').filter(Boolean) : [];
    },
  };
}

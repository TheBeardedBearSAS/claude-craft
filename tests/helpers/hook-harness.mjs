// Harnais commun aux tests de hooks : exécute un script avec un payload JSON sur
// stdin (comme Claude Code) et renvoie { status, stdout, stderr, json }.
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
export const HOOKS_DIR = path.join(PROJECT_ROOT, 'Dev/i18n/base/Common/hooks/scripts');

export function runHook(script, payload, { env = {}, cwd = PROJECT_ROOT } = {}) {
  const res = spawnSync('bash', [script], {
    input: typeof payload === 'string' ? payload : JSON.stringify(payload),
    encoding: 'utf8',
    cwd,
    env: { ...process.env, ...env },
  });
  let json = null;
  try {
    json = res.stdout.trim() ? JSON.parse(res.stdout) : null;
  } catch {
    json = undefined; // stdout non vide mais pas du JSON
  }
  return { status: res.status, stdout: res.stdout, stderr: res.stderr, json };
}

// PATH ne contenant aucun des binaires `names` : liens symboliques vers tout le
// reste, dans .test-tmp/. Sert à exercer le repli node quand jq est installé.
export function pathWithout(...names) {
  const dir = path.join(PROJECT_ROOT, '.test-tmp', `path-without-${names.join('-')}`);
  fs.mkdirSync(dir, { recursive: true });
  for (const p of (process.env.PATH || '').split(':')) {
    let entries = [];
    try {
      entries = fs.readdirSync(p);
    } catch {
      continue;
    }
    for (const e of entries) {
      const link = path.join(dir, e);
      if (names.includes(e) || fs.existsSync(link)) continue;
      try {
        fs.symlinkSync(path.join(p, e), link);
      } catch {
        // lien concurrent ou entrée illisible : ignoré
      }
    }
  }
  return dir;
}

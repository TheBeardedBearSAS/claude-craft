/**
 * Community skill management — install/list/remove skills from npm.
 *
 * Convention: skill packages MUST be named `claude-craft-skill-*` and ship
 * at least one Markdown file at `skills/*.md` or a root `SKILL.md`. The CLI
 * delegates the download to `npm install` (no custom registry) and then
 * symlinks the package's skills into `.claude/skills/<name>/` on the target
 * project.
 *
 * MVP scope:
 *  - `skill add <pkg>`      → npm install + copy markdown files
 *  - `skill list`           → list installed community skills
 *  - `skill remove <name>`  → delete from .claude/skills/community/<name>
 *
 * No central registry, no signature verification, no marketplace UI.
 * Author trust = npm trust. Users should pin versions.
 *
 * @module cli/lib/skill
 */

import path from 'path';
import fs from 'fs';
import { spawnSync } from 'child_process';
import c from './colors.js';
import { assertSafeTarget } from './path-safety.js';

const SKILL_PREFIX = 'claude-craft-skill-';
const COMMUNITY_DIR = path.join('.claude', 'skills', 'community');

/**
 * Validate a skill package name follows the `claude-craft-skill-*` convention.
 * Allows optional npm scopes (e.g. `@org/claude-craft-skill-foo`).
 * @param {string} pkg
 * @returns {{ pkg: string, shortName: string }}
 * @throws {Error}
 */
export function validateSkillPackageName(pkg) {
  if (typeof pkg !== 'string' || pkg.length === 0) {
    throw new Error('skill add: package name required');
  }
  // Strip optional version spec (`pkg@1.2.3` → `pkg`)
  const atIdx = pkg.lastIndexOf('@');
  const baseName = atIdx > 0 ? pkg.slice(0, atIdx) : pkg;
  let unscoped = baseName;
  if (baseName.startsWith('@')) {
    const slash = baseName.indexOf('/');
    if (slash === -1) throw new Error(`skill add: invalid scoped name "${pkg}"`);
    unscoped = baseName.slice(slash + 1);
  }
  if (!unscoped.startsWith(SKILL_PREFIX)) {
    throw new Error(`skill add: package name must start with "${SKILL_PREFIX}" (got "${unscoped}")`);
  }
  const shortName = unscoped.slice(SKILL_PREFIX.length);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(shortName)) {
    throw new Error(`skill add: invalid skill short-name "${shortName}"`);
  }
  return { pkg, shortName };
}

/**
 * Run `npm install --no-save <pkg>` in a transient dir and return where the package was placed.
 * @param {string} pkg
 * @param {string} cwd
 * @param {Object} [deps]
 * @param {Function} [deps.spawn=spawnSync]
 * @returns {string} Absolute path to the installed package root
 */
function npmInstall(pkg, cwd, { spawn = spawnSync } = {}) {
  // Audit 2026-06-01 P1 — keep `npm audit` enabled (do NOT pass --no-audit) so CVE
  // scanning runs on the community package and its transitive dependencies.
  const result = spawn('npm', ['install', '--no-save', '--no-fund', pkg], {
    cwd,
    stdio: 'inherit',
  });
  if (result.error) throw new Error(`npm install failed: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`npm install exited with code ${result.status}`);

  const stripped = pkg
    .split('@')
    .slice(0, pkg.startsWith('@') ? 2 : 1)
    .join('@');
  return path.join(cwd, 'node_modules', stripped);
}

/**
 * Copy all `.md` skill files from a package into the target project's community dir.
 * @param {string} pkgDir
 * @param {string} destDir
 * @returns {string[]} Relative paths of copied files
 */
function copySkillFiles(pkgDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const copied = [];
  const rootSkill = path.join(pkgDir, 'SKILL.md');
  if (fs.existsSync(rootSkill)) {
    const dest = path.join(destDir, 'SKILL.md');
    fs.copyFileSync(rootSkill, dest);
    copied.push('SKILL.md');
  }
  const skillsDir = path.join(pkgDir, 'skills');
  if (fs.existsSync(skillsDir) && fs.statSync(skillsDir).isDirectory()) {
    const files = fs.readdirSync(skillsDir).filter((f) => f.endsWith('.md'));
    for (const f of files) {
      fs.copyFileSync(path.join(skillsDir, f), path.join(destDir, f));
      copied.push(`skills/${f}`);
    }
  }
  if (copied.length === 0) {
    throw new Error(`skill add: package contains no SKILL.md or skills/*.md`);
  }
  return copied;
}

/**
 * Install a community skill from npm into `<targetPath>/.claude/skills/community/<short-name>/`.
 * @param {string} pkg - npm package name (must start with `claude-craft-skill-`)
 * @param {string} targetPath - Absolute path to the target project
 * @param {Object} [deps]
 * @param {Function} [deps.spawn=spawnSync] - Injectable for testing
 * @returns {{ shortName: string, files: string[], destDir: string }}
 */
export function runSkillAdd(pkg, targetPath, deps = {}) {
  const { shortName } = validateSkillPackageName(pkg);
  const safeTarget = assertSafeTarget(targetPath);

  console.log(
    `${c.bold}Installing community skill${c.reset} ${c.cyan}${shortName}${c.reset} ${c.dim}(${pkg})${c.reset}`
  );
  // Audit 2026-06-01 P1 — community skills are neither signed nor centrally vetted,
  // and the npm package may run postinstall scripts. Warn the operator explicitly.
  console.log(
    `  ${c.yellow}⚠${c.reset}  Les skills communautaires ne sont ni signés ni audités centralement et peuvent exécuter des scripts npm (postinstall). Vérifiez le contenu du package avant de l'utiliser.`
  );

  // Audit 2026-06-01 P1 — install into a dedicated temp dir under .claude/skills/ (NOT
  // the project root) so npm never pollutes the user's own node_modules, then clean it
  // up. We avoid /tmp per project convention.
  const tmpDir = path.join(safeTarget, COMMUNITY_DIR, `.tmp-install-${shortName}`);
  fs.mkdirSync(tmpDir, { recursive: true });
  try {
    const pkgDir = npmInstall(pkg, tmpDir, deps);
    const destDir = path.join(safeTarget, COMMUNITY_DIR, shortName);
    const files = copySkillFiles(pkgDir, destDir);

    console.log(`  ${c.green}✓${c.reset} Installed ${files.length} file(s) into ${c.dim}${destDir}${c.reset}`);
    console.log(`  ${c.dim}Use in Claude Code: /community-${shortName}${c.reset}\n`);

    return { shortName, files, destDir };
  } finally {
    // Remove the transient install dir (node_modules + downloaded package) regardless of outcome.
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

/**
 * List all installed community skills under `<targetPath>/.claude/skills/community/`.
 * @param {string} targetPath
 * @returns {string[]} Short names of installed community skills
 */
export function runSkillList(targetPath) {
  const safeTarget = assertSafeTarget(targetPath);
  const dir = path.join(safeTarget, COMMUNITY_DIR);
  if (!fs.existsSync(dir)) {
    console.log(`${c.dim}No community skills installed.${c.reset}`);
    return [];
  }
  const skills = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
  if (skills.length === 0) {
    console.log(`${c.dim}No community skills installed.${c.reset}`);
  } else {
    console.log(`${c.bold}Installed community skills (${skills.length}):${c.reset}`);
    for (const name of skills) console.log(`  ${c.cyan}•${c.reset} ${name}`);
  }
  return skills;
}

/**
 * Remove a community skill from `<targetPath>/.claude/skills/community/<shortName>/`.
 * @param {string} shortName
 * @param {string} targetPath
 * @returns {boolean} True if removed, false if not found
 */
export function runSkillRemove(shortName, targetPath) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(shortName)) {
    throw new Error(`skill remove: invalid short-name "${shortName}"`);
  }
  const safeTarget = assertSafeTarget(targetPath);
  const dir = path.join(safeTarget, COMMUNITY_DIR, shortName);
  if (!fs.existsSync(dir)) {
    console.log(`${c.yellow}Skill "${shortName}" not installed.${c.reset}`);
    return false;
  }
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`${c.green}✓${c.reset} Removed community skill ${c.cyan}${shortName}${c.reset}`);
  return true;
}

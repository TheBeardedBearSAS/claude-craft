#!/usr/bin/env node
/**
 * Verify `@<path>` includes (Claude Code @-include syntax) in the repo are
 * not phantom links.
 *
 * Scans every Markdown file under `.claude/` (rules, skills, agents,
 * commands, references…) and the top-level CLAUDE.md / README.md for the
 * pattern `@<relative-or-absolute-path>.md` (and `.json`/`.yml`) used in
 * Claude Code prompts to pull a file into the context window. A link is
 * considered broken when the resolved path does not exist on disk.
 *
 * Audit 2026-05-18 ST-01.
 *
 * Usage:
 *   node scripts/verify-claude-includes.mjs           # exit 1 if broken
 *   node scripts/verify-claude-includes.mjs --warn    # always exit 0
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WARN_ONLY = process.argv.includes('--warn');

// Directories to scan (relative to REPO_ROOT). We walk these recursively and
// pick up Markdown files only. Using fs.readdir({recursive:true}) (Node ≥18.17)
// instead of pulling in the `glob` package — keeps the script zero-dependency.
const SCAN_ROOTS = ['.claude', 'docs'];
const SCAN_FILES = ['README.md', 'CLAUDE.md'];

// Substrings (anywhere in the relative path) that disqualify a file. Generated
// artefacts, historical audit dumps and node_modules.
const IGNORE_SUBSTRINGS = [
  `${path.sep}node_modules${path.sep}`,
  `${path.sep}docs${path.sep}audit${path.sep}`,
  `${path.sep}audit${path.sep}`,
  'docs/CHANGELOG-archive.md',
];

async function collectMarkdownFiles() {
  const found = [];

  for (const root of SCAN_ROOTS) {
    const abs = path.join(REPO_ROOT, root);
    let entries;
    try {
      entries = await readdir(abs, { recursive: true, withFileTypes: true });
    } catch (err) {
      if (err.code === 'ENOENT') continue;
      throw err;
    }
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!entry.name.endsWith('.md')) continue;
      // `entry.parentPath` exists in Node 22, `entry.path` in 20.12+. Either is
      // an absolute path to the parent directory.
      const parent = entry.parentPath ?? entry.path ?? abs;
      const full = path.join(parent, entry.name);
      const rel = path.relative(REPO_ROOT, full);
      if (IGNORE_SUBSTRINGS.some((s) => rel.includes(s))) continue;
      found.push(full);
    }
  }

  for (const file of SCAN_FILES) {
    const abs = path.join(REPO_ROOT, file);
    if (await pathExists(abs)) found.push(abs);
  }

  return found;
}

// Pattern matches `@something.md` / `@something.json` / `@something.yml` /
// `@something.yaml` where the path may include slashes, dots, dashes and
// underscores. Not anchored on word boundary at the start so we also catch
// list items / quotes / `(@path)` markdown links.
const INCLUDE_RE = /@([./A-Za-z0-9_-]+\.(?:md|json|ya?ml))/g;

async function pathExists(absolutePath) {
  try {
    await stat(absolutePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Strip fenced code blocks (```…```) and inline code spans (`…`) so the
 * scanner does not chase tutorial / example syntax. Authors routinely write
 * sample @-includes inside markdown code fences (e.g. "type @CLAUDE.md to
 * load it") that are not meant to resolve on disk.
 */
function stripCodeRegions(text) {
  return text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
}

async function scanFile(filePath) {
  const raw = await readFile(filePath, 'utf8');
  const text = stripCodeRegions(raw);
  const broken = [];
  for (const match of text.matchAll(INCLUDE_RE)) {
    const target = match[1];
    // Skip URLs and obvious non-paths.
    if (target.startsWith('http')) continue;

    // Only enforce includes that look like project-relative explicit paths.
    // Bare filenames (e.g. `@CLAUDE.md`, `@REFERENCE.md`) are tutorial
    // placeholders authored for the user's own project root, not the
    // claude-craft repo. Same for paths that start with `docs/` referenced
    // from arbitrary tutorial contexts — only follow `.claude/*`,
    // `references/*` or `docs/*` paths actually mounted in this repo.
    const looksLikeProjectPath =
      target.includes('/') &&
      (target.startsWith('.claude/') || target.startsWith('./') || target.startsWith('references/'));
    if (!looksLikeProjectPath) continue;

    const cleaned = target.replace(/^\.\//, '');
    const candidate = path.isAbsolute(cleaned) ? cleaned : path.join(REPO_ROOT, cleaned);

    if (!(await pathExists(candidate))) {
      broken.push({ raw: target, resolved: candidate });
    }
  }
  return broken;
}

async function main() {
  const files = await collectMarkdownFiles();

  const results = await Promise.all(files.map(async (file) => ({ file, broken: await scanFile(file) })));

  const offenders = results.filter((r) => r.broken.length > 0);

  if (offenders.length === 0) {
    console.log(`✓ ${files.length} files scanned, no broken @-includes.`);
    return 0;
  }

  console.error(`✗ Found broken @-includes in ${offenders.length} file(s):`);
  console.error('');
  for (const { file, broken } of offenders) {
    const rel = path.relative(REPO_ROOT, file);
    console.error(`  ${rel}`);
    for (const b of broken) {
      console.error(`    ↳ @${b.raw} (resolved: ${path.relative(REPO_ROOT, b.resolved)})`);
    }
  }
  console.error('');
  console.error(`Total broken @-includes: ${offenders.reduce((n, o) => n + o.broken.length, 0)}`);

  return WARN_ONLY ? 0 : 1;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error('verify-claude-includes failed:', err);
    process.exit(2);
  });

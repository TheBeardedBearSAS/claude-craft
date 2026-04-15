import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

/**
 * Recursive scanner for a project-management/ directory (BMAD v6 layout).
 * Returns categorized file paths with mtime for cache invalidation.
 *
 * Layout :
 *   project-management/
 *     prd.md, tech-spec.md, personas.md, definition-of-done.md, dependencies-matrix.md
 *     architecture/*.md
 *     backlog/epics/EPIC-*.md
 *     backlog/user-stories/US-*.md
 *     sprints/sprint-*\/{sprint-goal,board,status-*}.md
 *     sprints/sprint-*\/tasks/TASK-*.md
 */

const IGNORE_PATTERNS = [/\.bak$/, /\.lock$/, /^\./];

function isIgnored(name) {
  return IGNORE_PATTERNS.some((re) => re.test(name));
}

async function walk(dir, onFile) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') return;
    throw err;
  }
  for (const entry of entries) {
    if (isIgnored(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, onFile);
    } else if (entry.isFile()) {
      await onFile(full);
    }
  }
}

function classify(rootDir, absPath) {
  const rel = path.relative(rootDir, absPath).split(path.sep).join('/');
  if (!rel.endsWith('.md') && !rel.endsWith('.yaml') && !rel.endsWith('.yml')) return null;

  if (rel.startsWith('backlog/user-stories/') && /US-\d+/.test(rel)) return 'story';
  if (rel.startsWith('backlog/epics/') && /EPIC-\d+/.test(rel)) return 'epic';

  const sprintMatch = rel.match(/^sprints\/([^/]+)\/(.+)$/);
  if (sprintMatch) {
    const [, , rest] = sprintMatch;
    if (rest.startsWith('tasks/') && /TASK-\d+/.test(rest)) return 'task';
    if (rest === 'sprint-goal.md') return 'sprint-goal';
    if (rest === 'board.md') return 'board';
    if (rest.startsWith('status-')) return 'sprint-status-snapshot';
    if (rest === 'sprint-review.md') return 'sprint-review';
    if (rest === 'sprint-dependencies.md') return 'sprint-deps';
    return 'sprint-other';
  }

  if (rel.startsWith('architecture/')) return 'architecture';

  const docs = new Set([
    'prd.md',
    'tech-spec.md',
    'personas.md',
    'definition-of-done.md',
    'dependencies-matrix.md',
    'README.md',
  ]);
  if (docs.has(rel)) return 'doc';
  if (rel === 'workflow-status.yaml') return 'workflow-status';

  return 'other';
}

function sprintIdOf(rootDir, absPath) {
  const rel = path.relative(rootDir, absPath).split(path.sep).join('/');
  const m = rel.match(/^sprints\/([^/]+)\//);
  return m ? m[1] : null;
}

/**
 * @param {string} rootDir - absolute path to project-management/
 * @returns {Promise<{ files: Array<{path:string, category:string, mtime:number, sprintId:string|null}> }>}
 */
export async function scan(rootDir) {
  const absRoot = path.resolve(rootDir);
  const files = [];
  await walk(absRoot, async (full) => {
    const category = classify(absRoot, full);
    if (!category) return;
    const st = await stat(full);
    files.push({
      path: full,
      category,
      mtime: st.mtimeMs,
      sprintId: sprintIdOf(absRoot, full),
    });
  });
  return { files };
}

export function groupByCategory(files) {
  const groups = {};
  for (const f of files) {
    (groups[f.category] ??= []).push(f);
  }
  return groups;
}

export const _internal = { classify, sprintIdOf };

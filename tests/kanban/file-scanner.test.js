import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scan, groupByCategory, _internal } from '../../cli/kanban/server/services/file-scanner.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.resolve(__dirname, '../fixtures/project-management');

describe('FileScanner.scan', () => {
  it('returns all classified files', async () => {
    const { files } = await scan(FIXTURE);
    expect(files.length).toBeGreaterThanOrEqual(7);
    for (const f of files) {
      expect(f.path).toMatch(/\.(md|yaml|yml)$/);
      expect(typeof f.mtime).toBe('number');
      expect(f.mtime).toBeGreaterThan(0);
    }
  });

  it('classifies each file correctly', async () => {
    const { files } = await scan(FIXTURE);
    const groups = groupByCategory(files);
    expect(groups.story?.length).toBe(2);
    expect(groups.epic?.length).toBe(1);
    expect(groups.task?.length).toBe(1);
    expect(groups['sprint-goal']?.length).toBe(1);
    expect(groups.architecture?.length).toBe(1);
    expect(groups.doc?.length).toBeGreaterThanOrEqual(2); // prd + tech-spec
  });

  it('tags sprint files with sprintId', async () => {
    const { files } = await scan(FIXTURE);
    const task = files.find((f) => f.category === 'task');
    expect(task.sprintId).toBe('sprint-001-skeleton');
    const epic = files.find((f) => f.category === 'epic');
    expect(epic.sprintId).toBeNull();
  });

  it('ignores .bak, .lock, and dotfiles at walk level', async () => {
    const { writeFile, unlink } = await import('node:fs/promises');
    const bak = path.join(FIXTURE, 'backlog/user-stories/US-001-login.md.bak');
    const lock = path.join(FIXTURE, '.hidden.md');
    await writeFile(bak, 'x');
    await writeFile(lock, 'x');
    try {
      const { files } = await scan(FIXTURE);
      expect(files.find((f) => f.path.endsWith('.bak'))).toBeUndefined();
      expect(files.find((f) => f.path.endsWith('.hidden.md'))).toBeUndefined();
    } finally {
      await unlink(bak);
      await unlink(lock);
    }
  });

  it('returns empty for non-existent directory', async () => {
    const { files } = await scan(path.join(FIXTURE, '../does-not-exist'));
    expect(files).toEqual([]);
  });
});

describe('FileScanner.classify', () => {
  const { classify } = _internal;
  const root = '/root/project-management';

  it.each([
    ['backlog/user-stories/US-001-login.md', 'story'],
    ['backlog/epics/EPIC-001-auth.md', 'epic'],
    ['sprints/sprint-001/tasks/TASK-005.md', 'task'],
    ['sprints/sprint-001/sprint-goal.md', 'sprint-goal'],
    ['sprints/sprint-001/board.md', 'board'],
    ['sprints/sprint-001/status-2026-01-30.md', 'sprint-status-snapshot'],
    ['sprints/sprint-001/sprint-review.md', 'sprint-review'],
    ['sprints/sprint-001/sprint-retro.md', 'sprint-retro'],
    ['sprints/sprint-001/sprint-dependencies.md', 'sprint-deps'],
    ['architecture/c4-context.md', 'architecture'],
    ['architecture/erd.md', 'architecture'],
    ['prd.md', 'doc'],
    ['tech-spec.md', 'doc'],
    ['personas.md', 'doc'],
    ['definition-of-done.md', 'doc'],
    ['dependencies-matrix.md', 'doc'],
    ['workflow-status.yaml', 'workflow-status'],
    ['random-note.md', 'other'],
  ])('classifies %s as %s', (rel, expected) => {
    expect(classify(root, path.join(root, rel))).toBe(expected);
  });

  it('returns null for non-markdown non-yaml files', () => {
    expect(classify(root, path.join(root, 'notes.txt'))).toBeNull();
  });

  it('ignores malformed story/epic/task names', () => {
    // files that don't match US-XXX, EPIC-XXX, TASK-XXX fall back to 'other' or similar
    expect(classify(root, path.join(root, 'backlog/user-stories/random.md'))).toBe('other');
    expect(classify(root, path.join(root, 'backlog/epics/random.md'))).toBe('other');
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, mkdir, cp, writeFile, unlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { EventBus } from '../../cli/kanban/server/services/event-bus.js';
import { Repository } from '../../cli/kanban/server/services/repository.js';
import { startWatcher } from '../../cli/kanban/server/services/file-watcher.js';

const FIXTURE_PATH = path.resolve(import.meta.dirname, '../fixtures/project-management');
const DEBOUNCE = 200;
// Negative assertions (no event expected) wait this long before confirming absence.
const WAIT_NO_EVENT = 400;
// Polling budget for positive assertions — generous so shared CI runners don't flake.
const WAIT_OPTS = { timeout: 2000, interval: 50 };

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('file-watcher', () => {
  let tmpDir;
  let watcher;
  let eventBus;
  let repository;
  let receivedEvents;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'kanban-watcher-test-'));
    await cp(FIXTURE_PATH, tmpDir, { recursive: true });

    eventBus = new EventBus();
    repository = new Repository(tmpDir);
    await repository.refresh();

    receivedEvents = [];
    eventBus.subscribe((msg) => {
      if (msg.event === 'file:changed') {
        receivedEvents.push(msg.payload);
      }
    });

    watcher = startWatcher({
      rootDir: tmpDir,
      eventBus,
      repository,
      debounceMs: DEBOUNCE,
    });

    await sleep(100);
  });

  afterEach(async () => {
    if (watcher) {
      await watcher.stop();
      watcher = null;
    }
    if (tmpDir) {
      await rm(tmpDir, { recursive: true, force: true });
      tmpDir = null;
    }
  });

  it('should publish file:changed event when a story is modified', async () => {
    const storyRel = 'backlog/user-stories/US-001-login.md';
    const storyPath = path.join(tmpDir, storyRel);
    await writeFile(storyPath, '---\nid: US-001\ntitle: Modified login\n---\nUpdated content', 'utf8');

    await vi.waitFor(() => {
      expect(receivedEvents.find((e) => e.rel === storyRel)).toBeDefined();
    }, WAIT_OPTS);

    const evt = receivedEvents.find((e) => e.rel === storyRel);
    expect(evt.event).toBe('change');
    expect(evt.category).toBe('story');
    expect(evt.path).toBeUndefined();
    expect(JSON.stringify(evt)).not.toContain(tmpDir);
  });

  it('should debounce multiple rapid changes to the same file', async () => {
    const storyRel = 'backlog/user-stories/US-001-login.md';
    const storyPath = path.join(tmpDir, storyRel);

    await writeFile(storyPath, '---\nid: US-001\ntitle: Change 1\n---\nContent 1', 'utf8');
    await sleep(50);
    await writeFile(storyPath, '---\nid: US-001\ntitle: Change 2\n---\nContent 2', 'utf8');
    await sleep(50);
    await writeFile(storyPath, '---\nid: US-001\ntitle: Change 3\n---\nContent 3', 'utf8');

    // Debounce coalesces the 3 rapid writes into a single event.
    await vi.waitFor(() => {
      expect(receivedEvents.filter((e) => e.rel === storyRel).length).toBe(1);
    }, WAIT_OPTS);
  });

  it('should ignore non-relevant files', async () => {
    const randomFile = path.join(tmpDir, 'random.txt');
    await writeFile(randomFile, 'Random content', 'utf8');

    await sleep(WAIT_NO_EVENT);

    const evt = receivedEvents.find((e) => e.rel === 'random.txt');
    expect(evt).toBeUndefined();
  });

  it('should publish add event when new task is created', async () => {
    const taskRel = 'sprints/sprint-001-skeleton/tasks/TASK-999.md';
    const taskPath = path.join(tmpDir, taskRel);
    await writeFile(taskPath, '---\nid: TASK-999\nus_id: US-001\ntitle: New task\n---\nTask body', 'utf8');

    await vi.waitFor(() => {
      expect(receivedEvents.find((e) => e.rel === taskRel)).toBeDefined();
    }, WAIT_OPTS);

    const evt = receivedEvents.find((e) => e.rel === taskRel);
    // chokidar may emit 'add' or 'change' depending on watcher readiness timing;
    // either is acceptable — what matters is that the UI is notified.
    expect(['add', 'change']).toContain(evt.event);
    expect(evt.category).toBe('task');
  });

  it('should publish unlink event when file is deleted', async () => {
    const taskRel = 'sprints/sprint-001-skeleton/tasks/TASK-001.md';
    const taskPath = path.join(tmpDir, taskRel);
    await unlink(taskPath);

    await vi.waitFor(() => {
      expect(receivedEvents.find((e) => e.rel === taskRel)).toBeDefined();
    }, WAIT_OPTS);

    const evt = receivedEvents.find((e) => e.rel === taskRel);
    expect(evt.event).toBe('unlink');
    expect(evt.category).toBe('task');
  });

  it('should stop cleanly and not publish events after stop', async () => {
    await watcher.stop();

    const storyRel = 'backlog/user-stories/US-001-login.md';
    const storyPath = path.join(tmpDir, storyRel);
    await writeFile(storyPath, '---\nid: US-001\ntitle: After stop\n---\nShould not trigger', 'utf8');

    await sleep(WAIT_NO_EVENT);

    expect(receivedEvents.length).toBe(0);
  });

  describe('.bmad/sprint-status.yaml (K-01)', () => {
    let root;
    let w;

    afterEach(async () => {
      if (w) await w.stop();
      w = null;
      if (root) await rm(root, { recursive: true, force: true });
      root = null;
    });

    async function startOnProject() {
      root = await mkdtemp(path.join(tmpdir(), 'kanban-watcher-bmad-'));
      const pm = path.join(root, 'project-management');
      await cp(FIXTURE_PATH, pm, { recursive: true });
      await mkdir(path.join(root, '.bmad'));
      const yamlPath = path.join(root, '.bmad', 'sprint-status.yaml');
      await writeFile(yamlPath, 'stories: {}\n', 'utf8');
      const repo = new Repository(pm);
      await repo.refresh();
      const refresh = vi.spyOn(repo, 'refresh');
      w = startWatcher({ rootDir: pm, projectRoot: root, eventBus, repository: repo, debounceMs: DEBOUNCE });
      await sleep(300);
      return { yamlPath, refresh };
    }

    it('refreshes and publishes a sprint-status event on external change', async () => {
      const { yamlPath, refresh } = await startOnProject();
      await writeFile(yamlPath, 'stories:\n  US-001: { status: done }\n', 'utf8');

      await vi.waitFor(() => {
        expect(receivedEvents.find((e) => e.category === 'sprint-status')).toBeDefined();
      }, WAIT_OPTS);
      expect(refresh).toHaveBeenCalled();
      const evt = receivedEvents.find((e) => e.category === 'sprint-status');
      expect(evt.rel).toBe('.bmad/sprint-status.yaml');
    });

    it('ignores the lock and temp files next to the yaml', async () => {
      const { yamlPath } = await startOnProject();
      await writeFile(`${yamlPath}.lock`, '{}', 'utf8');
      await writeFile(`${yamlPath}.tmp-1-2`, 'x', 'utf8');
      await sleep(WAIT_NO_EVENT);
      expect(receivedEvents.length).toBe(0);
    });
  });
});

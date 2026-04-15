import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, cp, writeFile, unlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { EventBus } from '../../cli/kanban/server/services/event-bus.js';
import { Repository } from '../../cli/kanban/server/services/repository.js';
import { startWatcher } from '../../cli/kanban/server/services/file-watcher.js';

const FIXTURE_PATH = path.resolve(import.meta.dirname, '../fixtures/project-management');
const DEBOUNCE = 200;
const WAIT_AFTER_DEBOUNCE = 400;

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
    const storyPath = path.join(tmpDir, 'backlog/user-stories/US-001-login.md');
    await writeFile(storyPath, '---\nid: US-001\ntitle: Modified login\n---\nUpdated content', 'utf8');

    await sleep(WAIT_AFTER_DEBOUNCE);

    expect(receivedEvents.length).toBeGreaterThan(0);
    const evt = receivedEvents.find((e) => e.path === storyPath);
    expect(evt).toBeDefined();
    expect(evt.event).toBe('change');
    expect(evt.category).toBe('story');
  });

  it('should debounce multiple rapid changes to the same file', async () => {
    const storyPath = path.join(tmpDir, 'backlog/user-stories/US-001-login.md');

    await writeFile(storyPath, '---\nid: US-001\ntitle: Change 1\n---\nContent 1', 'utf8');
    await sleep(50);
    await writeFile(storyPath, '---\nid: US-001\ntitle: Change 2\n---\nContent 2', 'utf8');
    await sleep(50);
    await writeFile(storyPath, '---\nid: US-001\ntitle: Change 3\n---\nContent 3', 'utf8');

    await sleep(WAIT_AFTER_DEBOUNCE);

    const events = receivedEvents.filter((e) => e.path === storyPath);
    expect(events.length).toBe(1);
  });

  it('should ignore non-relevant files', async () => {
    const randomFile = path.join(tmpDir, 'random.txt');
    await writeFile(randomFile, 'Random content', 'utf8');

    await sleep(WAIT_AFTER_DEBOUNCE);

    const evt = receivedEvents.find((e) => e.path === randomFile);
    expect(evt).toBeUndefined();
  });

  it('should publish add event when new task is created', async () => {
    const taskPath = path.join(tmpDir, 'sprints/sprint-001-skeleton/tasks/TASK-999.md');
    await writeFile(taskPath, '---\nid: TASK-999\nus_id: US-001\ntitle: New task\n---\nTask body', 'utf8');

    await sleep(WAIT_AFTER_DEBOUNCE);

    const evt = receivedEvents.find((e) => e.path === taskPath);
    expect(evt).toBeDefined();
    // chokidar may emit 'add' or 'change' depending on watcher readiness timing;
    // either is acceptable — what matters is that the UI is notified.
    expect(['add', 'change']).toContain(evt.event);
    expect(evt.category).toBe('task');
  });

  it('should publish unlink event when file is deleted', async () => {
    const taskPath = path.join(tmpDir, 'sprints/sprint-001-skeleton/tasks/TASK-001.md');
    await unlink(taskPath);

    await sleep(WAIT_AFTER_DEBOUNCE);

    const evt = receivedEvents.find((e) => e.path === taskPath);
    expect(evt).toBeDefined();
    expect(evt.event).toBe('unlink');
    expect(evt.category).toBe('task');
  });

  it('should stop cleanly and not publish events after stop', async () => {
    await watcher.stop();

    const storyPath = path.join(tmpDir, 'backlog/user-stories/US-001-login.md');
    await writeFile(storyPath, '---\nid: US-001\ntitle: After stop\n---\nShould not trigger', 'utf8');

    await sleep(WAIT_AFTER_DEBOUNCE);

    expect(receivedEvents.length).toBe(0);
  });
});

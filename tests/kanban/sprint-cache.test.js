import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import { mkdtemp, rm, writeFile, mkdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import yaml from 'js-yaml';
import {
  loadSprintStatus,
  rebuildSprintStatus,
  computeBurndown,
} from '../../cli/kanban/server/services/sprint-cache.js';
import { Repository } from '../../cli/kanban/server/services/repository.js';

describe('sprint-cache', () => {
  let tmpDir;
  let projectRoot;
  let pmDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'sprint-cache-test-'));
    projectRoot = tmpDir;
    pmDir = path.join(tmpDir, 'project-management');
    await mkdir(pmDir, { recursive: true });
  });

  afterEach(async () => {
    if (tmpDir) await rm(tmpDir, { recursive: true, force: true });
  });

  describe('loadSprintStatus', () => {
    it('returns null if file does not exist', async () => {
      const result = await loadSprintStatus(projectRoot);
      expect(result).toBe(null);
    });

    it('parses valid sprint-status.yaml correctly', async () => {
      const yamlContent = {
        version: '1.0',
        metadata: {
          sprint_id: 'sprint-001',
          name: 'Sprint 001',
          start_date: '2026-04-01',
          end_date: '2026-04-14',
          goal: 'Deliver auth',
        },
        stories: {
          'US-001': {
            title: 'Login',
            status: 'in-progress',
            story_points: 5,
            history: [],
          },
        },
      };

      await mkdir(path.join(projectRoot, '.bmad'), { recursive: true });
      await writeFile(path.join(projectRoot, '.bmad', 'sprint-status.yaml'), yaml.dump(yamlContent), 'utf8');

      const result = await loadSprintStatus(projectRoot);
      expect(result).toBeDefined();
      expect(result.metadata.sprint_id).toBe('sprint-001');
      expect(result.stories['US-001'].title).toBe('Login');
    });

    it('propagates non-ENOENT read errors', async () => {
      // Make sprint-status.yaml a directory so readFile throws EISDIR (not ENOENT).
      await mkdir(path.join(projectRoot, '.bmad', 'sprint-status.yaml'), { recursive: true });

      await expect(loadSprintStatus(projectRoot)).rejects.toThrow();
    });

    it('returns object with _invalid flag if yaml schema is invalid', async () => {
      const invalidYaml = {
        version: '1.0',
        metadata: {
          sprint_id: 123,
        },
        stories: 'invalid',
      };

      await mkdir(path.join(projectRoot, '.bmad'), { recursive: true });
      await writeFile(path.join(projectRoot, '.bmad', 'sprint-status.yaml'), yaml.dump(invalidYaml), 'utf8');

      const result = await loadSprintStatus(projectRoot);
      expect(result._invalid).toBe(true);
      expect(result.metadata.sprint_id).toBe(123);
    });
  });

  describe('rebuildSprintStatus', () => {
    it('creates sprint-status.yaml from repository state', async () => {
      const storiesDir = path.join(pmDir, 'backlog', 'user-stories');
      await mkdir(storiesDir, { recursive: true });

      await writeFile(
        path.join(storiesDir, 'US-001.md'),
        `---
id: US-001
title: Login feature
status: in-progress
story_points: 5
sprint_id: sprint-001-auth
---
# US-001
As a user, I want to login.
`,
        'utf8'
      );

      const sprintDir = path.join(pmDir, 'sprints', 'sprint-001-auth');
      await mkdir(sprintDir, { recursive: true });
      await writeFile(path.join(sprintDir, 'sprint-goal.md'), '# Sprint 001\n\nDeliver authentication.', 'utf8');

      const repository = new Repository(pmDir);
      await repository.refresh();

      const result = await rebuildSprintStatus(projectRoot, repository);

      expect(result).toBeDefined();
      expect(result.metadata.sprint_id).toBe('sprint-001-auth');
      expect(result.metadata.goal).toBe('Deliver authentication.');
      expect(result.stories['US-001']).toBeDefined();
      expect(result.stories['US-001'].title).toBe('Login feature');
      expect(result.stories['US-001'].story_points).toBe(5);

      const yamlPath = path.join(projectRoot, '.bmad', 'sprint-status.yaml');
      const content = await readFile(yamlPath, 'utf8');
      const parsed = yaml.load(content);
      expect(parsed.metadata.sprint_id).toBe('sprint-001-auth');
    });

    it('preserves history from existing yaml', async () => {
      const storiesDir = path.join(pmDir, 'backlog', 'user-stories');
      await mkdir(storiesDir, { recursive: true });

      await writeFile(
        path.join(storiesDir, 'US-001.md'),
        `---
id: US-001
title: Login feature
status: done
story_points: 5
sprint_id: sprint-001-auth
---
`,
        'utf8'
      );

      const sprintDir = path.join(pmDir, 'sprints', 'sprint-001-auth');
      await mkdir(sprintDir, { recursive: true });
      await writeFile(path.join(sprintDir, 'sprint-goal.md'), '# Goal\n\nAuth', 'utf8');

      const existingYaml = {
        version: '1.0',
        metadata: {
          sprint_id: 'sprint-001-auth',
          name: 'sprint-001-auth',
          start_date: '2026-04-01',
          end_date: '2026-04-14',
          goal: 'Auth',
        },
        stories: {
          'US-001': {
            title: 'Login feature',
            status: 'in-progress',
            story_points: 5,
            history: [
              { timestamp: '2026-04-05T10:00:00Z', from: 'ready-for-dev', to: 'in-progress', by: 'alice', reason: '' },
              { timestamp: '2026-04-10T15:00:00Z', from: 'in-progress', to: 'done', by: 'alice', reason: '' },
            ],
          },
        },
      };

      await mkdir(path.join(projectRoot, '.bmad'), { recursive: true });
      await writeFile(path.join(projectRoot, '.bmad', 'sprint-status.yaml'), yaml.dump(existingYaml), 'utf8');

      const repository = new Repository(pmDir);
      await repository.refresh();

      const result = await rebuildSprintStatus(projectRoot, repository);

      expect(result.stories['US-001'].history).toHaveLength(2);
      expect(result.stories['US-001'].history[1].to).toBe('done');
    });

    it('returns null if no active sprint found', async () => {
      const repository = new Repository(pmDir);
      await repository.refresh();

      const result = await rebuildSprintStatus(projectRoot, repository);
      expect(result).toBe(null);
    });

    it('detects active sprint based on in-progress stories', async () => {
      const storiesDir = path.join(pmDir, 'backlog', 'user-stories');
      await mkdir(storiesDir, { recursive: true });

      await writeFile(
        path.join(storiesDir, 'US-001.md'),
        `---
id: US-001
title: Old story
status: done
sprint_id: sprint-000-old
---
`,
        'utf8'
      );

      await writeFile(
        path.join(storiesDir, 'US-002.md'),
        `---
id: US-002
title: Active story
status: in-progress
sprint_id: sprint-001-new
---
`,
        'utf8'
      );

      const sprintDir = path.join(pmDir, 'sprints', 'sprint-001-new');
      await mkdir(sprintDir, { recursive: true });
      await writeFile(path.join(sprintDir, 'sprint-goal.md'), '# Goal\n\nNew sprint', 'utf8');

      const repository = new Repository(pmDir);
      await repository.refresh();

      const result = await rebuildSprintStatus(projectRoot, repository);

      expect(result.metadata.sprint_id).toBe('sprint-001-new');
    });
  });

  describe('computeBurndown', () => {
    it('returns empty arrays if no dates in metadata', () => {
      const sprintStatus = {
        version: '1.0',
        metadata: {
          sprint_id: 'sprint-001',
          name: 'Sprint 001',
          start_date: '',
          end_date: '',
          goal: 'Goal',
        },
        stories: {},
      };

      const stories = [
        { id: 'US-001', story_points: 5 },
        { id: 'US-002', story_points: 3 },
      ];

      const result = computeBurndown(sprintStatus, stories);

      expect(result.ideal).toEqual([]);
      expect(result.actual).toEqual([]);
      expect(result.total_points).toBe(8);
      expect(result.on_track).toBe(null);
    });

    it('computes ideal burndown correctly', () => {
      const sprintStatus = {
        version: '1.0',
        metadata: {
          sprint_id: 'sprint-001',
          name: 'Sprint 001',
          start_date: '2026-04-01',
          end_date: '2026-04-05',
          goal: 'Goal',
        },
        stories: {},
      };

      const stories = [{ id: 'US-001', story_points: 10 }];

      const result = computeBurndown(sprintStatus, stories);

      expect(result.ideal).toHaveLength(5);
      expect(result.ideal[0].points).toBe(10);
      expect(result.ideal[4].points).toBe(0);
      expect(result.total_points).toBe(10);
    });

    it('computes actual burndown from history', () => {
      const sprintStatus = {
        version: '1.0',
        metadata: {
          sprint_id: 'sprint-001',
          name: 'Sprint 001',
          start_date: '2026-04-01',
          end_date: '2026-04-10',
          goal: 'Goal',
        },
        stories: {
          'US-001': {
            title: 'Story 1',
            status: 'done',
            story_points: 5,
            history: [{ timestamp: '2026-04-03T10:00:00Z', from: 'in-progress', to: 'done', by: 'alice', reason: '' }],
          },
          'US-002': {
            title: 'Story 2',
            status: 'done',
            story_points: 3,
            history: [{ timestamp: '2026-04-05T14:00:00Z', from: 'review', to: 'done', by: 'bob', reason: '' }],
          },
        },
      };

      const stories = [
        { id: 'US-001', story_points: 5 },
        { id: 'US-002', story_points: 3 },
      ];

      const result = computeBurndown(sprintStatus, stories);

      expect(result.actual).toHaveLength(3);
      expect(result.actual[0].date).toBe('2026-04-01');
      expect(result.actual[0].points).toBe(8);
      expect(result.actual[1].date).toBe('2026-04-03');
      expect(result.actual[1].points).toBe(3);
      expect(result.actual[2].date).toBe('2026-04-05');
      expect(result.actual[2].points).toBe(0);
    });

    it('determines on-track status correctly', () => {
      const sprintStatus = {
        version: '1.0',
        metadata: {
          sprint_id: 'sprint-001',
          name: 'Sprint 001',
          start_date: '2026-04-01',
          end_date: '2026-04-10',
          goal: 'Goal',
        },
        stories: {
          'US-001': {
            title: 'Story 1',
            status: 'done',
            story_points: 8,
            history: [{ timestamp: '2026-04-05T10:00:00Z', from: 'in-progress', to: 'done', by: 'alice', reason: '' }],
          },
        },
      };

      const stories = [{ id: 'US-001', story_points: 10 }];

      const result = computeBurndown(sprintStatus, stories);

      expect(result.on_track).toBe('on-track');
    });

    it('determines at-risk status correctly', () => {
      const sprintStatus = {
        version: '1.0',
        metadata: {
          sprint_id: 'sprint-001',
          name: 'Sprint 001',
          start_date: '2026-04-01',
          end_date: '2026-04-10',
          goal: 'Goal',
        },
        stories: {
          'US-001': {
            title: 'Story 1',
            status: 'done',
            story_points: 3,
            history: [{ timestamp: '2026-04-05T10:00:00Z', from: 'in-progress', to: 'done', by: 'alice', reason: '' }],
          },
          'US-002': {
            title: 'Story 2',
            status: 'in-progress',
            story_points: 7,
            history: [],
          },
        },
      };

      const stories = [
        { id: 'US-001', story_points: 3 },
        { id: 'US-002', story_points: 7 },
      ];

      const result = computeBurndown(sprintStatus, stories);

      expect(result.on_track).toBe('at-risk');
    });

    it('determines behind status correctly', () => {
      const sprintStatus = {
        version: '1.0',
        metadata: {
          sprint_id: 'sprint-001',
          name: 'Sprint 001',
          start_date: '2026-04-01',
          end_date: '2026-04-10',
          goal: 'Goal',
        },
        stories: {
          'US-001': {
            title: 'Story 1',
            status: 'done',
            story_points: 1,
            history: [{ timestamp: '2026-04-05T10:00:00Z', from: 'in-progress', to: 'done', by: 'alice', reason: '' }],
          },
          'US-002': {
            title: 'Story 2',
            status: 'in-progress',
            story_points: 9,
            history: [],
          },
        },
      };

      const stories = [
        { id: 'US-001', story_points: 1 },
        { id: 'US-002', story_points: 9 },
      ];

      const result = computeBurndown(sprintStatus, stories);

      expect(result.on_track).toBe('behind');
    });
  });

  describe('GET /api/sprints/current', () => {
    it('returns 404 if no sprint-status.yaml exists', async () => {
      const repository = new Repository(pmDir);
      await repository.refresh();

      const { createApp } = await import('../../cli/kanban/server/app.js');
      const app = createApp({ repository, port: 3000, projectRoot });

      const res = await app.request('/api/sprints/current');
      expect(res.status).toBe(404);
    });

    it('returns sprint data with burndown when sprint exists', async () => {
      const storiesDir = path.join(pmDir, 'backlog', 'user-stories');
      await mkdir(storiesDir, { recursive: true });

      await writeFile(
        path.join(storiesDir, 'US-001.md'),
        `---
id: US-001
title: Login feature
status: in-progress
story_points: 5
sprint_id: sprint-001-auth
assigned_to: alice
tasks:
  total: 3
  completed: 1
---
`,
        'utf8'
      );

      const sprintDir = path.join(pmDir, 'sprints', 'sprint-001-auth');
      await mkdir(sprintDir, { recursive: true });
      await writeFile(path.join(sprintDir, 'sprint-goal.md'), '# Goal\n\nAuth delivery', 'utf8');

      const yamlContent = {
        version: '1.0',
        metadata: {
          sprint_id: 'sprint-001-auth',
          name: 'sprint-001-auth',
          start_date: '2026-04-01',
          end_date: '2026-04-10',
          goal: 'Auth delivery',
        },
        stories: {
          'US-001': {
            title: 'Login feature',
            status: 'in-progress',
            story_points: 5,
            assigned_to: 'alice',
            history: [
              { timestamp: '2026-04-03T10:00:00Z', from: 'ready-for-dev', to: 'in-progress', by: 'alice', reason: '' },
            ],
          },
        },
      };

      await mkdir(path.join(projectRoot, '.bmad'), { recursive: true });
      await writeFile(path.join(projectRoot, '.bmad', 'sprint-status.yaml'), yaml.dump(yamlContent), 'utf8');

      const repository = new Repository(pmDir);
      await repository.refresh();

      const { createApp } = await import('../../cli/kanban/server/app.js');
      const app = createApp({ repository, port: 3000, projectRoot });

      const res = await app.request('/api/sprints/current');
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.sprint.sprint_id).toBe('sprint-001-auth');
      expect(data.stories).toHaveLength(1);
      expect(data.stories[0].id).toBe('US-001');
      expect(data.burndown.total_points).toBe(5);
      expect(data.burndown.ideal.length).toBeGreaterThan(0);
    });

    it('returns 404 if sprint-status.yaml is invalid', async () => {
      const invalidYaml = {
        version: '1.0',
        metadata: { sprint_id: 123 },
        stories: 'invalid',
      };

      await mkdir(path.join(projectRoot, '.bmad'), { recursive: true });
      await writeFile(path.join(projectRoot, '.bmad', 'sprint-status.yaml'), yaml.dump(invalidYaml), 'utf8');

      const repository = new Repository(pmDir);
      await repository.refresh();

      const { createApp } = await import('../../cli/kanban/server/app.js');
      const app = createApp({ repository, port: 3000, projectRoot });

      const res = await app.request('/api/sprints/current');
      expect(res.status).toBe(404);
    });
  });
});

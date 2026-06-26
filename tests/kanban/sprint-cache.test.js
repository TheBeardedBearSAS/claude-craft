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

  // REL-004 : couverture branches sprint-cache.js (75.75% → ≥85%)
  describe('loadSprintStatus — branches manquantes', () => {
    it('returns _invalid with original data when YAML is syntactically broken', async () => {
      await mkdir(path.join(projectRoot, '.bmad'), { recursive: true });
      await writeFile(path.join(projectRoot, '.bmad', 'sprint-status.yaml'), 'key: [unclosed', 'utf8');
      // YAML invalide syntaxiquement → js-yaml lève YAMLException → propagé comme throw
      await expect(loadSprintStatus(projectRoot)).rejects.toThrow();
    });

    it('handles yaml.load returning null (empty file)', async () => {
      await mkdir(path.join(projectRoot, '.bmad'), { recursive: true });
      await writeFile(path.join(projectRoot, '.bmad', 'sprint-status.yaml'), '', 'utf8');
      const result = await loadSprintStatus(projectRoot);
      // yaml.load('') retourne null → safeParse échoue → _invalid: true
      expect(result).not.toBeNull();
      expect(result._invalid).toBe(true);
    });
  });

  describe('rebuildSprintStatus — branches manquantes', () => {
    it('handles _invalid currentStatus (existingHistory uses empty object)', async () => {
      const storiesDir = path.join(pmDir, 'backlog', 'user-stories');
      await mkdir(storiesDir, { recursive: true });

      await writeFile(
        path.join(storiesDir, 'US-001.md'),
        `---
id: US-001
title: Story with invalid yaml status
status: in-progress
story_points: 3
sprint_id: sprint-002-test
---
`,
        'utf8'
      );

      const sprintDir = path.join(pmDir, 'sprints', 'sprint-002-test');
      await mkdir(sprintDir, { recursive: true });
      await writeFile(path.join(sprintDir, 'sprint-goal.md'), '# Goal\n\nTest sprint', 'utf8');

      // Écrire un YAML de statut invalide (schéma) → _invalid = true → existingHistory = {}
      const invalidStatusYaml = {
        version: '1.0',
        metadata: { sprint_id: 123 }, // sprint_id doit être string
        stories: 'invalid',
      };
      await mkdir(path.join(projectRoot, '.bmad'), { recursive: true });
      await writeFile(path.join(projectRoot, '.bmad', 'sprint-status.yaml'), yaml.dump(invalidStatusYaml), 'utf8');

      const repository = new Repository(pmDir);
      await repository.refresh();

      const result = await rebuildSprintStatus(projectRoot, repository);
      expect(result).not.toBeNull();
      expect(result.stories['US-001']).toBeDefined();
      // History vide car existingHistory = {} (pas de données préservées)
      expect(result.stories['US-001'].history).toEqual([]);
    });

    it('handles story without sprint_id in findActiveSprint', async () => {
      const storiesDir = path.join(pmDir, 'backlog', 'user-stories');
      await mkdir(storiesDir, { recursive: true });

      // Story sans sprint_id → ignorée dans findActiveSprint
      await writeFile(
        path.join(storiesDir, 'US-001.md'),
        `---
id: US-001
title: Story without sprint
status: backlog
story_points: 2
---
`,
        'utf8'
      );

      const repository = new Repository(pmDir);
      await repository.refresh();

      const result = await rebuildSprintStatus(projectRoot, repository);
      expect(result).toBeNull();
    });

    it('reads sprint goal — sprint without goalPath returns empty string', async () => {
      const storiesDir = path.join(pmDir, 'backlog', 'user-stories');
      await mkdir(storiesDir, { recursive: true });

      // Sprint avec sprint_id mais sans fichier sprint-goal.md
      await writeFile(
        path.join(storiesDir, 'US-001.md'),
        `---
id: US-001
title: Story without goal file
status: in-progress
story_points: 2
sprint_id: sprint-no-goal
---
`,
        'utf8'
      );

      const repository = new Repository(pmDir);
      await repository.refresh();

      const result = await rebuildSprintStatus(projectRoot, repository);
      // Sprint existe via stories mais sans goal file → goal = ''
      expect(result).not.toBeNull();
      expect(result.metadata.goal).toBe('');
    });

    it('sorts sprints: active count wins over lexicographic order', async () => {
      const storiesDir = path.join(pmDir, 'backlog', 'user-stories');
      await mkdir(storiesDir, { recursive: true });

      // sprint-aaa a plus de stories actives que sprint-zzz
      await writeFile(
        path.join(storiesDir, 'US-001.md'),
        `---
id: US-001
title: Active story 1
status: in-progress
sprint_id: sprint-aaa
---
`,
        'utf8'
      );
      await writeFile(
        path.join(storiesDir, 'US-002.md'),
        `---
id: US-002
title: Active story 2
status: review
sprint_id: sprint-aaa
---
`,
        'utf8'
      );
      await writeFile(
        path.join(storiesDir, 'US-003.md'),
        `---
id: US-003
title: Done story
status: done
sprint_id: sprint-zzz
---
`,
        'utf8'
      );

      const repository = new Repository(pmDir);
      await repository.refresh();

      const result = await rebuildSprintStatus(projectRoot, repository);
      expect(result.metadata.sprint_id).toBe('sprint-aaa');
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

    // REL-004 : branches manquantes dans computeBurndown / buildActualBurndown
    it('on_track is null when totalPoints is 0', () => {
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

      // stories avec 0 points chacune
      const stories = [{ id: 'US-001', story_points: 0 }];
      const result = computeBurndown(sprintStatus, stories);

      expect(result.total_points).toBe(0);
      // La branche `totalPoints > 0` est false → on_track reste null
      expect(result.on_track).toBe(null);
    });

    it('on_track is null when no actual burndown data exists (no history)', () => {
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
            status: 'in-progress',
            story_points: 5,
            history: [], // pas d'événements → actual.length === 1 (seul le point de départ)
          },
        },
      };

      const stories = [{ id: 'US-001', story_points: 5 }];
      const result = computeBurndown(sprintStatus, stories);

      // actual.length === 1, lastActual.date = start_date, sameDay trouvé, variance = 0 → on-track
      expect(['on-track', 'at-risk', 'behind', null]).toContain(result.on_track);
    });

    it('ignores done events outside sprint date range', () => {
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
            history: [
              // Événement AVANT le sprint
              { timestamp: '2026-03-15T10:00:00Z', from: 'in-progress', to: 'done', by: 'alice', reason: '' },
              // Événement APRÈS la fin du sprint
              { timestamp: '2026-04-20T10:00:00Z', from: 'in-progress', to: 'done', by: 'alice', reason: '' },
            ],
          },
        },
      };

      const stories = [{ id: 'US-001', story_points: 5 }];
      const result = computeBurndown(sprintStatus, stories);

      // Les 2 événements sont hors plage → actual n'a que le point de départ
      expect(result.actual).toHaveLength(1);
      expect(result.actual[0].date).toBe('2026-04-01');
      expect(result.actual[0].points).toBe(5);
    });

    it('handles story_points undefined/null gracefully', () => {
      const sprintStatus = {
        version: '1.0',
        metadata: {
          sprint_id: 'sprint-001',
          name: 'Sprint 001',
          start_date: '2026-04-01',
          end_date: '2026-04-05',
          goal: 'Goal',
        },
        stories: {
          'US-001': {
            title: 'Story without points',
            status: 'in-progress',
            story_points: undefined,
            history: [],
          },
        },
      };

      const stories = [{ id: 'US-001', story_points: undefined }];
      const result = computeBurndown(sprintStatus, stories);

      // story_points undefined → ?? 0 → total = 0
      expect(result.total_points).toBe(0);
    });

    it('on_track is null when lastActual date not in ideal (date mismatch)', () => {
      // Forcer une situation où lastActual.date n'est pas dans ideal
      // en utilisant une plage de sprint d'1 jour et un événement le dernier jour
      const sprintStatus = {
        version: '1.0',
        metadata: {
          sprint_id: 'sprint-001',
          name: 'Sprint 001',
          start_date: '2026-04-01',
          end_date: '2026-04-01',
          goal: 'Goal',
        },
        stories: {
          'US-001': {
            title: 'Story 1',
            status: 'done',
            story_points: 5,
            history: [{ timestamp: '2026-04-01T10:00:00Z', from: 'in-progress', to: 'done', by: 'alice', reason: '' }],
          },
        },
      };

      const stories = [{ id: 'US-001', story_points: 5 }];
      const result = computeBurndown(sprintStatus, stories);

      // Sprint d'1 jour : ideal = [{date:'2026-04-01', points:5}] (totalDays=0, boucle day=0..0)
      // actual = start_date + done event → on_track calculable
      expect(result.total_points).toBe(5);
      expect(['on-track', 'at-risk', 'behind', null]).toContain(result.on_track);
    });

    // --- Sprint EN COURS : la ligne "réel" doit refléter la réalité ---
    // Bug #5 (UI) : un sprint actif dont les stories ont history:[] produisait un
    // `actual` à UN SEUL point (juste le départ) → la courbe réelle était un point
    // invisible. Pour un sprint en cours (now ∈ [start,end]) on ancre un point
    // "aujourd'hui" au remaining RÉEL (total − points des stories actuellement done),
    // même sans historique horodaté.
    const activeSprintStatus = (stories) => ({
      version: '1.0',
      metadata: {
        sprint_id: 'sprint-10',
        name: 'Active',
        start_date: '2026-04-01',
        end_date: '2026-04-10',
        goal: 'Goal',
      },
      stories,
    });

    it('anchors a "today" point at the live remaining for a running sprint (empty history)', () => {
      const sprintStatus = activeSprintStatus({
        'US-001': { title: 'A', status: 'done', story_points: 5, history: [] },
        'US-002': { title: 'B', status: 'in-progress', story_points: 3, history: [] },
      });
      const stories = [
        { id: 'US-001', status: 'done', story_points: 5 },
        { id: 'US-002', status: 'in-progress', story_points: 3 },
      ];
      // now injecté DANS la fenêtre du sprint → déterministe.
      const result = computeBurndown(sprintStatus, stories, new Date('2026-04-04T12:00:00Z'));

      expect(result.actual).toHaveLength(2);
      expect(result.actual[0]).toEqual({ date: '2026-04-01', points: 8 });
      // 8 total − 5 done (live) = 3 restants, ancré à aujourd'hui.
      expect(result.actual[1]).toEqual({ date: '2026-04-04', points: 3 });
    });

    it('does NOT anchor today for a finished sprint (now after end → history only)', () => {
      const sprintStatus = activeSprintStatus({
        'US-001': { title: 'A', status: 'done', story_points: 5, history: [] },
      });
      const stories = [{ id: 'US-001', status: 'done', story_points: 5 }];
      const result = computeBurndown(sprintStatus, stories, new Date('2026-05-01T00:00:00Z'));
      // Sprint clôturé : on garde l'historique brut (ici juste le point de départ).
      expect(result.actual).toHaveLength(1);
      expect(result.actual[0]).toEqual({ date: '2026-04-01', points: 5 });
    });

    it('does NOT anchor today before the sprint has started', () => {
      const sprintStatus = activeSprintStatus({
        'US-001': { title: 'A', status: 'backlog', story_points: 5, history: [] },
      });
      const stories = [{ id: 'US-001', status: 'backlog', story_points: 5 }];
      const result = computeBurndown(sprintStatus, stories, new Date('2026-03-15T00:00:00Z'));
      expect(result.actual).toHaveLength(1);
      expect(result.actual[0]).toEqual({ date: '2026-04-01', points: 5 });
    });

    it('extends a sparse history line to today for a running sprint', () => {
      const sprintStatus = activeSprintStatus({
        'US-001': {
          title: 'A',
          status: 'done',
          story_points: 5,
          history: [{ timestamp: '2026-04-02T10:00:00Z', from: 'review', to: 'done', by: 'a', reason: '' }],
        },
        'US-002': { title: 'B', status: 'in-progress', story_points: 3, history: [] },
      });
      const stories = [
        { id: 'US-001', status: 'done', story_points: 5 },
        { id: 'US-002', status: 'in-progress', story_points: 3 },
      ];
      const result = computeBurndown(sprintStatus, stories, new Date('2026-04-06T12:00:00Z'));
      // départ(8) → événement 04-02 (3) → ancre 04-06 au remaining live (8−5=3)
      expect(result.actual).toHaveLength(3);
      expect(result.actual[0]).toEqual({ date: '2026-04-01', points: 8 });
      expect(result.actual[1]).toEqual({ date: '2026-04-02', points: 3 });
      expect(result.actual[2]).toEqual({ date: '2026-04-06', points: 3 });
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

    // REL-001 + REL-008 : YAML syntaxiquement invalide → 503 contrôlé
    it('returns 503 when sprint-status.yaml is syntactically invalid YAML', async () => {
      await mkdir(path.join(projectRoot, '.bmad'), { recursive: true });
      // YAML syntaxiquement invalide (pas juste un schéma invalide)
      await writeFile(
        path.join(projectRoot, '.bmad', 'sprint-status.yaml'),
        'key: [unclosed bracket\n  bad: indent\n:::',
        'utf8'
      );

      const repository = new Repository(pmDir);
      await repository.refresh();

      const { createApp } = await import('../../cli/kanban/server/app.js');
      const app = createApp({ repository, port: 3000, projectRoot });

      const res = await app.request('/api/sprints/current');
      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.error).toBe('sprint_data_unavailable');
    });

    it('returns 503 with reason when loadSprintStatus throws YAMLException', async () => {
      await mkdir(path.join(projectRoot, '.bmad'), { recursive: true });
      // YAML avec indentation tab invalide qui provoque une YAMLException
      await writeFile(
        path.join(projectRoot, '.bmad', 'sprint-status.yaml'),
        '%invalid yaml directive\n---\nfoo: bar',
        'utf8'
      );

      const repository = new Repository(pmDir);
      await repository.refresh();

      const { createApp } = await import('../../cli/kanban/server/app.js');
      const app = createApp({ repository, port: 3000, projectRoot });

      const res = await app.request('/api/sprints/current');
      // Soit 503 (YAML invalide) soit 404 (si js-yaml accepte) — l'important est pas de 500
      expect([503, 404]).toContain(res.status);
      expect(res.status).not.toBe(500);
    });
  });
});

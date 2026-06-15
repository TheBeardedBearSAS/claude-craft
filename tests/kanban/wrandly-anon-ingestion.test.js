/**
 * Functional tests — ingestion of a realistic anonymized BMAD v6 project ("Atlas")
 * into the kanban Repository. These reproduce the bugs reported on the real board:
 * whole-board-empty (schema rejects null/loose fields), archived sprints invisible,
 * priority frozen to 'should', dependencies dropped.
 *
 * Fixture: tests/fixtures/wrandly-anon (BMAD v6 single-writer track — stories live in
 * .bmad/sprint-status.yaml; no standalone US-*.md except two edge-case markdown stories).
 *
 * Written BEFORE the fixes (TDD red). They MUST fail until repository.js / schemas.js /
 * sprint-cache.js are corrected.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtemp, cp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Repository } from '../../cli/kanban/server/services/repository.js';
import { loadSprintStatus } from '../../cli/kanban/server/services/sprint-cache.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.resolve(__dirname, '../fixtures/wrandly-anon');

const CURRENT_SPRINT = 'sprint-9-auth-premium';

let projectRoot; // tmp copy root (parent of project-management/)
let repo;

beforeEach(async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'kb-wrandly-'));
  await cp(FIXTURE, dir, { recursive: true });
  projectRoot = dir;
  repo = new Repository(path.join(dir, 'project-management'));
  await repo.refresh();
});

describe('sprint-status.yaml validation (real BMAD v6 shape)', () => {
  it('accepts assigned_to:null and loose tdd_phase without flagging the file invalid', async () => {
    const ss = await loadSprintStatus(projectRoot);
    expect(ss).not.toBeNull();
    // RED: current schema rejects assigned_to:null and tdd_phase "not-started"/"review"
    // → safeParse fails → loadSprintStatus returns { _invalid: true } → board empty.
    expect(ss._invalid).toBeFalsy();
    expect(ss.metadata.sprint_id).toBe(CURRENT_SPRINT);
  });

  it('preserves capacity_points on the current sprint metadata', async () => {
    const ss = await loadSprintStatus(projectRoot);
    expect(ss._invalid).toBeFalsy();
    expect(ss.metadata.capacity_points).toBe(13);
  });
});

describe('current sprint stories surfaced', () => {
  it('exposes all current-sprint stories from the YAML overlay', () => {
    const ids = new Set(repo.listStories({ sprintId: CURRENT_SPRINT }).map((s) => s.id));
    for (const id of ['TT-20', 'US-E4-03', 'US-E4-06', 'US-E4-07a', 'US-E4-07b', 'US-E4-08']) {
      expect(ids.has(id), `missing ${id}`).toBe(true);
    }
    // US-200 is a markdown-backed story also pinned to this sprint.
    expect(ids.has('US-200')).toBe(true);
  });

  it('maps BMAD P0..P3 priorities onto the MoSCoW enum', () => {
    const byId = Object.fromEntries(repo.listStories({ sprintId: CURRENT_SPRINT }).map((s) => [s.id, s]));
    // P0->must, P1->should, P2->could, P3->wont
    expect(byId['US-E4-03'].priority).toBe('must'); // P0
    expect(byId['US-E4-07b'].priority).toBe('should'); // P1
    expect(byId['US-E4-06'].priority).toBe('could'); // P2
    expect(byId['US-E4-08'].priority).toBe('wont'); // P3
  });

  it('parses freeform dependency strings down to known story ids', () => {
    const story = repo.getStory('US-E4-03');
    // dependencies in YAML: ["US-E4-02 (modèle compte, S8, done)", "Config console AuthProvider ..."]
    expect(story.dependencies).toContain('US-E4-02');
  });

  it('keeps a YAML-only story read-only (no backing markdown file)', () => {
    const story = repo.getStory('US-E4-03');
    expect(story._writable).toBe(false);
    expect(story._source).toBe('sprint-status');
  });

  it('handles assigned_to:null and role assignees without crashing', () => {
    const byId = Object.fromEntries(repo.listStories({ sprintId: CURRENT_SPRINT }).map((s) => [s.id, s]));
    expect(byId['US-E4-03'].assigned_to ?? '').toBe(''); // null normalized
    expect(byId['TT-20'].assigned_to).toBe('conductor');
  });
});

describe('archived sprint history surfaced', () => {
  it('ingests archived_sprints stories with their sprint_id and points', () => {
    const s1 = repo.listStories({ sprintId: 'sprint-1-infrastructure' });
    expect(s1.length).toBe(8);
    const total = s1.reduce((n, s) => n + (s.story_points ?? 0), 0);
    expect(total).toBe(25); // points_delivered for sprint-1
    expect(s1.every((s) => s.status === 'done')).toBe(true);
  });

  it('carries the epic from the archived sprint onto its stories', () => {
    const s2 = repo.listStories({ sprintId: 'sprint-2-design-system' });
    expect(s2.length).toBe(8); // US-E1-01..05 + TT-01..03
    expect(s2.every((s) => s.epic_id === 'E1')).toBe(true);
  });

  it('marks archived stories read-only', () => {
    const s1 = repo.listStories({ sprintId: 'sprint-1-infrastructure' });
    expect(s1.length).toBe(8);
    expect(s1.every((s) => s._writable === false)).toBe(true);
  });

  it('surfaces deferred stories without breaking the enum', () => {
    // TT-03 is "deferred" in sprint-2 archived data.
    const s2 = repo.listStories({ sprintId: 'sprint-2-design-system' });
    const tt03 = s2.find((s) => s.id === 'TT-03');
    expect(tt03).toBeDefined();
  });
});

describe('markdown story edge cases', () => {
  it('classifies a numeric-id markdown story and lets it win over any YAML entry', () => {
    const legacy = repo.getStory('US-200');
    expect(legacy).not.toBeNull();
    expect(legacy._writable).toBe(true);
    expect(legacy._source).toBe('markdown');
  });
});

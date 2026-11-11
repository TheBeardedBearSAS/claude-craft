import { z } from 'zod';
import { STATUSES } from './transitions.js';
import { STORY_ID_RE, EPIC_ID_RE, TASK_ID_RE } from './ids.js';

export { STATUSES };
export const PRIORITIES = ['must', 'should', 'could', 'wont'];
export const TDD_PHASES = ['', 'red', 'green', 'refactor', 'done'];
export const TASK_TYPES = ['DB', 'BE', 'FE-WEB', 'FE-MOB', 'TEST', 'DOC', 'OPS', 'REV'];
export const TASK_STATUSES = ['to-do', 'in-progress', 'done', 'blocked'];

const storyId = z.string().regex(STORY_ID_RE, 'Expected US-XXX, US-E<n>-NN or TT-XXX');
const epicId = z.string().regex(EPIC_ID_RE, 'Expected EPIC-XXX');
const taskId = z.string().regex(TASK_ID_RE, 'Expected TASK-XXX');

export const StoryStatusSchema = z.enum(STATUSES);
export const PrioritySchema = z.enum(PRIORITIES);
export const TddPhaseSchema = z.enum(TDD_PHASES);

export const HistoryEntrySchema = z.object({
  timestamp: z.string(),
  from: z.string(),
  to: z.string(),
  by: z.string().default('auto'),
  reason: z.string().default(''),
});

export const StoryFrontmatterSchema = z
  .object({
    id: storyId,
    title: z.string().min(1),
    epic_id: epicId.nullable().optional(),
    persona: z.string().optional().default(''),
    status: StoryStatusSchema.default('backlog'),
    previous_status: z.string().optional().default(''),
    story_points: z.number().int().min(0).max(21).default(0),
    priority: PrioritySchema.optional().default('should'),
    sprint_id: z.string().nullable().optional(),
    assigned_to: z.string().optional().default(''),
    tdd_phase: TddPhaseSchema.optional().default(''),
    invest_score: z.number().int().min(0).max(6).optional(),
    blocked_reason: z.string().optional().default(''),
    blocked_at: z.string().optional().default(''),
    traceability: z
      .object({
        implements: z.array(z.string()).default([]),
        tests: z.array(z.string()).default([]),
      })
      .optional()
      .default({ implements: [], tests: [] }),
    tasks: z
      .object({
        total: z.number().int().min(0).default(0),
        completed: z.number().int().min(0).default(0),
        list: z.array(taskId).default([]),
      })
      .optional()
      .default({ total: 0, completed: 0, list: [] }),
    dependencies: z.array(storyId).optional().default([]),
  })
  .passthrough();

export const EpicFrontmatterSchema = z
  .object({
    id: epicId,
    title: z.string().min(1),
    status: z.enum(['draft', 'ready', 'in-progress', 'done']).default('draft'),
    business_value: z.enum(['high', 'medium', 'low']).optional().default('medium'),
    estimated_sprints: z.number().int().min(0).optional().default(0),
  })
  .passthrough();

export const TaskFrontmatterSchema = z
  .object({
    id: taskId,
    us_id: storyId,
    type: z.enum(TASK_TYPES),
    status: z.enum(TASK_STATUSES).default('to-do'),
    estimation_hours: z.number().min(0).default(0),
    actual_hours: z.number().min(0).optional().default(0),
    assigned_to: z.string().optional().default(''),
  })
  .passthrough();

export const SprintStatusSchema = z
  .object({
    version: z.string().default('1.0'),
    // metadata is passthrough so optional BMAD fields (capacity_points,
    // capacity_note, last_sync, …) survive validation and reach the burndown
    // / sprint screens instead of being silently stripped.
    metadata: z
      .object({
        sprint_id: z.string(),
        name: z.string(),
        start_date: z.string(),
        end_date: z.string(),
        goal: z.string().default(''),
        epic: z.string().optional().default(''),
        capacity_points: z.number().int().min(0).optional(),
        capacity_note: z.string().optional().default(''),
        // Set when the sprint is closed; the sprint then lives on in archived_sprints.
        closed_date: z.string().optional(),
      })
      .passthrough(),
    stories: z
      .record(
        z
          .object({
            title: z.string(),
            status: StoryStatusSchema,
            previous_status: z.string().optional().default(''),
            // Own sprint: null = backlog; an absent key keeps the historical "active sprint" reading.
            sprint_id: z.string().nullable().optional(),
            // Real BMAD v6 yaml uses assigned_to: null for unassigned stories.
            // Rejecting null here flagged the WHOLE file invalid → empty board.
            assigned_to: z.string().nullable().optional().default(''),
            // tdd_phase is loose: BMAD writes "not-started"/"review" outside the
            // strict enum; the UI tolerates unknown phases. Don't reject the file.
            tdd_phase: z.string().optional().default(''),
            story_points: z.number().int().min(0).default(0),
            epic_id: z.string().optional().default(''),
            tasks: z
              .object({
                total: z.number().int().min(0).default(0),
                completed: z.number().int().min(0).default(0),
                list: z.array(z.string()).default([]),
                // Per-task status (TASK-xxx -> to-do|in-progress|done|blocked).
                status: z.record(z.string(), z.enum(TASK_STATUSES)).optional(),
              })
              .optional(),
            history: z.array(HistoryEntrySchema).optional().default([]),
          })
          // passthrough keeps priority (P0..P3), platform, dependencies, note…
          // so the ingestion layer can map/surface them.
          .passthrough()
      )
      .default({}),
  })
  // top-level passthrough preserves archived_sprints, routing, gates,
  // state_machine, last_sync for downstream ingestion.
  .passthrough();

export const TransitionRequestSchema = z.object({
  status: StoryStatusSchema,
  blocked_reason: z.string().max(500).optional(),
  reason: z.string().max(500).optional(),
});

// Epics are written `EPIC-004` (markdown) or `E4` (sprint-status.yaml).
const storyEpicId = z.string().regex(/^(?:EPIC-\d{3,}|E\d+)$/, 'Expected EPIC-XXX or E<n>');
const storyTitle = z.string().trim().min(1).max(200);
const storyPoints = z.number().int().min(0).max(21);
const sprintRef = z.string().min(1).max(100);

/** PATCH /api/stories/:id : any subset of the editable fields, at least one. */
export const StoryPatchSchema = z
  .object({
    title: storyTitle.optional(),
    story_points: storyPoints.optional(),
    assigned_to: z.string().max(100).nullable().optional(),
    priority: PrioritySchema.optional(),
    tdd_phase: TddPhaseSchema.optional(),
    epic_id: storyEpicId.nullable().optional(),
    sprint_id: sprintRef.nullable().optional(),
    dependencies: z.array(storyId).max(50).optional(),
  })
  .strict()
  .refine((patch) => Object.keys(patch).length > 0, { message: 'At least one field is required' });

/** POST /api/stories */
export const StoryCreateSchema = z
  .object({
    title: storyTitle,
    epic_id: storyEpicId.nullable().optional(),
    story_points: storyPoints.optional(),
    priority: PrioritySchema.optional(),
    persona: z.string().trim().max(200).optional(),
    sprint_id: sprintRef.nullable().optional(),
  })
  .strict();

/** PUT /api/stories/:id/body : `markdown` is what follows the frontmatter (the whole file without one). */
export const StoryBodySchema = z
  .object({
    markdown: z.string().max(500_000),
    expected_mtime: z.number().finite(),
  })
  .strict();

/** A task's name is its identifier in `tasks.list`. */
const taskTitle = z.string().trim().min(1).max(200);

/** PATCH /api/stories/:id/tasks/:taskId : a new status, a new name, or both. */
export const TaskPatchSchema = z
  .object({ status: z.enum(TASK_STATUSES).optional(), title: taskTitle.optional() })
  .strict()
  .refine((patch) => patch.status !== undefined || patch.title !== undefined, 'Expected status or title');

/** POST /api/stories/:id/tasks */
export const TaskCreateSchema = z.object({ title: taskTitle }).strict();

// --- sprints and settings ---------------------------------------------------

/** One path segment: the id names a directory under project-management/sprints/. */
export const SPRINT_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/;

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
  .refine((d) => new Date(`${d}T00:00:00Z`).toJSON()?.slice(0, 10) === d, 'Not a calendar date');
const sprintId = z.string().regex(SPRINT_ID_RE, 'Invalid sprint id');
const expectedVersion = z.string().min(1).max(64).optional();

export const SprintCreateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .regex(/^\P{Cc}+$/u, 'No control characters'),
    start_date: isoDate,
    end_date: isoDate,
    goal: z.string().trim().max(1000).optional(),
    capacity_points: z.number().int().min(0).max(999).optional(),
  })
  .strict()
  .refine((s) => s.end_date >= s.start_date, { path: ['end_date'], message: 'end_date precedes start_date' });

export const SprintStartSchema = z.object({ expected_version: expectedVersion }).strict();

export const SprintCloseSchema = z
  .object({
    carry_over: z.union([z.literal('backlog'), sprintId]).default('backlog'),
    expected_version: expectedVersion,
  })
  .strict();

/** Partial update: a number sets the limit of a status, null removes it. */
export const WipLimitsSchema = z
  .object(Object.fromEntries(STATUSES.map((s) => [s, z.number().int().min(1).max(99).nullable().optional()])))
  .strict();

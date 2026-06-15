import { z } from 'zod';

export const STATUSES = ['backlog', 'ready-for-dev', 'in-progress', 'review', 'done', 'blocked'];
export const PRIORITIES = ['must', 'should', 'could', 'wont'];
export const TDD_PHASES = ['', 'red', 'green', 'refactor', 'done'];
export const TASK_TYPES = ['DB', 'BE', 'FE-WEB', 'FE-MOB', 'TEST', 'DOC', 'OPS', 'REV'];
export const TASK_STATUSES = ['to-do', 'in-progress', 'done', 'blocked'];

const idPattern = (prefix) => z.string().regex(new RegExp(`^${prefix}-\\d{3,}$`), `Expected ${prefix}-XXX`);

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
    id: idPattern('US'),
    title: z.string().min(1),
    epic_id: idPattern('EPIC').nullable().optional(),
    persona: z.string().optional().default(''),
    status: StoryStatusSchema.default('backlog'),
    previous_status: z.string().optional().default(''),
    story_points: z.number().int().min(0).max(21).default(0),
    priority: PrioritySchema.optional().default('should'),
    sprint_id: z.string().nullable().optional(),
    assigned_to: z.string().optional().default(''),
    tdd_phase: TddPhaseSchema.optional().default(''),
    invest_score: z.number().int().min(0).max(6).optional().default(0),
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
        list: z.array(idPattern('TASK')).default([]),
      })
      .optional()
      .default({ total: 0, completed: 0, list: [] }),
    dependencies: z.array(idPattern('US')).optional().default([]),
  })
  .passthrough();

export const EpicFrontmatterSchema = z
  .object({
    id: idPattern('EPIC'),
    title: z.string().min(1),
    status: z.enum(['draft', 'ready', 'in-progress', 'done']).default('draft'),
    business_value: z.enum(['high', 'medium', 'low']).optional().default('medium'),
    estimated_sprints: z.number().int().min(0).optional().default(0),
  })
  .passthrough();

export const TaskFrontmatterSchema = z
  .object({
    id: idPattern('TASK'),
    us_id: idPattern('US'),
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
      })
      .passthrough(),
    stories: z
      .record(
        z
          .object({
            title: z.string(),
            status: StoryStatusSchema,
            previous_status: z.string().optional().default(''),
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

export const StoryPatchSchema = z
  .object({
    story_points: z.number().int().min(0).max(21).optional(),
    assigned_to: z.string().max(100).optional(),
    priority: PrioritySchema.optional(),
    tdd_phase: TddPhaseSchema.optional(),
  })
  .strict();

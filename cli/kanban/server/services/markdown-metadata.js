import { mapBmadPriority } from '../../shared/priority.js';
import { parseDependencyRefs } from '../../shared/deps.js';

/**
 * Fallback for backlogs written from the claude-craft templates
 * (Project/i18n/<lang>/templates/{epic,user-story}.md) : no YAML frontmatter,
 * metadata as a "- **Label**: value" bullet list under "## Metadata"
 * (localized heading/labels). Derives the same fields the frontmatter schemas expect.
 */

const H1_RE = /^#\s+((?:US|EPIC)-\d+)\s*:\s*(.+?)\s*$/m;
// "- **Label**: value" and the French typography "- **Label** : value".
const ITEM_RE = /^\s*[-*]\s+\*\*([^*]+?)\*\*\s*:\s*(.*?)\s*$/gm;

// Normalized (lowercase, no accents) label -> field.
const LABELS = {
  id: 'id',
  epic: 'epic_id',
  sprint: 'sprint_id',
  persona: 'persona',
  status: 'status',
  statut: 'status',
  estado: 'status',
  points: 'story_points',
  puntos: 'story_points',
  punkte: 'story_points',
  pontos: 'story_points',
  moscow: 'priority',
  priority: 'priority',
  priorite: 'priority',
  prioridad: 'priority',
  prioritat: 'priority',
  prioridade: 'priority',
  'depends on': 'dependencies',
  'depend de': 'dependencies',
  'depende de': 'dependencies',
  'hangt ab von': 'dependencies',
};

// Status values stay English across the 5 template languages ("🔴 To Do").
const STORY_STATUS = {
  'to do': 'backlog',
  todo: 'backlog',
  backlog: 'backlog',
  ready: 'ready-for-dev',
  'ready for dev': 'ready-for-dev',
  'in progress': 'in-progress',
  review: 'review',
  'in review': 'review',
  done: 'done',
  completed: 'done',
  blocked: 'blocked',
};

const EPIC_STATUS = {
  'to do': 'draft',
  todo: 'draft',
  draft: 'draft',
  ready: 'ready',
  'in progress': 'in-progress',
  done: 'done',
  completed: 'done',
};

function normalize(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function statusKey(raw) {
  // Drop the leading emoji / punctuation, unify "In-Progress" / "in_progress".
  return normalize(raw)
    .replace(/[^a-z\s_-]/g, '')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isPlaceholder(value) {
  return value === '' || /^\{.*\}$/.test(value) || /^[—–-]+$/.test(value);
}

// Repeat until stable: a single pass leaves "<!--" behind for nested input like "<!<!-- -->-- -->".
function stripComments(text) {
  let previous;
  do {
    previous = text;
    text = text.replace(/<!--[\s\S]*?-->/g, '');
  } while (text !== previous);
  return text;
}

/** Raw field -> value map from the H1 and the metadata bullets (first occurrence wins). */
function parseMetadataList(body) {
  const text = stripComments(body);
  const raw = {};
  const h1 = text.match(H1_RE);
  if (h1) {
    raw.id = h1[1];
    raw.title = h1[2];
  }
  for (const [, label, value] of text.matchAll(ITEM_RE)) {
    const field = LABELS[normalize(label)];
    if (!field || isPlaceholder(value)) continue;
    raw[field] ??= value;
  }
  return raw;
}

function points(value) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? undefined : n;
}

function dropUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

/**
 * @param {string} body - markdown file content (no frontmatter)
 * @returns {object} candidate StoryFrontmatterSchema data ({} when nothing found)
 */
export function deriveStoryData(body) {
  const raw = parseMetadataList(body);
  if (Object.keys(raw).length === 0) return {};
  return dropUndefined({
    id: raw.id,
    title: raw.title,
    epic_id: raw.epic_id,
    sprint_id: raw.sprint_id,
    persona: raw.persona,
    status: raw.status === undefined ? undefined : (STORY_STATUS[statusKey(raw.status)] ?? 'backlog'),
    story_points: raw.story_points === undefined ? undefined : points(raw.story_points),
    priority: raw.priority === undefined ? undefined : mapBmadPriority(raw.priority),
    dependencies: parseDependencyRefs((raw.dependencies ?? '').split(',')),
  });
}

/**
 * @param {string} body - markdown file content (no frontmatter)
 * @returns {object} candidate EpicFrontmatterSchema data ({} when nothing found)
 */
export function deriveEpicData(body) {
  const raw = parseMetadataList(body);
  if (Object.keys(raw).length === 0) return {};
  return dropUndefined({
    id: raw.id,
    title: raw.title,
    status: raw.status === undefined ? undefined : (EPIC_STATUS[statusKey(raw.status)] ?? 'draft'),
  });
}

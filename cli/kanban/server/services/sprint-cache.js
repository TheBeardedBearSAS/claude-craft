import path from 'node:path';
import { readFile, stat } from 'node:fs/promises';
import { loadYaml } from './frontmatter.js';
import { SprintStatusSchema } from '../../shared/schemas.js';

const MAX_STATUS_BYTES = 5 * 1024 * 1024;

/**
 * Text of .bmad/sprint-status.yaml. Anything but a regular file of at most 5 MB is refused: a committed
 * symlink to /dev/zero or to a FIFO would otherwise fill memory or block the read forever.
 * @throws ENOENT when absent (callers treat that as "no status file")
 */
export async function readStatusText(yamlPath) {
  const st = await stat(yamlPath);
  if (!st.isFile() || st.size > MAX_STATUS_BYTES) {
    throw new Error('.bmad/sprint-status.yaml is not a regular file of at most 5 MB');
  }
  return readFile(yamlPath, 'utf8');
}

/**
 * Load sprint status from .bmad/sprint-status.yaml
 * @param {string} projectRoot - Parent of project-management/ directory
 * @returns {Promise<object|null>} Parsed sprint status or null if not found
 */
export async function loadSprintStatus(projectRoot) {
  const yamlPath = path.join(projectRoot, '.bmad', 'sprint-status.yaml');
  try {
    const content = await readStatusText(yamlPath);
    // js-yaml 5 throws YAMLException on empty input (v4 returned undefined). Treat an
    // empty/whitespace-only file as null so it flows to the _invalid path instead of throwing —
    // while genuinely malformed YAML still throws.
    const parsed = content.trim() === '' ? null : loadYaml(content);
    const result = SprintStatusSchema.safeParse(parsed);
    if (!result.success) {
      return { ...parsed, _invalid: true };
    }
    return result.data;
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

/**
 * Compute burndown chart data from sprint status and current stories
 * @param {object} sprintStatus - Sprint status object
 * @param {Array} storiesBySprint - Current stories in the sprint
 * @returns {object} Burndown chart with ideal/actual lines and on_track indicator
 */
export function computeBurndown(sprintStatus, storiesBySprint, now = new Date()) {
  const totalPoints = storiesBySprint.reduce((sum, s) => sum + (s.story_points ?? 0), 0);

  if (!sprintStatus.metadata.start_date || !sprintStatus.metadata.end_date) {
    return {
      ideal: [],
      actual: [],
      total_points: totalPoints,
      on_track: null,
    };
  }

  const startDate = new Date(sprintStatus.metadata.start_date);
  const endDate = new Date(sprintStatus.metadata.end_date);
  if (!(startDate <= endDate)) return { ideal: [], actual: [], total_points: totalPoints, on_track: null };
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  // start == end: a single ideal point, the rate is irrelevant (avoid 0/0).
  const pointsPerDay = totalDays > 0 ? totalPoints / totalDays : 0;

  const ideal = [];
  for (let day = 0; day <= totalDays; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    const remaining = totalPoints - pointsPerDay * day;
    ideal.push({
      date: date.toISOString().split('T')[0],
      points: Math.max(0, Math.round(remaining * 10) / 10),
    });
  }

  const actual = buildActualBurndown(sprintStatus, storiesBySprint, startDate, endDate, now);

  let onTrack = null;
  if (actual.length > 0 && totalPoints > 0) {
    const lastActual = actual[actual.length - 1];
    const sameDay = ideal.find((i) => i.date === lastActual.date);
    if (sameDay) {
      const diff = lastActual.points - sameDay.points;
      const variance = diff / totalPoints;
      if (variance <= 0.1) onTrack = 'on-track';
      else if (variance <= 0.25) onTrack = 'at-risk';
      else onTrack = 'behind';
    }
  }

  return {
    ideal,
    actual,
    total_points: totalPoints,
    on_track: onTrack,
  };
}

function buildActualBurndown(sprintStatus, storiesBySprint, startDate, endDate, now = new Date()) {
  const doneEvents = [];

  for (const story of storiesBySprint) {
    const storyData = sprintStatus.stories[story.id];
    if (!storyData?.history) continue;

    for (const entry of storyData.history) {
      if (entry.to === 'done' && typeof entry.timestamp === 'string') {
        const eventDate = new Date(entry.timestamp);
        if (eventDate >= startDate && eventDate <= endDate) {
          doneEvents.push({
            date: entry.timestamp.split('T')[0],
            points: story.story_points ?? 0,
          });
        }
      }
    }
  }

  doneEvents.sort((a, b) => a.date.localeCompare(b.date));

  const total = storiesBySprint.reduce((sum, s) => sum + (s.story_points ?? 0), 0);
  const actual = [];
  let remaining = total;

  actual.push({
    date: startDate.toISOString().split('T')[0],
    points: remaining,
  });

  for (const event of doneEvents) {
    remaining -= event.points;
    actual.push({
      date: event.date,
      points: Math.max(0, remaining),
    });
  }

  // Sprint EN COURS (now ∈ [start,end]) : ancrer un point "aujourd'hui" au
  // remaining RÉEL (total − points des stories actuellement done). Sans ça, un
  // sprint sans historique horodaté (history:[]) n'a qu'un point de départ et la
  // courbe réelle est un point invisible (bug UI #5). Un sprint clôturé
  // (now > end) ou pas encore démarré (now < start) garde l'historique brut.
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (today >= startDate && today <= endDate) {
    const liveDone = storiesBySprint
      .filter((s) => s.status === 'done')
      .reduce((sum, s) => sum + (s.story_points ?? 0), 0);
    const todayStr = today.toISOString().split('T')[0];
    const liveRemaining = Math.max(0, total - liveDone);
    const last = actual[actual.length - 1];
    if (last.date === todayStr) last.points = liveRemaining;
    else actual.push({ date: todayStr, points: liveRemaining });
  }

  return actual;
}

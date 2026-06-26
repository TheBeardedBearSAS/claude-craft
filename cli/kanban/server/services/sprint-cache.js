import path from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import yaml from 'js-yaml';
import { SprintStatusSchema } from '../../shared/schemas.js';

/**
 * Load sprint status from .bmad/sprint-status.yaml
 * @param {string} projectRoot - Parent of project-management/ directory
 * @returns {Promise<object|null>} Parsed sprint status or null if not found
 */
export async function loadSprintStatus(projectRoot) {
  const yamlPath = path.join(projectRoot, '.bmad', 'sprint-status.yaml');
  try {
    const content = await readFile(yamlPath, 'utf8');
    const parsed = yaml.load(content);
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
 * Rebuild sprint-status.yaml from current repository state
 * @param {string} projectRoot - Parent of project-management/ directory
 * @param {import('./repository.js').Repository} repository
 * @returns {Promise<object|null>} Built sprint status object or null if no active sprint
 */
export async function rebuildSprintStatus(projectRoot, repository) {
  const currentStatus = await loadSprintStatus(projectRoot);
  const existingHistory = currentStatus?._invalid ? {} : (currentStatus?.stories ?? {});

  const activeSprint = findActiveSprint(repository);
  if (!activeSprint) return null;

  const sprintGoal = await readSprintGoal(repository, activeSprint);
  const stories = repository.listStories({ sprintId: activeSprint });

  const storyMap = {};
  for (const story of stories) {
    const historyFromYaml = existingHistory[story.id]?.history ?? [];
    storyMap[story.id] = {
      title: story.title,
      status: story.status,
      previous_status: story.previous_status ?? '',
      assigned_to: story.assigned_to ?? '',
      tdd_phase: story.tdd_phase ?? '',
      story_points: story.story_points,
      epic_id: story.epic_id ?? '',
      tasks: story.tasks ?? { total: 0, completed: 0, list: [] },
      history: historyFromYaml,
    };
  }

  const sprintStatus = {
    version: '1.0',
    metadata: {
      sprint_id: activeSprint,
      name: activeSprint,
      start_date: '',
      end_date: '',
      goal: sprintGoal,
    },
    stories: storyMap,
  };

  const yamlPath = path.join(projectRoot, '.bmad', 'sprint-status.yaml');
  await mkdir(path.dirname(yamlPath), { recursive: true });
  await writeFile(yamlPath, yaml.dump(sprintStatus, { lineWidth: -1 }), 'utf8');

  return sprintStatus;
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
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  const ideal = [];
  for (let day = 0; day <= totalDays; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    const remaining = totalPoints - (totalPoints / totalDays) * day;
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

function findActiveSprint(repository) {
  const allStories = repository.listStories();
  const sprintCounts = {};

  for (const story of allStories) {
    if (!story.sprint_id) continue;
    if (!sprintCounts[story.sprint_id]) {
      sprintCounts[story.sprint_id] = { active: 0, all: 0 };
    }
    sprintCounts[story.sprint_id].all++;
    if (['in-progress', 'review', 'ready-for-dev'].includes(story.status)) {
      sprintCounts[story.sprint_id].active++;
    }
  }

  const sprints = Object.entries(sprintCounts).sort((a, b) => {
    if (a[1].active !== b[1].active) return b[1].active - a[1].active;
    return b[0].localeCompare(a[0]);
  });

  return sprints.length > 0 ? sprints[0][0] : null;
}

async function readSprintGoal(repository, sprintId) {
  const sprint = repository.sprints.get(sprintId);
  if (!sprint?.goalPath) return '';
  try {
    const content = await readFile(sprint.goalPath, 'utf8');
    const firstLine = content.split('\n').find((l) => l.trim() && !l.startsWith('#'));
    return firstLine?.trim() ?? '';
  } catch {
    return '';
  }
}

function buildActualBurndown(sprintStatus, storiesBySprint, startDate, endDate, now = new Date()) {
  const doneEvents = [];

  for (const story of storiesBySprint) {
    const storyData = sprintStatus.stories[story.id];
    if (!storyData?.history) continue;

    for (const entry of storyData.history) {
      if (entry.to === 'done') {
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

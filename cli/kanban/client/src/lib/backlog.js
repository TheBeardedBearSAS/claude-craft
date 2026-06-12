// Epic-grouping logic for the Backlog view. Pure (no Svelte/DOM) so it is unit-testable.

/**
 * Group stories under their epic.
 *
 * Stories whose `epic_id` matches a known epic land in that epic's group. Stories whose
 * `epic_id` is set but unknown (e.g. BMAD v6 `.bmad/sprint-status.yaml` stories with
 * `epic_id="E1"` and no markdown epic file) get a *synthesized* minimal group so they
 * still render — otherwise the Backlog screen goes blank. Stories without an `epic_id`
 * are orphans.
 *
 * @param {Array<object>} stories
 * @param {Array<{id:string,title?:string,business_value?:string,status?:string}>} epics
 * @returns {{groups: Array<{epic:object, stories:object[]}>, orphans: object[]}}
 */
export function groupStoriesByEpic(stories, epics) {
  const groups = new Map();
  for (const epic of epics) {
    groups.set(epic.id, { epic, stories: [] });
  }

  const orphans = [];
  for (const story of stories) {
    const epicId = story.epic_id;
    if (!epicId) {
      orphans.push(story);
      continue;
    }
    if (!groups.has(epicId)) {
      // Unknown epic_id: synthesize a group so the story stays visible.
      groups.set(epicId, { epic: { id: epicId, title: epicId, business_value: '', status: '' }, stories: [] });
    }
    groups.get(epicId).stories.push(story);
  }

  const sorted = [...groups.values()].sort((a, b) => a.epic.id.localeCompare(b.epic.id));
  for (const group of sorted) {
    group.stories.sort((a, b) => a.id.localeCompare(b.id));
  }
  orphans.sort((a, b) => a.id.localeCompare(b.id));

  return { groups: sorted, orphans };
}

// Extract story-id references from freeform BMAD dependency strings.
// BMAD v6 yaml writes dependencies as prose, e.g.
//   "US-E4-02 (modèle compte, S8, done)"
//   "Config console AuthProvider (Phase 0, NON PRÊTE)"
// The dependency graph needs the leading id token; non-id sentences yield nothing.

// Accept epic-embedded ids (US-E4-02, US-E2-05a), numeric ids (US-200),
// technical tasks (TT-20) and task ids (TASK-12).
const ID_HEAD = /^\s*(US-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*|TT-\d+|TASK-[A-Za-z0-9-]+)\b/;

/**
 * @param {Array<string>|undefined|null} rawList
 * @returns {string[]} unique id references, in first-seen order
 */
export function parseDependencyRefs(rawList) {
  if (!Array.isArray(rawList)) return [];
  const out = [];
  for (const raw of rawList) {
    if (typeof raw !== 'string') continue;
    const m = raw.match(ID_HEAD);
    if (m && !out.includes(m[1])) out.push(m[1]);
  }
  return out;
}

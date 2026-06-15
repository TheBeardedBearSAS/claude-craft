// Map BMAD priorities (P0..P3) onto the board's MoSCoW enum.
// BMAD v6 stories carry P0..P3 ; the kanban PriorityChip / filter only know
// must/should/could/wont. Without this map every YAML story rendered "Should".

const P_TO_MOSCOW = { P0: 'must', P1: 'should', P2: 'could', P3: 'wont' };
const MOSCOW = new Set(['must', 'should', 'could', 'wont']);

/**
 * @param {string|undefined|null} raw  e.g. "P0", "must"
 * @returns {'must'|'should'|'could'|'wont'}
 */
export function mapBmadPriority(raw) {
  if (raw === null || raw === undefined) return 'should';
  const v = String(raw).trim();
  if (P_TO_MOSCOW[v.toUpperCase()]) return P_TO_MOSCOW[v.toUpperCase()];
  if (MOSCOW.has(v.toLowerCase())) return v.toLowerCase();
  return 'should';
}

// Table equivalent of the dependency graph (K-28). Pure (no DOM) — tested in tests/kanban/deps-table.test.js.

import { STATUSES } from '../../../shared/transitions.js';
import { buildDepsElements } from './deps-graph.js';

const byIdNumeric = (a, b) => a.localeCompare(b, 'en', { numeric: true });

/**
 * One row per story that has at least one dependency link.
 * `edges` are { from: prerequisite, to: dependent }: `to` depends on `from`.
 * @returns {{ rows: Array<{id:string,title:string,status:string,epic_id:string|null,dependsOn:string[],blocks:string[],inCycle:boolean}>, isolated: number }}
 */
export function buildDepsTable(nodes = [], edges = [], cycles = []) {
  const { keptNodes, hiddenCount, cycleSet } = buildDepsElements(nodes, edges, cycles);
  const ids = new Set(keptNodes.map((n) => n.id));
  const link = (edge, pick, other) => (ids.has(edge[pick]) ? edge[other] : null);
  const rows = keptNodes.map((n) => ({
    id: n.id,
    title: n.title ?? '',
    status: n.status,
    epic_id: n.epic_id ?? null,
    dependsOn: edges
      .filter((e) => e.to === n.id)
      .map((e) => link(e, 'from', 'from'))
      .filter(Boolean)
      .sort(byIdNumeric),
    blocks: edges
      .filter((e) => e.from === n.id)
      .map((e) => link(e, 'to', 'to'))
      .filter(Boolean)
      .sort(byIdNumeric),
    inCycle: cycleSet.has(n.id),
  }));
  return { rows: rows.sort((a, b) => byIdNumeric(a.id, b.id)), isolated: hiddenCount };
}

const KEYS = {
  dependsOn: (r) => r.dependsOn.length,
  blocks: (r) => r.blocks.length,
  status: (r) => STATUSES.indexOf(r.status),
  cycle: (r) => Number(r.inCycle),
};

/** Sorted copy ('id' | 'status' | 'dependsOn' | 'blocks' | 'cycle'); id breaks ties, unknown key keeps the order. */
export function sortDepsRows(rows, key, dir = 'asc') {
  const sign = dir === 'desc' ? -1 : 1;
  if (key === 'id') return [...rows].sort((a, b) => sign * byIdNumeric(a.id, b.id));
  const get = KEYS[key];
  if (!get) return [...rows];
  return [...rows].sort((a, b) => (get(a) - get(b)) * sign || byIdNumeric(a.id, b.id));
}

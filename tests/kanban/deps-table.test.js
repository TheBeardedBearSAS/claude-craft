import { describe, it, expect } from 'vitest';
import { buildDepsTable, sortDepsRows } from '../../cli/kanban/client/src/lib/deps-table.js';

const nodes = [
  { id: 'US-1', title: 'Base', status: 'done', epic_id: 'E1' },
  { id: 'US-2', title: 'Mid', status: 'in-progress', epic_id: 'E1' },
  { id: 'US-3', title: 'Top', status: 'backlog', epic_id: null },
  { id: 'US-9', title: 'Alone', status: 'backlog', epic_id: null },
];
// edge = { from: prerequisite, to: dependent }
const edges = [
  { from: 'US-1', to: 'US-2' },
  { from: 'US-2', to: 'US-3' },
  { from: 'US-1', to: 'US-3' },
];

describe('buildDepsTable', () => {
  it('lists dependsOn and blocks for connected stories only', () => {
    const { rows, isolated } = buildDepsTable(nodes, edges, []);
    expect(rows.map((r) => r.id)).toEqual(['US-1', 'US-2', 'US-3']);
    const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
    expect(byId['US-1'].dependsOn).toEqual([]);
    expect(byId['US-1'].blocks).toEqual(['US-2', 'US-3']);
    expect(byId['US-3'].dependsOn).toEqual(['US-1', 'US-2']);
    expect(byId['US-2'].blocks).toEqual(['US-3']);
    expect(isolated).toBe(1);
  });

  it('flags stories taken in a cycle', () => {
    const cyc = [
      { from: 'US-1', to: 'US-2' },
      { from: 'US-2', to: 'US-1' },
    ];
    const { rows } = buildDepsTable(nodes, cyc, [['US-1', 'US-2', 'US-1']]);
    expect(rows.map((r) => r.inCycle)).toEqual([true, true]);
  });

  it('copies title, status and epic, and ignores edges to unknown stories', () => {
    const { rows } = buildDepsTable(nodes, [{ from: 'US-404', to: 'US-1' }], []);
    expect(rows).toEqual([]);
  });

  it('copes with missing input', () => {
    expect(buildDepsTable(undefined, undefined, undefined)).toEqual({ rows: [], isolated: 0 });
  });
});

describe('sortDepsRows', () => {
  const { rows } = buildDepsTable(nodes, edges, []);

  it('sorts by id by default and by a numeric-aware key', () => {
    expect(sortDepsRows(rows, 'id', 'desc').map((r) => r.id)).toEqual(['US-3', 'US-2', 'US-1']);
  });

  it('sorts by number of dependencies', () => {
    expect(sortDepsRows(rows, 'dependsOn', 'desc')[0].id).toBe('US-3');
    expect(sortDepsRows(rows, 'blocks', 'desc')[0].id).toBe('US-1');
  });

  it('sorts by status order and puts cycles first when asked', () => {
    expect(sortDepsRows(rows, 'status', 'asc').map((r) => r.id)).toEqual(['US-3', 'US-2', 'US-1']);
    const withCycle = rows.map((r) => ({ ...r, inCycle: r.id === 'US-2' }));
    expect(sortDepsRows(withCycle, 'cycle', 'desc')[0].id).toBe('US-2');
  });

  it('does not mutate its input and ignores unknown keys', () => {
    const copy = [...rows];
    sortDepsRows(rows, 'blocks', 'desc');
    expect(rows).toEqual(copy);
    expect(sortDepsRows(rows, 'zzz', 'asc').map((r) => r.id)).toEqual(['US-1', 'US-2', 'US-3']);
  });
});

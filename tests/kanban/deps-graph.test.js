import { describe, it, expect } from 'vitest';
import { buildDepsElements } from '../../cli/kanban/client/src/lib/deps-graph.js';

const N = (id, extra = {}) => ({ id, status: 'backlog', ...extra });

describe('buildDepsElements', () => {
  it('keeps only nodes that participate in at least one edge', () => {
    // Bug #6 : 65 nodes / 5 edges → dagre empilait les ~60 nœuds isolés en une
    // colonne verticale illisible. On ne graphe que les nœuds connectés.
    const nodes = [N('A'), N('B'), N('C'), N('D'), N('E')];
    const edges = [
      { from: 'A', to: 'B' },
      { from: 'B', to: 'C' },
    ];
    const { elements, keptNodes, hiddenCount } = buildDepsElements(nodes, edges);

    expect(keptNodes.map((n) => n.id).sort()).toEqual(['A', 'B', 'C']);
    expect(hiddenCount).toBe(2); // D et E isolés
    // 3 nœuds + 2 arêtes
    expect(elements.filter((e) => e.data.id)).toHaveLength(3);
    expect(elements.filter((e) => e.data.source)).toHaveLength(2);
  });

  it('tags nodes in a cycle with the in-cycle class', () => {
    const nodes = [N('A'), N('B'), N('C')];
    const edges = [
      { from: 'A', to: 'B' },
      { from: 'B', to: 'A' },
      { from: 'B', to: 'C' },
    ];
    const { elements } = buildDepsElements(nodes, edges, [['A', 'B']]);
    const byId = Object.fromEntries(elements.filter((e) => e.data.id).map((e) => [e.data.id, e.classes]));
    expect(byId.A).toBe('in-cycle');
    expect(byId.B).toBe('in-cycle');
    expect(byId.C).toBe('');
  });

  it('drops edges that reference an unknown node (avoids cytoscape crash)', () => {
    const nodes = [N('A'), N('B')];
    const edges = [
      { from: 'A', to: 'B' },
      { from: 'A', to: 'GHOST' },
    ];
    const { elements, keptNodes } = buildDepsElements(nodes, edges);
    expect(keptNodes.map((n) => n.id).sort()).toEqual(['A', 'B']);
    expect(elements.filter((e) => e.data.source)).toHaveLength(1);
  });

  it('returns empty graph when there are no edges', () => {
    const { elements, keptNodes, hiddenCount } = buildDepsElements([N('A'), N('B')], []);
    expect(elements).toEqual([]);
    expect(keptNodes).toEqual([]);
    expect(hiddenCount).toBe(2);
  });

  it('handles empty inputs', () => {
    const { elements, keptNodes, hiddenCount } = buildDepsElements([], []);
    expect(elements).toEqual([]);
    expect(keptNodes).toEqual([]);
    expect(hiddenCount).toBe(0);
  });
});

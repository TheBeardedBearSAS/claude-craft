// Pure dependency-graph element builder (no DOM, no cytoscape) — unit-tested in
// tests/kanban/deps-graph.test.js.
//
// Bug #6 : the dependency view fed all stories to dagre, including the many that
// have NO dependency edge. Disconnected nodes share rank 0 and dagre stacks them
// in a single vertical column → an illegible wall. We graph only the connected
// sub-set and report how many isolated nodes were hidden.

/**
 * @param {Array<{id:string}>} nodes
 * @param {Array<{from:string,to:string}>} edges
 * @param {string[][]} [cycles]
 * @returns {{elements:object[], keptNodes:object[], hiddenCount:number, cycleSet:Set<string>}}
 */
export function buildDepsElements(nodes = [], edges = [], cycles = []) {
  const nodeIds = new Set(nodes.map((n) => n.id));
  // Edges whose BOTH endpoints exist as nodes (a dangling edge crashes cytoscape).
  const validEdges = edges.filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to));

  const connected = new Set();
  for (const e of validEdges) {
    connected.add(e.from);
    connected.add(e.to);
  }

  const cycleSet = new Set(cycles.flat());
  const keptNodes = nodes.filter((n) => connected.has(n.id));

  const elements = [
    ...keptNodes.map((n) => ({
      data: { id: n.id, label: n.id },
      classes: cycleSet.has(n.id) ? 'in-cycle' : '',
    })),
    ...validEdges.map((e) => ({ data: { source: e.from, target: e.to } })),
  ];

  return { elements, keptNodes, hiddenCount: nodes.length - keptNodes.length, cycleSet };
}

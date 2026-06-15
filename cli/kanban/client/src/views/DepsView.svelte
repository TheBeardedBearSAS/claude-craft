<script>
  import cytoscape from 'cytoscape';
  import dagre from 'cytoscape-dagre';
  import { STATUS } from '../lib/config.js';

  cytoscape.use(dagre);

  let graphContainer = $state(null);
  let cyInstance = $state(null);
  let nodes = $state([]);
  let edges = $state([]);
  let cycles = $state([]);
  let selectedNode = $state(null);
  let loading = $state(true);
  let error = $state(null);

  const stats = $derived({ nodes: nodes.length, edges: edges.length, cycles: cycles.length });

  /** Couleur de statut côté DOM (badge) — var() résolu par le navigateur. */
  const domStatusColor = (status) => `var(${STATUS[status]?.cssVar || '--fg-faint'})`;

  async function loadDependencies() {
    loading = true;
    error = null;
    try {
      const res = await fetch('/api/dependencies');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      nodes = data.nodes || [];
      edges = data.edges || [];
      cycles = data.cycles || [];
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function isInCycle(nodeId) {
    return cycles.some((cycle) => cycle.includes(nodeId));
  }

  $effect(() => {
    loadDependencies();
  });

  $effect(() => {
    if (!graphContainer || nodes.length === 0 || !edges || cyInstance) return;

    // Cytoscape rend sur canvas : on résout les tokens en couleurs réelles.
    const root = getComputedStyle(document.documentElement);
    const tok = (n, fb) => root.getPropertyValue(n).trim() || fb;
    const statusColor = (status) => tok(STATUS[status]?.cssVar || '--fg-faint', '#888');
    const cBg = tok('--bg-inset', '#111');
    const cBorder = tok('--border-faint', '#333');
    const cBorderStrong = tok('--border-strong', '#555');
    const cDanger = tok('--danger', '#e5484d');
    const cMono = tok('--mono', 'monospace');

    const cycleSet = new Set(cycles.flat());

    const elements = [
      ...nodes.map((n) => ({ data: { id: n.id, label: n.id }, classes: cycleSet.has(n.id) ? 'in-cycle' : '' })),
      ...edges.map((e) => ({ data: { source: e.from, target: e.to } })),
    ];

    const cy = cytoscape({
      container: graphContainer,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            shape: 'round-rectangle',
            'background-color': (ele) => {
              const node = nodes.find((n) => n.id === ele.id());
              return node ? statusColor(node.status) : '#888';
            },
            color: cBg,
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '11px',
            'font-weight': '600',
            'font-family': cMono,
            width: 'label',
            height: 'label',
            'padding-left': '10px',
            'padding-right': '10px',
            'padding-top': '7px',
            'padding-bottom': '7px',
            'border-width': 1,
            'border-color': cBorder,
          },
        },
        { selector: 'node.in-cycle', style: { 'border-width': 3, 'border-color': cDanger } },
        {
          selector: 'edge',
          style: {
            width: 1.6,
            'line-color': cBorderStrong,
            'target-arrow-color': cBorderStrong,
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
      ],
      layout: { name: 'dagre', rankDir: 'LR', spacingFactor: 1.3, nodeDimensionsIncludeLabels: true },
    });

    cy.on('tap', 'node', (evt) => {
      const nodeData = nodes.find((n) => n.id === evt.target.id());
      if (nodeData) selectedNode = nodeData;
    });

    cyInstance = cy;

    return () => {
      if (cyInstance) {
        cyInstance.destroy();
        cyInstance = null;
      }
    };
  });
</script>

<div class="deps-pad">
  {#if loading}
    <div class="empty">Loading dependencies…</div>
  {:else if error}
    <div class="empty" style="color: var(--danger)">Error: {error}</div>
  {:else if nodes.length === 0}
    <div class="empty">No dependencies found</div>
  {:else}
    <div class="deps-wrap">
      <header class="deps-header">
        <span class="stat">Nodes: {stats.nodes}</span>
        <span class="stat">Edges: {stats.edges}</span>
        <span class="stat" class:danger={stats.cycles > 0}>Cycles: {stats.cycles}</span>
      </header>

      <div class="deps-content">
        <div
          class="deps-canvas"
          bind:this={graphContainer}
          role="img"
          aria-label="Dependency graph with {stats.nodes} nodes, {stats.edges} edges, and {stats.cycles} cycles"
        ></div>

        {#if selectedNode}
          <aside class="node-details">
            <header class="details-header">
              <strong class="mono">{selectedNode.id}</strong>
              <button class="close-btn" onclick={() => (selectedNode = null)} aria-label="Fermer">×</button>
            </header>
            <dl>
              <dt>Titre</dt>
              <dd>{selectedNode.title || '—'}</dd>
              <dt>Statut</dt>
              <dd><span class="chip"><i class="swatch" style="background: {domStatusColor(selectedNode.status)}"></i>{STATUS[selectedNode.status]?.label || selectedNode.status}</span></dd>
              {#if selectedNode.epic_id}
                <dt>Epic</dt>
                <dd class="mono">{selectedNode.epic_id}</dd>
              {/if}
              {#if isInCycle(selectedNode.id)}
                <dt>⚠</dt>
                <dd style="color: var(--danger)">Fait partie d'un cycle de dépendances</dd>
              {/if}
            </dl>
          </aside>
        {/if}
      </div>

      <div class="sr-only">
        <h2>Dependency edges (text fallback)</h2>
        <ul>
          <!-- edge = { from: prerequisite, to: dependent } : "to depends on from". -->
          {#each edges as edge}<li>{edge.to} depends on {edge.from}</li>{/each}
        </ul>
      </div>
    </div>
  {/if}
</div>

<style>
  .deps-pad { padding: 22px; height: 100%; min-height: 0; display: flex; flex-direction: column; }
  .deps-pad .deps-wrap { flex: 1; min-height: 0; }
  .close-btn {
    background: none; border: none; font-size: 22px; line-height: 1; cursor: pointer;
    color: var(--fg-faint); width: 28px; height: 28px; display: grid; place-items: center; border-radius: var(--radius-sm);
  }
  .close-btn:hover { color: var(--fg); background: var(--bg-elev-2); }
  .node-details dl { margin-top: 4px; }
  .node-details dd { margin: 0; }
</style>

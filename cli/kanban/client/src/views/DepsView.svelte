<script>
  import cytoscape from 'cytoscape';
  import dagre from 'cytoscape-dagre';

  cytoscape.use(dagre);

  let graphContainer = $state(null);
  let cyInstance = $state(null);
  let nodes = $state([]);
  let edges = $state([]);
  let cycles = $state([]);
  let selectedNode = $state(null);
  let loading = $state(true);
  let error = $state(null);

  const stats = $derived({
    nodes: nodes.length,
    edges: edges.length,
    cycles: cycles.length,
  });

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

  function getStatusColor(status) {
    const colors = {
      backlog: 'var(--fg-dim)',
      'ready-for-dev': 'var(--info)',
      'in-progress': 'var(--warn)',
      review: 'var(--accent)',
      done: 'var(--ok)',
      blocked: 'var(--danger)',
    };
    return colors[status] || 'var(--fg-dim)';
  }

  function isInCycle(nodeId) {
    return cycles.some((cycle) => cycle.includes(nodeId));
  }

  $effect(() => {
    loadDependencies();
  });

  $effect(() => {
    if (!graphContainer || nodes.length === 0 || !edges || cyInstance) return;

    const cycleSet = new Set(cycles.flat());

    const elements = [
      ...nodes.map((n) => ({
        data: { id: n.id, label: n.id },
        classes: cycleSet.has(n.id) ? 'in-cycle' : '',
      })),
      ...edges.map((e) => ({
        data: { source: e.from, target: e.to },
      })),
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
              return node ? getStatusColor(node.status) : 'var(--fg-dim)';
            },
            color: 'var(--bg)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '11px',
            'font-weight': '600',
            'font-family': 'var(--mono)',
            width: 'label',
            height: 'label',
            'padding-left': '8px',
            'padding-right': '8px',
            'padding-top': '6px',
            'padding-bottom': '6px',
            'border-width': 1,
            'border-color': 'var(--border)',
          },
        },
        {
          selector: 'node.in-cycle',
          style: {
            'border-width': 3,
            'border-color': 'var(--danger)',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': 'var(--fg-dim)',
            'target-arrow-color': 'var(--fg-dim)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
      ],
      layout: {
        name: 'dagre',
        rankDir: 'LR',
        spacingFactor: 1.3,
        nodeDimensionsIncludeLabels: true,
      },
    });

    cy.on('tap', 'node', (evt) => {
      const nodeId = evt.target.id();
      const nodeData = nodes.find((n) => n.id === nodeId);
      if (nodeData) {
        selectedNode = nodeData;
      }
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

{#if loading}
  <div class="empty">Loading dependencies...</div>
{:else if error}
  <div class="empty" style="color: var(--danger)">Error: {error}</div>
{:else if nodes.length === 0}
  <div class="empty">No dependencies found</div>
{:else}
  <div class="deps-container">
    <header class="deps-header">
      <span class="stat">Nodes: {stats.nodes}</span>
      <span class="stat">Edges: {stats.edges}</span>
      <span class="stat" class:danger={stats.cycles > 0}>
        Cycles: {stats.cycles}
      </span>
    </header>

    <div class="deps-content">
      <div
        class="graph"
        bind:this={graphContainer}
        role="img"
        aria-label="Dependency graph with {stats.nodes} nodes, {stats.edges} edges, and {stats.cycles} cycles"
      ></div>

      {#if selectedNode}
        <aside class="node-details">
          <header class="details-header">
            <strong>{selectedNode.id}</strong>
            <button
              class="close-btn"
              onclick={() => (selectedNode = null)}
              aria-label="Close details"
            >
              ×
            </button>
          </header>
          <dl>
            <dt>Title</dt>
            <dd>{selectedNode.title || 'N/A'}</dd>
            <dt>Status</dt>
            <dd>
              <span
                class="badge"
                style="background-color: {getStatusColor(selectedNode.status)}"
              >
                {selectedNode.status}
              </span>
            </dd>
            {#if selectedNode.epic_id}
              <dt>Epic</dt>
              <dd class="epic">{selectedNode.epic_id}</dd>
            {/if}
            {#if isInCycle(selectedNode.id)}
              <dt>Warning</dt>
              <dd style="color: var(--danger)">Part of a dependency cycle</dd>
            {/if}
          </dl>
        </aside>
      {/if}
    </div>

    <div class="sr-only">
      <h2>Dependency edges (text fallback)</h2>
      <ul>
        {#each edges as edge}
          <li>{edge.from} depends on {edge.to}</li>
        {/each}
      </ul>
    </div>
  </div>
{/if}

<style>
  .deps-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
  }

  .deps-header {
    display: flex;
    gap: 16px;
    font-size: 13px;
    font-weight: 600;
    color: var(--fg-dim);
    font-family: var(--mono);
  }

  .stat.danger {
    color: var(--danger);
  }

  .deps-content {
    display: flex;
    gap: 12px;
    flex: 1;
    min-height: 0;
  }

  .graph {
    flex: 1;
    min-height: 600px;
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .node-details {
    width: 280px;
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0;
    overflow-y: auto;
  }

  .details-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid var(--border);
    font-weight: 600;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    color: var(--fg-dim);
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    color: var(--fg);
  }

  dl {
    padding: 12px;
    margin: 0;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px 12px;
    font-size: 13px;
  }

  dt {
    font-weight: 600;
    color: var(--fg-dim);
  }

  dd {
    margin: 0;
  }

  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    color: var(--bg);
    font-family: var(--mono);
    text-transform: uppercase;
  }

  .epic {
    font-family: var(--mono);
    font-size: 12px;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
</style>

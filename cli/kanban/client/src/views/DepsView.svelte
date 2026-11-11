<script module>
  // Cytoscape (~480 KB avec dagre) est importé dynamiquement à l'init du graphe,
  // PAS au chargement de la vue : le shell deps (header + stats) peint alors
  // aussi vite que les autres écrans (FCP/LCP), au lieu d'attendre le bundle viz.
  // Le flag de module garantit un seul enregistrement de l'extension dagre.
  let dagreRegistered = false;
  let cytoscapePromise = null;
  // Mémoïsé : un seul téléchargement du bundle, partagé par le préchargement au
  // mount et l'init du graphe. Le préchargement chevauche le fetch /api/* pour
  // sortir les 435 KB du chemin critique (LCP).
  function loadCytoscape() {
    if (!cytoscapePromise) {
      cytoscapePromise = (async () => {
        const [{ default: cytoscape }, { default: dagre }] = await Promise.all([
          import('cytoscape'),
          import('cytoscape-dagre'),
        ]);
        if (!dagreRegistered) {
          cytoscape.use(dagre);
          dagreRegistered = true;
        }
        return cytoscape;
      })();
    }
    return cytoscapePromise;
  }
</script>

<script>
  import { untrack } from 'svelte';
  import { store } from '../lib/store.svelte.js';
  import { route } from '../lib/router.svelte.js';
  import { formatHash } from '../lib/query.js';
  import { t, tn } from '../lib/i18n/index.svelte.js';
  import { request, latestOnly, isAbort, errorKey } from '../lib/api.js';
  import { STATUS } from '../lib/config.js';
  import { buildDepsElements } from '../lib/deps-graph.js';
  import { buildDepsTable, sortDepsRows } from '../lib/deps-table.js';
  import { normalizeColor, estimateNodeWidth, NODE_HEIGHT } from '../lib/deps-style.js';
  import { focusable } from '../lib/actions.js';
  import Icon from '../components/Icon.svelte';

  const COLUMNS = [
    { key: 'id', label: 'deps.table.story' },
    { key: 'status', label: 'deps.table.status' },
    { key: 'dependsOn', label: 'deps.table.dependsOn' },
    { key: 'blocks', label: 'deps.table.blocks' },
    { key: 'cycle', label: 'deps.table.cycle' },
  ];

  const run = latestOnly();

  let graphContainer = $state(null);
  // Non-réactif volontairement : l'instance cytoscape est mutée en async depuis
  // .then(). En faire un $state lu par le garde du $effect provoquerait une
  // auto-invalidation (set → re-run → cleanup → destroy juste après création).
  let cyInstance = null;
  let graphBuilt = false;
  let nodes = $state([]);
  let edges = $state([]);
  let cycles = $state([]);
  let signature = '';
  let loaded = $state(false);
  let errorKeyName = $state(null);
  let selectedId = $state(null);
  let panelEl = $state(null);
  let sortKey = $state('id');
  let sortDir = $state('asc');

  const stats = $derived({ nodes: nodes.length, edges: edges.length, cycles: cycles.length });
  // Nœuds sans aucune dépendance : exclus du graphe (sinon dagre les empile en colonne illisible)
  // mais comptés pour informer l'utilisateur.
  const table = $derived(buildDepsTable(nodes, edges, cycles));
  const rows = $derived(sortDepsRows(table.rows, sortKey, sortDir));
  const selected = $derived(table.rows.find((r) => r.id === selectedId) ?? null);

  const statusText = (s) => (STATUS[s] ? t(`status.${s}`) : s);
  const statusVar = (s) => `var(${STATUS[s]?.cssVar || '--fg-faint'})`;
  const storyHref = (id) => formatHash(route.name, route.params, { ...route.query, story: id });
  const ariaSort = (key) => (sortKey === key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined);

  function sortBy(key) {
    sortDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    sortKey = key;
  }

  async function load() {
    const ticket = run();
    try {
      const data = await request('/api/dependencies', { signal: ticket.signal });
      if (!ticket.current) return;
      errorKeyName = null;
      // A reload with identical data must not rebuild the graph (it would reset the zoom).
      const next = JSON.stringify(data);
      if (next !== signature) {
        signature = next;
        nodes = data.nodes || [];
        edges = data.edges || [];
        cycles = data.cycles || [];
      }
    } catch (err) {
      if (isAbort(err) || !ticket.current) return;
      errorKeyName = errorKey(err);
    }
    if (ticket.current) loaded = true;
  }

  $effect(() => {
    store.revision;
    untrack(load);
  });

  // Le panneau du nœud reçoit le focus à l'ouverture.
  $effect(() => {
    if (selectedId && panelEl) panelEl.focus();
  });

  function closePanel() {
    selectedId = null;
    graphContainer?.focus();
  }

  // Diffère le chargement du bundle cytoscape (435 KB) jusqu'APRÈS l'événement
  // `load`. Pendant la fenêtre de mesure du LCP (rendu du shell), le réseau reste
  // ainsi libre : pas de contention de bande passante qui retarderait la peinture
  // du texte du shell (élément LCP réel). Le graphe est progressif — il apparaît
  // juste après le premier rendu, ce qui améliore aussi l'UX réelle.
  function afterLoad(fn) {
    const schedule = () =>
      typeof requestIdleCallback === 'function' ? requestIdleCallback(fn, { timeout: 1000 }) : setTimeout(fn, 1);
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
  }

  $effect(() => {
    if (!graphContainer || nodes.length === 0 || !edges || graphBuilt) return;
    graphBuilt = true;
    let cancelled = false;
    const container = graphContainer;

    // Cytoscape rend sur canvas : on résout les tokens en couleurs réelles.
    // Les tokens sont en oklch() ; getComputedStyle les renvoie en lab()/oklch(),
    // que le parser de cytoscape rejette (warnings « style property invalid » +
    // perte de la couleur des nœuds). Un contexte canvas 2D normalise chaque
    // valeur en sRGB (cf. normalizeColor / deps-style.js).
    const nctx = document.createElement('canvas').getContext('2d');
    const norm = (col) => normalizeColor(col, nctx);
    const root = getComputedStyle(document.documentElement);
    const tok = (n, fb) => norm(root.getPropertyValue(n).trim() || fb);
    const statusColor = (status) => tok(STATUS[status]?.cssVar || '--fg-faint', '#888');
    const cBg = tok('--bg-inset', '#111');
    const cBorder = tok('--border-faint', '#333');
    const cBorderStrong = tok('--border-strong', '#555');
    const cDanger = tok('--danger', '#e5484d');
    const cMono = tok('--mono', 'monospace');

    // Graphe limité aux nœuds connectés (les isolés cassent le layout dagre).
    const { elements } = buildDepsElements(nodes, edges, cycles);
    if (elements.length === 0) {
      graphBuilt = false;
      return; // aucun lien → rien à dessiner (note affichée dans le DOM)
    }

    let cy = null;
    afterLoad(() => {
      if (cancelled) return;
      loadCytoscape().then((cytoscape) => {
        if (cancelled) return;
        cy = cytoscape({
      container,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            // Un cycle se lit aussi sur le libellé (⚠) et le tracé en pointillé, pas seulement sur la couleur.
            label: (ele) => (ele.hasClass('in-cycle') ? `⚠ ${ele.data('label')}` : ele.data('label')),
            shape: 'round-rectangle',
            'background-color': (ele) => {
              const node = nodes.find((n) => n.id === ele.id());
              return node ? statusColor(node.status) : '#888';
            },
            color: cBg,
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px',
            'font-weight': '600',
            'font-family': cMono,
            // Dimensions déterministes (cf. estimateNodeWidth) : remplacent
            // l'auto-sizing « label » des dimensions, déprécié par cytoscape 3.34.
            width: (ele) => estimateNodeWidth(ele.data('label') + (ele.hasClass('in-cycle') ? '⚠ ' : '')),
            height: NODE_HEIGHT,
            'text-max-width': '200px',
            'border-width': 1,
            'border-color': cBorder,
          },
        },
        { selector: 'node.in-cycle', style: { 'border-width': 3, 'border-color': cDanger, 'border-style': 'dashed' } },
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
      layout: { name: 'dagre', rankDir: 'LR', spacingFactor: 1.3, nodeDimensionsIncludeLabels: true, fit: true, padding: 30 },
      });

      // Recentrer/zoomer pour que le graphe occupe le canvas (évite le rendu décalé).
      cy.ready(() => cy.fit(undefined, 40));

      cy.on('tap', 'node', (evt) => {
        selectedId = evt.target.id();
      });

      cyInstance = cy;
      });
    });

    return () => {
      cancelled = true;
      graphBuilt = false;
      const instance = cyInstance || cy;
      if (instance) instance.destroy();
      cyInstance = null;
    };
  });
</script>

{#snippet idLinks(ids)}
  {#if ids.length}
    <ul class="dep-list">
      {#each ids as id (id)}<li><a href={storyHref(id)}>{id}</a></li>{/each}
    </ul>
  {:else}
    <span class="dep-none">{t('deps.table.none')}</span>
  {/if}
{/snippet}

<div class="view-pad" aria-busy={!loaded}>
  <h2 class="sr-only">{t('nav.deps')}</h2>
  {#if !loaded}
    <div class="empty" role="status">{t('deps.loading')}</div>
  {:else if errorKeyName}
    <div class="empty" role="alert">
      <p>{t(errorKeyName)}</p>
      <button class="btn" onclick={load}>{t('common.retry')}</button>
    </div>
  {:else if nodes.length === 0}
    <div class="empty">{t('deps.empty')}</div>
  {:else}
    <div class="deps-wrap">
      <ul class="deps-header">
        <li class="stat">{t('deps.stat.nodes', { n: stats.nodes })}</li>
        <li class="stat">{t('deps.stat.edges', { n: stats.edges })}</li>
        <li class="stat" class:danger={stats.cycles > 0}>
          {#if stats.cycles > 0}<Icon name="warn" size={13} />{/if}{t('deps.stat.cycles', { n: stats.cycles })}
        </li>
        {#if table.isolated > 0}
          <li class="stat muted" title={t('deps.isolated.title')}>{tn('deps.isolated', table.isolated)}</li>
        {/if}
      </ul>

      {#if stats.edges === 0}
        <div class="empty">{t('deps.noEdges')}</div>
      {:else}
        <p class="deps-hint">{t('deps.graph.hint')}</p>
        <div class="deps-content">
          <div class="deps-canvas" bind:this={graphContainer} tabindex="-1" role="img" aria-label={t('deps.graph.label', { nodes: stats.nodes, edges: stats.edges, cycles: stats.cycles })}></div>

          {#if selected}
            <aside class="node-details" bind:this={panelEl} tabindex="-1" aria-labelledby="node-details-title">
              <header class="details-header">
                <h3 id="node-details-title"><span class="sr-only">{t('deps.details.heading')}: </span><span class="mono">{selected.id}</span></h3>
                <button class="close-btn" onclick={closePanel} aria-label={t('deps.details.close')}><Icon name="close" size={16} /></button>
              </header>
              <dl>
                <dt>{t('deps.details.title')}</dt>
                <dd>{selected.title || '—'}</dd>
                <dt>{t('deps.details.status')}</dt>
                <dd><span class="chip"><i class="swatch" style:background={statusVar(selected.status)}></i>{statusText(selected.status)}</span></dd>
                {#if selected.epic_id}
                  <dt>{t('deps.details.epic')}</dt>
                  <dd class="mono">{selected.epic_id}</dd>
                {/if}
                <dt>{t('deps.table.dependsOn')}</dt>
                <dd>{@render idLinks(selected.dependsOn)}</dd>
                <dt>{t('deps.table.blocks')}</dt>
                <dd>{@render idLinks(selected.blocks)}</dd>
                {#if selected.inCycle}
                  <dt><Icon name="warn" size={14} /><span class="sr-only">{t('deps.table.cycle')}</span></dt>
                  <dd class="cycle-flag">{t('deps.details.inCycle')}</dd>
                {/if}
              </dl>
            </aside>
          {/if}
        </div>

        <div class="deps-table-wrap table-scroll" role="region" use:focusable aria-label={t('deps.table.caption')}>
          <table class="deps-table">
            <caption>{t('deps.table.caption')}</caption>
            <thead>
              <tr>
                {#each COLUMNS as col (col.key)}
                  <th scope="col" aria-sort={ariaSort(col.key)}>
                    <button class="th-sort" onclick={() => sortBy(col.key)} aria-label={t('deps.table.sortBy', { column: t(col.label) })}>
                      {t(col.label)}<span class="sort-mark" aria-hidden="true">{sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                    </button>
                  </th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each rows as row (row.id)}
                <tr class:in-cycle={row.inCycle}>
                  <th scope="row">
                    <a class="mono" href={storyHref(row.id)}>{row.id}</a>
                    {#if row.title}<span class="dep-title">{row.title}</span>{/if}
                  </th>
                  <td><span class="cell-status"><i style:background={statusVar(row.status)}></i>{statusText(row.status)}</span></td>
                  <td>{@render idLinks(row.dependsOn)}</td>
                  <td>{@render idLinks(row.blocks)}</td>
                  <td>
                    {#if row.inCycle}
                      <span class="cycle-flag"><Icon name="warn" size={14} />{t('deps.table.inCycle')}</span>
                    {:else}
                      {t('deps.table.noCycle')}
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  {/if}
</div>

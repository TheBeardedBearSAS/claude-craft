<script>
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';
  import { route, navigate } from '../lib/router.svelte.js';
  import { sortSprints } from '../lib/sprints.js';

  let sprints = $state([]);
  let loadingList = $state(true);
  let listError = $state(null);

  let detail = $state(null);
  let loadingDetail = $state(false);
  let detailError = $state(null);

  const selectedId = $derived(route.parts[1] ?? null);

  async function loadList() {
    loadingList = true;
    listError = null;
    try {
      const res = await fetch('/api/sprints');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      sprints = sortSprints(data.sprints || []);
    } catch (err) {
      listError = err.message;
    } finally {
      loadingList = false;
    }
  }

  async function loadDetail(id) {
    if (!id) {
      detail = null;
      return;
    }
    loadingDetail = true;
    detailError = null;
    try {
      const res = await fetch(`/api/sprints/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      detail = await res.json();
    } catch (err) {
      detailError = err.message;
      detail = null;
    } finally {
      loadingDetail = false;
    }
  }

  function render(md) {
    if (!md) return '';
    try {
      return DOMPurify.sanitize(marked.parse(md));
    } catch {
      return '<p>Error rendering markdown</p>';
    }
  }

  // Group a detail's tasks under their parent story for the stories table.
  const tasksByStory = $derived.by(() => {
    const map = {};
    for (const t of detail?.tasks ?? []) {
      (map[t.us_id] ??= []).push(t);
    }
    return map;
  });

  let expanded = $state(new Set());
  function toggleStory(id) {
    if (expanded.has(id)) expanded.delete(id);
    else expanded.add(id);
    expanded = new Set(expanded);
  }

  $effect(() => {
    loadList();
  });

  $effect(() => {
    loadDetail(selectedId);
  });
</script>

<div class="sprints-container">
  <aside class="sprints-sidebar" aria-label="Liste des sprints">
    {#if loadingList}
      <div class="muted">Loading…</div>
    {:else if listError}
      <div class="error">Error: {listError}</div>
    {:else if sprints.length === 0}
      <div class="muted">Aucun sprint</div>
    {:else}
      <nav class="sprint-list" aria-label="Sprints">
        {#each sprints as s}
          <button
            class="sprint-item"
            class:active={selectedId === s.id}
            onclick={() => navigate(`/sprints/${s.id}`)}
          >
            <span class="sprint-id">{s.id}</span>
            <span class="sprint-meta">{s.story_count} US · {s.done_points}/{s.total_points} pts</span>
            <span class="badges">
              {#if s.has_goal}<span class="badge" title="Sprint goal">goal</span>{/if}
              {#if s.has_review}<span class="badge review" title="Sprint review">review</span>{/if}
              {#if s.has_retro}<span class="badge retro" title="Retrospective">retro</span>{/if}
            </span>
          </button>
        {/each}
      </nav>
    {/if}
  </aside>

  <div class="sprints-content" role="region" aria-label="Détail du sprint">
    {#if !selectedId}
      <div class="empty">Sélectionnez un sprint</div>
    {:else if loadingDetail}
      <div class="empty">Loading…</div>
    {:else if detailError}
      <div class="error">Error: {detailError}</div>
    {:else if detail}
      <header class="content-header">
        <h1>{detail.sprint.id}</h1>
      </header>

      {#if detail.goal}
        <section class="md-section">
          <h2>Goal</h2>
          <div class="markdown-body">{@html render(detail.goal)}</div>
        </section>
      {/if}

      <section class="md-section">
        <h2>Stories &amp; Tasks</h2>
        {#if detail.stories.length === 0}
          <p class="muted">Aucune story dans ce sprint.</p>
        {:else}
          <table class="stories-table">
            <thead>
              <tr><th></th><th>ID</th><th>Titre</th><th>Statut</th><th>Points</th><th>Assigné</th></tr>
            </thead>
            <tbody>
              {#each detail.stories as st}
                {@const tasks = tasksByStory[st.id] ?? []}
                <tr>
                  <td>
                    {#if tasks.length}
                      <button
                        class="toggle"
                        aria-expanded={expanded.has(st.id)}
                        aria-label="Afficher les tâches de {st.id}"
                        onclick={() => toggleStory(st.id)}
                      >{expanded.has(st.id) ? '▼' : '▶'}</button>
                    {/if}
                  </td>
                  <td>{st.id}</td>
                  <td>{st.title}</td>
                  <td><span class="status status-{st.status}">{st.status}</span></td>
                  <td>{st.story_points ?? '—'}</td>
                  <td>{st.assigned_to || '—'}</td>
                </tr>
                {#if expanded.has(st.id) && tasks.length}
                  <tr class="tasks-row">
                    <td></td>
                    <td colspan="5">
                      <table class="tasks-table">
                        <thead>
                          <tr><th>Task</th><th>Type</th><th>Statut</th><th>Est.</th><th>Réel</th><th>Assigné</th></tr>
                        </thead>
                        <tbody>
                          {#each tasks as t}
                            <tr>
                              <td>{t.id}</td>
                              <td>{t.type}</td>
                              <td>{t.status}</td>
                              <td>{t.estimation_hours ?? '—'}</td>
                              <td>{t.actual_hours ?? '—'}</td>
                              <td>{t.assigned_to || '—'}</td>
                            </tr>
                          {/each}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                {/if}
              {/each}
            </tbody>
          </table>
        {/if}
      </section>

      {#if detail.review}
        <section class="md-section">
          <h2>Review</h2>
          <div class="markdown-body">{@html render(detail.review)}</div>
        </section>
      {/if}

      {#if detail.retro}
        <section class="md-section">
          <h2>Retro</h2>
          <div class="markdown-body">{@html render(detail.retro)}</div>
        </section>
      {/if}
    {/if}
  </div>
</div>

<style>
  .sprints-container {
    display: flex;
    height: 100%;
    overflow: hidden;
  }

  .sprints-sidebar {
    width: 240px;
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border);
    overflow-y: auto;
    padding: 12px 8px;
  }

  .sprint-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .sprint-item {
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    border-radius: var(--radius);
    padding: 8px 10px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 3px;
    color: var(--fg);
    transition: background 0.1s;
  }

  .sprint-item:hover {
    background: var(--border);
  }

  .sprint-item.active {
    background: var(--accent);
    color: var(--accent-fg);
  }

  .sprint-item:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }

  .sprint-id {
    font-weight: 600;
    font-size: 13px;
  }

  .sprint-meta {
    font-size: 11px;
    color: var(--fg-dim);
  }

  .sprint-item.active .sprint-meta {
    color: var(--accent-fg);
  }

  .badges {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .badge {
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 10px;
    background: var(--bg-elev);
    border: 1px solid var(--border);
    color: var(--fg-dim);
  }

  .badge.review {
    border-color: var(--accent);
    color: var(--accent);
  }

  .badge.retro {
    border-color: var(--success, #16a34a);
    color: var(--success, #16a34a);
  }

  .sprints-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: var(--bg);
  }

  .content-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }

  .content-header h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--fg);
  }

  .md-section {
    margin-bottom: 28px;
  }

  .md-section h2 {
    font-size: 16px;
    font-weight: 600;
    color: var(--fg);
    margin: 0 0 10px;
  }

  .stories-table,
  .tasks-table {
    border-collapse: collapse;
    width: 100%;
    font-size: 13px;
  }

  .stories-table th,
  .stories-table td,
  .tasks-table th,
  .tasks-table td {
    border: 1px solid var(--border);
    padding: 6px 10px;
    text-align: left;
  }

  .stories-table th,
  .tasks-table th {
    background: var(--bg-sidebar);
    font-weight: 600;
  }

  .tasks-row td {
    background: var(--bg-sidebar);
    padding: 6px;
  }

  .toggle {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--fg-dim);
    font-size: 10px;
  }

  .toggle:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .status {
    font-size: 11px;
    padding: 1px 6px;
    border-radius: 10px;
    background: var(--bg-elev);
    border: 1px solid var(--border);
  }

  .empty,
  .muted {
    color: var(--fg-dim);
    padding: 12px;
  }

  .error {
    color: var(--danger);
    padding: 12px;
  }

  .markdown-body {
    line-height: 1.7;
  }

  .markdown-body :global(h1) {
    font-size: 22px;
    margin: 16px 0 12px;
  }

  .markdown-body :global(h2) {
    font-size: 18px;
    margin: 14px 0 10px;
  }

  .markdown-body :global(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 0 0 12px;
  }

  .markdown-body :global(th),
  .markdown-body :global(td) {
    border: 1px solid var(--border);
    padding: 8px 12px;
    text-align: left;
  }

  .markdown-body :global(th) {
    background: var(--bg-sidebar);
    font-weight: 600;
  }

  .markdown-body :global(blockquote) {
    border-left: 3px solid var(--accent);
    padding-left: 12px;
    margin: 0 0 12px;
    color: var(--fg-dim);
    font-style: italic;
  }

  .markdown-body :global(code) {
    background: var(--bg-sidebar);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: var(--mono);
    font-size: 0.9em;
  }
</style>

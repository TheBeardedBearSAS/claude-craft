<script>
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';
  import { route, navigate } from '../lib/router.svelte.js';
  import { sortSprints } from '../lib/sprints.js';
  import { STATUS } from '../lib/config.js';

  let sprints = $state([]);
  let loadingList = $state(true);
  let listError = $state(null);

  let detail = $state(null);
  let loadingDetail = $state(false);
  let detailError = $state(null);

  const selectedId = $derived(route.parts[1] ?? null);

  /** État dérivé d'un sprint depuis sa progression en points. */
  function sprintState(s) {
    if (s.total_points > 0 && s.done_points >= s.total_points) return 'done';
    if (s.done_points > 0) return 'active';
    return 'planned';
  }
  const pct = (s) => (s.total_points ? Math.round((s.done_points / s.total_points) * 100) : 0);

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
    for (const t of detail?.tasks ?? []) (map[t.us_id] ??= []).push(t);
    return map;
  });

  // Métriques agrégées du sprint courant.
  const detailTotals = $derived.by(() => {
    const ss = detail?.stories ?? [];
    const total = ss.reduce((a, s) => a + (s.story_points || 0), 0);
    const done = ss.filter((s) => s.status === 'done').reduce((a, s) => a + (s.story_points || 0), 0);
    return { total, done, count: ss.length, pct: total ? Math.round((done / total) * 100) : 0 };
  });

  let expanded = $state(new Set());
  function toggleStory(id) {
    if (expanded.has(id)) expanded.delete(id);
    else expanded.add(id);
    expanded = new Set(expanded);
  }

  $effect(() => { loadList(); });
  $effect(() => { loadDetail(selectedId); });
</script>

<div class="view-pad">
  <div class="sprints-layout">
    <aside class="sprint-list" aria-label="Liste des sprints">
      {#if loadingList}
        <div class="empty">Chargement…</div>
      {:else if listError}
        <div class="empty">Erreur : {listError}</div>
      {:else if sprints.length === 0}
        <div class="empty">Aucun sprint</div>
      {:else}
        {#each sprints as s}
          {@const state = sprintState(s)}
          <button class="sprint-item" aria-current={selectedId === s.id} onclick={() => navigate(`/sprints/${s.id}`)}>
            <div class="si-top">
              <span class="si-name">{s.id}</span>
              <span class="si-state {state}">{state}</span>
            </div>
            <div class="si-stat">
              <span>{s.story_count} US</span>
              <span>{s.done_points}/{s.total_points} pts</span>
            </div>
            <div class="proj-bar" style="margin-top:9px"><span style="width: {pct(s)}%"></span></div>
            {#if s.has_goal || s.has_review || s.has_retro}
              <div class="si-tags">
                {#if s.has_goal}<span class="tag-mini">goal</span>{/if}
                {#if s.has_review}<span class="tag-mini">review</span>{/if}
                {#if s.has_retro}<span class="tag-mini">retro</span>{/if}
              </div>
            {/if}
          </button>
        {/each}
      {/if}
    </aside>

    <main class="sprint-detail" aria-label="Détail du sprint">
      {#if !selectedId}
        <div class="empty">Sélectionnez un sprint</div>
      {:else if loadingDetail}
        <div class="empty">Chargement…</div>
      {:else if detailError}
        <div class="empty">Erreur : {detailError}</div>
      {:else if detail}
        {@const state = sprintState({ total_points: detailTotals.total, done_points: detailTotals.done })}
        <div class="sd-head">
          <div style="flex:1">
            <div style="display:flex; align-items:center; gap:11px">
              <h2>{detail.sprint.name || detail.sprint.id}</h2>
              <span class="si-state {state}" style="font-size:11px">{state}</span>
            </div>
            <div class="sd-sub">
              <span class="mono">{detail.sprint.id}</span>
              {#if detail.sprint.epic}<span class="tag-mini">{detail.sprint.epic}</span>{/if}
              {#if detail.sprint.start_date}<span>{detail.sprint.start_date} → {detail.sprint.end_date || '…'}</span>
              {:else if detail.sprint.end_date}<span>clôturé le {detail.sprint.end_date}</span>{/if}
              {#if detail.sprint.points_delivered != null}<span>{detail.sprint.points_delivered} pts livrés</span>{/if}
            </div>
          </div>
        </div>

        <div class="sd-metrics">
          <div class="metric"><div class="mk">Points</div><div class="mv">{detailTotals.total}<small> pts</small></div></div>
          <div class="metric"><div class="mk">Complétés</div><div class="mv">{detailTotals.done}<small> pts</small></div><div class="msub">{detailTotals.pct}% du total</div></div>
          <div class="metric"><div class="mk">Stories</div><div class="mv">{detailTotals.count}</div></div>
        </div>

        {#if detail.goal}
          <div class="sd-panel">
            <h3>Goal</h3>
            <div class="md-body">{@html render(detail.goal)}</div>
          </div>
        {/if}

        <div class="sd-panel">
          <h3>Stories &amp; Tasks <span class="pill" style="background: var(--accent-soft); color: var(--accent)">{detail.stories.length}</span></h3>
          {#if detail.stories.length === 0}
            <p style="color: var(--fg-faint); font-size:13px">Aucune story dans ce sprint.</p>
          {:else}
            {#each detail.stories as st}
              {@const tasks = tasksByStory[st.id] ?? []}
              <div class="sd-story-wrap">
                <div class="sd-story">
                  {#if tasks.length}
                    <button class="toggle" aria-expanded={expanded.has(st.id)} aria-label="Afficher les tâches de {st.id}" onclick={() => toggleStory(st.id)}>{expanded.has(st.id) ? '▼' : '▶'}</button>
                  {:else}
                    <span class="toggle-spacer"></span>
                  {/if}
                  <span class="s-id mono">{st.id}</span>
                  <span class="s-t">{st.title}</span>
                  {#if st.assigned_to}<span class="s-assignee mono">{st.assigned_to}</span>{/if}
                  <span class="s-status">
                    <i style="width:8px;height:8px;border-radius:50%;background: var({STATUS[st.status]?.cssVar || '--fg-faint'});display:inline-block"></i>{STATUS[st.status]?.label || st.status}
                  </span>
                  <span class="points mono">{st.story_points ?? '—'}</span>
                </div>
                {#if expanded.has(st.id) && tasks.length}
                  <table class="tasks sprint-tasks">
                    <thead><tr><th>Task</th><th>Type</th><th>Statut</th><th style="text-align:right">Est</th><th style="text-align:right">Réel</th><th>Assigné</th></tr></thead>
                    <tbody>
                      {#each tasks as t}
                        <tr>
                          <td class="t-name mono">{t.id}</td>
                          <td>{t.type}</td>
                          <td>{t.status}</td>
                          <td class="t-hrs">{t.estimation_hours ?? '—'}</td>
                          <td class="t-hrs">{t.actual_hours ?? '—'}</td>
                          <td>{t.assigned_to || '—'}</td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                {/if}
              </div>
            {/each}
          {/if}
        </div>

        {#if detail.review}
          <div class="sd-panel">
            <h3>Review <span class="pill" style="background: var(--success-soft); color: var(--success)">review</span></h3>
            <div class="md-body review-md">{@html render(detail.review)}</div>
          </div>
        {/if}
        {#if detail.retro}
          <div class="sd-panel">
            <h3>Retro <span class="pill" style="background: var(--accent-soft); color: var(--accent)">team</span></h3>
            <div class="md-body review-md">{@html render(detail.retro)}</div>
          </div>
        {/if}
      {/if}
    </main>
  </div>
</div>

<style>
  .sd-sub {
    display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
    margin-top: 6px; font-size: 12px; color: var(--fg-faint);
  }
  .s-assignee {
    font-size: 11px; color: var(--fg-dim); padding: 1px 6px;
    background: var(--bg-inset); border-radius: 5px;
  }
  .si-tags { display: flex; gap: 5px; margin-top: 9px; }
  .tag-mini {
    font-family: var(--mono); font-size: 9.5px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.04em; padding: 2px 6px; border-radius: 5px;
    background: var(--bg-inset); color: var(--fg-faint);
  }
  .toggle {
    background: none; border: none; cursor: pointer; color: var(--fg-faint);
    font-size: 10px; width: 16px; flex: none;
  }
  .toggle:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .toggle-spacer { width: 16px; flex: none; }
  .sprint-tasks { margin: 4px 0 8px 28px; width: calc(100% - 28px); }
  .sd-story .points { margin-left: 0; }
</style>

<script>
  import { store, patchStatus } from '../lib/store.svelte.js';

  const COLUMNS = [
    { key: 'backlog', label: 'Backlog' },
    { key: 'ready-for-dev', label: 'Ready for Dev' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'review', label: 'Review' },
    { key: 'done', label: 'Done' },
    { key: 'blocked', label: 'Blocked' },
  ];

  const storiesByStatus = $derived.by(() => {
    const map = Object.fromEntries(COLUMNS.map((c) => [c.key, []]));
    for (const s of store.stories) (map[s.status] ??= []).push(s);
    return map;
  });

  function tddBadge(phase) {
    if (phase === 'red') return { char: '●', color: 'var(--danger)', label: 'red' };
    if (phase === 'green') return { char: '●', color: 'var(--ok)', label: 'green' };
    if (phase === 'refactor') return { char: '●', color: 'var(--info)', label: 'refactor' };
    if (phase === 'done') return { char: '✓', color: 'var(--ok)', label: 'done' };
    return null;
  }

  function priorityColor(p) {
    return p === 'must' ? 'var(--danger)' : p === 'should' ? 'var(--warn)' : p === 'could' ? 'var(--info)' : 'var(--fg-dim)';
  }

  let dragId = $state(null);

  function onDragStart(e, id) {
    dragId = id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }

  function onDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }

  async function onDrop(e, targetStatus) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || dragId;
    dragId = null;
    if (!id) return;
    const story = store.stories.find((s) => s.id === id);
    if (!story || story.status === targetStatus) return;
    const body = { status: targetStatus };
    if (targetStatus === 'blocked') {
      const reason = window.prompt('Blocked reason?');
      if (!reason) return;
      body.blocked_reason = reason;
    }
    try { await patchStatus(id, body); } catch { /* toast already shown */ }
  }
</script>

<div class="board">
  {#each COLUMNS as col}
    <section
      class="column"
      aria-label={col.label}
      ondragover={onDragOver}
      ondrop={(e) => onDrop(e, col.key)}
    >
      <header class="column-header">
        <span>{col.label}</span>
        <span class="count">{storiesByStatus[col.key].length}</span>
      </header>
      <div class="column-body">
        {#each storiesByStatus[col.key] as s (s.id)}
          {@const tdd = tddBadge(s.tdd_phase)}
          <article
            class="card"
            draggable="true"
            ondragstart={(e) => onDragStart(e, s.id)}
            aria-label="{s.id} {s.title}"
          >
            <header class="card-top">
              <span class="id">{s.id}</span>
              <span class="priority" style="color: {priorityColor(s.priority)}">{s.priority}</span>
              <span class="points">{s.story_points}p</span>
              {#if tdd}<span class="tdd" style="color: {tdd.color}" title="TDD: {tdd.label}">{tdd.char}</span>{/if}
            </header>
            <div class="title">{s.title}</div>
            <div class="meta">
              {#if s.epic_id}<span class="epic">{s.epic_id}</span>{/if}
              {#if s.persona}<span class="persona">{s.persona}</span>{/if}
            </div>
            {#if s.tasks?.total > 0}
              <div class="progress" aria-label="tasks progress">
                <div class="bar" style="width: {(s.tasks.completed / s.tasks.total) * 100}%"></div>
                <span class="progress-label">{s.tasks.completed}/{s.tasks.total}</span>
              </div>
            {/if}
            <footer class="card-foot">
              {#if s.assigned_to}
                <span class="assignee" title={s.assigned_to}>{s.assigned_to.slice(0, 2).toUpperCase()}</span>
              {/if}
              {#if s.status === 'blocked' && s.blocked_reason}
                <span class="blocked" title={s.blocked_reason}>⚠ blocked</span>
              {/if}
            </footer>
          </article>
        {/each}
      </div>
    </section>
  {/each}
</div>

<style>
  .board {
    display: flex;
    gap: 12px;
    min-height: 100%;
    overflow-x: auto;
  }
  .column {
    flex: 0 0 280px;
    background: var(--bg-sidebar);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    display: flex;
    flex-direction: column;
  }
  .column-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-dim);
    border-bottom: 1px solid var(--border);
  }
  .count {
    background: var(--bg-elev);
    border-radius: 10px;
    padding: 2px 8px;
    font-size: 11px;
  }
  .column-body {
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 120px;
  }
  .card {
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 10px;
    cursor: grab;
    box-shadow: var(--shadow);
  }
  .card:active { cursor: grabbing; }
  .card:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
  .card-top {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    margin-bottom: 4px;
  }
  .card-top .id {
    font-family: var(--mono);
    font-weight: 600;
  }
  .card-top .priority { text-transform: uppercase; font-weight: 600; }
  .card-top .points {
    margin-left: auto;
    font-family: var(--mono);
    color: var(--fg-dim);
  }
  .card-top .tdd { font-size: 14px; }
  .title { font-weight: 500; margin-bottom: 4px; }
  .meta {
    display: flex;
    gap: 6px;
    font-size: 11px;
    color: var(--fg-dim);
    font-family: var(--mono);
    margin-bottom: 6px;
  }
  .progress {
    position: relative;
    background: var(--bg-sidebar);
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 6px;
  }
  .bar { background: var(--accent); height: 100%; }
  .progress-label {
    position: absolute;
    right: 0;
    top: -14px;
    font-size: 10px;
    color: var(--fg-dim);
  }
  .card-foot {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
  }
  .assignee {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--accent);
    color: var(--accent-fg);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 600;
  }
  .blocked {
    color: var(--danger);
    font-weight: 600;
    margin-left: auto;
  }
</style>

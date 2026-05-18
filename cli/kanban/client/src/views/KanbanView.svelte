<script>
  import { store, patchStatus } from '../lib/store.svelte.js';
  import { onMount } from 'svelte';
  import PromptDialog from '../components/PromptDialog.svelte';

  let promptDialog = $state(null);

  const COLUMNS = [
    { key: 'backlog', label: 'Backlog' },
    { key: 'ready-for-dev', label: 'Ready for Dev' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'review', label: 'Review' },
    { key: 'done', label: 'Done' },
    { key: 'blocked', label: 'Blocked' },
  ];

  // Accessibility: keyboard navigation state
  let focusedCardIndex = $state(-1);
  let focusedColumnIndex = $state(0);
  let showMoveMenu = $state(false);
  let liveRegion = $state('');

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
      const reason = await promptDialog.prompt('Blocked reason?');
      if (!reason) return;
      body.blocked_reason = reason;
    }
    try {
      await patchStatus(id, body);
      announceMove(story.id, targetStatus);
    } catch { /* toast already shown */ }
  }

  // Accessibility: keyboard navigation
  onMount(() => {
    const enabled = import.meta.env.CC_A11Y_KANBAN !== '0';
    if (!enabled) return;

    function handleKeyboard(e) {
      // Arrow navigation between cards
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currentColumn = COLUMNS[focusedColumnIndex];
        const cards = storiesByStatus[currentColumn.key];
        if (cards.length === 0) return;

        if (e.key === 'ArrowDown') {
          focusedCardIndex = Math.min(focusedCardIndex + 1, cards.length - 1);
        } else {
          focusedCardIndex = Math.max(0, focusedCardIndex - 1);
        }
        focusCard(cards[focusedCardIndex]?.id);
      }

      // Arrow navigation between columns
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (e.key === 'ArrowRight') {
          focusedColumnIndex = Math.min(focusedColumnIndex + 1, COLUMNS.length - 1);
        } else {
          focusedColumnIndex = Math.max(0, focusedColumnIndex - 1);
        }
        focusedCardIndex = 0;
        const newColumn = COLUMNS[focusedColumnIndex];
        const cards = storiesByStatus[newColumn.key];
        if (cards.length > 0) {
          focusCard(cards[0].id);
        }
      }

      // Open move menu with Alt+M
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        const currentColumn = COLUMNS[focusedColumnIndex];
        const cards = storiesByStatus[currentColumn.key];
        if (focusedCardIndex >= 0 && cards[focusedCardIndex]) {
          showMoveMenu = !showMoveMenu;
        }
      }

      // Move card with number keys when menu is open
      if (showMoveMenu && /^[1-6]$/.test(e.key)) {
        e.preventDefault();
        const targetColumn = COLUMNS[parseInt(e.key) - 1];
        if (targetColumn) {
          const currentColumn = COLUMNS[focusedColumnIndex];
          const cards = storiesByStatus[currentColumn.key];
          const card = cards[focusedCardIndex];
          if (card) {
            moveCard(card, targetColumn.key);
          }
        }
      }

      // Close move menu with Escape
      if (e.key === 'Escape') {
        showMoveMenu = false;
      }

      // Enter to focus card details (could be extended)
      if (e.key === 'Enter' && !showMoveMenu) {
        const currentColumn = COLUMNS[focusedColumnIndex];
        const cards = storiesByStatus[currentColumn.key];
        const card = cards[focusedCardIndex];
        if (card) {
          announceCardDetails(card);
        }
      }
    }

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  });

  function focusCard(cardId) {
    if (!cardId) return;
    const el = document.querySelector(`[data-card-id="${cardId}"]`);
    if (el) el.focus();
  }

  async function moveCard(card, targetStatus) {
    const body = { status: targetStatus };
    if (targetStatus === 'blocked') {
      const reason = await promptDialog.prompt('Blocked reason?');
      if (!reason) {
        showMoveMenu = false;
        return;
      }
      body.blocked_reason = reason;
    }
    try {
      await patchStatus(card.id, body);
      showMoveMenu = false;
      announceMove(card.id, targetStatus);
    } catch {
      showMoveMenu = false;
    }
  }

  function announceMove(cardId, targetStatus) {
    const targetCol = COLUMNS.find(c => c.key === targetStatus);
    liveRegion = `Card ${cardId} moved to ${targetCol?.label || targetStatus}`;
    setTimeout(() => liveRegion = '', 2000);
  }

  function announceCardDetails(card) {
    liveRegion = `Card ${card.id}: ${card.title}. Status: ${card.status}. Priority: ${card.priority}. ${card.story_points} story points.`;
    setTimeout(() => liveRegion = '', 3000);
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
            data-card-id={s.id}
            tabindex="0"
            role="button"
            aria-describedby="keyboard-help"
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

<PromptDialog bind:this={promptDialog} />

<!-- Accessibility: keyboard help & live region -->
<div id="keyboard-help" class="sr-only">
  Use arrow keys to navigate. Alt+M to open move menu. Numbers 1-6 to move to column. Escape to close menu. Enter for details.
</div>

<div aria-live="polite" aria-atomic="true" class="sr-only">
  {liveRegion}
</div>

{#if showMoveMenu}
  <div class="move-menu" role="dialog" aria-label="Move card to column">
    <div class="move-menu-content">
      <h3>Move card to:</h3>
      {#each COLUMNS as col, idx}
        <button onclick={() => {
          const currentColumn = COLUMNS[focusedColumnIndex];
          const cards = storiesByStatus[currentColumn.key];
          const card = cards[focusedCardIndex];
          if (card) moveCard(card, col.key);
        }}>
          {idx + 1}. {col.label}
        </button>
      {/each}
      <button onclick={() => showMoveMenu = false}>Cancel (Esc)</button>
    </div>
  </div>
{/if}

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

  /* Accessibility: screen reader only */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Accessibility: move menu */
  .move-menu {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .move-menu-content {
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    min-width: 300px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .move-menu-content h3 {
    margin: 0 0 12px;
    font-size: 16px;
  }

  .move-menu-content button {
    display: block;
    width: 100%;
    padding: 10px;
    margin: 4px 0;
    background: var(--bg-sidebar);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--fg);
    cursor: pointer;
    text-align: left;
    font-size: 14px;
  }

  .move-menu-content button:hover,
  .move-menu-content button:focus {
    background: var(--accent);
    color: var(--accent-fg);
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }

  /* Focus visible styles */
  .card:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
</style>

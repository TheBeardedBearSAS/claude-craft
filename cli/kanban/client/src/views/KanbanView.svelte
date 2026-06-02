<script>
  import { store, patchStatus } from '../lib/store.svelte.js';
  import { onMount } from 'svelte';
  import PromptDialog from '../components/PromptDialog.svelte';

  let promptDialog = $state(null);
  /** Référence au <dialog> natif du menu de déplacement */
  let moveMenuDialog = $state(null);
  /** Élément de carte ayant déclenché l'ouverture du menu (pour retour de focus) */
  let moveMenuTriggerEl = $state(null);

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
      // Guard : n'agir que si le focus est dans le board ou le menu ouvert
      const inBoard = document.activeElement?.closest('.board');
      const menuOpen = showMoveMenu;
      if (!inBoard && !menuOpen) return;

      // Navigation verticale entre cartes
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

      // Ouvrir le menu de déplacement avec Alt+M
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        const currentColumn = COLUMNS[focusedColumnIndex];
        const cards = storiesByStatus[currentColumn.key];
        if (focusedCardIndex >= 0 && cards[focusedCardIndex]) {
          if (showMoveMenu) {
            closeMoveMenu();
          } else {
            openMoveMenu();
          }
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

      // Fermer le menu de déplacement avec Escape
      if (e.key === 'Escape' && showMoveMenu) {
        closeMoveMenu();
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
        closeMoveMenu();
        return;
      }
      body.blocked_reason = reason;
    }
    try {
      await patchStatus(card.id, body);
      closeMoveMenu();
      announceMove(card.id, targetStatus);
    } catch {
      closeMoveMenu();
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

  /** Ouvre le menu de déplacement via l'élément <dialog> natif. */
  function openMoveMenu() {
    // Mémorise l'élément déclencheur pour y retourner le focus à la fermeture
    moveMenuTriggerEl = document.activeElement;
    showMoveMenu = true;
    // Attend le prochain tick Svelte pour que le dialog soit dans le DOM
    Promise.resolve().then(() => moveMenuDialog?.showModal());
  }

  /** Ferme le menu de déplacement et retourne le focus à la carte source. */
  function closeMoveMenu() {
    showMoveMenu = false;
    moveMenuDialog?.close();
    // Retour de focus à la carte ayant déclenché l'ouverture (WCAG SC 2.4.3)
    if (moveMenuTriggerEl) {
      moveMenuTriggerEl.focus();
      moveMenuTriggerEl = null;
    }
  }
</script>

<div class="board">
  {#each COLUMNS as col}
    <section
      class="column"
      aria-labelledby="col-{col.key}"
      ondragover={onDragOver}
      ondrop={(e) => onDrop(e, col.key)}
    >
      <header class="column-header">
        <!-- h2 pour une navigation par titres (touche H dans NVDA/JAWS) -->
        <h2 class="column-label" id="col-{col.key}">{col.label}</h2>
        <span class="count" aria-label="{storiesByStatus[col.key].length} cartes">{storiesByStatus[col.key].length}</span>
      </header>
      <!-- ul/li remplace article role=button (conflit sémantique) -->
      <ul class="column-body" role="list">
        {#each storiesByStatus[col.key] as s (s.id)}
          {@const tdd = tddBadge(s.tdd_phase)}
          <li
            class="card"
            draggable="true"
            ondragstart={(e) => onDragStart(e, s.id)}
            aria-label="{s.id} {s.title}"
            data-card-id={s.id}
            tabindex="0"
            role="listitem"
            aria-describedby="keyboard-help"
          >
            <div class="card-top">
              <span class="id">{s.id}</span>
              <span class="priority" style="color: {priorityColor(s.priority)}">{s.priority}</span>
              <span class="points">{s.story_points}p</span>
              {#if tdd}
                <!-- aria-label remplace title (title non annoncé par NVDA/VoiceOver) -->
                <span class="tdd" style="color: {tdd.color}" aria-label="TDD phase : {tdd.label}" role="img">{tdd.char}</span>
              {/if}
            </div>
            <div class="title">{s.title}</div>
            <div class="meta">
              {#if s.epic_id}<span class="epic">{s.epic_id}</span>{/if}
              {#if s.persona}<span class="persona">{s.persona}</span>{/if}
            </div>
            {#if s.tasks?.total > 0}
              <!-- role=progressbar + aria-valuenow/min/max (WCAG SC 4.1.2) -->
              <div
                class="progress"
                role="progressbar"
                aria-label="Tâches : {s.tasks.completed} sur {s.tasks.total} complétées"
                aria-valuenow={s.tasks.completed}
                aria-valuemin={0}
                aria-valuemax={s.tasks.total}
              >
                <div class="bar" style="width: {(s.tasks.completed / s.tasks.total) * 100}%"></div>
                <span class="progress-label" aria-hidden="true">{s.tasks.completed}/{s.tasks.total}</span>
              </div>
            {/if}
            <footer class="card-foot">
              {#if s.assigned_to}
                <!-- aria-label expose le nom complet (WCAG SC 1.3.1, SC 4.1.2) -->
                <span class="assignee" aria-label="Assigné à : {s.assigned_to}">{s.assigned_to.slice(0, 2).toUpperCase()}</span>
              {/if}
              {#if s.status === 'blocked' && s.blocked_reason}
                <span class="blocked" aria-label="Bloqué : {s.blocked_reason}">⚠ blocked</span>
              {/if}
            </footer>
          </li>
        {/each}
      </ul>
    </section>
  {/each}
</div>

<PromptDialog bind:this={promptDialog} />

<!-- Aide clavier : sr-only pour les lecteurs d'écran, accessible au clavier -->
<div id="keyboard-help" class="sr-only">
  Flèches pour naviguer. Alt+M pour ouvrir le menu de déplacement. Chiffres 1 à 6 pour déplacer dans une colonne. Échap pour fermer. Entrée pour les détails.
</div>

<!-- Région live pour les annonces d'accessibilité -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {liveRegion}
</div>

<!-- Aide clavier visible pour les utilisateurs voyants au clavier (WCAG SC 3.3.2) -->
<details class="keyboard-help-visible">
  <summary aria-label="Raccourcis clavier du tableau Kanban">⌨ Raccourcis</summary>
  <div class="keyboard-help-content">
    <kbd>↑↓</kbd> Naviguer les cartes &ensp;
    <kbd>←→</kbd> Changer de colonne &ensp;
    <kbd>Alt+M</kbd> Menu déplacement &ensp;
    <kbd>1–6</kbd> Déplacer vers colonne &ensp;
    <kbd>Échap</kbd> Fermer &ensp;
    <kbd>Entrée</kbd> Détails
  </div>
</details>

<!--
  Menu de déplacement : élément <dialog> natif pour :
  - Piège de focus automatique (Tab/Shift+Tab confinés au dialog)
  - aria-modal géré nativement par le navigateur
  - Retour de focus géré dans closeMoveMenu()
  (WCAG SC 1.3.2, 2.1.2, 4.1.2)
-->
{#if showMoveMenu}
  <dialog
    bind:this={moveMenuDialog}
    class="move-menu-dialog"
    aria-labelledby="move-menu-title"
    onclose={() => { if (showMoveMenu) closeMoveMenu(); }}
  >
    <div class="move-menu-content">
      <h3 id="move-menu-title">Déplacer la carte vers :</h3>
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
      <button onclick={() => closeMoveMenu()}>Annuler (Échap)</button>
    </div>
  </dialog>
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
    border-bottom: 1px solid var(--border);
  }
  /* h2 en colonne : reset pour conserver le style visuel précédent */
  .column-label {
    margin: 0;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--fg-dim);
  }
  .count {
    background: var(--bg-elev);
    border-radius: 10px;
    padding: 2px 8px;
    font-size: 11px;
  }
  /* ul reset (remplace la div column-body) */
  .column-body {
    list-style: none;
    margin: 0;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 120px;
  }
  /* li reset — même apparence que l'ancien article */
  .card {
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 10px;
    cursor: grab;
    box-shadow: var(--shadow);
  }
  .card:active { cursor: grabbing; }
  /* Focus visible explicite (WCAG 2.2 SC 2.4.11) */
  .card:focus,
  .card:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
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

  /* Accessible uniquement aux lecteurs d'écran */
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

  /* Aide clavier visible pour les utilisateurs voyants au clavier (WCAG SC 3.3.2) */
  .keyboard-help-visible {
    position: fixed;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 11px;
    color: var(--fg-dim);
    box-shadow: var(--shadow);
  }
  .keyboard-help-visible summary {
    padding: 4px 10px;
    cursor: pointer;
    user-select: none;
    list-style: none;
  }
  .keyboard-help-visible summary:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .keyboard-help-content {
    padding: 6px 10px 8px;
    white-space: nowrap;
  }
  kbd {
    display: inline-block;
    padding: 1px 4px;
    font-size: 10px;
    font-family: var(--mono);
    background: var(--bg-sidebar);
    border: 1px solid var(--border);
    border-radius: 3px;
  }

  /* Dialog natif pour le menu de déplacement (piège de focus automatique) */
  .move-menu-dialog {
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0;
    min-width: 300px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    color: var(--fg);
  }
  .move-menu-dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }

  .move-menu-content {
    padding: 20px;
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
  .move-menu-content button:focus-visible {
    background: var(--accent);
    color: var(--accent-fg);
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
</style>

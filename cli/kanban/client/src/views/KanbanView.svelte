<script>
  import { store, patchStatus, toast } from '../lib/store.svelte.js';
  import { onMount, tick } from 'svelte';
  import PromptDialog from '../components/PromptDialog.svelte';
  import { locateCard, reduceKey, buildCardDetails } from '../lib/kanban-nav.js';

  let promptDialog = $state(null);
  /** Référence au <dialog> natif du menu de déplacement */
  let moveMenuDialog = $state(null);
  /** Élément de carte ayant déclenché l'ouverture du menu (pour retour de focus) */
  let moveMenuTriggerEl = $state(null);
  /** Référence au <dialog> natif de la modale de détail */
  let detailDialog = $state(null);
  /** Carte actuellement affichée dans la modale de détail */
  let detailCard = $state(null);
  /** Élément ayant déclenché l'ouverture de la modale (pour retour de focus) */
  let detailTriggerEl = $state(null);

  const COLUMNS = [
    { key: 'backlog', label: 'Backlog', emptyHint: 'No stories — run /workflow:plan' },
    { key: 'ready-for-dev', label: 'Ready for Dev', emptyHint: 'No stories ready — run /workflow:start' },
    { key: 'in-progress', label: 'In Progress', emptyHint: 'Nothing in progress' },
    { key: 'review', label: 'Review', emptyHint: 'Nothing to review' },
    { key: 'done', label: 'Done', emptyHint: 'Nothing done yet' },
    { key: 'blocked', label: 'Blocked', emptyHint: '' },
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
    if (story._writable === false) { announceReadOnly(story.id); return; }
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

    const HANDLED = new Set(['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Escape', 'Enter']);

    function handleKeyboard(e) {
      // Guard : n'agir que si le focus est dans le board ou le menu ouvert
      const inBoard = document.activeElement?.closest('.board');
      if (!inBoard && !showMoveMenu) return;

      const ctx = { columns: COLUMNS, storiesByStatus };
      const { state, action } = reduceKey(
        { focusedColumnIndex, focusedCardIndex, showMoveMenu },
        { key: e.key, altKey: e.altKey },
        ctx
      );

      // Empêche le scroll/typeahead du navigateur uniquement pour les touches gérées.
      if (HANDLED.has(e.key) || (e.altKey && e.key === 'm') || (showMoveMenu && /^[1-6]$/.test(e.key))) {
        e.preventDefault();
      }

      // Applique le nouvel état de navigation
      focusedColumnIndex = state.focusedColumnIndex;
      focusedCardIndex = state.focusedCardIndex;
      showMoveMenu = state.showMoveMenu;

      if (!action) return;
      switch (action.type) {
        case 'focus':
          focusCard(action.cardId);
          break;
        case 'open-menu':
          openMoveMenu();
          break;
        case 'close-menu':
          closeMoveMenu();
          break;
        case 'move': {
          const card = store.stories.find((s) => s.id === action.cardId);
          if (card) moveCard(card, action.targetStatus);
          break;
        }
        case 'readonly':
          announceReadOnly(action.cardId);
          closeMoveMenu();
          break;
        case 'details':
          openDetail(action.card);
          break;
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

  /** Synchronise l'état de navigation clavier avec la carte réellement focus (souris/Tab). */
  function syncFocus(cardId) {
    const pos = locateCard(storiesByStatus, COLUMNS, cardId);
    if (pos) {
      focusedColumnIndex = pos.columnIndex;
      focusedCardIndex = pos.cardIndex;
    }
  }

  async function moveCard(card, targetStatus) {
    if (card._writable === false) {
      announceReadOnly(card.id);
      closeMoveMenu();
      return;
    }
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

  /** Story issue de .bmad/sprint-status.yaml : statut non modifiable depuis le board. */
  function announceReadOnly(cardId) {
    liveRegion = `Card ${cardId} is read-only (managed by .bmad/sprint-status.yaml — use team:/qa: commands)`;
    setTimeout(() => liveRegion = '', 3000);
    // Feedback VISIBLE pour les utilisateurs voyants (au-delà de l'annonce sr-only).
    toast({
      kind: 'info',
      message: `${cardId} en lecture seule — gérée par .bmad/sprint-status.yaml (commandes team:/qa:)`,
      ttl: 5000,
    });
  }

  function announceCardDetails(card) {
    liveRegion = `Card ${card.id}: ${card.title}. Status: ${card.status}. Priority: ${card.priority}. ${card.story_points} story points.`;
    setTimeout(() => liveRegion = '', 3000);
  }

  /** Ouvre le menu de déplacement via l'élément <dialog> natif. */
  async function openMoveMenu() {
    // Mémorise l'élément déclencheur pour y retourner le focus à la fermeture
    moveMenuTriggerEl = document.activeElement;
    showMoveMenu = true;
    // Attend que Svelte ait rendu le dialog (bind:this résolu) avant showModal()
    await tick();
    moveMenuDialog?.showModal();
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

  /** Détails normalisés de la carte affichée (null si modale fermée). */
  const detailFields = $derived(detailCard ? buildCardDetails(detailCard) : null);

  /** Ouvre la modale de détail (clic ou Entrée). */
  async function openDetail(card) {
    detailTriggerEl = document.activeElement;
    detailCard = card;
    announceCardDetails(card); // annonce sr-only en plus du visuel
    await tick();
    detailDialog?.showModal();
  }

  /** Ferme la modale de détail et retourne le focus à la carte source. */
  function closeDetail() {
    detailCard = null;
    detailDialog?.close();
    if (detailTriggerEl) {
      detailTriggerEl.focus();
      detailTriggerEl = null;
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
          <!-- Enter (détails) est géré par le handler clavier global du board ; onclick couvre la souris. -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <li
            class="card"
            class:read-only={s._writable === false}
            draggable={s._writable !== false}
            ondragstart={(e) => onDragStart(e, s.id)}
            onfocus={() => syncFocus(s.id)}
            onclick={() => openDetail(s)}
            aria-label="{s.id} {s.title}{s._writable === false ? ' (lecture seule)' : ''}"
            data-card-id={s.id}
            tabindex="0"
            role="listitem"
            aria-describedby="keyboard-help"
          >
            <div class="card-top">
              <span class="id">{s.id}</span>
              {#if s._writable === false}
                <span class="readonly" aria-label="Lecture seule — gérée par .bmad/sprint-status.yaml" role="img">🔒</span>
              {/if}
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
        {:else}
          {#if col.emptyHint}
            <li class="empty-hint" aria-label="Colonne vide" role="listitem">{col.emptyHint}</li>
          {/if}
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

<!--
  Modale de détail de carte : <dialog> natif (piège de focus + aria-modal natifs).
  Ouverte au clic ou via Entrée (WCAG SC 1.3.2, 2.1.2, 2.4.3).
-->
{#if detailFields}
  <dialog
    bind:this={detailDialog}
    class="detail-dialog"
    aria-labelledby="detail-title"
    onclose={() => { if (detailCard) closeDetail(); }}
  >
    <div class="detail-content">
      <header class="detail-header">
        <span class="detail-id">{detailFields.id}</span>
        {#if detailFields.readOnly}
          <span class="detail-lock" aria-label="Lecture seule" role="img">🔒</span>
        {/if}
        <button class="detail-close" onclick={() => closeDetail()} aria-label="Fermer">✕</button>
      </header>
      <h3 id="detail-title">{detailFields.title}</h3>

      <dl class="detail-grid">
        <dt>Statut</dt><dd>{detailFields.status}</dd>
        <dt>Priorité</dt><dd>{detailFields.priority || '—'}</dd>
        <dt>Points</dt><dd>{detailFields.storyPoints}</dd>
        {#if detailFields.epicId}<dt>Epic</dt><dd>{detailFields.epicId}</dd>{/if}
        {#if detailFields.persona}<dt>Persona</dt><dd>{detailFields.persona}</dd>{/if}
        {#if detailFields.assignedTo}<dt>Assigné à</dt><dd>{detailFields.assignedTo}</dd>{/if}
        {#if detailFields.tddPhase}<dt>TDD</dt><dd>{detailFields.tddPhase}</dd>{/if}
        {#if detailFields.tasks.total > 0}
          <dt>Tâches</dt><dd>{detailFields.tasks.completed}/{detailFields.tasks.total}</dd>
        {/if}
        {#if detailFields.blockedReason}<dt>Bloqué</dt><dd>{detailFields.blockedReason}</dd>{/if}
      </dl>

      {#if detailFields.readOnly}
        <p class="detail-readonly-note">
          Carte en lecture seule — gérée par <code>.bmad/sprint-status.yaml</code> (BMAD v6 single-writer).
          Changez son statut via les commandes <code>team:</code> / <code>qa:</code>.
        </p>
      {/if}
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
  /* Message discret affiché quand la colonne est vide (DX-10) */
  .empty-hint {
    padding: 10px 8px;
    font-size: 11px;
    color: var(--fg-dim);
    font-style: italic;
    text-align: center;
    list-style: none;
    opacity: 0.7;
  }
  /* Story issue de .bmad/sprint-status.yaml : non déplaçable depuis le board */
  .card.read-only { cursor: default; opacity: 0.85; }
  .card.read-only:active { cursor: default; }
  .card-top .readonly { font-size: 12px; }
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

  /* Modale de détail de carte */
  .detail-dialog {
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0;
    min-width: 340px;
    max-width: 480px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    color: var(--fg);
  }
  .detail-dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }
  .detail-content {
    padding: 20px;
  }
  .detail-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  .detail-id {
    font-family: var(--mono);
    font-weight: 600;
    font-size: 13px;
    color: var(--accent);
  }
  .detail-lock {
    font-size: 13px;
  }
  .detail-close {
    margin-left: auto;
    background: transparent;
    border: none;
    color: var(--fg-dim);
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    padding: 4px;
    border-radius: 4px;
  }
  .detail-close:hover,
  .detail-close:focus-visible {
    background: var(--bg-sidebar);
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
  .detail-content h3 {
    margin: 0 0 14px;
    font-size: 16px;
  }
  .detail-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6px 14px;
    margin: 0;
    font-size: 13px;
  }
  .detail-grid dt {
    color: var(--fg-dim);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    align-self: center;
  }
  .detail-grid dd {
    margin: 0;
  }
  .detail-readonly-note {
    margin: 14px 0 0;
    padding: 10px 12px;
    background: var(--bg-sidebar);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 12px;
    color: var(--fg-dim);
    line-height: 1.5;
  }
  .detail-readonly-note code {
    font-family: var(--mono);
    font-size: 11px;
  }
</style>

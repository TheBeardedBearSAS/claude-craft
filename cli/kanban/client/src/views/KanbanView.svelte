<script>
  import { store, patchStatus, toast } from '../lib/store.svelte.js';
  import { onMount, tick } from 'svelte';
  import PromptDialog from '../components/PromptDialog.svelte';
  import Icon from '../components/Icon.svelte';
  import Avatar from '../components/Avatar.svelte';
  import PriorityChip from '../components/PriorityChip.svelte';
  import TddPip from '../components/TddPip.svelte';
  import Points from '../components/Points.svelte';
  import TaskProgress from '../components/TaskProgress.svelte';
  import { locateCard, reduceKey } from '../lib/kanban-nav.js';
  import { STATUS, PRIORITY, codeColor, epicHue } from '../lib/config.js';
  import { tweaks } from '../lib/tweaks.svelte.js';
  import { openDetail as openDetailStore } from '../lib/detail.svelte.js';

  let promptDialog = $state(null);
  /** Référence au <dialog> natif du menu de déplacement */
  let moveMenuDialog = $state(null);
  /** Élément de carte ayant déclenché l'ouverture du menu (pour retour de focus) */
  let moveMenuTriggerEl = $state(null);
  // La modale de détail est désormais un composant partagé (<StoryDetail>, monté
  // dans App) piloté par le store lib/detail.svelte.js — réutilisée par le Backlog.

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

  // Board UI state
  let dragId = $state(null);
  let dragOverCol = $state(null);
  /** Filtre de priorité (vide = tout afficher). */
  let priFilter = $state([]);

  function togglePri(p) {
    priFilter = priFilter.includes(p) ? priFilter.filter((x) => x !== p) : [...priFilter, p];
  }
  const visible = (s) => priFilter.length === 0 || priFilter.includes(s.priority);

  // The board shows the ACTIVE sprint only. store.stories now also carries the
  // history of closed sprints (read-only) ; without this scope the Done column
  // would be flooded with dozens of archived stories and the metrics would be
  // incoherent with the Burndown/topbar (sprint-scoped).
  const activeSprintId = $derived(store.sprint?.sprint_id ?? null);
  const boardStories = $derived(
    activeSprintId ? store.stories.filter((s) => s.sprint_id === activeSprintId) : store.stories,
  );

  const storiesByStatus = $derived.by(() => {
    const map = Object.fromEntries(COLUMNS.map((c) => [c.key, []]));
    for (const s of boardStories) {
      if (!visible(s)) continue;
      (map[s.status] ??= []).push(s);
    }
    return map;
  });

  const colPoints = (key) => storiesByStatus[key].reduce((a, s) => a + (s.story_points || 0), 0);

  /** Légende du code couleur selon le schéma actif. */
  const schemeLegend = $derived.by(() => {
    const sc = tweaks.codingScheme;
    if (sc === 'priority') return Object.values(PRIORITY).map((v) => [v.label, `var(${v.cssVar})`]);
    if (sc === 'tdd') return [['Red', 'var(--tdd-red)'], ['Green', 'var(--tdd-green)'], ['Refactor', 'var(--tdd-refactor)']];
    if (sc === 'epic') {
      const seen = new Map();
      for (const s of boardStories) if (s.epic_id && !seen.has(s.epic_id)) seen.set(s.epic_id, epicHue(s.epic_id));
      return [...seen.entries()];
    }
    return COLUMNS.map((c) => [c.label, `var(${STATUS[c.key].cssVar})`]);
  });

  function onDragStart(e, id) {
    dragId = id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }

  function onDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }

  async function onDrop(e, targetStatus) {
    e.preventDefault();
    dragOverCol = null;
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
        ctx,
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
    const targetCol = COLUMNS.find((c) => c.key === targetStatus);
    liveRegion = `Card ${cardId} moved to ${targetCol?.label || targetStatus}`;
    setTimeout(() => (liveRegion = ''), 2000);
  }

  /** Story issue de .bmad/sprint-status.yaml : statut non modifiable depuis le board. */
  function announceReadOnly(cardId) {
    liveRegion = `Card ${cardId} is read-only (managed by .bmad/sprint-status.yaml — use team:/qa: commands)`;
    setTimeout(() => (liveRegion = ''), 3000);
    // Feedback VISIBLE pour les utilisateurs voyants (au-delà de l'annonce sr-only).
    toast({
      kind: 'info',
      message: `${cardId} en lecture seule — gérée par .bmad/sprint-status.yaml (commandes team:/qa:)`,
      ttl: 5000,
    });
  }

  function announceCardDetails(card) {
    liveRegion = `Card ${card.id}: ${card.title}. Status: ${card.status}. Priority: ${card.priority}. ${card.story_points} story points.`;
    setTimeout(() => (liveRegion = ''), 3000);
  }

  /** Ouvre le menu de déplacement via l'élément <dialog> natif. */
  async function openMoveMenu() {
    moveMenuTriggerEl = document.activeElement;
    showMoveMenu = true;
    await tick();
    moveMenuDialog?.showModal();
  }

  /** Ferme le menu de déplacement et retourne le focus à la carte source. */
  function closeMoveMenu() {
    showMoveMenu = false;
    moveMenuDialog?.close();
    if (moveMenuTriggerEl) {
      moveMenuTriggerEl.focus();
      moveMenuTriggerEl = null;
    }
  }

  /** Ouvre la modale de détail partagée (clic ou Entrée) + annonce sr-only. */
  function openDetail(card) {
    announceCardDetails(card);
    openDetailStore(card);
  }
</script>

<div class="board-toolbar">
  <div class="filters">
    {#each Object.entries(PRIORITY) as [key, v]}
      <button class="filter-chip" aria-pressed={priFilter.includes(key)} onclick={() => togglePri(key)}>
        <i class="dot" style="background: var({v.cssVar})"></i>{v.label}
      </button>
    {/each}
    {#if priFilter.length > 0}
      <button class="filter-chip" style="border:none" onclick={() => (priFilter = [])}>Clear</button>
    {/if}
  </div>
  <span class="topbar-spacer"></span>
  <div class="coding-legend" aria-label={`Cartes colorées par ${tweaks.codingScheme}`}>
    <span class="lbl">Codé par {tweaks.codingScheme} :</span>
    {#each schemeLegend as [label, color]}
      <span class="key"><i style="background: {color}"></i>{label}</span>
    {/each}
  </div>
</div>

<div class="board">
  {#each COLUMNS as col}
    {@const cv = `var(${STATUS[col.key].cssVar})`}
    <section
      class="column"
      class:drop-target={dragOverCol === col.key}
      aria-labelledby="col-{col.key}"
      ondragover={(e) => { onDragOver(e); if (dragId) dragOverCol = col.key; }}
      ondragleave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) dragOverCol = null; }}
      ondrop={(e) => onDrop(e, col.key)}
    >
      <header class="col-head">
        <i class="col-dot" style="background: {cv}; color: {cv}"></i>
        <h2 class="col-title" id="col-{col.key}">{col.label}</h2>
        <span class="col-count mono" aria-label="{storiesByStatus[col.key].length} cartes">{storiesByStatus[col.key].length}</span>
        <span class="col-pts mono" title="story points dans la colonne">{colPoints(col.key)} pts</span>
      </header>
      <ul class="col-body" role="list">
        {#each storiesByStatus[col.key] as s (s.id)}
          <!-- Enter (détails) est géré par le handler clavier global du board ; onclick couvre la souris. -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <li
            class="card"
            class:read-only={s._writable === false}
            class:dragging={dragId === s.id}
            style="--code-color: {codeColor(s, tweaks.codingScheme)}"
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
              {#if s.epic_id}<i class="card-epic-dot" style="background: {epicHue(s.epic_id)}" title={s.epic_id}></i>{/if}
              <span class="card-id mono">{s.id}</span>
              {#if s._writable === false}
                <span class="card-lock" aria-label="Lecture seule — gérée par .bmad/sprint-status.yaml" role="img">🔒</span>
              {/if}
              <span class="spacer"></span>
              <TddPip phase={s.tdd_phase} />
              <PriorityChip priority={s.priority} />
            </div>
            <h3 class="card-title">{s.title}</h3>
            <div class="card-meta">
              <Points value={s.story_points} />
              {#if s.persona}<span class="persona"><Icon name="person" cls="ico" size={13} />{s.persona}</span>{/if}
              <span class="spacer"></span>
              {#if s.status === 'blocked' && s.blocked_reason}
                <span class="card-blocked" title={s.blocked_reason}>⚠ blocked</span>
              {/if}
              <TaskProgress tasks={s.tasks} status={s.status} />
              <Avatar id={s.assigned_to} size={24} />
            </div>
          </li>
        {:else}
          {#if col.emptyHint}
            <li class="col-empty" role="listitem">{col.emptyHint}</li>
          {/if}
        {/each}
      </ul>
    </section>
  {/each}
</div>

<PromptDialog bind:this={promptDialog} />

<!-- Aide clavier : sr-only pour les lecteurs d'écran -->
<div id="keyboard-help" class="sr-only">
  Flèches pour naviguer. Alt+M pour ouvrir le menu de déplacement. Chiffres 1 à 6 pour déplacer dans une colonne. Échap pour fermer. Entrée pour les détails.
</div>

<!-- Région live pour les annonces d'accessibilité -->
<div aria-live="polite" aria-atomic="true" class="sr-only">{liveRegion}</div>

<!-- Aide clavier visible pour les utilisateurs voyants au clavier (WCAG SC 3.3.2) -->
<details class="keyboard-help-visible">
  <summary aria-label="Raccourcis clavier du tableau Kanban">⌨ Raccourcis</summary>
  <div class="keyboard-help-content">
    <kbd>↑↓</kbd> Naviguer &ensp;<kbd>←→</kbd> Colonne &ensp;<kbd>Alt+M</kbd> Déplacer &ensp;<kbd>1–6</kbd> Vers colonne &ensp;<kbd>Échap</kbd> Fermer &ensp;<kbd>Entrée</kbd> Détails
  </div>
</details>

<!-- Menu de déplacement : <dialog> natif (piège de focus + aria-modal natifs) -->
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
  /* Menu de déplacement — spécifique au board (hors design system global) */
  .move-menu-dialog {
    /* margin:auto : recentre le <dialog> que le reset global `* { margin:0 }`
       décalerait en haut-gauche (cf. bug #2). */
    margin: auto;
    background: var(--bg-elev); border: 1px solid var(--border-strong);
    border-radius: var(--radius-lg); padding: 0; min-width: 300px;
    box-shadow: var(--shadow-lg); color: var(--fg);
  }
  .move-menu-dialog::backdrop { background: oklch(0.1 0.01 264 / 0.6); backdrop-filter: blur(3px); }
  .move-menu-content { padding: 20px; }
  .move-menu-content h3 { margin: 0 0 12px; font-size: 15px; font-weight: 600; }
  .move-menu-content button {
    display: block; width: 100%; padding: 10px 12px; margin: 4px 0;
    background: var(--bg-inset); border: 1px solid var(--border-faint);
    border-radius: var(--radius-sm); color: var(--fg); cursor: pointer;
    text-align: left; font-size: 13px;
  }
  .move-menu-content button:hover,
  .move-menu-content button:focus-visible {
    background: var(--accent-soft); border-color: var(--accent-ring);
  }
</style>

<script>
  import { onDestroy, tick, untrack } from 'svelte';
  import { store } from '../lib/store.svelte.js';
  import { route, setQuery } from '../lib/router.svelte.js';
  import { health } from '../lib/health.svelte.js';
  import { tweaks } from '../lib/tweaks.svelte.js';
  import { t, tn } from '../lib/i18n/index.svelte.js';
  import { createAnnouncer } from '../lib/announce.js';
  import { locateCard, reduceKey } from '../lib/board-nav.js';
  import { moveTargets, describeCard, countChanged } from '../lib/board-card.js';
  import { filtersFromQuery } from '../lib/query.js';
  import { matchStory, sortStories } from '../lib/filter.js';
  import { sumPoints } from '../lib/points.js';
  import { wipState } from '../lib/wip.js';
  import { moveStory, openCreate, askBlockedReason } from '../lib/story-actions.svelte.js';
  import { STATUSES } from '../../../shared/transitions.js';
  import { STATUS, PRIORITY, TDD, codeColor, epicHue } from '../lib/config.js';
  import MoveMenu from '../components/MoveMenu.svelte';
  import KeyboardShortcuts from '../components/KeyboardShortcuts.svelte';
  import FilterBar from '../components/FilterBar.svelte';
  import Icon from '../components/Icon.svelte';
  import Avatar from '../components/Avatar.svelte';
  import PriorityChip from '../components/PriorityChip.svelte';
  import TddPip from '../components/TddPip.svelte';
  import Points from '../components/Points.svelte';
  import TaskProgress from '../components/TaskProgress.svelte';

  // La modale de détail (<StoryDetail>, montée dans App) s'ouvre via `?story=<id>` : ici on pose le paramètre.
  const COLUMNS = STATUSES.map((key) => ({ key, label: key })); // l'ordre des colonnes = l'ordre des statuts

  let promptOpen = false;
  let nav = $state({ focusedColumnIndex: 0, focusedCardIndex: -1, showMoveMenu: false });
  let openMenuId = $state(null);
  let dragId = $state(null);
  let dragTargets = $state([]);
  let dragOverCol = $state(null);
  let liveMessage = $state('');
  let snapshot = null; // stories connues, pour annoncer les changements arrivés en temps réel

  const announcer = createAnnouncer({ onChange: (message) => (liveMessage = message) });
  onDestroy(() => announcer.clear());

  const readonly = $derived(health.readonly);
  const filters = $derived(filtersFromQuery(route.query));
  const hasFilters = $derived(Boolean(filters.q || filters.prio.length || filters.who || filters.epic));

  // The board shows the ACTIVE sprint only (store.stories also carries the history of closed sprints).
  const activeSprintId = $derived(store.sprint?.sprint_id ?? null);
  const sprintStories = $derived(
    activeSprintId ? store.stories.filter((s) => s.sprint_id === activeSprintId) : store.stories
  );
  const shown = $derived(sortStories(sprintStories.filter((s) => matchStory(s, filters)), filters.sort, filters.dir));
  const noResults = $derived(!store.loading && hasFilters && sprintStories.length > 0 && shown.length === 0);

  const group = (list) => {
    const map = Object.fromEntries(COLUMNS.map((c) => [c.key, []]));
    for (const s of list) (map[s.status] ??= []).push(s);
    return map;
  };
  const storiesByStatus = $derived(group(shown));
  const totals = $derived(group(sprintStories));

  const schemeLegend = $derived.by(() => {
    const scheme = tweaks.codingScheme;
    if (scheme === 'priority') return Object.entries(PRIORITY).map(([k, v]) => [t(`priority.${k}`), `var(${v.cssVar})`]);
    if (scheme === 'tdd') return ['red', 'green', 'refactor'].map((k) => [t(`tdd.${k}`), `var(${TDD[k].cssVar})`]);
    if (scheme === 'epic') {
      const epics = new Set(sprintStories.map((s) => s.epic_id).filter(Boolean));
      return [...epics].map((id) => [id, epicHue(id)]);
    }
    return COLUMNS.map((c) => [t(`status.${c.key}`), `var(${STATUS[c.key].cssVar})`]);
  });

  // ---- annonces ---------------------------------------------------------------------------------------
  // Changements arrivés par le temps réel : un seul message regroupé, jamais un par carte.
  $effect(() => {
    store.revision;
    if (store.loading) return;
    untrack(() => {
      const changed = countChanged(snapshot, store.stories);
      snapshot = $state.snapshot(store.stories);
      if (changed > 0) announcer.say(tn('a11y.updated', changed));
    });
  });

  // ---- focus ------------------------------------------------------------------------------------------
  const focusCard = (id) => document.querySelector(`[data-card-id="${CSS.escape(id)}"]`)?.focus();
  const focusMoveButton = (id) => document.querySelector(`[data-move-id="${CSS.escape(id)}"]`)?.focus();

  /** Garde l'état de navigation clavier aligné sur la carte réellement focalisée (souris, Tab). */
  function syncFocus(cardId) {
    const pos = locateCard(storiesByStatus, COLUMNS, cardId);
    if (pos) nav = { ...nav, focusedColumnIndex: pos.columnIndex, focusedCardIndex: pos.cardIndex };
  }

  // ---- menu « Déplacer » ------------------------------------------------------------------------------
  const targetsOf = (story) => moveTargets(story, { readonly });

  function openMenu(story) {
    if (targetsOf(story).length === 0) {
      announcer.say(story._writable === false || readonly ? t('a11y.readonlyCard', { id: story.id }) : t('board.move.noTarget'));
      return;
    }
    openMenuId = story.id;
  }

  async function closeMenu({ focusButton = true } = {}) {
    const id = openMenuId;
    openMenuId = null;
    if (!id || !focusButton) return;
    await tick();
    focusMoveButton(id);
  }

  const toggleMenu = (story) => (openMenuId === story.id ? closeMenu() : openMenu(story));

  function onPointerDown(e) {
    if (openMenuId && !e.target.closest?.('.move-wrap')) closeMenu({ focusButton: false });
  }

  // ---- déplacement ------------------------------------------------------------------------------------
  async function askReason(id) {
    promptOpen = true;
    try {
      return await askBlockedReason(id);
    } finally {
      promptOpen = false;
    }
  }

  async function moveCard(story, target) {
    await closeMenu({ focusButton: false });
    // The outcome is announced once, by the toast regions (success: status, failure: alert).
    const res = await moveStory(story, target, askReason);
    if (res.cancelled) {
      await tick();
      return focusMoveButton(story.id);
    }
    if (res.ok) snapshot = $state.snapshot(store.stories);
    await tick();
    // The menu item that had the focus is gone: bring the focus back to the card, unless the user has already
    // moved it elsewhere while the server answered (never take the focus away from where it now is, WCAG 2.4.3).
    const lost = !document.activeElement || document.activeElement === document.body;
    if (lost) focusCard(story.id);
  }

  const openCard = (story) => setQuery({ story: story.id });

  // ---- clavier (board-nav.js) -------------------------------------------------------------------------
  const currentCard = () => storiesByStatus[COLUMNS[nav.focusedColumnIndex]?.key]?.[nav.focusedCardIndex];

  function runAction(action) {
    if (action.type === 'focus') focusCard(action.cardId);
    else if (action.type === 'open-menu') {
      const story = currentCard();
      if (story) openMenu(story);
    } else if (action.type === 'close-menu') closeMenu();
    else if (action.type === 'move') {
      const story = store.stories.find((s) => s.id === action.cardId);
      if (story && targetsOf(story).includes(action.targetStatus)) moveCard(story, action.targetStatus);
    } else if (action.type === 'readonly') announcer.say(t('a11y.readonlyCard', { id: action.cardId }));
  }

  function onKeydown(e) {
    if (e.ctrlKey || e.metaKey || (e.altKey && e.code !== 'KeyM')) return;
    if (!document.activeElement?.closest?.('.board')) return;
    const state = { ...nav, showMoveMenu: openMenuId !== null };
    const ctx = { columns: COLUMNS, storiesByStatus, promptOpen };
    const { state: next, action } = reduceKey(state, { key: e.key, code: e.code, altKey: e.altKey }, ctx);
    nav = { focusedColumnIndex: next.focusedColumnIndex, focusedCardIndex: next.focusedCardIndex, showMoveMenu: false };
    // Entrée (détails) et Espace sont laissés aux boutons natifs.
    if (!action || action.type === 'details') return;
    e.preventDefault();
    runAction(action);
  }

  // ---- glisser-déposer (alternative souris ; le menu « Déplacer » reste l'alternative sans glisser) -----
  function clearDrag() {
    dragId = null;
    dragTargets = [];
    dragOverCol = null;
  }

  function startDrag(e, story) {
    dragId = story.id;
    dragTargets = targetsOf(story);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', story.id);
  }

  function dragOver(e, status) {
    if (!dragId) return;
    if (!dragTargets.includes(status)) {
      e.dataTransfer.dropEffect = 'none';
      return; // pas de preventDefault : la colonne refuse le dépôt
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverCol = status;
  }

  function drop(e, status) {
    e.preventDefault();
    const story = store.stories.find((s) => s.id === dragId);
    const allowed = story && targetsOf(story).includes(status);
    clearDrag();
    if (allowed) moveCard(story, status);
  }

  // Les écouteurs souris sont posés par des actions : le clavier dispose du menu « Déplacer », donc la
  // carte et la colonne n'ont pas à être des éléments interactifs (pattern §3.1).
  function cardPointer(node, params) {
    let p = params;
    const onDragStart = (e) => (p.draggable ? startDrag(e, p.story) : e.preventDefault());
    const onClick = (e) => {
      if (e.target.closest('button, a')) return;
      node.querySelector('.card-open')?.focus(); // le focus revient ici à la fermeture de la modale
      openCard(p.story);
    };
    node.draggable = p.draggable;
    node.addEventListener('dragstart', onDragStart);
    node.addEventListener('dragend', clearDrag);
    node.addEventListener('click', onClick);
    return {
      update(next) {
        p = next;
        node.draggable = p.draggable;
      },
      destroy() {
        node.removeEventListener('dragstart', onDragStart);
        node.removeEventListener('dragend', clearDrag);
        node.removeEventListener('click', onClick);
      },
    };
  }

  function dropZone(node, status) {
    const onOver = (e) => dragOver(e, status);
    const onLeave = (e) => {
      if (!node.contains(e.relatedTarget)) dragOverCol = null;
    };
    const onDrop = (e) => drop(e, status);
    node.addEventListener('dragover', onOver);
    node.addEventListener('dragleave', onLeave);
    node.addEventListener('drop', onDrop);
    return {
      destroy() {
        node.removeEventListener('dragover', onOver);
        node.removeEventListener('dragleave', onLeave);
        node.removeEventListener('drop', onDrop);
      },
    };
  }

  const dropState = (status) => {
    if (!dragId) return null;
    if (dragTargets.includes(status)) return 'allowed';
    return store.stories.find((s) => s.id === dragId)?.status === status ? null : 'denied';
  };

  // The button disappears with the empty state: focus goes to the first card shown again.
  async function resetFilters() {
    setQuery({ q: null, prio: null, who: null, epic: null, sort: null, dir: null });
    await tick();
    document.querySelector('.board [data-card-id]')?.focus();
  }
</script>

<svelte:document onkeydown={onKeydown} onpointerdown={onPointerDown} />

<div class="board-toolbar">
  <FilterBar stories={sprintStories} />
  {#if !readonly}
    <button type="button" class="btn btn-primary new-story" data-new-story onclick={() => openCreate()}>
      <Icon name="plus" size={14} />{t('board.newStory')}
    </button>
  {/if}
  <details class="kbd-help">
    <summary>{t('board.keyboard.summary')}</summary>
    <KeyboardShortcuts />
  </details>
  <div class="coding-legend">
    <span class="lbl" id="coding-legend-label">{t(`board.legend.${tweaks.codingScheme}`)}</span>
    <ul aria-labelledby="coding-legend-label">
      {#each schemeLegend as [label, color]}
        <li class="key"><i style="background: {color}" aria-hidden="true"></i>{label}</li>
      {/each}
    </ul>
  </div>
</div>
{#if readonly || hasFilters}
  <div class="board-notes">
    {#if readonly}<p><Icon name="lock" size={12} /> {t('board.readonlyNote')}</p>{/if}
    {#if hasFilters}<p>{t('board.filtersNote')}</p>{/if}
  </div>
{/if}

{#if noResults}
  <div class="board-empty">
    <p>{t('common.filter.noResults')}</p>
    <button type="button" class="btn" onclick={resetFilters}>{t('common.filter.clear')}</button>
  </div>
{:else}
  <div class="board">
    {#each COLUMNS as col}
      {@const cv = `var(${STATUS[col.key].cssVar})`}
      {@const list = storiesByStatus[col.key]}
      {@const total = totals[col.key].length}
      {@const drop = dropState(col.key)}
      {@const limit = health.wipLimits?.[col.key]}
      {@const wip = wipState(total, limit)}
      <section
        class="column"
        class:drop-target={dragOverCol === col.key}
        class:drop-denied={drop === 'denied'}
        aria-labelledby="col-{col.key}"
        aria-busy={store.loading}
        use:dropZone={col.key}
      >
        <header class="col-head">
          <i class="col-dot" style="background: {cv}; color: {cv}" aria-hidden="true"></i>
          <h2 class="col-title" id="col-{col.key}">{t(`status.${col.key}`)}</h2>
          <span class="col-count mono" class:wip-at={wip === 'at'} class:wip-over={wip === 'over'}>
            {#if wip === 'none'}
              <span aria-hidden="true">{hasFilters ? `${list.length}/${total}` : list.length}</span>
              <span class="sr-only">{hasFilters ? t('board.column.filtered', { n: list.length, total }) : tn('board.column.count', list.length)}</span>
            {:else}
              <span aria-hidden="true">{t('board.wip.count', { count: total, limit })}</span>
              <span class="sr-only">{t('board.wip.summary', { count: total, limit })}{wip === 'ok' ? '' : `. ${t(`board.wip.${wip}`)}`}{hasFilters ? `. ${t('board.column.filtered', { n: list.length, total })}` : ''}</span>
            {/if}
          </span>
          <span class="col-pts mono">{t('board.column.points', { n: sumPoints(list) })}</span>
        </header>
        {#if wip === 'at' || wip === 'over'}
          <p class="col-wip-note" class:wip-over={wip === 'over'} aria-hidden="true"><Icon name="warn" size={12} /> {t(`board.wip.${wip}`)}</p>
        {/if}
        {#if drop}
          <p class="col-drop-note" aria-hidden="true">{drop === 'allowed' ? t('board.drop.here') : t('board.drop.denied')}</p>
        {/if}
        <ul class="col-body">
          {#if store.loading}
            {#each [1, 2] as n (n)}<li class="card-skel" aria-hidden="true"><span></span><span></span><span></span></li>{/each}
            <li class="sr-only">{t('a11y.loading')}</li>
          {:else}
            {#each list as s (s.id)}
              {@const targets = targetsOf(s)}
              {@const locked = readonly || s._writable === false}
              <li
                class="card"
                class:read-only={locked}
                class:dragging={dragId === s.id}
                class:menu-open={openMenuId === s.id}
                style="--code-color: {codeColor(s, tweaks.codingScheme)}"
                use:cardPointer={{ story: s, draggable: targets.length > 0 }}
              >
                <div class="card-top">
                  {#if s.epic_id}<i class="card-epic-dot" style="background: {epicHue(s.epic_id)}" title={s.epic_id}></i>{/if}
                  <span class="card-id mono">{s.id}</span>
                  {#if locked}<span class="card-lock" title={t('board.card.readonlyTitle')}><Icon name="lock" size={12} /></span>{/if}
                  <span class="spacer"></span>
                  <TddPip phase={s.tdd_phase} />
                  <PriorityChip priority={s.priority} />
                </div>
                <h3 class="card-title">
                  <button
                    type="button"
                    class="card-open"
                    data-card-id={s.id}
                    aria-label={t('a11y.openCard', { id: s.id, title: s.title })}
                    aria-describedby="card-desc-{s.id}"
                    onclick={() => openCard(s)}
                    onfocus={() => syncFocus(s.id)}
                  >{s.title}</button>
                </h3>
                <p id="card-desc-{s.id}" class="sr-only">{describeCard(s, { t, tn, readonly })}</p>
                <div class="card-meta">
                  <Points value={s.story_points} />
                  {#if s.persona}<span class="persona"><Icon name="person" cls="ico" size={13} />{s.persona}</span>{/if}
                  <span class="spacer"></span>
                  {#if s.status === 'blocked'}
                    <span class="card-blocked" title={s.blocked_reason}><Icon name="warn" size={12} /> {t('board.card.blocked')}</span>
                  {/if}
                  <TaskProgress tasks={s.tasks} status={s.status} />
                  <Avatar id={s.assigned_to} size={24} />
                </div>
                {#if targets.length > 0}
                  <div class="move-wrap">
                    <button
                      type="button"
                      class="card-move"
                      data-move-id={s.id}
                      aria-haspopup="menu"
                      aria-expanded={openMenuId === s.id}
                      aria-label={t('a11y.moveCard', { id: s.id })}
                      onclick={() => toggleMenu(s)}
                      onfocus={() => syncFocus(s.id)}
                    ><Icon name="arrowR" size={12} />{t('board.card.move')}</button>
                    {#if openMenuId === s.id}
                      <MoveMenu storyId={s.id} targets={targets} onmove={(status) => moveCard(s, status)} onclose={() => closeMenu()} />
                    {/if}
                  </div>
                {/if}
              </li>
            {:else}
              <li class="col-empty">{hasFilters && total > 0 ? t('common.filter.noResults') : t(`board.empty.${col.key}`)}</li>
            {/each}
          {/if}
        </ul>
      </section>
    {/each}
  </div>
{/if}

<!-- Région live du board : changements reçus en temps réel (les déplacements locaux passent par les toasts) -->
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only">{liveMessage}</div>

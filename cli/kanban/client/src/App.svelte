<script>
  import { onMount, onDestroy } from 'svelte';
  import { route } from './lib/router.svelte.js';
  import { store, loadStories, loadSprint, connectEvents, disconnectEvents, dismissToast } from './lib/store.svelte.js';
  import { tweaks, initTweaks } from './lib/tweaks.svelte.js';
  import { computeSprintProgress } from './lib/progress.js';
  import Icon from './components/Icon.svelte';
  import TweaksPanel from './components/TweaksPanel.svelte';
  import KanbanView from './views/KanbanView.svelte';
  import BacklogView from './views/BacklogView.svelte';
  // Lazy-loaded : tire des libs viz lourdes (uPlot, Cytoscape, marked+dompurify).
  const lazyBurndown = () => import('./views/BurndownView.svelte');
  const lazyDeps = () => import('./views/DepsView.svelte');
  const lazyDocs = () => import('./views/DocsView.svelte');
  const lazySprints = () => import('./views/SprintsView.svelte');

  let tweaksPanel = $state(null);

  onMount(async () => {
    initTweaks();
    await Promise.all([loadStories(), loadSprint()]);
    connectEvents();
  });

  onDestroy(() => disconnectEvents());

  const navItems = [
    { path: '/kanban', label: 'Board', icon: 'board' },
    { path: '/backlog', label: 'Backlog', icon: 'backlog' },
    { path: '/sprints', label: 'Sprints', icon: 'sprint' },
    { path: '/burndown', label: 'Burndown', icon: 'burndown' },
    { path: '/deps', label: 'Dependencies', icon: 'deps' },
    { path: '/docs', label: 'Docs', icon: 'docs' },
  ];

  const titleMap = {
    '/kanban': 'Board',
    '/backlog': 'Backlog',
    '/sprints': 'Sprints',
    '/burndown': 'Burndown',
    '/deps': 'Dependencies',
    '/docs': 'Docs',
  };

  let currentPath = $derived('/' + (route.parts[0] ?? 'kanban'));
  let title = $derived(titleMap[currentPath] ?? 'Board');

  // Progression du SPRINT ACTIF uniquement (pas toutes les stories, qui
  // incluent désormais l'historique des sprints clôturés) — cohérent avec le
  // Burndown.
  let progress = $derived(computeSprintProgress(store.stories, store.sprint?.sprint_id));
  let totalPoints = $derived(progress.totalPoints);
  let donePoints = $derived(progress.donePoints);
  let progressPct = $derived(progress.pct);
  let sprintName = $derived(store.sprint ? store.sprint.name : null);
  // Count shown next to "Board" : active-sprint stories (the board is scoped to
  // the active sprint), falling back to the full set when no active sprint.
  let boardCount = $derived(
    store.sprint?.sprint_id
      ? store.stories.filter((s) => s.sprint_id === store.sprint.sprint_id).length
      : store.stories.length,
  );
</script>

<a href="#main" class="skip-link">Skip to main content</a>

<div class="app-shell" data-density={tweaks.density}>
  <aside class="sidebar" aria-label="Navigation">
    <div class="brand">
      <div class="brand-mark mono">cc</div>
      <div>
        <div class="brand-name">claude-craft</div>
        <div class="brand-sub">BMAD v6</div>
      </div>
    </div>

    <nav class="nav" aria-label="Vues">
      <div class="nav-label">Workspace</div>
      {#each navItems as item}
        <a
          class="nav-item"
          href={'#' + item.path}
          aria-current={currentPath === item.path ? 'page' : undefined}
        >
          <Icon name={item.icon} cls="ico" size={18} />
          {item.label}
          {#if item.path === '/kanban'}<span class="nav-count mono">{boardCount}</span>{/if}
        </a>
      {/each}
    </nav>

    <div class="sidebar-foot">
      <div class="proj-card">
        <div class="row">
          <div class="pname">{sprintName ?? 'Sprint'}</div>
          {#if store.sprint}<span class="si-state active">active</span>{/if}
        </div>
        <div class="pmeta">{donePoints}/{totalPoints} pts</div>
        <div class="proj-bar"><span style="width: {progressPct}%"></span></div>
      </div>
    </div>
  </aside>

  <div class="main">
    <header class="topbar">
      <h1>{title}</h1>
      {#if sprintName}<span class="crumb mono">/ {sprintName}</span>{/if}
      <div class="topbar-spacer"></div>

      <div class="search" role="search">
        <Icon name="search" size={15} />
        <input placeholder="Rechercher des stories…" aria-label="Rechercher des stories" />
        <kbd class="mono">⌘K</kbd>
      </div>

      {#if store.sprint}
        <div class="sprint-pill">
          <span class="lbl">Sprint</span>
          <span class="val">{store.sprint.sprint_id ?? store.sprint.name}</span>
        </div>
      {/if}

      <div
        class="live {store.connected ? 'live-on' : 'live-off'}"
        aria-live="polite"
        title={store.connected ? 'Flux SSE connecté' : 'Flux SSE déconnecté'}
      >
        <span class="dot"></span>{store.connected ? 'Live' : 'Offline'}
      </div>

      <button class="icon-btn" aria-label="Réglages d'affichage" onclick={() => tweaksPanel?.open()}>
        <Icon name="settings" size={18} />
      </button>
    </header>

    <main class="view" id="main">
      {#if store.error && store.stories.length === 0}
        <div class="empty">
          <strong>Serveur injoignable.</strong><br />
          {store.error}
        </div>
      {:else if currentPath === '/kanban'}
        <KanbanView />
      {:else if currentPath === '/backlog'}
        <BacklogView />
      {:else if currentPath === '/sprints'}
        {#await lazySprints()}
          <div class="empty">Chargement…</div>
        {:then mod}
          {@const Comp = mod.default}
          <Comp />
        {/await}
      {:else if currentPath === '/burndown'}
        {#await lazyBurndown()}
          <div class="empty">Chargement…</div>
        {:then mod}
          {@const Comp = mod.default}
          <Comp />
        {/await}
      {:else if currentPath === '/deps'}
        {#await lazyDeps()}
          <div class="empty">Chargement…</div>
        {:then mod}
          {@const Comp = mod.default}
          <Comp />
        {/await}
      {:else if currentPath === '/docs'}
        {#await lazyDocs()}
          <div class="empty">Chargement…</div>
        {:then mod}
          {@const Comp = mod.default}
          <Comp />
        {/await}
      {/if}
    </main>
  </div>
</div>

<div class="toast-region" aria-live="polite" aria-relevant="additions">
  {#each store.toasts as t (t.id)}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="toast {t.kind}" role="status" onclick={() => dismissToast(t.id)}>
      <span class="t-ico {t.kind}">
        <Icon name={t.kind === 'error' ? 'warn' : t.kind === 'success' ? 'check' : 'arrowR'} size={16} />
      </span>
      <div class="t-msg">{t.message}</div>
    </div>
  {/each}
</div>

<TweaksPanel bind:this={tweaksPanel} />

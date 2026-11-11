<script>
  import { onMount, onDestroy } from 'svelte';
  import { route, setQuery, navigate } from './lib/router.svelte.js';
  import { store, loadStories, loadSprint, connectEvents, disconnectEvents } from './lib/store.svelte.js';
  import { health, loadHealth } from './lib/health.svelte.js';
  import { request, latestOnly } from './lib/api.js';
  import { tweaks, initTweaks } from './lib/tweaks.svelte.js';
  import { t, tn, initI18n } from './lib/i18n/index.svelte.js';
  import { computeSprintProgress } from './lib/progress.js';
  import {
    isLiveSearchView,
    isSearchShortcut,
    searchSubmitHash,
    diagnosticsItems,
    createConnectionTracker,
  } from './lib/shell.js';
  import Icon from './components/Icon.svelte';
  import TweaksPanel from './components/TweaksPanel.svelte';
  import StoryDetail from './components/StoryDetail.svelte';
  import Toasts from './components/Toasts.svelte';
  import NotFound from './components/NotFound.svelte';
  import KanbanView from './views/KanbanView.svelte';
  import BacklogView from './views/BacklogView.svelte';
  // Lazy-loaded : tire des libs viz lourdes (uPlot, Cytoscape, marked+dompurify).
  const lazyBurndown = () => import('./views/BurndownView.svelte');
  const lazyDeps = () => import('./views/DepsView.svelte');
  const lazyDocs = () => import('./views/DocsView.svelte');
  const lazySprints = () => import('./views/SprintsView.svelte');

  const lazyViews = { sprints: lazySprints, burndown: lazyBurndown, deps: lazyDeps, docs: lazyDocs };

  const NAV = [
    { name: 'kanban', label: 'nav.board', title: 'app.title.board', icon: 'board' },
    { name: 'backlog', label: 'nav.backlog', title: 'app.title.backlog', icon: 'backlog' },
    { name: 'sprints', label: 'nav.sprints', title: 'app.title.sprints', icon: 'sprint' },
    { name: 'burndown', label: 'nav.burndown', title: 'app.title.burndown', icon: 'burndown' },
    { name: 'deps', label: 'nav.deps', title: 'app.title.deps', icon: 'deps' },
    { name: 'docs', label: 'nav.docs', title: 'app.title.docs', icon: 'docs' },
  ];

  let tweaksPanel = $state(null);
  let mainEl = $state(null);
  let searchEl = $state(null);
  let diagnostics = $state(null);
  let diagOpen = $state(false);
  let liveMessage = $state('');
  let draft = $state(route.query.q ?? '');

  onMount(() => {
    initTweaks();
    initI18n();
    loadHealth();
    Promise.all([loadStories(), loadSprint()]).then(connectEvents);
  });

  onDestroy(() => disconnectEvents());

  // ---- titre, focus de la vue ------------------------------------------------
  let viewTitle = $derived(
    route.name === 'not-found' ? t('app.title.notFound') : t(NAV.find((n) => n.name === route.name)?.title ?? 'app.title.board')
  );
  let sprintName = $derived(store.sprint ? store.sprint.name : null);

  $effect(() => {
    document.title = sprintName
      ? t('app.titleTemplate', { view: viewTitle, sprint: sprintName })
      : t('app.titleNoSprint', { view: viewTitle });
  });

  // Le focus suit le changement de vue (pas le premier chargement) : lecteurs d'écran et clavier.
  let firstView = true;
  $effect(() => {
    void route.name;
    if (firstView) {
      firstView = false;
      return;
    }
    mainEl?.focus({ preventScroll: true });
  });

  function skipToMain(e) {
    e.preventDefault(); // un href="#main" casserait le routeur par hash
    mainEl?.focus();
  }

  // ---- recherche -------------------------------------------------------------
  $effect(() => {
    draft = route.query.q ?? '';
  });

  let liveSearch = $derived(isLiveSearchView(route.name));
  const shortcutHint = /Mac|iPhone|iPad/.test(globalThis.navigator?.platform ?? '') ? '⌘K' : 'Ctrl K';

  function onSearchInput(e) {
    draft = e.currentTarget.value;
    if (liveSearch) setQuery({ q: draft });
  }
  function clearSearch() {
    draft = '';
    if (liveSearch) setQuery({ q: null });
    searchEl?.focus();
  }
  function onSearchKey(e) {
    if (e.key === 'Enter' && !liveSearch) navigate(searchSubmitHash(draft));
    else if (e.key === 'Escape' && draft) {
      e.preventDefault();
      clearSearch();
    }
  }
  function onWindowKey(e) {
    if (!isSearchShortcut(e, { modalOpen: !!document.querySelector('dialog[open]') })) return;
    e.preventDefault();
    searchEl?.focus();
    searchEl?.select();
  }

  // ---- diagnostics (rechargés à chaque révision du store) --------------------
  const runDiagnostics = latestOnly();
  $effect(() => {
    void store.revision;
    const ticket = runDiagnostics();
    request('/api/diagnostics', { signal: ticket.signal })
      .then((data) => ticket.current && (diagnostics = data))
      .catch(() => {});
  });
  let diagItems = $derived(diagnosticsItems(diagnostics));
  let diagFiles = $derived(new Set(diagItems.map((i) => i.file)).size);

  // ---- connexion : on n'annonce que la perte et le retour --------------------
  const connection = createConnectionTracker();
  $effect(() => {
    const change = connection.update(store.connected);
    if (change === 'lost') liveMessage = t('a11y.connectionLost');
    else if (change === 'restored') liveMessage = t('a11y.connectionRestored');
  });

  // ---- progression du sprint actif ------------------------------------------
  let progress = $derived(computeSprintProgress(store.stories, store.sprint?.sprint_id));
  // Compteur du Board : stories du sprint actif, sinon toutes.
  let boardCount = $derived(
    store.sprint?.sprint_id
      ? store.stories.filter((s) => s.sprint_id === store.sprint.sprint_id).length
      : store.stories.length
  );
</script>

<svelte:window onkeydown={onWindowKey} />

<a href="#main" class="skip-link" onclick={skipToMain}>{t('app.skipLink')}</a>

{#if store.loading}<div class="loading-bar" aria-hidden="true"></div>{/if}

<div class="app-shell" data-density={tweaks.density}>
  <div class="side">
    <div class="brand">
      <div class="brand-mark mono" aria-hidden="true">cc</div>
      <div>
        <div class="brand-name">claude-craft</div>
        <div class="brand-sub">BMAD v6</div>
      </div>
    </div>

    <nav class="nav" aria-label={t('nav.label')}>
      <div class="nav-label" aria-hidden="true">{t('nav.workspace')}</div>
      {#each NAV as item (item.name)}
        <a class="nav-item" href={'#/' + item.name} aria-current={route.name === item.name ? 'page' : undefined}>
          <Icon name={item.icon} cls="ico" size={18} />
          {t(item.label)}
          {#if item.name === 'kanban'}
            <span class="nav-count mono" aria-hidden="true">{boardCount}</span>
            <span class="sr-only">{t('nav.boardCount', { n: boardCount })}</span>
          {/if}
        </a>
      {/each}
    </nav>

    <aside class="sidebar-foot" aria-label={t('app.sidebar.label')}>
      <div class="proj-card">
        <div class="row">
          <div class="pname">{sprintName ?? t('app.sprint.fallback')}</div>
          {#if store.sprint}<span class="si-state active">{t('app.sprint.active')}</span>{/if}
        </div>
        <div class="pmeta">{t('app.sprint.points', { done: progress.donePoints, total: progress.totalPoints })}</div>
        <div
          class="proj-bar"
          role="progressbar"
          aria-label={t('app.sprint.progress', { done: progress.donePoints, total: progress.totalPoints })}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={progress.pct}
        >
          <span style="width: {progress.pct}%"></span>
        </div>
      </div>
    </aside>
  </div>

  <div class="main">
    <header class="topbar">
      <h1>{viewTitle}</h1>
      {#if sprintName}<span class="crumb mono">/ {sprintName}</span>{/if}
      <div class="topbar-spacer"></div>

      <div class="search" role="search" aria-label={t('app.search.label')}>
        <Icon name="search" size={15} />
        <input
          bind:this={searchEl}
          type="text"
          inputmode="search"
          autocomplete="off"
          value={draft}
          placeholder={t('app.search.placeholder')}
          aria-label={t('app.search.label')}
          aria-describedby="search-hint"
          aria-keyshortcuts="Control+K Meta+K /"
          oninput={onSearchInput}
          onkeydown={onSearchKey}
        />
        <span id="search-hint" class="sr-only">{t('app.search.hint')}</span>
        {#if draft}
          <button type="button" class="search-clear" aria-label={t('app.search.clear')} onclick={clearSearch}>
            <Icon name="close" size={14} />
          </button>
        {:else}
          <kbd class="mono" aria-hidden="true">{shortcutHint}</kbd>
        {/if}
      </div>

      {#if store.sprint}
        <div class="sprint-pill">
          <span class="lbl">{t('app.sprint.pill')}</span>
          <span class="val">{store.sprint.sprint_id ?? store.sprint.name}</span>
        </div>
      {/if}

      <div
        class="live {store.connected ? 'live-on' : 'live-off'}"
        title={store.connected ? t('app.live.onTitle') : t('app.live.offTitle')}
      >
        <span class="dot"></span>{store.connected ? t('app.live.on') : t('app.live.off')}
      </div>

      <button type="button" class="icon-btn" aria-label={t('app.settings.open')} onclick={() => tweaksPanel?.open()}>
        <Icon name="settings" size={18} />
      </button>
    </header>

    {#if health.readonly}
      <div class="banner banner-info">
        <Icon name="lock" size={16} />
        <p><strong>{t('app.banner.readonly')}</strong> {t('app.banner.readonlyHint')}</p>
      </div>
    {/if}

    {#if diagItems.length}
      <div class="banner banner-warn">
        <Icon name="warn" size={16} />
        <div>
          <p><strong>{t('app.banner.diagnostics.title')}</strong> {tn('app.banner.diagnostics.summary', diagFiles)}</p>
          <details bind:open={diagOpen}>
            <summary>{diagOpen ? t('app.banner.diagnostics.hide') : t('app.banner.diagnostics.show')}</summary>
            <ul>
              {#each diagItems as item}
                <li class="mono">{t('app.banner.diagnostics.item', { file: item.file, message: item.message })}</li>
              {/each}
            </ul>
          </details>
        </div>
      </div>
    {/if}

    <main class="view" id="main" tabindex="-1" bind:this={mainEl} aria-busy={store.loading}>
      {#if store.error && store.stories.length === 0}
        <div class="empty" role="alert">
          <strong>{t('app.serverUnreachable')}</strong><br />
          {store.error}
        </div>
      {:else if route.name === 'kanban'}
        <KanbanView />
      {:else if route.name === 'backlog'}
        <BacklogView />
      {:else if lazyViews[route.name]}
        {#await lazyViews[route.name]()}
          <div class="empty">{t('app.loading')}</div>
        {:then mod}
          {@const Comp = mod.default}
          <Comp />
        {/await}
      {:else}
        <NotFound />
      {/if}
    </main>
  </div>
</div>

<div class="sr-only" role="status">{liveMessage}</div>

<Toasts />

<TweaksPanel bind:this={tweaksPanel} />

<!-- Modale de détail partagée (Board + Backlog) — pilotée par lib/detail.svelte.js -->
<StoryDetail />

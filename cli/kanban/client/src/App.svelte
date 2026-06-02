<script>
  import { onMount, onDestroy } from 'svelte';
  import { route } from './lib/router.svelte.js';
  import { store, loadStories, loadSprint, connectEvents, disconnectEvents, dismissToast } from './lib/store.svelte.js';
  import KanbanView from './views/KanbanView.svelte';
  import BacklogView from './views/BacklogView.svelte';
  // Lazy-loaded : pulls heavy viz libs (uPlot, Cytoscape, marked+dompurify).
  const lazyBurndown = () => import('./views/BurndownView.svelte');
  const lazyDeps = () => import('./views/DepsView.svelte');
  const lazyDocs = () => import('./views/DocsView.svelte');

  onMount(async () => {
    await Promise.all([loadStories(), loadSprint()]);
    connectEvents();
  });

  onDestroy(() => disconnectEvents());

  const navItems = [
    { path: '/kanban', label: 'Kanban' },
    { path: '/backlog', label: 'Backlog' },
    { path: '/burndown', label: 'Burndown' },
    { path: '/deps', label: 'Dependencies' },
    { path: '/docs', label: 'Docs' },
  ];

  function currentPath() {
    return '/' + (route.parts[0] ?? 'kanban');
  }

  let sprintLabel = $derived(store.sprint ? `${store.sprint.name} (${store.sprint.sprint_id})` : 'no sprint');
</script>

<a href="#main" class="skip-link">Skip to main content</a>

<div class="app-shell">
  <aside class="sidebar" aria-label="Navigation">
    <h1>claude-craft</h1>
    <nav class="nav" aria-label="Views">
      {#each navItems as item}
        <a
          href={'#' + item.path}
          aria-current={currentPath() === item.path ? 'page' : undefined}
        >{item.label}</a>
      {/each}
    </nav>

    <!-- h2 : un seul h1 par page (WCAG SC 1.3.1, SC 2.4.6) -->
    <h2 class="sidebar-section-title">Sprint</h2>
    <div style="font-size:12px; color: var(--fg-dim); padding: 0 10px;">
      {sprintLabel}
    </div>
  </aside>

  <header class="topbar" role="banner">
    <div class="title">
      {#if store.sprint}
        {store.sprint.goal || store.sprint.name}
      {:else}
        Kanban
      {/if}
    </div>
    <div class="status {store.connected ? 'connected' : 'disconnected'}" aria-live="polite">
      {store.connected ? '● live' : '○ offline'}
    </div>
  </header>

  <main class="main" id="main">
    {#if store.error && store.stories.length === 0}
      <div class="empty">
        <strong>Cannot reach server.</strong><br/>
        {store.error}
      </div>
    {:else if currentPath() === '/kanban'}
      <KanbanView />
    {:else if currentPath() === '/backlog'}
      <BacklogView />
    {:else if currentPath() === '/burndown'}
      {#await lazyBurndown()}
        <div class="empty">Loading…</div>
      {:then mod}
        {@const Comp = mod.default}
        <Comp />
      {/await}
    {:else if currentPath() === '/deps'}
      {#await lazyDeps()}
        <div class="empty">Loading…</div>
      {:then mod}
        {@const Comp = mod.default}
        <Comp />
      {/await}
    {:else if currentPath() === '/docs'}
      {#await lazyDocs()}
        <div class="empty">Loading…</div>
      {:then mod}
        {@const Comp = mod.default}
        <Comp />
      {/await}
    {/if}
  </main>
</div>

<div class="toast-layer" aria-live="polite">
  {#each store.toasts as t (t.id)}
    <div class="toast {t.kind}" role="status" onclick={() => dismissToast(t.id)}>
      {t.message}
    </div>
  {/each}
</div>

<style>
  /* Titre de section sidebar : même apparence que l'ancien h1 (via app.css .sidebar h1) */
  .sidebar-section-title {
    font-size: 13px;
    font-weight: 700;
    margin: 16px 0 8px;
    color: var(--fg-dim);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .skip-link {
    position: absolute;
    left: -9999px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
    background: var(--accent, #7c3aed);
    color: #fff;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    z-index: 9999;
  }
  .skip-link:focus {
    position: absolute;
    left: 8px;
    top: 8px;
    width: auto;
    height: auto;
    overflow: visible;
  }
</style>

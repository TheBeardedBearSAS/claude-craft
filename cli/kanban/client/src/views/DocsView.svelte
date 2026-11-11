<script>
  import { untrack } from 'svelte';
  import { store } from '../lib/store.svelte.js';
  import { route } from '../lib/router.svelte.js';
  import { formatHash } from '../lib/query.js';
  import { t } from '../lib/i18n/index.svelte.js';
  import { request, latestOnly, isAbort, errorKey } from '../lib/api.js';
  import { renderMarkdown } from '../lib/markdown.js';
  import { buildDocsTree, groupOpenFor } from '../lib/docs-tree.js';
  import { scrollable } from '../lib/actions.js';
  import Icon from '../components/Icon.svelte';

  const WIDE = '(min-width: 981px)';
  const runList = latestOnly();
  const runDoc = latestOnly();
  const mq = window.matchMedia(WIDE);

  let docs = $state([]);
  let listLoaded = $state(false);
  let listError = $state(null);

  let content = $state('');
  let loadedRel = $state(null);
  let docLoading = $state(false);
  let docError = $state(null);
  let html = $state('');

  let navOpen = $state(mq.matches);
  let openGroups = $state(new Set());
  let copyStatus = $state('');
  let copyTimer;

  const selectedRel = $derived(route.params.rel ?? null);
  const tree = $derived(buildDocsTree(docs));
  const href = (rel) => formatHash('docs', { rel }, {});

  async function loadDocs() {
    const ticket = runList();
    try {
      const data = await request('/api/docs', { signal: ticket.signal });
      if (!ticket.current) return;
      docs = data.docs || [];
      listError = null;
    } catch (err) {
      if (isAbort(err) || !ticket.current) return;
      listError = errorKey(err);
    }
    if (ticket.current) listLoaded = true;
  }

  async function loadDoc(rel) {
    const ticket = runDoc();
    if (!rel) {
      content = '';
      loadedRel = null;
      docError = null;
      docLoading = false;
      return;
    }
    docLoading = loadedRel !== rel; // a live reload of the open document keeps it on screen
    docError = null;
    try {
      const text = await request(`/api/docs/${rel.split('/').map(encodeURIComponent).join('/')}`, { as: 'text', signal: ticket.signal });
      if (!ticket.current) return;
      content = text;
      loadedRel = rel;
    } catch (err) {
      if (isAbort(err) || !ticket.current) return;
      docError = errorKey(err);
      content = '';
      loadedRel = null;
    }
    if (ticket.current) docLoading = false;
  }

  async function copy() {
    clearTimeout(copyTimer);
    try {
      await navigator.clipboard.writeText(content);
      copyStatus = t('docs.copied');
    } catch {
      copyStatus = t('docs.copyFailed');
    }
    copyTimer = setTimeout(() => (copyStatus = ''), 2500);
  }

  function toggleGroup(name) {
    const next = new Set(openGroups);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    openGroups = next;
  }

  // Narrow screens: the tree sits above the document, so fold it once a document is chosen.
  // The element is closed at once too: bind:open learns of an opening through the asynchronous `toggle` event,
  // and a `toggle` still pending from opening the tree would otherwise write `open` back to true.
  let navEl = $state(null);
  const onPick = () => {
    if (mq.matches) return;
    navOpen = false;
    if (navEl) navEl.open = false;
  };

  $effect(() => {
    store.revision;
    untrack(loadDocs);
  });
  $effect(() => {
    const rel = selectedRel;
    store.revision;
    untrack(() => loadDoc(rel));
  });

  // Open the folder holding the selected document (deep link, or a link followed from elsewhere).
  $effect(() => {
    const group = groupOpenFor(selectedRel);
    if (group) untrack(() => (openGroups = new Set(openGroups).add(group)));
  });

  $effect(() => {
    const on = () => (navOpen = mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  });
  $effect(() => () => clearTimeout(copyTimer));

  // h1 of the document becomes h2 (the page keeps a single h1); story ids become ?story= links.
  $effect(() => {
    const src = content;
    const linkRoute = { name: 'docs', params: { rel: loadedRel }, query: {} };
    let stale = false;
    renderMarkdown(src, { linkRoute, demote: 1 }).then((out) => {
      if (!stale) html = out;
    });
    return () => (stale = true);
  });
</script>

{#snippet docLink(doc, label, nested)}
  <a class="tree-item" class:nested href={href(doc.rel)} aria-current={selectedRel === doc.rel ? 'page' : undefined} onclick={onPick}>
    {#if !nested}<Icon name="file" cls="ico" size={15} />{/if}{label}
  </a>
{/snippet}

<div class="view-pad">
  <h2 class="sr-only">{t('docs.title')}</h2>
  <div class="docs-layout">
    <details class="docs-nav" bind:this={navEl} bind:open={navOpen}>
      <summary>{t('docs.title')}</summary>
      <nav aria-label={t('docs.tree.label')} aria-busy={!listLoaded}>
        {#if !listLoaded}
          <div class="empty" role="status">{t('common.loading')}</div>
        {:else if listError}
          <div class="empty" role="alert">
            <p>{t(listError)}</p>
            <button class="btn" onclick={loadDocs}>{t('common.retry')}</button>
          </div>
        {:else if docs.length === 0}
          <div class="empty">{t('docs.empty')}</div>
        {:else}
          <ul class="tree-list">
            {#each tree.root as doc (doc.rel)}
              <li>{@render docLink(doc, doc.rel, false)}</li>
            {/each}
            {#each tree.groups as group (group.name)}
              {@const open = openGroups.has(group.name)}
              <li class="tree-group">
                <button class="tree-item group-header" aria-expanded={open} aria-label={t('docs.group.toggle', { name: group.name })} onclick={() => toggleGroup(group.name)}>
                  <Icon name="chevron" cls="group-icon" size={12} />{group.name}/
                </button>
                {#if open}
                  <ul class="group-children">
                    {#each group.children as child (child.doc.rel)}
                      <li>{@render docLink(child.doc, child.label, true)}</li>
                    {/each}
                  </ul>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      </nav>
    </details>

    <div class="doc-view" role="region" aria-label={t('docs.view.label')} aria-busy={docLoading}>
      {#if !selectedRel}
        <div class="empty">{t('docs.select')}</div>
      {:else}
        <div class="doc-toolbar">
          <span class="doc-path mono">{selectedRel}</span>
          <span class="copy-wrap">
            <span class="copy-status" role="status">{copyStatus}</span>
            <button class="btn btn-ghost" onclick={copy} aria-label={t('docs.copy.label')} disabled={!content}>
              <Icon name="copy" size={15} />{t('docs.copy')}
            </button>
          </span>
        </div>
        {#if docLoading}
          <div class="empty">{t('docs.loadingDoc')}</div>
        {:else if docError}
          <div class="empty" role="alert">
            <p>{t(docError)}</p>
            <button class="btn" onclick={() => loadDoc(selectedRel)}>{t('common.retry')}</button>
          </div>
        {:else}
          <div class="doc-paper" use:scrollable={html}>{@html html}</div>
        {/if}
      {/if}
    </div>
  </div>
</div>

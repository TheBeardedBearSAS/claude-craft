<script>
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';
  import Icon from '../components/Icon.svelte';

  let docs = $state([]);
  let selectedDoc = $state(null);
  let docContent = $state('');
  let loading = $state(true);
  let loadingContent = $state(false);
  let error = $state(null);
  let contentContainer = $state(null);

  const tree = $derived.by(() => {
    const root = [];
    const groups = {};
    for (const doc of docs) {
      const parts = doc.rel.split('/');
      if (parts.length === 1) {
        root.push(doc);
      } else {
        const topLevel = parts[0];
        if (!groups[topLevel]) groups[topLevel] = { name: topLevel, children: [] };
        groups[topLevel].children.push(doc);
      }
    }
    return { root, groups: Object.values(groups) };
  });

  async function loadDocs() {
    loading = true;
    error = null;
    try {
      const res = await fetch('/api/docs');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      docs = data.docs || [];
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function selectDoc(doc) {
    selectedDoc = doc;
    loadingContent = true;
    try {
      const res = await fetch(`/api/docs/${encodeURIComponent(doc.rel)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      docContent = await res.text();
    } catch (err) {
      docContent = `Error loading document: ${err.message}`;
    } finally {
      loadingContent = false;
    }
  }

  const renderedContent = $derived.by(() => {
    if (!docContent) return '';
    try {
      return DOMPurify.sanitize(marked.parse(docContent));
    } catch {
      return '<p>Error rendering markdown</p>';
    }
  });

  let copied = $state(false);
  function copyContent() {
    if (docContent && navigator.clipboard) {
      navigator.clipboard.writeText(docContent).then(() => {
        copied = true;
        setTimeout(() => (copied = false), 1500);
      });
    }
  }

  $effect(() => { loadDocs(); });

  // Réécrit les liens US-xxx vers le board (navigation interne).
  $effect(() => {
    if (!contentContainer || !renderedContent) return;
    const links = contentContainer.querySelectorAll('a');
    for (const link of links) {
      const text = link.textContent?.trim() || '';
      if (/^US-\d+$/.test(text)) {
        link.href = '#/kanban';
        link.dataset.storyId = text;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.hash = '#/kanban';
        });
      }
    }
  });

  let expandedGroups = $state(new Set());
  function toggleGroup(groupName) {
    if (expandedGroups.has(groupName)) expandedGroups.delete(groupName);
    else expandedGroups.add(groupName);
    expandedGroups = new Set(expandedGroups);
  }
</script>

<div class="docs-pad">
  <div class="docs-layout">
    <aside class="docs-tree" aria-label="Navigation des documents">
      {#if loading}
        <div class="empty" style="padding:20px 8px">Chargement…</div>
      {:else if error}
        <div class="empty" style="padding:20px 8px; color: var(--danger)">Erreur : {error}</div>
      {:else}
        {#each tree.root as doc}
          <button class="tree-item" class:active={selectedDoc?.rel === doc.rel} onclick={() => selectDoc(doc)}>
            <Icon name="file" cls="ico" size={15} />{doc.rel}
          </button>
        {/each}
        {#each tree.groups as group}
          <div class="tree-group">
            <button class="tree-item group-header" onclick={() => toggleGroup(group.name)} aria-expanded={expandedGroups.has(group.name)}>
              <span class="group-icon">{expandedGroups.has(group.name) ? '▼' : '▶'}</span>{group.name}/
            </button>
            {#if expandedGroups.has(group.name)}
              <div class="group-children">
                {#each group.children as doc}
                  <button class="tree-item nested" class:active={selectedDoc?.rel === doc.rel} onclick={() => selectDoc(doc)}>
                    {doc.rel.split('/').slice(1).join('/')}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      {/if}
    </aside>

    <div class="doc-view" role="region" aria-label="Contenu du document">
      {#if !selectedDoc}
        <div class="empty">Sélectionnez un document</div>
      {:else}
        <div class="doc-toolbar">
          <span class="doc-path mono">{selectedDoc.rel}</span>
          <button class="btn btn-ghost" onclick={copyContent} aria-label="Copier le contenu">
            <Icon name="copy" size={15} />{copied ? 'Copié !' : 'Copier'}
          </button>
        </div>
        {#if loadingContent}
          <div class="empty">Chargement du document…</div>
        {:else}
          <div class="doc-paper" bind:this={contentContainer}>{@html renderedContent}</div>
        {/if}
      {/if}
    </div>
  </div>
</div>

<style>
  .docs-pad { padding: 22px; height: 100%; min-height: 0; display: flex; flex-direction: column; }
  .docs-pad .docs-layout { flex: 1; min-height: 0; }
  .group-icon { font-size: 9px; width: 12px; display: inline-block; }
  .doc-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
  .doc-toolbar .doc-path { font-size: 12px; color: var(--fg-faint); }
</style>

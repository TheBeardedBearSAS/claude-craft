<script>
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';

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
        if (!groups[topLevel]) {
          groups[topLevel] = { name: topLevel, children: [] };
        }
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
      const html = marked.parse(docContent);
      return DOMPurify.sanitize(html);
    } catch {
      return '<p>Error rendering markdown</p>';
    }
  });

  function copyContent() {
    if (docContent && navigator.clipboard) {
      navigator.clipboard.writeText(docContent).then(() => {
        // Success - could show a toast but we don't have access to store here
      });
    }
  }

  $effect(() => {
    loadDocs();
  });

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
    if (expandedGroups.has(groupName)) {
      expandedGroups.delete(groupName);
    } else {
      expandedGroups.add(groupName);
    }
    expandedGroups = new Set(expandedGroups);
  }
</script>

<div class="docs-container">
  <aside class="docs-sidebar">
    {#if loading}
      <div class="sidebar-loading">Loading...</div>
    {:else if error}
      <div class="sidebar-error">Error: {error}</div>
    {:else}
      <nav class="docs-tree" aria-label="Document navigation">
        {#each tree.root as doc}
          <button
            class="tree-item"
            class:active={selectedDoc?.rel === doc.rel}
            onclick={() => selectDoc(doc)}
            tabindex="0"
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectDoc(doc);
              }
            }}
          >
            {doc.rel}
          </button>
        {/each}

        {#each tree.groups as group}
          <div class="tree-group">
            <button
              class="group-header"
              onclick={() => toggleGroup(group.name)}
              aria-expanded={expandedGroups.has(group.name)}
              tabindex="0"
              onkeydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleGroup(group.name);
                }
              }}
            >
              <span class="group-icon">
                {expandedGroups.has(group.name) ? '▼' : '▶'}
              </span>
              {group.name}/
            </button>
            {#if expandedGroups.has(group.name)}
              <div class="group-children">
                {#each group.children as doc}
                  <button
                    class="tree-item nested"
                    class:active={selectedDoc?.rel === doc.rel}
                    onclick={() => selectDoc(doc)}
                    tabindex="0"
                    onkeydown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectDoc(doc);
                      }
                    }}
                  >
                    {doc.rel.split('/').slice(1).join('/')}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </nav>
    {/if}
  </aside>

  <!-- div+role=region remplace <main> imbriqué (interdit par HTML : un seul <main> visible, WCAG SC 1.3.6) -->
  <div class="docs-content" role="region" aria-label="Contenu du document">
    {#if !selectedDoc}
      <div class="empty">Select a document</div>
    {:else}
      <header class="content-header">
        <h1>{selectedDoc.rel}</h1>
        <button class="copy-btn" onclick={copyContent} aria-label="Copier le contenu">
          Copy
        </button>
      </header>

      {#if loadingContent}
        <div class="content-loading">Loading document...</div>
      {:else}
        <div class="markdown-body" bind:this={contentContainer}>
          {@html renderedContent}
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .docs-container {
    display: flex;
    gap: 0;
    height: 100%;
    overflow: hidden;
  }

  .docs-sidebar {
    width: 220px;
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border);
    overflow-y: auto;
    padding: 12px 8px;
  }

  .sidebar-loading,
  .sidebar-error {
    padding: 12px;
    text-align: center;
    font-size: 12px;
    color: var(--fg-dim);
  }

  .sidebar-error {
    color: var(--danger);
  }

  .docs-tree {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .tree-item,
  .group-header {
    background: none;
    border: none;
    padding: 6px 10px;
    text-align: left;
    cursor: pointer;
    border-radius: var(--radius);
    font-size: 13px;
    width: 100%;
    transition: background 0.1s;
  }

  .tree-item {
    color: var(--fg);
  }

  .tree-item:hover,
  .group-header:hover {
    background: var(--border);
  }

  .tree-item.active {
    background: var(--accent);
    color: var(--accent-fg);
    font-weight: 600;
  }

  .tree-item:focus,
  .group-header:focus {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }

  .tree-item.nested {
    padding-left: 24px;
    font-size: 12px;
  }

  .group-header {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
    color: var(--fg-dim);
  }

  .group-icon {
    font-size: 10px;
    width: 12px;
    display: inline-block;
  }

  .group-children {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .docs-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: var(--bg);
  }

  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }

  .content-header h1 {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    color: var(--fg);
  }

  .copy-btn {
    background: var(--bg-elev);
    border: 1px solid var(--border);
    padding: 6px 12px;
    border-radius: var(--radius);
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    color: var(--fg);
    transition: background 0.1s;
  }

  .copy-btn:hover {
    background: var(--border);
  }

  /* Indicateur de focus visible explicite (WCAG 2.2 SC 2.4.11) */
  .copy-btn:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .copy-btn:active {
    transform: translateY(1px);
  }

  .content-loading {
    text-align: center;
    padding: 40px;
    color: var(--fg-dim);
  }

  .markdown-body {
    line-height: 1.7;
  }

  .markdown-body :global(h1) {
    font-size: 28px;
    font-weight: 700;
    margin: 24px 0 16px;
    color: var(--fg);
    border-bottom: 1px solid var(--border);
    padding-bottom: 8px;
  }

  .markdown-body :global(h2) {
    font-size: 22px;
    font-weight: 600;
    margin: 20px 0 12px;
    color: var(--fg);
  }

  .markdown-body :global(h3) {
    font-size: 18px;
    font-weight: 600;
    margin: 16px 0 10px;
    color: var(--fg);
  }

  .markdown-body :global(p) {
    margin: 0 0 12px;
    color: var(--fg);
  }

  .markdown-body :global(code) {
    background: var(--bg-sidebar);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: var(--mono);
    font-size: 0.9em;
  }

  .markdown-body :global(pre) {
    background: var(--bg-sidebar);
    padding: 12px;
    border-radius: var(--radius);
    overflow-x: auto;
    margin: 0 0 12px;
    border: 1px solid var(--border);
  }

  .markdown-body :global(pre code) {
    background: none;
    padding: 0;
  }

  .markdown-body :global(a) {
    color: var(--accent);
    text-decoration: underline;
  }

  .markdown-body :global(a:hover) {
    opacity: 0.8;
  }

  .markdown-body :global(ul),
  .markdown-body :global(ol) {
    margin: 0 0 12px;
    padding-left: 24px;
  }

  .markdown-body :global(li) {
    margin: 4px 0;
  }

  .markdown-body :global(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 0 0 12px;
  }

  .markdown-body :global(th),
  .markdown-body :global(td) {
    border: 1px solid var(--border);
    padding: 8px 12px;
    text-align: left;
  }

  .markdown-body :global(th) {
    background: var(--bg-sidebar);
    font-weight: 600;
  }

  .markdown-body :global(blockquote) {
    border-left: 3px solid var(--accent);
    padding-left: 12px;
    margin: 0 0 12px;
    color: var(--fg-dim);
    font-style: italic;
  }

  .markdown-body :global(hr) {
    border: none;
    border-top: 1px solid var(--border);
    margin: 20px 0;
  }
</style>

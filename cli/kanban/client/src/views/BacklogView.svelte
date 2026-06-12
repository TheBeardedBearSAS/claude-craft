<script>
  import { store } from '../lib/store.svelte.js';
  import { groupStoriesByEpic } from '../lib/backlog.js';

  // Stories with an unknown epic_id (e.g. BMAD v6 sprint-status.yaml, epic_id="E1" with no
  // markdown epic) are kept in a synthesized group instead of being dropped — see backlog.js.
  const epicGroups = $derived(groupStoriesByEpic(store.stories, store.epics));

  let expanded = $state(new Set());

  function toggleEpic(epicId) {
    const next = new Set(expanded);
    if (next.has(epicId)) {
      next.delete(epicId);
    } else {
      next.add(epicId);
    }
    expanded = next;
  }

  function epicProgress(stories) {
    const done = stories.filter(s => s.status === 'done').length;
    const total = stories.length;
    return { done, total, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  }

  function epicTotalPoints(stories) {
    return stories.reduce((sum, s) => sum + (s.story_points || 0), 0);
  }

  function businessValueColor(value) {
    if (value === 'high') return 'var(--danger)';
    if (value === 'medium') return 'var(--warn)';
    if (value === 'low') return 'var(--info)';
    return 'var(--fg-dim)';
  }

  function statusColor(status) {
    if (status === 'done') return 'var(--ok)';
    if (status === 'blocked') return 'var(--danger)';
    if (status === 'in-progress') return 'var(--accent)';
    if (status === 'review') return 'var(--info)';
    return 'var(--fg-dim)';
  }

  function tddBadge(phase) {
    if (phase === 'red') return { char: '●', color: 'var(--danger)', label: 'red' };
    if (phase === 'green') return { char: '●', color: 'var(--ok)', label: 'green' };
    if (phase === 'refactor') return { char: '●', color: 'var(--info)', label: 'refactor' };
    if (phase === 'done') return { char: '✓', color: 'var(--ok)', label: 'done' };
    return null;
  }
</script>

<div class="backlog">
  {#if store.epics.length === 0 && store.stories.length === 0}
    <div class="empty">No epics or stories yet</div>
  {:else}
    {#each epicGroups.groups as { epic, stories } (epic.id)}
      {@const progress = epicProgress(stories)}
      {@const totalPoints = epicTotalPoints(stories)}
      {@const isExpanded = expanded.has(epic.id)}

      <article class="epic-card">
        <header class="epic-header">
          <button
            class="expand-btn"
            onclick={() => toggleEpic(epic.id)}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            aria-expanded={isExpanded}
          >
            {isExpanded ? '▾' : '▸'}
          </button>
          <span class="epic-id">{epic.id}</span>
          <span class="epic-title">{epic.title}</span>
          <span class="business-value" style="background: {businessValueColor(epic.business_value)}">
            {epic.business_value}
          </span>
          <span class="story-count">{stories.length} stories</span>
          <span class="total-points">{totalPoints}p</span>
        </header>

        <div class="epic-status">
          <span class="status-badge" style="color: {statusColor(epic.status)}">{epic.status}</span>
        </div>

        <div class="epic-progress" role="region" aria-label="epic progress">
          <div class="progress-bar-bg">
            <div class="progress-bar" style="width: {progress.percent}%"></div>
          </div>
          <span class="progress-text">{progress.done}/{progress.total} ({progress.percent}%)</span>
        </div>

        {#if isExpanded && stories.length > 0}
          <div class="stories-list">
            {#each stories as story (story.id)}
              {@const tdd = tddBadge(story.tdd_phase)}

              <div class="story-item">
                <span class="story-id">{story.id}</span>
                <span class="story-title">{story.title}</span>
                <span class="story-status" style="color: {statusColor(story.status)}">{story.status}</span>
                <span class="story-points">{story.story_points}p</span>
                {#if tdd}
                  <span class="story-tdd" style="color: {tdd.color}" title="TDD: {tdd.label}">{tdd.char}</span>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </article>
    {/each}

    {#if epicGroups.orphans.length > 0}
      <article class="epic-card orphans">
        <header class="epic-header">
          <button
            class="expand-btn"
            onclick={() => toggleEpic('__orphans__')}
            aria-label={expanded.has('__orphans__') ? 'Collapse' : 'Expand'}
            aria-expanded={expanded.has('__orphans__')}
          >
            {expanded.has('__orphans__') ? '▾' : '▸'}
          </button>
          <span class="epic-title">No Epic</span>
          <span class="story-count">{epicGroups.orphans.length} stories</span>
          <span class="total-points">{epicTotalPoints(epicGroups.orphans)}p</span>
        </header>

        {#if expanded.has('__orphans__')}
          <div class="stories-list">
            {#each epicGroups.orphans as story (story.id)}
              {@const tdd = tddBadge(story.tdd_phase)}

              <div class="story-item">
                <span class="story-id">{story.id}</span>
                <span class="story-title">{story.title}</span>
                <span class="story-status" style="color: {statusColor(story.status)}">{story.status}</span>
                <span class="story-points">{story.story_points}p</span>
                {#if tdd}
                  <span class="story-tdd" style="color: {tdd.color}" title="TDD: {tdd.label}">{tdd.char}</span>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </article>
    {/if}
  {/if}
</div>

<style>
  .backlog {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .epic-card {
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px;
    box-shadow: var(--shadow);
  }

  .epic-card.orphans {
    border-left: 3px solid var(--warn);
  }

  .epic-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .expand-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px 6px;
    font-size: 14px;
    color: var(--fg-dim);
    border-radius: 3px;
  }

  .expand-btn:hover {
    background: var(--border);
  }

  .expand-btn:focus {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }

  .epic-id {
    font-family: var(--mono);
    font-weight: 600;
    font-size: 12px;
    color: var(--accent);
  }

  .epic-title {
    font-weight: 600;
    flex: 1;
  }

  .business-value {
    text-transform: uppercase;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 10px;
    color: var(--accent-fg);
  }

  .story-count {
    font-size: 12px;
    color: var(--fg-dim);
    font-family: var(--mono);
  }

  .total-points {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    font-family: var(--mono);
  }

  .epic-status {
    margin-bottom: 8px;
  }

  .status-badge {
    text-transform: uppercase;
    font-size: 11px;
    font-weight: 600;
  }

  .epic-progress {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .progress-bar-bg {
    flex: 1;
    background: var(--bg-sidebar);
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-bar {
    background: var(--accent);
    height: 100%;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 11px;
    color: var(--fg-dim);
    font-family: var(--mono);
    min-width: 80px;
    text-align: right;
  }

  .stories-list {
    margin-top: 12px;
    border-top: 1px solid var(--border);
    padding-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .story-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: var(--bg-sidebar);
    border-radius: var(--radius);
    font-size: 13px;
  }

  .story-id {
    font-family: var(--mono);
    font-weight: 600;
    font-size: 11px;
    color: var(--accent);
  }

  .story-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .story-status {
    text-transform: uppercase;
    font-size: 10px;
    font-weight: 600;
  }

  .story-points {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--fg-dim);
  }

  .story-tdd {
    font-size: 13px;
  }
</style>

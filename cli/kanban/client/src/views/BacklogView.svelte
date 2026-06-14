<script>
  import { store } from '../lib/store.svelte.js';
  import { groupStoriesByEpic } from '../lib/backlog.js';
  import { STATUS, epicHue } from '../lib/config.js';
  import Icon from '../components/Icon.svelte';
  import Avatar from '../components/Avatar.svelte';
  import PriorityChip from '../components/PriorityChip.svelte';
  import Points from '../components/Points.svelte';
  import ProgressRing from '../components/ProgressRing.svelte';

  // Stories with an unknown epic_id (e.g. BMAD v6 sprint-status.yaml) are kept in a
  // synthesized group instead of being dropped — see backlog.js.
  const epicGroups = $derived(groupStoriesByEpic(store.stories, store.epics));

  let expanded = $state(new Set());

  function toggleEpic(epicId) {
    const next = new Set(expanded);
    if (next.has(epicId)) next.delete(epicId);
    else next.add(epicId);
    expanded = next;
  }

  function epicProgress(stories) {
    const done = stories.filter((s) => s.status === 'done').length;
    const total = stories.length;
    return { done, total, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  }

  const epicTotalPoints = (stories) => stories.reduce((sum, s) => sum + (s.story_points || 0), 0);
</script>

<div class="view-pad">
  <div class="backlog">
    {#if store.epics.length === 0 && store.stories.length === 0}
      <div class="empty">No epics or stories yet</div>
    {:else}
      {#each epicGroups.groups as { epic, stories } (epic.id)}
        {@const progress = epicProgress(stories)}
        {@const isOpen = expanded.has(epic.id)}
        {@const color = epicHue(epic.id)}
        <div class="epic" data-open={isOpen}>
          <button class="epic-head" aria-expanded={isOpen} onclick={() => toggleEpic(epic.id)}>
            <Icon name="chevron" cls="epic-chevron" size={16} />
            <span class="epic-bar" style="background: {color}"></span>
            <div>
              <div style="display:flex; align-items:center; gap:9px">
                <span class="epic-id mono">{epic.id}</span>
                <span class="epic-title">{epic.title}</span>
              </div>
              <div class="epic-meta" style="margin-top:3px">{epic.business_value ? epic.business_value + ' value · ' : ''}{epic.status}</div>
            </div>
            <div class="epic-prog">
              <span class="epic-meta">{stories.length} stories · {epicTotalPoints(stories)} pts</span>
              <span class="ring"><ProgressRing pct={progress.percent} size={42} color={color} /></span>
            </div>
          </button>
          <div class="epic-stories">
            <div>
              {#each stories as story (story.id)}
                <div class="story-row">
                  <span class="s-id mono">{story.id}</span>
                  <span class="s-title">{story.title}</span>
                  {#if story._writable === false}<span class="ro-lock"><Icon name="lock" size={12} /></span>{/if}
                  <PriorityChip priority={story.priority} />
                  <Points value={story.story_points} />
                  <span class="s-status">
                    <i style="background: var({STATUS[story.status]?.cssVar || '--fg-faint'})"></i>{STATUS[story.status]?.label || story.status}
                  </span>
                  <Avatar id={story.assigned_to} size={24} />
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/each}

      {#if epicGroups.orphans.length > 0}
        {@const isOpen = expanded.has('__orphans__')}
        <div class="epic" data-open={isOpen}>
          <button class="epic-head" aria-expanded={isOpen} onclick={() => toggleEpic('__orphans__')}>
            <Icon name="chevron" cls="epic-chevron" size={16} />
            <span class="epic-bar" style="background: var(--warning)"></span>
            <div>
              <div style="display:flex; align-items:center; gap:9px">
                <span class="epic-title">No Epic</span>
              </div>
              <div class="epic-meta" style="margin-top:3px">Stories sans epic</div>
            </div>
            <div class="epic-prog">
              <span class="epic-meta">{epicGroups.orphans.length} stories · {epicTotalPoints(epicGroups.orphans)} pts</span>
            </div>
          </button>
          <div class="epic-stories">
            <div>
              {#each epicGroups.orphans as story (story.id)}
                <div class="story-row">
                  <span class="s-id mono">{story.id}</span>
                  <span class="s-title">{story.title}</span>
                  {#if story._writable === false}<span class="ro-lock"><Icon name="lock" size={12} /></span>{/if}
                  <PriorityChip priority={story.priority} />
                  <Points value={story.story_points} />
                  <span class="s-status">
                    <i style="background: var({STATUS[story.status]?.cssVar || '--fg-faint'})"></i>{STATUS[story.status]?.label || story.status}
                  </span>
                  <Avatar id={story.assigned_to} size={24} />
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>

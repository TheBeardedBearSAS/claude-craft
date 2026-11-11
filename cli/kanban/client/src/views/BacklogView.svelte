<script>
  import { store, loadStories } from '../lib/store.svelte.js';
  import { route } from '../lib/router.svelte.js';
  import { t, tn } from '../lib/i18n/index.svelte.js';
  import { filtersFromQuery } from '../lib/query.js';
  import { buildBacklog, epicProgress } from '../lib/backlog.js';
  import { epicHue } from '../lib/config.js';
  import Icon from '../components/Icon.svelte';
  import ProgressRing from '../components/ProgressRing.svelte';
  import FilterBar from '../components/FilterBar.svelte';
  import StoryRow from '../components/StoryRow.svelte';

  const ORPHANS = '__orphans__';

  // Stories with an unknown epic_id (e.g. BMAD v6 sprint-status.yaml) are kept in a
  // synthesized group instead of being dropped — see backlog.js.
  const filters = $derived(filtersFromQuery(route.query));
  const backlog = $derived(buildBacklog(store.stories, store.epics, filters));
  const isEmpty = $derived(store.stories.length === 0 && store.epics.length === 0);

  // Epics are collapsed by default and expanded while filtering, so matches are visible.
  // `flipped` holds the epics the user toggled away from that default.
  let flipped = $state(new Set());
  const isOpen = (id) => backlog.filtered !== flipped.has(id);

  function toggleEpic(id) {
    const next = new Set(flipped);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    flipped = next;
  }
</script>

{#snippet epicHead(id, name, meta, count, points, ring)}
  <h3 class="epic-heading">
    <button class="epic-head" aria-expanded={isOpen(id)} aria-controls="epic-{id}" onclick={() => toggleEpic(id)}>
      <Icon name="chevron" cls="epic-chevron" size={16} />
      <span class="epic-bar"></span>
      <span class="epic-main">
        <span class="epic-line">
          {#if id !== ORPHANS}<span class="epic-id mono">{id}</span>{/if}
          <span class="epic-title">{name}</span>
        </span>
        <span class="epic-meta">{meta}</span>
      </span>
      <span class="epic-prog">
        <span class="epic-meta">{tn('common.stories', count)} · {t('common.points', { n: points })}</span>
        {#if ring}<span class="ring"><ProgressRing pct={ring.percent} size={42} color={epicHue(id)} label={t('backlog.epic.progress', { pct: ring.percent })} /></span>{/if}
      </span>
    </button>
  </h3>
{/snippet}

<div class="view-pad" aria-busy={store.loading}>
  <h2 class="sr-only">{t('backlog.title')}</h2>
  <FilterBar stories={store.stories} />
  <div class="backlog">
    {#if store.loading}
      <div class="empty" role="status">{t('common.loading')}</div>
    {:else if store.error && isEmpty}
      <div class="empty" role="alert">
        <p>{t('toast.load_failed', { reason: store.error })}</p>
        <button class="btn" onclick={loadStories}>{t('common.retry')}</button>
      </div>
    {:else if isEmpty}
      <div class="empty">{t('backlog.empty')}</div>
    {:else if backlog.filtered && backlog.count === 0}
      <div class="empty">{t('backlog.noResults')}</div>
    {:else}
      {#each backlog.groups as { epic, stories } (epic.id)}
        {@const progress = epicProgress(stories)}
        {@const meta = [epic.business_value ? t('backlog.epic.value', { value: epic.business_value }) : '', epic.status].filter(Boolean).join(' · ')}
        <div class="epic" data-open={isOpen(epic.id)} style:--epic-color={epicHue(epic.id)}>
          {@render epicHead(epic.id, epic.title, meta, stories.length, progress.points, progress)}
          {#if isOpen(epic.id)}
            <ul class="epic-stories" id="epic-{epic.id}">
              {#each stories as story (story.id)}<StoryRow {story} />{/each}
            </ul>
          {/if}
        </div>
      {/each}

      {#if backlog.orphans.length > 0}
        <div class="epic" data-open={isOpen(ORPHANS)} style:--epic-color="var(--warning)">
          {@render epicHead(ORPHANS, t('backlog.noEpic'), t('backlog.noEpicMeta'), backlog.orphans.length, epicProgress(backlog.orphans).points, null)}
          {#if isOpen(ORPHANS)}
            <ul class="epic-stories" id="epic-{ORPHANS}">
              {#each backlog.orphans as story (story.id)}<StoryRow {story} />{/each}
            </ul>
          {/if}
        </div>
      {/if}
    {/if}
  </div>
</div>

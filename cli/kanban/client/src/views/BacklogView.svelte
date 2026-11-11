<script>
  import { tick } from 'svelte';
  import { store, loadStories } from '../lib/store.svelte.js';
  import { health } from '../lib/health.svelte.js';
  import { route } from '../lib/router.svelte.js';
  import { t, tn } from '../lib/i18n/index.svelte.js';
    import { sumPoints } from '../lib/points.js';
  import {
    planTargets,
    filterByScope,
    isPlannable,
    selectionPoints,
    firstCapacity,
  } from '../lib/sprint-plan.js';
  import { planStory, planStories } from '../lib/sprint-actions.svelte.js';
  import { openCreate } from '../lib/story-actions.svelte.js';
  import { filtersFromQuery } from '../lib/query.js';
  import { buildBacklog, epicProgress } from '../lib/backlog.js';
  import { epicHue } from '../lib/config.js';
  import Icon from '../components/Icon.svelte';
  import ProgressRing from '../components/ProgressRing.svelte';
  import FilterBar from '../components/FilterBar.svelte';
  import StoryRow from '../components/StoryRow.svelte';
  import CapacityBar from '../components/CapacityBar.svelte';

  const ORPHANS = '__orphans__';

  // Stories with an unknown epic_id (e.g. BMAD v6 sprint-status.yaml) are kept in a
  // synthesized group instead of being dropped — see backlog.js.
  const filters = $derived(filtersFromQuery(route.query));

  // ---- planning: target sprint, quick filter, selection ----
  let chosenTarget = $state(null);
  let scopeChoice = $state('all');
  let selected = $state(new Set());
  let targetSelect = $state(null);

  const writable = $derived(!health.readonly);
  const targets = $derived(planTargets(store.sprints));
  const target = $derived(targets.find((s) => s.id === chosenTarget) ?? targets[0] ?? null);
  const scope = $derived(target ? scopeChoice : 'all');
  const sprintName = (s) => s?.name || s?.id;
  const sprintById = $derived(new Map(store.sprints.map((s) => [s.id, s])));

  const base = $derived(buildBacklog(filterByScope(store.stories, scope, target?.id), store.epics, filters));
  // A quick filter acts like a search filter: empty epics disappear and the matching ones are expanded.
  const backlog = $derived(
    scope === 'all' ? base : { ...base, filtered: true, groups: base.groups.filter((g) => g.stories.length > 0) }
  );
  const visible = $derived([...backlog.groups.flatMap((g) => g.stories), ...backlog.orphans]);
  const plannable = $derived(visible.filter((s) => isPlannable(s, health.readonly)));
  const chosen = $derived(plannable.filter((s) => selected.has(s.id)));
  const toAdd = $derived(target ? chosen.filter((s) => s.sprint_id !== target.id) : []);
  const toRemove = $derived(chosen.filter((s) => s.sprint_id));
  const committed = $derived(sumPoints(store.stories, (s) => s.sprint_id === target?.id));
  const capacity = $derived(
    firstCapacity(target?.capacity_points, store.sprint?.sprint_id === target?.id ? store.sprint?.capacity_points : undefined)
  );
  const selectionText = $derived(
    chosen.length
      ? `${tn('backlog.plan.selected', chosen.length)} · ${t('backlog.plan.selectedPoints', { n: selectionPoints(plannable, selected) })}`
      : ''
  );

  function planFor(story) {
    if (!isPlannable(story, health.readonly)) return null;
    const sprint = sprintById.get(story.sprint_id);
    return {
      selected: selected.has(story.id),
      onToggle: toggleSelected,
      sprintName: sprint && sprint.state !== 'closed' ? sprintName(sprint) : '',
      addLabel: target ? t('backlog.plan.addTo', { sprint: sprintName(target) }) : null,
      inTarget: !!target && story.sprint_id === target.id,
      onAction: rowAction,
    };
  }

  function toggleSelected(id) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    selected = next;
  }

  // Keep the focus on an element that still exists (WCAG 2.4.3): a row button or the action bar may be gone.
  async function settleFocus() {
    await tick();
    const active = document.activeElement;
    if (!active || active === document.body || !active.isConnected) targetSelect?.focus();
  }

  async function rowAction(story) {
    await planStory(story.id, target && story.sprint_id === target.id ? null : target);
    await settleFocus();
  }

  async function runBulk(stories, sprint) {
    const ids = stories.map((s) => s.id);
    const result = await planStories(ids, sprint);
    const left = new Set(selected);
    for (const id of ids.slice(0, result.done)) left.delete(id);
    selected = left;
    await settleFocus();
  }
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
  <h3 class="epic-heading" id="epic-h-{id}">
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
  {#if writable}
    <section class="plan-bar" aria-labelledby="plan-bar-title">
      <h3 class="sr-only" id="plan-bar-title">{t('backlog.plan.bar.label')}</h3>
      <div class="plan-controls">
        {#if targets.length > 0}
          <div class="plan-field">
            <label for="plan-target">{t('backlog.plan.target')}</label>
            <select id="plan-target" bind:this={targetSelect} onchange={(e) => (chosenTarget = e.currentTarget.value)}>
              {#each targets as s (s.id)}
                <option value={s.id} selected={s.id === target?.id}>{sprintName(s)} ({t(`sprint.state.${s.state}`)})</option>
              {/each}
            </select>
          </div>
          <div class="plan-field">
            <label for="plan-scope">{t('backlog.plan.scope.label')}</label>
            <select id="plan-scope" bind:value={scopeChoice}>
              <option value="backlog">{t('backlog.plan.scope.backlog')}</option>
              <option value="sprint">{t('backlog.plan.scope.sprint')}</option>
              <option value="all">{t('backlog.plan.scope.all')}</option>
            </select>
          </div>
        {:else}
          <p class="plan-none">{t('backlog.plan.noSprint')}</p>
        {/if}
        <button type="button" class="btn btn-primary plan-new" data-new-story onclick={() => openCreate(target ? { sprint_id: target.id } : {})}>
          <Icon name="plus" size={14} />{t('backlog.newStory')}
        </button>
      </div>
      {#if target}
        <div class="plan-capacity"><CapacityBar {committed} {capacity} /></div>
      {/if}
      <div class="plan-selection">
        <button type="button" class="btn" onclick={() => (selected = new Set(plannable.map((s) => s.id)))}>{t('backlog.plan.selectAll')}</button>
        {#if chosen.length > 0}
          <button type="button" class="btn btn-ghost" onclick={() => (selected = new Set())}>{t('backlog.plan.clear')}</button>
        {/if}
        <p class="plan-status" role="status">{selectionText}</p>
      </div>
      {#if chosen.length > 0}
        <div class="plan-actions" role="group" aria-label={t('backlog.plan.actions.label')}>
          {#if toAdd.length > 0}
            <button type="button" class="btn btn-primary" onclick={() => runBulk(toAdd, target)}>{tn('backlog.plan.addSelected', toAdd.length)}</button>
          {/if}
          {#if toRemove.length > 0}
            <button type="button" class="btn" onclick={() => runBulk(toRemove, null)}>{t('backlog.plan.removeSelected')}</button>
          {/if}
        </div>
      {/if}
    </section>
  {/if}
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
            <ul class="epic-stories" id="epic-{epic.id}" aria-labelledby="epic-h-{epic.id}">
              {#each stories as story (story.id)}<StoryRow {story} plan={planFor(story)} />{/each}
            </ul>
          {/if}
        </div>
      {/each}

      {#if backlog.orphans.length > 0}
        <div class="epic" data-open={isOpen(ORPHANS)} style:--epic-color="var(--warning)">
          {@render epicHead(ORPHANS, t('backlog.noEpic'), t('backlog.noEpicMeta'), backlog.orphans.length, epicProgress(backlog.orphans).points, null)}
          {#if isOpen(ORPHANS)}
            <ul class="epic-stories" id="epic-{ORPHANS}" aria-labelledby="epic-h-{ORPHANS}">
              {#each backlog.orphans as story (story.id)}<StoryRow {story} plan={planFor(story)} />{/each}
            </ul>
          {/if}
        </div>
      {/if}
    {/if}
  </div>
</div>

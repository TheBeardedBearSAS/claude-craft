<script>
  import { tick, untrack } from 'svelte';
  import { store, loadSprintList } from '../lib/store.svelte.js';
  import { health } from '../lib/health.svelte.js';
  import { route, navigate } from '../lib/router.svelte.js';
  import { formatHash } from '../lib/query.js';
  import { t, tn, fmtDate } from '../lib/i18n/index.svelte.js';
  import { request, latestOnly, isAbort, errorKey } from '../lib/api.js';
  import { renderMarkdown } from '../lib/markdown.js';
  import { sortSprints, sprintState, sprintTotals, groupTasksByStory } from '../lib/sprints.js';
  import { STATUS } from '../lib/config.js';
  import { scrollable, focusable } from '../lib/actions.js';
  import { firstCapacity } from '../lib/sprint-plan.js';
  import { startSprint, closeSprint, refreshPlanning, planning } from '../lib/sprint-actions.svelte.js';
  import Icon from '../components/Icon.svelte';
  import SprintForm from '../components/SprintForm.svelte';
  import CloseSprintDialog from '../components/CloseSprintDialog.svelte';
  import ConfirmDialog from '../components/ConfirmDialog.svelte';
  import CapacityBar from '../components/CapacityBar.svelte';

  const TASK_STATUSES = ['to-do', 'in-progress', 'done', 'blocked'];
  const runDetail = latestOnly();

  // The list comes from the store (reloaded on every sprint / story event and after each action here).
  const sprints = $derived(sortSprints(store.sprints));
  const listLoaded = $derived(store.sprintsLoaded);
  const listError = $derived(store.sprintsError);
  const writable = $derived(!health.readonly);
  const planned = $derived(sprints.filter((s) => s.state === 'planned'));

  let form = $state(null);
  let closeDialog = $state(null);
  let confirmDialog = $state(null);
  let titleEl = $state(null);
  let alertEl = $state(null);
  let resultEl = $state(null);
  let actionError = $state(null); // { key, code, active } — an action the server refused
  let closeResult = $state(null); // answer of POST /api/sprints/:id/close

  let detail = $state(null);
  let detailLoading = $state(false);
  let detailError = $state(null);
  let html = $state({ goal: '', review: '', retro: '' });
  let expanded = $state(new Set());

  const selectedId = $derived(route.params.id ?? null);
  const activeId = $derived(store.sprint?.sprint_id ?? null);
  const totals = $derived(sprintTotals(detail?.stories));
  const tasksByStory = $derived(groupTasksByStory(detail?.tasks));
  const stateOf = (s) => sprintState(s, activeId);
  const pct = (s) => (s.total_points ? Math.round((s.done_points / s.total_points) * 100) : 0);
  const statusText = (s) => (STATUS[s] ? t(`status.${s}`) : s);
  const taskStatusText = (s) => (TASK_STATUSES.includes(s) ? t(`status.task.${s}`) : s);
  const href = (id) => formatHash('sprints', { id }, {});

  // The detail response carries no points: borrow them from the list entry, else from the stories.
  const detailState = $derived.by(() => {
    if (!detail) return 'planned';
    const entry = sprints.find((s) => s.id === detail.sprint.id);
    return stateOf({ total_points: totals.total, done_points: totals.done, ...entry, ...detail.sprint });
  });

  async function loadDetail(id) {
    const ticket = runDetail();
    if (!id) {
      detail = null;
      detailError = null;
      detailLoading = false;
      return;
    }
    detailLoading = detail?.sprint?.id !== id; // a reload of the open sprint keeps it on screen
    detailError = null;
    try {
      const data = await request(`/api/sprints/${encodeURIComponent(id)}`, { signal: ticket.signal });
      if (!ticket.current) return;
      detail = data;
    } catch (err) {
      if (isAbort(err) || !ticket.current) return;
      detailError = errorKey(err);
      detail = null;
    }
    if (ticket.current) detailLoading = false;
  }

  function toggleStory(id) {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    expanded = next;
  }

  $effect(() => {
    const id = selectedId;
    store.revision;
    untrack(() => loadDetail(id));
  });

  const detailEntry = $derived(sprints.find((s) => s.id === detail?.sprint?.id));
  const detailCapacity = $derived(
    firstCapacity(
      detailEntry?.capacity_points,
      detail?.sprint?.capacity_points,
      store.sprint?.sprint_id === detail?.sprint?.id ? store.sprint?.capacity_points : undefined
    )
  );
  const nameOf = (id) => sprints.find((s) => s.id === id)?.name || id;

  async function fail(err) {
    actionError = { key: errorKey(err), code: err.code, active: err.body?.active ?? null };
    await tick();
    alertEl?.focus();
  }

  async function onStart() {
    if (planning.busy) return;
    const sprint = detail.sprint;
    const label = sprint.name || sprint.id;
    if (!(await confirmDialog.confirm(t('sprint.start.confirm', { sprint: label }), { confirmLabel: t('sprint.start.button') }))) return;
    actionError = null;
    try {
      await startSprint(sprint.id);
      await tick();
      titleEl?.focus();
    } catch (err) {
      await fail(err);
    }
  }

  async function onClose() {
    if (planning.busy) return;
    const sprint = detail.sprint;
    const carryOver = await closeDialog.open({ id: sprint.id, name: sprint.name || sprint.id });
    if (carryOver === null) return;
    actionError = null;
    try {
      closeResult = await closeSprint(sprint.id, carryOver);
      await tick();
      resultEl?.focus();
    } catch (err) {
      await fail(err);
    }
  }

  async function reloadAndRetry() {
    actionError = null;
    await refreshPlanning();
  }

  $effect(() => {
    const d = detail;
    const linkRoute = { name: 'sprints', params: { id: d?.sprint?.id }, query: {} };
    let stale = false;
    Promise.all(['goal', 'review', 'retro'].map((k) => renderMarkdown(d?.[k], { linkRoute, demote: 3 }))).then(
      ([goal, review, retro]) => {
        if (!stale) html = { goal, review, retro };
      }
    );
    return () => (stale = true);
  });
</script>

{#snippet failure(key, retry)}
  <div class="empty" role="alert">
    <p>{t(key)}</p>
    <button class="btn" onclick={retry}>{t('common.retry')}</button>
  </div>
{/snippet}

<div class="view-pad">
  <h2 class="sr-only">{t('nav.sprints')}</h2>
  <div class="sprints-layout">
    <section class="sprint-list" aria-label={t('sprint.list.label')} aria-busy={!listLoaded}>
      {#if writable}
        <div class="sprint-list-actions">
          <button type="button" class="btn btn-primary" onclick={() => form.open()}><Icon name="plus" size={14} />{t('sprint.create.button')}</button>
        </div>
      {/if}
      {#if !listLoaded}
        <div class="empty" role="status">{t('common.loading')}</div>
      {:else if listError}
        {@render failure(listError, loadSprintList)}
      {:else if sprints.length === 0}
        <div class="empty">{t('sprint.none')}</div>
      {:else}
        <ul>
          {#each sprints as s (s.id)}
            {@const state = stateOf(s)}
            <li>
              <a class="sprint-item" href={href(s.id)} aria-current={selectedId === s.id ? 'page' : undefined}>
                <span class="si-top">
                  <span class="si-name">{s.id}</span>
                  <span class="si-state {state}">{t(`sprint.state.${state}`)}</span>
                </span>
                <span class="si-stat">
                  <span>{tn('sprint.stat.stories', s.story_count)}</span>
                  <span>{t('sprint.stat.points', { done: s.done_points, total: s.total_points })}</span>
                </span>
                <span class="proj-bar" aria-hidden="true"><span style:width="{pct(s)}%"></span></span>
                {#if s.has_goal || s.has_review || s.has_retro}
                  <span class="si-tags">
                    {#if s.has_goal}<span class="tag-mini">{t('sprint.tag.goal')}</span>{/if}
                    {#if s.has_review}<span class="tag-mini">{t('sprint.tag.review')}</span>{/if}
                    {#if s.has_retro}<span class="tag-mini">{t('sprint.tag.retro')}</span>{/if}
                  </span>
                {/if}
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </section>

    <!-- Région section (et non un landmark principal) : le shell App fournit déjà le landmark principal. -->
    <section class="sprint-detail" aria-label={t('sprint.detail.label')} aria-busy={detailLoading}>
      {#if closeResult}
        <div class="sd-result" tabindex="-1" bind:this={resultEl}>
          <h3>{t('sprint.close.result.title')}</h3>
          <p class="sd-result-name">{closeResult.sprint.name || closeResult.sprint.id}</p>
          <ul>
            <li>{t('sprint.close.result.points', { delivered: closeResult.sprint.points_delivered, committed: closeResult.sprint.points_committed })}</li>
            <li>{tn('sprint.close.result.archived', closeResult.archived.length)}</li>
            {#if closeResult.carried_over.stories.length > 0}
              <li>{tn('sprint.close.result.carried', closeResult.carried_over.stories.length, { to: closeResult.carried_over.to === 'backlog' ? t('sprint.close.result.toBacklog') : nameOf(closeResult.carried_over.to) })}</li>
            {/if}
          </ul>
          <button type="button" class="btn" onclick={() => (closeResult = null)}>{t('common.close')}</button>
        </div>
      {/if}
      {#if actionError}
        <div class="sd-alert" role="alert" tabindex="-1" bind:this={alertEl}>
          {#if actionError.code === 'sprint_already_active' && actionError.active}
            <p>{t('sprint.start.alreadyActive', { active: actionError.active.name || actionError.active.id })}
              <a href={href(actionError.active.id)}>{t('sprint.start.goToActive', { sprint: actionError.active.name || actionError.active.id })}</a></p>
          {:else}
            <p>{t(actionError.key)}</p>
          {/if}
          {#if actionError.code === 'conflict'}<button type="button" class="btn" onclick={reloadAndRetry}>{t('sprint.error.reloadRetry')}</button>{/if}
        </div>
      {/if}
      {#if !selectedId}
        <div class="empty">{t('sprint.select')}</div>
      {:else if detailLoading}
        <div class="empty">{t('common.loading')}</div>
      {:else if detailError}
        {@render failure(detailError, () => loadDetail(selectedId))}
      {:else if detail}
        <div class="sd-head">
          <div class="sd-head-main">
            <div class="sd-title">
              <h3 tabindex="-1" bind:this={titleEl}>{detail.sprint.name || detail.sprint.id}</h3>
              <span class="si-state {detailState}">{t(`sprint.state.${detailState}`)}</span>
            </div>
            <div class="sd-sub">
              <span class="mono">{detail.sprint.id}</span>
              {#if detail.sprint.epic}<span class="tag-mini">{detail.sprint.epic}</span>{/if}
              {#if detail.sprint.start_date}
                <span>{t('sprint.dates.range', { start: fmtDate(detail.sprint.start_date, { dateStyle: 'medium' }), end: detail.sprint.end_date ? fmtDate(detail.sprint.end_date, { dateStyle: 'medium' }) : '…' })}</span>
              {:else if detail.sprint.end_date}
                <span>{t('sprint.closedOn', { date: fmtDate(detail.sprint.end_date, { dateStyle: 'medium' }) })}</span>
              {/if}
              {#if detail.sprint.points_delivered != null}<span>{t('sprint.delivered', { n: detail.sprint.points_delivered })}</span>{/if}
            </div>
          </div>
          {#if writable && (detailState === 'planned' || detailState === 'active')}
            <div class="sd-actions" role="group" aria-label={t('sprint.actions.label')}>
              {#if detailState === 'planned'}
                <button type="button" class="btn btn-primary" onclick={onStart}>{t('sprint.start.button')}</button>
              {:else}
                <button type="button" class="btn" onclick={onClose}>{t('sprint.close.button')}</button>
              {/if}
            </div>
          {/if}
        </div>

        {#if detailState !== 'closed'}
          <div class="sd-panel"><CapacityBar committed={totals.total} capacity={detailCapacity} /></div>
        {/if}

        <div class="sd-metrics">
          <div class="metric"><div class="mk">{t('sprint.metric.points')}</div><div class="mv">{t('sprint.metric.pts', { n: totals.total })}</div></div>
          <div class="metric"><div class="mk">{t('sprint.metric.completed')}</div><div class="mv">{t('sprint.metric.pts', { n: totals.done })}</div><div class="msub">{t('sprint.metric.ofTotal', { pct: totals.pct })}</div></div>
          <div class="metric"><div class="mk">{t('sprint.metric.stories')}</div><div class="mv">{totals.count}</div></div>
        </div>

        {#if html.goal}
          <div class="sd-panel">
            <h4>{t('sprint.goal')}</h4>
            <div class="md-body" use:scrollable={html.goal}>{@html html.goal}</div>
          </div>
        {/if}

        <div class="sd-panel">
          <h4>{t('sprint.storiesTasks')} <span class="pill pill-accent">{detail.stories.length}</span></h4>
          {#if detail.stories.length === 0}
            <p class="sd-none">{t('sprint.noStories')}</p>
          {:else}
            <div class="table-scroll" role="region" use:focusable aria-label={t('sprint.stories.caption', { sprint: detail.sprint.name || detail.sprint.id })}>
              <table class="st-table">
                <caption class="sr-only">{t('sprint.stories.caption', { sprint: detail.sprint.name || detail.sprint.id })}</caption>
                <thead>
                  <tr>
                    <th scope="col" class="col-toggle"><span class="sr-only">{t('story.field.tasks')}</span></th>
                    <th scope="col">{t('sprint.stories.id')}</th>
                    <th scope="col">{t('sprint.stories.title')}</th>
                    <th scope="col">{t('sprint.stories.assignee')}</th>
                    <th scope="col">{t('sprint.stories.status')}</th>
                    <th scope="col" class="num">{t('sprint.stories.points')}</th>
                  </tr>
                </thead>
                <tbody>
                  {#each detail.stories as st (st.id)}
                    {@const tasks = tasksByStory[st.id] ?? []}
                    {@const open = expanded.has(st.id)}
                    <tr>
                      <td class="col-toggle">
                        {#if tasks.length}
                          <button class="task-toggle" aria-expanded={open} aria-controls="tasks-{st.id}" onclick={() => toggleStory(st.id)}>
                            <Icon name="chevron" cls="toggle-chevron" size={14} />
                            <span class="sr-only">{t('sprint.tasks.toggleLabel', { id: st.id })}</span>
                            <span class="toggle-count">{tasks.length}</span>
                          </button>
                        {/if}
                      </td>
                      <th scope="row" class="s-id mono">{st.id}</th>
                      <td>{st.title}</td>
                      <td>{#if st.assigned_to}<span class="s-assignee mono">{st.assigned_to}</span>{:else}<span class="sr-only">{t('common.unassigned')}</span>{/if}</td>
                      <td><span class="cell-status"><i style:background="var({STATUS[st.status]?.cssVar || '--fg-faint'})"></i>{statusText(st.status)}</span></td>
                      <td class="num mono">{st.story_points ?? '—'}</td>
                    </tr>
                    {#if open && tasks.length}
                      <tr class="task-row" id="tasks-{st.id}">
                        <td></td>
                        <td colspan="5">
                          <table class="sprint-tasks">
                            <caption class="sr-only">{t('sprint.tasks.caption', { id: st.id })}</caption>
                            <thead>
                              <tr>
                                <th scope="col">{t('sprint.tasks.task')}</th>
                                <th scope="col">{t('sprint.tasks.type')}</th>
                                <th scope="col">{t('sprint.tasks.status')}</th>
                                <th scope="col" class="num">{t('sprint.tasks.estimate')}</th>
                                <th scope="col" class="num">{t('sprint.tasks.actual')}</th>
                                <th scope="col">{t('sprint.tasks.assignee')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {#each tasks as task (task.id)}
                                <tr>
                                  <th scope="row" class="t-name mono">{task.id}</th>
                                  <td>{task.type}</td>
                                  <td>{taskStatusText(task.status)}</td>
                                  <td class="num t-hrs">{task.estimation_hours ?? '—'}</td>
                                  <td class="num t-hrs">{task.actual_hours ?? '—'}</td>
                                  <td>{task.assigned_to || '—'}</td>
                                </tr>
                              {/each}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </div>

        {#if html.review}
          <div class="sd-panel">
            <h4>{t('sprint.review')} <span class="pill pill-success">{t('sprint.review.badge')}</span></h4>
            <div class="md-body review-md" use:scrollable={html.review}>{@html html.review}</div>
          </div>
        {/if}
        {#if html.retro}
          <div class="sd-panel">
            <h4>{t('sprint.retro')} <span class="pill pill-accent">{t('sprint.retro.badge')}</span></h4>
            <div class="md-body review-md" use:scrollable={html.retro}>{@html html.retro}</div>
          </div>
        {/if}
      {/if}
    </section>
  </div>
</div>

<SprintForm bind:this={form} onsaved={(sprint) => navigate(href(sprint.id))} />
<CloseSprintDialog bind:this={closeDialog} stories={store.stories} {planned} />
<ConfirmDialog bind:this={confirmDialog} />

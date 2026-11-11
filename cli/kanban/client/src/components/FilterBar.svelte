<script>
  /**
   * Filters + sort shared by the Board and the Backlog (audit K-15).
   * The state lives in the URL (route.query): this component reads it and writes it with setQuery().
   *
   * Props
   *   stories  object[]  the UNFILTERED stories of the view. Used for the assignee/epic choices (facets)
   *                      and for the announced result count.
   *
   * URL keys: prio (comma list of must|should|could|wont), who, epic, sort (id|priority|points|status|title),
   *           dir (asc|desc). The search text `q` is owned by the topbar field; "Reset" clears it too.
   *
   * Views filter and sort with the same helpers:
   *   const filters = $derived(filtersFromQuery(route.query));
   *   const shown = $derived(sortStories(stories.filter((s) => matchStory(s, filters)), filters.sort, filters.dir));
   */
  import { route, setQuery } from '../lib/router.svelte.js';
  import { filtersFromQuery } from '../lib/query.js';
  import { matchStory, facets } from '../lib/filter.js';
  import { t, tn } from '../lib/i18n/index.svelte.js';

  let { stories = [] } = $props();

  const PRIORITIES = ['must', 'should', 'could', 'wont'];
  const SORT_KEYS = ['id', 'title', 'priority', 'points', 'status'];

  let filters = $derived(filtersFromQuery(route.query));
  let options = $derived(facets(stories));
  let count = $derived(stories.filter((s) => matchStory(s, filters)).length);
  let active = $derived(
    [filters.q, filters.prio.length, filters.who, filters.epic, filters.sort].filter(Boolean).length
  );

  function togglePriority(p) {
    const next = filters.prio.includes(p) ? filters.prio.filter((x) => x !== p) : [...filters.prio, p];
    setQuery({ prio: next });
  }
  const onSelect = (key) => (e) => setQuery({ [key]: e.currentTarget.value });
  const toggleDir = () => setQuery({ dir: filters.dir === 'desc' ? null : 'desc' });
  const reset = () => active && setQuery({ q: null, prio: null, who: null, epic: null, sort: null, dir: null });
</script>

<form class="filter-bar" role="search" aria-label={t('common.filter.label')} onsubmit={(e) => e.preventDefault()}>
  <div class="fb-group" role="group" aria-labelledby="fb-prio">
    <span class="fb-label" id="fb-prio">{t('common.filter.priority')}</span>
    <div class="fb-chips">
      {#each PRIORITIES as p}
        <button
          type="button"
          class="fb-chip"
          aria-pressed={filters.prio.includes(p)}
          onclick={() => togglePriority(p)}>{t(`priority.${p}`)}</button>
      {/each}
    </div>
  </div>

  <label class="fb-field">
    <span class="fb-label">{t('common.filter.assignee')}</span>
    <select value={filters.who} onchange={onSelect('who')}>
      <option value="">{t('common.filter.all')}</option>
      {#each options.assignees as a}<option value={a}>{a}</option>{/each}
    </select>
  </label>

  <label class="fb-field">
    <span class="fb-label">{t('common.filter.epic')}</span>
    <select value={filters.epic} onchange={onSelect('epic')}>
      <option value="">{t('common.filter.all')}</option>
      {#each options.epics as e}<option value={e}>{e}</option>{/each}
    </select>
  </label>

  <div class="fb-field">
    <label class="fb-label" for="fb-sort">{t('common.sort.label')}</label>
    <div class="fb-sort">
      <select id="fb-sort" value={filters.sort} onchange={onSelect('sort')}>
        <option value="">{t('common.sort.default')}</option>
        {#each SORT_KEYS as k}<option value={k}>{t(`common.sort.key.${k}`)}</option>{/each}
      </select>
      <button type="button" class="fb-btn" title={t('common.sort.toggle')} onclick={toggleDir}>
        <span aria-hidden="true">{filters.dir === 'desc' ? '↓' : '↑'}</span>
        {filters.dir === 'desc' ? t('common.sort.desc') : t('common.sort.asc')}
      </button>
    </div>
  </div>

  <!-- aria-disabled, not disabled: a disabled button would drop the keyboard focus right after the reset. -->
  <button type="button" class="fb-btn fb-reset" aria-disabled={active === 0} onclick={reset}>
    {t('common.filter.clear')}
  </button>

  <p class="fb-count" role="status">
    {count === 0 ? t('common.filter.noResults') : tn('a11y.filterResults', count)}
  </p>
</form>

<style>
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 10px 16px;
    min-width: 0;
    padding: 10px 16px;
    border-bottom: 1px solid var(--border-faint);
  }
  .fb-group,
  .fb-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    max-width: 100%;
  }
  @media (min-width: 981px) {
    .filter-bar {
      padding: 10px 22px;
    }
  }
  .fb-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--fg-dim);
  }
  .fb-chips,
  .fb-sort {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .fb-sort select {
    flex: 1 1 auto;
    min-width: 0;
  }
  .fb-chip,
  .fb-btn {
    min-height: 32px;
    padding: 4px 12px;
    border: 1px solid var(--border-control);
    border-radius: var(--radius-sm);
    background: var(--bg-elev);
    color: var(--fg);
    font-size: 0.8125rem;
  }
  /* Apparence commune dans app.css ; ici, le fond des puces voisines. */
  select {
    max-width: 100%;
    background-color: var(--bg-elev);
  }
  .fb-chip[aria-pressed='true'] {
    background: var(--accent-soft);
    border-color: var(--accent);
  }
  .fb-chip:hover,
  .fb-btn:hover:not([aria-disabled='true']) {
    background: var(--bg-elev-2);
  }
  .fb-btn[aria-disabled='true'] {
    color: var(--fg-faint);
    cursor: not-allowed;
  }
  .fb-count {
    margin-left: auto;
    align-self: center;
    font-size: 0.8125rem;
    color: var(--fg-dim);
  }
  /* Contrastes forcés : le fond du filtre actif et le gris du bouton indisponible disparaissent. */
  @media (forced-colors: active) {
    .fb-chip[aria-pressed='true'] {
      border: 3px solid CanvasText;
      padding: 2px 10px;
    }
    .fb-btn[aria-disabled='true'] {
      color: GrayText;
      border-color: GrayText;
    }
  }
</style>

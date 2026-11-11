<script>
  import { untrack } from 'svelte';
  import { store } from '../lib/store.svelte.js';
  import { tweaks } from '../lib/tweaks.svelte.js';
  import { palette } from '../lib/palette.svelte.js';
  import { t, tn, fmtDate, fmtNumber } from '../lib/i18n/index.svelte.js';
  import { request, latestOnly, isAbort, errorKey } from '../lib/api.js';
  import { velocityRows, averageVelocity, forecastSprints, remainingPoints } from '../lib/velocity.js';
  import { alignBurndownByDate, buildSeries, normalizeOnTrack } from '../lib/burndown.js';
  import { focusable } from '../lib/actions.js';
  import Icon from '../components/Icon.svelte';
  import uPlot from 'uplot';
  import 'uplot/dist/uPlot.min.css';

  const HEIGHT = 320;
  const TRACK_ICON = { 'on-track': 'check', 'at-risk': 'warn', behind: 'warn' };

  // Rows joined by DATE (bug #8: they were paired by array index, but `actual` is event-driven).
  const tableRows = $derived(alignBurndownByDate(store.burndown?.ideal ?? [], store.burndown?.actual ?? []));
  const series = $derived(buildSeries(store.burndown?.ideal ?? [], store.burndown?.actual ?? []));
  const hasData = $derived(store.burndown?.ideal?.length > 0);
  const onTrack = $derived(normalizeOnTrack(store.burndown?.on_track));
  const sprintName = $derived(store.sprint?.name || t('burndown.currentSprint'));
  const day = (iso) => fmtDate(iso, { dateStyle: 'medium' });

  let chartContainer = $state(null);

  // ---- velocity: closed sprints (GET /api/velocity), reloaded with the store ----
  const runVelocity = latestOnly();
  let velocity = $state({ sprints: [] });
  let velocityLoaded = $state(false);
  let velocityError = $state(null);
  let velocityContainer = $state(null);

  const rows = $derived(velocityRows(velocity.sprints));
  const average = $derived(averageVelocity(rows));
  const remaining = $derived(remainingPoints(store.stories));
  const forecast = $derived(forecastSprints(remaining, average));
  const sprintLabel = (row) => `#${/^sprint-(\d+)/.exec(row.id)?.[1] ?? row.id}`;

  async function loadVelocity() {
    const ticket = runVelocity();
    try {
      const data = await request('/api/velocity', { signal: ticket.signal });
      if (!ticket.current) return;
      velocity = { sprints: data.sprints ?? [] };
      velocityError = null;
    } catch (err) {
      if (isAbort(err) || !ticket.current) return;
      velocityError = errorKey(err);
    }
    if (ticket.current) velocityLoaded = true;
  }

  $effect(() => {
    store.revision;
    untrack(loadVelocity);
  });

  // Committed bars are outlines, delivered bars are filled: told apart by shape, not by colour alone.
  $effect(() => {
    tweaks.accent;
    palette.version;
    if (!velocityContainer || rows.length === 0) return;

    const cs = getComputedStyle(velocityContainer);
    const tok = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
    const cFaint = tok('--fg-dim', '#aaa');
    const cAccent = tok('--accent', '#bdf03d');
    const cGrid = tok('--border-faint', '#333');
    const axis = { stroke: cFaint, grid: { stroke: cGrid }, ticks: { stroke: cGrid } };
    const ticks = rows.map((_, i) => i);
    const bars = (align) => uPlot.paths.bars({ size: [0.42, 64], align });

    const opts = {
      width: velocityContainer.clientWidth || 800,
      height: 260,
      scales: { x: { time: false, range: () => [-0.7, rows.length - 0.3] }, y: { range: (u, min, max) => [0, Math.max(max, 1) * 1.15] } },
      axes: [{ ...axis, splits: () => ticks, values: () => rows.map(sprintLabel) }, axis],
      series: [
        { label: t('burndown.velocity.table.sprint') },
        { label: t('burndown.velocity.committed'), stroke: cFaint, fill: 'transparent', width: 2, paths: bars(-1), points: { show: false } },
        { label: t('burndown.velocity.delivered'), stroke: cAccent, fill: cAccent, width: 1, paths: bars(1), points: { show: false } },
      ],
      legend: { show: false },
      cursor: { show: false },
    };
    const chart = new uPlot(opts, [ticks, rows.map((r) => r.committed), rows.map((r) => r.delivered)], velocityContainer);
    const resize = new ResizeObserver(() => chart.setSize({ width: velocityContainer.clientWidth, height: 260 }));
    resize.observe(velocityContainer);

    return () => {
      resize.disconnect();
      chart.destroy();
    };
  });

  // The chart is rebuilt when the data, the accent (Tweaks) or the language change (t() reads the catalog): uPlot draws on a
  // canvas, so the tokens are read as computed values at build time. The instance is a local of the
  // effect (never $state: reading and writing it here made the effect depend on its own write).
  $effect(() => {
    tweaks.accent;
    palette.version;
    if (!chartContainer || !hasData) return;

    const cs = getComputedStyle(chartContainer);
    const tok = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
    const cFaint = tok('--fg-dim', '#aaa');
    const cAccent = tok('--accent', '#bdf03d');
    const cGrid = tok('--border-faint', '#333');
    const axis = { stroke: cFaint, grid: { stroke: cGrid }, ticks: { stroke: cGrid } };
    const dateLabel = (v) => fmtDate(new Date(v * 1000).toISOString().slice(0, 10), { day: '2-digit', month: '2-digit' });

    const opts = {
      width: chartContainer.clientWidth || 800,
      height: HEIGHT,
      scales: { x: { time: true } },
      axes: [{ ...axis, values: (u, vals) => vals.map(dateLabel) }, axis],
      series: [
        { label: t('burndown.series.date') },
        // Ideal: dashed, thin, no markers. Actual: solid, thick, with markers (not told apart by colour only).
        { label: t('burndown.legend.ideal'), stroke: cFaint, width: 1.5, dash: [6, 6], points: { show: false } },
        // spanGaps: the actual series is event-driven, so it has holes between measures (bug #5).
        { label: t('burndown.legend.actual'), stroke: cAccent, width: 3, spanGaps: true, points: { show: true, size: 7, fill: cAccent, stroke: cAccent } },
      ],
      legend: { show: false },
    };
    const chart = new uPlot(opts, [series.timestamps, series.ideal, series.actual], chartContainer);
    const resize = new ResizeObserver(() => chart.setSize({ width: chartContainer.clientWidth, height: HEIGHT }));
    resize.observe(chartContainer);

    return () => {
      resize.disconnect();
      chart.destroy();
    };
  });
</script>

<div class="view-pad" aria-busy={store.loading || store.sprintLoading}>
  <h2 class="sr-only">{t('nav.burndown')}</h2>
  <div class="burn-wrap">
    {#if store.loading || store.sprintLoading}
      <div class="empty" role="status">{t('common.loading')}</div>
    {:else if !hasData}
      <div class="empty">{t('burndown.empty')}</div>
    {:else}
      <div class="burn-card">
        <header class="burn-header">
          <h3>{sprintName}</h3>
          <div class="meta">
            <span class="on-track-badge is-{onTrack}">
              {#if TRACK_ICON[onTrack]}<Icon name={TRACK_ICON[onTrack]} size={13} />{/if}{t(`burndown.status.${onTrack}`)}
            </span>
            <span>{t('burndown.total', { n: store.burndown.total_points })}</span>
          </div>
        </header>

        <ul class="burn-legend">
          <li class="k"><span class="swatch swatch-ideal" aria-hidden="true"></span>{t('burndown.legend.ideal')}</li>
          <li class="k"><span class="swatch swatch-actual" aria-hidden="true"></span>{t('burndown.legend.actual')}</li>
        </ul>

        <!-- role=img : alternative accessible au canvas (WCAG 1.1.1). Les mêmes données sont dans le tableau ci-dessous. -->
        <div class="chart-wrapper" bind:this={chartContainer} role="img" aria-label={t('burndown.chart.label', { sprint: sprintName })}></div>

        <details class="burn-data">
          <summary>{t('burndown.data.show')}</summary>
          <div class="table-scroll" role="region" use:focusable aria-label={t('burndown.table.label')}>
            <table>
              <caption class="sr-only">{t('burndown.table.caption')}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('burndown.table.date')}</th>
                  <th scope="col" class="num">{t('burndown.table.ideal')}</th>
                  <th scope="col" class="num">{t('burndown.table.actual')}</th>
                </tr>
              </thead>
              <tbody>
                {#each tableRows as row (row.date)}
                  <tr>
                    <th scope="row">{day(row.date)}</th>
                    <td class="num mono">{row.ideal ?? '—'}</td>
                    <td class="num mono">{row.actual ?? '—'}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    {/if}

    <section class="velocity" aria-labelledby="velocity-title" aria-busy={!velocityLoaded}>
      <h3 id="velocity-title">{t('burndown.velocity.title')}</h3>
      {#if !velocityLoaded}
        <p class="empty-note" role="status">{t('common.loading')}</p>
      {:else if velocityError}
        <div role="alert">
          <p>{t(velocityError)}</p>
          <button type="button" class="btn" onclick={loadVelocity}>{t('common.retry')}</button>
        </div>
      {:else if rows.length === 0}
        <p class="empty-note">{t('burndown.velocity.empty')}</p>
      {:else}
        <div class="vel-summary">
          <p class="vel-average">{t('burndown.velocity.average', { n: fmtNumber(average) })}</p>
          <p>{t('burndown.velocity.remaining', { n: fmtNumber(remaining) })}</p>
          <p class="vel-forecast">
            {#if forecast === null}{t('burndown.velocity.forecast.none')}
            {:else if forecast === 0}{t('burndown.velocity.forecast.done')}
            {:else}{tn('burndown.velocity.forecast', forecast)}{/if}
          </p>
        </div>

        <ul class="burn-legend">
          <li class="k"><span class="swatch swatch-committed" aria-hidden="true"></span>{t('burndown.velocity.committed')}</li>
          <li class="k"><span class="swatch swatch-delivered" aria-hidden="true"></span>{t('burndown.velocity.delivered')}</li>
        </ul>

        <div class="chart-wrapper vel-chart" bind:this={velocityContainer} role="img" aria-label={t('burndown.velocity.chart.label')}></div>

        <div class="table-scroll vel-data" role="region" use:focusable aria-label={t('burndown.velocity.table.label')}>
          <table>
            <caption class="sr-only">{t('burndown.velocity.table.caption')}</caption>
            <thead>
              <tr>
                <th scope="col">{t('burndown.velocity.table.sprint')}</th>
                <th scope="col">{t('burndown.velocity.table.closed')}</th>
                <th scope="col" class="num">{t('burndown.velocity.committed')}</th>
                <th scope="col" class="num">{t('burndown.velocity.delivered')}</th>
              </tr>
            </thead>
            <tbody>
              {#each rows as row (row.id)}
                <tr>
                  <th scope="row">{row.name || row.id}</th>
                  <td>{row.closed_date ? day(row.closed_date) : '—'}</td>
                  <td class="num mono">{row.committed}</td>
                  <td class="num mono">{row.delivered}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </section>
  </div>
</div>

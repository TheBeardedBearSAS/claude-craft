<script>
  import { store } from '../lib/store.svelte.js';
  import { tweaks } from '../lib/tweaks.svelte.js';
  import { t, fmtDate } from '../lib/i18n/index.svelte.js';
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

  // The chart is rebuilt when the data, the accent (Tweaks) or the language change (t() reads the catalog): uPlot draws on a
  // canvas, so the tokens are read as computed values at build time. The instance is a local of the
  // effect (never $state: reading and writing it here made the effect depend on its own write).
  $effect(() => {
    tweaks.accent;
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

<div class="view-pad" aria-busy={store.loading}>
  <h2 class="sr-only">{t('nav.burndown')}</h2>
  <div class="burn-wrap">
    {#if store.loading}
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
  </div>
</div>

<script>
  import { store } from '../lib/store.svelte.js';
  import uPlot from 'uplot';
  import 'uplot/dist/uPlot.min.css';

  let chartContainer = $state(null);
  let chart = $state(null);

  const hasData = $derived(store.burndown?.ideal?.length > 0);

  const onTrackColor = $derived.by(() => {
    if (store.burndown?.on_track === 'on-track') return 'var(--success)';
    if (store.burndown?.on_track === 'at-risk') return 'var(--warning)';
    if (store.burndown?.on_track === 'behind') return 'var(--danger)';
    return 'var(--fg-dim)';
  });

  $effect(() => {
    if (!chartContainer || !hasData) {
      if (chart) {
        chart.destroy();
        chart = null;
      }
      return;
    }

    // Canvas ne résout pas var(--x) : on lit les valeurs calculées des tokens.
    const cs = getComputedStyle(chartContainer);
    const tok = (name, fb) => cs.getPropertyValue(name).trim() || fb;
    const cFaint = tok('--fg-faint', '#888');
    const cAccent = tok('--accent', '#bdf03d');
    const cGrid = tok('--border-faint', '#333');

    const idealData = store.burndown.ideal.map((p) => ({ ts: Math.floor(Date.parse(p.date) / 1000), pts: p.points }));
    const actualData = store.burndown.actual.map((p) => ({ ts: Math.floor(Date.parse(p.date) / 1000), pts: p.points }));

    const allTimestamps = new Set([...idealData.map((p) => p.ts), ...actualData.map((p) => p.ts)]);
    const timestamps = Array.from(allTimestamps).sort((a, b) => a - b);
    const idealValues = timestamps.map((ts) => idealData.find((p) => p.ts === ts)?.pts ?? null);
    const actualValues = timestamps.map((ts) => actualData.find((p) => p.ts === ts)?.pts ?? null);

    const data = [timestamps, idealValues, actualValues];

    const opts = {
      width: chartContainer.clientWidth || 800,
      height: 320,
      scales: { x: { time: true } },
      axes: [
        {
          stroke: cFaint,
          grid: { stroke: cGrid },
          ticks: { stroke: cGrid },
          values: (u, vals) => vals.map((v) => {
            const d = new Date(v * 1000);
            return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
          }),
        },
        { stroke: cFaint, grid: { stroke: cGrid }, ticks: { stroke: cGrid } },
      ],
      series: [
        { label: 'Date' },
        { label: 'Ideal', stroke: cFaint, width: 1.5, dash: [5, 5], points: { show: false } },
        { label: 'Actual', stroke: cAccent, width: 3, points: { show: true, size: 6, fill: cAccent, stroke: cAccent } },
      ],
      legend: { show: true },
    };

    if (chart) chart.destroy();
    chart = new uPlot(opts, data, chartContainer);

    const resizeObserver = new ResizeObserver(() => {
      if (chart && chartContainer) chart.setSize({ width: chartContainer.clientWidth, height: 320 });
    });
    resizeObserver.observe(chartContainer);

    return () => {
      resizeObserver.disconnect();
      if (chart) {
        chart.destroy();
        chart = null;
      }
    };
  });
</script>

<div class="view-pad">
  <div class="burn-wrap">
    {#if !store.burndown || !hasData}
      <div class="empty">No burndown data (sprint not started or no start/end date)</div>
    {:else}
      <div class="burn-card">
        <header class="burn-header">
          <h2>{store.sprint?.name || 'Current Sprint'}</h2>
          <div class="meta">
            <span class="on-track-badge" style="background: color-mix(in oklch, {onTrackColor} 16%, transparent); color: {onTrackColor}">
              {store.burndown.on_track || 'unknown'}
            </span>
            <span>{store.burndown.total_points}p total</span>
          </div>
        </header>

        <div class="burn-legend">
          <span class="k"><i style="background: var(--fg-faint)"></i> Idéal</span>
          <span class="k"><i style="background: var(--accent)"></i> Réel</span>
        </div>

        <!--
          role=img + aria-label : alternative accessible pour le canvas uPlot (WCAG SC 1.1.1, 1.4.5).
          Le tableau sr-only fournit les données brutes aux lecteurs d'écran.
        -->
        <div
          class="chart-wrapper"
          bind:this={chartContainer}
          role="img"
          aria-label="Graphique de burndown du sprint {store.sprint?.name || 'courant'} : idéal vs réel"
          aria-describedby="burndown-data-table"
        ></div>

        <table class="sr-only" id="burndown-data-table" aria-label="Données du burndown">
          <caption>Burndown — idéal vs réel</caption>
          <thead>
            <tr><th scope="col">Date</th><th scope="col">Points idéal</th><th scope="col">Points réel</th></tr>
          </thead>
          <tbody>
            {#each store.burndown?.ideal ?? [] as point, i}
              <tr><td>{point.date}</td><td>{point.points}</td><td>{store.burndown?.actual?.[i]?.points ?? '—'}</td></tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>

<style>
  .chart-wrapper { min-height: 320px; }
</style>

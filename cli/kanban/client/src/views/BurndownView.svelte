<script>
  import { store } from '../lib/store.svelte.js';
  import uPlot from 'uplot';
  import 'uplot/dist/uPlot.min.css';

  let chartContainer = $state(null);
  let chart = $state(null);

  const hasData = $derived(store.burndown?.ideal?.length > 0);

  const onTrackColor = $derived.by(() => {
    if (!store.burndown?.on_track) return 'var(--fg-dim)';
    if (store.burndown.on_track === 'on-track') return 'var(--ok)';
    if (store.burndown.on_track === 'at-risk') return 'var(--warn)';
    if (store.burndown.on_track === 'behind') return 'var(--danger)';
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

    const idealData = store.burndown.ideal.map(p => ({
      ts: Math.floor(Date.parse(p.date) / 1000),
      pts: p.points
    }));

    const actualData = store.burndown.actual.map(p => ({
      ts: Math.floor(Date.parse(p.date) / 1000),
      pts: p.points
    }));

    const allTimestamps = new Set([
      ...idealData.map(p => p.ts),
      ...actualData.map(p => p.ts)
    ]);
    const timestamps = Array.from(allTimestamps).sort((a, b) => a - b);

    const idealValues = timestamps.map(ts => {
      const point = idealData.find(p => p.ts === ts);
      return point ? point.pts : null;
    });

    const actualValues = timestamps.map(ts => {
      const point = actualData.find(p => p.ts === ts);
      return point ? point.pts : null;
    });

    const data = [
      timestamps,
      idealValues,
      actualValues
    ];

    const opts = {
      width: chartContainer.clientWidth || 800,
      height: 300,
      scales: {
        x: { time: true }
      },
      axes: [
        {
          stroke: 'var(--fg-dim)',
          grid: { stroke: 'var(--border)' },
          values: (u, vals) => vals.map(v => {
            const d = new Date(v * 1000);
            return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
          })
        },
        {
          stroke: 'var(--fg-dim)',
          grid: { stroke: 'var(--border)' }
        }
      ],
      series: [
        { label: 'Date' },
        {
          label: 'Ideal',
          stroke: 'var(--fg-dim)',
          width: 2,
          dash: [5, 5],
          points: { show: false }
        },
        {
          label: 'Actual',
          stroke: 'var(--accent)',
          width: 3,
          points: { show: true, size: 5, fill: 'var(--accent)' }
        }
      ],
      legend: {
        show: true
      }
    };

    if (chart) chart.destroy();
    chart = new uPlot(opts, data, chartContainer);

    const resizeObserver = new ResizeObserver(() => {
      if (chart && chartContainer) {
        chart.setSize({ width: chartContainer.clientWidth, height: 300 });
      }
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

<div class="burndown">
  {#if !store.burndown || !hasData}
    <div class="empty">No burndown data (sprint not started or no start/end date)</div>
  {:else}
    <header class="burndown-header">
      <h2 class="sprint-name">{store.sprint?.name || 'Current Sprint'}</h2>
      <div class="meta">
        <span class="on-track-badge" style="background: {onTrackColor}">
          {store.burndown.on_track || 'unknown'}
        </span>
        <span class="total-points">{store.burndown.total_points}p total</span>
      </div>
    </header>

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

    <!-- Tableau de données sr-only : accès aux valeurs numériques sans graphique -->
    <table class="sr-only" id="burndown-data-table" aria-label="Données du burndown">
      <caption>Burndown — idéal vs réel</caption>
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Points idéal</th>
          <th scope="col">Points réel</th>
        </tr>
      </thead>
      <tbody>
        {#each store.burndown?.ideal ?? [] as point, i}
          <tr>
            <td>{point.date}</td>
            <td>{point.points}</td>
            <td>{store.burndown?.actual?.[i]?.points ?? '—'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .burndown {
    max-width: 1200px;
    margin: 0 auto;
  }

  .burndown-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .sprint-name {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
    color: var(--fg);
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .on-track-badge {
    text-transform: uppercase;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 12px;
    color: var(--badge-fg);
  }

  .total-points {
    font-family: var(--mono);
    font-size: 13px;
    color: var(--fg-dim);
    font-weight: 600;
  }

  .chart-wrapper {
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    box-shadow: var(--shadow);
    min-height: 340px;
  }

  /* Accessible uniquement aux lecteurs d'écran */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>

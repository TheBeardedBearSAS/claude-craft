<script>
  import { t } from '../lib/i18n/index.svelte.js';
  import { capacityState } from '../lib/sprint-plan.js';
  import Icon from './Icon.svelte';

  /**
   * Committed points against the capacity of a sprint. Everything is said in text (and an icon for "at" / "over"):
   * the coloured bar is decoration only (WCAG 1.4.1).
   * @type {{ committed: number, capacity: number|null|undefined }}
   */
  let { committed, capacity } = $props();

  const cap = $derived(capacityState(committed, capacity));
  const pct = $derived(cap.capacity ? Math.min(100, Math.round((cap.committed / cap.capacity) * 100)) : 0);
  const headline = $derived(
    cap.state === 'none'
      ? `${t('sprint.capacity.none')} · ${t('common.points', { n: cap.committed })}`
      : t('sprint.capacity.committed', { committed: cap.committed, capacity: cap.capacity })
  );
  const detail = $derived(
    {
      under: () => `${t('sprint.capacity.ok')} · ${t('sprint.capacity.left', { n: cap.remaining })}`,
      at: () => t('sprint.capacity.at'),
      over: () => `${t('sprint.capacity.over')} · ${t('sprint.capacity.exceeded', { n: -cap.remaining })}`,
      none: () => '',
    }[cap.state]()
  );
</script>

<div class="capacity" data-state={cap.state}>
  <div class="cap-line">
    <span class="cap-label">{t('sprint.capacity.label')}</span>
    <span class="cap-text mono">{headline}</span>
  </div>
  {#if cap.state !== 'none'}
    <div class="cap-track" aria-hidden="true"><span style:width="{pct}%"></span></div>
    <p class="cap-state">
      {#if cap.state === 'over'}<Icon name="warn" size={14} />{:else if cap.state === 'at'}<Icon name="check" size={14} />{/if}
      <span>{detail}</span>
    </p>
  {/if}
</div>

<style>
  .capacity { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  .cap-line { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; }
  .cap-label { font-size: 0.75rem; font-weight: 600; color: var(--fg-dim); text-transform: uppercase; letter-spacing: 0.04em; }
  .cap-text { font-size: 0.8125rem; }
  .cap-track { height: 8px; border-radius: 99px; background: var(--bg-inset); border: 1px solid var(--border-control); overflow: hidden; }
  .cap-track span { display: block; height: 100%; background: var(--accent); }
  .capacity[data-state='over'] .cap-track span { background: var(--danger); }
  .capacity[data-state='at'] .cap-track span { background: var(--warning); }
  .cap-state { margin: 0; display: inline-flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--fg-dim); }
  .capacity[data-state='over'] .cap-state { color: var(--danger); font-weight: 600; }
</style>

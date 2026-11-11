<script>
  import { t } from '../lib/i18n/index.svelte.js';

  /** @type {{ pct?: number, size?: number, sw?: number, color?: string, label?: string }} */
  let { pct = 0, size = 40, sw = 4, color = 'var(--accent)', label = '' } = $props();
  let name = $derived(label || t('a11y.progress', { pct: Math.round(pct) }));
  let r = $derived((size - sw) / 2);
  let c = $derived(2 * Math.PI * r);
  let offset = $derived(c * (1 - Math.max(0, Math.min(100, pct)) / 100));
</script>

<span class="ring-wrap" role="img" aria-label={name} style="width:{size}px; height:{size}px;">
  <svg width={size} height={size} aria-hidden="true">
    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-inset)" stroke-width={sw} />
    <circle
      cx={size / 2}
      cy={size / 2}
      r={r}
      fill="none"
      stroke={color}
      stroke-width={sw}
      stroke-linecap="round"
      stroke-dasharray={c}
      stroke-dashoffset={offset}
      transform="rotate(-90 {size / 2} {size / 2})"
      style="transition: stroke-dashoffset .5s ease;"
    />
  </svg>
  <span class="ring-txt" aria-hidden="true" style="color:{color};">{Math.round(pct)}</span>
</span>

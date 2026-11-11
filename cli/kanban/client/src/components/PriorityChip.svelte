<script>
  import { PRIORITY } from '../lib/config.js';
  import { t } from '../lib/i18n/index.svelte.js';

  /** @type {{ priority?: string }} */
  let { priority } = $props();
  let p = $derived(PRIORITY[priority]);
  let cv = $derived(p ? `var(${p.cssVar})` : 'var(--fg-faint)');
</script>

{#if p}
  <span
    class="chip"
    style="background: color-mix(in oklch, {cv} 16%, transparent); color: {cv}; border-color: color-mix(in oklch, {cv} 32%, transparent);"
  ><span class="sr-only">{t('a11y.card.priority', { priority: t(`priority.${priority}`) })}</span><span aria-hidden="true"
    >{t(`priority.${priority}`)}</span
  ></span>
{/if}

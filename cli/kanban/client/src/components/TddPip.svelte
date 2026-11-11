<script>
  import { TDD } from '../lib/config.js';
  import { t } from '../lib/i18n/index.svelte.js';

  /** @type {{ phase?: string }} */
  let { phase } = $props();
  let known = $derived(TDD[phase]);
  let cv = $derived(known ? `var(${known.cssVar})` : null);
  let label = $derived(known ? t(`tdd.${phase}`) : '');
</script>

{#if known}
  <span class="tdd-pip" style="background: color-mix(in oklch, {cv} 15%, transparent); color: {cv};">
    <i style="background: {cv};" aria-hidden="true"></i>
    <span aria-hidden="true">{label}</span>
    <span class="sr-only">{t('a11y.tddPhase', { phase: label })}</span>
  </span>
{/if}

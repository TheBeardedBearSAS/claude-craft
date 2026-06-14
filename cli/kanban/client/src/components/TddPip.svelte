<script>
  import { TDD } from '../lib/config.js';

  /** @type {{ phase?: string }} */
  let { phase } = $props();
  let t = $derived(TDD[phase]);
  let cv = $derived(t ? `var(${t.cssVar})` : null);
</script>

{#if t}
  <span
    class="tdd-pip"
    aria-label={`Phase TDD : ${t.label}`}
    style="background: color-mix(in oklch, {cv} 15%, transparent); color: {cv};"
  ><i style="background: {cv};"></i>{t.label}</span>
{/if}

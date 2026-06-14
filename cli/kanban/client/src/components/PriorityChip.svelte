<script>
  import { PRIORITY } from '../lib/config.js';

  /** @type {{ priority?: string }} */
  let { priority } = $props();
  let p = $derived(PRIORITY[priority]);
  let cv = $derived(p ? `var(${p.cssVar})` : 'var(--fg-faint)');
</script>

{#if p}
  <span
    class="chip"
    style="background: color-mix(in oklch, {cv} 16%, transparent); color: {cv}; border-color: color-mix(in oklch, {cv} 32%, transparent);"
  >{p.label}</span>
{/if}

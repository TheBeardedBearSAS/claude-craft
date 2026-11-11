<script>
  import { t, tn } from '../lib/i18n/index.svelte.js';

  /** @type {{ value?: number | null }} */
  let { value } = $props();
  const known = $derived(value !== undefined && value !== null);
</script>

<span class="points mono">
  <span aria-hidden="true">{known ? value : '–'}</span>
  <span class="sr-only">{known ? tn('a11y.card.points', value) : t('a11y.card.noPoints')}</span>
</span>

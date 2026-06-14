<script>
  import { ICONS } from '../lib/icons.js';

  /**
   * @typedef {Object} Props
   * @property {string} name  clé dans ICONS
   * @property {number} [size]
   * @property {number} [sw]   stroke-width
   * @property {string} [cls]  classes CSS additionnelles
   */
  let { name, size = 18, sw = 1.7, cls = '' } = $props();
  let inner = $derived(ICONS[name] ?? '');
</script>

<svg
  class={cls}
  viewBox="0 0 24 24"
  width={size}
  height={size}
  fill="none"
  stroke="currentColor"
  stroke-width={sw}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>{@html inner}</svg>

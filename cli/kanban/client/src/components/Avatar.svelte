<script>
  import { initials, avatarColor } from '../lib/config.js';
  import { t } from '../lib/i18n/index.svelte.js';
  import Icon from './Icon.svelte';

  /** @type {{ id?: string, size?: number }} */
  let { id = '', size = 28 } = $props();
  const label = $derived(id ? t('a11y.assignedTo', { name: id }) : t('a11y.unassigned'));
</script>

{#if id}
  <span
    class="avatar"
    role="img"
    title={label}
    aria-label={label}
    style="width:{size}px; height:{size}px; background:{avatarColor(id)}; font-size:{size * 0.38}px;"
  >{initials(id)}</span>
{:else}
  <span
    class="avatar avatar-empty"
    role="img"
    title={label}
    aria-label={label}
    style="width:{size}px; height:{size}px;"
  >
    <Icon name="person" size={size * 0.5} />
  </span>
{/if}

<script>
  import { initials, avatarColor } from '../lib/config.js';
  import Icon from './Icon.svelte';

  /** @type {{ id?: string, size?: number }} */
  let { id = '', size = 28 } = $props();
</script>

{#if id}
  <span
    class="avatar"
    title={id}
    aria-label={`Assigné à : ${id}`}
    style="width:{size}px; height:{size}px; background:{avatarColor(id)}; font-size:{size * 0.38}px;"
  >{initials(id)}</span>
{:else}
  <span
    class="avatar avatar-empty"
    title="Non assigné"
    aria-label="Non assigné"
    style="width:{size}px; height:{size}px;"
  >
    <Icon name="person" size={size * 0.5} />
  </span>
{/if}

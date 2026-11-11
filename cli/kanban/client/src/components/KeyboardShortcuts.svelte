<script>
  /** Liste des raccourcis clavier du board — partagée par le board et le panneau Réglages. */
  import { BOARD_SHORTCUTS } from '../lib/board-card.js';
  import { t } from '../lib/i18n/index.svelte.js';
</script>

<ul class="kbd-list">
  {#each BOARD_SHORTCUTS as shortcut (shortcut.label)}
    <li>
      <span class="kbd-keys">
        {#each shortcut.keys as key, i}{#if i > 0}<span class="kbd-or" aria-hidden="true">/</span>{/if}<kbd class="kbd-inline">{key}</kbd>{/each}
      </span>
      <span>{t(shortcut.label)}</span>
    </li>
  {/each}
</ul>

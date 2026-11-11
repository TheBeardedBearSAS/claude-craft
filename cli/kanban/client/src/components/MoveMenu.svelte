<script>
  /**
   * Menu « Déplacer » d'une carte (WAI-ARIA menu). Ne propose que les cibles déjà filtrées par l'appelant
   * (allowedTargets). Ce composant gère les flèches / Début / Fin et Tab ; Entrée et Espace sont ceux des
   * boutons natifs ; Échap, chiffres, clic extérieur et Alt+M sont gérés par la vue (board-nav.js).
   */
  import { onMount } from 'svelte';
  import { STATUSES } from '../../../shared/transitions.js';
  import { t } from '../lib/i18n/index.svelte.js';

  /** @type {{ storyId: string, targets: string[], onmove: (status:string)=>void, onclose: ()=>void }} */
  let { storyId, targets, onmove, onclose } = $props();

  let listEl = $state(null);
  const items = () => [...listEl.querySelectorAll('[role="menuitem"]')];

  onMount(() => {
    items()[0]?.focus();
    listEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });

  function onKeydown(e) {
    const all = items();
    const at = all.indexOf(document.activeElement);
    const next = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: all.length - 1 }[e.key];
    if (e.key === 'Tab') onclose();
    else if (next === undefined) return;
    else all[(next + all.length) % all.length]?.focus();
    e.preventDefault();
  }
</script>

<ul class="move-menu" role="menu" aria-label={t('board.move.title', { id: storyId })} bind:this={listEl} onkeydown={onKeydown}>
  {#each targets as status (status)}
    {@const n = STATUSES.indexOf(status) + 1}
    <li role="none">
      <button type="button" role="menuitem" tabindex="-1" aria-keyshortcuts={String(n)} onclick={() => onmove(status)}>
        <kbd class="mono" aria-hidden="true">{n}</kbd>{t(`status.${status}`)}
      </button>
    </li>
  {/each}
</ul>

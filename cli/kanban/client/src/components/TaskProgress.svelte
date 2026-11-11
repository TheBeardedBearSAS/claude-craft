<script>
  import { t } from '../lib/i18n/index.svelte.js';

  /**
   * Tâches au format Svelte : { total, completed }.
   * `status` réconcilie le compteur : une story `done` dont le compteur de
   * tâches n'a pas été recalé (cas BMAD : TT-* terminées avec completed:0)
   * est affichée comme complète (bug #12) plutôt que trompeusement 0/N.
   * @type {{ tasks?: { total?: number, completed?: number }, status?: string }}
   */
  let { tasks, status = '' } = $props();
  let total = $derived(tasks?.total ?? 0);
  let done = $derived(status === 'done' && total > 0 ? total : (tasks?.completed ?? 0));
  let pct = $derived(total ? (done / total) * 100 : 0);
</script>

{#if total > 0}
  <span
    class="task-prog"
    role="progressbar"
    aria-label={t('a11y.tasksProgress', { done, total })}
    aria-valuenow={done}
    aria-valuemin={0}
    aria-valuemax={total}
  >
    <span class="bar" aria-hidden="true"><span style="width: {pct}%"></span></span><span aria-hidden="true">{done}/{total}</span>
  </span>
{/if}

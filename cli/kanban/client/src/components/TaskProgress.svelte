<script>
  /**
   * Tâches au format Svelte : { total, completed }.
   * @type {{ tasks?: { total?: number, completed?: number } }}
   */
  let { tasks } = $props();
  let total = $derived(tasks?.total ?? 0);
  let done = $derived(tasks?.completed ?? 0);
  let pct = $derived(total ? (done / total) * 100 : 0);
</script>

{#if total > 0}
  <span
    class="task-prog"
    role="progressbar"
    aria-label={`Tâches : ${done} sur ${total} complétées`}
    aria-valuenow={done}
    aria-valuemin={0}
    aria-valuemax={total}
  >
    <span class="bar"><span style="width: {pct}%"></span></span>{done}/{total}
  </span>
{/if}

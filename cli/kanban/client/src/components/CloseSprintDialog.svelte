<script>
  /**
   * "Close sprint" dialog: says what closing does (done stories are archived, the others are carried over) and asks
   * where the unfinished ones go. Mount once; `const carryOver = await dialog.open({ id, name })` resolves to
   * 'backlog', a planned sprint id, or null when cancelled. The caller does the API call.
   */
  import { t, tn } from '../lib/i18n/index.svelte.js';
  import { closeSummary } from '../lib/sprint-plan.js';
  import { focusLost } from '../lib/story-form.js';

  /** @type {{ stories: object[], planned: Array<{ id: string, name?: string }> }} */
  let { stories, planned } = $props();

  let dialog = $state(null);
  let sprint = $state({ id: '', name: '' });
  let carry = $state('backlog');
  let resolver = null;
  let triggerEl = null;

  const summary = $derived(closeSummary(stories, sprint.id));

  export function open(target) {
    triggerEl = document.activeElement;
    sprint = target;
    carry = 'backlog';
    settle(null); // a question still pending is over
    dialog?.showModal();
    return new Promise((resolve) => (resolver = resolve));
  }

  // The answer is taken when it is given, not on `close`: that event comes with the next rendered frame, when the
  // dialog may already be asking a new question (it would receive the first one's answer).
  function settle(value) {
    const resolve = resolver;
    resolver = null;
    resolve?.(value);
  }

  function answer(value) {
    const choice = value === 'confirm' ? carry : null;
    dialog.close();
    settle(choice);
  }

  // Escape (or any close that did not come from a button) is a cancel. The focus goes back to the button that asked
  // only if it was lost: the user may have reached another control while the frame was being rendered.
  function onClose() {
    if (dialog.open) return; // closed, then opened again before this event came: the new question owns the dialog
    settle(null);
    if (triggerEl && focusLost(document.activeElement, document.body, dialog)) triggerEl.focus();
    triggerEl = null;
  }
</script>

{#snippet storyList(list)}
  <ul class="cs-list">
    {#each list as s (s.id)}
      <li><span class="mono">{s.id}</span> {s.title} <span class="cs-pts mono">{t('common.points', { n: s.story_points ?? 0 })}</span></li>
    {/each}
  </ul>
{/snippet}

<dialog bind:this={dialog} class="close-sprint" aria-labelledby="cs-title" aria-describedby="cs-intro" onclose={onClose}>
  <h2 id="cs-title">{t('sprint.close.button')} <span class="mono">{sprint.name || sprint.id}</span></h2>
  <p id="cs-intro">{t('sprint.close.confirm', { sprint: sprint.name || sprint.id })}</p>
  <p class="cs-summary">{t('sprint.close.summary', { done: summary.done.length, total: summary.total })}</p>

  <section aria-labelledby="cs-done">
    <h3 id="cs-done">{t('sprint.close.archivedTitle')} ({summary.done.length} · {t('common.points', { n: summary.donePoints })})</h3>
    {#if summary.done.length > 0}{@render storyList(summary.done)}{:else}<p class="cs-none">{t('common.none')}</p>{/if}
  </section>

  <section aria-labelledby="cs-todo">
    <h3 id="cs-todo">{t('sprint.close.unfinishedTitle')} ({summary.unfinished.length} · {t('common.points', { n: summary.unfinishedPoints })})</h3>
    {#if summary.unfinished.length > 0}
      {@render storyList(summary.unfinished)}
      <fieldset class="cs-carry">
        <legend>{t('sprint.close.carryOver')}</legend>
        <label><input type="radio" name="carry-over" value="backlog" bind:group={carry} />{t('sprint.close.carryOver.backlog')}</label>
        {#each planned as p (p.id)}
          <label><input type="radio" name="carry-over" value={p.id} bind:group={carry} />{t('sprint.close.carryOver.sprint', { sprint: p.name || p.id })}</label>
        {/each}
      </fieldset>
    {:else}
      <p class="cs-none">{t('sprint.close.nothingToCarry')}</p>
    {/if}
  </section>

  <div class="cs-actions">
    <button type="button" class="btn" onclick={() => answer('cancel')}>{t('common.cancel')}</button>
    <button type="button" class="btn btn-primary" onclick={() => answer('confirm')}>{t('sprint.close.button')}</button>
  </div>
</dialog>

<style>
  dialog { margin: auto; width: min(520px, 100vw - 32px); max-height: calc(100vh - 32px); overflow: auto; box-sizing: border-box;
    padding: 22px; background: var(--bg-elev); color: var(--fg); border: 1px solid var(--border-strong);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); }
  dialog::backdrop { background: oklch(0.1 0.01 264 / 0.6); }
  h2 { margin: 0 0 10px; font-size: 1.0625rem; font-weight: 600; overflow-wrap: anywhere; }
  h3 { margin: 16px 0 6px; font-size: 0.8125rem; font-weight: 600; color: var(--fg-dim); }
  p { margin: 0 0 8px; font-size: 0.875rem; }
  .cs-summary { font-weight: 600; }
  .cs-none { color: var(--fg-dim); }
  .cs-list { list-style: none; margin: 0; padding: 0; font-size: 0.8125rem; display: flex; flex-direction: column; gap: 4px; }
  .cs-list li { overflow-wrap: anywhere; }
  .cs-pts { color: var(--fg-dim); white-space: nowrap; }
  .cs-carry { margin: 14px 0 0; padding: 10px 12px; border: 1px solid var(--border-control); border-radius: var(--radius-sm); }
  .cs-carry legend { padding: 0 6px; font-size: 0.8125rem; font-weight: 600; }
  .cs-carry label { display: flex; align-items: center; gap: 8px; min-height: 28px; font-size: 0.875rem; }
  .cs-carry input { flex: none; width: 16px; height: 16px; margin: 0; }
  .cs-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; }
</style>

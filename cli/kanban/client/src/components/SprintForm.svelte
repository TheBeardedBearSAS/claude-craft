<script>
  /**
   * "New sprint" dialog. Mount once, open from a button:
   *   <SprintForm bind:this={form} onsaved={(sprint) => …} />   form.open()
   * Validation is done by validateSprintDraft (same bounds as the server); errors are text tied to their field
   * (aria-describedby + aria-invalid) and listed in a summary that takes the focus on failure.
   */
  import { tick } from 'svelte';
  import { t, tn } from '../lib/i18n/index.svelte.js';
  import { errorKey } from '../lib/api.js';
  import { validateSprintDraft } from '../lib/sprint-plan.js';
  import { idempotencyKey, focusLost } from '../lib/story-form.js';
  import { createSprint } from '../lib/sprint-actions.svelte.js';
  import { confirmDiscard } from '../lib/story-actions.svelte.js';
  import { guardLeave } from '../lib/router.svelte.js';
  import ConfirmDialog from './ConfirmDialog.svelte';
  import { asksBeforeClosing } from '../lib/actions.js';

  let { onsaved = () => {} } = $props();

  const empty = () => ({ name: '', start_date: '', end_date: '', goal: '', capacity: '' });
  const FIELDS = ['name', 'start_date', 'end_date', 'capacity'];

  let dialog = $state(null);
  let summaryEl = $state(null);
  let triggerEl = null;
  let submitKey = ''; // one per opening: a repeated POST gets the first answer from the server
  let draft = $state(empty());
  let errors = $state({});
  let formError = $state(null);
  let saving = $state(false);

  const failing = $derived(FIELDS.filter((f) => errors[f]));

  export function open() {
    triggerEl = document.activeElement;
    submitKey = idempotencyKey();
    draft = empty();
    errors = {};
    formError = null;
    dialog?.showModal();
  }

  const close = () => dialog?.close();

  // Escape, the backdrop, Cancel and a URL change ask before a filled form is thrown away.
  let confirmDialog = $state(null);
  const dirty = () => Boolean(dialog?.open) && JSON.stringify($state.snapshot(draft)) !== JSON.stringify(empty());

  async function tryClose() {
    if (dirty() && !(await confirmDiscard(confirmDialog))) return;
    close();
  }

  async function confirmLeave() {
    const discard = await confirmDiscard(confirmDialog);
    if (discard) close();
    return discard;
  }
  $effect(() => guardLeave({ dirty, confirm: confirmLeave }));

  // `close` comes with the next rendered frame: a control the user has reached meanwhile keeps the focus.
  function onClose() {
    if (dialog.open) return; // closed, then opened again before this event came: the new opening owns the focus
    if (focusLost(document.activeElement, document.body, dialog)) triggerEl?.focus();
    triggerEl = null;
  }

  async function showErrors() {
    await tick();
    summaryEl?.focus();
  }

  function applyFailure(err) {
    if (err.code === 'sprint_exists') errors = { name: errorKey(err) };
    else formError = errorKey(err);
    return showErrors();
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    formError = null;
    const { errors: found, payload } = validateSprintDraft(draft);
    errors = found;
    if (!payload) return showErrors();
    saving = true;
    try {
      const sprint = await createSprint(payload, submitKey);
      close();
      onsaved(sprint);
    } catch (err) {
      await applyFailure(err);
    } finally {
      saving = false;
    }
  }

  const focusField = (field) => dialog?.querySelector(`#sf-${field}`)?.focus();
  const describedBy = (field) => (errors[field] ? `sf-${field}-error` : undefined);
</script>

{#snippet fieldError(field)}
  {#if errors[field]}<p class="field-error" id="sf-{field}-error">{t(errors[field])}</p>{/if}
{/snippet}

<dialog bind:this={dialog} class="sprint-form" aria-labelledby="sf-title" onclose={onClose} use:asksBeforeClosing={tryClose} onclick={(e) => { if (e.target === dialog) tryClose(); }}>
  <form novalidate onsubmit={submit}>
    <h2 id="sf-title">{t('sprint.create.title')}</h2>

    <div class="sf-summary" tabindex="-1" bind:this={summaryEl}>
      {#if failing.length > 0 || formError}
        <p class="sf-summary-title">{failing.length > 0 ? tn('form.errorSummary', failing.length) : t(formError)}</p>
        {#if failing.length > 0}
          <ul>
            {#each failing as field (field)}
              <li><button type="button" class="link-btn" onclick={() => focusField(field)}>{t(errors[field])}</button></li>
            {/each}
          </ul>
        {/if}
      {/if}
    </div>

    <div class="sf-field">
      <label for="sf-name">{t('sprint.create.name')} <span class="req">({t('form.required')})</span></label>
      <input id="sf-name" type="text" maxlength="120" autocomplete="off" bind:value={draft.name} aria-required="true" aria-invalid={errors.name ? 'true' : undefined} aria-describedby={describedBy('name')} />
      {@render fieldError('name')}
    </div>

    <div class="sf-row">
      <div class="sf-field">
        <label for="sf-start_date">{t('sprint.create.startDate')} <span class="req">({t('form.required')})</span></label>
        <input id="sf-start_date" type="date" bind:value={draft.start_date} aria-required="true" aria-invalid={errors.start_date ? 'true' : undefined} aria-describedby={describedBy('start_date')} />
        {@render fieldError('start_date')}
      </div>
      <div class="sf-field">
        <label for="sf-end_date">{t('sprint.create.endDate')} <span class="req">({t('form.required')})</span></label>
        <input id="sf-end_date" type="date" min={draft.start_date || undefined} bind:value={draft.end_date} aria-required="true" aria-invalid={errors.end_date ? 'true' : undefined} aria-describedby={describedBy('end_date')} />
        {@render fieldError('end_date')}
      </div>
    </div>

    <div class="sf-field">
      <label for="sf-goal">{t('sprint.create.goal')}</label>
      <textarea id="sf-goal" rows="3" maxlength="1000" bind:value={draft.goal}></textarea>
    </div>

    <div class="sf-field">
      <label for="sf-capacity">{t('sprint.create.capacity')}</label>
      <input id="sf-capacity" type="number" inputmode="numeric" min="0" max="999" step="1" bind:value={draft.capacity} aria-invalid={errors.capacity ? 'true' : undefined} aria-describedby={describedBy('capacity')} />
      {@render fieldError('capacity')}
    </div>

    <div class="sf-actions">
      <button type="button" class="btn" onclick={tryClose}>{t('common.cancel')}</button>
      <button type="submit" class="btn btn-primary" aria-disabled={saving ? 'true' : undefined}>{saving ? t('form.creating') : t('sprint.create.submit')}</button>
    </div>
    <p class="sr-only" role="status">{saving ? t('form.creating') : ''}</p>
  </form>
</dialog>

<ConfirmDialog bind:this={confirmDialog} />

<style>
  dialog { margin: auto; width: min(480px, 100vw - 32px); max-height: calc(100vh - 32px); overflow: auto; box-sizing: border-box;
    padding: 22px; background: var(--bg-elev); color: var(--fg); border: 1px solid var(--border-strong);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); }
  dialog::backdrop { background: oklch(0.1 0.01 264 / 0.6); }
  h2 { margin: 0 0 14px; font-size: 1.0625rem; font-weight: 600; }
  .sf-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; min-width: 0; }
  .sf-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr)); gap: 0 14px; }
  label { font-size: 0.8125rem; font-weight: 600; }
  .req { font-weight: 400; color: var(--fg-dim); }
  input, textarea { box-sizing: border-box; width: 100%; min-height: 32px; padding: 7px 10px; font: inherit; font-size: 0.875rem;
    background: var(--bg-sidebar); color: var(--fg); border: 1px solid var(--border-control); border-radius: var(--radius-sm); }
  input:focus-visible, textarea:focus-visible, .link-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  input[aria-invalid='true'] { border-color: var(--danger); }
  .field-error { margin: 0; font-size: 0.8125rem; color: var(--danger); }
  .sf-summary:empty { display: none; }
  .sf-summary { margin-bottom: 14px; padding: 10px 12px; border: 1px solid var(--danger); border-radius: var(--radius-sm); background: var(--danger-soft); }
  .sf-summary:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .sf-summary-title { margin: 0 0 6px; font-weight: 600; font-size: 0.8125rem; }
  .sf-summary ul { margin: 0; padding-left: 18px; font-size: 0.8125rem; }
  .link-btn { background: none; border: none; padding: 2px 0; min-height: 24px; color: var(--fg); font: inherit; text-align: left; text-decoration: underline; cursor: pointer; }
  .sf-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
</style>

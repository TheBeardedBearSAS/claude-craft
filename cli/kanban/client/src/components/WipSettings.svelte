<script>
  /**
   * Work-in-progress limits (Settings panel). One field per column: empty = no limit, otherwise 1 to 99.
   * Saved with PUT /api/settings/wip; in read-only mode the fields are read-only and say why.
   */
  import { tick } from 'svelte';
  import { STATUSES } from '../../../shared/transitions.js';
  import { health } from '../lib/health.svelte.js';
  import { t, tn } from '../lib/i18n/index.svelte.js';
  import { errorKey } from '../lib/api.js';
  import { validateWipDraft, wipDraftFrom } from '../lib/sprint-plan.js';
  import { saveWipLimits } from '../lib/sprint-actions.svelte.js';

  let draft = $state(wipDraftFrom(STATUSES, health.wipLimits));
  let errors = $state({});
  let formError = $state(null);
  let saved = $state(false);
  let saving = $state(false);
  let dirty = false;
  let summaryEl = $state(null);
  let root = $state(null);

  const failing = $derived(STATUSES.filter((s) => errors[s]));
  const statusText = $derived(saved ? t('settings.wip.saved') : '');

  // Follow the server (another tab, a refresh) unless the user is in the middle of an edit.
  $effect(() => {
    const limits = health.wipLimits;
    if (!dirty) draft = wipDraftFrom(STATUSES, limits);
  });

  function edited() {
    dirty = true;
    saved = false;
  }

  async function submit(event) {
    event.preventDefault();
    if (saving || health.readonly) return;
    formError = null;
    const { errors: found, limits } = validateWipDraft(STATUSES, draft);
    errors = found;
    if (limits) {
      saving = true;
      try {
        await saveWipLimits(limits);
        dirty = false;
        saved = true;
        return;
      } catch (err) {
        formError = errorKey(err);
      } finally {
        saving = false;
      }
    }
    await tick();
    summaryEl?.focus();
  }

  const focusField = (status) => root?.querySelector(`#wip-${status}`)?.focus();
  const describedBy = (status) => (errors[status] ? `wip-format wip-${status}-error` : 'wip-format');
</script>

<div class="wip" bind:this={root}>
  <h3 class="wip-label" id="tw-wip">{t('settings.wip.label')}</h3>
  <p class="wip-hint">{t('settings.wip.hint')}</p>
  {#if health.readonly}<p class="wip-hint wip-readonly">{t('settings.wip.readonly')}</p>{/if}

  <form novalidate aria-labelledby="tw-wip" onsubmit={submit}>
    <div class="wip-summary" tabindex="-1" bind:this={summaryEl}>
      {#if failing.length > 0 || formError}
        <p class="wip-summary-title">{failing.length > 0 ? tn('form.errorSummary', failing.length) : t(formError)}</p>
        {#if failing.length > 0}
          <ul>
            {#each failing as status (status)}
              <li><button type="button" class="wip-link" onclick={() => focusField(status)}>{t('settings.wip.limit', { status: t(`status.${status}`) })}</button></li>
            {/each}
          </ul>
        {/if}
      {/if}
    </div>

    {#each STATUSES as status (status)}
      <div class="wip-field">
        <label for="wip-{status}">{t('settings.wip.limit', { status: t(`status.${status}`) })}</label>
        <input
          id="wip-{status}"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          readonly={health.readonly}
          placeholder={t('settings.wip.none')}
          bind:value={draft[status]}
          oninput={edited}
          aria-invalid={errors[status] ? 'true' : undefined}
          aria-describedby={describedBy(status)}
        />
        {#if errors[status]}<p class="wip-error" id="wip-{status}-error">{t(errors[status])}</p>{/if}
      </div>
    {/each}

    <p class="wip-hint" id="wip-format">{t('settings.wip.format')}</p>

    {#if !health.readonly}
      <button type="submit" class="btn btn-primary" aria-disabled={saving ? 'true' : undefined}>{saving ? t('form.saving') : t('settings.wip.save')}</button>
    {/if}
    <p class="wip-status" role="status">{statusText}</p>
  </form>
</div>

<style>
  .wip-label { display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.07em; color: var(--fg-faint); font-weight: 600; margin: 0 0 9px; }
  .wip-hint { font-size: 0.75rem; color: var(--fg-faint); margin: 0 0 9px; line-height: 1.5; }
  .wip-field { display: grid; grid-template-columns: minmax(0, 1fr) 6rem; align-items: center; gap: 4px 12px; margin-bottom: 8px; }
  .wip-field label { font-size: 0.8125rem; overflow-wrap: anywhere; }
  .wip-field input { box-sizing: border-box; width: 100%; min-height: 32px; padding: 5px 10px; font: inherit; font-size: 0.8125rem;
    border: 1px solid var(--border-control); border-radius: 9px; background: var(--bg-inset); color: var(--fg); }
  .wip-field input:focus-visible, .wip-link:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .wip-field input[aria-invalid='true'] { border-color: var(--danger); }
  .wip-error { grid-column: 1 / -1; margin: 0; font-size: 0.75rem; color: var(--danger); }
  .wip-summary:empty { display: none; }
  .wip-summary { margin-bottom: 10px; padding: 8px 10px; border: 1px solid var(--danger); border-radius: 9px; background: var(--danger-soft); font-size: 0.8125rem; }
  .wip-summary:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .wip-summary-title { margin: 0 0 4px; font-weight: 600; }
  .wip-summary ul { margin: 0; padding-left: 18px; }
  .wip-link { background: none; border: none; padding: 2px 0; min-height: 24px; color: var(--fg); font: inherit; text-decoration: underline; text-align: left; cursor: pointer; }
  .wip-status { min-height: 1.2em; margin: 8px 0 0; font-size: 0.8125rem; color: var(--success); }
  /* Forced colours: a field in error is told by its border width, not only by its colour. */
  @media (forced-colors: active) { .wip-field input[aria-invalid='true'] { border-width: 2px; } }
</style>

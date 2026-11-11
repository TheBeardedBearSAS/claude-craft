<script>
  /**
   * ConfirmDialog — accessible replacement for window.confirm().
   *
   * Usage:
   *   <ConfirmDialog bind:this={confirmDialog} />
   *   if (await confirmDialog.confirm(t('form.delete.confirm', { id }), { danger: true })) { … }
   *   // Resolves true on confirmation, false on cancel / Escape.
   */
  import { t } from '../lib/i18n/index.svelte.js';

  const uid = $props.id(); // several instances live in the page (detail, creation, sprints): ids must not collide

  let dialog = $state(null);
  let cancelEl = $state(null);
  let message = $state('');
  let confirmLabel = $state('');
  let cancelLabel = $state(null);
  let danger = $state(false);
  let resolvePromise = null;

  /**
   * @param {string} [text]
   * @param {{ confirmLabel?: string, cancelLabel?: string, danger?: boolean }} [opts]
   * @returns {Promise<boolean>}
   */
  export function confirm(text, opts = {}) {
    message = text ?? t('common.confirm.default');
    confirmLabel = opts.confirmLabel ?? t('common.confirm');
    cancelLabel = opts.cancelLabel ?? null;
    danger = opts.danger === true;
    dialog.returnValue = '';
    dialog.showModal();
    cancelEl?.focus(); // safe default: the least destructive answer
    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  }

  // The answer is taken when it is given (button, Escape), not on `close`: that event comes with the next rendered
  // frame, when the dialog may already be asking a new question (it would answer it) and the leave guard of the
  // router would still be waiting.
  function settle(value) {
    const resolve = resolvePromise;
    resolvePromise = null;
    resolve?.(value);
  }

  function answer(value) {
    dialog.returnValue = value;
    dialog.close();
    settle(value === 'confirm');
  }
</script>

<dialog bind:this={dialog} aria-labelledby="{uid}-message" oncancel={() => settle(false)} onclose={() => { if (!dialog.open) settle(false); }}>
  <p id="{uid}-message" class="dialog-message">{message}</p>
  <div class="dialog-actions">
    <button type="button" class="btn-cancel" bind:this={cancelEl} onclick={() => answer('cancel')}>{cancelLabel ?? t('common.cancel')}</button>
    <button type="button" class="btn-confirm" class:danger onclick={() => answer('confirm')}>{confirmLabel}</button>
  </div>
</dialog>

<style>
  dialog {
    margin: auto;
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    width: min(380px, 100vw - 32px);
    box-sizing: border-box;
    color: var(--fg);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.6);
  }

  .dialog-message {
    margin: 0 0 18px;
    font-size: 0.9375rem;
    line-height: 1.5;
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .btn-cancel,
  .btn-confirm {
    min-height: 32px;
    padding: 6px 16px;
    border-radius: var(--radius);
    font-size: 0.875rem;
    cursor: pointer;
    border: 1px solid var(--border-strong);
  }

  .btn-cancel {
    background: var(--bg-sidebar);
    color: var(--fg-dim);
  }

  .btn-confirm {
    background: var(--accent);
    color: var(--accent-fg);
    border-color: var(--accent);
  }

  .btn-confirm.danger {
    background: var(--danger);
    color: var(--bg);
    border-color: var(--danger);
  }

  .btn-cancel:focus-visible,
  .btn-confirm:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
</style>

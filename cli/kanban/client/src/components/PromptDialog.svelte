<script>
  /**
   * PromptDialog — accessible replacement for window.prompt().
   *
   * Usage:
   *   <PromptDialog bind:this={promptDialog} />
   *   const value = await promptDialog.prompt('Enter a reason:', { required: 'A reason is needed.' });
   *   // Returns the trimmed string, or null if cancelled. An empty answer is refused with an
   *   // inline error (and the dialog stays open) when `required` is given.
   */
  import { t } from '../lib/i18n/index.svelte.js';

  const uid = $props.id(); // unique ids: the dialog may be mounted more than once

  let dialog = $state(null);
  let inputEl = $state(null);
  let message = $state('');
  let requiredMessage = $state('');
  let inputValue = $state('');
  let showError = $state(false);
  let resolvePromise = null;

  /**
   * @param {string} promptMessage - Visible label of the input.
   * @param {{ required?: string }} [opts] - `required`: error text shown when the answer is empty.
   * @returns {Promise<string|null>}
   */
  export function prompt(promptMessage, { required = '' } = {}) {
    message = promptMessage;
    requiredMessage = required;
    inputValue = '';
    showError = false;
    dialog.showModal();
    Promise.resolve().then(() => inputEl?.focus());
    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  }

  // The answer is taken when it is given (OK, Cancel, Escape), not on `close`: that event comes with the next rendered
  // frame, when the dialog may already be asking a second question (it would receive the first one's answer).
  function settle(value) {
    const resolve = resolvePromise;
    resolvePromise = null;
    resolve?.(value);
  }

  // Closed here, before the caller goes on (Escape included): a caller that puts the focus back at once must find the
  // page usable, not still blocked by the dialog that is closing.
  function cancel() {
    dialog.close();
    settle(null);
  }

  // Any other way of closing (the browser's own) while the question is still open counts as a cancel.
  function handleClose() {
    if (!dialog.open) settle(null);
  }

  function confirm() {
    if (requiredMessage && !inputValue.trim()) {
      showError = true;
      inputEl?.focus();
      return;
    }
    const value = inputValue.trim();
    dialog.close();
    settle(value || null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    confirm();
  }
</script>

<dialog bind:this={dialog} class="prompt-dialog" aria-labelledby="{uid}-label" oncancel={cancel} onclose={handleClose}>
  <form onsubmit={handleSubmit}>
    <label id="{uid}-label" for="{uid}-input" class="dialog-title">{message}</label>
    <input
      id="{uid}-input"
      bind:this={inputEl}
      bind:value={inputValue}
      type="text"
      class="dialog-input"
      aria-invalid={showError ? 'true' : undefined}
      aria-describedby={showError ? `${uid}-error` : undefined}
      oninput={() => (showError = false)}
    />
    <!-- Toujours présente (vide) : un message inséré dans une région déjà là est annoncé de façon fiable. -->
    <p id="{uid}-error" class="dialog-error" role="alert">{showError ? requiredMessage : ''}</p>
    <div class="dialog-actions">
      <button type="button" class="btn-cancel" onclick={cancel}>{t('common.cancel')}</button>
      <button type="submit" class="btn-confirm">{t('common.ok')}</button>
    </div>
  </form>
</dialog>

<style>
  dialog {
    margin: auto;
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    width: min(380px, 100vw - 32px);
    min-width: min(320px, 100vw - 32px);
    box-sizing: border-box;
    color: var(--fg);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.6);
  }

  .dialog-title {
    display: block;
    margin: 0 0 14px;
    font-size: 1rem;
    font-weight: 600;
  }

  .dialog-input {
    display: block;
    width: 100%;
    box-sizing: border-box;
    background: var(--bg-sidebar);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius);
    color: var(--fg);
    padding: 8px 10px;
    font-size: 0.875rem;
    margin-bottom: 16px;
  }

  .dialog-input[aria-invalid='true'] {
    border-color: var(--danger);
    margin-bottom: 8px;
  }

  /* Vide mais rendue (pas de display: none) : la région doit rester dans l'arbre d'accessibilité. */
  .dialog-error:empty {
    margin: 0;
  }

  .dialog-error {
    margin: 0 0 16px;
    font-size: 0.8125rem;
    color: var(--danger);
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

  .btn-cancel:hover {
    background: var(--border);
  }

  .btn-confirm {
    background: var(--accent);
    color: var(--accent-fg);
    border-color: var(--accent);
  }

  .btn-confirm:hover {
    opacity: 0.9;
  }

  /* Anneau de focus visible sur chaque contrôle (le défaut global est écrasé par les bordures locales). */
  .dialog-input:focus-visible,
  .btn-cancel:focus-visible,
  .btn-confirm:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
</style>

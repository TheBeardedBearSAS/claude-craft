<script>
  /**
   * PromptDialog — accessible replacement for window.prompt().
   *
   * Usage:
   *   <PromptDialog bind:this={promptDialog} />
   *   const value = await promptDialog.prompt('Enter a reason:');
   *   // Returns the string entered, or null if cancelled.
   */

  let dialog = $state(null);
  let inputEl = $state(null);
  let message = $state('');
  let inputValue = $state('');
  let resolvePromise = null;

  /**
   * Open the dialog and return a promise that resolves with the entered value
   * (string) or null when the user cancels.
   *
   * @param {string} promptMessage - Label text shown above the input.
   * @returns {Promise<string|null>}
   */
  export function prompt(promptMessage) {
    message = promptMessage;
    inputValue = '';
    dialog.showModal();
    // Focus the input after the dialog is open (next microtask)
    Promise.resolve().then(() => inputEl?.focus());
    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  }

  function handleClose() {
    const confirmed = dialog.returnValue === 'confirm';
    const value = confirmed && inputValue.trim() ? inputValue : null;
    resolvePromise?.(value);
    resolvePromise = null;
  }

  function handleKeydown(e) {
    // Allow submitting with Enter from within the input
    if (e.key === 'Enter') {
      e.preventDefault();
      dialog.returnValue = 'confirm';
      dialog.close();
    }
  }
</script>

<dialog
  bind:this={dialog}
  aria-labelledby="prompt-dialog-title"
  aria-modal="true"
  onclose={handleClose}
>
  <form method="dialog">
    <h2 id="prompt-dialog-title" class="dialog-title">{message}</h2>
    <input
      bind:this={inputEl}
      bind:value={inputValue}
      type="text"
      class="dialog-input"
      aria-label={message}
      onkeydown={handleKeydown}
    />
    <div class="dialog-actions">
      <button type="submit" value="cancel" class="btn-cancel">Cancel</button>
      <button
        type="button"
        class="btn-confirm"
        onclick={() => {
          dialog.returnValue = 'confirm';
          dialog.close();
        }}
      >OK</button>
    </div>
  </form>
</dialog>

<style>
  dialog {
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    min-width: 320px;
    color: var(--fg);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.6);
  }

  .dialog-title {
    margin: 0 0 14px;
    font-size: 16px;
    font-weight: 600;
  }

  .dialog-input {
    display: block;
    width: 100%;
    box-sizing: border-box;
    background: var(--bg-sidebar);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--fg);
    padding: 8px 10px;
    font-size: 14px;
    margin-bottom: 16px;
  }

  .dialog-input:focus {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .btn-cancel,
  .btn-confirm {
    padding: 8px 16px;
    border-radius: var(--radius);
    font-size: 14px;
    cursor: pointer;
    border: 1px solid var(--border);
  }

  .btn-cancel {
    background: var(--bg-sidebar);
    color: var(--fg-dim);
  }

  .btn-cancel:hover,
  .btn-cancel:focus {
    background: var(--border);
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }

  .btn-confirm {
    background: var(--accent);
    color: var(--accent-fg);
    border-color: var(--accent);
  }

  .btn-confirm:hover,
  .btn-confirm:focus {
    opacity: 0.9;
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
</style>

<script>
  /**
   * Modale de création de story. Montée une fois (dans StoryDetail, donc dans App) ; ouverte par
   * `openCreate(defaults)` de story-actions.svelte.js depuis n'importe quelle vue. Après la création, la modale
   * se ferme et le détail de la nouvelle story s'ouvre (`?story=<id>`).
   */
  import { tick } from 'svelte';
  import Icon from './Icon.svelte';
  import StoryForm from './StoryForm.svelte';
  import ConfirmDialog from './ConfirmDialog.svelte';
  import { asksBeforeClosing } from '../lib/actions.js';
  import { createDialog, closeCreate, createStory, confirmDiscard } from '../lib/story-actions.svelte.js';
  import { emptyDraft, describeFailure, idempotencyKey, focusLost } from '../lib/story-form.js';
  import { setQuery, guardLeave } from '../lib/router.svelte.js';
  import { t } from '../lib/i18n/index.svelte.js';

  let dialogEl = $state(null);
  let formRef = $state(null);
  let confirmDialog = $state(null);
  let draft = $state(emptyDraft());
  let busy = $state(false);
  let formError = $state('');
  let serverErrors = $state({});
  let canRetry = $state(false);
  let opener = null;
  let initial = '';
  let submitKey = ''; // one per opening: a repeated POST gets the first answer from the server

  // Réinitialise le brouillon à chaque ouverture (les valeurs par défaut viennent de l'appelant).
  $effect(() => {
    if (!createDialog.open || !dialogEl || dialogEl.open) return;
    opener = document.activeElement;
    submitKey = idempotencyKey();
    draft = emptyDraft(createDialog.defaults);
    initial = JSON.stringify($state.snapshot(draft));
    formError = '';
    serverErrors = {};
    canRetry = false;
    dialogEl.showModal();
    formRef?.focusTitle(); // showModal() focuses the first control (Close): the title comes first for the user
  });

  const dirty = $derived(JSON.stringify($state.snapshot(draft)) !== initial);

  async function tryClose() {
    if (busy) return;
    if (dirty && !(await confirmDiscard(confirmDialog))) return;
    dialogEl?.close();
  }

  // A URL change while the form holds input asks first; discarding also closes the dialog.
  async function confirmLeave() {
    const discard = await confirmDiscard(confirmDialog);
    if (discard) dialogEl?.close();
    return discard;
  }
  $effect(() => guardLeave({ dirty: () => createDialog.open && dirty, confirm: confirmLeave }));

  // Fermeture native (Échap compris) : le focus revient au déclencheur s'il existe encore, sauf si l'utilisateur est
  // déjà allé ailleurs (`close` arrive à l'image suivante).
  function onClose() {
    const trigger = opener;
    opener = null;
    closeCreate();
    tick().then(() => {
      if (trigger?.isConnected && focusLost(document.activeElement, document.body, dialogEl)) trigger.focus();
    });
  }

  async function submit(values) {
    if (busy) return; // the guard is here, not only on the button: two Enter in one frame both reach this function
    busy = true;
    formError = '';
    serverErrors = {};
    canRetry = false;
    const res = await createStory(values, submitKey);
    busy = false;
    if (res.ok) return created(res.story.id);
    const failure = describeFailure(res.error);
    formError = t(failure.key);
    serverErrors = failure.fields;
    canRetry = failure.retry;
    await formRef?.focusSummary();
  }

  async function created(id) {
    opener = null; // le détail de la nouvelle story prend le relais du focus
    closeCreate();
    await tick();
    setQuery({ story: id });
  }
</script>

{#if createDialog.open}
  <dialog
    bind:this={dialogEl}
    class="modal modal-form"
    aria-labelledby="create-dialog-title"
    onclose={onClose}
    use:asksBeforeClosing={tryClose}
    onclick={(e) => {
      if (e.target === dialogEl) tryClose();
    }}
  >
    <div class="modal-inner">
      <div class="modal-head">
        <div class="row1">
          <h2 class="modal-title" id="create-dialog-title">{t('form.title.create')}</h2>
          <button type="button" class="icon-btn m-close" onclick={tryClose} aria-label={t('story.close')}><Icon name="close" size={18} /></button>
        </div>
      </div>
      <div class="modal-body">
        <StoryForm
          bind:this={formRef}
          bind:draft
          mode="create"
          idBase="create"
          {busy}
          {formError}
          {serverErrors}
          submitLabel={t('form.create')}
          busyLabel={t('form.creating')}
          onsubmit={submit}
          oncancel={tryClose}
          onretry={canRetry ? () => submit($state.snapshot(draft)) : null}
        />
      </div>
    </div>
  </dialog>
{/if}

<ConfirmDialog bind:this={confirmDialog} />

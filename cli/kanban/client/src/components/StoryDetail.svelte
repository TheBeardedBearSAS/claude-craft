<script>
  import { tick, untrack } from 'svelte';
  import Icon from './Icon.svelte';
  import Avatar from './Avatar.svelte';
  import PriorityChip from './PriorityChip.svelte';
  import TddPip from './TddPip.svelte';
  import StoryForm from './StoryForm.svelte';
  import StoryCreateDialog from './StoryCreateDialog.svelte';
  import ConfirmDialog from './ConfirmDialog.svelte';
  import PromptDialog from './PromptDialog.svelte';
  import { STATUS, TDD, TASK_TYPE, epicHue } from '../lib/config.js';
  import { buildCardDetails } from '../lib/board-nav.js';
  import { moveTargets } from '../lib/board-card.js';
  import { detail, openDetail, closeDetail, consumeTrigger, loadDetail } from '../lib/detail.svelte.js';
  import { route, setQuery, guardLeave } from '../lib/router.svelte.js';
  import { store, toast, writesSettled } from '../lib/store.svelte.js';
  import { health } from '../lib/health.svelte.js';
  import { errorKey } from '../lib/api.js';
  import { formatHash } from '../lib/query.js';
  import { linkifyStoryIds, demoteHeadings, renderMarkdown } from '../lib/markdown.js';
  import { draftFromStory, diffPatch, describeFailure, idempotencyKey, restsOnContainer } from '../lib/story-form.js';
  import {
    updateStory,
    saveBody,
    deleteStory,
    setTaskStatus,
    addTask,
    renameTask,
    deleteTask,
    moveStory,
    loadStoryRaw,
    registerPrompter,
    confirmDiscard,
  } from '../lib/story-actions.svelte.js';
  import { t } from '../lib/i18n/index.svelte.js';
  import { asksBeforeClosing } from '../lib/actions.js';

  let dialogEl = $state(null);
  let confirmDialog = $state(null);
  let promptDialog = $state(null);
  $effect(() => registerPrompter(promptDialog));
  let closing = false;

  // ---- fermeture ----------------------------------------------------------------------------------------
  // Toutes les fermetures (bouton, backdrop, Échap) passent par tryClose(), qui demande confirmation s'il reste
  // des modifications, puis par dialogEl.close() : `onclose` est le chemin UNIQUE de nettoyage.
  function closeNow() {
    dialogEl?.close();
  }

  async function tryClose() {
    if (closing) return;
    closing = true;
    try {
      const discard = !unsaved || (await confirmDiscard(confirmDialog));
      if (discard) closeNow();
    } finally {
      closing = false;
    }
  }

  // Déclenché par la fermeture native du <dialog>. Retire `?story=`, réinitialise l'état puis rend
  // le focus au déclencheur APRÈS le démontage du dialog (tick). Si le déclencheur a disparu (story supprimée),
  // le focus va sur « Nouvelle story » (`[data-new-story]`) ou à défaut sur le contenu principal.
  function onDialogClose() {
    const trigger = consumeTrigger();
    syncedId = null;
    resetEditing();
    setQuery({ story: null });
    closeDetail();
    tick().then(() => {
      // `close` comes with the next rendered frame: a control the user has reached meanwhile keeps the focus.
      const active = document.activeElement;
      if (!restsOnContainer(active, document.body) && active.isConnected) return;
      const fallback = document.querySelector('[data-new-story]') ?? document.querySelector('main');
      // <body> is no trigger: the detail of a story just created opens after its creation dialog is gone.
      const usable = trigger?.isConnected && trigger !== document.body;
      (usable ? trigger : fallback)?.focus();
    });
  }

  // ---- URL <-> modale -------------------------------------------------------------------------------
  // `?story=<id>` ouvre le détail depuis n'importe quelle vue ; l'URL gagne quand elle change. Un
  // openDetail() direct (ex. une ligne du Backlog) est répercuté dans l'URL.
  let syncedId = null;

  function openFromQuery(id) {
    const card = store.stories.find((s) => s.id === id);
    if (card) {
      syncedId = id;
      openDetail(card);
    } else if (!store.loading) {
      syncedId = id;
      toast({ kind: 'error', message: id, key: 'error.not_found' });
      setQuery({ story: null });
    }
  }

  $effect(() => {
    const id = route.query.story || null;
    const cardId = detail.card?.id ?? null;
    if (id !== syncedId) {
      if (!id) {
        syncedId = null;
        if (cardId) untrack(closeNow);
      } else if (id === cardId) syncedId = id;
      else openFromQuery(id);
    } else if (cardId && cardId !== id) {
      syncedId = cardId;
      setQuery({ story: cardId });
    }
  });

  // La carte vient du store (statut à jour après un déplacement) ; repli sur l'instantané du détail.
  const card = $derived(detail.card ? (store.stories.find((s) => s.id === detail.card.id) ?? detail.card) : null);
  const fields = $derived(card ? buildCardDetails(card) : null);
  const estTotal = $derived(detail.tasks.reduce((a, task) => a + (task.estimation_hours || 0), 0));
  const actTotal = $derived(detail.tasks.reduce((a, task) => a + (task.actual_hours || 0), 0));
  // detail.svelte.js rend le markdown sans options : on rétrograde les titres et on lie les ids ici.
  const bodyHtml = $derived(linkifyStoryIds(demoteHeadings(detail.body, 3), route));

  const taskStatus = (status) => {
    const key = 'status.task.' + status;
    const text = t(key);
    return text === key ? status : text;
  };

  // Open the native <dialog> as soon as a card is selected (focus trap + modality are native).
  $effect(() => {
    if (fields && dialogEl && !dialogEl.open) dialogEl.showModal();
  });

  // ---- droits d'écriture ------------------------------------------------------------------------------
  const canEdit = $derived(Boolean(card) && !health.readonly && card._writable !== false && card._source !== 'archived');
  const archived = $derived(card?._source === 'archived');
  const unavailable = $derived.by(() => {
    if (!card || canEdit) return '';
    if (health.readonly) return t('app.banner.readonly');
    return archived ? t('error.archived') : t('story.readonly.note');
  });

  // ---- annonces et erreurs d'actions ------------------------------------------------------------------
  let liveMessage = $state('');
  let actionError = $state('');
  let dependents = $state([]);

  // After an awaited action, the focus goes back to the control that started it only if it was lost (its element
  // removed or disabled): the user may already have moved on while the server answered (WCAG 2.4.3).
  function focusIfLost(el) {
    const active = document.activeElement;
    // Another modal dialog (a prompt already asking the next question) holds the focus: leave it there. WebKit, unlike
    // Chromium and Firefox, lets focus() reach an element that a modal dialog makes inert.
    const inOtherModal = active?.isConnected && active.closest('dialog')?.matches(':modal') && !dialogEl?.contains(active);
    if (inOtherModal) return;
    // Lost also when it rests on this dialog itself: where Safari on macOS leaves it after a click on a button.
    const lost = restsOnContainer(active, document.body) || !active.isConnected || active.disabled;
    if (lost || dialogEl?.contains(active) === false) el?.focus();
  }

  const clearAlerts = () => {
    actionError = '';
    dependents = [];
  };

  // ---- édition des champs -----------------------------------------------------------------------------
  let editing = $state(false);
  let draft = $state(null);
  let base = $state(null); // la story avec laquelle le brouillon est comparé (et dont vient le _rev envoyé)
  let saving = $state(false);
  let formError = $state('');
  let serverErrors = $state({});
  let canRetry = $state(false);
  let conflict = $state(null); // { fresh } ou { removed: true }
  let formRef = $state(null);
  let editBtn = $state(null);
  let conflictEl = $state(null);

  const fieldsDirty = $derived(editing && Boolean(base) && Boolean(draft) && Object.keys(diffPatch(base, draft)).length > 0);

  function clearFormErrors() {
    formError = '';
    serverErrors = {};
    canRetry = false;
    conflict = null;
  }

  async function startEdit() {
    clearAlerts();
    clearFormErrors();
    await writesSettled(card.id); // a move just made shows before its answer: start from the version it brings back
    base = $state.snapshot(card);
    draft = draftFromStory(base);
    editing = true;
    await tick();
    formRef?.focusTitle();
  }

  async function stopEdit() {
    editing = false;
    draft = null;
    base = null;
    clearFormErrors();
    await tick();
    focusIfLost(editBtn);
  }

  function resetEditing() {
    editing = false;
    draft = null;
    base = null;
    clearFormErrors();
    clearAlerts();
    bodyEditing = false;
    bodyError = '';
    bodyConflict = false;
    liveMessage = '';
    newTask = '';
    taskError = '';
    taskKey = idempotencyKey();
    renaming = null;
  }

  // L'édition se réinitialise quand une autre story s'ouvre.
  $effect(() => {
    detail.card?.id;
    untrack(resetEditing);
  });

  async function save(values) {
    const patch = diffPatch(base, values);
    if (Object.keys(patch).length === 0) {
      formError = t('form.noChanges');
      return formRef?.focusSummary();
    }
    await submitPatch(patch, base);
  }

  async function submitPatch(patch, from) {
    saving = true;
    clearFormErrors();
    const res = await updateStory(from.id, patch, from._rev);
    saving = false;
    if (res.ok) return stopEdit();
    if (res.error.code === 'conflict') return showConflict(res.error.body?.story ?? null);
    const failure = describeFailure(res.error);
    formError = t(failure.key);
    serverErrors = failure.fields;
    canRetry = failure.retry;
    await formRef?.focusSummary();
  }

  // Le 409 porte la story à jour au format de l'API (avec _rev), ou null si elle a été retirée.
  async function showConflict(fresh) {
    conflict = fresh ? { fresh } : { removed: true };
    await tick();
    conflictEl?.focus();
  }

  async function reloadConflict() {
    const fresh = conflict?.fresh;
    clearFormErrors();
    if (!fresh) return stopEdit();
    base = fresh;
    draft = draftFromStory(fresh);
    await tick();
    document.getElementById('edit-title')?.focus();
  }

  // Only what I changed (relative to the version I started from) is sent, on top of the newer version; the form
  // is rebased on it so that the fields I did not touch keep the other person's values.
  async function keepMine() {
    const fresh = conflict.fresh;
    const patch = diffPatch(base, draft);
    const rebased = draftFromStory(fresh);
    for (const field of Object.keys(patch)) rebased[field] = draft[field];
    base = fresh;
    draft = rebased;
    if (Object.keys(patch).length === 0) return stopEdit();
    await submitPatch(patch, fresh);
  }

  // ---- contenu markdown -------------------------------------------------------------------------------
  let bodyEditing = $state(false);
  let bodyText = $state('');
  let bodyBase = '';
  let bodyMtime = 0;
  let bodySaving = $state(false);
  let bodyError = $state('');
  let bodyConflict = $state(false);
  let previewHtml = $state('');
  let previewSeq = 0;
  let bodyArea = $state(null);
  let bodyBtn = $state(null);

  const bodyDirty = $derived(bodyEditing && bodyText !== bodyBase);
  const unsaved = $derived(fieldsDirty || bodyDirty);
  // A URL change (Back, a story link, another `?story=`) asks before the changes are lost; see router.svelte.js.
  // Discarding ends the edit at once, so that the replayed navigation is no longer held back.
  async function confirmLeave() {
    const discard = await confirmDiscard(confirmDialog);
    if (discard) resetEditing();
    return discard;
  }
  $effect(() => guardLeave({ dirty: () => unsaved, confirm: confirmLeave }));
  const hasFile = $derived(Boolean(card) && card._mtime > 0);

  $effect(() => {
    if (!bodyEditing) return;
    const seq = ++previewSeq;
    renderMarkdown(bodyText).then((html) => {
      if (seq === previewSeq) previewHtml = demoteHeadings(html, 3);
    });
  });

  async function startBody() {
    clearAlerts();
    bodyError = '';
    bodyConflict = false;
    await writesSettled(card.id);
    const res = await loadStoryRaw(card.id);
    if (!res.ok) {
      bodyError = t(errorKey(res.error));
      return;
    }
    bodyBase = res.body;
    bodyText = res.body;
    bodyMtime = res.story._mtime;
    bodyEditing = true;
    await tick();
    bodyArea?.focus();
  }

  async function stopBody() {
    bodyEditing = false;
    bodyError = '';
    bodyConflict = false;
    await tick();
    focusIfLost(bodyBtn);
  }

  async function submitBody() {
    bodySaving = true;
    bodyError = '';
    const res = await saveBody(card.id, bodyText, bodyMtime);
    bodySaving = false;
    if (res.ok) {
      await loadDetail(card.id);
      return stopBody();
    }
    bodyConflict = res.error.code === 'conflict';
    bodyError = res.error.code === 'no_backing_file' ? t('story.content.noFile') : t(errorKey(res.error));
  }

  async function keepMyText() {
    const res = await loadStoryRaw(card.id);
    if (!res.ok) {
      bodyConflict = false;
      bodyError = t(errorKey(res.error));
      return;
    }
    bodyMtime = res.story._mtime;
    bodyBase = res.body;
    await submitBody();
  }

  // ---- tâches -----------------------------------------------------------------------------------------
  const taskList = $derived(card?.tasks?.list ?? []);
  const taskMap = $derived(card?.tasks?.status ?? null);
  // Un simple compteur (completed > 0 sans statuts par tâche) : le serveur en déduit les statuts à la 1re modification.
  const taskCounterOnly = $derived(!taskMap && (card?.tasks?.completed ?? 0) > 0);
  const counterDone = $derived(taskMap ? 0 : (card?.tasks?.completed ?? 0));
  // Les statuts de tâche vivent dans .bmad/sprint-status.yaml : seules les stories qu'il suit sont modifiables.
  const taskEditable = $derived(canEdit && card?._statusSource === 'sprint-status' && !editing);
  const showChecklist = $derived(detail.tasks.length === 0 && (taskList.length > 0 || (taskEditable && !detail.loading)));

  let newTask = $state('');
  let newTaskEl = $state(null);
  let taskError = $state('');
  let addingTask = $state(false);
  let taskKey = idempotencyKey(); // renewed after each added task: a repeated POST gets the first answer

  async function submitTask(event) {
    event.preventDefault();
    if (addingTask) return; // the guard is here, not only on the button: two Enter in one frame both reach this function
    const name = newTask.trim();
    taskError = name ? '' : t('story.tasks.error.required');
    if (!name) return newTaskEl?.focus();
    addingTask = true;
    const res = await addTask(card.id, name, taskKey);
    addingTask = false;
    if (!res.ok) {
      taskError = t(errorKey(res.error));
      return focusIfLost(newTaskEl);
    }
    newTask = '';
    taskKey = idempotencyKey();
    liveMessage = t('story.tasks.added', { name });
    focusIfLost(newTaskEl);
  }

  // Rename: an inline field in place of the name. Enter saves, Escape cancels, the focus goes back to the button.
  let renaming = $state(null); // { task, value, error, busy }
  let renameEl = $state(null);
  let taskBusy = false;
  const taskControl = (i, attr) => dialogEl?.querySelector(`.sd-checklist [data-task="${i}"] [${attr}]`);

  async function startRename(task) {
    renaming = { task, value: task, error: '', busy: false };
    await tick();
    renameEl?.focus();
    renameEl?.select();
  }

  async function endRename(i) {
    renaming = null;
    await tick();
    taskControl(i, 'data-task-rename')?.focus();
  }

  async function submitRename(event, task, i) {
    event.preventDefault();
    if (!renaming || renaming.busy) return;
    const name = renaming.value.trim();
    if (!name) return refuseRename(t('story.tasks.error.required'));
    if (name === task) return endRename(i);
    renaming.busy = true;
    const res = await renameTask(card.id, task, name);
    if (!res.ok) return refuseRename(t(errorKey(res.error)));
    liveMessage = t('story.tasks.renamed', { from: task, to: name });
    await endRename(i);
  }

  function refuseRename(message) {
    if (!renaming) return;
    renaming.busy = false;
    renaming.error = message;
    renameEl?.focus();
  }

  function onRenameKey(event, i) {
    if (event.key !== 'Escape') return;
    // Taken in the capture phase (Svelte delegates the other handlers to the document, after the dialog's own keydown
    // listener): the detail dialog must not take this Escape for its own close request.
    event.preventDefault();
    event.stopPropagation();
    endRename(i);
  }

  // Delete: one confirmation, then the focus goes to the task that took its place, or to "New task" when none is left.
  async function removeTask(task, i) {
    if (taskBusy) return;
    const button = taskControl(i, 'data-task-delete');
    if (!(await confirmDialog.confirm(t('story.tasks.delete.confirm', { name: task }), dangerous(t('story.tasks.delete.submit'))))) {
      return focusIfLost(button);
    }
    taskBusy = true;
    const res = await deleteTask(card.id, task);
    taskBusy = false;
    if (!res.ok) {
      toast({ kind: 'error', key: errorKey(res.error), message: res.error.message });
      return focusIfLost(button);
    }
    liveMessage = t('story.tasks.deleted', { name: task });
    await tick();
    focusAfterDelete(i);
  }

  function focusAfterDelete(i) {
    const rows = dialogEl?.querySelectorAll('.sd-checklist li') ?? [];
    const next = rows[Math.min(i, rows.length - 1)];
    (next?.querySelector('select, button') ?? newTaskEl)?.focus();
  }

  async function changeTask(event, task, status) {
    const select = event.currentTarget;
    const previous = taskMap?.[task] ?? 'to-do';
    const res = await setTaskStatus(card.id, task, status);
    if (res.ok) {
      liveMessage = t('story.tasks.updated', { id: task, status: taskStatus(status) });
      return;
    }
    select.value = previous;
    toast({ kind: 'error', key: errorKey(res.error), message: res.error.message });
  }

  // ---- statut -----------------------------------------------------------------------------------------
  let moveTarget = $state('');
  let moving = $state(false);
  let moveEl = $state(null);
  const targets = $derived(card ? moveTargets(card, { readonly: health.readonly }) : []);

  async function doMove() {
    moving = true;
    clearAlerts();
    const res = await moveStory(card, moveTarget);
    moving = false;
    moveTarget = '';
    await tick();
    focusIfLost(moveEl);
    if (res.ok) liveMessage = t('a11y.moved', { id: card.id, status: t(`status.${res.story.status}`) });
  }

  // ---- suppression ------------------------------------------------------------------------------------
  const dangerous = (label) => ({ confirmLabel: label, danger: true });
  const ACTIVE = new Set(['in-progress', 'review']);

  // One question (WCAG 3.3.4): a story in progress or in review is announced as such and deleted with force. The
  // server's 409 story_active (the status changed meanwhile) asks again, with the new status.
  const confirmDelete = (id, status) =>
    confirmDialog.confirm(
      ACTIVE.has(status) ? t('form.delete.confirmActive', { id, status: t(`status.${status}`) }) : t('form.delete.confirm', { id }),
      dangerous(t('form.delete.submit'))
    );

  async function removeStory() {
    clearAlerts();
    const id = card.id;
    if (!(await confirmDelete(id, card.status))) return;
    let res = await deleteStory(id, { force: ACTIVE.has(card.status) });
    if (!res.ok && res.error.code === 'story_active') {
      if (!(await confirmDelete(id, res.error.body?.status ?? 'in-progress'))) return;
      res = await deleteStory(id, { force: true });
    }
    if (res.ok) {
      consumeTrigger(); // la carte disparaît : le focus ira sur « Nouvelle story »
      return closeNow();
    }
    if (res.error.code === 'has_dependents') dependents = res.error.body?.dependents ?? [];
    else actionError = t(errorKey(res.error));
  }

  const storyHref = (id) => formatHash(route.name, route.params, { ...route.query, story: id });
</script>

{#snippet hours(value, over)}
  {#if over}
    <span class="t-over"><Icon name="warn" size={12} />{value}<span class="sr-only"> — {t('story.tasks.over')}</span></span>
  {:else}{value}{/if}
{/snippet}

{#snippet facts()}
  <div class="fm-grid">
    <div class="fm-cell"><div class="k">{t('story.field.points')}</div><div class="v"><span class="points mono">{fields.storyPoints}</span></div></div>
    <div class="fm-cell"><div class="k">{t('story.field.assignee')}</div><div class="v">{#if fields.assignedTo}<Avatar id={fields.assignedTo} size={22} />{fields.assignedTo}{:else}<span class="faint">{t('common.unassigned')}</span>{/if}</div></div>
    <div class="fm-cell"><div class="k">{t('story.field.persona')}</div><div class="v">{fields.persona || '—'}</div></div>
    <div class="fm-cell"><div class="k">{t('story.field.tddPhase')}</div><div class="v"><TddPip phase={fields.tddPhase} />{#if !fields.tddPhase || !TDD[fields.tddPhase]}<span class="faint">—</span>{/if}</div></div>
    <div class="fm-cell"><div class="k">{t('story.field.tasks')}</div><div class="v mono">{fields.tasks.completed}/{fields.tasks.total}</div></div>
    {#if estTotal > 0}
      <div class="fm-cell"><div class="k">{t('story.field.hours')}</div><div class="v mono">{estTotal} / {@render hours(actTotal, actTotal > estTotal)}</div></div>
    {/if}
  </div>
{/snippet}

{#snippet conflictPanel()}
  <div class="sd-conflict" role="group" tabindex="-1" bind:this={conflictEl} aria-labelledby="conflict-title">
    <p class="sd-conflict-title" id="conflict-title"><Icon name="warn" size={14} /> {t('form.conflict.title')}</p>
    <p>{conflict.removed ? t('form.conflict.removed') : t('form.conflict')}</p>
    <div class="sd-actions">
      {#if conflict.removed}
        <button type="button" class="btn" onclick={stopEdit}>{t('form.cancel')}</button>
      {:else}
        <button type="button" class="btn" onclick={reloadConflict}>{t('form.reload')}</button>
        <button type="button" class="btn btn-primary" onclick={keepMine}>{t('form.conflict.keep')}</button>
      {/if}
    </div>
  </div>
{/snippet}

{#snippet editSection()}
  {#if conflict}{@render conflictPanel()}{/if}
  <h3 class="sd-form-title" id="edit-heading">{t('form.title.edit')}</h3>
  <StoryForm
    bind:this={formRef}
    bind:draft
    mode="edit"
    original={base}
    idBase="edit"
    busy={saving}
    {formError}
    {serverErrors}
    submitLabel={t('form.save')}
    onsubmit={save}
    oncancel={stopEdit}
    onretry={canRetry ? () => save($state.snapshot(draft)) : null}
  />
{/snippet}

{#snippet actions()}
  <div class="sd-actions sd-toolbar">
    <button type="button" class="btn" bind:this={editBtn} onclick={startEdit}>{t('story.edit')}</button>
    <button type="button" class="btn btn-danger" onclick={removeStory}>{t('story.delete')}</button>
  </div>
{/snippet}

{#snippet moveSection()}
  <div class="sd-move">
    <label for="detail-move">{t('story.move.label')}</label>
    <select id="detail-move" bind:this={moveEl} bind:value={moveTarget} disabled={moving}>
      <option value="">{t('story.move.placeholder')}</option>
      {#each targets as status (status)}<option value={status}>{t(`status.${status}`)}</option>{/each}
    </select>
    <button type="button" class="btn" disabled={!moveTarget || moving} onclick={doMove}>{t('board.card.move')}</button>
  </div>
{/snippet}

{#snippet checklist()}
  <div class="section-h"><h3>{t('story.tasks.title')}</h3><span class="n mono">{fields.tasks.completed}/{fields.tasks.total}</span><span class="line"></span></div>
  {#if taskCounterOnly && taskEditable}<p class="sd-hint">{t('story.tasks.counterOnly')}</p>{/if}
  {#if taskList.length === 0}<p class="sd-hint">{t('story.tasks.none')}</p>{/if}
  <ul class="sd-checklist">
    {#each taskList as task, i (i)}
      {@const status = taskMap?.[task] ?? (i < counterDone ? 'done' : 'to-do')}
      <li data-task={i}>
        {#if renaming?.task === task}
          <form class="sd-task-rename" novalidate onsubmit={(e) => submitRename(e, task, i)}>
            <label class="sr-only" for="detail-task-rename">{t('story.tasks.renameField', { name: task })}</label>
            <input id="detail-task-rename" type="text" maxlength="200" autocomplete="off" bind:this={renameEl} bind:value={renaming.value} aria-invalid={renaming.error ? 'true' : undefined} aria-describedby={renaming.error ? 'detail-task-rename-error' : undefined} oninput={() => (renaming.error = '')} onkeydowncapture={(e) => onRenameKey(e, i)} />
            <button type="submit" class="btn sd-task-btn" aria-disabled={renaming.busy ? 'true' : undefined}>{t('story.tasks.renameSave')}</button>
            <button type="button" class="btn sd-task-btn" onclick={() => endRename(i)}>{t('common.cancel')}</button>
            <p class="sd-error sd-task-error" id="detail-task-rename-error" role="alert">{#if renaming.error}<Icon name="warn" size={13} /> {renaming.error}{/if}</p>
          </form>
        {:else}
          <span class="sd-task-name">{task}</span>
          {#if taskEditable}
            <select value={status} aria-label={t('story.tasks.statusOf', { id: task })} onchange={(e) => changeTask(e, task, e.currentTarget.value)}>
              {#each ['to-do', 'in-progress', 'done', 'blocked'] as s (s)}<option value={s}>{taskStatus(s)}</option>{/each}
            </select>
            <button type="button" class="btn sd-task-btn" data-task-rename aria-label={t('story.tasks.renameOf', { name: task })} onclick={() => startRename(task)}>{t('story.tasks.rename')}</button>
            <button type="button" class="btn sd-task-btn" data-task-delete aria-label={t('story.tasks.deleteOf', { name: task })} onclick={() => removeTask(task, i)}>{t('story.tasks.delete')}</button>
          {:else}
            <span class="sd-task-status">{taskStatus(status)}</span>
          {/if}
        {/if}
      </li>
    {/each}
  </ul>
  {#if taskEditable}
    <form class="sd-task-add" novalidate onsubmit={submitTask}>
      <label for="detail-task-new">{t('story.tasks.new')}</label>
      <div class="sd-task-add-row">
        <input id="detail-task-new" type="text" maxlength="200" autocomplete="off" bind:this={newTaskEl} bind:value={newTask} aria-invalid={taskError ? 'true' : undefined} aria-describedby={taskError ? 'detail-task-new-error' : undefined} oninput={() => (taskError = '')} />
        <button type="submit" class="btn" aria-disabled={addingTask ? 'true' : undefined}>{addingTask ? t('story.tasks.adding') : t('story.tasks.add')}</button>
      </div>
      <!-- Toujours présente : une erreur insérée dans une région déjà là est annoncée de façon fiable. -->
      <p class="sd-error sd-task-error" id="detail-task-new-error" role="alert">{#if taskError}<Icon name="warn" size={13} /> {taskError}{/if}</p>
    </form>
  {/if}
{/snippet}

{#snippet tasksSection()}
  {#if detail.tasks.length > 0}
    <div class="section-h"><h3>{t('story.tasks.title')}</h3><span class="n mono">{fields.tasks.completed}/{fields.tasks.total}</span><span class="line"></span></div>
    <table class="tasks">
      <thead><tr><th>{t('story.tasks.type')}</th><th>{t('story.tasks.task')}</th><th>{t('story.tasks.status')}</th><th class="num">{t('story.tasks.estimate')}</th><th class="num">{t('story.tasks.actual')}</th></tr></thead>
        <tbody>
          {#each detail.tasks as task}
            {@const overrun = (task.actual_hours || 0) > (task.estimation_hours || 0)}
            <tr>
              <td><span class="t-type" style="background: color-mix(in oklch, {TASK_TYPE[task.type] || 'var(--fg-faint)'} 16%, transparent); color: {TASK_TYPE[task.type] || 'var(--fg-dim)'}">{task.type}</span></td>
              <td class="t-name">{task.id}</td>
              <td>{taskStatus(task.status)}</td>
              <td class="t-hrs">{task.estimation_hours ?? '—'}</td>
              <td class="t-hrs">{@render hours(task.actual_hours ?? '—', overrun)}</td>
            </tr>
          {/each}
        </tbody>
    </table>
  {:else if showChecklist}
    {@render checklist()}
  {:else if detail.loading}
    <p class="detail-loading">{t('story.tasks.loading')}</p>
  {/if}
{/snippet}

{#snippet bodyEditor()}
  <div class="sd-body-edit">
    <div class="sd-field">
      <label for="detail-body">{t('story.content.label')}</label>
      <textarea id="detail-body" rows="12" bind:this={bodyArea} bind:value={bodyText} aria-describedby={bodyError ? 'detail-body-error' : undefined} aria-invalid={bodyError ? 'true' : undefined}></textarea>
    </div>
    <div class="sd-preview" role="region" aria-labelledby="detail-preview-title">
      <h4 id="detail-preview-title">{t('story.content.preview')}</h4>
      <div class="md-body">{@html previewHtml}</div>
    </div>
  </div>
  <div class="sd-body-error-region" role="alert">
    {#if bodyError}
      <p class="sd-error" id="detail-body-error"><Icon name="warn" size={13} /> {bodyError}</p>
      {#if bodyConflict}
        <div class="sd-actions">
          <button type="button" class="btn" onclick={startBody}>{t('story.content.reload')}</button>
          <button type="button" class="btn" onclick={keepMyText}>{t('form.conflict.keep')}</button>
        </div>
      {/if}
    {/if}
  </div>
  <div class="sd-actions">
    <button type="button" class="btn" onclick={stopBody}>{t('form.cancel')}</button>
    <button type="button" class="btn btn-primary" disabled={bodySaving} onclick={submitBody}>{bodySaving ? t('form.saving') : t('story.content.save')}</button>
  </div>
{/snippet}

{#snippet description()}
  {#if bodyEditing}
    <div class="section-h"><h3>{t('story.content.title')}</h3><span class="line"></span></div>
    {@render bodyEditor()}
  {:else}
    <div class="section-h">
      <h3>{t('story.description')}</h3><span class="line"></span>
      {#if canEdit && hasFile && !editing}
        <button type="button" class="btn" bind:this={bodyBtn} onclick={startBody}>{t('story.content.edit')}</button>
      {/if}
    </div>
    {#if bodyHtml}
      <div class="md-body">{@html bodyHtml}</div>
    {:else if canEdit && !hasFile}
      <p class="sd-hint">{t('story.content.noFile')}</p>
    {:else if canEdit && !detail.loading}
      <p class="sd-hint">{t('story.content.empty')}</p>
    {/if}
    {#if bodyError}<p class="sd-error" role="alert"><Icon name="warn" size={13} /> {bodyError}</p>{/if}
  {/if}
{/snippet}

{#if fields}
  <dialog
    bind:this={dialogEl}
    class="modal"
    aria-labelledby="detail-title"
    onclose={onDialogClose}
    use:asksBeforeClosing={tryClose}
    onclick={(e) => {
      if (e.target === dialogEl) tryClose();
    }}
  >
    <div class="modal-inner">
      <div class="modal-head">
        <div class="row1">
          <span class="m-id mono">{fields.id}</span>
          {#if fields.epicId}
            <span class="faint" aria-hidden="true">·</span>
            <span class="m-epic"><i aria-hidden="true" style="background: {epicHue(fields.epicId)}"></i>{fields.epicId}</span>
          {/if}
          {#if fields.readOnly}
            <span class="ro-lock"><Icon name="lock" size={13} /> {t('story.readonlyBadge')}</span>
          {/if}
          <button class="icon-btn m-close" onclick={tryClose} aria-label={t('story.close')}><Icon name="close" size={18} /></button>
        </div>
        <h2 class="modal-title" id="detail-title">{fields.title}</h2>
        <div class="modal-frontmatter">
          <span class="chip chip-soft"><i class="swatch" style="background: var({STATUS[fields.status]?.cssVar || '--border'})"></i>{STATUS[fields.status] ? t(`status.${fields.status}`) : fields.status}</span>
          <PriorityChip priority={fields.priority} />
          <TddPip phase={fields.tddPhase} />
        </div>
      </div>

      <div class="modal-body" aria-busy={detail.loading}>
        {#if canEdit && !editing && !bodyEditing}{@render actions()}{/if}

        {#if editing}
          {@render editSection()}
        {:else}
          {@render facts()}
        {/if}

        {#if fields.blockedReason}
          <div class="modal-readonly-note modal-blocked"><Icon name="warn" size={14} /> {t('story.blocked', { reason: fields.blockedReason })}</div>
        {/if}

        <!-- Région d'alerte toujours présente : un message inséré après coup est annoncé de façon fiable. -->
        <div class="sd-alert" role="alert">
          {#if actionError}<p class="sd-error"><Icon name="warn" size={13} /> {actionError}</p>{/if}
          {#if dependents.length}
            <p class="sd-error"><Icon name="warn" size={13} /> {t('form.delete.dependentsIntro', { id: fields.id })}</p>
            <ul class="sd-dependents">
              {#each dependents as dep (dep)}<li><a href={storyHref(dep)}>{dep}</a></li>{/each}
            </ul>
          {/if}
        </div>

        {#if canEdit && targets.length > 0}{@render moveSection()}{/if}

        {#if detail.error}
          <div class="modal-error" role="alert">
            <p><Icon name="warn" size={14} /> {t('story.loadError')} {t(detail.error.key)}</p>
            <button type="button" class="btn" onclick={() => loadDetail(fields.id)}>{t('common.retry')}</button>
          </div>
        {/if}

        {@render tasksSection()}
        {@render description()}

        {#if unavailable}
          <p class="modal-readonly-note">{unavailable}</p>
        {/if}

        <p class="sr-only" role="status">{liveMessage}</p>
      </div>
    </div>
  </dialog>
{/if}

<StoryCreateDialog />
<ConfirmDialog bind:this={confirmDialog} />
<PromptDialog bind:this={promptDialog} />

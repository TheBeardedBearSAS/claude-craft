<script>
  import { tick, untrack } from 'svelte';
  import Icon from './Icon.svelte';
  import Avatar from './Avatar.svelte';
  import PriorityChip from './PriorityChip.svelte';
  import TddPip from './TddPip.svelte';
  import { STATUS, TDD, TASK_TYPE, epicHue } from '../lib/config.js';
  import { buildCardDetails } from '../lib/board-nav.js';
  import { detail, openDetail, closeDetail, consumeTrigger, loadDetail } from '../lib/detail.svelte.js';
  import { route, setQuery } from '../lib/router.svelte.js';
  import { store, toast } from '../lib/store.svelte.js';
  import { health } from '../lib/health.svelte.js';
  import { linkifyStoryIds, demoteHeadings } from '../lib/markdown.js';
  import { t } from '../lib/i18n/index.svelte.js';

  let dialogEl = $state(null);

  // Toutes les fermetures (bouton, backdrop, Échap) passent par dialogEl.close(),
  // qui déclenche `onclose` — chemin UNIQUE de fermeture (évite la double
  // fermeture + la perte du retour de focus).
  function requestClose() {
    dialogEl?.close();
  }

  // Déclenché par la fermeture native du <dialog>. Retire `?story=`, réinitialise l'état puis rend
  // le focus au déclencheur APRÈS le démontage du dialog (tick), s'il existe encore.
  function onDialogClose() {
    const trigger = consumeTrigger();
    syncedId = null;
    setQuery({ story: null });
    closeDetail();
    tick().then(() => {
      if (trigger?.isConnected) trigger.focus();
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
        if (cardId) untrack(requestClose);
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

  {#if fields.blockedReason}
    <div class="modal-readonly-note modal-blocked"><Icon name="warn" size={14} /> {t('story.blocked', { reason: fields.blockedReason })}</div>
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
  {:else if detail.loading}
    <p class="detail-loading">{t('story.tasks.loading')}</p>
  {/if}
{/snippet}

{#snippet description()}
  {#if bodyHtml}
    <div class="section-h"><h3>{t('story.description')}</h3><span class="line"></span></div>
    <div class="md-body">{@html bodyHtml}</div>
  {/if}
{/snippet}

{#if fields}
  <dialog
    bind:this={dialogEl}
    class="modal"
    aria-labelledby="detail-title"
    onclose={onDialogClose}
    onclick={(e) => {
      if (e.target === dialogEl) requestClose();
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
          <button class="icon-btn m-close" onclick={() => requestClose()} aria-label={t('story.close')}><Icon name="close" size={18} /></button>
        </div>
        <h2 class="modal-title" id="detail-title">{fields.title}</h2>
        <div class="modal-frontmatter">
          <span class="chip chip-soft"><i class="swatch" style="background: var({STATUS[fields.status]?.cssVar || '--border'})"></i>{STATUS[fields.status] ? t(`status.${fields.status}`) : fields.status}</span>
          <PriorityChip priority={fields.priority} />
          <TddPip phase={fields.tddPhase} />
        </div>
      </div>

      <div class="modal-body" aria-busy={detail.loading}>
        {@render facts()}

        {#if detail.error}
          <div class="modal-error" role="alert">
            <p><Icon name="warn" size={14} /> {t('story.loadError')} {t(detail.error.key)}</p>
            <button type="button" class="btn" onclick={() => loadDetail(fields.id)}>{t('common.retry')}</button>
          </div>
        {/if}

        {@render tasksSection()}
        {@render description()}

        {#if fields.readOnly}
          <p class="modal-readonly-note">{t('story.readonly.note')}</p>
        {:else if health.readonly}
          <p class="modal-readonly-note">{t('app.banner.readonly')}</p>
        {/if}
      </div>
    </div>
  </dialog>
{/if}

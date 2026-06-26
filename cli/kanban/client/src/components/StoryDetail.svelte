<script>
  import { tick } from 'svelte';
  import Icon from './Icon.svelte';
  import Avatar from './Avatar.svelte';
  import PriorityChip from './PriorityChip.svelte';
  import TddPip from './TddPip.svelte';
  import { STATUS, TDD, TASK_TYPE, epicHue } from '../lib/config.js';
  import { buildCardDetails } from '../lib/kanban-nav.js';
  import { detail, closeDetail, consumeTrigger } from '../lib/detail.svelte.js';
  import { route } from '../lib/router.svelte.js';

  let dialogEl = $state(null);

  // Toutes les fermetures (bouton, backdrop, Échap) passent par dialogEl.close(),
  // qui déclenche `onclose` — chemin UNIQUE de fermeture (évite la double
  // fermeture + la perte du retour de focus).
  function requestClose() {
    dialogEl?.close();
  }

  // Déclenché par la fermeture native du <dialog>. Réinitialise l'état puis rend
  // le focus à l'élément déclencheur APRÈS le démontage du dialog (tick).
  function onDialogClose() {
    const trigger = consumeTrigger();
    closeDetail();
    tick().then(() => trigger?.focus?.());
  }

  // Fermer la modale si l'utilisateur change de vue (sécurité : la modale est
  // partagée/globale et ne doit pas « suivre » entre les routes).
  let lastView = route.parts[0];
  $effect(() => {
    const view = route.parts[0];
    if (view !== lastView) {
      lastView = view;
      if (detail.card) requestClose();
    }
  });

  const fields = $derived(detail.card ? buildCardDetails(detail.card) : null);
  const estTotal = $derived(detail.tasks.reduce((a, t) => a + (t.estimation_hours || 0), 0));
  const actTotal = $derived(detail.tasks.reduce((a, t) => a + (t.actual_hours || 0), 0));

  // Open the native <dialog> as soon as a card is selected (focus trap + aria-modal
  // are handled natively). Closing is driven by closeDetail() which nulls the card,
  // unmounting the dialog.
  $effect(() => {
    if (fields && dialogEl && !dialogEl.open) dialogEl.showModal();
  });
</script>

{#if fields}
  <dialog
    bind:this={dialogEl}
    class="modal"
    aria-modal="true"
    aria-labelledby="detail-title"
    onclose={onDialogClose}
    onclick={(e) => {
      if (e.target === dialogEl) requestClose();
    }}
  >
    <div class="modal-inner">
      <header class="modal-head">
        <div class="row1">
          <span class="m-id mono">{fields.id}</span>
          {#if fields.epicId}
            <span style="color: var(--fg-faint)">·</span>
            <span style="display:inline-flex; align-items:center; gap:7px; font-size:12.5px; color: var(--fg-dim)">
              <i aria-hidden="true" style="width:8px; height:8px; border-radius:50%; background: {epicHue(fields.epicId)}; display:inline-block"></i>
              {fields.epicId}
            </span>
          {/if}
          {#if fields.readOnly}
            <span class="ro-lock" style="margin-left:8px"><Icon name="lock" size={13} /> read-only</span>
          {/if}
          <button class="icon-btn m-close" onclick={() => requestClose()} aria-label="Fermer"><Icon name="close" size={18} /></button>
        </div>
        <h2 class="modal-title" id="detail-title">{fields.title}</h2>
        <div class="modal-frontmatter">
          <span class="chip chip-soft"><i class="swatch" style="background: var({STATUS[fields.status]?.cssVar || '--border'})"></i>{STATUS[fields.status]?.label || fields.status}</span>
          <PriorityChip priority={fields.priority} />
          <TddPip phase={fields.tddPhase} />
        </div>
      </header>

      <div class="modal-body">
        <div class="fm-grid">
          <div class="fm-cell"><div class="k">Points</div><div class="v"><span class="points mono">{fields.storyPoints}</span></div></div>
          <div class="fm-cell"><div class="k">Assigné</div><div class="v">{#if fields.assignedTo}<Avatar id={fields.assignedTo} size={22} />{fields.assignedTo}{:else}<span style="color: var(--fg-faint)">—</span>{/if}</div></div>
          <div class="fm-cell"><div class="k">Persona</div><div class="v">{fields.persona || '—'}</div></div>
          <div class="fm-cell"><div class="k">Phase TDD</div><div class="v"><TddPip phase={fields.tddPhase} />{#if !fields.tddPhase || !TDD[fields.tddPhase]}<span style="color: var(--fg-faint)">—</span>{/if}</div></div>
          <div class="fm-cell"><div class="k">Tâches</div><div class="v mono">{fields.tasks.completed}/{fields.tasks.total}</div></div>
          {#if estTotal > 0}
            <div class="fm-cell"><div class="k">Heures est / réel</div><div class="v mono">{estTotal} / <span class={actTotal > estTotal ? 't-over' : ''}>{actTotal}</span></div></div>
          {/if}
        </div>

        {#if fields.blockedReason}
          <div class="modal-readonly-note" style="border-color: var(--danger); color: var(--danger)">⚠ Bloqué : {fields.blockedReason}</div>
        {/if}

        {#if detail.tasks.length > 0}
          <div class="section-h"><h3>Tâches</h3><span class="n mono">{fields.tasks.completed}/{fields.tasks.total}</span><span class="line"></span></div>
          <table class="tasks">
            <thead><tr><th style="width:54px">Type</th><th>Tâche</th><th>Statut</th><th style="text-align:right">Est</th><th style="text-align:right">Réel</th></tr></thead>
            <tbody>
              {#each detail.tasks as t}
                <tr>
                  <td><span class="t-type" style="background: color-mix(in oklch, {TASK_TYPE[t.type] || 'var(--fg-faint)'} 16%, transparent); color: {TASK_TYPE[t.type] || 'var(--fg-dim)'}">{t.type}</span></td>
                  <td class="t-name">{t.id}</td>
                  <td>{t.status}</td>
                  <td class="t-hrs">{t.estimation_hours ?? '—'}</td>
                  <td class="t-hrs {(t.actual_hours || 0) > (t.estimation_hours || 0) ? 't-over' : ''}">{t.actual_hours ?? '—'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        {:else if detail.loading}
          <p aria-live="polite" style="color: var(--fg-faint); font-size:12px; margin-top:12px">Chargement des tâches…</p>
        {/if}

        {#if detail.body}
          <div class="section-h"><h3>Description</h3><span class="line"></span></div>
          <div class="md-body">{@html detail.body}</div>
        {/if}

        {#if fields.readOnly}
          <p class="modal-readonly-note">
            Carte en lecture seule — gérée par <code>.bmad/sprint-status.yaml</code> (BMAD v6 single-writer).
            Changez son statut via les commandes <code>team:</code> / <code>qa:</code>.
          </p>
        {/if}
      </div>
    </div>
  </dialog>
{/if}

<script>
  /**
   * StoryForm — création et édition d'une story (WCAG 3.3.1, 3.3.2, 3.3.3, 4.1.3 ; RGAA 11.x).
   *
   *   <StoryForm bind:this={form} bind:draft mode="edit" original={story} {busy} {formError} {serverErrors}
   *              submitLabel={t('form.save')} onsubmit={save} oncancel={cancel} />
   *
   * Le formulaire valide (story-form.js) à l'envoi : s'il y a des erreurs, un résumé en tête reçoit le focus
   * et liste des liens vers les champs. `serverErrors` ({ champ: message }) et `formError` (texte) viennent du
   * parent après un refus du serveur ; il appelle alors `form.focusSummary()`. `onsubmit(draft)` n'est appelé
   * que pour un brouillon valide.
   */
  import { tick, untrack } from 'svelte';
  import Icon from './Icon.svelte';
  import { t, tn } from '../lib/i18n/index.svelte.js';
  import { store } from '../lib/store.svelte.js';
  import { POINTS, PRIORITIES, TDD_PHASES, validateDraft } from '../lib/story-form.js';
  import { TDD } from '../lib/config.js';

  /** @type {{ draft: object, mode?: 'create'|'edit', original?: object|null, idBase?: string, busy?: boolean,
   *   busyLabel?: string, formError?: string, serverErrors?: Record<string,string>, submitLabel: string,
   *   onsubmit: (draft: object)=>void, oncancel: ()=>void, onretry?: (()=>void)|null }} */
  let {
    draft = $bindable(),
    mode = 'edit',
    original = null,
    idBase = 'sf',
    busy = false,
    busyLabel = '',
    formError = '',
    serverErrors = {},
    submitLabel,
    onsubmit,
    oncancel,
    onretry = null,
  } = $props();

  const LABELS = {
    title: 'form.field.title',
    story_points: 'form.field.points',
    priority: 'form.field.priority',
    persona: 'form.field.persona',
    assigned_to: 'form.field.assignee',
    tdd_phase: 'form.field.tddPhase',
    epic_id: 'form.field.epic',
    sprint_id: 'form.field.sprint',
    dependencies: 'form.field.dependencies',
  };
  const SHOWN = {
    create: ['title', 'story_points', 'priority', 'persona', 'epic_id', 'sprint_id'],
    edit: ['title', 'story_points', 'priority', 'assigned_to', 'tdd_phase', 'epic_id', 'sprint_id', 'dependencies'],
  };
  const fields = $derived(SHOWN[mode]);
  const busyText = $derived(busyLabel || t('form.saving'));

  const initial = untrack(() => ({ ...draft }));
  let errors = $state({});
  let errParams = $state({});
  let summaryEl = $state(null);
  let titleEl = $state(null);

  /** Focus the title field (the parent calls it once its dialog or section is visible). */
  export function focusTitle() {
    titleEl?.focus();
  }

  /** Moves the focus to the error summary (call it once the error props are set). */
  export async function focusSummary() {
    await tick();
    summaryEl?.focus();
  }

  const shown = $derived.by(() => {
    const out = {};
    for (const f of fields) {
      if (errors[f]) out[f] = t(errors[f], errParams[f]);
      else if (serverErrors[f]) out[f] = t('form.error.field.refused', { message: serverErrors[f] });
    }
    return out;
  });
  const items = $derived(fields.filter((f) => shown[f]).map((f) => ({ field: f, label: t(LABELS[f]), message: shown[f] })));
  const hasSummary = $derived(items.length > 0 || Boolean(formError));

  const describedBy = (f) => (shown[f] ? `${idBase}-${f}-err` : undefined);
  const clear = (f) => {
    if (errors[f]) errors = { ...errors, [f]: undefined };
  };

  function focusField(e, field) {
    e.preventDefault(); // le routeur lit le hash : un lien d'ancre ne doit pas naviguer
    document.getElementById(`${idBase}-${field}`)?.focus();
  }

  async function submit(e) {
    e.preventDefault();
    if (busy) return; // aria-disabled does not stop a second activation: the guard lives here
    const keep = original?.story_points == null ? undefined : String(original.story_points);
    const result = validateDraft(draft, { keep, selfId: original?.id });
    errors = result.errors;
    errParams = result.params;
    if (!result.valid) return focusSummary();
    await onsubmit?.($state.snapshot(draft));
  }

  // ---- options ----------------------------------------------------------------------------------------
  const withCurrent = (list, current) => (current && !list.includes(current) ? [...list, current] : list);

  const pointOptions = $derived(withCurrent(POINTS.map(String), initial.story_points));
  const emptyPoints = $derived(mode === 'create' || initial.story_points === '');
  const emptyPriority = $derived(initial.priority === '');
  const tddOptions = $derived(withCurrent(TDD_PHASES, initial.tdd_phase));
  const tddLabel = (p) => (!p ? t('form.option.none') : TDD[p] ? t(`tdd.${p}`) : p);
  const assignees = $derived([...new Set(store.stories.map((s) => s.assigned_to).filter(Boolean))].sort());

  const epicOptions = $derived.by(() => {
    const known = new Map(store.epics.map((e) => [e.id, e.title]));
    for (const s of store.stories) if (s.epic_id && !known.has(s.epic_id)) known.set(s.epic_id, null);
    if (draft.epic_id && !known.has(draft.epic_id)) known.set(draft.epic_id, null);
    return [...known].map(([id, title]) => ({ id, label: title ? `${id} — ${title}` : id }));
  });

  const sprintOptions = $derived.by(() => {
    // store.sprints: every sprint with its state (loaded with the current sprint); closed ones cannot take stories.
    const list = new Map(store.sprints.filter((s) => s.state !== 'closed').map((s) => [s.id, s]));
    const active = store.sprint;
    if (active?.sprint_id && !list.has(active.sprint_id)) {
      list.set(active.sprint_id, { id: active.sprint_id, name: active.name ?? active.sprint_id, state: 'active' });
    }
    if (draft.sprint_id && !list.has(draft.sprint_id)) list.set(draft.sprint_id, { id: draft.sprint_id, name: draft.sprint_id });
    return [...list.values()].map((s) => ({ id: s.id, label: s.state ? `${s.name} (${t(`sprint.state.${s.state}`)})` : s.name }));
  });
</script>

{#snippet shell(name, required, control)}
  <div class="sf-field" class:sf-wide={name === 'title' || name === 'dependencies'}>
    <label for="{idBase}-{name}">{t(LABELS[name])}{#if required}{' '}<span class="sf-req">({t('form.required')})</span>{/if}</label>
    {@render control(`${idBase}-${name}`, describedBy(name), Boolean(shown[name]), required)}
    {#if shown[name]}
      <p class="sf-error" id="{idBase}-{name}-err"><Icon name="warn" size={13} /> {shown[name]}</p>
    {/if}
  </div>
{/snippet}

{#snippet titleControl(id, desc, invalid, required)}
  <input {id} type="text" bind:this={titleEl} bind:value={draft.title} {required} aria-invalid={invalid} aria-describedby={desc} oninput={() => clear('title')} />
{/snippet}

{#snippet pointsControl(id, desc, invalid)}
  <select {id} bind:value={draft.story_points} aria-invalid={invalid} aria-describedby={desc} onchange={() => clear('story_points')}>
    {#if emptyPoints}<option value="">{t('form.option.none')}</option>{/if}
    {#each pointOptions as p (p)}<option value={p}>{p}</option>{/each}
  </select>
{/snippet}

{#snippet priorityControl(id, desc, invalid)}
  <select {id} bind:value={draft.priority} aria-invalid={invalid} aria-describedby={desc}>
    {#if emptyPriority}<option value="">{t('form.option.none')}</option>{/if}
    {#each PRIORITIES as p (p)}<option value={p}>{t(`priority.${p}`)}</option>{/each}
  </select>
{/snippet}

{#snippet personaControl(id, desc, invalid)}
  <input {id} type="text" bind:value={draft.persona} aria-invalid={invalid} aria-describedby={desc} />
{/snippet}

{#snippet assigneeControl(id, desc, invalid)}
  <input {id} type="text" list="{idBase}-assignees" maxlength="100" bind:value={draft.assigned_to} aria-invalid={invalid} aria-describedby={desc} />
  <datalist id="{idBase}-assignees">{#each assignees as a (a)}<option value={a}></option>{/each}</datalist>
{/snippet}

{#snippet tddControl(id, desc, invalid)}
  <select {id} bind:value={draft.tdd_phase} aria-invalid={invalid} aria-describedby={desc}>
    {#each tddOptions as p (p)}<option value={p}>{tddLabel(p)}</option>{/each}
  </select>
{/snippet}

{#snippet epicControl(id, desc, invalid)}
  <select {id} bind:value={draft.epic_id} aria-invalid={invalid} aria-describedby={desc}>
    <option value="">{t('form.option.none')}</option>
    {#each epicOptions as e (e.id)}<option value={e.id}>{e.label}</option>{/each}
  </select>
{/snippet}

{#snippet sprintControl(id, desc, invalid)}
  <select {id} bind:value={draft.sprint_id} aria-invalid={invalid} aria-describedby={desc}>
    <option value="">{t('story.noSprint')}</option>
    {#each sprintOptions as s (s.id)}<option value={s.id}>{s.label}</option>{/each}
  </select>
{/snippet}

{#snippet dependenciesControl(id, desc, invalid)}
  <input {id} type="text" bind:value={draft.dependencies} aria-invalid={invalid} aria-describedby={desc} oninput={() => clear('dependencies')} />
{/snippet}

<form class="sf" novalidate onsubmit={submit}>
  <div class="sf-summary" class:sf-summary-hidden={!hasSummary} role={hasSummary ? 'group' : undefined} tabindex="-1" bind:this={summaryEl} aria-labelledby={hasSummary ? `${idBase}-summary-title` : undefined}>
    {#if hasSummary}
      <p class="sf-summary-title" id="{idBase}-summary-title">
        <Icon name="warn" size={14} /> {formError || tn('form.errorSummary', items.length)}
      </p>
      {#if onretry}
        <button type="button" class="btn sf-retry" onclick={() => onretry()}>{t('common.retry')}</button>
      {/if}
      {#if items.length}
        <ul>
          {#each items as item (item.field)}
            <li><a href="#{idBase}-{item.field}" onclick={(e) => focusField(e, item.field)}>{t('form.error.item', { label: item.label, message: item.message })}</a></li>
          {/each}
        </ul>
      {/if}
    {/if}
  </div>

  <div class="sf-grid">
    {@render shell('title', true, titleControl)}
    {@render shell('story_points', false, pointsControl)}
    {@render shell('priority', false, priorityControl)}
    {#if mode === 'create'}
      {@render shell('persona', false, personaControl)}
    {:else}
      {@render shell('assigned_to', false, assigneeControl)}
      {@render shell('tdd_phase', false, tddControl)}
    {/if}
    {@render shell('epic_id', false, epicControl)}
    {@render shell('sprint_id', false, sprintControl)}
    {#if mode === 'edit'}
      {@render shell('dependencies', false, dependenciesControl)}
    {/if}
  </div>

  <div class="sf-actions">
    <button type="button" class="btn" onclick={() => oncancel?.()}>{t('form.cancel')}</button>
    <button type="submit" class="btn btn-primary" aria-disabled={busy ? 'true' : undefined}>{busy ? busyText : submitLabel}</button>
  </div>
  <p class="sr-only" role="status">{busy ? busyText : ''}</p>
</form>

<style>
  .sf {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .sf-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
    gap: 14px 16px;
  }
  .sf-wide {
    grid-column: 1 / -1;
  }
  .sf-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }
  .sf-field label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--fg);
  }
  .sf-req {
    font-weight: 400;
    color: var(--fg-dim);
  }
  .sf input,
  .sf select {
    min-height: 32px;
    width: 100%;
    box-sizing: border-box;
    padding: 6px 10px;
    background: var(--bg-inset);
    color: var(--fg);
    border: 1px solid var(--border-control);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
  }
  .sf input[aria-invalid='true'],
  .sf select[aria-invalid='true'] {
    border-color: var(--danger);
    border-width: 2px;
  }
  .sf-error {
    display: flex;
    align-items: flex-start;
    gap: 5px;
    margin: 0;
    font-size: 0.8125rem;
    color: var(--danger);
  }
  .sf-summary {
    border: 1px solid var(--danger);
    border-radius: var(--radius);
    padding: 12px 14px;
    background: var(--danger-soft);
  }
  .sf-summary-hidden {
    display: none;
  }
  .sf-summary:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .sf-summary-title {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin: 0;
    font-weight: 600;
    color: var(--fg);
  }
  .sf-summary ul {
    margin: 8px 0 0;
    padding-left: 20px;
    list-style: disc;
  }
  .sf-retry {
    margin-top: 8px;
  }
  .sf-summary a {
    display: inline-block;
    min-height: 24px;
    color: var(--fg);
    text-decoration: underline;
  }
  .sf-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
  }
  .sf-actions .btn {
    min-height: 32px;
    justify-content: center;
  }
</style>

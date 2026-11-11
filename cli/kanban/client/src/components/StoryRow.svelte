<script>
  import { setQuery } from '../lib/router.svelte.js';
  import { t } from '../lib/i18n/index.svelte.js';
  import { STATUS } from '../lib/config.js';
  import Icon from './Icon.svelte';
  import Avatar from './Avatar.svelte';
  import PriorityChip from './PriorityChip.svelte';
  import Points from './Points.svelte';

  /**
   * One story of the Backlog list; opens the detail through `?story=<id>`.
   * `plan` (absent when the story cannot be planned: read-only server, archived story) carries the planning controls:
   * { selected, onToggle(id), sprintName (sprint the story is in, if open), addLabel (null when no target),
   *   inTarget, busy, onAction(story) }.
   * @type {{ story: object, plan?: object|null }}
   */
  let { story, plan = null } = $props();
  const status = $derived(STATUS[story.status] ? t(`status.${story.status}`) : story.status);
</script>

<li class="story-item" class:is-selected={plan?.selected}>
  {#if plan}
    <label class="row-select">
      <input type="checkbox" checked={plan.selected} onchange={() => plan.onToggle(story.id)} aria-label={t('backlog.row.select', { id: story.id })} />
    </label>
  {/if}
  <button type="button" class="story-row" onclick={() => setQuery({ story: story.id })}>
    <span class="s-id mono">{story.id}</span>
    <span class="s-title">{story.title}</span>
    {#if story._writable === false}
      <span class="ro-lock"><Icon name="lock" size={12} /><span class="sr-only">{t('backlog.row.readonly')}</span></span>
    {/if}
    {#if plan?.sprintName}<span class="s-sprint">{t('backlog.row.inSprint', { sprint: plan.sprintName })}</span>{/if}
    <PriorityChip priority={story.priority} />
    <Points value={story.story_points} />
    <span class="s-status"><i style:background="var({STATUS[story.status]?.cssVar || '--fg-faint'})"></i>{status}</span>
    <Avatar id={story.assigned_to} size={24} />
  </button>
  {#if plan && (plan.inTarget || plan.addLabel)}
    <button type="button" class="btn row-plan" disabled={plan.busy} onclick={() => plan.onAction(story)}>
      <Icon name={plan.inTarget ? 'close' : 'plus'} size={14} />
      <span>{plan.inTarget ? t('backlog.plan.remove') : plan.addLabel}<span class="sr-only"> {story.id}</span></span>
    </button>
  {/if}
</li>

<script>
  import { setQuery } from '../lib/router.svelte.js';
  import { t } from '../lib/i18n/index.svelte.js';
  import { STATUS } from '../lib/config.js';
  import Icon from './Icon.svelte';
  import Avatar from './Avatar.svelte';
  import PriorityChip from './PriorityChip.svelte';
  import Points from './Points.svelte';

  /** One story of the Backlog list; opens the detail through `?story=<id>`. @type {{ story: object }} */
  let { story } = $props();
  const status = $derived(STATUS[story.status] ? t(`status.${story.status}`) : story.status);
</script>

<li>
  <button type="button" class="story-row" onclick={() => setQuery({ story: story.id })}>
    <span class="s-id mono">{story.id}</span>
    <span class="s-title">{story.title}</span>
    {#if story._writable === false}
      <span class="ro-lock"><Icon name="lock" size={12} /><span class="sr-only">{t('backlog.row.readonly')}</span></span>
    {/if}
    <PriorityChip priority={story.priority} />
    <Points value={story.story_points} />
    <span class="s-status"><i style:background="var({STATUS[story.status]?.cssVar || '--fg-faint'})"></i>{status}</span>
    <Avatar id={story.assigned_to} size={24} />
  </button>
</li>

<script>
  /**
   * Toast stack (audit K-26). Two sibling live regions that are never nested and always present:
   * `role="status"` for confirmations, `role="alert"` for errors (which never expire).
   * Hovering or focusing a region pauses the timers of its toasts; every toast has a labelled close button.
   * The text is computed here (toastText), so a change of language also changes the toasts on screen.
   */
  import { tick } from 'svelte';
  import { store, dismissToast, pauseToast, resumeToast } from '../lib/store.svelte.js';
  import { t, tn } from '../lib/i18n/index.svelte.js';
  import { toastText } from '../lib/toasts.js';
  import Icon from './Icon.svelte';

  let infos = $derived(store.toasts.filter((x) => x.kind !== 'error'));
  let errors = $derived(store.toasts.filter((x) => x.kind === 'error'));

  // The close button disappears with its toast: hand focus to the next toast, else to <main> (never <body>).
  async function close(id, e) {
    const hadFocus = e.currentTarget === document.activeElement;
    dismissToast(id);
    if (!hadFocus) return;
    await tick();
    (document.querySelector('.toast-close') ?? document.getElementById('main'))?.focus();
  }

  // Pointer over or focus inside a region: its toasts stop counting down (WCAG 2.2.1), and start again on leave.
  function pausing(list) {
    const pause = () => list().forEach((x) => pauseToast(x.id));
    const resume = () => list().forEach((x) => resumeToast(x.id));
    return { onmouseenter: pause, onmouseleave: resume, onfocusin: pause, onfocusout: resume };
  }
  const icon = (kind) => (kind === 'error' ? 'warn' : kind === 'success' ? 'check' : 'arrowR');
</script>

{#snippet item(toast)}
  <div class="toast {toast.kind}">
    <span class="t-ico {toast.kind}"><Icon name={icon(toast.kind)} size={16} /></span>
    <div class="t-msg">{toastText(toast, { t, tn })}</div>
    <button type="button" class="toast-close" aria-label={t('app.toast.dismiss')} onclick={(e) => close(toast.id, e)}>
      <Icon name="close" size={16} />
    </button>
  </div>
{/snippet}

<div class="toast-region">
  <div role="status" aria-label={t('app.toast.region')} {...pausing(() => infos)}>
    {#each infos as toast (toast.id)}{@render item(toast)}{/each}
  </div>
  <div role="alert" aria-label={t('app.toast.alertRegion')} {...pausing(() => errors)}>
    {#each errors as toast (toast.id)}{@render item(toast)}{/each}
  </div>
</div>

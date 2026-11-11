<script>
  /**
   * Toast stack (audit K-26). Two sibling live regions that are never nested and always present:
   * `role="status"` for confirmations, `role="alert"` for errors (which never expire).
   * Hovering or focusing a toast pauses its timer; every toast has a labelled close button.
   */
  import { tick } from 'svelte';
  import { store, dismissToast, pauseToast, resumeToast } from '../lib/store.svelte.js';
  import { t } from '../lib/i18n/index.svelte.js';
  import Icon from './Icon.svelte';

  let infos = $derived(store.toasts.filter((x) => x.kind !== 'error'));
  let errors = $derived(store.toasts.filter((x) => x.kind === 'error'));

  // The store emits raw status ids and an optional list of missing prerequisites.
  function text(toast) {
    if (!toast.key) return toast.message;
    const params = { ...toast.params };
    if (toast.key === 'toast.moved') params.status = t(`status.${params.status}`);
    const key = toast.key === 'toast.transition_failed' && params.missing ? 'toast.transitionMissing' : toast.key;
    return t(key, params);
  }

  // The close button disappears with its toast: hand focus to the next toast, else to <main> (never <body>).
  async function close(id, e) {
    const hadFocus = e.currentTarget === document.activeElement;
    dismissToast(id);
    if (!hadFocus) return;
    await tick();
    (document.querySelector('.toast-close') ?? document.getElementById('main'))?.focus();
  }

  const icon = (kind) => (kind === 'error' ? 'warn' : kind === 'success' ? 'check' : 'arrowR');
</script>

{#snippet item(toast)}
  <div
    class="toast {toast.kind}"
    onmouseenter={() => pauseToast(toast.id)}
    onmouseleave={() => resumeToast(toast.id)}
    onfocusin={() => pauseToast(toast.id)}
    onfocusout={() => resumeToast(toast.id)}
  >
    <span class="t-ico {toast.kind}"><Icon name={icon(toast.kind)} size={16} /></span>
    <div class="t-msg">{text(toast)}</div>
    <button type="button" class="toast-close" aria-label={t('app.toast.dismiss')} onclick={(e) => close(toast.id, e)}>
      <Icon name="close" size={16} />
    </button>
  </div>
{/snippet}

<div class="toast-region">
  <div role="status" aria-label={t('app.toast.region')}>
    {#each infos as toast (toast.id)}{@render item(toast)}{/each}
  </div>
  <div role="alert" aria-label={t('app.toast.alertRegion')}>
    {#each errors as toast (toast.id)}{@render item(toast)}{/each}
  </div>
</div>

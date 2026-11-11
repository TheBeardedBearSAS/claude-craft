<script>
  import { opener } from '../lib/opener.js';
  import { focusLost } from '../lib/story-form.js';
  import { tweaks, setTweak, DENSITIES } from '../lib/tweaks.svelte.js';
  import { ACCENTS } from '../lib/config.js';
  import { SUPPORTED_LOCALES } from '../lib/i18n/translate.js';
  import { t, setLocale } from '../lib/i18n/index.svelte.js';
  import Icon from './Icon.svelte';
  import WipSettings from './WipSettings.svelte';

  let dialog = $state(null);
  let triggerEl = $state(null);

  /** Ouvre le panneau (appelé par le parent via bind:this). */
  export function open() {
    triggerEl = opener();
    dialog?.showModal();
  }

  function close() {
    dialog?.close();
  }

  // `close` comes with the next rendered frame: a control the user has reached meanwhile keeps the focus.
  function onClose() {
    if (focusLost(document.activeElement, document.body, dialog)) triggerEl?.focus();
    triggerEl = null;
  }

  const SCHEMES = ['status', 'priority', 'tdd', 'epic'];
  // Touches affichées dans l'aide clavier : [raccourci, clé de libellé].
  const SHORTCUTS = [
    ['↑ ↓', 'settings.keyboard.navigate'],
    ['← →', 'settings.keyboard.column'],
    ['Alt+M', 'settings.keyboard.move'],
    ['1–6', 'settings.keyboard.toColumn'],
    ['Enter', 'settings.keyboard.details'],
    ['Esc', 'settings.keyboard.close'],
    ['Ctrl+K  /', 'settings.keyboard.search'],
  ];
</script>

<dialog
  bind:this={dialog}
  class="tweaks-dialog"
  aria-labelledby="tweaks-title"
  onclose={onClose}
  onclick={(e) => { if (e.target === dialog) close(); }}
>
  <div class="tweaks-inner">
    <div class="tweaks-head">
      <h2 id="tweaks-title">{t('settings.title')}</h2>
      <button type="button" class="icon-btn" onclick={close} aria-label={t('settings.close')}><Icon name="close" size={18} /></button>
    </div>

    <section class="tweaks-section" aria-labelledby="tw-scheme">
      <h3 class="tweaks-label" id="tw-scheme">{t('settings.scheme.label')}</h3>
      <div class="tweaks-grid">
        {#each SCHEMES as key}
          <button
            type="button"
            class="tweak-opt"
            class:selected={tweaks.codingScheme === key}
            aria-pressed={tweaks.codingScheme === key}
            onclick={() => setTweak('codingScheme', key)}
          >{t(`settings.scheme.${key}`)}</button>
        {/each}
      </div>
      <p class="tweaks-hint">{t('settings.scheme.hint')}</p>
    </section>

    <section class="tweaks-section" aria-labelledby="tw-accent">
      <h3 class="tweaks-label" id="tw-accent">{t('settings.accent.label')}</h3>
      <div class="tweaks-swatches">
        {#each Object.entries(ACCENTS) as [name, ac]}
          <button
            type="button"
            class="swatch-btn"
            class:selected={tweaks.accent === name}
            aria-pressed={tweaks.accent === name}
            aria-label={t('settings.accent.option', { name: t(`settings.accent.${name}`) })}
            title={t(`settings.accent.${name}`)}
            style="--sw: {ac.a};"
            onclick={() => setTweak('accent', name)}
          ></button>
        {/each}
      </div>
    </section>

    <section class="tweaks-section" aria-labelledby="tw-density">
      <h3 class="tweaks-label" id="tw-density">{t('settings.density.label')}</h3>
      <div class="tweaks-grid two">
        {#each DENSITIES as d}
          <button
            type="button"
            class="tweak-opt"
            class:selected={tweaks.density === d}
            aria-pressed={tweaks.density === d}
            onclick={() => setTweak('density', d)}
          >{t(`settings.density.${d}`)}</button>
        {/each}
      </div>
    </section>

    <section class="tweaks-section">
      <label class="tweaks-label" for="tw-lang">{t('settings.language.label')}</label>
      <select id="tw-lang" class="tweaks-select" value={tweaks.lang ?? ''} onchange={(e) => setLocale(e.currentTarget.value || null)}>
        <option value="">{t('settings.language.auto')}</option>
        {#each SUPPORTED_LOCALES as code}
          <option value={code} lang={code}>{t(`settings.language.${code}`)}</option>
        {/each}
      </select>
      <p class="tweaks-hint">{t('settings.language.hint')}</p>
    </section>

    <section class="tweaks-section" aria-labelledby="tw-wip">
      <WipSettings />
    </section>

    <section class="tweaks-section" aria-labelledby="tw-keys">
      <h3 class="tweaks-label" id="tw-keys">{t('settings.keyboard.title')}</h3>
      <dl class="tweaks-keys">
        {#each SHORTCUTS as [keys, label]}
          <dt><kbd class="mono">{keys}</kbd></dt>
          <dd>{t(label)}</dd>
        {/each}
      </dl>
    </section>
  </div>
</dialog>

<style>
  .tweaks-dialog {
    margin: auto; /* the global reset zeroes the UA margin that centres a modal <dialog> */
    width: min(380px, 94vw); padding: 0;
    border: 1px solid var(--border-strong); border-radius: var(--radius-lg);
    background: var(--bg-elev); color: var(--fg); box-shadow: var(--shadow-lg);
  }
  .tweaks-dialog::backdrop { background: oklch(0.1 0.01 264 / 0.6); backdrop-filter: blur(3px); }
  .tweaks-inner { padding: 20px 22px 22px; }
  .tweaks-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .tweaks-head h2 { font-size: 1rem; font-weight: 600; }
  .tweaks-section { margin-bottom: 18px; }
  .tweaks-section:last-child { margin-bottom: 0; }
  .tweaks-label {
    display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.07em;
    color: var(--fg-faint); font-weight: 600; margin-bottom: 9px;
  }
  .tweaks-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .tweaks-hint { font-size: 0.75rem; color: var(--fg-faint); margin-top: 9px; line-height: 1.5; }
  .tweak-opt {
    padding: 9px 10px; border-radius: 9px; font-size: 0.8125rem; font-weight: 600; text-align: left; min-height: 36px;
    border: 1px solid var(--border-control); background: var(--bg-elev); color: var(--fg-dim);
    transition: background .12s, border-color .12s, color .12s;
  }
  .tweak-opt:hover { border-color: var(--border-strong); color: var(--fg); }
  .tweak-opt.selected { border-color: var(--accent-ring); background: var(--accent-soft); color: var(--fg); }
  .tweaks-select { width: 100%; min-height: 36px; border-radius: 9px; }
  .tweaks-keys { display: grid; grid-template-columns: auto 1fr; gap: 6px 14px; align-items: center; font-size: 0.8125rem; }
  .tweaks-keys dt kbd {
    font-size: 0.75rem; padding: 2px 7px; background: var(--bg-inset);
    border: 1px solid var(--border-control); border-radius: 5px; white-space: pre;
  }
  .tweaks-keys dd { margin: 0; color: var(--fg-dim); }
  .tweaks-dialog { max-height: 94vh; overflow: auto; }
  .tweaks-swatches { display: flex; gap: 10px; }
  .swatch-btn {
    width: 34px; height: 34px; border-radius: 50%; background: var(--sw);
    border: 2px solid transparent; box-shadow: 0 0 0 1px var(--border-faint);
    transition: transform .12s;
  }
  .swatch-btn:hover { transform: scale(1.08); }
  .swatch-btn.selected { border-color: var(--bg-elev); box-shadow: 0 0 0 2px var(--sw); }
  /* Forced colours: the selected option loses its fill; the accent swatches keep their hue (it is the choice). */
  @media (forced-colors: active) {
    .tweak-opt.selected { border: 3px solid CanvasText; padding: 7px 8px; }
    .swatch-btn { forced-color-adjust: none; border-color: CanvasText; box-shadow: none; }
    .swatch-btn.selected { border-color: CanvasText; box-shadow: 0 0 0 2px Canvas, 0 0 0 5px CanvasText; }
    .swatch-btn:focus-visible { outline-color: CanvasText; outline-offset: 6px; }
  }
</style>

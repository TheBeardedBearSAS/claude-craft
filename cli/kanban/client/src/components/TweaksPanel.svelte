<script>
  import { tweaks, setTweak, ACCENTS, DENSITIES } from '../lib/tweaks.svelte.js';
  import Icon from './Icon.svelte';

  let dialog = $state(null);
  let triggerEl = $state(null);

  /** Ouvre le panneau (appelé par le parent via bind:this). */
  export function open() {
    triggerEl = document.activeElement;
    dialog?.showModal();
  }

  function close() {
    dialog?.close();
  }

  function onClose() {
    if (triggerEl) {
      triggerEl.focus();
      triggerEl = null;
    }
  }

  const SCHEMES = [
    ['status', 'Statut'],
    ['priority', 'Priorité'],
    ['tdd', 'Phase TDD'],
    ['epic', 'Epic'],
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
    <header class="tweaks-head">
      <h2 id="tweaks-title">Réglages d'affichage</h2>
      <button class="icon-btn" onclick={close} aria-label="Fermer"><Icon name="close" size={18} /></button>
    </header>

    <section class="tweaks-section">
      <div class="tweaks-label">Code couleur des cartes</div>
      <div class="tweaks-grid">
        {#each SCHEMES as [key, label]}
          <button
            class="tweak-opt"
            class:selected={tweaks.codingScheme === key}
            aria-pressed={tweaks.codingScheme === key}
            onclick={() => setTweak('codingScheme', key)}
          >{label}</button>
        {/each}
      </div>
      <p class="tweaks-hint">Définit la couleur de la barre d'accent gauche de chaque carte du board.</p>
    </section>

    <section class="tweaks-section">
      <div class="tweaks-label">Accent</div>
      <div class="tweaks-swatches">
        {#each Object.entries(ACCENTS) as [name, ac]}
          <button
            class="swatch-btn"
            class:selected={tweaks.accent === name}
            aria-pressed={tweaks.accent === name}
            aria-label={`Accent ${name}`}
            title={name}
            style="--sw: {ac.a};"
            onclick={() => setTweak('accent', name)}
          ></button>
        {/each}
      </div>
    </section>

    <section class="tweaks-section">
      <div class="tweaks-label">Densité</div>
      <div class="tweaks-grid two">
        {#each DENSITIES as d}
          <button
            class="tweak-opt"
            class:selected={tweaks.density === d}
            aria-pressed={tweaks.density === d}
            onclick={() => setTweak('density', d)}
          >{d === 'compact' ? 'Compacte' : 'Confortable'}</button>
        {/each}
      </div>
    </section>
  </div>
</dialog>

<style>
  .tweaks-dialog {
    width: min(380px, 94vw); padding: 0;
    border: 1px solid var(--border-strong); border-radius: var(--radius-lg);
    background: var(--bg-elev); color: var(--fg); box-shadow: var(--shadow-lg);
  }
  .tweaks-dialog::backdrop { background: oklch(0.1 0.01 264 / 0.6); backdrop-filter: blur(3px); }
  .tweaks-inner { padding: 20px 22px 22px; }
  .tweaks-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .tweaks-head h2 { font-size: 16px; font-weight: 600; }
  .tweaks-section { margin-bottom: 18px; }
  .tweaks-section:last-child { margin-bottom: 0; }
  .tweaks-label {
    font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.07em;
    color: var(--fg-faint); font-weight: 600; margin-bottom: 9px;
  }
  .tweaks-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .tweaks-hint { font-size: 11px; color: var(--fg-faint); margin-top: 9px; line-height: 1.5; }
  .tweak-opt {
    padding: 9px 10px; border-radius: 9px; font-size: 12.5px; font-weight: 600; text-align: left;
    border: 1px solid var(--border); background: var(--bg-elev); color: var(--fg-dim);
    transition: background .12s, border-color .12s, color .12s;
  }
  .tweak-opt:hover { border-color: var(--border-strong); color: var(--fg); }
  .tweak-opt.selected { border-color: var(--accent-ring); background: var(--accent-soft); color: var(--fg); }
  .tweaks-swatches { display: flex; gap: 10px; }
  .swatch-btn {
    width: 34px; height: 34px; border-radius: 50%; background: var(--sw);
    border: 2px solid transparent; box-shadow: 0 0 0 1px var(--border-faint);
    transition: transform .12s;
  }
  .swatch-btn:hover { transform: scale(1.08); }
  .swatch-btn.selected { border-color: var(--bg-elev); box-shadow: 0 0 0 2px var(--sw); }
</style>

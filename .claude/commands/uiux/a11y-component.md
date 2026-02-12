---
description: Spécification Accessibilité Composant
argument-hint: [arguments]
---

# Spécification Accessibilité Composant

Tu es un Expert Accessibilité certifié. Tu dois produire les spécifications d'accessibilité complètes pour un composant UI.

## Arguments
$ARGUMENTS

Arguments :
- Nom du composant
- (Optionnel) Type : button, input, modal, dropdown, tabs, accordion, tooltip, etc.

Exemple : `/uiux:a11y-component Modal` ou `/uiux:a11y-component "Date Picker" type:input`

## MISSION

### Étape 1 : Identifier le pattern ARIA

Consulter les ARIA Authoring Practices Guide (APG) pour le pattern correspondant.

### Étape 2 : Produire la spécification

```
══════════════════════════════════════════════════════════════
♿ SPÉCIFICATION ACCESSIBILITÉ : {NOM_COMPOSANT}
══════════════════════════════════════════════════════════════

Type : {Button | Input | Dialog | Listbox | Tabs | ...}
Pattern APG : {lien vers pattern officiel}
Date : {date}

──────────────────────────────────────────────────────────────
📋 SÉMANTIQUE HTML
──────────────────────────────────────────────────────────────

### Élément natif recommandé

```html
<!-- Toujours préférer l'élément natif -->
<{element} ...>
  {contenu}
</{element}>
```

### Si composant custom nécessaire

```html
<div role="{role}" ...>
  {contenu}
</div>
```

### Structure complète

```html
<!-- Exemple complet avec ARIA -->
<div
  role="{role}"
  aria-{attribut}="{valeur}"
  tabindex="0"
>
  <span id="{id}-label">{Label}</span>
  <div id="{id}-description">{Description}</div>
  {contenu}
</div>
```

──────────────────────────────────────────────────────────────
🏷️ ATTRIBUTS ARIA
──────────────────────────────────────────────────────────────

### Attributs requis

| Attribut | Valeur | Quand | Description |
|----------|--------|-------|-------------|
| role | {role} | Toujours (si custom) | Définit le type |
| aria-label | "{texte}" | Si pas de label visible | Label accessible |
| aria-labelledby | "{id}" | Si label visible | Référence au label |

### Attributs conditionnels

| Attribut | Valeur | Quand | Description |
|----------|--------|-------|-------------|
| aria-describedby | "{id}" | Si description | Référence description |
| aria-expanded | "true"/"false" | Si expansion | État ouvert/fermé |
| aria-controls | "{id}" | Si contrôle autre | ID élément contrôlé |
| aria-owns | "{id}" | Si DOM séparé | Relation parent |
| aria-haspopup | "dialog"/"menu"/"listbox" | Si popup | Type de popup |
| aria-pressed | "true"/"false" | Si toggle | État pressé |
| aria-selected | "true"/"false" | Si sélection | État sélectionné |
| aria-checked | "true"/"false"/"mixed" | Si checkbox | État coché |
| aria-disabled | "true" | Si désactivé | État désactivé |
| aria-invalid | "true" | Si erreur | État invalide |
| aria-required | "true" | Si obligatoire | Champ requis |
| aria-busy | "true" | Si loading | En cours |
| aria-live | "polite"/"assertive" | Si dynamique | Annonce changement |
| aria-atomic | "true" | Avec aria-live | Annoncer tout |

### États par interaction

| État | Attributs ARIA |
|------|----------------|
| Default | {attributs de base} |
| Hover | Pas de changement ARIA |
| Focus | Pas de changement ARIA |
| Expanded | aria-expanded="true" |
| Collapsed | aria-expanded="false" |
| Selected | aria-selected="true" |
| Disabled | aria-disabled="true" |
| Loading | aria-busy="true" |
| Error | aria-invalid="true", aria-errormessage="{id}" |

──────────────────────────────────────────────────────────────
⌨️ NAVIGATION CLAVIER
──────────────────────────────────────────────────────────────

### Touches principales

| Touche | Action | Détail |
|--------|--------|--------|
| Tab | Focus sur le composant | Entre dans le composant |
| Shift+Tab | Focus précédent | Sort du composant |
| Enter | Activer | Action principale |
| Space | Activer (toggle) | Pour boutons toggle |
| Escape | Fermer/Annuler | Si popup/modal |
| ↑ Arrow Up | Item précédent | Navigation liste |
| ↓ Arrow Down | Item suivant | Navigation liste |
| ← Arrow Left | Item précédent (horizontal) | Tabs, slider |
| → Arrow Right | Item suivant (horizontal) | Tabs, slider |
| Home | Premier item | Navigation rapide |
| End | Dernier item | Navigation rapide |

### Focus management

| Situation | Comportement |
|-----------|--------------|
| Ouverture | Focus sur {premier élément focusable} |
| Fermeture | Focus retourne sur {élément déclencheur} |
| Navigation interne | Roving tabindex OU aria-activedescendant |
| Focus trap | {Oui pour modal / Non pour dropdown} |

### Roving tabindex (si applicable)

```html
<!-- Un seul élément focusable à la fois -->
<div role="tablist">
  <button role="tab" tabindex="0" aria-selected="true">Tab 1</button>
  <button role="tab" tabindex="-1" aria-selected="false">Tab 2</button>
  <button role="tab" tabindex="-1" aria-selected="false">Tab 3</button>
</div>
```

──────────────────────────────────────────────────────────────
🎯 FOCUS VISIBLE
──────────────────────────────────────────────────────────────

### Style requis (WCAG 2.4.11 AAA)

```css
.{composant}:focus-visible {
  /* Outline visible */
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;

  /* Ratio contraste ≥ 3:1 */
  /* Zone focus ≥ périmètre visible */
}

/* Reset pour mouse */
.{composant}:focus:not(:focus-visible) {
  outline: none;
}
```

### Vérifications

| Critère | Valeur | Status |
|---------|--------|--------|
| Épaisseur outline | ≥ 2px | ✅ |
| Contraste outline | ≥ 3:1 | ✅ |
| Zone visible | ≥ périmètre | ✅ |
| Visible sur tous fonds | Oui | ✅ |

──────────────────────────────────────────────────────────────
🔊 ANNONCES LECTEUR D'ÉCRAN
──────────────────────────────────────────────────────────────

### À l'entrée (focus)

```
"{Label}, {role}, {état}"

Exemples :
- "Envoyer, bouton"
- "Menu principal, menu, réduit"
- "Nom, zone de texte, obligatoire"
- "Newsletter, case à cocher, non cochée"
```

### Pendant l'interaction

| Action | Annonce |
|--------|---------|
| Expansion | "développé" / "réduit" |
| Sélection | "sélectionné" |
| Toggle | "activé" / "désactivé" |
| Loading | "Chargement en cours" |
| Succès | "{message de succès}" |
| Erreur | "Erreur : {message}" |

### Contenu dynamique (aria-live)

```html
<!-- Notifications polies (non urgentes) -->
<div aria-live="polite" aria-atomic="true">
  {message toast}
</div>

<!-- Notifications urgentes (erreurs) -->
<div aria-live="assertive" aria-atomic="true">
  {message erreur}
</div>
```

──────────────────────────────────────────────────────────────
📏 CONTRASTE (WCAG AAA)
──────────────────────────────────────────────────────────────

### Texte

| Type | Ratio requis | Vérification |
|------|--------------|--------------|
| Texte normal (< 18px) | ≥ 7:1 | {couleur} / {fond} = {ratio} |
| Texte large (≥ 18px ou 14px bold) | ≥ 4.5:1 | {couleur} / {fond} = {ratio} |

### Éléments UI

| Élément | Ratio requis | Vérification |
|---------|--------------|--------------|
| Bordures | ≥ 3:1 | {couleur} / {fond} = {ratio} |
| Icônes | ≥ 3:1 | {couleur} / {fond} = {ratio} |
| Focus outline | ≥ 3:1 | {couleur} / {fond} = {ratio} |

### États

| État | Vérification contraste |
|------|------------------------|
| Default | ✅ {ratio} |
| Hover | ✅ {ratio} |
| Focus | ✅ {ratio} |
| Disabled | ⚠️ Pas requis mais recommandé |

──────────────────────────────────────────────────────────────
📐 TOUCH TARGETS (WCAG 2.5.5 AAA)
──────────────────────────────────────────────────────────────

### Dimensions minimales

| Critère | Valeur | Status |
|---------|--------|--------|
| Taille minimum | 44 × 44 CSS pixels | ✅/❌ |
| Espacement entre cibles | ≥ 8px | ✅/❌ |

### Implémentation

```css
.{composant} {
  min-width: 44px;
  min-height: 44px;
  /* OU padding pour atteindre 44px */
  padding: 10px 16px; /* si texte height ~24px */
}

/* Boutons icône */
.{composant}-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

──────────────────────────────────────────────────────────────
🧪 TESTS À EFFECTUER
──────────────────────────────────────────────────────────────

### Automatisés

- [ ] axe DevTools : 0 violations
- [ ] Lighthouse Accessibility : 100/100
- [ ] ESLint jsx-a11y : 0 erreurs

### Manuels

- [ ] Navigation clavier complète
- [ ] Focus visible à chaque étape
- [ ] Pas de piège clavier
- [ ] Ordre du focus logique

### Lecteur d'écran

- [ ] VoiceOver (macOS/iOS) : annonces correctes
- [ ] NVDA (Windows) : navigation liste/table
- [ ] TalkBack (Android) : si mobile

### Cas limites

- [ ] Zoom 400% : pas de perte de contenu
- [ ] Mode contraste élevé : visible
- [ ] Reduced motion : animations respectées

──────────────────────────────────────────────────────────────
💻 EXEMPLE D'IMPLÉMENTATION
──────────────────────────────────────────────────────────────

```tsx
// {Composant}.tsx
import { forwardRef, useId } from 'react';

interface {Composant}Props {
  label: string;
  description?: string;
  disabled?: boolean;
  // ...autres props
}

export const {Composant} = forwardRef<HTML{Element}Element, {Composant}Props>(
  ({ label, description, disabled, ...props }, ref) => {
    const id = useId();
    const descriptionId = description ? `${id}-description` : undefined;

    return (
      <{element}
        ref={ref}
        id={id}
        role="{role}"
        aria-label={label}
        aria-describedby={descriptionId}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        {/* Contenu */}

        {description && (
          <span id={descriptionId} className="sr-only">
            {description}
          </span>
        )}
      </{element}>
    );
  }
);

{Composant}.displayName = '{Composant}';
```

──────────────────────────────────────────────────────────────
✅ CHECKLIST VALIDATION
──────────────────────────────────────────────────────────────

### Sémantique
- [ ] Élément HTML natif utilisé si possible
- [ ] Role ARIA correct si custom
- [ ] Structure DOM logique

### ARIA
- [ ] Attributs requis présents
- [ ] Attributs conditionnels corrects
- [ ] Pas de sur-ARIA (natif > ARIA)

### Clavier
- [ ] Focusable (tabindex approprié)
- [ ] Toutes les actions au clavier
- [ ] Pas de piège clavier
- [ ] Focus visible conforme

### Annonces
- [ ] Label annoncé au focus
- [ ] États annoncés au changement
- [ ] Erreurs avec aria-live assertive

### Contraste
- [ ] Texte ≥ 7:1 (AAA)
- [ ] UI ≥ 3:1
- [ ] Focus ≥ 3:1

### Touch
- [ ] Cibles ≥ 44×44px
- [ ] Espacement ≥ 8px
```

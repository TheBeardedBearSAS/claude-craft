---
description: Spécification Complète Composant UI/UX/A11y
argument-hint: [arguments]
---

# Spécification Complète Composant UI/UX/A11y

Tu es l'Orchestrateur UI/UX. Tu dois produire une spécification complète d'un composant en mobilisant les 3 experts : UX pour le comportement, UI pour le visuel, A11y pour l'accessibilité.

## Arguments
$ARGUMENTS

Arguments :
- Nom du composant à spécifier
- (Optionnel) Contexte d'usage

Exemple : `/common:uiux-component-spec Button` ou `/common:uiux-component-spec "Card Séjour" contexte SaaS tourisme`

## MISSION

### Étape 1 : Analyse UX (Expert UX)

Définir le comportement et l'usage :
- Objectif du composant
- Cas d'utilisation principaux
- Interactions attendues
- États fonctionnels

### Étape 2 : Spécification UI (Expert UI)

Définir le visuel :
- Anatomie et structure
- Variantes
- États visuels
- Tokens utilisés
- Responsive

### Étape 3 : Spécification A11y (Expert A11y)

Définir l'accessibilité :
- Sémantique HTML
- Attributs ARIA
- Navigation clavier
- Annonces lecteur d'écran

### Étape 4 : Synthèse

```
══════════════════════════════════════════════════════════════
📦 SPÉCIFICATION COMPOSANT : {NOM}
══════════════════════════════════════════════════════════════

Catégorie : Atom | Molecule | Organism
Date : {date}
Version : 1.0

──────────────────────────────────────────────────────────────
🧠 COMPORTEMENT (UX)
──────────────────────────────────────────────────────────────

### Objectif
{Description du rôle et de la valeur pour l'utilisateur}

### Cas d'utilisation
| Cas | Contexte | Comportement attendu |
|-----|----------|---------------------|
| Principal | {contexte} | {comportement} |
| Secondaire | {contexte} | {comportement} |

### États fonctionnels
| État | Déclencheur | Comportement |
|------|-------------|--------------|
| default | Initial | {comportement} |
| loading | Action en cours | {comportement} |
| success | Action réussie | {comportement} |
| error | Échec | {comportement} |
| empty | Pas de données | {comportement} |

### Feedback utilisateur
| Action | Feedback | Délai |
|--------|----------|-------|
| Click | {feedback} | Immédiat |
| Hover | {feedback} | Immédiat |
| Submit | {feedback} | < 200ms |

──────────────────────────────────────────────────────────────
🎨 VISUEL (UI)
──────────────────────────────────────────────────────────────

### Anatomie
```
┌─────────────────────────────────┐
│ [Icon]  Label         [Action] │
│         Description            │
└─────────────────────────────────┘
```

- **Slot 1** : {description}
- **Slot 2** : {description}

### Dimensions
| Propriété | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| min-width | {val} | {val} | {val} |
| height | {val} | {val} | {val} |
| padding | {val} | {val} | {val} |

### Variantes
| Variante | Usage | Différences visuelles |
|----------|-------|----------------------|
| primary | CTA principal | {tokens} |
| secondary | Action secondaire | {tokens} |
| ghost | Action tertiaire | {tokens} |
| destructive | Suppression | {tokens} |

### États visuels
| État | Background | Border | Text | Autres |
|------|------------|--------|------|--------|
| default | --color-{x} | --color-{x} | --color-{x} | |
| hover | --color-{x} | --color-{x} | --color-{x} | cursor: pointer |
| focus | --color-{x} | --color-{x} | --color-{x} | outline: 2px |
| active | --color-{x} | --color-{x} | --color-{x} | transform |
| disabled | --color-{x} | --color-{x} | --color-{x} | opacity: 0.5 |
| loading | --color-{x} | --color-{x} | --color-{x} | spinner |

### Micro-interactions
| Trigger | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| hover | {effect} | 150ms | ease-out |
| click | {effect} | 100ms | ease-in |
| focus | {effect} | 0ms | - |

### Tokens utilisés
```css
/* Couleurs */
--color-primary-500
--color-neutral-100
--color-error-500

/* Typographie */
--font-size-sm
--font-weight-medium

/* Espacements */
--spacing-2
--spacing-4

/* Autres */
--radius-md
--shadow-sm
--transition-fast
```

──────────────────────────────────────────────────────────────
♿ ACCESSIBILITÉ (A11y)
──────────────────────────────────────────────────────────────

### Sémantique HTML
```html
<button type="button" class="{composant}">
  <!-- Utiliser élément natif -->
</button>
```

### Attributs ARIA
| Attribut | Valeur | Condition |
|----------|--------|-----------|
| aria-label | "{texte}" | Si icône seule |
| aria-describedby | "{id}" | Si description |
| aria-disabled | "true" | Si désactivé |
| aria-busy | "true" | Si loading |

### Navigation clavier
| Touche | Action |
|--------|--------|
| Tab | Focus sur l'élément |
| Enter | Activer |
| Space | Activer |
| Escape | Annuler (si applicable) |

### Focus management
- **Focus initial** : Automatique via tabindex
- **Style focus** : outline 2px solid, offset 2px, ratio ≥ 3:1
- **Trap** : Non applicable (pas une modale)

### Contraste (AAA)
| Élément | Ratio requis | Ratio actuel |
|---------|--------------|--------------|
| Texte label | ≥ 7:1 | ✅ {ratio} |
| Icône | ≥ 3:1 | ✅ {ratio} |
| Border | ≥ 3:1 | ✅ {ratio} |

### Annonces lecteur d'écran
| Moment | Annonce |
|--------|---------|
| Focus | "{label}, bouton" |
| Loading | "Chargement en cours" |
| Success | "Action réussie" |
| Error | "Erreur : {message}" |

### Touch target
- Taille minimum : 44×44px ✅
- Espacement : ≥ 8px ✅

──────────────────────────────────────────────────────────────
💻 IMPLÉMENTATION
──────────────────────────────────────────────────────────────

### Props Interface (TypeScript)
```typescript
interface {Composant}Props {
  /** Variante visuelle */
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  /** Taille du composant */
  size?: 'sm' | 'md' | 'lg';
  /** État désactivé */
  disabled?: boolean;
  /** État de chargement */
  loading?: boolean;
  /** Icône à gauche */
  leftIcon?: ReactNode;
  /** Icône à droite */
  rightIcon?: ReactNode;
  /** Gestionnaire de clic */
  onClick?: () => void;
  /** Contenu */
  children: ReactNode;
}
```

### Exemple d'usage
```tsx
<Button
  variant="primary"
  size="md"
  leftIcon={<PlusIcon />}
  onClick={handleClick}
>
  Ajouter
</Button>
```

──────────────────────────────────────────────────────────────
✅ CHECKLIST VALIDATION
──────────────────────────────────────────────────────────────

### UX
- [ ] Objectif clair défini
- [ ] Tous les états fonctionnels documentés
- [ ] Feedback utilisateur spécifié

### UI
- [ ] Toutes les variantes définies
- [ ] Tous les états visuels spécifiés
- [ ] Responsive documenté
- [ ] Tokens uniquement (pas de hardcode)

### A11y
- [ ] Sémantique HTML correcte
- [ ] ARIA minimal et correct
- [ ] Navigation clavier complète
- [ ] Contrastes AAA vérifiés
- [ ] Touch targets ≥ 44px
```

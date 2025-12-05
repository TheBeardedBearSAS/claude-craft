# Audit Accessibilité React

Tu es un expert accessibilité web. Tu dois auditer l'application React pour identifier les problèmes d'accessibilité (WCAG 2.1) et proposer des corrections.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Niveau WCAG : A, AA, AAA
- (Optionnel) Chemin vers un composant spécifique

Exemple : `/react:accessibility-check AA` ou `/react:accessibility-check AA src/components/`

## MISSION

### Étape 1 : Outils d'Audit

```bash
# ESLint plugin
npm install --save-dev eslint-plugin-jsx-a11y

# Test automatisé
npm install --save-dev jest-axe @axe-core/react

# Storybook addon
npm install --save-dev @storybook/addon-a11y
```

### Étape 2 : Configuration ESLint

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'plugin:jsx-a11y/recommended',
    // ou 'plugin:jsx-a11y/strict' pour plus de règles
  ],
  plugins: ['jsx-a11y'],
  rules: {
    // Règles personnalisées
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['to'],
      },
    ],
    'jsx-a11y/label-has-associated-control': [
      'error',
      {
        labelComponents: ['Label'],
        labelAttributes: ['label'],
        controlComponents: ['Input', 'Select'],
        depth: 3,
      },
    ],
    'jsx-a11y/no-autofocus': 'warn',
  },
};
```

### Étape 3 : Tests Automatisés

```typescript
// src/setupTests.ts
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);
```

```typescript
// src/components/Button/Button.test.tsx
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { Button } from './Button';

describe('Button Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('has no violations when disabled', async () => {
    const { container } = render(<Button disabled>Disabled</Button>);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('has no violations with icon', async () => {
    const { container } = render(
      <Button aria-label="Settings">
        <SettingsIcon />
      </Button>
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
```

### Étape 4 : Problèmes Courants et Solutions

#### 1. Images sans Alt

```tsx
// ❌ MAUVAIS
<img src="photo.jpg" />

// ✅ BON - Image informative
<img src="photo.jpg" alt="Photo de profil de l'utilisateur" />

// ✅ BON - Image décorative
<img src="decoration.jpg" alt="" role="presentation" />

// ✅ BON - Avec aria-hidden pour icônes
<img src="icon.svg" alt="" aria-hidden="true" />
```

#### 2. Boutons et Liens sans Label

```tsx
// ❌ MAUVAIS - Bouton icône sans label
<button onClick={handleClick}>
  <TrashIcon />
</button>

// ✅ BON - Avec aria-label
<button onClick={handleClick} aria-label="Supprimer l'élément">
  <TrashIcon aria-hidden="true" />
</button>

// ✅ BON - Avec texte visible + icône
<button onClick={handleClick}>
  <TrashIcon aria-hidden="true" />
  <span>Supprimer</span>
</button>

// ✅ BON - Avec visually-hidden
<button onClick={handleClick}>
  <TrashIcon aria-hidden="true" />
  <span className="visually-hidden">Supprimer l'élément</span>
</button>
```

#### 3. Formulaires sans Labels

```tsx
// ❌ MAUVAIS
<input type="email" placeholder="Email" />

// ✅ BON - Label visible
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ BON - Label invisible mais accessible
<label htmlFor="email" className="visually-hidden">Email</label>
<input id="email" type="email" placeholder="Email" />

// ✅ BON - aria-label
<input
  type="email"
  aria-label="Adresse email"
  placeholder="email@example.com"
/>
```

#### 4. Contraste Insuffisant

```css
/* ❌ MAUVAIS - Ratio < 4.5:1 */
.text {
  color: #999;
  background: #fff;
}

/* ✅ BON - Ratio >= 4.5:1 pour texte normal */
.text {
  color: #595959; /* Ratio 7:1 */
  background: #fff;
}

/* ✅ BON - Ratio >= 3:1 pour grand texte (18px+ ou 14px bold) */
.heading {
  color: #767676; /* Ratio 4.5:1 */
  background: #fff;
  font-size: 24px;
}
```

#### 5. Navigation au Clavier

```tsx
// ❌ MAUVAIS - Non focusable
<div onClick={handleClick}>Click me</div>

// ✅ BON - Utiliser un élément natif
<button onClick={handleClick}>Click me</button>

// ✅ BON - Si div nécessaire, ajouter les attributs
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click me
</div>
```

#### 6. Focus Visible

```css
/* ❌ MAUVAIS - Focus supprimé */
button:focus {
  outline: none;
}

/* ✅ BON - Focus visible personnalisé */
button:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* Reset pour mouse, keep pour keyboard */
button:focus:not(:focus-visible) {
  outline: none;
}
```

#### 7. Gestion du Focus dans les Modals

```tsx
// src/components/Modal/Modal.tsx
import { useRef, useEffect } from 'react';
import FocusTrap from 'focus-trap-react';

export function Modal({ isOpen, onClose, children }: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Sauvegarder l'élément actif
      previousActiveElement.current = document.activeElement;
      // Focus sur le bouton de fermeture
      closeButtonRef.current?.focus();
    } else {
      // Restaurer le focus
      (previousActiveElement.current as HTMLElement)?.focus();
    }
  }, [isOpen]);

  // Fermer avec Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <FocusTrap>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="modal"
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Fermer la modal"
        >
          <CloseIcon aria-hidden="true" />
        </button>

        <h2 id="modal-title">Titre de la Modal</h2>

        {children}
      </div>
    </FocusTrap>
  );
}
```

#### 8. Live Regions pour Notifications

```tsx
// src/components/Toast/Toast.tsx
export function Toast({ message, type }: ToastProps) {
  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`toast toast-${type}`}
    >
      {message}
    </div>
  );
}

// Pour les chargements
function LoadingIndicator({ isLoading }: { isLoading: boolean }) {
  return (
    <div aria-live="polite" aria-busy={isLoading}>
      {isLoading && <span>Chargement en cours...</span>}
    </div>
  );
}
```

### Étape 5 : CSS Utilitaire

```css
/* src/styles/accessibility.css */

/* Texte visible uniquement pour les lecteurs d'écran */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Skip link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: white;
  padding: 8px 16px;
  z-index: 100;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 0;
}

/* Focus visible */
:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Étape 6 : Générer le Rapport

```
══════════════════════════════════════════════════════════════
♿ RAPPORT AUDIT ACCESSIBILITÉ
══════════════════════════════════════════════════════════════

Standard : WCAG 2.1 Niveau AA
Scope : Application complète

──────────────────────────────────────────────────────────────
📊 RÉSUMÉ
──────────────────────────────────────────────────────────────

| Sévérité | Nombre | Status |
|----------|--------|--------|
| Critique | 3 | ❌ |
| Sérieux | 8 | ❌ |
| Modéré | 12 | ⚠️ |
| Mineur | 5 | ℹ️ |
| **Total** | **28** | - |

Score Global : 67/100

──────────────────────────────────────────────────────────────
❌ PROBLÈMES CRITIQUES
──────────────────────────────────────────────────────────────

### 1. Images sans texte alternatif

**Règle WCAG :** 1.1.1 Non-text Content (A)

**Fichiers concernés :**
| Fichier | Ligne | Élément |
|---------|-------|---------|
| ProductCard.tsx | 23 | `<img src={product.image}>` |
| Avatar.tsx | 15 | `<img src={user.avatar}>` |
| Banner.tsx | 8 | `<img src={banner.url}>` |

**Correction :**
```tsx
<img src={product.image} alt={product.name} />
```

### 2. Formulaire sans labels

**Règle WCAG :** 1.3.1 Info and Relationships (A)

**Fichiers concernés :**
| Fichier | Ligne | Élément |
|---------|-------|---------|
| SearchBar.tsx | 12 | `<input type="search">` |
| LoginForm.tsx | 25 | `<input type="password">` |

### 3. Contraste insuffisant

**Règle WCAG :** 1.4.3 Contrast (Minimum) (AA)

| Élément | Ratio actuel | Requis |
|---------|--------------|--------|
| .text-muted | 3.2:1 | 4.5:1 |
| .btn-secondary | 2.8:1 | 4.5:1 |
| .placeholder | 2.1:1 | 4.5:1 |

──────────────────────────────────────────────────────────────
⚠️ PROBLÈMES SÉRIEUX
──────────────────────────────────────────────────────────────

### 4. Éléments interactifs non accessibles au clavier

**Règle WCAG :** 2.1.1 Keyboard (A)

| Fichier | Ligne | Élément |
|---------|-------|---------|
| Card.tsx | 45 | `<div onClick={...}>` |
| Tab.tsx | 23 | `<li onClick={...}>` |
| Dropdown.tsx | 67 | `<div onClick={...}>` |

### 5. Focus non visible

**Règle WCAG :** 2.4.7 Focus Visible (AA)

```css
/* Détecté dans global.css:15 */
*:focus { outline: none; }
```

### 6. Pas de skip link

**Règle WCAG :** 2.4.1 Bypass Blocks (A)

L'application n'a pas de lien "Aller au contenu principal".

──────────────────────────────────────────────────────────────
ℹ️ PROBLÈMES MINEURS
──────────────────────────────────────────────────────────────

### 7. Liens identiques avec textes différents

**Règle WCAG :** 2.4.4 Link Purpose (A)

"En savoir plus" utilisé 5 fois sans contexte.

### 8. Pas de lang sur HTML

**Règle WCAG :** 3.1.1 Language of Page (A)

```html
<!-- Manquant dans index.html -->
<html lang="fr">
```

──────────────────────────────────────────────────────────────
✅ POINTS POSITIFS
──────────────────────────────────────────────────────────────

- Structure sémantique HTML correcte (header, main, nav)
- Utilisation appropriée des headings (h1-h6)
- Aria-labels sur les boutons icônes (80%)
- Focus trap sur les modals
- Animations respectent prefers-reduced-motion

──────────────────────────────────────────────────────────────
🔧 CORRECTIONS PRIORITAIRES
──────────────────────────────────────────────────────────────

### 1. Ajouter alt aux images

```tsx
// ProductCard.tsx
<img
  src={product.image}
  alt={product.name}
  // ou alt="" si décorative
/>
```

### 2. Ajouter labels aux formulaires

```tsx
// SearchBar.tsx
<label htmlFor="search" className="visually-hidden">
  Rechercher
</label>
<input id="search" type="search" />
```

### 3. Corriger les contrastes

```css
:root {
  --color-text-muted: #595959; /* au lieu de #999 */
  --color-btn-secondary: #4a4a4a;
}
```

### 4. Rendre les divs cliquables accessibles

```tsx
// Avant
<div onClick={handleClick}>...</div>

// Après
<button type="button" onClick={handleClick}>...</button>
// ou
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={handleKeyDown}
>
  ...
</div>
```

### 5. Ajouter skip link

```tsx
// Layout.tsx
<>
  <a href="#main-content" className="skip-link">
    Aller au contenu principal
  </a>
  <header>...</header>
  <main id="main-content">...</main>
</>
```

──────────────────────────────────────────────────────────────
📋 CHECKLIST WCAG 2.1 AA
──────────────────────────────────────────────────────────────

| Critère | Status |
|---------|--------|
| 1.1.1 Non-text Content | ❌ |
| 1.3.1 Info and Relationships | ❌ |
| 1.4.3 Contrast (Minimum) | ❌ |
| 2.1.1 Keyboard | ❌ |
| 2.4.1 Bypass Blocks | ❌ |
| 2.4.7 Focus Visible | ❌ |
| 3.1.1 Language of Page | ❌ |
| ... | ... |

──────────────────────────────────────────────────────────────
🎯 PRIORITÉS
──────────────────────────────────────────────────────────────

1. [ ] Corriger les 3 problèmes critiques (bloquants)
2. [ ] Ajouter skip link
3. [ ] Corriger focus visible
4. [ ] Rendre éléments cliquables accessibles
5. [ ] Corriger les contrastes
6. [ ] Ajouter lang="fr" au HTML
7. [ ] Configurer eslint-plugin-jsx-a11y
```

---
description: Audit Accessibilité WCAG 2.2 AAA
argument-hint: [arguments]
---

# Audit Accessibilité WCAG 2.2 AAA

Tu es un Expert Accessibilité certifié. Tu dois réaliser un audit complet d'accessibilité selon les critères WCAG 2.2 niveau AAA.

## Arguments
$ARGUMENTS

Arguments :
- Chemin vers la page/composant à auditer
- (Optionnel) Niveau : AA ou AAA (défaut: AAA)
- (Optionnel) Focus : all, keyboard, contrast, aria

Exemple : `/uiux:a11y-audit src/pages/Home.tsx AAA` ou `/uiux:a11y-audit src/components/Modal.tsx AA keyboard`

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## MISSION

### Étape 1 : Audit automatisé

```bash
# Exécuter les outils automatisés
npx axe-cli {URL}
npx pa11y {URL} --standard WCAG2AAA
npx lighthouse {URL} --only-categories=accessibility

# Vérifier le score Lighthouse
# Objectif : 100/100 sur les 4 catégories
```

### Étape 2 : Audit manuel WCAG 2.2

```
══════════════════════════════════════════════════════════════
♿ AUDIT ACCESSIBILITÉ WCAG 2.2 AAA
══════════════════════════════════════════════════════════════

Page/Composant : {nom}
Date : {date}
Auditeur : Claude (Expert A11y)
Niveau cible : AAA + Lighthouse 100/100

──────────────────────────────────────────────────────────────
📊 SCORES
──────────────────────────────────────────────────────────────

### Lighthouse
| Catégorie | Score | Objectif | Status |
|-----------|-------|----------|--------|
| Performance | /100 | 100 | ✅/❌ |
| Accessibility | /100 | 100 | ✅/❌ |
| Best Practices | /100 | 100 | ✅/❌ |
| SEO | /100 | 100 | ✅/❌ |

### WCAG 2.2
| Niveau | Critères | Conformes | Non-conformes |
|--------|----------|-----------|---------------|
| A | 30 | {X} | {Y} |
| AA | 20 | {X} | {Y} |
| AAA | 28 | {X} | {Y} |

──────────────────────────────────────────────────────────────
1️⃣ PERCEPTIBLE
──────────────────────────────────────────────────────────────

### 1.1 Alternatives textuelles

#### 1.1.1 Contenu non textuel (A)
| Élément | Alt text | Status | Action |
|---------|----------|--------|--------|
| img.logo | "Logo {nom}" | ✅ | - |
| img.hero | "" (manquant) | ❌ | Ajouter alt descriptif |
| img.icon | aria-hidden="true" | ✅ | - |

### 1.3 Adaptable

#### 1.3.1 Information et relations (A)
| Vérification | Status | Détail |
|--------------|--------|--------|
| Structure headings | ✅/❌ | h1 → h2 → h3 séquentiel |
| Landmarks ARIA | ✅/❌ | header, nav, main, footer |
| Listes sémantiques | ✅/❌ | ul/ol/dl appropriés |
| Tableaux | ✅/❌ | th, scope, caption |
| Formulaires | ✅/❌ | label + fieldset/legend |

### 1.4 Distinguable

#### 1.4.3 Contraste minimum (AA) / 1.4.6 Contraste amélioré (AAA)
| Élément | Couleurs | Ratio | Requis | Status |
|---------|----------|-------|--------|--------|
| Body text | #333 / #fff | 12.6:1 | 7:1 | ✅ |
| Muted text | #666 / #fff | 5.7:1 | 7:1 | ❌ |
| Button primary | #fff / #3B82F6 | 4.5:1 | 4.5:1 | ✅ |
| Placeholder | #9CA3AF / #fff | 2.9:1 | 4.5:1 | ❌ |

#### 1.4.10 Reflow (AA)
| Test | Status | Problème |
|------|--------|----------|
| 320px width | ✅/❌ | {scroll horizontal ?} |
| 400% zoom | ✅/❌ | {contenu coupé ?} |

#### 1.4.11 Contraste non-textuel (AA)
| Élément UI | Ratio | Status |
|------------|-------|--------|
| Input border | 3:1 | ✅/❌ |
| Button border | 3:1 | ✅/❌ |
| Icon action | 3:1 | ✅/❌ |
| Focus ring | 3:1 | ✅/❌ |

──────────────────────────────────────────────────────────────
2️⃣ UTILISABLE
──────────────────────────────────────────────────────────────

### 2.1 Accessibilité clavier

#### 2.1.1 Clavier (A) / 2.1.3 Clavier sans exception (AAA)
| Élément | Tab | Enter | Escape | Arrows | Status |
|---------|-----|-------|--------|--------|--------|
| Links | ✅ | ✅ | - | - | ✅ |
| Buttons | ✅ | ✅ | - | - | ✅ |
| Inputs | ✅ | ✅ | - | - | ✅ |
| Dropdown | ✅ | ✅ | ✅ | ✅ | ❌ |
| Modal | ✅ | ✅ | ✅ | - | ✅ |
| Custom div | ❌ | ❌ | - | - | ❌ |

#### 2.1.2 Pas de piège clavier (A)
| Zone | Entrée | Sortie | Status |
|------|--------|--------|--------|
| Modal | Focus trap OK | Escape OK | ✅ |
| Dropdown | Tab OK | Tab/Escape OK | ✅ |
| Sidebar | Tab OK | Tab OK | ✅ |

### 2.4 Navigable

#### 2.4.1 Bypass blocks (A)
| Skip link | Destination | Status |
|-----------|-------------|--------|
| "Aller au contenu" | #main-content | ✅/❌ |
| "Aller à la navigation" | #nav | ✅/❌ |

#### 2.4.3 Ordre du focus (A)
| Séquence | Attendu | Actuel | Status |
|----------|---------|--------|--------|
| 1 | Skip link | Skip link | ✅ |
| 2 | Logo | Logo | ✅ |
| 3 | Nav item 1 | Nav item 1 | ✅ |
| ... | ... | ... | ... |

#### 2.4.7 Focus visible (AA) / 2.4.11 Focus amélioré (AA)
| Élément | Outline | Offset | Ratio | Status |
|---------|---------|--------|-------|--------|
| Links | 2px solid | 2px | 3:1 | ✅ |
| Buttons | 2px solid | 2px | 3:1 | ✅ |
| Inputs | 2px solid | 0 | 3:1 | ✅ |
| Cards | ❌ | - | - | ❌ |

#### 2.5.5 Taille cible (AAA)
| Élément | Taille | Min requis | Status |
|---------|--------|------------|--------|
| Buttons | 44×40px | 44×44px | ❌ |
| Links menu | 120×48px | 44×44px | ✅ |
| Icon buttons | 32×32px | 44×44px | ❌ |
| Checkboxes | 24×24px | 44×44px | ❌ |

──────────────────────────────────────────────────────────────
3️⃣ COMPRÉHENSIBLE
──────────────────────────────────────────────────────────────

### 3.1 Lisible

#### 3.1.1 Langue page (A)
```html
<html lang="fr"> <!-- ✅ Présent -->
```

#### 3.1.2 Langue des parties (AA)
| Élément | Langue | lang attr | Status |
|---------|--------|-----------|--------|
| Citation EN | Anglais | ❌ | ❌ |
| Mot technique | Anglais | ❌ | ⚠️ |

### 3.3 Assistance à la saisie

#### 3.3.1 Identification erreurs (A)
| Champ | Message erreur | En texte | Status |
|-------|----------------|----------|--------|
| Email | "Email invalide" | ✅ | ✅ |
| Password | Border rouge seule | ❌ | ❌ |

#### 3.3.2 Labels ou instructions (A)
| Input | Label | Association | Status |
|-------|-------|-------------|--------|
| Email | "Email" | htmlFor OK | ✅ |
| Search | ❌ | Pas de label | ❌ |
| Phone | Placeholder seul | Pas de label | ❌ |

──────────────────────────────────────────────────────────────
4️⃣ ROBUSTE
──────────────────────────────────────────────────────────────

### 4.1.2 Nom, rôle, valeur (A)
| Composant | role | aria-* | Status |
|-----------|------|--------|--------|
| Modal | dialog | aria-modal, aria-labelledby | ✅ |
| Dropdown | listbox | aria-expanded, aria-activedescendant | ✅ |
| Tabs | tablist/tab | aria-selected, aria-controls | ❌ |
| Accordion | - | aria-expanded | ❌ |

### 4.1.3 Messages d'état (AA)
| Message | aria-live | aria-atomic | Status |
|---------|-----------|-------------|--------|
| Toast success | polite | true | ✅ |
| Toast error | assertive | true | ✅ |
| Loading | polite | false | ❌ |
| Form errors | assertive | - | ❌ |

──────────────────────────────────────────────────────────────
❌ VIOLATIONS CRITIQUES (Bloquantes)
──────────────────────────────────────────────────────────────

| # | Critère | Élément | Description | Remédiation |
|---|---------|---------|-------------|-------------|
| 1 | 1.4.6 | .text-muted | Contraste 5.7:1 < 7:1 | color: #595959 |
| 2 | 2.5.5 | .btn-icon | Taille 32px < 44px | min-width: 44px |
| 3 | 3.3.2 | input[type="search"] | Pas de label | Ajouter label |

──────────────────────────────────────────────────────────────
⚠️ VIOLATIONS MAJEURES
──────────────────────────────────────────────────────────────

| # | Critère | Élément | Description | Remédiation |
|---|---------|---------|-------------|-------------|
| 4 | 2.1.1 | .card-clickable | div non focusable | Utiliser button |
| 5 | 4.1.2 | .tabs | ARIA incorrect | Ajouter role="tablist" |

──────────────────────────────────────────────────────────────
ℹ️ VIOLATIONS MINEURES
──────────────────────────────────────────────────────────────

| # | Critère | Élément | Description | Remédiation |
|---|---------|---------|-------------|-------------|
| 6 | 3.1.2 | blockquote | Texte EN sans lang | lang="en" |

──────────────────────────────────────────────────────────────
✅ POINTS CONFORMES NOTABLES
──────────────────────────────────────────────────────────────

- Structure sémantique correcte (headings, landmarks)
- Skip link présent et fonctionnel
- Focus trap correct sur les modales
- Messages d'erreur en texte clair

──────────────────────────────────────────────────────────────
🎯 PLAN DE REMÉDIATION
──────────────────────────────────────────────────────────────

### Priorité 1 - Critiques (cette semaine)
1. [ ] Corriger contraste .text-muted → #595959
2. [ ] Agrandir touch targets à 44px minimum
3. [ ] Ajouter labels aux inputs sans label

### Priorité 2 - Majeurs (ce sprint)
4. [ ] Remplacer div cliquables par button
5. [ ] Corriger ARIA sur composant Tabs
6. [ ] Ajouter aria-live sur loading states

### Priorité 3 - Mineures (backlog)
7. [ ] Ajouter lang="en" sur textes anglais
```

### Étape 3 : Test lecteur d'écran

- VoiceOver (macOS) : navigation complète
- NVDA (Windows) : vérification annonces
- TalkBack (Android) : si app mobile

### Étape 4 : Test clavier seul

Parcourir l'intégralité de l'interface au clavier uniquement.

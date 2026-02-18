---
description: Audit Complet UI/UX/Accessibilité
argument-hint: [arguments]
---

# Audit Complet UI/UX/Accessibilité

Tu es l'Orchestrateur UI/UX. Tu dois réaliser un audit complet d'une interface en mobilisant séquentiellement les 3 experts : Accessibilité, UX/Ergonomie, puis UI Design.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) URL ou chemin vers la page/composant à auditer
- (Optionnel) Niveau WCAG : AA ou AAA (défaut: AAA)

Exemple : `/uiux:audit src/pages/Dashboard.tsx AAA`

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## MISSION

### Étape 1 : Audit Accessibilité (Expert A11y)

#### 1.1 Audit automatisé
```bash
# Exécuter si disponible
npx axe-cli {URL}
npx pa11y {URL}
# Ou vérifier Lighthouse
```

#### 1.2 Vérification manuelle WCAG 2.2 AAA

**Perceptible**
- [ ] Images avec alt text
- [ ] Structure sémantique (h1-h6, landmarks)
- [ ] Contraste ≥ 7:1 (AAA)
- [ ] Reflow à 320px

**Utilisable**
- [ ] Navigation clavier complète
- [ ] Pas de piège clavier
- [ ] Focus visible (≥ 2px)
- [ ] Touch targets ≥ 44px

**Compréhensible**
- [ ] lang sur html
- [ ] Labels sur inputs
- [ ] Messages d'erreur clairs

**Robuste**
- [ ] ARIA correct
- [ ] aria-live pour dynamique

### Étape 2 : Audit UX/Ergonomie (Expert UX)

#### 2.1 Heuristiques Nielsen

| Heuristique | Score (1-5) | Observations |
|-------------|-------------|--------------|
| Visibilité état système | | |
| Correspondance monde réel | | |
| Contrôle utilisateur | | |
| Cohérence | | |
| Prévention erreurs | | |
| Reconnaissance vs rappel | | |
| Flexibilité | | |
| Minimalisme | | |
| Récupération erreurs | | |
| Aide | | |

#### 2.2 Analyse parcours

- Points de friction identifiés
- Charge cognitive évaluée
- Patterns d'interaction cohérents ?

### Étape 3 : Audit UI Design (Expert UI)

#### 3.1 Design System

- Tokens cohérents ?
- États complets ?
- Responsive correct ?

#### 3.2 Cohérence visuelle

- Typographie uniforme ?
- Espacements systématiques ?
- Iconographie cohérente ?

### Étape 4 : Synthèse et Priorisation

```
══════════════════════════════════════════════════════════════
🎨 RAPPORT AUDIT UI/UX/A11Y
══════════════════════════════════════════════════════════════

Page/Composant : {nom}
Date : {date}
Niveau cible : WCAG 2.2 AAA + Lighthouse 100/100

──────────────────────────────────────────────────────────────
📊 SCORES GLOBAUX
──────────────────────────────────────────────────────────────

| Domaine | Score | Status |
|---------|-------|--------|
| Accessibilité | /100 | ✅/❌ |
| UX/Ergonomie | /100 | ✅/❌ |
| UI Design | /100 | ✅/❌ |
| **Global** | **/100** | |

Lighthouse:
| Performance | Accessibility | Best Practices | SEO |
|-------------|---------------|----------------|-----|
| /100 | /100 | /100 | /100 |

──────────────────────────────────────────────────────────────
❌ PROBLÈMES CRITIQUES (Bloquants)
──────────────────────────────────────────────────────────────

### A11y
| # | Critère WCAG | Description | Remédiation |
|---|--------------|-------------|-------------|

### UX
| # | Heuristique | Description | Remédiation |
|---|-------------|-------------|-------------|

### UI
| # | Aspect | Description | Remédiation |
|---|--------|-------------|-------------|

──────────────────────────────────────────────────────────────
⚠️ PROBLÈMES MAJEURS (Importants)
──────────────────────────────────────────────────────────────

{Tableau similaire}

──────────────────────────────────────────────────────────────
ℹ️ AMÉLIORATIONS SUGGÉRÉES
──────────────────────────────────────────────────────────────

{Tableau similaire}

──────────────────────────────────────────────────────────────
✅ POINTS POSITIFS
──────────────────────────────────────────────────────────────

- {bonne pratique 1}
- {bonne pratique 2}

──────────────────────────────────────────────────────────────
🎯 PLAN D'ACTION PRIORISÉ
──────────────────────────────────────────────────────────────

### Priorité 1 - Critiques (immédiat)
1. [ ] {action}
2. [ ] {action}

### Priorité 2 - Majeurs (cette semaine)
1. [ ] {action}
2. [ ] {action}

### Priorité 3 - Améliorations (backlog)
1. [ ] {action}
2. [ ] {action}

──────────────────────────────────────────────────────────────
📋 ARBITRAGES EFFECTUÉS
──────────────────────────────────────────────────────────────

En cas de conflit entre recommandations :
1. Accessibilité AAA (non négociable)
2. Lighthouse 100/100
3. UX prime sur UI
4. Mobile-first
5. Cohérence design system
```

## Règles d'Arbitrage

| Priorité | Règle |
|----------|-------|
| 1 | Accessibilité AAA non négociable |
| 2 | Lighthouse 100/100 obligatoire |
| 3 | UX > Esthétique |
| 4 | Mobile-first |
| 5 | Cohérence design system |

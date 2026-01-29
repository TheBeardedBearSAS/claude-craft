---
description: Valider les stories du backlog contre les critères INVEST
argument-hint: [story-id]
---

# Valider Gate Backlog

Valider les User Stories contre les critères INVEST.
Toutes les stories doivent passer les 6 critères INVEST.

## Arguments

$ARGUMENTS (format: [story-id])
- **story-id** (optionnel): Story spécifique à valider (ex: US-001). Si omis, valide toutes les stories.

## Critères INVEST

| Lettre | Critère | Description | Vérifications |
|--------|---------|-------------|---------------|
| **I** | Indépendante | Peut être développée seule | Pas de dépendances bloquantes |
| **N** | Négociable | Les détails peuvent être discutés | A une description, pas sur-spécifiée |
| **V** | Valorisable | Apporte de la valeur utilisateur | A des critères d'acceptation |
| **E** | Estimable | Peut être estimée | A des points de story |
| **S** | Suffisamment petite | Tient dans un sprint | ≤ 8 points de story |
| **T** | Testable | Peut être testée | A des critères d'acceptation |

**Seuil: 6/6 pour chaque story**

## Format de Sortie

### Toutes les Stories Passent

```
═══════════════════════════════════════════════════════
          Validation Gate INVEST Backlog
═══════════════════════════════════════════════════════

Validation de 8 stories...

Résultats:
──────────────────────────────────────────────────────
✅ US-001: Connexion utilisateur
   [I] ✓ Indépendante - Pas de dépendances
   [N] ✓ Négociable - Description claire
   [V] ✓ Valorisable - 3 critères d'acceptation
   [E] ✓ Estimable - 5 points de story
   [S] ✓ Suffisamment petite - 5 ≤ 8 points
   [T] ✓ Testable - CA Gherkin définis
   Score: 6/6 ✅

Résumé:
──────────────────────────────────────────────────────
Stories validées: 8
Passées (6/6): 8
Avertissements (4-5/6): 0
Échouées (<4/6): 0

✅ GATE BACKLOG PASSÉ
═══════════════════════════════════════════════════════
```

### Stories en Échec

```
═══════════════════════════════════════════════════════
          Validation Gate INVEST Backlog
═══════════════════════════════════════════════════════

⚠️ US-002: Inscription utilisateur
   Score: 4/6 ⚠️
   Manquant: [E] Estimable - Pas de points de story

❌ US-003: Refonte complète du système auth
   Score: 3/6 ❌
   Manquant: [I] Indépendante, [N] Négociable, [S] Suffisamment petite

❌ GATE BACKLOG ÉCHOUÉ

Actions Requises:
──────────────────────────────────────────────────────
US-002:
  → Ajouter l'estimation en points de story
  → Exécuter: /project:update-story US-002 --points 3

US-003:
  → Diviser en stories plus petites (≤8 points chacune)
  → Considérer: /project:split-story US-003

Relancer après corrections: /gate:validate-backlog
═══════════════════════════════════════════════════════
```

## Exemple

```
/gate:validate-backlog
/gate:validate-backlog US-005
```

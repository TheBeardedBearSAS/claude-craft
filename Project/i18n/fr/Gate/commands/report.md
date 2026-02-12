---
description: Afficher le rapport complet des quality gates
argument-hint: [--detailed]
---

# Rapport Quality Gates

Générer un rapport complet de tous les quality gates BMAD.

## Arguments

$ARGUMENTS (format: [--detailed])
- **--detailed** (optionnel): Inclure les détails de validation pour chaque gate

## Processus

### Étape 1: Identifier les gates applicables

Déterminer quels gates s'appliquent selon l'état du projet:
- Gate PRD: Si fichier PRD existe
- Gate Tech Spec: Si fichier tech spec existe
- Gate Backlog: Si des stories existent
- Gate Sprint Ready: Si métadonnées sprint existent
- Gates Story: Pour chaque story in-progress/review

### Étape 2: Exécuter les validations

Exécuter chaque validateur de gate applicable.

### Étape 3: Agréger les résultats

Compiler les résultats dans un rapport résumé.

### Étape 4: Générer les recommandations

Basé sur les échecs, suggérer des actions prioritaires.

## Format de Sortie

```
═══════════════════════════════════════════════════════
            Rapport Quality Gates BMAD
═══════════════════════════════════════════════════════

Projet: claude-craft
Sprint: sprint-3 - Gestion Utilisateurs
Généré: 2026-01-29 10:00:00

Résumé des Gates:
══════════════════════════════════════════════════════
| Gate | Seuil | Score | Statut |
|------|-------|-------|--------|
| PRD | 80% | 90% | ✅ PASSÉ |
| Tech Spec | 90% | 92% | ✅ PASSÉ |
| Backlog | 6/6 | 5.8/6 moy | ⚠️ AVERT |
| Sprint Ready | 100% | 100% | ✅ PASSÉ |
| Story DoD | 100% | variable | 📊 |

Statut DoD par Story:
──────────────────────────────────────────────────────
| Story | Statut | Score DoD | Gate |
|-------|--------|-----------|------|
| US-010 | in-progress | 45% | ⏳ |
| US-011 | in-progress | 60% | ⏳ |
| US-012 | review | 85% | ⚠️ |
| US-013 | done | 100% | ✅ |

Santé Globale: 🟢 Bonne
──────────────────────────────────────────────────────
4/5 gates passés
8/10 stories sur la bonne voie
Pas de bloqueurs critiques

Recommandations:
──────────────────────────────────────────────────────
1. ⚠️ US-002 manque de points de story (INVEST: E)
   Exécuter: /project:update-story US-002 --points 3

2. ⚠️ US-012 nécessite une revue de code pour complétion
   Créer une PR et demander une revue

Commandes:
  /gate:validate-prd       Relancer gate PRD
  /gate:validate-backlog   Relancer gate backlog
  /gate:validate-story US-012  Vérifier story spécifique
═══════════════════════════════════════════════════════
```

## Exemple

```
/gate:report
/gate:report --detailed
```

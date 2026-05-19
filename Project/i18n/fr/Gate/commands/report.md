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
- Gate Backlog: Si des stories existent dans sprint-status
- Gate Sprint Ready: Si métadonnées sprint existent
- Gates Story: Pour chaque story in-progress/review

### Étape 2: Exécuter les validations

Exécuter chaque validateur de gate applicable:
1. Validation PRD (si docs/prd.md existe)
2. Validation Tech Spec (si docs/tech-spec.md existe)
3. Validation INVEST Backlog
4. Validation readiness sprint
5. Validations DoD stories individuelles

### Étape 3: Agréger les résultats

Compiler les résultats dans un rapport résumé.

### Étape 4: Générer les recommandations

Basé sur les échecs, suggérer des actions prioritaires.

## Format de Sortie

### Rapport Résumé

```
═══════════════════════════════════════════════════════
            Rapport Quality Gates BMAD
═══════════════════════════════════════════════════════

Projet: claude-craft
Sprint: sprint-3 - Gestion Utilisateurs
Généré: 2026-01-29 10:00:00

Résumé des Gates:
══════════════════════════════════════════════════════
| Gate         | Seuil | Score     | Statut   |
|--------------|-------|-----------|----------|
| PRD          | 80%   | 90%       | ✅ PASSÉ |
| Tech Spec    | 90%   | 92%       | ✅ PASSÉ |
| Backlog      | 6/6   | 5.8/6 moy | ⚠️ AVERT |
| Sprint Ready | 100%  | 100%      | ✅ PASSÉ |
| Story DoD    | 100%  | variable  | 📊       |

Statut DoD par Story:
──────────────────────────────────────────────────────
| Story  | Statut      | Score DoD | Gate |
|--------|-------------|-----------|------|
| US-010 | in-progress | 45%       | ⏳   |
| US-011 | in-progress | 60%       | ⏳   |
| US-012 | review      | 85%       | ⚠️   |
| US-013 | done        | 100%      | ✅   |

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

3. 💡 Envisager d'ajouter la planification de capacité
   Ajouter metadata.capacity_points à la config du sprint

Commandes:
  /gate:validate-prd           Relancer gate PRD
  /gate:validate-backlog       Relancer gate backlog
  /gate:validate-story US-012  Vérifier story spécifique
═══════════════════════════════════════════════════════
```

### Rapport Détaillé

```
═══════════════════════════════════════════════════════
            Rapport Quality Gates BMAD (Détaillé)
═══════════════════════════════════════════════════════

[...Détails complets de chaque gate comme dans le rapport résumé...]

Priorité 1 (Bloquant): Aucune
Priorité 2 (À corriger):
  1. US-002: Ajouter l'estimation en points de story
  2. US-008: Diviser en stories plus petites
Priorité 3 (Souhaitable):
  1. Ajouter les mitigations de risque au PRD
  2. Améliorer la gestion des erreurs dans la tech spec
═══════════════════════════════════════════════════════
```

## Exemple

```
/gate:report
/gate:report --detailed
```

## Configuration des Gates

Les gates sont configurés dans `.bmad/gates/`:
- `prd-gate.yaml`
- `techspec-gate.yaml`
- `backlog-gate.yaml`
- `story-gate.yaml`
- `sprint-ready-gate.yaml`

## Intégration

Le rapport peut être:
1. Généré à la demande via cette commande
2. Inclus dans la rétrospective de sprint
3. Utilisé pour le monitoring de la santé du projet
4. Exporté pour les rapports aux parties prenantes

## Prochaine Étape

```
╔══════════════════════════════════════════════════════════╗
║                   PROCHAINE ÉTAPE                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Lancer la gate spécifique qui nécessite attention :     ║
║                                                          ║
║  • /gate:validate-prd      — Gate qualité PRD            ║
║  • /gate:validate-techspec — Gate spec technique         ║
║  • /gate:validate-backlog  — Gate backlog                ║
║  • /gate:validate-sprint   — Gate readiness sprint       ║
║  • /gate:validate-story    — Gate DoD story              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

## Détails Gates DoD Stories

```
US-010: Inscription utilisateur
  Statut: in-progress | Score DoD: 45%
  ❌ Tâches: 2/5 | ❌ Tests: phase rouge
  ⚠️ CA: 1/3   | ❌ Revue: non démarrée

US-011: Connexion utilisateur
  Statut: in-progress | Score DoD: 60%
  ⚠️ Tâches: 3/4 | ✅ Tests: phase verte
  ⚠️ CA: 2/3   | ❌ Revue: non démarrée

US-012: Page profil
  Statut: review | Score DoD: 85%
  ✅ Tâches: 4/4 | ✅ Tests: phase refactoring
  ✅ CA: 3/3   | ⚠️ Revue: approbation en attente

US-013: Réinitialisation mot de passe
  Statut: done | Score DoD: 100%
  ✅ Tous les critères satisfaits
```
## Rapport par Gate — Détails Complets

### Stories du Backlog avec Problèmes

| Story | INVEST | Problème | Action |
|-------|--------|----------|--------|
| US-002 | 5/6 | Pas de points de story | Ajouter estimation |
| US-008 | 5/6 | > 8 points (trop grande) | Diviser |

### État Sprint Ready — Détails

| Critère | Statut | Notes |
|---------|--------|-------|
| Métadonnées Sprint | ✅ | sprint-3 configuré |
| Objectif Sprint | ✅ | Gestion utilisateurs |
| Stories Prêtes | ✅ | 5 stories ready-for-dev |
| Stories Estimées | ✅ | Toutes estimées |
| Capacité (84%) | ✅ | 42/50 points disponibles |
| Dépendances | ✅ | Aucune non-résolue |

---
description: Valider les stories du backlog contre les critères INVEST
argument-hint: [story-id] [--no-gate]
---

# Valider Gate Backlog

Valider les User Stories contre les critères INVEST.
Toutes les stories doivent passer les 6 critères INVEST.

## Arguments

$ARGUMENTS (format: [story-id] [--no-gate])
- **story-id** (optionnel): Story spécifique à valider (ex: US-001). Si omis, valide toutes les stories.
- **--no-gate** (optionnel): Exécuter uniquement la validation INVEST simple (ignorer l'application du gate de qualité, les seuils de scoring et le verdict pass/fail). Utile pour des vérifications rapides lors du refinement sans bloquer sur les critères du gate.

## Critères INVEST

| Lettre | Critère | Description | Vérifications |
|--------|---------|-------------|---------------|
| **I** | Indépendante | Peut être développée seule | Pas de dépendances bloquantes |
| **N** | Négociable | Les détails peuvent être discutés | A une description, pas sur-spécifiée |
| **V** | Valorisable | Apporte de la valeur utilisateur | A des critères d'acceptation, énoncé du bénéfice |
| **E** | Estimable | Peut être estimée | A des points de story |
| **S** | Suffisamment petite | Tient dans un sprint | ≤ 8 points de story |
| **T** | Testable | Peut être testée | A des critères d'acceptation |

**Seuil: 6/6 pour chaque story**

## Processus

### Étape 1: Charger les stories

1. Lire `.bmad/sprint-status.yaml`
2. Obtenir la story spécifiée ou toutes les stories
3. Charger les détails de chaque story

### Étape 2: Valider INVEST pour chaque story

Pour chaque critère:
- **Indépendante**: Vérifier que `blocked_by` est vide
- **Négociable**: Vérifier la longueur de la description, le nombre de tâches
- **Valorisable**: Vérifier l'existence des critères d'acceptation
- **Estimable**: Vérifier que les points de story > 0
- **Suffisamment petite**: Vérifier que les points de story ≤ 8
- **Testable**: Vérifier que le nombre de critères d'acceptation > 0

### Étape 3: Calculer les scores

Score INVEST par story (0-6)

### Étape 4: Générer le rapport

Afficher les résultats individuels et agrégés.

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

✅ US-002: Inscription utilisateur
   Score: 6/6 ✅

Résumé:
──────────────────────────────────────────────────────
Stories validées: 8
Passées (6/6): 8
Avertissements (4-5/6): 0
Échouées (<4/6): 0

✅ GATE BACKLOG PASSÉ

Toutes les stories respectent les critères INVEST.
Prêt pour la planification du sprint.
═══════════════════════════════════════════════════════
```

### Stories en Échec

```
═══════════════════════════════════════════════════════
          Validation Gate INVEST Backlog
═══════════════════════════════════════════════════════

Validation de 8 stories...

Résultats:
──────────────────────────────────────────────────────
✅ US-001: Connexion utilisateur
   Score: 6/6 ✅

⚠️ US-002: Inscription utilisateur
   [I] ✓ Indépendante
   [N] ✓ Négociable
   [V] ✓ Valorisable
   [E] ✗ Estimable - Pas de points de story
   [S] ? Suffisamment petite - Impossible à vérifier sans points
   [T] ✓ Testable
   Score: 4/6 ⚠️

❌ US-003: Refonte complète du système auth
   [I] ✗ Indépendante - Bloquée par US-001, US-002
   [N] ✗ Négociable - 15 tâches (trop spécifiée)
   [V] ✓ Valorisable
   [E] ✓ Estimable - 13 points
   [S] ✗ Suffisamment petite - 13 > 8 points
   [T] ✓ Testable
   Score: 3/6 ❌

Résumé:
──────────────────────────────────────────────────────
Stories validées: 8
Passées (6/6): 6
Avertissements (4-5/6): 1
Échouées (<4/6): 1

❌ GATE BACKLOG ÉCHOUÉ

Actions Requises:
──────────────────────────────────────────────────────
US-002:
  → Ajouter l'estimation en points de story
  → Exécuter: /project:update-story US-002 --points 3

US-003:
  → Diviser en stories plus petites (≤8 points chacune)
  → Supprimer les détails de tâches inutiles
  → Résoudre les dépendances ou réordonner
  → Considérer: /project:split-story US-003

Relancer après corrections: /gate:validate-backlog
═══════════════════════════════════════════════════════
```

### Validation d'une Story Unique

```
═══════════════════════════════════════════════════════
          Validation INVEST: US-005
═══════════════════════════════════════════════════════

📖 US-005: Vérification email

Analyse INVEST:
──────────────────────────────────────────────────────
[I] ✓ Indépendante
    Pas de dépendances bloquantes

[N] ✓ Négociable
    Description: 45 mots
    Tâches: 4 (raisonnable)

[V] ✓ Valorisable
    "En tant qu'utilisateur, je souhaite vérifier mon email
     afin de sécuriser mon compte"
    Critères d'acceptation: 3

[E] ✓ Estimable
    Points de story: 3

[S] ✓ Suffisamment petite
    3 points ≤ 8 points

[T] ✓ Testable
    3 scénarios Gherkin définis

Score: 6/6 ✅
──────────────────────────────────────────────────────

✅ Story respecte les critères INVEST

Statut: ready-for-dev
═══════════════════════════════════════════════════════
```

## Exemple

```
/gate:validate-backlog
/gate:validate-backlog US-005
```

## Correction des Problèmes Courants

### Story trop grande (S)
```
/project:split-story US-003
```

### Points de story manquants (E)
```
/project:update-story US-002 --points 3
```

### Critères d'acceptation manquants (V, T)
```
/project:add-ac US-002 "Given... When... Then..."
```

Configuration du gate: `.bmad/gates/backlog-gate.yaml`

## Prochaine Étape

```
╔══════════════════════════════════════════════════════════╗
║                   PROCHAINE ÉTAPE                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Si PASS (≥ seuil) :                                     ║
║  → /gate:validate-sprint                                 ║
║    Valider la readiness du sprint                        ║
║                                                          ║
║  Si FAIL (< seuil) :                                     ║
║  → Corriger les problèmes identifiés                     ║
║  → /gate:validate-backlog (re-run après corrections)     ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

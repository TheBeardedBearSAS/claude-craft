---
description: Lister les EPICs
argument-hint: [arguments]
---

# Lister les EPICs

Afficher la liste de tous les EPICs avec leur statut et progression.

## Arguments

$ARGUMENTS (optionnel, format: [statut] [priorité])
- **Statut** (optionnel, dérivé des stories): todo, in-progress, blocked, done, all (défaut: all)
- **Priorité** (optionnel): high, medium, low

## Processus

### Étape 1: Lire les EPICs

1. Scanner le répertoire `project-management/backlog/epics/`
2. Lire chaque fichier EPIC-XXX-*.md
3. Extraire les métadonnées de contenu de chaque EPIC (nom, priorité)
4. Lire les statuts de ses stories depuis `.bmad/sprint-status.yaml` (source unique de vérité, schéma : `.claude/templates/project/sprint-status.md`)

### Étape 2: Filtrer (si arguments)

Appliquer les filtres demandés:
- Par statut
- Par priorité

### Étape 3: Calculer les statistiques

**Le statut d'un EPIC est dérivé, jamais stocké** : toutes les stories `backlog` (ou aucune story) = non démarré ; toutes `done` = terminé ; au moins une `blocked` et aucune en cours = bloqué ; sinon en cours.

Pour chaque EPIC:
- Compter les US totales
- Compter les US par statut
- Calculer le pourcentage de progression

### Étape 4: Afficher

Générer un tableau formaté avec les résultats.

## Format de Sortie

```
📋 EPICs du Projet

| ID | Nom | Statut | Priorité | US | Progression |
|----|-----|--------|----------|-----|-------------|
| EPIC-001 | Authentification | 🟡 In Progress | High | 5 | ████░░░░░░ 40% |
| EPIC-002 | Catalogue | 🔴 To Do | Medium | 8 | ░░░░░░░░░░ 0% |
| EPIC-003 | Panier | 🔴 To Do | High | 6 | ░░░░░░░░░░ 0% |

───────────────────────────────────────────────────
Résumé: 3 EPICs | 🔴 2 To Do | 🟡 1 In Progress | 🟢 0 Done
```

## Format Compact (si beaucoup d'EPICs)

```
📋 EPICs (12 total)

🔴 To Do (5):
   EPIC-002, EPIC-003, EPIC-004, EPIC-007, EPIC-010

🟡 In Progress (4):
   EPIC-001 (40%), EPIC-005 (60%), EPIC-008 (25%), EPIC-011 (80%)

⏸️ Blocked (1):
   EPIC-006 - Bloqué par dépendance externe

🟢 Done (2):
   EPIC-009 ✓, EPIC-012 ✓
```

## Exemples

```
# Lister tous les EPICs
/project:list-epics

# Lister les EPICs en cours
/project:list-epics in-progress

# Lister les EPICs priorité haute
/project:list-epics all high

# Lister les EPICs bloqués
/project:list-epics blocked
```

## Détails d'un EPIC

Pour voir les détails d'un EPIC spécifique, suggérer:
```
Voir les détails: cat project-management/backlog/epics/EPIC-001-*.md
```

# Tâches — US-E1-01 : Tokens de design (couleurs, typographie, espacements)

**Epic :** E1 — Design System
**Story Points :** 3
**Sprint :** Sprint 2 — Design System

## Résumé

**En tant que** designer/développeur,
**je veux** un ensemble de tokens de design centralisés,
**afin que** toutes les interfaces partagent une identité visuelle cohérente.

## Tâches

| ID | Type | Tâche | Estimation | Statut |
|----|------|-------|------------|--------|
| T-E1-01-1 | [FE-WEB] | Définir la palette de couleurs (primaire, secondaire, neutres, états) en JSON | 0,5 h | done |
| T-E1-01-2 | [FE-WEB] | Définir la typographie (familles, tailles, graisses, hauteurs de ligne) | 0,5 h | done |
| T-E1-01-3 | [FE-WEB] | Définir les espacements (grille 4px, échelle de marges et paddings) | 0,25 h | done |
| T-E1-01-4 | [FE-WEB] | Configurer Style Dictionary pour générer CSS variables + JSON + constantes TS | 1 h | done |
| T-E1-01-5 | [FE-WEB] | Intégrer les tokens dans le thème de l'application | 0,5 h | done |
| T-E1-01-6 | [TEST] | Écrire un test de régression snapshot sur les tokens compilés | 0,5 h | done |
| T-E1-01-7 | [REV] | Revue design : validation de la palette par la designeuse | 0,5 h | done |

**Total estimé :** 3,75 h

## Dépendances

- T-E1-01-1 + T-E1-01-2 + T-E1-01-3 → T-E1-01-4 (tous les tokens définis avant la compilation)
- T-E1-01-4 → T-E1-01-5 (tokens compilés avant intégration)
- T-E1-01-5 → T-E1-01-6 (intégration avant snapshot)
- T-E1-01-6 → T-E1-01-7 (tests verts avant revue design)

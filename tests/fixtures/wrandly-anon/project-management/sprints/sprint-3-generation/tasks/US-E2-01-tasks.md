# Tâches — US-E2-01 : Formulaire de génération d'itinéraire

**Epic :** E2 — Génération & Détail
**Story Points :** 5
**Sprint :** Sprint 3 — Génération

## Résumé

**En tant qu'** utilisateur,
**je veux** remplir un formulaire simple,
**afin de** paramétrer mon itinéraire selon mes préférences (durée, niveau, type d'activité).

## Tâches

| ID | Type | Tâche | Estimation | Statut |
|----|------|-------|------------|--------|
| T-E2-01-1 | [FE-WEB] | Créer le composant `GenerationForm` avec les champs durée, niveau et type | 1,5 h | done |
| T-E2-01-2 | [FE-WEB] | Implémenter la validation côté client (champs requis, valeurs autorisées) | 0,5 h | done |
| T-E2-01-3 | [FE-WEB] | Afficher les messages d'erreur contextuels sous chaque champ invalide | 0,5 h | done |
| T-E2-01-4 | [FE-WEB] | Afficher un indicateur de progression lors de la soumission | 0,5 h | done |
| T-E2-01-5 | [BE] | Créer l'endpoint `POST /api/v1/itineraries/generate` avec validation schema | 1 h | done |
| T-E2-01-6 | [DB] | Ajouter la table `generation_requests` pour tracer les appels | 0,5 h | done |
| T-E2-01-7 | [TEST] | Écrire les tests unitaires de validation (cas valides et invalides) | 0,75 h | done |
| T-E2-01-8 | [TEST] | Écrire le test d'intégration du flux formulaire → API | 0,5 h | done |
| T-E2-01-9 | [REV] | Revue accessibilité : vérifier les labels, aria et focus management | 0,5 h | done |

**Total estimé :** 6,25 h

## Dépendances

- T-E2-01-1 → T-E2-01-2 → T-E2-01-3 (validation et erreurs après le composant de base)
- T-E2-01-5 → T-E2-01-6 (endpoint avant la table de traçage)
- T-E2-01-1 + T-E2-01-5 → T-E2-01-8 (composant et API requis pour le test d'intégration)
- T-E2-01-4 → T-E2-01-9 (indicateur de progression en place avant la revue accessibilité)

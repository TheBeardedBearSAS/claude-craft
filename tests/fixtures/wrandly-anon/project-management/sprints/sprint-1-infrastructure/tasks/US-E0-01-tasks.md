# Tâches — US-E0-01 : Initialisation du dépôt et CI/CD

**Epic :** E0 — Infrastructure & Tokens
**Story Points :** 3
**Sprint :** Sprint 1 — Infrastructure

## Résumé

**En tant que** développeur,
**je veux** disposer d'un pipeline CI/CD fonctionnel,
**afin de** livrer les fonctionnalités en continu avec des garanties qualité automatisées.

## Tâches

| ID | Type | Tâche | Estimation | Statut |
|----|------|-------|------------|--------|
| T-E0-01-1 | [OPS] | Initialiser le dépôt Git avec les branches `main` et `develop` | 0,5 h | done |
| T-E0-01-2 | [OPS] | Configurer le fichier `.github/workflows/ci.yml` (lint, test, build) | 1 h | done |
| T-E0-01-3 | [OPS] | Ajouter la protection de branche `main` (2 approbations requises) | 0,25 h | done |
| T-E0-01-4 | [OPS] | Configurer le registre Docker et l'étape de publication d'image | 1 h | done |
| T-E0-01-5 | [TEST] | Vérifier que la pipeline s'exécute correctement sur un commit de test | 0,25 h | done |
| T-E0-01-6 | [REV] | Revue de la configuration CI par un second développeur | 0,5 h | done |

**Total estimé :** 3,5 h

## Dépendances

- T-E0-01-1 → T-E0-01-2 (le dépôt doit exister avant de configurer la CI)
- T-E0-01-2 → T-E0-01-3 (la CI doit être configurée avant la protection de branche)
- T-E0-01-2 → T-E0-01-4 (la CI doit exister avant d'ajouter l'étape Docker)
- T-E0-01-4 → T-E0-01-5 (la pipeline complète doit être en place avant la vérification)
- T-E0-01-5 → T-E0-01-6 (la vérification doit passer avant la revue)

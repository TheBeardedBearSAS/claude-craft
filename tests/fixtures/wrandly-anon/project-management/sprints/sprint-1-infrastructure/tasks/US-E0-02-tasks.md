# Tâches — US-E0-02 : Configuration de l'environnement Docker

**Epic :** E0 — Infrastructure & Tokens
**Story Points :** 2
**Sprint :** Sprint 1 — Infrastructure

## Résumé

**En tant que** développeur,
**je veux** un environnement Docker reproductible,
**afin de** garantir la parité entre les environnements de développement et de production.

## Tâches

| ID | Type | Tâche | Estimation | Statut |
|----|------|-------|------------|--------|
| T-E0-02-1 | [OPS] | Rédiger le `Dockerfile` multi-stage (build + runtime) | 1 h | done |
| T-E0-02-2 | [OPS] | Créer le `docker-compose.yml` avec services app, db et cache | 0,5 h | done |
| T-E0-02-3 | [OPS] | Créer le fichier `.env.example` avec toutes les variables requises | 0,25 h | done |
| T-E0-02-4 | [BE] | Ajouter la validation des variables d'environnement au démarrage | 0,5 h | done |
| T-E0-02-5 | [TEST] | Vérifier que `docker compose up` démarre sans erreur sur macOS et Linux | 0,25 h | done |
| T-E0-02-6 | [REV] | Revue du Dockerfile (sécurité : utilisateur non-root, layers optimisés) | 0,5 h | done |

**Total estimé :** 3 h

## Dépendances

- T-E0-02-1 → T-E0-02-2 (Dockerfile requis avant docker-compose)
- T-E0-02-2 → T-E0-02-3 (compose doit référencer les variables)
- T-E0-02-3 → T-E0-02-4 (variables connues avant d'écrire la validation)
- T-E0-02-4 → T-E0-02-5 (validation en place avant les tests)
- T-E0-02-5 → T-E0-02-6 (tests verts avant revue)

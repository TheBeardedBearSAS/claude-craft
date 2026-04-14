# Checklist nouvelle fonctionnalité — Paperclip

Une fonctionnalité dans Paperclip touche typiquement un ou plusieurs **modules** (`server/src/modules/*`) et parfois un **adaptateur**. Utiliser cette checklist de bout en bout.

## 0. Analyse (avant d'écrire du code)

- [ ] Identifier le(s) domaine(s) affecté(s) (agents / approvals / costs / …)
- [ ] Déterminer si la gouvernance est impactée (budgets, approbations, journal d'activité)
- [ ] Lister la migration de données, le cas échéant
- [ ] Vérifier les implications inter-tenants
- [ ] Écrire une note de conception de 5 lignes : ce qui change, pourquoi, quels fichiers

## 1. Schéma (si applicable)

- [ ] Fichier de migration sous `server/src/db/migrations/` (forward + down)
- [ ] Nouvelles colonnes nullable OU backfillées dans la même migration
- [ ] Index sur toute colonne utilisée dans les clauses WHERE
- [ ] Table de journal d'activité intacte (elle est append-only)
- [ ] `pnpm db:migrate` réussit localement

## 2. Types (`shared/types`)

- [ ] Nouveaux types de domaine ajoutés dans `shared/types/<domaine>.ts`
- [ ] Aucun code runtime dans `shared/types/`
- [ ] Unions discriminées utilisées pour les types variants
- [ ] Chemin de ré-export mis à jour si nécessaire

## 3. Service (`server/src/modules/<domaine>/service.ts`)

- [ ] La logique métier vit ici
- [ ] Retourne des résultats typés ou lance `DomainError`
- [ ] Émet un événement d'activité à chaque mutation
- [ ] Applique les barrières de budget / approbation si pertinent
- [ ] Tenancy : dérive `companyId` de la session, filtre en conséquence
- [ ] Tests unitaires avec repository mocké

## 4. Repository (`server/src/modules/<domaine>/repository.ts`)

- [ ] Requêtes paramétrées uniquement
- [ ] Aucune logique métier
- [ ] Tests d'intégration contre un vrai Postgres

## 5. Routes (`server/src/modules/<domaine>/routes.ts`)

- [ ] Une route par opération
- [ ] Entrée validée via zod (ou équivalent)
- [ ] Réponses typées ; erreurs mappées aux codes `DomainError`
- [ ] Pas d'accès DB direct
- [ ] Spec OpenAPI mise à jour

## 6. UI Web (si applicable)

- [ ] Client API régénéré depuis OpenAPI (`pnpm generate:api`)
- [ ] Nouvelle UI sous `ui/src/` (suivre la convention de routing existante)
- [ ] Les flags de gouvernance viennent du serveur, pas calculés côté client
- [ ] États de chargement et d'erreur gérés
- [ ] Accessibilité : chemins clavier + lecteur d'écran vérifiés

## 7. Surface d'extension (si la fonctionnalité nécessite des changements)

### Adaptateur intégré (runtime IA)

- [ ] `packages/adapters/<nom>/src/index.ts` — `type` / `label` / `models` / `agentConfigurationDoc` toujours précis
- [ ] Entrée du registre côté serveur mise à jour (`registerServerAdapter`)
- [ ] Les configs d'agent existantes valident toujours (pas de renommage de champ cassant)

### Plugin (fonctionnalité)

- [ ] Les capacités du manifeste restent minimales (ajouter uniquement ce que cette fonctionnalité nécessite)
- [ ] Câblage `definePlugin({ setup })` pour les nouveaux événements / tâches / fournisseurs de données
- [ ] Schéma de config (zod) mis à jour avec des descriptions claires
- [ ] Le harnais de test de plugin de `@paperclipai/plugin-sdk/testing` passe toujours

## 8. Tests

- [ ] Unit : logique de service + chemins d'erreur
- [ ] Intégration : routes du module + DB avec vrai Postgres
- [ ] Isolation inter-tenants : l'utilisateur A de l'entreprise X ne peut pas toucher les données de l'entreprise Y
- [ ] Application du budget : tentative au-delà de la limite retourne `BUDGET_EXCEEDED`
- [ ] Barrière d'approbation : l'action bloque jusqu'à approbation ou timeout
- [ ] Contrat d'adaptateur : ré-exécuter la suite partagée
- [ ] Seuils de couverture toujours verts (≥ 80 global, ≥ 90 pour agents/approvals/costs)

## 9. Documentation

- [ ] Entrée CHANGELOG sous `## Unreleased`
- [ ] Spec OpenAPI commitée
- [ ] README de l'adaptateur mis à jour si les actions supportées ont changé
- [ ] Runbook mis à jour si la fonctionnalité impacte la réponse aux incidents (kill switch, révocation, export)

## 10. Revue

- [ ] Auto-revue : `git diff main...HEAD`
- [ ] Exécuter `/paperclip:check-compliance` localement
- [ ] Description PR : quoi, pourquoi, plan de migration, plan de rollback
- [ ] Tests de contrat d'adaptateur verts pour chaque adaptateur touché

## 11. Déploiement

- [ ] Plan de déploiement : migrer forward, déployer le code, vérifier la santé
- [ ] Kill switch toujours fonctionnel après déploiement
- [ ] Le journal d'activité capture visiblement les événements de la nouvelle fonctionnalité

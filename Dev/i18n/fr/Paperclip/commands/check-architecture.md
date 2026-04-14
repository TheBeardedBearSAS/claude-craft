---
description: Audit de l'architecture Paperclip
argument-hint: [chemin-projet]
---

# Audit de l'architecture Paperclip

## MISSION

Valider l'architecture à deux couches (plan de contrôle + adaptateurs) et les frontières de modules d'un projet Paperclip.

## Procédure

### 1. Structure de l'espace de travail

- [ ] Les répertoires `server/`, `ui/`, `cli/`, `packages/` sont présents
- [ ] `packages/` contient `shared/`, `db/`, `adapter-utils/`, `mcp-server/`, `adapters/`, `plugins/`
- [ ] `pnpm-workspace.yaml` liste les espaces de travail
- [ ] Le `package.json` racine déclare `"packageManager": "pnpm@9.15.x"`
- [ ] `pnpm run preflight:workspace-links` passe
- [ ] Aucune config Lerna / npm workspaces héritée ne subsiste

### 2. Modules du plan de contrôle

Sous `server/src/modules/` attendre un dossier par domaine (agents, approvals, costs, companies, goals, activity, secrets). Pour chaque module :

- [ ] `routes.ts` — HTTP uniquement, appelle les services, pas d'accès DB
- [ ] `service.ts` — logique métier, émet des événements d'activité
- [ ] `repository.ts` — requêtes paramétrées, pas de règles métier
- [ ] `types.ts` — ré-exporté via `shared/`
- [ ] `*.test.ts` colocalisé
- [ ] Aucun import traversant les éléments internes d'un autre module (uniquement via son API de service)

Signaler : toute route qui lit la DB directement, tout service qui construit des chaînes SQL, tout import inter-modules contournant la couche service.

### 3. Adaptateurs (intégrés, `packages/adapters/*`)

- [ ] Chaque adaptateur vit sous `packages/adapters/<nom>/` et est nommé `@paperclipai/adapter-<nom>`
- [ ] `src/index.ts` exporte `type`, `label`, `models`, `agentConfigurationDoc`
- [ ] Les sous-chemins optionnels (`./server`, `./ui`, `./cli`) ne sont présents que s'ils sont implémentés
- [ ] **Aucune logique de gouvernance** dans l'adaptateur — le serveur possède budgets / approbations / permissions
- [ ] Le bootstrap du serveur l'enregistre via `registerServerAdapter(...)`

### 3b. Plugins (`@paperclipai/plugin-sdk`)

- [ ] Échafaudé via `create-paperclip-plugin` (ou structurellement équivalent)
- [ ] `definePlugin({ setup, onHealth })` dans l'entrée du worker
- [ ] Le manifeste ne déclare que les capacités nécessaires
- [ ] Aucun secret lu depuis le disque ; toujours via `ctx.secrets.resolve(ref)`

### 4. Types partagés

- [ ] `shared/types/` contient uniquement des déclarations de types `.ts`
- [ ] Aucun code runtime (pas de fonctions, pas de classes)
- [ ] Aucun import de framework (React, Express, etc.)

### 5. UI Web

- [ ] Le client API de `ui/src/` consomme les types du serveur via `@paperclipai/shared` — pas de `fetch` fait main avec des réponses non typées
- [ ] Aucune décision de gouvernance dans les composants (pas de "si budget > X alors cacher le bouton" — le serveur décide, l'UI affiche)

### 6. Couverture du journal d'activité

Grep pour chaque mutation DB (`INSERT`, `UPDATE`, `DELETE` hors migrations/seeds). Chacune doit être adjacente à une émission d'événement d'activité. Rapporter les mutations sans `activity.emit(...)` correspondant.

### 7. Spécification OpenAPI

- [ ] `server/src/api/openapi.yaml` (ou généré) est commité
- [ ] Chaque route a une opération correspondante
- [ ] Le client web généré est à jour (`pnpm generate:api` ne produit aucun diff)

## Sortie

Rapport Markdown avec :
- Passe/échoue par case à cocher ci-dessus
- Chemins de fichiers incriminés (numéros de ligne si disponibles)
- Sévérité : Bloquant / Majeur / Mineur
- Score /25 pour utilisation par `/paperclip:check-compliance`

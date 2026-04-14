---
description: Vérifier la conformité complète Paperclip
argument-hint: [chemin-projet]
---

# Vérifier la conformité complète Paperclip

## Arguments

$ARGUMENTS (optionnel : chemin vers le projet Paperclip à analyser)

## MISSION

Effectuer un audit de conformité complet d'un projet Paperclip en orchestrant les 4 vérifications majeures — Architecture, Qualité de code, Tests, Sécurité — plus la vérification du **Protocole d'adaptateur** qui est spécifique à Paperclip. Produire un rapport consolidé avec un score global sur 100 points.

### Étape 1 : Préparation de l'audit

- [ ] Identifier le chemin du projet (`$ARGUMENTS` ou répertoire courant)
- [ ] Confirmer qu'il s'agit d'un espace de travail Paperclip : vérifier la présence de `server/`, `ui/`, `cli/`, `packages/` (avec `adapters/`, `plugins/sdk/`), `pnpm-workspace.yaml`, et des entrées `@paperclipai/*`
- [ ] Noter la version Paperclip (depuis `@paperclipai/plugin-sdk` installé ou version CLI `paperclipai`)
- [ ] Lister les adaptateurs sous `packages/adapters/*` et tout plugin sous `packages/plugins/examples/*` ou dépôts de plugins externes

### Étape 2 : Audit d'architecture (25 points)

Invoquer `/paperclip:check-architecture`.

Critères évalués :
- Séparation à deux couches (plan de contrôle vs adaptateurs) — 6 pts
- Frontières de modules sous `server/src/modules/` — 5 pts
- Pas de logique de gouvernance dans les adaptateurs — 6 pts
- Forme de `shared/types` (types purs, pas de runtime) — 3 pts
- Journal d'activité émis à chaque mutation — 3 pts
- La spec OpenAPI couvre chaque route — 2 pts

### Étape 3 : Audit de qualité de code (20 points)

Invoquer `/paperclip:check-code-quality`.

Critères évalués :
- TypeScript strict + `noUncheckedIndexedAccess` — 5 pts
- Pas de `any`, pas de casts silencieux — 4 pts
- Config ESLint flat + Prettier passent — 3 pts
- Conventions de nommage (fichiers kebab, types PascalCase, etc.) — 3 pts
- Complexité cognitive < 10 par fonction — 3 pts
- Logs structurés, pas de fuite de secret dans les logs — 2 pts

### Étape 4 : Audit de tests (20 points)

Invoquer `/paperclip:check-testing`.

Critères évalués :
- Couverture ≥ 80% (lignes, fonctions, instructions) — 6 pts
- Les tests de contrat d'adaptateur passent pour chaque adaptateur fourni — 6 pts
- Les tests d'intégration touchent un vrai PostgreSQL — 4 pts
- Pas de `.only` / `.skip` dans main — 2 pts
- Factories utilisées plutôt que fixtures — 2 pts

### Étape 5 : Audit de sécurité (20 points)

Invoquer `/paperclip:check-security`.

Critères évalués :
- Tous les endpoints scopés par tenant via `companyId` de la session — 4 pts
- Secrets chiffrés au repos, masqués dans les logs — 4 pts
- Barrières d'approbation côté serveur uniquement, événements append-only — 3 pts
- Budgets = limites strictes (appliquées dans les tests) — 3 pts
- Capacités de plugin déclarées minimalement (pas de `network` / `filesystem` sur-scopé) — 3 pts
- Headers CSP + HSTS + COOP + CORP fournis — 2 pts
- `pnpm audit --audit-level=high` propre — 1 pt

### Étape 6 : Audit d'extension (15 points)

Spécifique à Paperclip. Scope les adaptateurs intégrés (`packages/adapters/*`) et les plugins (`@paperclipai/plugin-sdk`).

Adaptateurs intégrés :
- Chaque adaptateur exporte `type`, `label`, `models`, `agentConfigurationDoc` — 3 pts
- `type` est stable entre versions (pas de renommage après livraison des agents) — 2 pts
- Enregistrement serveur via `registerServerAdapter(...)` — 2 pts
- Pas de logique de gouvernance dans l'adaptateur (pas de calcul budget / approbation / permission) — 3 pts

Plugins :
- Le manifeste déclare les capacités minimales nécessaires — 2 pts
- Utilise `ctx.secrets.resolve(ref)` au lieu de clés brutes — 2 pts
- État persisté via `ctx.state` (scopé), pas le disque — 1 pt

### Étape 7 : Rapport consolidé

Produire :

```
════════════════════════════════════════════════════════════════
📊 AUDIT DE CONFORMITÉ PAPERCLIP — {PROJET}
════════════════════════════════════════════════════════════════

Architecture        : {NN}/25
Qualité de code     : {NN}/20
Tests               : {NN}/20
Sécurité            : {NN}/20
Protocole adaptateur: {NN}/15
────────────────────────────────────────────────────────────────
TOTAL               : {NNN}/100   →   {Note}

Échelle de notes : A (≥ 90), B (≥ 80), C (≥ 70), D (≥ 60), F (< 60)
```

Pour chaque critère échoué, lister le fichier / symbole et un correctif en 1 ligne. Ne pas réécrire le code — faire remonter les problèmes. Terminer avec les **5 priorités de remédiation principales** (impact le plus élevé / effort le plus faible en premier).

## Livrable

Un seul rapport markdown. Pas d'échecs silencieux. Si une étape ne peut pas s'exécuter (ex. : pas d'adaptateurs dans le projet), enregistrer "N/A" et redistribuer les points proportionnellement — le noter explicitement en haut du rapport.

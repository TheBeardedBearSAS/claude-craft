# Architecture Paperclip — Principes et Organisation

> Source de référence : https://docs.paperclip.ing/ et le dépôt https://github.com/paperclipai/paperclip.
> Version observée : v2026.609.0 (MIT, avril 2026).

## Structure du Monorepo (observée dans le dépôt)

```
paperclip/
├── server/                          # @paperclipai/server — API HTTP Node.js + TS
│   ├── src/
│   │   ├── routes/                  # Routes HTTP (companies, agents, approvals, ...)
│   │   ├── adapters/                # Registre et recherche d'adaptateurs côté serveur
│   │   └── ...
│   └── vitest.config.ts
│
├── ui/                              # @paperclipai/ui — Tableau de bord React
│
├── cli/                             # paperclipai CLI (commander.js)
│   ├── src/
│   │   ├── commands/                # onboard, doctor, env, configure, ...
│   │   └── commands/client/         # company, agent, approval, activity, plugin, ...
│   └── esbuild.config.mjs
│
├── packages/
│   ├── shared/                      # @paperclipai/shared — types et schémas transversaux
│   ├── db/                          # @paperclipai/db — schéma, migrations
│   ├── mcp-server/                  # @paperclipai/mcp-server
│   ├── adapter-utils/               # @paperclipai/adapter-utils — utilitaires pour auteurs d'adaptateurs
│   ├── adapters/                    # Adaptateurs intégrés
│   │   ├── claude-local/            # @paperclipai/adapter-claude-local
│   │   ├── codex-local/
│   │   ├── cursor-local/
│   │   ├── gemini-local/
│   │   ├── opencode-local/
│   │   ├── openclaw-gateway/
│   │   └── pi-local/
│   └── plugins/
│       ├── sdk/                     # @paperclipai/plugin-sdk — SDK public pour plugins externes
│       ├── create-paperclip-plugin/ # @paperclipai/create-paperclip-plugin — générateur
│       └── examples/                # plugin-hello-world-example, plugin-kitchen-sink-example, ...
│
├── tests/
│   ├── e2e/                         # Playwright
│   └── release-smoke/
│
├── docker/
├── scripts/
└── docs/                            # Site Mintlify
```

## Espaces de travail (Workspaces)

Le fichier `package.json` racine et `pnpm-workspace.yaml` définissent les espaces de travail. Tous les packages sont publiés sous le namespace `@paperclipai/*`. Le `packageManager` est épinglé (`pnpm@9.15.x`).

## Couches

1. **Server** — API HTTP + logique de gouvernance (budgets, approbations, journal d'activité, multi-tenant).
2. **UI** — Tableau de bord React. Affiche, interagit, ne décide jamais de la gouvernance.
3. **CLI** — Outillage opérateur (onboard, doctor, gestion company/agent/approval). Les adaptateurs peuvent contribuer des sous-commandes CLI via leur export `./cli`.
4. **Packages** — Bibliothèques réutilisables : `shared` (types), `db` (schéma), `adapter-utils`, `mcp-server`, et deux familles d'extensions.
5. **Points d'extension** — Voir `12-adapter-protocol.md` :
   - **Adaptateurs** (`packages/adapters/*`) — quel runtime IA alimente un agent
   - **Plugins** (`@paperclipai/plugin-sdk`, générés par `create-paperclip-plugin`) — fonctionnalités, intégrations, jobs, emplacements UI

## Domaines principaux (routes serveur observées)

- **Companies** (`/companies/...`) — limite de tenant
- **Agents** (`/agents`, `/companies/:companyId/agents`, `/agent-hires`) — travailleurs enregistrés
- **Approvals** (`/approvals/...`) — barrières humaines (human-in-the-loop)
- **Activity** — audit en ajout seul (append-only)
- **Issues / Projects / Goals** — constructions de niveau produit
- **Plugin** — gestion de plugins via CLI (`paperclipai plugin ...`)

## Direction des dépendances

```
server ─► @paperclipai/shared
server ─► @paperclipai/db
ui     ─► @paperclipai/shared  (types uniquement)
plugins ─► @paperclipai/plugin-sdk ─► @paperclipai/shared
adapters (intégrés) ─► @paperclipai/adapter-utils (optionnel)
```

- `shared` ne contient que des types et schémas purs. Aucun import de framework, aucun client HTTP runtime.
- L'UI n'importe jamais directement depuis `server/`. Les types proviennent de `shared`.
- Les plugins dépendent uniquement du SDK (et optionnellement adapter-utils s'ils concernent les adaptateurs).
- Les adaptateurs (intégrés) vivent dans leur package ; ils s'enregistrent dans le registre serveur au démarrage.

## Règles architecturales

| Règle | Pourquoi |
|---|---|
| La gouvernance (budgets, approbations, secrets, multi-tenant) est exclusivement serveur | Les adaptateurs/plugins ne peuvent pas la contourner |
| Les adaptateurs exposent `type`, `label`, `models`, `agentConfigurationDoc` | Contrat stable pour les agents |
| Les plugins utilisent `definePlugin({ setup(ctx) })` et déclarent leurs capacités | Sandbox médiatisé par SDK |
| L'UI consomme des données typées depuis `shared` via les API serveur | Aucun accès direct à la base de données |
| Le journal d'activité est en ajout seul et émis pour chaque mutation | Auditabilité non négociable |
| Les liens d'espaces de travail sont vérifiés avant build/typecheck (`preflight:workspace-links`) | Prévient la dérive entre packages |

## Patterns architecturaux

- **Monorepo modulaire** — un seul déploiement, frontières appliquées via packages d'espaces de travail.
- **Journal d'activité en ajout seul** — chaque mutation émet un événement ; tableaux de bord et plugins le lisent.
- **Schémas typés partout** — Zod aux frontières de configuration, types TS partout.
- **JSON-RPC 2.0** — protocole hôte ↔ worker plugin (voir `12-adapter-protocol.md`).
- **Registre d'adaptateurs** — mutable, avec `registerServerAdapter` / `unregisterServerAdapter` / `requireServerAdapter`.

## Anti-Patterns

- Logique de gouvernance dans un plugin ou adaptateur.
- UI calculant l'état du budget / approbation au lieu de lire un drapeau calculé par le serveur.
- Adaptateur qui réécrit une configuration d'agent pour contourner la validation plateforme.
- Plugin stockant l'état dans un fichier sur disque au lieu de `ctx.state`.
- Imports inter-espaces de travail contournant l'export public du package.

## Checklist

- [ ] Le nouveau package se trouve sous `server/`, `ui/`, `cli/`, ou `packages/*`
- [ ] Publié sous le namespace `@paperclipai/*` (pour nouveaux packages publics)
- [ ] `pnpm run preflight:workspace-links` passe
- [ ] Aucune logique de gouvernance hors de `server/`
- [ ] Événement d'activité émis pour chaque mutation
- [ ] Types consommés depuis `@paperclipai/shared` lors du franchissement de frontières d'espaces de travail

---

**Dernière mise à jour :** 2026-04 | **Version :** 2.0.0 | **Auteur :** The Bearded CTO

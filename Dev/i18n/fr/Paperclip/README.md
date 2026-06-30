# Paperclip — Intégration Claude-Craft

> **Paperclip** : orchestration open-source pour entreprises sans humains.
> Docs : https://docs.paperclip.ing/ · Dépôt : https://github.com/paperclipai/paperclip · Licence : MIT

Ce répertoire contient les règles, commandes, skills et templates Claude-Craft pour travailler avec Paperclip — aussi bien en tant que **contributeur** d'une base de code Paperclip qu'en tant qu'**opérateur** utilisant Paperclip avec Claude Code comme adaptateur.

## Stack

| Outil | Version |
|---|---|
| Node.js | 22+ LTS |
| TypeScript | 5.x (strict) |
| pnpm | 9.15+ |
| React | 19+ (UI) |
| Vitest | 4.1+ |
| PostgreSQL | 15+ (ou embarqué pour le dev) |
| Paperclip | 2026.609.0+ |

## Contenu

```
Paperclip/
├── CLAUDE.md.template
├── README.md                   (ce fichier)
├── rules/                      # 7 règles (architecture, standards, outillage, tests, qualité, sécurité, protocole adaptateur)
├── commands/                   # 8 slash commands (check-*, generate-*, setup-company)
├── templates/                  # Scaffolds adapter + plugin
├── checklists/                 # pre-commit, new-feature, new-adapter
├── agents/                     # paperclip-reviewer
└── skills/                     # 6 skills chargeables à la demande
```

## Commandes

| Commande | Objet |
|---|---|
| `/paperclip:check-compliance` | Audit complet (Architecture + Qualité + Tests + Sécurité + Extensions), score /100 |
| `/paperclip:check-architecture` | Séparation bi-couche + limites de modules + couverture activity log |
| `/paperclip:check-code-quality` | Stricture TypeScript, lint, complexité, hygiène des logs |
| `/paperclip:check-testing` | Couverture, tests de contrat adaptateur, isolation multi-tenant |
| `/paperclip:check-security` | Tenance, secrets, approbations, budgets, canal adaptateur signé |
| `/paperclip:generate-adapter` | Scaffold d'adaptateur (local / process / http) |
| `/paperclip:generate-agent-config` | Génère une config `agent.yaml` avec budget + approbations |
| `/paperclip:setup-company` | Bootstrap d'une nouvelle company Paperclip de bout en bout |

## Installation

### Via Makefile (depuis un checkout claude-craft)

```bash
make install-paperclip TARGET=/chemin/vers/mon/projet-paperclip RULES_LANG=fr
```

### Via script

```bash
./Dev/scripts/install-paperclip-rules.sh --lang=fr /chemin/vers/mon/projet-paperclip
```

### Flags

`--install` · `--update` · `--force` · `--preserve-config` · `--dry-run` · `--backup` · `--interactive` · `--lang=<en|fr|es|de|pt>`

## Invariants de gouvernance (non négociables)

- Les adaptateurs ne détiennent jamais d'état de gouvernance (budgets, approbations, permissions vivent uniquement dans le plan de contrôle).
- Les budgets sont des limites strictes. Les dépassements silencieux ne sont jamais acceptables.
- Les approbations bloquent l'exécution de l'adaptateur jusqu'à ce que le plan de contrôle rende sa décision.
- Chaque mutation de BDD émet un événement d'activité. Le journal d'activité est append-only.
- `companyId` provient toujours de la session authentifiée.
- Les plugins déclarent le minimum de capacités ; l'hôte rejette les appels hors périmètre avec `CapabilityDeniedError`.
- Les endpoints publics passent par TLS 1.3 ; authentification opérateur via Better Auth avec un `BETTER_AUTH_SECRET` tourné.

## Liens

- Documentation Paperclip : https://docs.paperclip.ing/
- Dépôt Paperclip : https://github.com/paperclipai/paperclip
- Claude-Craft : https://github.com/TheBeardedBearSAS/claude-craft

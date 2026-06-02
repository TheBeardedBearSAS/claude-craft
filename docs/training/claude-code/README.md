# Formation Claude Code 2.1.159 — Maîtriser l'Agent de Développement

## Vue d'ensemble

Package de formation centré sur Claude Code 2.1.159, couvrant 100% des fonctionnalités de l'outil. Approche progressive : du guidé vers l'autonome.

**Version couverte :**
- Claude Code : 2.1.159 (Adaptive Thinking, MCP, Hooks, Permissions 3-tier, Agent Teams, Fast Mode (Opus 4.6), Opus 4.8 flagship, Native CLI binary, Forked subagents, /ultrareview, /tui, /btw)
- Claude-Craft : mentionné en bonus démo (30 min)

## Contenu du Package

```
claude-code/
├── README.md                     # Ce fichier
├── PLAN-FORMATION.md             # Plan de formation détaillé (10 modules)
├── PROPOSITION-COMMERCIALE.md    # Proposition commerciale
├── email-reponse-emagma.md       # Email de réponse client Emagma
├── modules/
│   ├── jour1/
│   │   ├── 01-introduction-claude-code.md    # L'outil agentique
│   │   ├── 02-claudemd-configuration.md      # Mémoire et permissions
│   │   ├── 03-patterns-travail.md            # Prompt, Plan Mode, sessions
│   │   └── 04-pratique-guidee.md             # Projet existant + vierge
│   └── jour2/
│       ├── 05-hooks-automatisation.md        # 23 hooks, commands custom
│       ├── 06-mcp-integrations.md            # MCP, plugins, CI/CD
│       ├── 07-multi-agent-coordination.md    # Agent Teams, worktrees
│       ├── 08-qualite-securite.md            # TDD, OWASP, Git, cost
│       ├── 09-bonus-claude-craft.md          # Démo Claude-Craft (30min)
│       └── 10-atelier-final.md               # Challenge + plan action
├── exercices/
├── supports/
└── metadata/
```

## Spécificités de cette formation

| Aspect | Détail |
|--------|--------|
| **Focus** | Claude Code pur (pas de framework tiers) |
| **Max stagiaires** | 5 par groupe (accompagnement individuel) |
| **Modules** | 10 modules couvrant 100% des fonctionnalités |
| **Approche** | Progressive : guidé -> assisté -> autonome |
| **Tech-agnostique** | Exercices adaptables à toute stack |
| **Claude-Craft** | Bonus démo de 30 min uniquement |

## Public Cible

- **Équipes de développement** (max 5 par groupe)
- **Stacks** : Toute technologie (formation tech-agnostique)
- **Niveau requis** : Familiarité avec le développement logiciel et Git

## Durée

| Format | Durée | Détail |
|--------|-------|--------|
| Standard | 2 jours (14h) par groupe | Cadrage + 4 jours pour 2 groupes |
| + Suivi | + 3h à J+15 | Retour d'expérience guidé |
| Premium | + 1 mois coaching | Accompagnement continu |

## Prérequis Techniques

- Compte Anthropic avec accès Claude
- Node.js 20+ (pour installation CLI)
- IDE (VS Code recommandé)
- Git
- Terminal bash/zsh

## Couverture des fonctionnalités Claude Code

Tous les modules couvrent exhaustivement les fonctionnalités de Claude Code 2.1.159 :

- Installation (CLI, Desktop, Web, IDE)
- CLAUDE.md (3 niveaux), CLAUDE.local.md
- settings.json (3 niveaux), permissions 3-tier
- Extended Thinking, modèles, Fast Mode
- Plan Mode, gestion contexte, sub-agents
- Sessions, checkpointing, headless mode
- 23 hooks, slash commands custom
- MCP, plugins, IDE intégrations
- CI/CD, --from-pr
- Agent Teams, git worktrees
- Patterns avancés (fan-out, interview, writer/reviewer)
- TDD/BDD, sécurité, git workflow
- Cost management

## Comment Utiliser ce Package

1. **Lisez le plan de formation** (`PLAN-FORMATION.md`)
2. **Personnalisez selon le client** : stack, niveau
3. **Préparez les exercices** adaptés au contexte client
4. **Vérifiez les prérequis** (comptes Anthropic, installations)

## Génération des PDFs

```bash
# Depuis la racine training/
../generate-pdf.sh claude-code
```

---

**Version** : 3.0.0
**Date** : Avril 2026
**Claude Code** : 2.1.159

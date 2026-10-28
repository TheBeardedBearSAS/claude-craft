# Gestion du Contexte

## Vue d'ensemble

La fenetre de contexte est **LA ressource critique** dans Claude Code. Chaque token compte. Une gestion efficace du contexte est la difference entre un assistant productif et un assistant qui perd le fil.

> **Source:** Recommandation #1 Anthropic — "The context window is the single most important resource to manage."

**Principes:**
- Le contexte est une ressource finie et precieuse
- CLAUDE.md et les regles competent pour l'attention du modele
- Utiliser des sous-agents pour les investigations
- Nettoyer le contexte entre les taches

---

## Table des matieres

1. [Regles de taille CLAUDE.md](#regles-de-taille-claudemd)
2. [Nettoyage du contexte](#nettoyage-du-contexte)
3. [Sous-agents pour les investigations](#sous-agents-pour-les-investigations)
4. [Context compaction](#context-compaction)
5. [Boucles de verification](#boucles-de-verification)
6. [Plan Mode](#plan-mode)
7. [Suivi des tokens](#suivi-des-tokens)
8. [Checklist](#checklist)
9. [Compaction hints dans CLAUDE.md](#compaction-hints-dans-claudemd)
10. [CLAUDE.local.md pour preferences personnelles](#claudelocalmd-pour-preferences-personnelles)
11. [Anti-patterns de contexte](#anti-patterns-de-contexte)
12. [Bonnes pratiques de redaction CLAUDE.md](#bonnes-pratiques-de-redaction-claudemd)
13. [Optimisation de performance](#optimisation-de-performance)
14. [Patterns de communication](#patterns-de-communication)
15. [Optimisation des tokens — Quick Setup](#optimisation-des-tokens--quick-setup)

---

## Regles de taille CLAUDE.md

> **CLAUDE.md principal : moins de 200 lignes** (cible Anthropic : « under 200 lines per CLAUDE.md file »).
> Chaque instruction supplementaire dilue l'attention sur les instructions existantes.

```
.claude/
  CLAUDE.md              <- Résumé (< 200 lignes)
  rules/                 <- Règles détaillées (chargées au lancement, sauf celles avec `paths:` → à la demande)
  references/            <- Documentation technique
  skills/                <- Competences a la demande
```

| Pratique | Description |
|----------|-------------|
| **CLAUDE.md court** | Vue d'ensemble, liens vers les regles |
| **Rules modulaires** | Un fichier par sujet dans `.claude/rules/`. **Sans** frontmatter `paths:`, une rule est chargée au lancement (même priorité que `.claude/CLAUDE.md`) ; **avec** `paths:` (globs), elle n'est chargée que lorsque Claude touche des fichiers correspondants |
| **References separees** | Documentation technique dans `.claude/references/` |
| **Skills a la demande** | Competences chargees uniquement quand necessaires |

| Contenu | Emplacement |
|---------|-------------|
| Technologies, commandes, agents, compatibilite | CLAUDE.md |
| Principes SOLID detailles | `.claude/rules/04-solid-principles.md` |
| Regles de securite | `.claude/rules/11-security.md` |
| Workflow d'analyse | `.claude/rules/01-workflow-analysis.md` |

---

## Nettoyage du contexte

```
Utiliser /clear:
- Entre deux taches NON liees
- Apres une longue investigation
- Quand le contexte depasse 50% de la fenetre
- Avant de commencer une nouvelle feature

NE PAS utiliser /clear:
- Au milieu d'une tache en cours
- Si le contexte precedent est necessaire
- Juste apres avoir charge des fichiers pertinents
```

**Signes de pollution:** Claude repete des informations, les reponses deviennent moins precises, confusion entre taches, erreurs malgre des instructions claires.

---

## Sous-agents pour les investigations

> **Deleguer les recherches aux sous-agents pour garder le contexte principal propre.**

Les sous-agents (Task tool) ont leur propre fenetre de contexte, evitant de polluer le contexte principal.

| Situation | Action |
|-----------|--------|
| Chercher un fichier/pattern specifique | Glob/Grep directement |
| Explorer une architecture inconnue | Sous-agent Explore |
| Investigation multi-fichiers (> 3) | Sous-agent Explore |
| Planifier une implementation | Sous-agent Plan |
| Tache independante en parallele | Sous-agent general-purpose |

**Agent frontmatter (v2.1.78+):** Les agents personnalises supportent `effort`, `maxTurns`, `disallowedTools` pour optimiser les couts et le scope. `disallowedTools` retire des outils entiers : une entrée `Bash(git push *)` retire tout Bash à l'agent — bloquer une commande via `permissions.deny` (s'applique aussi aux sous-agents).

**Skill `context: fork` (v2.1.105+):** Tout skill de Claude Craft de plus de 60 lignes utilise `context: fork` pour s'executer dans un contexte isole. Cela evite la pollution du contexte principal sur les sessions longues qui chainent plusieurs skills. Economie estimee : 2 000-5 000 tokens/session pour les skills moyens (60-100 lignes), 8 000-15 000 tokens/session pour les skills lourds (>100 lignes). Règle vérifiée par la lentille `internal-conformance` de `/common:audit-claude-alignment`.

---

## Context compaction

Claude Code compacte automatiquement le contexte quand il approche les limites. Les messages anciens sont resumes pour liberer de l'espace.

- A partir de **70% de contexte**, lancer `/compact` proactivement
- `/memory` (v2.1.59+) sauvegarde des apprentissages persistants qui survivent aux compactions

**Hooks disponibles** pour gerer la compaction:
- **PreCompact** — Sauvegarder le contexte critique avant compaction (peut bloquer via exit code 2 depuis v2.1.105)
- **PostCompact** (v2.1.76+) — Re-injecter le contexte critique apres compaction
- **SessionStart** (matcher `compact`) — Re-injecter `context-essentials.md` apres compaction

---

## Boucles de verification

> **Toujours fournir des moyens de verification: tests, screenshots, outputs attendus.**
> Source: "2-3x improvement in final result quality" (Anthropic)

**Boucles efficaces:** TDD (red/green/refactor), UI (screenshot avant/apres), API (spec/implementation/test curl), CI (modifier/tester/corriger/relancer).

---

## Plan Mode

| Situation | Action |
|-----------|--------|
| Bug simple, 1 fichier | Corriger directement |
| Feature simple, < 3 fichiers | Implementer directement |
| Feature complexe, > 3 fichiers | Plan Mode |
| Refactoring architectural | Plan Mode |
| Choix technologique | Plan Mode |
| Impact incertain | Plan Mode |

---

## Suivi des tokens

La status line affiche le pourcentage de contexte utilise.

| Contexte utilise | Action |
|------------------|--------|
| < 30% | Normal, continuer |
| 30-60% | Surveiller, eviter les lectures inutiles |
| 60-80% | Deleguer aux sous-agents, envisager /clear |
| > 80% | Compaction imminente, sauvegarder le contexte critique |

**`/context`** (v2.1.74+): Suggestions actionnables pour optimiser l'utilisation du contexte.

**`/usage`** (v2.1.143+, enrichi v2.1.149) : compte de tokens exact + coût $ de la session, **avec attribution par composant** (skill, sous-agent, plugin, serveur MCP) — plus précis que le pourcentage de la status line. À lancer vers 60 % de contexte pour identifier le poste le plus coûteux avant de déléguer ou `/clear`. Complémentaire de `/context` (qui suggère la compaction).

| Commande | Effet | Usage |
|----------|-------|-------|
| `/effort low` | Raisonnement minimal, réponses rapides | Tâches simples, lookups, classification |
| `/effort medium` | Profondeur standard | Implémentation standard, tâches agentiques |
| `/effort high` | Raisonnement approfondi | Raisonnement complexe, architecture |
| `/effort xhigh` | Adaptive thinking au maximum | Décisions critiques, migrations complexes, ADR |
| `/effort ultracode` | Toggle séparé (v2.1.284+), Dynamic Workflows | Débit de code maximal — pipelines automatisés, génération massive |

> **L'effort ne change pas de modèle :** il règle la profondeur de raisonnement du modèle courant ; le modèle se choisit avec `/model` (table plus bas). Couples conseillés : `low` sur Haiku 5.5 (`claude-haiku-5-5`), `medium` sur Sonnet 5.5 (`claude-sonnet-5-5`), `high`/`xhigh` sur Opus 5.5 (`claude-opus-5-5`).

> **Effort par défaut (doc Anthropic, octobre 2026) :** `medium` sur Opus 5.5 et Haiku 5.5 ; `high` sur Sonnet 5.5, Fable 5.1 et les modèles *legacy* (Sonnet 5, Opus 4.8). Monter explicitement à `high`/`xhigh` sur Opus 5.5 pour les tâches critiques.

> **Fable 5.1 / Mythos :** **Fable 5.1** (`claude-fable-5-1`, $10/$50 par M tokens) est un modèle courant — pertinent pour les agents créatifs/narratifs ; Fable 5 reste disponible (*legacy*). **Mythos 5 / 5.1** sont en disponibilité limitée (organisations vérifiées via le Cyber Verification Program) — ne pas les recommander par défaut.

**Alerte d'inactivite** (v2.1.84+): Apres 75+ minutes, Claude suggere `/clear`.

**Strategie multi-session:** Diviser en sessions courtes. Session 1: investigation + `/memory` + `/clear`. Session 2: implementation avec contexte frais (~55% reduction tokens).

---

## Checklist

### Avant chaque session

- [ ] CLAUDE.md < 200 lignes
- [ ] Regles modulaires dans `.claude/rules/`
- [ ] Contexte propre (pas de residus de taches precedentes)

### Pendant la session

- [ ] Surveiller le % de contexte
- [ ] Deleguer les investigations aux sous-agents
- [ ] `/clear` entre taches non liees
- [ ] Fournir des tests/outputs attendus

### Pour les taches complexes

- [ ] Utiliser Plan Mode
- [ ] Decomposer en sous-taches
- [ ] Worktrees pour le parallelisme
- [ ] Boucles de verification

---

## Compaction hints dans CLAUDE.md

> **Indiquer a Claude ce qu'il doit preserver lors d'une compaction** (fichiers modifies, commandes de test, decisions d'architecture).

| Variable | Description |
|----------|-------------|
| `CLAUDE_CODE_SUBAGENT_MODEL` | Modèle **par défaut** des sous-agents non typés (ex: `sonnet`). **Depuis Claude Code 2.1.251**, le frontmatter `model:` d'un agent prévaut : les 11 reviewers `model: haiku` restent sur haiku. **Avant 2.1.251, c'était l'inverse** — cette variable écrasait le frontmatter (voir la note de précédence ci-dessous). |
| `CLAUDE_CODE_FORK_SUBAGENT` | `1` pour isoler le contexte des sous-agents (forked subagents, v2.1.117+) ; actif par défaut en `-p`, SDK, desktop et VS Code depuis 2.1.302, `0` pour le désactiver |
| `ENABLE_PROMPT_CACHING_1H` / `FORCE_PROMPT_CACHING_5M` | Etendre/forcer le prompt caching (−40 % sur sessions repetitives) |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | Mettre a `1` pour desactiver la memoire automatique |

> **Précédence modèle — valable depuis Claude Code 2.1.251 :** `model:` passé à l'invocation > `model:` du frontmatter de l'agent (où `inherit` reprend le modèle de la conversation) > `CLAUDE_CODE_SUBAGENT_MODEL` > modèle de la session.
>
> **⚠️ Avant 2.1.251, l'ordre était inversé** : `CLAUDE_CODE_SUBAGENT_MODEL` arrivait en tête et écrasait à la fois le paramètre d'invocation et le frontmatter, y compris `model: inherit`. Sur ces versions, `SUBAGENT_MODEL=sonnet` faisait donc bel et bien tourner sur Sonnet les agents épinglés `model: haiku` — l'inverse de l'intention. Vérifier `claude --version` avant de se fier à cette table. Source : [doc sub-agents](https://code.claude.com/docs/en/sub-agents).

---

## CLAUDE.local.md pour preferences personnelles

Creer un fichier `CLAUDE.local.md` a la racine du projet (gitignore) pour les preferences personnelles (style, chemins locaux, outils personnels).

| Fichier | Portee |
|---------|--------|
| `~/.claude/CLAUDE.md` | Global (tous les projets) |
| `.claude/CLAUDE.md` | Projet (git, equipe) |
| `CLAUDE.local.md` | Projet (gitignore, personnel) |

---

## Anti-patterns de contexte

| Anti-pattern | Description | Solution |
|-------------|-------------|----------|
| **Kitchen-sink session** | Tout faire dans une seule session | `/clear` entre taches, sous-agents |
| **CLAUDE.md surcharge** | > 200 lignes dilue l'attention | Modulariser dans `.claude/rules/` |
| **Over-correcting** | Corrections successives polluent le contexte | Apres 2 echecs, `/clear` et reformuler |
| **Trust-then-verify gap** | Implementer sans verifier | Boucles TDD, tests avant code |
| **Exploration infinie** | Lire trop de fichiers sans objectif | Definir le scope avant d'explorer |

---

## Bonnes pratiques de redaction CLAUDE.md

- **Pointeurs > copies (sans illusion de gain de contexte) :** un import `@chemin` évite la duplication, mais le fichier importé est **chargé au lancement** — il ne réduit pas le coût en contexte. Pour un chargement à la demande, citer le chemin sans `@` (Claude le lira au besoin) ou utiliser une rule avec `paths:` / un skill
- **Emphase avec parcimonie :** `IMPORTANT`, `VOUS DEVEZ`, `JAMAIS` réservés aux quelques contraintes réellement non-négociables — si tout est souligné, plus rien ne ressort (recommandation Anthropic)
- **Maintenance:** Revoir chaque trimestre, traiter comme du code de production

| Fichier | Portee | Usage |
|---------|--------|-------|
| `~/.claude/CLAUDE.md` | Global (tous les projets) | Preferences personnelles universelles |
| `.claude/CLAUDE.md` ou `./CLAUDE.md` | Projet (git) | Conventions d'equipe |
| `CLAUDE.local.md` | Projet (gitignore) | Preferences personnelles projet |

---

## Optimisation de performance

### CLI natifs plutot que MCPs

| Approche | Cout contexte |
|----------|--------------|
| Outil natif (Glob, Grep) | 0 tokens supplementaires |
| Serveur MCP | ~500-2000 tokens/outil/tour |
| CLI externe (gh, aws) | Ponctuel, via Bash |

### MCP Tool Search (v2.1.80+)

| Approche | Cout contexte |
|----------|--------------|
| MCP classique (tous les outils charges) | ~500-2000 tokens/outil/tour |
| MCP avec Tool Search (lazy loading) | ~50 tokens au total |

### Autres optimisations

- **`--bare`** (v2.1.81+): Ignorer hooks/LSP/plugins pour les appels scriptes avec `-p`
- **Monitor** (v2.1.98+): Streamer les evenements d'un processus en arriere-plan au lieu de sleep + poll
- **Plugins Code Intelligence:** `php-lsp`, `typescript-lsp`, `pyright-lsp`, `dart-analyzer`, `csharp-lsp` — un appel `go-to-definition` remplace plusieurs grep + lectures

| Commande | Modele | ID canonique | Usage |
|----------|--------|--------------|-------|
| `/model haiku` | Haiku 5.5 | `claude-haiku-5-5` | Taches simples, classification — $0.10/$0.50 (≤ 100K tokens de prompt) |
| `/model sonnet` | Sonnet 5.5 | `claude-sonnet-5-5` | Taches standard, agentiques — $2/$10 (predecesseur *legacy* : `claude-sonnet-5`) |
| `/model opus` | Opus 5.5 | `claude-opus-5-5` | Raisonnement complexe, architecture — $4/$20 |
| `/model opusplan` | Opus 5.5 (plan) / Sonnet 5.5 (execute) | — | **Tiering dynamique** : Opus pour le Plan Mode, Sonnet pour l'execution — optimise le ratio cout/qualite sur les taches longues |

---

## Patterns de communication

**Pattern Interview:** Demander a Claude de vous interviewer avant de coder pour obtenir une specification complete.

**Structure CIF (Context, Intent, Format):**

| Element | Description | Exemple |
|---------|-------------|---------|
| **Context** | Situation actuelle | "Dans le module auth, le token JWT expire apres 15min" |
| **Intent** | Objectif precis | "Ajouter le refresh token avec rotation" |
| **Format** | Format de sortie attendu | "Generer le service + les tests unitaires" |

**Pattern Writer/Reviewer:** Session A implemente, Session B relit avec contexte frais, Session A integre les retours.

---

## Optimisation des tokens — Quick Setup

> **Commande:** `/common:setup-rtk` pour configurer automatiquement toutes les optimisations.

**RTK (Rust Token Killer):** Proxy CLI qui reduit la consommation de tokens de 60-90% sur les commandes dev. Installation: `rtk init -g`.

**Modele sub-agents:** `export CLAUDE_CODE_SUBAGENT_MODEL="sonnet"` — 40-60% de reduction de cout.

**Hooks d'optimisation:**

| Hook | Fichier | Impact |
|------|---------|--------|
| **PostToolUse** (Bash) | `~/.claude/hooks/post-tool-filter.sh` | Guide Claude a resumer les outputs >10KB |
| **PostToolUse** (Read) | settings.json integre | Alerte si fichier lu >50KB — incite a extraire uniquement la section pertinente |
| **PreCompact** | `~/.claude/hooks/pre-compact.sh` | Preserve le contexte critique avant compaction |
| **SessionStart** (compact) | Template `context-reinject.json` | Re-injecte `context-essentials.md` apres compaction |

Templates disponibles dans `.claude/templates/hooks/`: `output-filter.json`, `pre-compact.json`, `context-reinject.json`.

| Optimisation | Economie |
|---|---|
| RTK + ultra-compact | 60-90% sur outputs CLI |
| SUBAGENT_MODEL=sonnet | 40-60% cout sub-agents |
| ENABLE_PROMPT_CACHING_1H | -40% sur sessions repetitives (active par defaut dans settings.json) |
| fallbackModel | Fiabilite Opus — pas d'interruption de session (active par defaut dans settings.json) |
| PostToolUse hook (Bash+Read) | Reduit pollution contexte (5K-50K tokens/session sur gros fichiers) |
| PreCompact hook | Evite perte de contexte |
| Skills `context: fork` (>60 lignes) | 2K-15K tokens par session longue chainant plusieurs skills |
| **Total combine** | **60-75% reduction globale** |

---

> Exemples detailles et templates : voir @.claude/references/base/context-management.md

---

## Nouvelles commandes (v2.1.105+)

| Commande | Description | Usage |
|----------|-------------|-------|
| `/btw` | Questions rapides sans changement de contexte | Lookups, syntaxe, clarifications |
| `/hooks` | Gestion interactive des hooks | Activer/desactiver, tester, debugger |
| `/reload-plugins` | Rechargement manuel des plugins | Apres mise a jour de plugins |
| `/reload-skills` (v2.1.157+) | Re-scan des skills sans redemarrage (distinct de `/reload-plugins`) | Apres ajout/modif d'un skill |
| `/proactive` | Alias pour `/loop` | Monitoring proactif recurrent |
| `/cd` (v2.1.166+) | Deplace la session vers un nouveau repertoire sans reconstruire le cache de prompt | Monorepo, changement de module en cours de session |
| `/config key=value` (v2.1.178+) | Definit n'importe quel reglage depuis le prompt, en `-p` et via Remote Control | Scriptage, ajustement a chaud |
| `claude mcp login` / `logout` (v2.1.185+) | Authentifie un serveur MCP depuis le shell (au lieu du menu `/mcp`), efface les credentials stockes | CI, setup MCP scripte |

**Nouveautes plateforme (semaines 24-26, 2026) :**

| Feature | Version | Interet |
|---------|---------|---------|
| **Artifacts** | 2.1.178+ (beta Team/Enterprise) | Transforme la sortie d'une session en page live partageable (claude.ai) — walkthrough de PR, dashboards, checklists |
| **`/rewind` post-`/clear`** | 2.1.185+ | Reprend une conversation d'avant le `/clear` — recuperation de contexte |
| **Background subagents → prompts de permission** | 2.1.185+ | Les sous-agents en arriere-plan remontent les demandes de permission en session principale (au lieu d'auto-refuser) |
| **Shell mode repond a l'output** | 2.1.185+ | `! npm test` obtient une explication sans second prompt |
| **Sous-agents imbriques** | 2.1.166+ | Un sous-agent peut lancer ses propres sous-agents (chaines plafonnees a 5 niveaux) |
| **Deny/ask rules sur parametres d'outil** | 2.1.178+ | `Tool(param:value)`, ex. `Agent(model:opus)` — controle fin des permissions |
| **`--safe-mode`** | 2.1.166+ | Demarre Claude Code avec toutes les customisations desactivees (troubleshooting) |

> **⚠️ Trigger Dynamic Workflows renomme (v2.1.160) :** le mot-cle declencheur est passe de `workflow` a **`ultracode`**. Demander un workflow « avec ses propres mots » fonctionne toujours. Le palier `/effort ultracode` (ci-dessus) reste valide.

> **Hook `MessageDisplay` (v2.1.157+) :** nouvel evenement permettant de transformer/masquer le texte assistant a l'affichage — utile pour un filtrage RTK-style cote sortie. `SessionStart` peut retourner `reloadSkills: true` pour rendre disponibles les skills qu'il installe dans la meme session.

---

## Variables d'environnement supplementaires (v2.1.105+)

| Variable | Description |
|----------|-------------|
| `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` | Charger CLAUDE.md depuis `--add-dir` |
| `MAX_THINKING_TOKENS=8000` | Limite tokens de reflexion |
| `SLASH_COMMAND_TOOL_CHAR_BUDGET` | Budget caracteres slash commands |
| `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` | PowerShell au lieu de Bash (Windows, v2.1.84+) |
| `OTEL_LOG_USER_PROMPTS` | Log prompts dans traces (beta) |
| `OTEL_LOG_TOOL_DETAILS` | Log details outils (beta) |
| `OTEL_LOG_TOOL_CONTENT` | Log contenu outils (beta, verbose) |

### `fallbackModel` — repli automatique (settings.json, v2.1.166+)

Reglage **fiabilite + cout** : jusqu'a 3 modeles de repli essayes dans l'ordre quand le primaire est surcharge/indisponible (flag equivalent `--fallback-model`, applique aussi aux sessions interactives).

```json
{ "fallbackModel": ["claude-sonnet-5-5", "claude-haiku-5-5"] }
```

Pour les 4 agents `opus` (security-auditor, database-architect, migration-specialist, ralph-conductor), ce repli `opus → sonnet → haiku` evite les interruptions en pic de charge Opus sans degrader le travail courant. Exemple pret a l'emploi dans `.claude/settings.local.json.example`.

**IDs canoniques (octobre 2026) :** `claude-opus-5-5` ($4/$20) | `claude-sonnet-5-5` ($2/$10) | `claude-haiku-5-5` ($0.10/$0.50) | `claude-fable-5-1` ($10/$50). *Legacy* toujours disponibles : `claude-opus-4-8`, `claude-sonnet-5` ($2/$10, tarif devenu standard), `claude-haiku-4-5-20251001`, `claude-fable-5`. Source : [models overview](https://platform.claude.com/docs/en/about-claude/models/overview).

---

## Skills avances (v2.1.105+)

| Frontmatter | Description |
|-------------|-------------|
| `context: fork` | Execution dans un contexte isole (pas de pollution). Seuil recommande : **>60 lignes**. |
| `disable-model-invocation: true` | Empeche l'invocation automatique par Claude |
| `claudeMdExcludes` (setting) | Exclure des CLAUDE.md specifiques dans les monorepos |

**Auto-compaction et skills :** Apres compaction, les skills se rechargent (5K tokens/skill, 25K total max).

---

## Outils tiers de l'écosystème (tokens & contexte)

En complément de RTK et des hooks natifs, l'écosystème Claude Code fournit des outils couvrant des angles non traités nativement. Aucun n'est embarqué dans Claude Craft : ils sont documentés et recommandés.

| Outil | Licence | Angle | Reco |
|-------|---------|-------|------|
| **caveman** | Apache-2.0 | Compression des réponses (output) ~65 % | ✅ Intégrer |
| **code-review-graph** | MIT | Graphe AST, lecture du blast radius (−38× à −528×) | ✅ Intégrer |
| **token-savior** | MIT | Index symbolique + compaction Bash (−80 %) | ✅ Intégrer |
| **claude-token-efficient** | MIT | Règles CLAUDE.md anti-verbosité (~63 % output) | ✅ Intégrer |
| **context-mode** | ELv2 | Sandbox des outputs, continuité post-compaction | 🔶 Référencer (licence) |
| **claude-context** | MIT | Recherche sémantique (vector DB requise) | 🔶 Référencer (infra) |

> Catalogue complet, licences et recettes d'activation : `@docs/ECOSYSTEM.md`. Auditer et pinner tout outil tiers avant installation (règle 11).

---

## Ressources

- **Anthropic Best Practices:** [code.claude.com](https://code.claude.com/docs/en/overview)
- **Boris Cherny Workflow:** Parallel worktrees + verification loops
- **Claude Code Context Management:** Context compaction, `/clear`, sub-agents
- **`/init`:** Genere automatiquement un CLAUDE.md a partir de l'analyse du projet
- **CLAUDE.md Authoring:** [Builder.io Guide](https://www.builder.io/blog/claude-md-guide), [HumanLayer Blog](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- **Cost Optimization:** [Anthropic Costs Docs](https://code.claude.com/docs/en/costs)

---

**Date de derniere mise a jour:** 2026-06
**Version:** 1.3.0
**Auteur:** The Bearded CTO

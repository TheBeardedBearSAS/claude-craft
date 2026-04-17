# Phase 3 — DX & Ergonomie (2-4 mois, ~280h)

## Objectif
Transformer l'expérience développeur : auto-complétion shell, recherche fuzzy, learning paths, intégration Monitor/Auto Mode. Score DX cible : 6.8 → 8.5.

## Statut actuel
- La conversion rules→skills (Phase 2) libère ~17K tokens de contexte, permettant des features DX plus riches
- Aucun des items DX n'a été livré dans les phases existantes (focus était sécurité/qualité)
- Les items FUNC et OPP liés à DX sont à intégrer

## Prérequis
- Phase 2 ≥80% DoD (rules→skills conversion terminée, coverage ≥60%)
- Peut chevaucher Phase 2 Sprint 2.3 sur les items indépendants

## Actions restantes

### Sprint 3.1 — Auto-complétion & Recherche (semaine 1-3)

#### Batch parallèle A — CLI DX (2 agents indépendants)

**Agent 1:** `@refactoring-specialist` (ou general-purpose)

**Prompt:**
```
Contexte : 214 commandes CLI sans aucune auto-complétion shell. Rapport 02 DX-05. C'est le pain point #1 des utilisateurs.

Tâche :
1. Générer scripts d'auto-complétion pour bash, zsh et fish :
   - Lister toutes les commandes via cli/index.js ou .claude/commands/**/
   - Bash : fichier completions/claude-craft.bash (compgen/complete)
   - Zsh : fichier completions/_claude-craft (compadd)
   - Fish : fichier completions/claude-craft.fish (complete -c)
2. Intégrer dans le CLI : `claude-craft completions install` qui copie le bon fichier
3. Documenter dans docs/QUICKSTART.md et docs/CLI-REFERENCE.md
4. Supporter les sous-commandes (/symfony:check-*, /react:generate-*, etc.)

Recherches :
  WebSearch "CLI shell completion generator bash zsh fish Node.js 2026"
  WebSearch "tabtab npm shell completion 2026"
  context7 resolve-library-id 'mklabs/tabtab'

Fichiers : cli/index.js, completions/, docs/QUICKSTART.md, docs/CLI-REFERENCE.md
DoD : claude-craft <TAB> complète les 27 namespaces, <TAB><TAB> complète les commandes du namespace
```

**Agent 2:** `@refactoring-specialist`

**Prompt:**
```
Contexte : Impossible de chercher une commande par mot-clé parmi 214. Rapport 02 DX-07.

Tâche :
1. Créer commande /search <query> avec fuzzy matching (Levenshtein ou fuse.js)
   - Cherche dans : nom de commande, description, tags
   - Affiche top 5 résultats avec score de pertinence
   - Inclut les skills et agents dans la recherche
2. Ajouter 20 aliases pour commandes fréquentes (DX-06) :
   - /ca → /common:audit-freshness
   - /ci → /common:init
   - /sc → /symfony:check-compliance
   - /rc → /react:check-compliance
   - etc. (20 aliases les plus utiles basés sur fréquence d'usage)
3. Créer .claude/commands/common/search.md

Fichiers : .claude/commands/common/search.md, cli/aliases.js (nouveau), docs/CLI-REFERENCE.md
DoD : /search "test coverage" retourne les commandes pertinentes, 20 aliases fonctionnels
```

#### Batch parallèle B — Documentation DX (2 agents, parallèle avec A)

**Agent 3:** `@research-assistant`

**Prompt:**
```
Contexte : Gap abrupt après wizard /getting-started. Rapport 02 DX-17/18/19.

Tâche :
1. Créer cheat sheet 1 page (DX-18) : docs/CHEAT-SHEET.md
   - 27 namespaces avec 1-2 commandes clés chacun
   - Section "Top 10 commandes" par persona (dev, QA, PM)
   - Format imprimable (pas de liens, juste texte)
   - Commande /cheatsheet qui l'affiche
2. Créer 3 learning paths progressifs (DX-17) :
   - Débutant : /getting-started → /init → /workflow:init (3 commandes)
   - Intermédiaire : audits → tests → refactoring (10 commandes)
   - Avancé : agent teams → Ralph → QA Recette (15 commandes)
   - Commande /learn:next qui suggère l'étape suivante
3. Créer /doc:search (DX-16) : recherche dans docs/*.md avec fuzzy matching

Fichiers : docs/CHEAT-SHEET.md, .claude/commands/common/learn-next.md, .claude/commands/common/doc-search.md
DoD : /cheatsheet affiche 1 page, /learn:next propose progression contextuelle
```

**Agent 4:** `@research-assistant`

**Prompt:**
```
Contexte : Documentation fonctionnalités manquantes. Rapports 04 FUNC-22/24/13.

Tâche :
1. Guide unifié Ralph Wiggum (FUNC-22) : consolider Project/Ralph/ + docs/RALPH-GUIDE.md
   - Setup, configuration, DoD validators, troubleshooting
   - < 300 lignes, exemples concrets
2. Guide Agent Teams (FUNC-24) : consolider Project/AgentTeams/ + docs/AGENT-TEAMS-GUIDE.md
   - Patterns de parallélisation, exemples, anti-patterns
   - < 200 lignes
3. Guide LSP plugins (FUNC-13) : docs/plugins/LSP-GUIDE.md
   - Installation par stack (TypeScript, PHP, Python, Dart, C#)
   - Commandes utiles (go-to-definition, find-references)
   - Comparaison tokens : grep+read vs LSP call

Fichiers : docs/RALPH-GUIDE.md, docs/AGENT-TEAMS-GUIDE.md, docs/plugins/LSP-GUIDE.md
DoD : 3 guides publiés, liens dans README et CLAUDE.md
```

### Sprint 3.2 — Intégration Claude Code avancée (semaine 4-6)

#### Batch parallèle C — Monitor & Auto Mode (2 agents)

**Agent 5:** `@refactoring-specialist`

**Prompt:**
```
Contexte : Ralph utilise sleep polling au lieu du Monitor tool. Rapport 04 FUNC-12 / rapport 10 OPP-07.

Tâche :
1. Identifier dans Ralph (Project/Ralph/) tous les patterns de polling (sleep + check)
2. Remplacer par Monitor tool (streaming events)
   - Monitor pour suivre les builds, tests, processus long
   - Notification quand terminé au lieu de boucle sleep
3. Documenter le changement dans docs/RALPH-GUIDE.md
4. Tests E2E mis à jour

Recherches :
  WebSearch "Claude Code Monitor tool usage 2026"
  Lire .claude/COMPATIBILITY.md pour version Monitor tool

Fichiers : Project/Ralph/*.sh ou *.js, docs/RALPH-GUIDE.md
DoD : 0 patterns sleep+poll dans Ralph, Monitor tool utilisé
```

**Agent 6:** `@research-assistant`

**Prompt:**
```
Contexte : Auto Mode de Claude Code v2.1.94+ non intégré. Rapport 10 OPP-06.

Tâche :
1. Créer profil Auto Mode optimisé pour Claude Craft :
   - Auto-approve : build, test, lint, format (commandes safe)
   - Confirm : git push, deploy, destructive operations
   - Block : rm -rf, force push, secrets exposure
2. Documenter dans .claude/templates/auto-mode-profile.json
3. Guide d'activation dans docs/guides/AUTO-MODE.md
4. Référencer dans CLAUDE.md et QUICKSTART.md

Recherches :
  WebSearch "Claude Code Auto Mode configuration profile 2026"
  context7 query-docs pour claude-code auto-mode

Fichiers : .claude/templates/auto-mode-profile.json, docs/guides/AUTO-MODE.md
DoD : profil Auto Mode prêt, documenté, testé sur 3 workflows
```

#### Batch parallèle D — Parité commandes & performance (2 agents)

**Agent 7:** `@refactoring-specialist`

**Prompt:**
```
Contexte : 5 stacks secondaires ont seulement 1 commande vs 10 pour les stacks principales. Rapport 04 FUNC-01.

Tâche : Créer les commandes manquantes pour atteindre parité (9 commandes × 5 stacks = 45 commandes)
- Stacks : Angular, Vue.js, Laravel, C#, PHP
- Commandes à créer par stack : check-testing, check-code-quality, check-architecture, check-security, check-compliance, generate-component (ou équivalent stack), + 3-4 spécifiques

Méthode :
1. Prendre les commandes Symfony/React comme template
2. Adapter pour chaque stack (conventions, outils, patterns)
3. i18n EN + FR obligatoire
4. Chaque commande testable manuellement

Fichiers : .claude/commands/{angular,vuejs,laravel,csharp,php}/*.md
DoD : 5 stacks × 10 commandes = 50 commandes, toutes testables
```

**Agent 8:** `@performance-auditor`

**Prompt:**
```
Contexte : INDEX.md 215 lignes (cible 150), CLI modules tous chargés au démarrage, DepsView 530KB. Rapports 06 PERF-02/08/09.

Tâche :
1. Condenser INDEX.md à 150 lignes (PERF-02) : supprimer redondances, fusionner sections similaires
2. Lazy-load modules CLI (PERF-08) : kanban, ralph, doctor chargés à la demande seulement
3. Lazy-load DepsView dans Kanban (PERF-09) : import dynamique, chargé seulement si onglet ouvert

Fichiers : .claude/INDEX.md, cli/*.js, website/kanban/
DoD : INDEX.md ≤150 lignes, CLI startup time mesuré avant/après, DepsView bundle < 200KB
```

### Sprint 3.3 — Historique & Commandes secondaires (semaine 7-8)

#### Batch parallèle E — Features DX avancées (2 agents)

**Agent 9:** `@refactoring-specialist`

**Prompt:**
```
Contexte : Pas d'historique ni de favoris. Rapport 02 DX-09. + Commande update manquante (SCAL-13/14).

Tâche :
1. /history : stocker dernières 50 commandes utilisées dans ~/.claude-craft/history.json
   - Afficher avec timestamps et fréquence
2. /favorites : marquer des commandes comme favorites
   - Afficher en priorité dans auto-complétion
3. claude-craft update : vérifier nouvelle version NPM et proposer MAJ (SCAL-13)
   - Notification au démarrage si version > 30 jours (SCAL-14)

Fichiers : .claude/commands/common/history.md, .claude/commands/common/favorites.md, cli/update.js
DoD : /history affiche 10 dernières commandes, /favorites fonctionne, update vérifie version
```

**Agent 10:** `@research-assistant`

**Prompt:**
```
Contexte : Items documentation mineurs. FUNC-09, FUNC-11, FUNC-15, FUNC-16.

Tâche :
1. Guide Getting Started BMAD v6 (FUNC-09) : docs/guides/BMAD-GETTING-STARTED.md (< 100 lignes)
2. Clarifier BMAD roles vs agents dans AGENTS.md (FUNC-11) : ajouter note explicative
3. Documenter Auto Mode (FUNC-15) : section dans docs/CLI-REFERENCE.md
4. Documenter /btw, /hooks, /proactive (FUNC-16) : ajouter dans docs/CLI-REFERENCE.md
5. Zod validation pour tech-registry (ARCH-03) : ajouter schéma Zod

Fichiers : docs/guides/BMAD-GETTING-STARTED.md, docs/AGENTS.md, docs/CLI-REFERENCE.md, cli/tech-registry.js
DoD : 4 sections doc ajoutées, Zod validation active
```

## Actions humaines (non automatisables)
Aucune action purement humaine dans cette phase — tout est automatisable par agents.

## Recherches web/MCP pré-rédigées

```javascript
WebSearch({ query: "tabtab npm shell completion bash zsh fish 2026" })
WebSearch({ query: "fuse.js fuzzy search CLI Node.js 2026" })
WebSearch({ query: "Claude Code Monitor tool streaming events API 2026" })
WebSearch({ query: "Claude Code Auto Mode profile configuration 2026" })
WebSearch({ query: "Angular 21 CLI commands best practices 2026" })
WebSearch({ query: "Vue.js 3.6 Vapor mode testing patterns 2026" })
mcp__context7__resolve-library-id({ libraryName: "mklabs/tabtab" })
mcp__context7__resolve-library-id({ libraryName: "krisk/fuse" })
```

## DoD & Validation globale

```bash
# Auto-complétion
claude-craft completions install --shell=bash && source ~/.bashrc
claude-craft <TAB>  # Affiche 27 namespaces

# Recherche
/search "test"  # Retourne commandes testing

# Aliases
/ca  # = /common:audit-freshness

# Learning paths
/learn:next  # Suggère prochaine étape

# Monitor
grep -r "sleep" Project/Ralph/  # 0 patterns polling

# Performance
wc -l .claude/INDEX.md  # ≤150

# Parité commandes
ls .claude/commands/angular/ | wc -l  # ≥10
ls .claude/commands/vuejs/ | wc -l  # ≥10
ls .claude/commands/laravel/ | wc -l  # ≥10
ls .claude/commands/csharp/ | wc -l  # ≥10
ls .claude/commands/php/ | wc -l  # ≥10
```

## Risques & Rollback

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Auto-complétion incompatible certains shells | Moyenne | Tester bash 5+, zsh 5+, fish 3+ |
| Fuzzy search trop lent avec 214 commandes | Faible | Index pré-calculé au startup |
| Monitor tool API change | Faible | Fallback sleep si Monitor non disponible |
| Parité commandes qualité inégale | Moyenne | Tech reviewers par stack après création |

## Condition de passage à Phase 4

- [ ] Auto-complétion fonctionnelle (bash + zsh + fish)
- [ ] /search retourne résultats pertinents
- [ ] 20 aliases définis
- [ ] 3 learning paths documentés
- [ ] Ralph utilise Monitor (0 sleep polling)
- [ ] Parité commandes : 5 stacks × 10 commandes
- [ ] INDEX.md ≤150 lignes

→ [phase-4-differenciation-ecosysteme.md](phase-4-differenciation-ecosysteme.md)

# Performance & Optimisation — Audit Claude Craft v8.1.0

**Date** : 2026-04-16
**Auditeur** : Performance Auditor Agent (multi-pass)
**Score global** : 7.0/10

---

## Résumé exécutif

Claude Craft démontre une architecture TCL (Token-Conscious Loading) sophistiquée avec un CLAUDE.md principal de 183 lignes et un chargement à la demande via `@` pointeurs. Cependant, les 12 fichiers de règles auto-chargées représentent un coût contextuel significatif de ~2 650 lignes (~20 000 tokens). Le Kanban UI est fonctionnel mais le bundle DepsView (530 KB) est disproportionné. Les agents sont intelligemment distribués entre Haiku (15%), Sonnet (77%) et Opus (8%), optimisant les coûts. Le CLI est léger (59 KB de code, 11 dépendances) mais manque de lazy loading.

---

## Métriques clés

| Métrique | Valeur | Cible | Statut |
|----------|--------|-------|--------|
| CLAUDE.md (lignes) | 183 | < 200 | OK |
| CLAUDE.md (bytes) | 8 115 | < 10 000 | OK |
| INDEX.md (lignes) | 215 | < 150 | DÉPASSÉ |
| Rules auto-chargées (total lignes) | 2 650 | < 1 000 | CRITIQUE |
| Rules auto-chargées (bytes) | 82 704 | < 40 000 | CRITIQUE |
| Tokens estimés (rules) | ~20 676 | < 10 000 | CRITIQUE |
| Kanban bundle total | ~711 KB | < 300 KB | DÉPASSÉ |
| DepsView.js (plus gros chunk) | 530 KB | < 200 KB | CRITIQUE |
| Dépendances production | 11 | < 15 | OK |
| CLI code total | ~59 KB | — | OK |
| Agents Haiku | 4 (15.4%) | — | BON |
| Agents Sonnet | 20 (76.9%) | — | BON |
| Agents Opus | 2 (7.7%) | — | BON |

---

## Constats détaillés

### Token Optimization (TCL Architecture)

#### Constat PERF-01 : CLAUDE.md respecte la limite de 200 lignes
- **Sévérité** : Info (positif)
- **Localisation** : `.claude/CLAUDE.md` — 183 lignes, 8 115 bytes
- **Description** : Le CLAUDE.md principal est bien optimisé à 183 lignes, en dessous de la limite documentée de 200 lignes. Il utilise des tableaux condensés et des pointeurs `@` vers les références détaillées.
- **Impact** : ~2 029 tokens (à 4 chars/token). Coût contextuel acceptable.

#### Constat PERF-02 : INDEX.md dépasse la cible
- **Sévérité** : Mineur
- **Localisation** : `.claude/INDEX.md` — 215 lignes, 6 149 bytes
- **Description** : L'INDEX.md fait 215 lignes. Bien qu'il ne soit pas auto-chargé (chargé à la demande), il pourrait être plus concis pour réduire le coût quand il est invoqué.
- **Impact** : ~1 537 tokens quand chargé.
- **Recommandation** : Réduire à 150 lignes en condensant les tables. Prioriser les informations les plus fréquemment consultées.
- **Effort** : S (2h)

#### Constat PERF-03 : Rules auto-chargées — coût contextuel excessif
- **Sévérité** : Critique
- **Localisation** : `.claude/rules/` — 12 fichiers, 2 650 lignes, 82 704 bytes
- **Description** : Les 12 fichiers de règles dans `.claude/rules/` sont TOUS auto-chargés par Claude Code à chaque session. Le coût total est estimé à ~20 676 tokens (~82 704 / 4). C'est considérable et dépasse largement la recommandation de maintenir le contexte auto-chargé minimal.

  **Détail par fichier (du plus lourd au plus léger) :**

  | Fichier | Lignes | Bytes | Tokens est. |
  |---------|--------|-------|-------------|
  | 17-async.md | 490 | 11 084 | 2 771 |
  | 14-multitenant.md | 401 | 10 514 | 2 629 |
  | 12-context-management.md | 366 | 14 091 | 3 523 |
  | 21-cqrs.md | 316 | 9 351 | 2 338 |
  | 10-documentation.md | 292 | 7 625 | 1 906 |
  | 09-git-workflow.md | 261 | 6 797 | 1 699 |
  | 01-workflow-analysis.md | 236 | 9 340 | 2 335 |
  | 23-karpathy-principles.md | 101 | 4 197 | 1 049 |
  | 07-testing.md | 62 | 2 442 | 611 |
  | 11-security.md | 53 | 3 307 | 827 |
  | 05-kiss-dry-yagni.md | 39 | 1 928 | 482 |
  | 04-solid-principles.md | 33 | 2 028 | 507 |

- **Recommandation** : Convertir les règles lourdes (>100 lignes) en skills chargés à la demande. Garder uniquement les quick-references (<50 lignes) en tant que rules. Objectif : rules total < 500 lignes.
  - `17-async.md` (490 lignes) → skill `async`
  - `14-multitenant.md` (401 lignes) → skill `multitenant`
  - `12-context-management.md` (366 lignes) → skill `context-management`
  - `21-cqrs.md` (316 lignes) → skill `cqrs`
  - `10-documentation.md` (292 lignes) → skill `documentation`
  - `09-git-workflow.md` (261 lignes) → skill `git-workflow`
  - `01-workflow-analysis.md` (236 lignes) → skill `workflow-analysis`
- **Impact** : Réduction de ~18 000 tokens auto-chargés → ~2 500 tokens (les 5 rules restantes).
- **Effort** : L (16-24h — refactoring structurel)

#### Constat PERF-04 : Ratio rules auto-chargées vs CLAUDE.md inversé
- **Sévérité** : Majeur
- **Localisation** : `.claude/CLAUDE.md` (8 KB) vs `.claude/rules/` (83 KB)
- **Description** : Les rules auto-chargées pèsent 10x plus que le CLAUDE.md principal. Le framework prêche "CLAUDE.md < 200 lignes" mais les rules compensent en ajoutant 2 650 lignes de contexte obligatoire. L'effet net est un contexte auto-chargé de ~90 KB (~22 700 tokens), ce qui est significatif sur un contexte de 200K tokens.
- **Recommandation** : Appliquer le même principe de concision aux rules. Voir PERF-03.
- **Effort** : Inclus dans PERF-03

### Context Budget Impact

#### Constat PERF-05 : Coût total d'une installation Claude Craft
- **Sévérité** : Majeur
- **Localisation** : `.claude/` entier
- **Description** : Tailles des répertoires installés :
  - `rules/` : 112 KB (auto-chargé)
  - `references/` : 1.8 MB (à la demande)
  - `agents/` : 332 KB (à la demande)
  - `skills/` : 624 KB (à la demande, certains auto-suggest)
  - `commands/` : 1.5 MB (à la demande)
  - `templates/` : 340 KB (à la demande)
  - **Total installé** : ~4.7 MB
  - **Auto-chargé** : ~91 KB (CLAUDE.md + settings.json + rules)
- **Impact** : ~22 700 tokens auto-chargés par session. Environ 11% d'un contexte de 200K tokens, ou 2.3% d'un contexte de 1M tokens.
- **Recommandation** : Pour Opus (1M contexte), c'est acceptable. Pour Sonnet (200K), c'est significatif. Offrir un mode "lean" qui ne charge que le CLAUDE.md et 2-3 rules essentielles.
- **Effort** : M (8h)

#### Constat PERF-06 : Skills auto-suggest coûteux
- **Sévérité** : Mineur
- **Localisation** : `.claude/skills/*/SKILL.md` avec `auto_suggest: true`
- **Description** : Les skills avec `auto_suggest: true` sont automatiquement invoqués quand Claude Code détecte un pattern. Chaque invocation charge le SKILL.md (~50-239 lignes) dans le contexte. Si plusieurs skills se déclenchent simultanément, le coût est multiplicatif.
- **Recommandation** : Limiter `auto_suggest: true` aux skills les plus essentiels (<5). Les autres devraient être invoqués explicitement.
- **Effort** : S (1h)

### CLI Performance

#### Constat PERF-07 : CLI léger et bien structuré
- **Sévérité** : Info (positif)
- **Localisation** : `cli/lib/` — 16 fichiers, ~59 KB total
- **Description** : Le CLI est bien modulaire avec des fichiers de 784B à 9.5KB. Le plus gros module est `installer.js` (9.5 KB). Les imports sont statiques (ES modules) mais la structure permet un futur lazy loading.
- **Évaluation** : Excellente architecture pour un CLI de cette taille.

#### Constat PERF-08 : Toutes les dépendances importées au démarrage
- **Sévérité** : Mineur
- **Localisation** : `cli/index.js`
- **Description** : Le CLI importe tous les modules au démarrage, même pour des commandes simples comme `--help`. Des imports dynamiques (`await import()`) pour les commandes lourdes (kanban, ralph) amélioreraient le temps de démarrage.
- **Recommandation** : Lazy-load les modules kanban, ralph, et doctor qui ne sont pas toujours nécessaires.
- **Effort** : S (2h)

### Kanban UI Performance

#### Constat PERF-09 : Bundle DepsView disproportionné (530 KB)
- **Sévérité** : Majeur
- **Localisation** : `cli/kanban/client/dist/assets/DepsView-Wi8ePuU9.js` — 529.9 KB
- **Description** : Le chunk DepsView (graphe de dépendances) pèse 530 KB, soit 74% du bundle total. C'est dû aux bibliothèques cytoscape (3D graph) + cytoscape-dagre (layout). Pour comparaison, le chunk principal (index) ne fait que 51 KB.
  
  **Détail du bundle :**
  | Fichier | Taille |
  |---------|--------|
  | DepsView.js | 530 KB |
  | DocsView.js | 62 KB |
  | BurndownView.js | 54 KB |
  | index.js | 51 KB |
  | **Total JS** | **697 KB** |
  | Total CSS | 14.4 KB |
  | **Total bundle** | **711 KB** |

- **Recommandation** : Le code-splitting est déjà en place (bon). Considérer le lazy-loading de DepsView uniquement quand l'utilisateur navigue vers cette vue. Évaluer des alternatives plus légères à cytoscape (d3-dag, elkjs).
- **Effort** : M (8h)

#### Constat PERF-10 : SSE heartbeat toutes les 30s
- **Sévérité** : Info
- **Localisation** : `cli/kanban/server/app.js` (endpoint `/api/events`)
- **Description** : Le heartbeat SSE est configuré à 30 secondes, ce qui est raisonnable pour maintenir la connexion. Le serveur utilise `stream.sleep(30_000)` qui est non-bloquant.
- **Évaluation** : Correct.

### Sub-agent Model Costs

#### Constat PERF-11 : Distribution des modèles agents bien optimisée
- **Sévérité** : Info (positif)
- **Localisation** : `.claude/agents/*.md`
- **Description** : La distribution est intelligente :
  - **Haiku (4 agents, 15%)** : accessibility-expert, cost-optimizer, performance-auditor, research-assistant — tâches de lecture/analyse
  - **Sonnet (20 agents, 77%)** : tous les reviewers et spécialistes — bon rapport qualité/coût
  - **Opus (2 agents, 8%)** : ralph-conductor et tdd-coach — tâches nécessitant un raisonnement complexe
- **Économie estimée** : vs tout-Opus, la distribution actuelle économise ~60% du coût des sub-agents.
- **Recommandation** : Envisager de passer `security-auditor` de Sonnet à Opus pour les audits critiques. Documenter le rationale du choix de modèle par agent.
- **Effort** : S (1h)

#### Constat PERF-12 : Variable CLAUDE_CODE_SUBAGENT_MODEL dans settings.json
- **Sévérité** : Info (positif)
- **Localisation** : `.claude/settings.json` → `env.CLAUDE_CODE_SUBAGENT_MODEL: "claude-sonnet-4-5"`
- **Description** : Le projet force Sonnet comme modèle par défaut pour les sub-agents génériques, économisant significativement vs Opus. Les agents qui nécessitent Opus l'overrident dans leur frontmatter.
- **Évaluation** : Bonne pratique documentée et appliquée.

### RTK (Rust Token Killer)

#### Constat PERF-13 : RTK — mécanisme d'optimisation robuste
- **Sévérité** : Info
- **Localisation** : `Tools/RTK/`
- **Description** : RTK est un proxy CLI en Rust qui intercepte les commandes terminal et compresse leurs outputs avant qu'ils n'atteignent Claude Code. Gain documenté : 60-90% de réduction de tokens sur les commandes dev (git status, npm test, etc.). Intégré via hooks Claude Code (transparent).
- **Recommandation** : Ajouter des benchmarks reproductibles pour valider les gains annoncés. Publier les résultats dans la documentation.
- **Effort** : M (4h pour les benchmarks)

---

## Devil's Advocate

1. **PERF-03 (rules auto-chargées) est-il vraiment critique ?** Sur Opus avec 1M tokens de contexte, 22K tokens représentent seulement 2.2%. C'est marginal. Cependant, beaucoup d'utilisateurs utilisent Sonnet (200K tokens), où 22K = 11%. De plus, les rules sont chargées à CHAQUE session, même quand elles ne sont pas pertinentes (ex: `17-async.md` pour un projet sans message queue).

2. **PERF-09 (DepsView 530 KB) est-il problématique ?** Le chunk est code-splitté et ne se charge que quand l'utilisateur ouvre la vue Dependencies. Le serveur est local (pas de latence réseau). L'impact réel sur l'UX est minimal.

3. **Les métriques de tokens sont-elles fiables ?** L'estimation à 4 chars/token est approximative. Le ratio réel varie selon le contenu (code vs prose vs tableaux). Les vrais chiffres pourraient être 20-30% différents.

4. **Le "mode lean" (PERF-05) est-il nécessaire ?** La tendance est aux contextes de plus en plus grands (1M+). Optimiser pour 200K tokens est du short-term thinking. Cependant, le coût en $ est proportionnel aux tokens consommés, donc l'optimisation a un ROI direct.

---

## Recommandations priorisées

| # | Recommandation | Sévérité | Effort | Impact |
|---|---------------|----------|--------|--------|
| 1 | Convertir 7 rules lourdes en skills (PERF-03) | Critique | L | Très haut (-18K tokens/session) |
| 2 | Offrir mode "lean" pour petit contexte (PERF-05) | Majeur | M | Haut |
| 3 | Lazy-load DepsView dans Kanban (PERF-09) | Majeur | M | Moyen |
| 4 | Condenser INDEX.md à 150 lignes (PERF-02) | Mineur | S | Faible |
| 5 | Lazy-load modules CLI (PERF-08) | Mineur | S | Faible |
| 6 | Limiter auto_suggest à 5 skills (PERF-06) | Mineur | S | Faible |
| 7 | Benchmarks RTK reproductibles (PERF-13) | Info | M | Moyen (crédibilité) |

---

## Plan d'action

### Court terme (< 1 semaine)
- [ ] PERF-06 : Limiter `auto_suggest: true` aux 5 skills les plus essentiels
- [ ] PERF-08 : Lazy-load modules CLI kanban/ralph/doctor
- [ ] PERF-02 : Condenser INDEX.md à 150 lignes

### Moyen terme (1-4 semaines)
- [ ] PERF-03 : Refactorer les 7 rules lourdes en skills à la demande
- [ ] PERF-05 : Créer un mode d'installation "lean" (rules essentielles uniquement)
- [ ] PERF-09 : Évaluer alternatives légères à cytoscape pour DepsView

### Long terme (> 1 mois)
- [ ] PERF-13 : Publier benchmarks RTK reproductibles
- [ ] Implémenter un dashboard de coût de contexte (`/context` enrichi)
- [ ] Profiler l'impact réel des rules sur la qualité des réponses (A/B testing)

---

**Score projeté après PERF-03** : 8.5/10
**Score projeté après toutes corrections** : 9.0/10

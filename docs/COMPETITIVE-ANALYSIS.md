# Analyse Concurrentielle Claude-Craft

> **Document stratégique (mainteneurs).** Cette analyse expose le positionnement marché, les forces, **les faiblesses internes** et la roadmap — elle n'est pas destinée à l'onboarding utilisateur. Pour une comparaison honnête orientée utilisateur (« quel outil choisir ? »), voir [`comparison-claude-craft-vs-superclaude.md`](comparison-claude-craft-vs-superclaude.md).

**Version:** 8.16.1 | **Date:** 2026-06-24 | **Mise à jour précédente :** 2026-06-12

---

## Cartographie des Concurrents

| Concurrent | Type | ★ (relevé 2026-06-24) | Multi-harness | Sprint/PM | QA Auto |
|-----------|------|--------|-----------|-----------|---------|
| **claude-craft** | Framework integré | ~97 | Non (Claude Code) | BMAD v6 | Recette |
| **obra/superpowers v5.0** | Multi-harness framework | ~177k+ | **Oui** (Claude, Cursor, Gemini, Codex, Copilot) | Non | Non |
| **GSD** | Orchestrateurs séquentiels | ~61k+ | Non | Non | Non |
| **gstack** | Rôles nommés (YC-backed) | ~71k+ | Non | Non | Non |
| **Hermes Agent** | Auto-apprentissage skills | ~180k | Partiel (Claude Code + modèles NousResearch) | Non | Non |
| **oh-my-claudecode** | Multi-model routing | ~36k | **Oui** (Claude + Gemini + Codex) | Non | Non |
| **Ruflo** | Mémoire persistante | ~59k | Non | Non | Non |
| **SuperClaude v4** | Meta-framework personas | ~30k | Non | Non | Non |
| **BMAD-METHOD** | Méthodologie | ~43k+ | Partiel (Web Bundles ChatGPT/Gemini) | Oui | Non |
| **GitHub Spec Kit** | Spec-first workflow | ~80k | Non | Partiel | Non |
| **OpenSpec** | Spec-to-agent | ~12k | Non | Non | Non |
| **Claude-Flow** | Orchestration MCP | ~60k | Non | Non | Non |
| **Cursor Directory** | Plateforme règles | n/a | Multi-IDE | Non | Non |
| **Skills Hub** | Marketplace | n/a | Générique | Non | Non |
| **CrewAI** | Multi-agent runtime | n/a | LLM-agnostique | Non | Non |

> Étoiles GitHub : estimations au 2026-06-24. Marché en croissance rapide — réviser mensuellement.

---

## Nouveaux entrants 2026

### GSD — Get Shit Done (~61k ★ au 2026-06-24)

Apparu entre avril et juin 2026 avec une croissance de ~35k à 61k+ étoiles en 2 mois. **Architecture orchestrateurs séquentiels** : chaque phase de workflow dispose de son propre orchestrateur qui s'exécute en dessous de 50% de la fenêtre de contexte. L'état est écrit sur disque en Markdown entre les phases (persistance native sans base de données). 138 contributeurs actifs. Présent dans tous les comparatifs communautaires 2026 (Pulumi, TechTimes, Augment Code). Claude Craft n'est mentionné dans aucun de ces comparatifs.

**Position vs Claude Craft :** GSD résout élégamment le context-window problem sur les longs workflows. Claude Craft offre ce que GSD n'a pas : BMAD v6, 11 stacks tech-specifics, QA Recette, i18n. Les deux sont complémentaires — un utilisateur GSD qui veut la profondeur tech et le lifecycle sprint peut combiner avec Claude Craft.

### gstack (~71k ★ au 2026-06-24)

Créé par Garry Tan (CEO Y Combinator) — signal de crédibilité institutionnelle fort. **23+ rôles nommés** comme slash commands : CEO, CSO, Engineering Manager, Designer, QA, etc. Assure la cohérence décisionnelle via la perspective de rôle. Backing YC facilite l'adoption enterprise.

**Position vs Claude Craft :** gstack est générique (pas de stack-awareness), sans sprint management, sans QA Recette, sans i18n. Claude Craft offre 11 stacks tech-specifics et des reviewers avec scoring quantitatif — complémentaires en équipe : gstack pour la gouvernance décisionnelle, Claude Craft pour l'exécution technique.

### Hermes Agent — NousResearch (~180k ★ en 4 mois)

Croissance la plus rapide de l'écosystème. Vecteur de différenciation inédit : **auto-apprentissage de skills**. Toutes les 15 appels outils réussis, Hermes analyse les patterns et génère automatiquement un skill persistant dans `~/.hermes/skills/`. GUI desktop app + intégration Claude Code native. LLM-agnostique (modèles NousResearch ouverts).

**Position vs Claude Craft :** Hermes se spécialise automatiquement sur votre codebase ; les skills Claude Craft sont distribués statiquement par npm. Claude Craft offre ce que Hermes n'a pas : BMAD v6, QA Recette, i18n, lifecycle sprint, hooks enforcement. À surveiller pour `DIFF-12 (skill self-learning via Ralph)` dans la roadmap.

### obra/superpowers v5.0 (~177k+ ★) — repositionnement stratégique

**Changement majeur depuis l'analyse 2026-02 :** Superpowers est passé de "runtime MCP Claude-only" à **framework multi-harness** supportant nativement Cursor, Gemini CLI, GitHub Copilot CLI, Codex et OpenCode depuis v5.0. Ce repositionnement chevauche directement `DIFF-02` de la roadmap Claude Craft (bundles multi-harness). Superpowers a également ajouté Deep Research autonome depuis v4.2.

**Ce que Superpowers v5.0 n'a pas :** BMAD v6, tech-stack awareness (11 stacks), QA Recette, i18n 5 langues, Kanban local. Ces différenciateurs restent valides malgré le repositionnement multi-harness.

### oh-my-claudecode (~36k ★)

Orchestration **multi-modèle** : route les sous-agents vers Claude, Gemini CLI (gratuit, 1000 req/jour), et Codex selon le type de tâche et le coût. Économies potentielles 40-60% en routant les tâches simples vers Gemini. Voir `DIFF-03` dans la roadmap.

### Ruflo (~59k ★)

Mémoire persistante inter-sessions via indexation vectorielle. Claude Craft gère la mémoire via `/memory` (natif Claude Code v2.1.59+) et les hooks `PostCompact` — pas de vectorDB. Ruflo est positionné comme **moteur complémentaire** documenté dans `docs/ECOSYSTEM.md`. Voir `DIFF-04` dans la roadmap.

### GitHub Spec Kit (~80k ★)

Workflow spec-first : génère des issues GitHub, des ADR et du code à partir d'une spécification OpenAPI. Claude Craft couvre cela via `@api-designer` + tech-spec BMAD, mais sans l'intégration GitHub Issues native.

### OpenSpec (~12k ★)

Génération d'agents à partir d'une spec OpenAPI. Niche : équipes API-first. Complémentaire de `@api-designer`.

---

## Marketplace Anthropic (claude-plugins-official)

> **État au 2026-06-12 :** Claude Craft **absent** du marketplace officiel. obra/superpowers y est depuis janvier 2026.

Le marketplace officiel Anthropic permet une distribution via `/plugin install <name>`. Pour soumettre :
- Vérifier la conformité de `.claude-plugin/plugin.json` au schéma Anthropic.
- Soumettre via [https://clau.de/plugin-directory-submission](https://clau.de/plugin-directory-submission).
- Le fichier `.claude-plugin/marketplace.json` existe déjà dans le repo.

**Priorité P0 (DIFF-01 roadmap) :** la présence sur le marketplace est un vecteur de découverte majeur. Voir `docs/ROADMAP.md`.

---

## FORCES

### F1 : Profondeur technologique par stack (avantage unique)

Chaque stack dispose de : reviewer agent dedie, commandes specifiques (check-compliance, check-architecture, check-security, generate-*), references detaillees (architecture, testing, security, tooling), et skills on-demand. Exemple : le `@react-reviewer` utilise un scoring quantitatif sur 100 points (Architecture 25, TypeScript 25, Tests 25, Security 25). Aucun concurrent n'offre ce niveau de specificite par technologie.

### F2 : Cycle de vie sprint complet (analyse -> QA)

Le seul framework couvrant : `/workflow:analyze` -> `/workflow:plan` -> `/workflow:design` -> `/workflow:implement` -> `/qa:recette`. Avec 5 quality gates (PRD >=80%, Tech Spec >=90%, INVEST 6/6, Sprint Ready 100%, Story DoD 100%). Le `/team:delivery` orchestre ecriture + implementation en 2 phases avec detection de conflits de domaines fichiers. BMAD-METHOD fournit la methodologie mais pas le moteur d'execution.

### F3 : QA Recette (differenciateur exclusif)

Tests d'acceptance automatises via Chrome avec :
- **Golden Rule** : un bug corrige ne doit JAMAIS reapparaitre
- Generation automatique de tests de regression
- Session recovery par checkpoints
- 6 categories de tests (acceptance, edge cases, error scenarios, UI/UX, performance, security)

Aucun concurrent n'offre de test d'acceptance automatise par browser.

### F4 : Optimisation du contexte (TCL)

Reduction de 95% (70K -> 3.5K tokens au demarrage). Architecture en couches : CLAUDE.md (~200 tokens) + INDEX.md (~1300 tokens) + skills a la demande + references par @-mention. Claude-Flow optimise les couts API (routage 3-tier), mais pas l'efficacite du contexte.

### F5 : Internationalisation (5 langues)

1585 fichiers de contenu en fr, en, es, de, pt. Regles, templates, checklists traduits. Aucun concurrent n'offre d'i18n. Avantage decisif pour le marche europeen et latino-americain.

### F6 : Ralph Wiggum (boucle continue)

Execution continue avec circuit breaker adaptatif, monitoring de sante (detection de stall, spirale d'erreurs, bloat de contexte), dashboard temps reel, et 5 types de validateurs DoD. Plus sophistique que les boucles simples des concurrents.

### F7 : Distribution CLI mature

`npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=en` - Installation propre avec subcommandes (list, doctor, update, check, flatten). Tests a 94% de couverture sur le CLI.

### F8 : Hooks = enforcement (pas seulement des suggestions)

> **Note honnête sur le "strict mode" :** Claude Craft distribue des règles dans `CLAUDE.md` — que Claude *peut* ignorer si le contexte le pousse autrement. C'est une réalité de tout framework de prompts. Ce qui distingue Claude Craft des frameworks purement suggéstifs (SuperClaude, BMAD-METHOD) : les **hooks Claude Code** (v2.1.47+) sont du code exécuté *avant/après* chaque outil, indépendamment du contexte LLM. Les hooks de Claude Craft bloquent réellement les commits non signés, les secrets en clair, et les appels réseau non autorisés.

**Ce qui est enforcement (hooks) :** exit code 2 bloque l'exécution (pre-commit, security-block, CSRF-check). **Ce qui est suggestion (CLAUDE.md) :** conventions de code, style, architecture. Voir `.claude/templates/hooks/` pour les templates prêts à l'emploi.

---

## FAIBLESSES

### W1 : Bibliotheque de prompts, pas framework runtime

93% du codebase est du markdown. Les "70 agents" sont des fichiers markdown avec frontmatter YAML. Les "125 commandes" sont des fichiers markdown. Il n'y a pas de moteur d'orchestration runtime, pas de machine a etats, pas de gestion d'erreurs programmatique. Claude-Flow dispose de 170+ outils MCP reels. CrewAI a un runtime Python qui gere l'execution, la memoire, et la communication inter-agents programmatiquement.

### W2 : Bus factor de 1

207 commits, 100% par un seul auteur. Zero contributeurs externes. Zero PR de la communaute. Risque significatif de soutenabilite.

### W3 : Non-conformite aux regles internes

- CLAUDE.md fait 948 lignes (regle : 150-200 max)
- ~508 lignes documentent le changelog d'un produit tiers (Claude Code)
- Les regles exigent 80%+ de couverture tests, mais seul le CLI est teste
- Zero tests pour le comportement des agents ou la correctitude des commandes

### W4 : Agents structurellement identiques

Les 10 reviewer agents partagent le meme template YAML, le meme scoring en 5 categories, le meme format de rapport. Seuls les termes technologiques changent. Tous en `model: haiku`. SuperClaude propose des "cognitive personas" avec des modes comportementaux distincts.

### W5 : Lock-in total sur Claude Code

Zero support Cursor, Windsurf, Copilot, Aider. Si Anthropic change les conventions de Claude Code ou si un autre outil domine, claude-craft est inutilisable. Cursor Directory supporte 4+ IDEs.

### W6 : Barriere d'adoption elevee

125 commandes, 15 namespaces, 70 agents, BMAD v6 avec 3 tracks et 5 gates, Ralph Wiggum, QA Recette... Pas de disclosure progressive. Le README fait 611 lignes.

### W7 : 11 stacks, 1 mainteneur

11 stacks maintenus par 1 personne = couverture potentiellement superficielle. Les references sont des guides de bonnes pratiques generiques que Claude connait deja. La vraie valeur devrait etre dans les conventions specifiques au projet.

### W8 : Fardeau i18n insoutenable

204,951 lignes de contenu i18n. Chaque modification doit etre repliquee en 5 langues. Le script de verification ne verifie que la parite du nombre de fichiers, pas l'equivalence du contenu.

---

## MATRICE SWOT (mise à jour 2026-06-24)

```
FORCES                              | FAIBLESSES
------------------------------------|------------------------------------
- Profondeur multi-tech (11 stacks) | - Prompt library, pas framework
- Cycle sprint complet (BMAD v6)    | - Bus factor = 1
- QA Recette (unique marché)        | - Non-conformite regles internes
- TCL 95% reduction contexte        | - Agents template-identiques
- i18n 5 langues (moat unique)      | - Lock-in Claude Code
- Ralph Wiggum sophistique          | - Barriere adoption elevee
- CLI mature (NPM, --auto, --from)  | - 11 stacks x 1 mainteneur
- Kanban local sans SaaS            | - 0 co-mainteneurs vs 138 (GSD)
------------------------------------|------------------------------------
OPPORTUNITES                        | MENACES
------------------------------------|------------------------------------
- Marketplace Anthropic (P0 DIFF-01)| - GSD/gstack/Hermes : 3 concurrents
- Marche consulting/formation EU    |   60k-180k étoiles apparus en 2 mois
- QA Recette en produit standalone  | - Superpowers v5.0 multi-harness
- Publish skills sur Skills Hub     | - Mouvement "just use CLAUDE.md"
- Partenariat formel BMAD-METHOD    | - AGENTS.md standard OpenAI/Codex
- Integration GSD (couches compl.)  | - Breaking changes Claude Code
- Standard AGENTS.md generateur     | - Anthropic l'integre nativement
```

---

## CE QUE LES CONCURRENTS FONT MIEUX

| Capacite | Concurrent | Pourquoi |
|----------|-----------|----------|
| Nombre d'étoiles / communauté | GSD (61k+), gstack (71k+), Hermes (180k) | Distribution, marketing, backing institutionnel |
| Multi-harness natif | Superpowers v5.0, oh-my-claudecode | Cursor, Gemini CLI, Codex, Copilot supportés |
| Auto-apprentissage de skills | Hermes Agent | Skills générés auto depuis patterns réussis |
| Context-window management | GSD | Orchestrateurs séquentiels < 50% contexte |
| Cohérence décisionnelle par rôle | gstack | 23+ rôles nommés, backing Garry Tan / YC |
| Nombre d'agents runtime | Claude-Flow (60+) | Integration MCP reelle, pas juste markdown |
| Support multi-IDE | Cursor Directory | Cursor, Windsurf, Copilot, VS Code |
| Ecosysteme communautaire | Skills Hub (1336+) | Community-driven, modulaire |
| Profondeur comportementale | SuperClaude | Cognitive personas, pas du template-swapping |
| Optimisation des couts | Claude-Flow, oh-my-claudecode | Routage 3-tier, Gemini gratuit |
| Purete methodologique | BMAD-METHOD | Plus propre, sans overhead framework |
| Backing entreprise | CrewAI, gstack (YC) | Organisations reelles, LLM-agnostique |
| Runtime d'orchestration | CrewAI, Claude-Flow | Vrai code qui gere l'etat d'execution |

---

## ACTIONS URGENTES (post-analyse 2026-06-24)

### A1 : Soumettre au marketplace Anthropic — IMMEDIAT (P0, pas P2)

Le fichier `.claude-plugin/marketplace.json` existe déjà. obra/superpowers est sur le marketplace depuis janvier 2026. Chaque jour d'absence = distribution manquée. Objectif : soumission en 2 semaines, label `Anthropic Verified`.

### A2 : Publier un comparatif "Claude Craft vs GSD vs gstack vs SuperClaude"

Claude Craft est absent de tous les comparatifs 2026 (Pulumi, TechTimes, DEV Community, Augment Code). Un article technique positionné sur l'angle "seul framework avec QA Recette browser-based + BMAD v6 + 11 stacks + 5 langues" suffit à entrer dans la conversation. Délai cible : 1 mois.

### A3 : Mettre à jour COMPETITIVE-ANALYSIS.md mensuellement

GSD a doublé ses étoiles en 2 mois. Le rythme d'innovation rend une analyse trimestrielle insuffisante. Ajouter un script GitHub Actions pour relever les étoiles des concurrents et surveiller les repos `awesome-claude-code` pour les nouveaux entrants > 1000 étoiles/semaine.

### A4 : Envisager un générateur AGENTS.md depuis CLAUDE.md

Le standard AGENTS.md (porté par OpenAI/Codex) est adopté par Cursor, Aider, OpenCode. Générer un `AGENTS.md` à l'installation depuis `CLAUDE.md` réduirait le risque de lock-in perçu et ouvrirait un canal de découverte cross-IDE.

---

## RECOMMANDATIONS STRATEGIQUES

### R1 : Reduire le scope a 3-4 stacks Tier 1

**Arreter :** Maintenir 11 stacks a pareil niveau.
**Commencer :** Designer 3-4 stacks "Tier 1" maintenus par le core (Symfony, React, Python, Flutter). Les 6 autres passent en community-contributed avec templates dans CONTRIBUTING.md.
**Impact :** -60% de maintenance, profondeur accrue pour les stacks core.

### R2 : Extraire QA Recette en produit standalone

Le differenciateur le plus fort. Le packager comme module installable independamment. Creer un README et une demo video dediee. Les utilisateurs de QA Recette deviennent des candidats naturels pour le framework complet.

### R3 : Creer une experience "Resultats en 10 minutes"

**Arreter :** Mener avec "11 stacks, 70 agents, 125 commandes".
**Commencer :** Un `/workflow:quick-start` qui demontre le cycle complet sur un projet sample en <10 min. Communiquer la valeur, pas la complexite.

### R4 : Publier les skills sur le Skills Hub

Packager les skills populaires (solid-principles, testing, security, git-workflow) comme plugins Claude Code independants avec attribution "Part of Claude-Craft". Canal de distribution viral : l'utilisateur installe 1 skill, decouvre le framework complet.

### R5 : Respecter ses propres regles (credibilite)

- Reduire CLAUDE.md a <200 lignes (retirer le changelog Claude Code)
- Ajouter des tests pour les agents et commandes
- Stabiliser le versioning

### R6 : Monetiser via la formation

Les materiaux de formation existent deja. Le marche europeen avec formation en francais est un creneau sous-exploite. Framework open-source = generateur de leads, revenus via consulting + formation.

### R7 : Construire un runtime reel (moyen terme)

Ajouter de l'orchestration programmatique. Un vrai moteur d'etat pour les workflows, avec persistence et error recovery. Comble le gap avec Claude-Flow et CrewAI.

---

## MOATS COMPETITIFS

| Moat | Description | Difficulte a copier |
|------|-------------|-------------------|
| **Methodologie integree** | 5 quality gates + status routing + TDD | Expertise methodologique profonde |
| **i18n a echelle** | 1585 fichiers en 5 langues | Mois de traduction |
| **QA Recette** | Chrome automation + Golden Rule + regression | Integration complexe |
| **TCL architecture** | 95% reduction contexte | Comprehension profonde Claude Code |
| **Curriculum de formation** | Modules, exercices, guide formateur | Mois de design pedagogique |

---

## PRIORITES STRATEGIQUES

1. **Credibilite** : Respecter ses propres regles (CLAUDE.md <200 lignes, tests des agents)
2. **Focus** : Reduire a 3-4 stacks Tier 1, les autres en community-contributed
3. **Distribution** : Publier skills individuels sur Skills Hub + extraire QA Recette
4. **Adoption** : Quick-start en 10 minutes, communiquer la methodologie pas les features
5. **Monetisation** : Formation/consulting sur le marche europeen
6. **Technique** : Construire un runtime reel (moyen terme)

---

---

## FONCTIONNALITES CONCURRENTES ABSENTES DE CLAUDE CRAFT

| Fonctionnalité | Concurrent | Statut roadmap |
|----------------|-----------|----------------|
| Multi-harness (Cursor, Gemini CLI, Codex) | Superpowers v5.0, oh-my-claudecode | DIFF-02 |
| Auto-apprentissage de skills depuis patterns | Hermes Agent | DIFF-12 (v10.0) |
| Multi-provider routing (économies 40-60%) | oh-my-claudecode, Gemini gratuit | DIFF-03 |
| Présence marketplace Anthropic | obra/superpowers | DIFF-01 **P0** |
| Comparatif communautaire / visibilité | GSD, gstack, BMAD | DIFF-05 |
| Visual orchestration dashboard | claude-studio | À évaluer |
| Intégration GitHub Issues native | GitHub Spec Kit | Non planifié |
| Générateur AGENTS.md | (aucun concurrent) | À planifier |

---

*Analyse initiale : 2026-02-19. Mise à jour : 2026-06-24 avec GSD, gstack, Hermes Agent, Superpowers v5.0.*

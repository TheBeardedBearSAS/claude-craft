# Analyse Concurrentielle Claude-Craft

**Version:** 7.19.0 | **Date:** 2026-02-19

---

## Cartographie des Concurrents

| Concurrent | Type | Agents | Multi-tech | Sprint/PM | QA Auto |
|-----------|------|--------|-----------|-----------|---------|
| **claude-craft** | Framework integre | 22 agents | 10 stacks | BMAD v6 | Recette |
| **Claude-Flow** | Orchestration | 60+ agents | Generique | Non | Non |
| **SuperClaude** | Meta-framework | 16 personas | Generique | Non | Non |
| **BMAD-METHOD** | Methodologie | 12+ roles | Generique | Oui | Oui |
| **Cursor Directory** | Plateforme regles | Non | Multi-IDE | Non | Non |
| **Skills Hub** | Marketplace | 1336+ skills | Generique | Non | Non |
| **Claude Code Tresor** | Collection | 8 agents | Generique | Non | Non |
| **CrewAI** | Multi-agent | Oui | LLM-agnostique | Non | Non |

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

---

## FAIBLESSES

### W1 : Bibliotheque de prompts, pas framework runtime

93% du codebase est du markdown. Les "33 agents" sont des fichiers markdown avec frontmatter YAML. Les "160 commandes" sont des fichiers markdown. Il n'y a pas de moteur d'orchestration runtime, pas de machine a etats, pas de gestion d'erreurs programmatique. Claude-Flow dispose de 170+ outils MCP reels. CrewAI a un runtime Python qui gere l'execution, la memoire, et la communication inter-agents programmatiquement.

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

160 commandes, 20 namespaces, 33 agents, BMAD v6 avec 3 tracks et 5 gates, Ralph Wiggum, QA Recette... Pas de disclosure progressive. Le README fait 611 lignes.

### W7 : 10 stacks, 1 mainteneur

10 stacks maintenus par 1 personne = couverture potentiellement superficielle. Les references sont des guides de bonnes pratiques generiques que Claude connait deja. La vraie valeur devrait etre dans les conventions specifiques au projet.

### W8 : Fardeau i18n insoutenable

204,951 lignes de contenu i18n. Chaque modification doit etre repliquee en 5 langues. Le script de verification ne verifie que la parite du nombre de fichiers, pas l'equivalence du contenu.

---

## MATRICE SWOT

```
FORCES                              | FAIBLESSES
------------------------------------|------------------------------------
- Profondeur multi-tech (10 stacks) | - Prompt library, pas framework
- Cycle sprint complet (BMAD v6)    | - Bus factor = 1
- QA Recette (unique)               | - Non-conformite regles internes
- TCL 95% reduction contexte        | - Agents template-identiques
- i18n 5 langues                    | - Lock-in Claude Code
- Ralph Wiggum sophistique          | - Barriere adoption elevee
- CLI mature (NPM)                  | - 10 stacks x 1 mainteneur
------------------------------------|------------------------------------
OPPORTUNITES                        | MENACES
------------------------------------|------------------------------------
- Agent Teams GA (Anthropic)        | - Anthropic l'integre nativement
- Marche consulting/formation EU    | - Claude-Flow network effects
- QA Recette en produit standalone  | - Mouvement "just use CLAUDE.md"
- Publish skills sur Skills Hub     | - Derive des versions tech
- Integration BMAD pour BMAD users  | - Breaking changes Claude Code
- LSP plugins comme autorite        | - Inflation de version (confiance)
```

---

## CE QUE LES CONCURRENTS FONT MIEUX

| Capacite | Concurrent | Pourquoi |
|----------|-----------|----------|
| Nombre d'agents | Claude-Flow (60+) | Integration MCP reelle, pas juste markdown |
| Support multi-IDE | Cursor Directory | Cursor, Windsurf, Copilot, VS Code |
| Ecosysteme communautaire | Skills Hub (1336+) | Community-driven, modulaire |
| Profondeur comportementale | SuperClaude | Cognitive personas, pas du template-swapping |
| Optimisation des couts | Claude-Flow | Routage intelligent 3-tier, 75% economies |
| Purete methodologique | BMAD-METHOD | Plus propre, sans overhead framework |
| Backing entreprise | CrewAI, Microsoft | Organisations reelles, LLM-agnostique |
| Runtime d'orchestration | CrewAI, Claude-Flow | Vrai code qui gere l'etat d'execution |

---

## RECOMMANDATIONS STRATEGIQUES

### R1 : Reduire le scope a 3-4 stacks Tier 1

**Arreter :** Maintenir 10 stacks a pareil niveau.
**Commencer :** Designer 3-4 stacks "Tier 1" maintenus par le core (Symfony, React, Python, Flutter). Les 6 autres passent en community-contributed avec templates dans CONTRIBUTING.md.
**Impact :** -60% de maintenance, profondeur accrue pour les stacks core.

### R2 : Extraire QA Recette en produit standalone

Le differenciateur le plus fort. Le packager comme module installable independamment. Creer un README et une demo video dediee. Les utilisateurs de QA Recette deviennent des candidats naturels pour le framework complet.

### R3 : Creer une experience "Resultats en 10 minutes"

**Arreter :** Mener avec "10 stacks, 33 agents, 160 commandes".
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

*Analyse realisee le 2026-02-19 avec equipe d'agents specialises.*

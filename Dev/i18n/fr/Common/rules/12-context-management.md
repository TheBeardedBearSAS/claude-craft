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
15. [Nouvelles commandes de contexte](#nouvelles-commandes-de-contexte)
16. [Agent frontmatter](#agent-frontmatter)
17. [Managed settings](#managed-settings)
18. [Monitor et evenements en arriere-plan](#monitor-et-evenements-en-arriere-plan)

---

## Regles de taille CLAUDE.md

### Limite recommandee

> **CLAUDE.md principal: 150-200 lignes maximum.**
> Chaque instruction supplementaire dilue l'attention sur les instructions existantes.

### Strategie de modularite

```
.claude/
  CLAUDE.md              <- Resume (150-200 lignes max)
  rules/                 <- Regles detaillees (chargees a la demande)
    01-workflow-analysis.md
    04-solid-principles.md
    05-kiss-dry-yagni.md
    ...
  references/            <- Documentation technique
  skills/                <- Competences a la demande
```

### Bonnes pratiques

| Pratique | Description |
|----------|-------------|
| **CLAUDE.md court** | Vue d'ensemble, liens vers les regles |
| **Rules modulaires** | Un fichier par sujet dans `.claude/rules/` |
| **References separees** | Documentation technique dans `.claude/references/` |
| **Skills a la demande** | Competences chargees uniquement quand necessaires |

### Ce qui va dans CLAUDE.md vs Rules

| Contenu | Emplacement |
|---------|-------------|
| Technologies supportees | CLAUDE.md |
| Commandes disponibles | CLAUDE.md |
| Agents disponibles | CLAUDE.md |
| Compatibilite Claude Code | CLAUDE.md |
| Principes SOLID detailles | `.claude/rules/04-solid-principles.md` |
| Regles de securite | `.claude/rules/11-security.md` |
| Workflow d'analyse | `.claude/rules/01-workflow-analysis.md` |

---

## Nettoyage du contexte

### Quand utiliser `/clear`

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

### Signes de pollution du contexte

- Claude repete des informations deja donnees
- Les reponses deviennent moins precises
- Claude confond des elements de taches differentes
- Les erreurs augmentent malgre des instructions claires

### Pattern: Investigation puis implementation

```
Session 1: Investigation
  -> Lire le code, comprendre l'architecture
  -> Documenter les findings
  -> /clear

Session 2: Implementation
  -> Charger uniquement les fichiers necessaires
  -> Implementer avec un contexte propre
```

---

## Sous-agents pour les investigations

### Principe

> **Deleguer les recherches aux sous-agents pour garder le contexte principal propre.**

Les sous-agents (Task tool) ont leur propre fenetre de contexte. Utiliser un sous-agent pour explorer le codebase evite de polluer le contexte principal avec des centaines de lignes de code non pertinentes.

### Quand utiliser un sous-agent

| Situation | Action |
|-----------|--------|
| Chercher un fichier/pattern specifique | Glob/Grep directement |
| Explorer une architecture inconnue | Sous-agent Explore |
| Investigation multi-fichiers (> 3) | Sous-agent Explore |
| Planifier une implementation | Sous-agent Plan |
| Tache independante en parallele | Sous-agent general-purpose |

### Exemple

```
# Au lieu de lire 20 fichiers dans le contexte principal:

Task(Explore): "Comment fonctionne l'authentification dans ce projet?
  Liste les fichiers, les patterns, les dependances."

# Le sous-agent explore et retourne un resume
# Le contexte principal reste propre
```

### Agent frontmatter (v2.1.78+)

Les agents personnalises supportent des champs frontmatter pour controler leur comportement:

```yaml
---
effort: low          # Niveau d'effort (low/medium/high)
maxTurns: 10         # Nombre maximum de tours
disallowedTools:     # Outils interdits
  - Edit
  - Write
---
```

Ces champs permettent d'optimiser les couts et le scope des sous-agents.

---

## Context compaction

### Fonctionnement

Claude Code compacte automatiquement le contexte quand il approche les limites de la fenetre. Les messages anciens sont resumes pour liberer de l'espace.

### Compaction proactive

A partir de 70% de contexte utilise, lancer `/compact` proactivement pour eviter une compaction automatique non maitrisee.

La commande `/memory` (v2.1.59+) permet de sauvegarder des apprentissages persistants de session qui survivent aux compactions et aux nouvelles sessions.

### Hook PreCompact

Utiliser le hook `PreCompact` pour sauvegarder le contexte critique avant une compaction:

```json
{
  "hooks": {
    "PreCompact": [
      {
        "matcher": "auto",
        "hooks": [{
          "type": "command",
          "command": "cat .claude/context-essentials.md"
        }]
      }
    ]
  }
}
```

### Hook PostCompact

Utiliser le hook `PostCompact` (v2.1.76+) pour re-injecter le contexte critique apres une compaction:

```json
{
  "hooks": {
    "PostCompact": [
      {
        "matcher": "auto",
        "hooks": [{
          "type": "command",
          "command": "cat .claude/context-essentials.md"
        }]
      }
    ]
  }
}
```

A partir de v2.1.105, le hook `PreCompact` peut **bloquer** la compaction via le code de sortie 2, permettant de controler quand la compaction se produit.

### Hooks de re-injection

Utiliser le hook `SessionStart` avec le matcher `compact` pour re-injecter le contexte critique apres une compaction:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [{
          "type": "command",
          "command": "cat .claude/context-essentials.md"
        }]
      }
    ]
  }
}
```

### Preparer le contexte essentiel

Creer un fichier `.claude/context-essentials.md` avec:
- Les decisions architecturales cles
- Les conventions du projet
- Les taches en cours
- Les contraintes critiques

---

## Boucles de verification

### Principe

> **Toujours fournir des moyens de verification: tests, screenshots, outputs attendus.**
> Source: "2-3x improvement in final result quality" (Anthropic)

### Pattern: Specification-Implementation-Verification

```
1. SPECIFICATION
   -> Definir le comportement attendu
   -> Fournir des exemples d'input/output
   -> Ecrire les tests d'abord (TDD)

2. IMPLEMENTATION
   -> Coder la solution

3. VERIFICATION
   -> Executer les tests
   -> Comparer avec les outputs attendus
   -> Corriger si necessaire
   -> Repeter jusqu'a satisfaction
```

### Exemples de boucles efficaces

```
Boucle TDD:
  test (RED) -> code (GREEN) -> refactor -> test (GREEN)

Boucle UI:
  screenshot avant -> modification -> screenshot apres -> comparer

Boucle API:
  spec OpenAPI -> implementation -> test curl -> comparer reponse

Boucle CI:
  modifier code -> lancer tests -> corriger echecs -> relancer
```

### Anti-patterns

```
NE PAS faire:
- Implementer sans tests
- Supposer que ca fonctionne sans verifier
- Ignorer les erreurs de tests
- Passer a la tache suivante sans verification
```

---

## Plan Mode

### Quand investir dans la planification

| Situation | Action |
|-----------|--------|
| Bug simple, 1 fichier | Corriger directement |
| Feature simple, < 3 fichiers | Implementer directement |
| Feature complexe, > 3 fichiers | Plan Mode |
| Refactoring architectural | Plan Mode |
| Choix technologique | Plan Mode |
| Impact incertain | Plan Mode |

### Avantages du Plan Mode

- Explorer le codebase avant d'agir
- Identifier les fichiers impactes
- Proposer une approche avant d'implementer
- Eviter le travail a refaire

---

## Suivi des tokens

### Status Line

La status line Claude Code affiche le pourcentage de contexte utilise. Surveiller cet indicateur pour anticiper les compactions.

### Seuils d'action

| Contexte utilise | Action |
|------------------|--------|
| < 30% | Normal, continuer |
| 30-60% | Surveiller, eviter les lectures inutiles |
| 60-80% | Deleguer aux sous-agents, envisager /clear |
| > 80% | Compaction imminente, sauvegarder le contexte critique |

### Commande /context (v2.1.74+)

La commande `/context` fournit des suggestions actionnables pour optimiser l'utilisation du contexte. Utiliser regulierement pour identifier les sources de gaspillage.

### Commande /effort (v2.1.72+)

Ajuster le niveau d'effort du modele selon la complexite de la tache:

| Commande | Effort | Usage |
|----------|--------|-------|
| `/effort low` | Minimal | Taches simples, lookups |
| `/effort medium` | Standard | Implementation courante |
| `/effort high` | Maximum | Raisonnement complexe, architecture |

### Alerte d'inactivite (v2.1.84+)

Apres 75+ minutes d'inactivite, Claude suggere automatiquement `/clear` pour eviter un contexte perime.

### Strategie multi-session

Pour les taches complexes, diviser le travail en sessions courtes et focalisees. Chaque session utilise un contexte frais, reduisant la consommation de tokens d'environ 55%:

```
Session 1: Investigation (lire, analyser, documenter)
  -> /memory pour sauvegarder les conclusions
  -> /clear

Session 2: Implementation (coder, tester)
  -> Le /memory precedent est automatiquement charge
  -> Contexte frais, pas de pollution
```

### Taches planifiees /loop (v2.1.71+)

La commande `/loop` permet de planifier des taches recurrentes:

```bash
/loop 5m /common:pre-commit-check    # Verifier toutes les 5 minutes
/loop "Surveiller les tests CI"       # Auto-cadence par le modele
```

Alias: `/proactive` (v2.1.105+).

---

## Worktrees paralleles

### Principe

> **"Single biggest productivity unlock"** — Boris Cherny (Anthropic)

Utiliser `git worktree` pour travailler sur plusieurs branches simultanement avec des sessions Claude independantes.

### Setup

Depuis v2.1.53+, Claude Code supporte le flag natif `--worktree` (`-w`) pour creer et travailler dans des worktrees isoles:

```bash
# Flag natif (v2.1.53+) — cree un worktree isole automatiquement
claude --worktree "Implementer l'authentification JWT"
claude -w "Revoir le code d'authentification"

# Methode manuelle (toutes versions)
git worktree add ../feature-auth feature/auth
cd ../feature-auth && claude

git worktree add ../review-auth feature/auth
cd ../review-auth && claude
```

### Pattern Writer/Reviewer

```
Terminal 1 (Writer):
  cd ../feature-auth
  claude "Implementer l'authentification JWT"

Terminal 2 (Reviewer):
  cd ../review-auth
  claude "Revoir le code d'authentification"
  # Contexte frais, pas de biais d'auteur
```

### Nettoyage

```bash
git worktree remove ../feature-auth
git worktree remove ../review-auth
```

### Recommandations

- 3-5 worktrees maximum
- Un worktree = une tache
- Supprimer les worktrees termines
- Ne pas partager de sessions entre worktrees

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

### Principe

> **Indiquer a Claude ce qu'il doit preserver lors d'une compaction.**

Ajouter des instructions de compaction dans CLAUDE.md pour guider le resume lors de la compaction automatique:

```markdown
# Dans CLAUDE.md:
Lors de la compaction, toujours preserver:
- La liste des fichiers modifies
- Les commandes de test
- Les decisions d'architecture
```

### Variables d'environnement utiles

| Variable | Description |
|----------|-------------|
| `CLAUDE_CODE_SUBAGENT_MODEL` | Modele pour les sous-agents (ex: `sonnet` pour optimiser les couts) |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | Mettre a `1` pour desactiver la memoire automatique |

---

## CLAUDE.local.md pour preferences personnelles

### Principe

Creer un fichier `CLAUDE.local.md` a la racine du projet (gitignore) pour les preferences personnelles qui ne doivent pas etre partagees avec l'equipe.

```
projet/
  .claude/CLAUDE.md      <- Partage (git)
  CLAUDE.local.md        <- Personnel (gitignore)
```

### Contenu typique

- Preferences de style personnel
- Chemins locaux specifiques
- Outils personnels preferes

### Configuration

Ajouter dans `.gitignore`:
```
CLAUDE.local.md
```

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

### Preferer les pointeurs aux copies

Ne pas copier du code dans CLAUDE.md — il devient obsolete. Utiliser la syntaxe `@chemin` pour referencer des fichiers:

```markdown
# Dans CLAUDE.md:
Voir @.claude/references/symfony/CLAUDE.md pour les conventions Symfony.
Voir @docs/API.md pour la documentation API.
```

### Emphase pour les regles critiques

Utiliser `IMPORTANT`, `VOUS DEVEZ`, `JAMAIS` pour les contraintes non-negociables:

```markdown
IMPORTANT: Ne jamais modifier les migrations existantes.
VOUS DEVEZ executer les tests avant chaque commit.
JAMAIS de secrets dans le code source.
```

### Hierarchie des fichiers CLAUDE.md

| Fichier | Portee | Usage |
|---------|--------|-------|
| `~/.claude/CLAUDE.md` | Global (tous les projets) | Preferences personnelles universelles |
| `.claude/CLAUDE.md` ou `./CLAUDE.md` | Projet (git) | Conventions d'equipe |
| `CLAUDE.local.md` | Projet (gitignore) | Preferences personnelles projet |

### Maintenance reguliere

- Revoir CLAUDE.md chaque trimestre
- Pour chaque ligne, se demander: "Si je supprime cette ligne, Claude fera-t-il des erreurs?"
- Si non, supprimer la ligne
- Traiter CLAUDE.md comme du code de production

---

## Optimisation de performance

### CLI natifs plutot que MCPs

Preferer les outils CLI natifs (Glob, Grep, Read, Edit) aux equivalents MCP. Les serveurs MCP ajoutent des definitions d'outils persistantes a chaque tour, consommant du contexte en permanence.

| Approche | Cout contexte |
|----------|--------------|
| Outil natif (Glob, Grep) | 0 tokens supplementaires |
| Serveur MCP | ~500-2000 tokens/outil/tour |
| CLI externe (gh, aws) | Ponctuel, via Bash |

### MCP Tool Search (v2.1.80+)

Le `ToolSearch` permet le chargement paresseux (lazy loading) des outils MCP, reduisant la consommation de contexte de **95%**:

| Approche | Cout contexte |
|----------|--------------|
| MCP classique (tous les outils charges) | ~500-2000 tokens/outil/tour |
| MCP avec Tool Search (lazy loading) | ~50 tokens au total |

Utiliser `ToolSearch` avec `query: "select:tool_name"` pour charger un outil a la demande.

### Flag --bare (v2.1.81+)

Pour les appels scriptes avec `-p`, utiliser `--bare` pour ignorer les hooks, LSP et la synchronisation des plugins:

```bash
claude --bare -p "Analyser ce fichier" < input.txt
```

Reduction significative du temps de demarrage pour l'automatisation.

### Monitor tool (v2.1.98+)

L'outil `Monitor` permet de streamer les evenements d'un processus en arriere-plan. Chaque ligne stdout est une notification. Utiliser au lieu de `sleep` + poll pour attendre la fin d'un processus.

### Changement de modele en session

Utiliser `/model` pour changer de modele selon la complexite de la tache:

| Commande | Modele | Usage |
|----------|--------|-------|
| `/model haiku` | Haiku 4.5 | Taches simples, classification |
| `/model sonnet` | Sonnet 4.6 | Taches standard, implementation |
| `/model opus` | Opus 4.6 | Raisonnement complexe, architecture |

### Filtrage de sortie via hooks PostToolUse

Utiliser des hooks PostToolUse pour filtrer les sorties verbeuses avant que Claude ne les traite:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Bash",
      "command": "echo '$TOOL_OUTPUT' | grep -A 5 -E '(FAIL|ERROR|WARN)' || echo 'All clear'"
    }]
  }
}
```

Reduction potentielle: 90%+ pour les logs verbeux.

### Plugins Code Intelligence

Pour les langages types, un seul appel `go-to-definition` remplace plusieurs grep + lectures de fichiers:

- PHP: `php-lsp` (Intelephense)
- TypeScript: `typescript-lsp` (vtsls)
- Python: `pyright-lsp`
- Dart: `dart-analyzer`
- C#: `csharp-lsp`

---

## Patterns de communication

### Pattern Interview

Pour les features complexes, demander a Claude de vous interviewer avant de coder:

```
"Je veux implementer [description]. Interviewe-moi en detail.
Pose des questions sur l'implementation technique, les edge cases,
les contraintes et les compromis. Continue jusqu'a avoir une vision
complete, puis ecris la specification dans SPEC.md."
```

Resultat: specification complete avant implementation, contexte propre.

### Structure CIF (Context, Intent, Format)

Structurer les prompts pour maximiser la precision:

| Element | Description | Exemple |
|---------|-------------|---------|
| **Context** | Situation actuelle | "Dans le module auth, le token JWT expire apres 15min" |
| **Intent** | Objectif precis | "Ajouter le refresh token avec rotation" |
| **Format** | Format de sortie attendu | "Generer le service + les tests unitaires" |

### Pattern Writer/Reviewer

Utiliser deux sessions pour une meilleure qualite (voir aussi [Worktrees paralleles](#worktrees-paralleles)):

- **Session A (Writer):** Implemente la feature
- **Session B (Reviewer):** Relit avec un contexte frais (pas de biais d'auteur)
- **Session A:** Integre les retours

---

## Managed settings (v2.1.83+)

### Repertoire managed-settings.d/

Le repertoire `managed-settings.d/` permet une configuration modulaire par fusion alphabetique:

```
.claude/
  managed-settings.d/
    00-base.json          <- Configuration de base
    10-security.json      <- Regles de securite
    20-team.json          <- Preferences d'equipe
```

Les fichiers sont fusionnes par ordre alphabetique, permettant aux equipes de superposer des configurations sans conflits.

---

## Ressources

- **Anthropic Best Practices:** [docs.anthropic.com](https://docs.anthropic.com/en/docs/claude-code/overview)
- **Boris Cherny Workflow:** Parallel worktrees + verification loops
- **Claude Code Context Management:** Context compaction, `/clear`, sub-agents
- **`/init`:** Genere automatiquement un CLAUDE.md a partir de l'analyse du projet
- **CLAUDE.md Authoring:** [Builder.io Guide](https://www.builder.io/blog/claude-md-guide), [HumanLayer Blog](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- **Cost Optimization:** [Anthropic Costs Docs](https://code.claude.com/docs/en/costs)

---

**Date de derniere mise a jour:** 2026-04
**Version:** 1.2.0
**Auteur:** The Bearded CTO

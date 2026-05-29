# Cahier Participant — Formation Claude Code

\vspace{2cm}

**Nom :** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Entreprise :** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Date :** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\vspace{1cm}

> **Formation :** Claude Code 2.1.154 — Maitriser l'Agent de Developpement
>
> **Duree :** 2 jours (14h)
>
> **Formateur :** The Bearded Bear

\newpage

---

## Prerequis et verification avant la formation

Avant de commencer, verifiez que vous disposez de tout le necessaire :

### Technique

- [ ] Ordinateur portable avec acces Internet
- [ ] Terminal accessible (bash, zsh, PowerShell)
- [ ] Node.js 18+ installe (`node --version`)
- [ ] Git installe (`git --version`)
- [ ] IDE installe (VS Code recommande)
- [ ] Droits d'installation de logiciels (npm global)
- [ ] Au moins 8 Go de RAM

### Comptes

- [ ] Compte Anthropic actif avec credits suffisants
- [ ] Cle API Anthropic configuree (`ANTHROPIC_API_KEY`)
- [ ] Acces aux depots de code de l'equipe (si exercices sur projet reel)

### Installation Claude Code

```bash
# Methode recommandee
brew install claude-code          # macOS
curl -fsSL https://cli.anthropic.com/install.sh | sh  # Linux
winget install Anthropic.ClaudeCode  # Windows

# Verification
claude --version   # Doit afficher 2.1.154+
```

- [ ] Claude Code installe et fonctionnel
- [ ] `/doctor` execute sans erreur

\newpage

---

# JOUR 1 : Fondamentaux Claude Code

---

## Module 1 : Introduction a Claude Code (1h30)

### Objectifs d'apprentissage

- [ ] Comprendre ce qu'est Claude Code et son positionnement agentique
- [ ] Differencier Claude Code des autres outils IA (Copilot, ChatGPT, Cursor)
- [ ] Installer et configurer Claude Code
- [ ] Utiliser les commandes essentielles
- [ ] Comprendre l'Extended Thinking et les modeles disponibles
- [ ] Monitorer les couts et la consommation de tokens

### Notes personnelles

\vspace{4cm}

### Exercice pratique : Premier pas avec Claude Code

**Objectif :** Installer Claude Code, lancer une premiere session et tester les commandes de base.

**Instructions :**

1. Installer Claude Code (si pas deja fait)

```bash
claude --version
```

2. Lancer Claude Code et tester les commandes de base

```bash
claude
/help
/status
/cost
```

3. Premier prompt

```bash
> Presente-toi et explique ce que tu peux faire
> Quels fichiers existent dans le repertoire courant ?
```

4. Tester Extended Thinking

```bash
> think about the pros and cons of microservices vs monolith
```

5. Changer de modele

```bash
/model opus
/status
/model sonnet
/fast
```

**Mon resultat :**

\vspace{3cm}

### Points cles a retenir

- Claude Code est un **agent autonome**, pas un simple chatbot
- **7 interfaces** disponibles : CLI, VS Code, JetBrains, Desktop, Web, Slack, Chrome
- **4 modeles** : Sonnet 4.6 (quotidien), Opus 4.8 (complexe, flagship), Opus 4.6 (Fast Mode), Haiku 4.5 (economique)
- Adaptive Thinking est **automatique** avec Opus 4.8
- Surveiller ses couts avec `/cost` et `/status`

\newpage

---

## Module 2 : CLAUDE.md et Configuration (1h30)

### Objectifs d'apprentissage

- [ ] Comprendre le systeme de memoire a 3 niveaux de CLAUDE.md
- [ ] Configurer les permissions avec le systeme 3-tier
- [ ] Utiliser .claudeignore et les @ references
- [ ] Rediger un CLAUDE.md optimal pour un projet reel

### Notes personnelles

\vspace{4cm}

### Exercice pratique : Configurer un CLAUDE.md optimal

**Objectif :** Creer une configuration complete pour un projet.

**Instructions :**

1. Creer la structure

```bash
mkdir exercice-claude-config && cd exercice-claude-config
git init
mkdir -p .claude/rules
touch CLAUDE.md .claude/CLAUDE.md .claude/settings.json .claudeignore
```

2. Rediger le CLAUDE.md projet avec votre stack technique

3. Configurer les permissions dans `.claude/settings.json`

```json
{
  "permissions": {
    "allow": ["Bash(npm*)", "Write(src/**)"],
    "deny": ["Bash(rm -rf*)", "Write(.env*)"]
  }
}
```

4. Creer un .claudeignore

5. Tester avec Claude Code

```bash
claude
> Quel est le stack technique de ce projet ?
```

**Mon resultat :**

\vspace{3cm}

### Points cles a retenir

- **3 niveaux CLAUDE.md** : global, projet, detaille (tous concatenes)
- **CLAUDE.local.md** pour les instructions privees non commitees
- **Permissions 3-tier** : Ask (defaut), Allow, Deny
- **.claudeignore** : exclure les fichiers inutiles du contexte
- **@ references** : `@fichier`, `@dossier/`, `@https://url`
- Garder CLAUDE.md **concis** (< 200 lignes)

\newpage

---

## Module 3 : Patterns de Travail (2h)

### Objectifs d'apprentissage

- [ ] Formuler des prompts efficaces pour un agent IA
- [ ] Utiliser le Plan Mode pour explorer avant d'agir
- [ ] Gerer la context window de maniere optimale
- [ ] Deleguer des taches aux sub-agents
- [ ] Utiliser le mode headless pour l'automatisation
- [ ] Gerer les sessions et le checkpointing

### Notes personnelles

\vspace{4cm}

### Exercice pratique : Maitriser les patterns

**Objectif :** Pratiquer le prompt engineering, le Plan Mode et le mode headless.

**Instructions :**

**Partie 1 : Prompt engineering (10 min)**

```bash
# Prompt vague (observez la reponse)
> Explique ce projet

# Prompt precis (comparez)
> Explique l'architecture de ce projet en identifiant :
> - Les couches (presentation, business, data)
> - Les patterns utilises
> - Les dependances externes
```

**Partie 2 : Plan Mode (10 min)**

```bash
# Activez le Plan Mode
Shift+Tab

# Demandez une modification complexe
> Ajoute un systeme de cache avec invalidation
```

**Partie 3 : Mode headless (10 min)**

```bash
claude -p "Combien de fichiers TypeScript ?" --output-format text
claude -p "Genere un .gitignore Node.js" > .gitignore
git diff HEAD~1 | claude -p "Resume les changements"
```

**Mon resultat :**

\vspace{3cm}

### Points cles a retenir

- **Prompts = objectifs** : decrivez le quoi et le pourquoi
- **Plan Mode** : planifier avant d'agir pour les taches complexes
- **Context window** : ressource critique, surveiller le %
- **Sub-agents** : deleguer les explorations (Explore, Plan, General)
- **Headless** : `claude -p` pour automatisation et scripts
- **Sessions** : `--continue` pour reprendre, `--resume` pour specifique

\newpage

---

## Module 4 : Pratique Guidee (2h)

### Objectifs d'apprentissage

- [ ] Explorer et comprendre une codebase inconnue
- [ ] Conduire un refactoring guide
- [ ] Debugger efficacement avec Claude Code
- [ ] Scaffolder un projet complet depuis zero
- [ ] Generer du code en suivant le cycle TDD

### Notes personnelles

\vspace{4cm}

### Exercice pratique : Projet existant et projet vierge

**Objectif :** Appliquer Claude Code sur un projet existant (onboarding, refactoring) et creer un projet depuis zero.

**Partie 1 : Projet existant (30 min)**

1. Onboarding sur une codebase :

```bash
> Analyse ce projet et donne-moi un resume en 10 lignes :
> - Objectif principal ?
> - Stack technique ?
> - Etat general ?
```

2. Identification des problemes :

```bash
> Identifie les 5 points les plus problematiques :
> - Code complexe
> - Failles de securite
> - Tests manquants
```

**Partie 2 : Projet vierge (30 min)**

1. Scaffolding :

```bash
> Cree une API REST pour une gestion de taches.
> Architecture Clean Architecture.
> Propose d'abord l'architecture AVANT de generer le code.
```

2. TDD :

```bash
> Genere les tests unitaires pour le CRUD Task (RED).
> Puis implemente le code minimal (GREEN).
> Puis refactorise (REFACTOR).
```

**Mon resultat :**

\vspace{3cm}

### Points cles a retenir

- **Exploration** : du general au specifique
- **Refactoring** : toujours planifier, toujours verifier
- **Debugging** : fournir un maximum de contexte (stack trace, logs)
- **TDD** : RED (tests) → GREEN (code minimal) → REFACTOR
- **Documentation** : Claude genere README, API docs, commentaires

\newpage

---

# JOUR 2 : Pratiques Avancees et Autonomie

---

## Module 5 : Hooks et Automatisation (1h30)

### Objectifs d'apprentissage

- [ ] Configurer les 23 evenements hooks disponibles
- [ ] Utiliser les matchers pour cibler des outils specifiques
- [ ] Creer des hooks de securite et de qualite
- [ ] Maitriser les hooks prompt-based avec Haiku 4.5
- [ ] Creer des slash commands personnalisees

### Notes personnelles

\vspace{4cm}

### Exercice pratique : Hooks et commandes custom

**Objectif :** Creer un hook de securite et une commande custom.

**Partie 1 : Hook de securite (10 min)**

Creer un hook `PreToolUse:Bash` dans `.claude/settings.json` qui bloque :
- `rm -rf /` et variantes
- `chmod 777`
- `curl ... | bash`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "..."
      }
    ]
  }
}
```

**Partie 2 : Commande custom (10 min)**

Creer `.claude/commands/audit.md` :

```markdown
Realise un audit complet du projet :
1. Structure et architecture
2. Fichiers sans tests
3. TODO/FIXME dans le code
4. Rapport avec score global

$ARGUMENTS
```

**Verification :**

- [ ] Le hook bloque `rm -rf /` avec exit code 2
- [ ] La commande `/project:audit` est accessible
- [ ] La commande produit un rapport structure

**Mon resultat :**

\vspace{3cm}

### Points cles a retenir

- **23 evenements hooks** couvrent tout le cycle de vie
- **Exit code 2** = bloquant (enforcement)
- **stdout → Claude**, **stderr → utilisateur**
- **Hooks > CLAUDE.md** pour les contraintes critiques
- **Slash commands** dans `.claude/commands/` partagees via Git

\newpage

---

## Module 6 : MCP et Integrations (1h15)

### Objectifs d'apprentissage

- [ ] Comprendre le protocole MCP et son architecture
- [ ] Configurer des serveurs MCP dans Claude Code
- [ ] Integrer Claude Code dans les IDEs (VS Code, JetBrains)
- [ ] Automatiser Claude Code en CI/CD
- [ ] Evaluer et securiser les serveurs MCP tiers

### Notes personnelles

\vspace{4cm}

### Exercice pratique : Configuration MCP

**Objectif :** Configurer un serveur MCP et tester l'integration.

**Instructions :**

1. Ajouter un serveur MCP SQLite :

```bash
claude mcp add sqlite -- npx -y @anthropic/mcp-server-sqlite test.db
```

2. Tester l'interaction :

```bash
> Cree une table "users" avec les champs id, name, email
> Insere 3 utilisateurs de test
> Liste tous les utilisateurs
```

3. Verifier la securite :

- [ ] Code source du serveur MCP audite
- [ ] Pas d'acces reseau non justifie
- [ ] Version pinee

**Mon resultat :**

\vspace{3cm}

### Points cles a retenir

- **MCP** = protocole ouvert pour connecter des outils externes
- Configuration dans `settings.json` ou `claude mcp add`
- **VS Code** : extension officielle avec inline edit et diff view
- **CI/CD** : `claude -p` en headless mode
- **Securite MCP** : toujours auditer avant d'installer un serveur tiers

\newpage

---

## Module 7 : Multi-Agent et Coordination (1h15)

### Objectifs d'apprentissage

- [ ] Comprendre et utiliser Agent Teams
- [ ] Exploiter les sub-agents paralleles avec le Task tool
- [ ] Mettre en place des sessions paralleles avec git worktrees
- [ ] Appliquer les patterns Writer/Reviewer et Fan-out

### Notes personnelles

\vspace{4cm}

### Exercice pratique : Multi-agent et worktrees

**Objectif :** Experimenter le travail parallele avec Claude Code.

**Instructions :**

1. Creer un worktree :

```bash
git worktree add ../feature-test feature/test
cd ../feature-test && claude
```

2. Pattern Writer/Reviewer :

```bash
# Terminal 1 : Implementer une feature
# Terminal 2 : Revoir le code (contexte frais)
```

3. Observer les sub-agents :

```bash
> Utilise un sub-agent pour explorer le systeme
> d'authentification de ce projet
```

**Mon resultat :**

\vspace{3cm}

### Points cles a retenir

- **Agent Teams** : leader coordonne, teammates executent en parallele
- **Git worktrees** : sessions paralleles sur branches separees
- **Fan-out** : sub-agents en background pour operations batch
- **Writer/Reviewer** : relecture croisee sans biais d'auteur
- 3-5 worktrees maximum simultanement

\newpage

---

## Module 8 : Qualite et Securite (1h)

### Objectifs d'apprentissage

- [ ] Appliquer le cycle TDD avec Claude Code
- [ ] Realiser des audits de code automatises
- [ ] Identifier les vulnerabilites OWASP Top 10
- [ ] Utiliser les conventional commits
- [ ] Gerer les couts et optimiser la consommation

### Notes personnelles

\vspace{4cm}

### Exercice pratique : Qualite et securite

**Objectif :** Pratiquer le TDD et l'audit de securite avec Claude Code.

**Instructions :**

1. Cycle TDD complet :

```bash
# RED
> Ecris les tests pour un service de validation d'email
# GREEN
> Implemente le code minimal pour faire passer les tests
# REFACTOR
> Refactorise en appliquant SOLID
```

2. Audit securite :

```bash
> Cherche les vulnerabilites OWASP Top 10 dans ce projet :
> - Injections SQL
> - Secrets en dur
> - XSS, CSRF
```

3. Conventional commits :

```bash
> Cree un commit pour les changements actuels
> en respectant le format Conventional Commits
```

**Mon resultat :**

\vspace{3cm}

### Points cles a retenir

- **TDD** : RED → GREEN → REFACTOR, toujours avec Claude
- **Couverture** : objectif >= 80%
- **OWASP Top 10** : Claude detecte les vulnerabilites courantes
- **Conventional Commits** : `feat:`, `fix:`, `refactor:`, `test:`
- **Couts** : surveiller avec `/cost`, optimiser avec le bon modele

\newpage

---

## Module 9 : Bonus — Claude Craft (30min)

### Objectifs d'apprentissage

- [ ] Comprendre ce qu'est Claude-Craft et ce qu'il ajoute
- [ ] Voir les possibilites d'extension de Claude Code

### Notes personnelles

\vspace{4cm}

### Points cles a retenir

- Claude-Craft = framework d'extension pour Claude Code
- 70 agents (31 spécialisés + 39 infra), 125 commandes, 15 namespaces
- BMAD v6 pour la gestion de projet
- Installation : `npx @the-bearded-bear/claude-craft install . --tech=react --lang=fr`

\newpage

---

## Module 10 : Atelier Final (1h30)

### Objectifs d'apprentissage

- [ ] Appliquer toutes les competences en situation reelle
- [ ] Realiser un audit complet sur un projet existant
- [ ] Creer un micro-projet de A a Z avec Claude Code
- [ ] Definir un plan d'action pour l'equipe

### Notes personnelles

\vspace{4cm}

### Challenge mixte

**Exercice 1 — Projet existant (20 min) :**

```
1. Audit du codebase (architecture, anti-patterns, securite)
2. Plan de refactoring (priorise, avec estimation effort/risque)
3. Documentation generee (README, schema architecture)
```

**Mon resultat :**

\vspace{2cm}

**Exercice 2 — Projet vierge (25 min) :**

```
1. Scaffolding API REST (Clean Architecture)
2. Implementation feature complete avec TDD
3. Configuration hooks et permissions
4. Documentation generee
```

**Mon resultat :**

\vspace{2cm}

### Points cles a retenir

\vspace{3cm}

\newpage

---

## Plan d'action personnel

A l'issue de cette formation, je m'engage a mettre en oeuvre les actions suivantes :

### Action 1

**Quoi :** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Quand :** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Indicateur de succes :** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### Action 2

**Quoi :** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Quand :** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Indicateur de succes :** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### Action 3

**Quoi :** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Quand :** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Indicateur de succes :** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## Roadmap d'adoption suggeree

| Semaine | Objectif |
|---------|----------|
| **Semaine 1** | Installation, configuration CLAUDE.md, premiers prompts |
| **Semaine 2** | Utilisation guidee sur taches simples (bug fixes, generation) |
| **Semaine 3** | Autonomie progressive (Plan Mode, sub-agents, hooks) |
| **Semaine 4** | Revue et optimisation (couts, workflows, partage equipe) |

\newpage

---

## Ressources et liens utiles

### Documentation officielle

| Ressource | URL |
|-----------|-----|
| Documentation Claude Code | `docs.anthropic.com/en/docs/claude-code/overview` |
| GitHub Claude Code | `github.com/anthropics/claude-code` |
| Prompt Engineering Guide | `docs.anthropic.com/en/docs/build-with-claude/prompt-engineering` |
| MCP Specification | `modelcontextprotocol.io` |

### Liens utiles

| Ressource | Description |
|-----------|-------------|
| Claude.ai | Interface web et gestion de compte |
| Claude.ai/code | Interface web Claude Code |
| VS Code Marketplace | Extension "Claude Code" |
| JetBrains Marketplace | Plugin "Claude Code" |
| Claude-Craft | `npmjs.com/package/@the-bearded-bear/claude-craft` |

### Support post-formation

| Canal | Usage |
|-------|-------|
| Email formateur | Questions techniques |
| Slack | Support continu (si option choisie) |

\newpage

---

## Glossaire

| Terme | Definition |
|-------|-----------|
| **Agent** | Programme IA autonome capable d'explorer, planifier et executer |
| **Agent Teams** | Systeme de coordination multi-agents dans Claude Code |
| **CLAUDE.md** | Fichier d'instructions persistantes lu a chaque session |
| **CLI** | Command Line Interface — interface en ligne de commande |
| **Compaction** | Resume automatique du contexte quand il approche la limite |
| **Context window** | Quantite totale de tokens que Claude peut "voir" (200K-1M) |
| **Conventional Commits** | Convention de format de messages de commit |
| **Extended Thinking** | Capacite de reflexion approfondie de Claude |
| **Fan-out** | Pattern de distribution de taches a plusieurs agents en parallele |
| **Fast Mode** | Mode Opus 4.6 accelere (2.5x plus rapide, 6x le cout) |
| **Headless** | Mode non-interactif (`claude -p`) pour scripts et CI/CD |
| **Hook** | Commande shell executee automatiquement lors d'un evenement |
| **MCP** | Model Context Protocol — protocole pour connecter des outils externes |
| **Plan Mode** | Mode ou Claude planifie avant d'agir (pas de modification) |
| **Prompt** | Instruction donnee a Claude Code |
| **Rewind** | Retour en arriere au checkpoint precedent (`Esc+Esc`) |
| **Sandbox** | Isolation OS pour limiter les actions de Claude |
| **Session** | Conversation continue avec Claude Code |
| **Slash command** | Commande prefixee par `/` (ex: `/help`, `/clear`) |
| **Sub-agent** | Session Claude independante lancee par la session principale |
| **TDD** | Test-Driven Development — ecrire les tests avant le code |
| **Token** | Unite de texte (~3/4 d'un mot anglais) |
| **Worktree** | Copie de travail Git separee pour travail parallele |

---

**Formation Claude Code** | The Bearded Bear | Fevrier 2026

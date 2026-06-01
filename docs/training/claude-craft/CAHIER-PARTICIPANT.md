# Cahier du Participant - Formation Claude Code 2.1.154 + Claude-Craft 8.7.1

## Informations

**Nom :** _______________________

**Date de formation :** _______________________

**Formateur :** _______________________

---

## Objectifs de la formation

À la fin de cette formation, vous serez capable de :

- [ ] Installer et configurer Claude Code 2.1.154
- [ ] Utiliser les nouvelles fonctionnalités (Plan Mode, Hooks, Background Tasks)
- [ ] Installer Claude-Craft 8.7.1 via npx (structure TCL)
- [ ] Suivre les workflows de développement (Quick, Standard, Enterprise)
- [ ] Charger et utiliser les skills et agents
- [ ] Auditer un projet existant et corriger les issues
- [ ] Appliquer les bonnes pratiques (TDD, SOLID, OWASP)
- [ ] Connaître BMAD v6, Ralph Wiggum et le QA Recette
- [ ] Comprendre Extended Thinking et MCP

---

## Jour 1 : Fondamentaux & Nouveaux Projets

### Module 1 : Introduction à Claude Code 2.1.154

#### Notes personnelles

_________________________________
_________________________________
_________________________________
_________________________________

#### Commandes de base

| Commande | Description |
|----------|-------------|
| `/help` | |
| `/model` | |
| `/cost` | |
| `/exit` | |

#### Nouvelles commandes (2.1.154)

| Commande | Description |
|----------|-------------|
| `/plan` | |
| `/tasks` | |
| `/hooks` | |
| `/keybindings` | |
| `/skills` | |
| `/compact` | Compacter le contexte |
| `/doctor` | Diagnostiquer les problèmes |
| `/mcp` | Gérer les serveurs MCP |
| `/config` | Configuration |

#### Exercice 1 : [OK] Completed / [KO] Needs review

**Difficultés rencontrées :**
_________________________________

---

### Module 2 : Le Framework Claude-Craft 8.7.1

#### TCL (Tiered Context Loading)

| Niveau | Fichiers | Tokens | Chargement |
|--------|----------|--------|------------|
| ALWAYS | | | |
| ON-DEMAND | | | |
| REFERENCE | | | |

**Économie de tokens :** _____%

#### Structure TCL

```
.claude/
├── ____________  # Config minimale (~700 bytes)
├── ____________  # Liens rapides
├── ____________  # Triggers automatiques
├── ____________  # Documentation complète
├── ____________  # Best practices on-demand
├── ____________  # Agents IA
└── ____________  # Commandes slash
```

#### Installation npx

```bash
# Commande interactive
npx ________________________

# Commande directe
npx ________________________ --tech=________ --lang=________
```

#### Exercice 2 : [OK] Completed / [KO] Needs review

**Difficultés rencontrées :**
_________________________________

---

### Module 3 : Workflow de Développement

#### Les 3 tracks

| Track | Durée | Quand l'utiliser |
|-------|-------|------------------|
| _______ | < 30 min | |
| _______ | 1-3 jours | |
| _______ | > 1 semaine | |

#### Commandes workflow

| Commande | Ce qu'elle fait |
|----------|-----------------|
| `/workflow:init` | |
| `/workflow:analyze` | |
| `/workflow:plan` | |
| `/workflow:implement` | |

#### Plan Mode + Workflow

1. Activer : `/plan`
2. Analyser : `/workflow:analyze`
3. Planifier : `/workflow:plan`
4. Désactiver : `/plan off`
5. Exécuter : `/workflow:implement`

#### Classification Plan Mode (v7.26.0)

| Niveau | Quand | Exemples |
|--------|-------|----------|
| **MANDATORY** | | `generate-*`, `/workflow:implement` |
| **RECOMMENDED** | | `/workflow:plan`, `/workflow:design` |
| **CONDITIONAL** | | `check-*`, `/workflow:analyze` |

#### Exercice 3 : [OK] Completed / [KO] Needs review

**Difficultés rencontrées :**
_________________________________

---

### Module 4 : Nouveau Projet Symfony

#### Architecture Clean

```
src/
├── Domain/        → ________________________
├── Application/   → ________________________
├── Infrastructure/→ ________________________
└── UserInterface/ → ________________________
```

#### Commandes de génération

| Commande | Ce qu'elle génère |
|----------|-------------------|
| `/symfony:generate-feature` | |
| `/symfony:generate-entity` | |
| `/symfony:generate-crud` | |

#### Exercice 4 : [OK] Completed / [KO] Needs review

**Ce que j'ai créé :**
_________________________________

**Difficultés rencontrées :**
_________________________________

---

## Jour 2 : Projets Existants & Pratique Avancée

### Module 5 : Intégrer sur un Projet Existant

#### Commandes d'audit

| Commande | Ce qu'elle vérifie |
|----------|-------------------|
| `/symfony:check-compliance` | |
| `/symfony:check-architecture` | |
| `/symfony:check-code-quality` | |
| `/symfony:check-security` | |
| `/symfony:check-testing` | |

#### Audit avec Plan Mode

```bash
/plan
/symfony:check-compliance
# Analyser les résultats sans modifier
/plan off
# Corriger les issues
```

#### Exercice 5 : [OK] Completed / [KO] Needs review

**Scores de mon audit :**
- Architecture : ___/100
- Qualité : ___/100
- Sécurité : ___/100
- Tests : ___%

**Plan de remédiation (3 actions prioritaires) :**
1. _________________________________
2. _________________________________
3. _________________________________

---

### Module 6 : Qualité et Sécurité

#### Skills pour la qualité

| Skill | Commande | Contenu |
|-------|----------|---------|
| TDD/BDD | `/testing` | |
| OWASP | `/security` | |
| Git | `/git-workflow` | |

#### Cycle TDD

```
_______ → _______ → _______
```

#### Conventional Commits

| Type | Usage |
|------|-------|
| `feat` | |
| `fix` | |
| `refactor` | |
| `test` | |

#### Exercice 6 : [OK] Completed / [KO] Needs review

**Vulnérabilités corrigées :**
1. _________________________________
2. _________________________________
3. _________________________________

---

### Module 7 : Agents Spécialisés, BMAD et Docker

#### Skills vs Agents

| Aspect | Skills | Agents |
|--------|--------|--------|
| Invocation | | |
| Chargement | | |
| Usage | | |

#### Charger un skill

```bash
/____________                # Charger le skill testing
/____________                # Charger le skill security
```

#### Utiliser un agent

```bash
"Agis comme @____________ et revois ce code"
"Agis comme @____________ et écris les tests"
```

#### context.yaml

```yaml
triggers:
  testing:
    keywords: [_______, _______, _______]
    auto_load: true
```

#### Exercice 7 : [OK] Completed / [KO] Needs review

**Issues identifiées par les agents :**
1. _________________________________
2. _________________________________
3. _________________________________

---

### Module 8 : Outils Avancés

#### Hooks (13 événements)

| Event | Déclencheur |
|-------|-------------|
| PreToolUse | Avant l'exécution d'un outil |
| PostToolUse | Après le succès d'un outil |
| PostToolUseFailure | Après l'échec d'un outil |
| PermissionRequest | Lors d'une demande de permission |
| UserPromptSubmit | Quand l'utilisateur soumet un prompt |
| Stop | Fin de réponse Claude |
| SubagentStop | À l'arrêt d'un sous-agent |
| SubagentStart | Au lancement d'un sous-agent |
| Notification | Lors d'une notification |
| PreCompact | Avant la compaction du contexte |
| SessionStart | Au démarrage/reprise d'une session |
| SessionEnd | À la fin d'une session |
| Setup | Lors de l'initialisation |

#### Configuration hook

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "_______",
      "command": "_______________________"
    }]
  }
}
```

#### Background Tasks

```bash
/tasks run "_______________________"   # Lancer
/tasks list                            # Lister
/tasks status ________                 # Statut
/tasks stop ________                   # Arrêter
```

#### Keybindings

Mon fichier : `~/.claude/keybindings.json`

Raccourci personnalisé : _________________________________

#### Ralph Wiggum

Boucle continue IA qui exécute Claude jusqu'à complétion de la tâche.

```bash
/common:ralph-run "________________________"
```

**Types de validateurs DoD :**

| Type | Description |
|------|-------------|
| `command` | |
| `output_contains` | |
| `file_changed` | |
| `hook` | |
| `human` | |

#### QA Recette

Tests d'acceptation automatisés via Claude in Chrome.

```bash
/qa:recette --scope=story --id=US-001
/qa:recette --scope=sprint --id=Sprint-3
/qa:recette --scope=story --id=US-001 --dry-run
```

**Golden Rule :** Un bug corrigé ne doit JAMAIS réapparaître.

#### Extended Thinking

Mode de réflexion approfondie pour les tâches complexes.

```bash
# Activer le thinking étendu
claude --thinking

# Avec budget de tokens
claude --thinking-budget 10000
```

**Quand l'utiliser :**
- Architecture complexe
- Debug difficile
- Décisions de conception

#### MCP (Model Context Protocol)

Protocole pour connecter des serveurs de contexte externes.

```bash
/mcp                          # Lister les serveurs
/mcp add <nom> <commande>     # Ajouter un serveur
/mcp remove <nom>             # Supprimer un serveur
```

**Serveurs MCP utiles :**

| Serveur | Usage |
|---------|-------|
| filesystem | Accès fichiers |
| github | Intégration GitHub |
| postgres | Accès base de données |

---

### Module 9 : Atelier Pratique

#### Challenge d'équipe

**Mon binôme :** _________________________________

**Notre feature :** _________________________________

**Ce qu'on a réussi :**
- [ ] Plan Mode pour analyse
- [ ] Skills chargés appropriés
- [ ] Architecture Clean
- [ ] Tests TDD
- [ ] Hooks configurés
- [ ] BMAD initialisé
- [ ] Quality gate validé
- [ ] QA Recette dry-run

**Ce qu'on n'a pas eu le temps de faire :**
_________________________________

---

## Auto-évaluation finale

### Niveau de confiance (1 = Pas confiant, 5 = Très confiant)

| Compétence | 1 | 2 | 3 | 4 | 5 |
|------------|---|---|---|---|---|
| Installation Claude Code 2.1.154 | | | | | |
| Utilisation Plan Mode | | | | | |
| Installation Claude-Craft 8.7.1 (npx) | | | | | |
| Compréhension TCL | | | | | |
| Utilisation des workflows | | | | | |
| Chargement et utilisation des skills | | | | | |
| Configuration des hooks | | | | | |
| Génération de features | | | | | |
| Audit de projets | | | | | |
| Utilisation des agents | | | | | |
| TDD avec Claude | | | | | |
| BMAD v6 | | | | | |
| Ralph Wiggum | | | | | |
| QA Recette | | | | | |
| Extended Thinking | | | | | |
| MCP | | | | | |

### Mes points forts

1. _________________________________
2. _________________________________
3. _________________________________

### Mes axes d'amélioration

1. _________________________________
2. _________________________________
3. _________________________________

---

## Plan d'action personnel

### Semaine 1 (après la formation)

- [ ] Installer Claude-Craft 8.7.1 sur mon projet
- [ ] Configurer les hooks de base
- [ ] _________________________________

### Mois 1

- [ ] Maîtriser le Plan Mode
- [ ] Créer un skill custom pour mon projet
- [ ] _________________________________

### Questions à poser au formateur (suivi)

1. _________________________________
2. _________________________________
3. _________________________________

---

## Ressources à garder

### Liens utiles

- Documentation Claude Code : https://docs.anthropic.com/claude-code
- Claude-Craft GitHub : https://github.com/thebeardedcto/claude-craft
- Claude-Craft NPM : https://npmjs.com/@the-bearded-bear/claude-craft
- Mon compte Anthropic : _________________________________

### Commandes essentielles

```bash
# Installation Claude-Craft
npx @the-bearded-bear/claude-craft install

# Plan Mode
/plan
/plan off

# Skills
/testing
/security
/skills

# Hooks
/hooks

# Background Tasks
/tasks list
/tasks run "..."

# Nouvelles commandes
/compact
/doctor
/mcp

# BMAD v6
/workflow:init
/workflow:status

# QA Recette
/qa:recette --scope=story --id=US-001
/qa:recette --dry-run

# Extended Thinking
claude --thinking
claude --thinking-budget 10000
```

### Contacts

- Formateur : _________________________________
- Support : _________________________________
- Collègue référent : _________________________________

---

## Notes libres

_________________________________
_________________________________
_________________________________
_________________________________
_________________________________
_________________________________
_________________________________
_________________________________
_________________________________
_________________________________
_________________________________
_________________________________
_________________________________
_________________________________
_________________________________
_________________________________
_________________________________
_________________________________
_________________________________
_________________________________

---

## Feedback formation

### Ce que j'ai le plus apprécié

_________________________________
_________________________________

### Ce qui pourrait être amélioré

_________________________________
_________________________________

### Ma note globale (1-10) : ___

---

**Merci pour votre participation !**

**Formation Claude Code 2.1.154 + Claude-Craft 8.7.1**
**Version 3.0.0 - 2026**
**The Bearded CTO**

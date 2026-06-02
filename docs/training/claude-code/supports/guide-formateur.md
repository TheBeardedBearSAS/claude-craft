# Guide Formateur — Formation Claude Code

> Guide de facilitation pour le formateur — 2 jours (14h)

---

## Checklist pre-formation

### Logistique

- [ ] Salle / visio configuree
- [ ] Supports imprimes (cahiers participants, cheatsheets) — 1 par stagiaire
- [ ] Acces Wi-Fi stable et suffisant pour le groupe
- [ ] Ecran de projection / partage d'ecran fonctionnel

### Technique

- [ ] Claude Code installe et fonctionnel sur le poste formateur
- [ ] Cle API Anthropic active avec credits suffisants (prevoir ~$20/jour)
- [ ] Projet de demonstration prepare (ou projet reel du client)
- [ ] Tous les exercices testes sur l'environnement cible
- [ ] VS Code + extension Claude Code installes pour demo
- [ ] Terminal configurer avec police lisible pour projection

### Participants

- [ ] Liste des participants avec niveau (junior/confirme/senior)
- [ ] Prerequis envoyes et valides (Node.js, Git, IDE, cle API)
- [ ] Cahier participant + cheatsheets distribues
- [ ] Email de bienvenue envoye avec instructions de preparation

---

## Planning detaille

### Jour 1 — Fondamentaux Claude Code (7h)

| Horaire | Module | Duree |
|---------|--------|-------|
| 09h00-10h30 | Module 1 : Introduction a Claude Code | 1h30 |
| 10h30-10h45 | *Pause* | 15min |
| 10h45-12h15 | Module 2 : CLAUDE.md et Configuration | 1h30 |
| 12h15-13h30 | *Dejeuner* | 1h15 |
| 13h30-15h30 | Module 3 : Patterns de Travail | 2h |
| 15h30-15h45 | *Pause* | 15min |
| 15h45-17h45 | Module 4 : Pratique Guidee | 2h |

### Jour 2 — Pratiques Avancees et Autonomie (7h)

| Horaire | Module | Duree |
|---------|--------|-------|
| 09h00-10h30 | Module 5 : Hooks et Automatisation | 1h30 |
| 10h30-10h45 | *Pause* | 15min |
| 10h45-12h00 | Module 6 : MCP et Integrations | 1h15 |
| 12h00-13h15 | *Dejeuner* | 1h15 |
| 13h15-14h30 | Module 7 : Multi-Agent et Coordination | 1h15 |
| 14h30-14h45 | *Pause* | 15min |
| 14h45-15h45 | Module 8 : Qualite et Securite | 1h |
| 15h45-16h15 | Module 9 : Bonus — Claude Craft | 30min |
| 16h15-17h45 | Module 10 : Atelier Final | 1h30 |

---

## Guides par module

---

### Module 1 : Introduction a Claude Code (1h30) — 09h00-10h30

**Objectif formateur :** Demystifier l'outil, creer l'engagement, s'assurer que tout le monde a un environnement fonctionnel.

**Timing :**

| Duree | Activite | Type |
|-------|----------|------|
| 20min | L'outil agentique — positionnement et comparaison | Theorie |
| 20min | Installation et configuration | Demo + pratique |
| 20min | Interface et commandes de base | Demo interactive |
| 20min | Modeles, Extended Thinking et couts | Theorie + demo |
| 10min | Exercice pratique : premier pas | Pratique |

**Points cles a souligner :**

- Claude Code est un **agent autonome** qui explore, planifie, execute et verifie
- Insister sur la difference avec Copilot (autocompletion) et ChatGPT (conversationnel)
- Montrer la **status line** des le debut pour sensibiliser au cout
- Le **4% des commits GitHub** via Claude Code cree un effet "wow"

**Demo live suggeree :**

```bash
# 1. Lancer Claude Code dans un projet
cd projet-demo && claude

# 2. Montrer les commandes de base
/help
/status
/cost

# 3. Premier prompt
> Explique-moi l'architecture de ce projet

# 4. Montrer Extended Thinking
> think hard about the best way to refactor the auth module

# 5. Changer de modele
/model opus
/fast
```

**Exercice : Premier pas avec Claude Code**

*Solution attendue :*
- Le participant a installe Claude Code (`claude --version` → 2.1.159+)
- Il a lance une session et teste `/help`, `/status`, `/cost`
- Il a execute un premier prompt et obtenu une reponse
- Il a teste Extended Thinking et observe la difference de profondeur
- Il a change de modele et note la difference

**Questions frequentes :**

| Question | Reponse |
|----------|---------|
| "Ca remplace le developpeur ?" | Non, c'est un amplificateur. Claude Code fait ce que vous lui demandez, pas ce qu'il veut. Le jugement, l'architecture, les decisions restent humains. |
| "Difference avec ChatGPT ?" | ChatGPT est conversationnel sans acces au systeme de fichiers. Claude Code est un agent qui lit, ecrit, execute du code et navigue dans votre codebase. |
| "C'est securise ?" | Le code ne quitte pas votre machine. Seuls les prompts et contextes sont envoyes a l'API Anthropic. Les permissions permettent de controler ce que Claude peut faire. |
| "Combien ca coute ?" | Sonnet 4.6 : ~$3/M tokens input. Une session typique coute $0.50-$5. Monitorer avec `/cost`. |

**Pieges courants :**

- Participants sans cle API configuree → prevoir 5min pour aider
- Internet lent → degradation des temps de reponse
- Terminal non familier → montrer les bases (cd, ls) si necessaire
- Confusion entre `/exit` et fermer le terminal

---

### Module 2 : CLAUDE.md et Configuration (1h30) — 10h45-12h15

**Objectif formateur :** Faire comprendre que la configuration est le levier principal de productivite.

**Timing :**

| Duree | Activite | Type |
|-------|----------|------|
| 25min | Memoire 3 niveaux : CLAUDE.md | Theorie + demo |
| 10min | CLAUDE.local.md | Theorie |
| 15min | settings.json 3 niveaux | Theorie + demo |
| 15min | Permissions 3-tier | Demo interactive |
| 5min | .claudeignore | Theorie |
| 10min | @ references | Demo |
| 10min | Exercice pratique | Pratique |

**Points cles a souligner :**

- CLAUDE.md est **le levier #1** de productivite avec Claude Code
- Chaque ligne supplementaire **dilue l'attention** → rester concis
- Les permissions **protegent** contre les erreurs accidentelles
- .claudeignore **economise des tokens** (donc des couts)

**Demo live suggeree :**

```bash
# Montrer la hierarchie CLAUDE.md
cat ~/.claude/CLAUDE.md
cat CLAUDE.md
cat .claude/CLAUDE.md

# Montrer l'impact des permissions
# Essayer une commande bloquee par deny
> Supprime le fichier .env  # → Bloque par deny
```

**Exercice : Configurer un CLAUDE.md optimal**

*Solution attendue :*
- Structure `.claude/` creee avec rules/ et settings.json
- CLAUDE.md avec stack technique, conventions, commandes
- settings.json avec permissions allow/deny coherentes
- .claudeignore avec les exclusions classiques
- Claude Code repond correctement aux questions sur le stack

**Questions frequentes :**

| Question | Reponse |
|----------|---------|
| "Combien de lignes max dans CLAUDE.md ?" | 200 lignes max pour `.claude/CLAUDE.md`. Utilisez `.claude/rules/` pour les details. |
| "Qui ecrit le CLAUDE.md ?" | L'equipe, commite dans Git. CLAUDE.local.md est personnel et non commite. |
| "Les permissions bloquent vraiment ?" | Oui, les deny sont enforces. Mais les regles CLAUDE.md sont des suggestions. |

**Pieges courants :**

- CLAUDE.md trop long → insister sur la concision
- Oublier d'ajouter CLAUDE.local.md au .gitignore
- Permissions trop restrictives → Claude ne peut rien faire

---

### Module 3 : Patterns de Travail (2h) — 13h30-15h30

**Objectif formateur :** Ancrer les bonnes pratiques de prompt et la gestion du contexte.

**Timing :**

| Duree | Activite | Type |
|-------|----------|------|
| 20min | Prompt engineering pour agents | Theorie + exemples |
| 15min | Plan Mode | Demo interactive |
| 20min | Gestion du contexte | Theorie + demo |
| 15min | Sub-agents | Demo |
| 15min | Modes de travail (Fast, Headless) | Demo |
| 10min | Sessions et checkpointing | Demo |
| 5min | Support images et sandboxing | Theorie |
| 5min | Keybindings et status line | Demo |
| 15min | Exercice pratique | Pratique |

**Points cles a souligner :**

- **Prompts = objectifs**, pas instructions pas-a-pas
- Le **Plan Mode** est le reflexe #1 pour les taches complexes
- La **context window** est LA ressource critique — la surveiller
- Les **sub-agents** gardent le contexte principal propre

**Demo live suggeree :**

Montrer la difference entre un prompt vague et un prompt precis, cote a cote.

**Exercice : Maitriser les patterns**

*Solution attendue :*
- Le participant observe la difference de qualite entre prompt vague et precis
- Il utilise Plan Mode pour planifier une modification
- Il execute une commande en mode headless et recupere le resultat

**Questions frequentes :**

| Question | Reponse |
|----------|---------|
| "Quand utiliser Plan Mode ?" | Des que la tache touche > 3 fichiers ou que l'impact est incertain. |
| "Comment savoir si le contexte est plein ?" | Status line en bas : surveiller le %. Au-dela de 60%, agir. |
| "Les sub-agents coutent plus cher ?" | Ils ont leur propre contexte, donc ils consomment des tokens. Mais ils gardent le contexte principal propre, ce qui est souvent plus economique globalement. |

---

### Module 4 : Pratique Guidee (2h) — 15h45-17h45

**Objectif formateur :** Faire pratiquer sur des cas concrets. C'est LE module cle du Jour 1.

**Timing :**

| Duree | Activite | Type |
|-------|----------|------|
| 30min | Onboarding codebase existante | Pratique guidee |
| 30min | Refactoring guide | Pratique guidee |
| 20min | Debugging assiste | Demo + pratique |
| 20min | Scaffolding projet vierge | Pratique guidee |
| 20min | Generation code + TDD | Pratique guidee |

**Points cles a souligner :**

- L'exploration va du **general au specifique**
- Le refactoring utilise **Plan Mode** systematiquement
- Le debugging est plus efficace avec un **maximum de contexte**
- Le scaffolding valide l'architecture **AVANT** de generer le code

**Conseil pedagogique :**

Si les participants ont un projet reel, privilegier celui-ci. Sinon, utiliser un projet open source prepare.

**Exercice : Projet existant + projet vierge**

*Solution attendue :*
- Audit de codebase avec identification des points critiques
- Refactoring planifie et execute avec tests preserves
- Scaffolding d'un projet avec architecture validee
- Feature implementee en suivant le cycle TDD

---

### Module 5 : Hooks et Automatisation (1h30) — 09h00-10h30 (Jour 2)

**Objectif formateur :** Montrer la puissance de l'automatisation et la difference CLAUDE.md vs hooks.

**Timing :**

| Duree | Activite | Type |
|-------|----------|------|
| 10min | Qu'est-ce qu'un hook ? CLAUDE.md vs hooks | Theorie |
| 20min | Les 23 evenements hooks | Theorie + demo |
| 15min | Configuration et matchers | Demo |
| 10min | Hooks prompt-based | Demo |
| 15min | Slash commands custom | Demo |
| 10min | Combinaison hooks + commands | Demo |
| 10min | Exercice pratique | Pratique |

**Points cles a souligner :**

- **CLAUDE.md = suggestions. Hooks = requirements.** C'est LA phrase cle du module.
- **Exit code 2** est le mecanisme de blocage le plus puissant
- **stdout → Claude**, **stderr → utilisateur** : separation fondamentale
- Les hooks de securite (`PreToolUse:Bash`) sont non negociables

**Demo live suggeree :**

Creer un hook en live qui bloque `rm -rf /`, puis tenter l'execution pour montrer le blocage.

**Exercice : Hook de securite + commande custom**

*Solution attendue :*
- Hook PreToolUse:Bash fonctionnel qui bloque les commandes dangereuses
- Commande `/project:audit` creee et accessible
- Le participant comprend la difference entre suggestion (CLAUDE.md) et enforcement (hooks)

**Questions frequentes :**

| Question | Reponse |
|----------|---------|
| "Les hooks ralentissent Claude ?" | Non, le timeout est de 10 min. Un hook bien ecrit s'execute en < 1s. |
| "Peut-on desactiver un hook temporairement ?" | Oui, supprimez-le de settings.json ou commentez-le. |
| "Les hooks prompt-based coutent cher ?" | Non, ils utilisent Haiku 4.5 (~$0.001 par appel). |

---

### Module 6 : MCP et Integrations (1h15) — 10h45-12h00

**Objectif formateur :** Montrer l'ecosysteme d'integration et ouvrir les possibilites.

**Timing :**

| Duree | Activite | Type |
|-------|----------|------|
| 25min | MCP : concept et architecture | Theorie + demo |
| 10min | Plugins et serveurs MCP | Demo |
| 15min | IDE integrations (VS Code, JetBrains) | Demo |
| 15min | CI/CD et --from-pr | Theorie + demo |
| 5min | Securite MCP | Theorie |
| 5min | Exercice | Pratique |

**Demo live suggeree :**

- Ajouter un serveur MCP SQLite et interagir avec une base de donnees
- Montrer l'extension VS Code en live

**Pieges courants :**

- Serveur MCP qui ne demarre pas → verifier Node.js et npm
- Timeout MCP → augmenter `MCP_TIMEOUT`
- Serveur tiers malveillant → toujours auditer avant d'installer

---

### Module 7 : Multi-Agent et Coordination (1h15) — 13h15-14h30

**Objectif formateur :** Montrer les patterns de travail parallele pour les taches complexes.

**Timing :**

| Duree | Activite | Type |
|-------|----------|------|
| 25min | Agent Teams : concept et outils | Theorie + demo |
| 15min | Git worktrees | Demo + pratique |
| 15min | Fan-out patterns | Theorie + demo |
| 10min | Interview et Writer/Reviewer patterns | Theorie |
| 10min | Exercice | Pratique |

**Points cles a souligner :**

- Agent Teams est encore en **research preview** (experimental)
- Les **worktrees** sont le pattern le plus immediatement utilisable
- Le pattern **Writer/Reviewer** elimine le biais d'auteur

**Conseil pedagogique :**

Ce module est avance. Si le groupe est junior, se concentrer sur les worktrees et sub-agents, et survoler Agent Teams.

---

### Module 8 : Qualite et Securite (1h) — 14h45-15h45

**Objectif formateur :** Ancrer les reflexes qualite et securite dans le workflow Claude Code.

**Timing :**

| Duree | Activite | Type |
|-------|----------|------|
| 20min | TDD/BDD avec Claude Code | Demo + pratique |
| 15min | Audit code (architecture, anti-patterns) | Demo |
| 10min | Securite (OWASP Top 10) | Theorie |
| 10min | Git workflow et conventional commits | Demo |
| 5min | Cost management | Theorie |

**Points cles a souligner :**

- Le cycle **RED → GREEN → REFACTOR** est naturel avec Claude Code
- Claude detecte les vulnerabilites OWASP mais ne remplace pas un audit de securite professionnel
- Les **conventional commits** sont generes automatiquement par Claude

---

### Module 9 : Bonus — Claude Craft (30min) — 15h45-16h15

**Objectif formateur :** Montrer les possibilites d'extension, pas former a Claude-Craft.

**Timing :**

| Duree | Activite | Type |
|-------|----------|------|
| 10min | Presentation condensee | Theorie |
| 10min | Points forts (BMAD, Ralph, QA Recette) | Demo rapide |
| 10min | Illustration des possibilites d'extension | Demo |

**Conseil pedagogique :**

C'est un **teaser**, pas une formation complete. Rester a haut niveau. Mentionner la formation dediee Claude-Craft (2 jours supplementaires) pour ceux qui veulent approfondir.

---

### Module 10 : Atelier Final (1h30) — 16h15-17h45

**Objectif formateur :** Synthese, mise en pratique, plan d'action et cloture.

**Timing :**

| Duree | Activite | Type |
|-------|----------|------|
| 20min | Exercice 1 : Projet existant | Pratique autonome |
| 25min | Exercice 2 : Projet vierge | Pratique autonome |
| 15min | Restitution et partage | Presentation |
| 15min | Q&A ouverte | Discussion |
| 15min | Plan d'action equipe | Reflexion + engagement |

**Exercice 1 — Projet existant : Solution attendue**

1. Audit complet avec scores par categorie (architecture, qualite, securite, tests)
2. Plan de refactoring priorise avec estimation effort/risque
3. Documentation generee (README, schema architecture, liste endpoints)
4. Utilisation des outils avances (Plan Mode, sub-agents, hooks)

*Grille d'evaluation :*

| Critere | /5 |
|---------|-----|
| Completude de l'audit | |
| Pertinence du plan de refactoring | |
| Qualite de la documentation generee | |
| Utilisation des outils avances | |
| **Total** | **/20** |

**Exercice 2 — Projet vierge : Solution attendue**

1. Scaffolding complet avec Clean Architecture
2. CRUD Task avec validation et gestion d'erreurs
3. Tests unitaires ecrits AVANT le code (TDD)
4. Hooks de securite configures
5. Documentation generee

*Grille d'evaluation :*

| Critere | /5 |
|---------|-----|
| Qualite du scaffolding | |
| Couverture de tests | |
| Respect du cycle TDD | |
| Configuration hooks/permissions | |
| **Total** | **/20** |

**Plan d'action equipe :**

Guider les participants pour definir :
- 3 actions concretes avec echeance
- Un CLAUDE.md d'equipe a commiter
- Les hooks de securite a configurer
- La roadmap d'adoption sur 4 semaines

---

## Checklist post-formation

- [ ] Feedback participants collecte (formulaire de satisfaction)
- [ ] Certificats de participation envoyes
- [ ] Ressources partagees (cheatsheets, liens, enregistrements)
- [ ] Suivi J+15 planifie (si option A choisie)
- [ ] Retour d'experience interne redige
- [ ] Ameliorations a apporter notees

---

## Conseils pedagogiques

### Rythme

- **60% pratique / 40% theorie** — toujours privilegier la pratique
- Adapter le rythme au groupe (junior vs senior)
- Prevoir des buffers de 5-10min par module pour les questions
- Si le groupe est en avance, approfondir les exercices

### Engagement

- Encourager les questions a tout moment
- Utiliser les projets reels des participants quand possible
- Faire des demos live plutot que des slides
- Alterner les formats : demo, exercice individuel, exercice en binome

### Difficultes courantes

| Probleme | Solution |
|----------|----------|
| Participant sans cle API | Prevoir une cle API de secours |
| Internet instable | Avoir des exemples de reponses en cache |
| Niveau heterogene | Exercices avec niveaux de difficulte |
| Participant sceptique | Montrer des cas concrets d'amelioration de productivite |
| Surcout percu | Montrer le `/cost` et comparer avec le temps economise |

### Phrases cles

- "Claude Code est un **agent**, pas un chatbot"
- "CLAUDE.md = suggestions, **Hooks = requirements**"
- "Le contexte est **LA ressource critique**"
- "Toujours **planifier avant d'agir** pour les taches complexes"
- "**RED → GREEN → REFACTOR** : le reflexe TDD avec Claude"

---

## Adaptation selon le public

### Groupe junior (< 3 ans d'experience)

- Insister sur les fondamentaux (Modules 1-4)
- Simplifier les Modules 5-7 (focus hooks basiques et sub-agents)
- Plus de temps sur les exercices pratiques
- Moins de temps sur Agent Teams (experimental)

### Groupe senior (> 7 ans d'experience)

- Accelerer les Modules 1-2
- Approfondir les Modules 5-8
- Focus sur Agent Teams, CI/CD, MCP avance
- Utiliser les projets reels du groupe
- Discussion architecture et patterns avances

### Groupe mixte

- Exercices avec niveaux de difficulte (base / avance)
- Binomes senior-junior pour les ateliers
- Le senior aide le junior, le junior pose des questions pertinentes

---

**Formation Claude Code** | The Bearded Bear | Fevrier 2026

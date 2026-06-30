# Tutoriel : Workflow complet — De l'idée à la production

> **À qui s'adresse ce guide ?** À quelqu'un qui n'a **jamais** utilisé Claude Code ou Claude Craft. On part de zéro, on construit une vraie fonctionnalité de bout en bout, et chaque terme est expliqué à sa première apparition.
>
> **Ce qu'on construit :** *TaskFlow* — un petit SaaS de suivi des tâches d'équipe avec une API REST (Python / FastAPI) et un client web React. Suffisamment simple pour être suivi en une séance, suffisamment réel pour exercer l'ensemble du workflow.
>
> **Claude Craft v8.19.0** · Durée estimée de lecture + pratique : 60–90 minutes.

---

## 0. Avant de commencer

### Ce que vous allez faire

Vous allez emmener TaskFlow d'une idée en une phrase jusqu'à un premier sprint relu et testé — en utilisant le workflow BMAD de Claude Craft. Le chemin suit toujours la même direction, et **chaque flèche est protégée par une gate qualité** (une vérification bloquante) :

```
 IDÉE
   │  /workflow:init        ← choisir le track
   ▼
 BACKLOG ──/gate:validate-backlog──┐  (PRD ≥ 80%, INVEST 6/6)
   │  /workflow:plan                │
   ▼                                │
 CONCEPTION TECHNIQUE ──/gate:validate-techspec──┐  (Tech Spec ≥ 90%)
   │  /workflow:design                   │
   ▼                                      │
 PLAN DE SPRINT ──/gate:validate-sprint──┐  (Sprint Ready 100%)
   │  /workflow:start                  │
   │  /project:decompose-tasks         │
   ▼                                    │
 IMPLÉMENTATION (TDD) ──/gate:validate-story──┐  (Story DoD 100%)
   │  /sprint:dev                              │
   ▼                                            │
 REVUE + RÉTRO ──/workflow:review, /workflow:retro
   │
   ▼
 SPRINT SUIVANT ↺
```

> **Règle d'or de la méthode :** on ne passe pas à l'étape suivante tant que sa gate n'est pas au vert. C'est ce qui empêche de construire sur des fondations fragiles.

---

## 1. Les bases en 5 minutes

Lisez ceci une fois. Vous y reviendrez.

- **Claude Code** — le CLI où vous parlez à Claude dans votre terminal (ou IDE). Vous tapez des messages et des *slash-commands* ; Claude lit/écrit des fichiers, exécute des commandes et répond.
- **Slash-command** — une instruction packagée qui commence par `/`. Exemple : `/workflow:init`. Claude Craft en embarque 125 réparties sur 15 namespaces.
- **Agent** — un persona Claude spécialisé que vous invoquez avec `@`. Exemple : `@tdd-coach`, `@symfony-reviewer`. Chacun possède une expertise ciblée.
- **Claude Craft** — le framework que vous avez installé : règles, commandes, agents, skills, et la couche de gestion de projet **BMAD**.
- **BMAD** — la méthode légère de type SCRUM de Claude Craft (Backlog → sprint → revue). Son état est écrit dans des **fichiers**, pas dans la conversation — c'est pourquoi vider le chat plus tard est sans risque.

### Mini-glossaire

| Terme | Signification simple |
|-------|---------------------|
| **Épic** | Un grand bloc de valeur, découpé en stories. |
| **User Story (US)** | Un incrément petit et visible par l'utilisateur (« En tant qu'utilisateur, je peux… »). |
| **Backlog** | La liste ordonnée des épics et des stories. |
| **Sprint** | Un lot court de stories auxquelles on s'engage à terminer. |
| **Tâche** | Une story découpée en étapes de ≤ 30 min qu'un dev (ou un agent) exécute. |
| **Gate** | Une vérification qualité bloquante entre les phases. |
| **DoD** | Definition of Done — la checklist qu'une story doit valider. |
| **INVEST** | Les 6 qualités d'une bonne story (Indépendante, Négociable, Valable, Estimable, Small, Testable). |
| **TDD** | Test-Driven Development : écrire un test en échec → le faire passer → refactorer. |

---

## 1.5 Comprendre les modes d'exécution (à lire — tout le monde se trompe là-dessus)

Il existe **deux choses différentes appelées « mode »**. Ne les confondez pas.

**(a) Les trois modes d'interaction** (basculer avec `Shift+Tab` dans Claude Code) :

| Mode | Indicateur | Ce qu'il fait |
|------|-----------|--------------|
| **Plan** | 📋 | Claude propose un plan et ne modifie **rien** tant que vous n'avez pas approuvé. |
| **Normal** | ⚡ | Claude agit, mais demande la permission avant les actions risquées. **Par défaut pour ce tutoriel.** |
| **Auto-accept** | 🤖 | Claude exécute sans demander. Puissant, mais seulement une fois le flux bien en main. |

**(b) Le « plan mode » que certaines commandes activent d'elles-mêmes.** Plusieurs commandes Claude Craft (`/workflow:design`, `/workflow:plan`…) entrent délibérément dans une étape de planification et attendent votre feu vert avant d'écrire des fichiers — indépendamment du mode Shift+Tab actif.

> **Règle simple pour les débutants :** restez en **Normal (⚡)**, laissez les commandes déclencher leur propre étape de planification, et approuvez les plans. Utilisez l'auto-accept et les flags `--auto` uniquement une fois le flux familier.

Tout au long de ce tutoriel, chaque commande indique le mode qu'elle attend :
- **Mode : Normal (⚡)** — interactif
- **Mode : Plan requis** — Claude planifiera d'abord
- **Mode : Lecture seule** — sûr dans n'importe quel mode

---

## 2. Vérifier votre installation

**Mode : Lecture seule.** Ouvrez Claude Code dans le dossier de votre projet et confirmez que Claude Craft est présent.

```bash
# Dans votre terminal, à l'intérieur du projet
claude
```

Puis, dans Claude Code :

```
/workflow:status
```

Si vous voyez un rapport de statut du workflow (même « no workflow yet »), Claude Craft est installé. Si la commande est inconnue, (ré)installez :

```bash
npx @the-bearded-bear/claude-craft install . --tech=python --lang=en
```

> **À propos de la couche de gestion de projet.** Les commandes `/gate:*`, `/sprint:*` et `/project:*` utilisées ci-dessous proviennent de l'option **Project Management commands**, incluse par défaut lors de l'installation (l'installateur demande *"Include Project Management commands? (Y/n)"* → Oui). Si ces commandes sont absentes, relancez l'installateur et acceptez cette option.

### 2.x Économiser les tokens : contexte et `/clear`

La **fenêtre de contexte** est la mémoire de travail de Claude — et votre ressource la plus précieuse. Deux habitudes la gardent en bonne santé :

- **`/clear`** entre les étapes sans rapport. Parce que BMAD écrit son état dans des fichiers, **rien n'est perdu** : après `/clear`, exécutez `/workflow:status` et Claude relit où vous en êtes.
- **RTK + hooks** pour l'optimisation des tokens. Exécutez `/common:setup-rtk` une fois pour configurer le proxy Rust Token Killer et les hooks d'optimisation (60–90 % d'économies sur la sortie des commandes dev).

Vous verrez des marqueurs **« Bon moment pour `/clear` »** entre les étapes lettrées ci-dessous.

---

## Étape A — Construire le backlog

### A.1 Initialiser le workflow

**Mode : Plan requis.**

```
/workflow:init
```

Claude analyse votre projet et recommande un **track** :

| Track | Mise en place | Phases | Idéal pour |
|-------|---------------|--------|------------|
| **Quick Flow** | < 5 min | Implémentation uniquement | Corrections de bugs, hotfixes |
| **Standard** | < 15 min | Plan → Design → Implémentation | Nouvelles fonctionnalités (← TaskFlow utilise celui-ci) |
| **Enterprise** | < 30 min | Analyser → Plan → Design → Implémentation | Plateformes |

Choisissez **Standard** pour TaskFlow.

### A.2 Générer le PRD et le backlog

**Mode : Plan requis.**

```
/workflow:plan
```

Claude vous interviewe sur TaskFlow, puis rédige un **PRD** (Product Requirements Document), des personas, et un **backlog** initial d'épics et de stories sous `project-management/`. Répondez concrètement, par exemple :

> *« TaskFlow permet à une petite équipe de créer des projets, d'ajouter des tâches, de les assigner et de les marquer comme terminées. MVP = API REST + vue web liste/tableau. Pas de mobile pour l'instant. »*

> **À quoi s'attendre :** des fichiers tels que `project-management/prd.md` et `project-management/backlog/` avec des épics comme `EPIC-001 Projects`, `EPIC-002 Tasks`, et des stories comme `US-001 Create a project`.

### A.3 Valider le backlog

**Mode : Lecture seule.**

```
/gate:validate-backlog
```

Cette gate vérifie le backlog selon **INVEST (6/6)** et la couverture du PRD (**≥ 80 %**). En cas d'échec, elle vous indique exactement quelles stories sont trop grandes, non testables ou non estimables. Corrigez-les (relancez `/workflow:plan` ou éditez les stories) jusqu'à ce que la gate passe au vert.

> **Bon moment pour `/clear`.** Puis `/workflow:status` pour reprendre.

---

## Étape B — Conception, puis création du sprint

### B.1 Concevoir la solution technique

**Mode : Plan requis.**

```
/workflow:design
```

Claude (en tant qu'architecte) produit une **Tech Spec** : choix d'architecture, modèle de données, contrat API, et les bibliothèques à utiliser — ancré dans les références Claude Craft de votre stack (Clean Architecture, patterns FastAPI, etc.).

### B.2 Valider la tech spec

**Mode : Lecture seule.**

```
/gate:validate-techspec
```

Seuil de la gate : **Tech Spec ≥ 90 %**. Elle signale les gestions d'erreurs manquantes, les contrats non définis ou les conceptions non testables.

### B.3 Planifier le premier sprint

**Mode : Plan requis.**

```
/workflow:start
```

Claude propose un **objectif de sprint** et sélectionne les stories du backlog en tête de liste qui tiennent. Pour TaskFlow, un premier sprint cohérent est un **walking skeleton** : création de projets et de tâches via l'API, surfacée dans la vue web liste.

### B.4 Décomposer les stories en tâches

**Mode : Plan requis.**

```
/project:decompose-tasks
```

Chaque story est découpée en **tâches** de ≤ 30 minutes, testables indépendamment (écrire le modèle, écrire l'endpoint, écrire le test, câbler l'UI…). C'est ce qui fait que le TDD et `/sprint:dev` se déroulent sans accroc.

### B.5 Valider le sprint

**Mode : Lecture seule.**

```
/gate:validate-sprint
```

Seuil de la gate : **Sprint Ready 100 %** — chaque story estimée, chaque tâche définie, les dépendances ordonnées. Vert signifie que vous pouvez commencer à coder.

> **Bon moment pour `/clear`.**

---

## Étape C — Implémenter le sprint en TDD

### C.1 Le chemin recommandé pour les débutants

**Mode : Normal (⚡).**

```
/sprint:dev
```

`/sprint:dev` parcourt le sprint **tâche par tâche**, en vous guidant dans le cycle TDD **Rouge → Vert → Refactor** :

1. **Rouge** — écrire un test en échec qui fixe le comportement attendu.
2. **Vert** — écrire le code minimal pour le faire passer.
3. **Refactor** — nettoyer, les tests restent verts.

Pour chaque story, il effectue aussi une revue de code et vérifie le **Story DoD (100 %)** avant de passer à la suivante.

> **Le TDD n'est pas négociable.** Un test écrit *avant* le code, c'est ce qui permet à l'agent d'écrire du code en lequel vous pouvez avoir confiance. Les corrections de bugs reçoivent d'abord un test de régression (il doit échouer avant votre correction, passer après).

### C.2 Alternatives (optionnel)

- `/project:run-sprint` — exécute l'ensemble du sprint de façon plus autonome.
- `/team:sprint` — implémente plusieurs stories **en parallèle** en utilisant les Agent Teams (avancé).
- `@tdd-coach` — invoquez le coach en cours de tâche pour obtenir des conseils.

Restez sur `/sprint:dev` pour votre premier run.

### C.3 Piloter au quotidien

- `/sprint:next-story --claim` — prendre la prochaine story.
- `/sprint:transition US-001 in-progress` — déplacer une story sur le tableau.
- `/qa:tdd` — corriger un bug en mode TDD/BDD strict.

> **Rappel Docker.** Exécutez les tests et les commandes via Docker pour que les résultats ne dépendent pas de votre machine locale, par ex. `docker compose exec app pytest`.

---

## Étape D — Suivre l'avancement avec le tableau Kanban

### D.1 Lancer le tableau

**Mode : Lecture seule.**

```
/project:board
```

Cela ouvre un **tableau Kanban** local (pas de SaaS, pas de dépendance externe) qui lit les fichiers d'état BMAD. Les colonnes suivent le routage de statut :

```
backlog → ready-for-dev → in-progress → review → done   (any → blocked)
```

Vues complémentaires : `/project:burndown` (burndown du sprint), `/project:dependencies`, `/project:critical-path`, `/project:metrics`.

### D.2 Pourquoi une carte peut refuser de bouger

Le tableau impose les mêmes gates. Une story n'entrera pas dans **done** tant que son DoD n'est pas validé — c'est la méthode qui vous protège, pas un bug.

> **Bon moment pour `/clear`.**

---

## Étape E — Clore le sprint et boucler

### E.1 Revue de sprint

**Mode : Normal (⚡).**

```
/workflow:review
```

Résume ce qui a été livré par rapport à l'objectif du sprint, avec une checklist de démo.

### E.2 Rétrospective

```
/workflow:retro
```

Capture ce qui s'est bien passé / ce qui est à améliorer. Persistez les apprentissages durables avec `/memory` pour qu'ils survivent aux futurs `/clear`.

### E.3 Boucler

Relancez `/workflow:start` pour planifier le sprint 2 à partir du backlog restant. Le cycle se répète : plan → design → implémentation → revue.

---

## Aide-mémoire

### Commandes, dans l'ordre

```bash
# Étape A — Backlog
/workflow:init                 # choisir le track
/workflow:plan                 # PRD + backlog
/gate:validate-backlog         # INVEST 6/6, PRD ≥ 80%

# Étape B — Design + sprint
/workflow:design               # tech spec
/gate:validate-techspec        # Tech Spec ≥ 90%
/workflow:start                # planifier le sprint
/project:decompose-tasks       # stories → tâches
/gate:validate-sprint          # Sprint Ready 100%

# Étape C — Implémenter (TDD)
/sprint:dev                    # tâche par tâche Rouge/Vert/Refactor
/gate:validate-story US-001    # Story DoD 100%

# Étape D — Suivre
/project:board                 # Kanban
/project:burndown              # burndown

# Étape E — Clore + boucler
/workflow:review
/workflow:retro
```

### Quand faire `/clear`

Après chaque étape lettrée (A→B→C→D→E). L'état vit dans des fichiers ; `/workflow:status` le relit.

### Où vivent les fichiers

| Quoi | Où |
|------|----|
| PRD, personas | `project-management/prd.md` |
| Backlog (épics/stories) | `project-management/backlog/` |
| Sprints, tâches | `project-management/sprints/` |
| Statut BMAD | `project-management/.bmad/` / `sprint-status.yaml` |

### Seuils des gates

| Gate | Seuil |
|------|-------|
| PRD | ≥ 80 % |
| Tech Spec | ≥ 90 % |
| INVEST | 6/6 |
| Sprint Ready | 100 % |
| Story DoD | 100 % |
| Spec Alignment | ≥ 85 % |

### Problèmes courants

| Symptôme | Solution |
|----------|---------|
| `/gate:*` / `/sprint:*` inconnu | Réinstallez et acceptez *Project Management commands*. |
| `/workflow:init` introuvable | Utilisez `/workflow:init` (c'est la bonne commande). |
| La gate continue d'échouer | Lisez son rapport ; il nomme l'élément exact en échec. |
| La carte n'atteint pas **done** | Son DoD n'est pas encore rempli — c'est intentionnel. |
| Perdu après `/clear` | Lancez `/workflow:status`. |
| Contexte > 60 % | `/clear`, puis `/workflow:status`. |

---

## Automatiser avec Ralph (optionnel)

Une fois à l'aise, automatisez une story de bout en bout avec la boucle continue :

```
/common:ralph-run "Implement US-001 with full DoD validation"
```

Ralph maintient Claude en activité jusqu'à ce que les validateurs de Definition of Done passent. Voir [Guide Ralph](../../RALPH-GUIDE.md).

---

## Annexe — Un scénario multi-stack réel

TaskFlow est mono-stack intentionnellement. Les vrais produits sont plus complexes — et le **même** workflow leur passe à l'échelle. Comme exemple plus riche, considérez une application de style Wrandly (version anonymisée livrée en tant que fixture de test sous `tests/fixtures/wrandly-anon/`) :

- **Deux clients :** une PWA web (Symfony + React) **et** une application mobile Flutter, plus une API REST personnalisée.
- **Une remise de design existe déjà** avant le début du développement (un package « Claude Design ») : documents sources, 5 décisions d'architecture verrouillées, et un plan par phases (Épics 0 → 7).

Comment cela se mappe sur ce tutoriel :

| Artefact de design | Alimente |
|--------------------|---------|
| Documents sources | `/workflow:plan` (entrée pour le PRD + backlog) |
| Décisions d'architecture verrouillées | `/workflow:design` (formalisées dans la Tech Spec) |
| Phases 0 → 7 | Le découpage épics → sprints |

Deux ajustements pour le multi-stack :

1. **Commencer par l'épic de fondation** (Épic 0) : monorepo, design tokens partagés, le contrat OpenAPI et un style de carte **avant** tout composant UI — un vrai *walking skeleton*.
2. **Lancer les sprints web et mobile en parallèle** avec `/team:sprint` (Agent Teams), chacun respectant les gates de son propre stack.

Tout le reste — gates, TDD, tableau Kanban, discipline `/clear` — est identique. La méthode ne change pas avec l'échelle ; seul le nombre de tracks parallèles augmente.

---

## Pour aller plus loin

- [Développement de fonctionnalités](03-feature-development.md) — approfondir la boucle TDD et les agents.
- [Gestion du backlog](07-backlog-management.md) — maîtriser les épics, les stories et les 15+ commandes projet.
- [Guide pratique BMAD](../../BMAD-PRACTICAL-GUIDE.md) — la référence complète des commandes de la méthode.
- [Sprint autonome](../AUTONOMOUS-SPRINT.md) — laisser un pipeline d'agents exécuter l'ensemble du sprint.
- [Parcours d'apprentissage](../../LEARNING-PATHS.md) — progression Débutant → Intermédiaire → Avancé.

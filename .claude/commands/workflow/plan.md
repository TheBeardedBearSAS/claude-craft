---
name: workflow-plan
description: "Exécuter la phase de Planification - recherche (--research), PRD (--only=prd) et backlog SCRUM (--only=backlog)"
argument-hint: "[--research] [--only=prd|backlog] [--continue]"
arguments:
  - name: research
    description: "Lancer d'abord l'étape de recherche (ancien /workflow:plan --research) : domaine, marché, recherche technique, contraintes, risques"
    required: false
  - name: only
    description: "Exécuter une seule étape : prd (PRD + personas) ou backlog (personas, DoD, epics, user stories, sprints)"
    required: false
  - name: continue
    description: Reprendre là où on s'est arrêté
    required: false
---

# /workflow:plan

## Mission

Exécuter la phase de Planification du workflow de développement : recherche optionnelle, Product Requirements Document (PRD), personas, et backlog SCRUM (epics, user stories, dossiers de sprint). Cette commande contient toute la logique de génération ; il n'y a plus de générateur de PRD ou de backlog distinct à appeler.

## Usage

| Invocation | Ce qu'elle fait | Remplace |
|------------|-----------------|----------|
| `/workflow:plan` | Phase complète : PRD, puis backlog (ajouter `--research` pour commencer par la recherche) | - |
| `/workflow:plan --research` | Recherche, exploration, contraintes et risques, avant le PRD. Écrit `project-management/analysis/` | `/workflow:plan --research` |
| `/workflow:plan --only=prd` | PRD + personas uniquement. Écrit `project-management/prd.md` | `/workflow:plan --only=prd` |
| `/workflow:plan --only=backlog` | Backlog uniquement : lit `project-management/prd.md` (+ `project-management/tech-spec.md` si présent), écrit personas, DoD, epics, user stories avec `**Implements**`, dossiers de sprint `sprint-{N}-{slug}`, et enregistre les stories dans `.bmad/sprint-status.yaml` avec le statut `backlog` | `/workflow:plan --only=backlog` |
| `/workflow:plan --continue` | Reprendre une exécution interrompue | - |

`--research` peut se combiner avec `--only=prd` (recherche puis PRD).

## Ordre canonique

Les documents sont produits dans cet ordre : **PRD, puis tech spec, puis backlog, puis sprint**.

- **Track Quick** : `/workflow:plan` (sans option) génère PRD + backlog en une passe.
- **Standard / Enterprise (recommandé)** : `/workflow:plan --only=prd` puis `/workflow:design` puis `/workflow:plan --only=backlog`. Le backlog lit alors `project-management/prd.md` et `project-management/tech-spec.md` : les stories portent l'architecture réelle et `**Implements**` pointe vers les `FR-xxx` du PRD.
- **Enterprise** : commencer par `/workflow:plan --research --only=prd`.

Sans PRD, `--only=backlog` se rabat sur les spécifications de `./docs/` (ARCHITECTURE_TECHNIQUE*.md, CAHIER_DES_CHARGES*.md ou tout autre fichier de spécification) et avertit que la traçabilité est dégradée.

## Quand utiliser

- Tracks **Standard** et **Enterprise**, après `/workflow:init`
- Au démarrage de la planification des fonctionnalités, ou quand le PRD ou le backlog doit être régénéré

## Plan Mode

> **Le Plan Mode est obligatoire.** Claude active le plan mode pour structurer l'approche, identifier les dépendances et présenter une stratégie de génération avant de créer les artefacts.

## Workflow

### Étape 1 : Préparation et artefacts existants

Afficher le track et la phase (Planification = phase 2 sur 4), puis vérifier `project-management/` : `prd.md`, `personas.md`, `backlog/`, `analysis/` (constraints.md, research-summary.md). Les fichiers existants ne sont jamais écrasés silencieusement : demander s'il faut mettre à jour, fusionner ou ignorer.

### Étape 2 (`--research`) : Phase de recherche

Ancien `/workflow:plan --research`. Recherche, exploration et contraintes avant le PRD.

**Questions guidées**

| Domaine | Questions |
|---------|-----------|
| Métier | Quel problème ? Quelles parties prenantes ? Moteurs business ? À quoi ressemble le succès ? |
| Marché | Solutions existantes ? Concurrents ? Bonnes pratiques du secteur ? Tendances émergentes ? |
| Technique | Technologies candidates ? Intégrations ? Scalabilité ? Sécurité / conformité ? |

Si le MCP Context7 est configuré, l'utiliser pour la documentation technique à jour (`/common:research-context7` pour une recherche approfondie).

**Contraintes** : documenter les contraintes techniques (backend existant, base de données), business (budget, délais, rétrocompatibilité), réglementaires (RGPD, PCI DSS) et de ressources (taille d'équipe, pas de DevOps).

**Risques et opportunités** : tableau des risques (risque, impact, probabilité, mitigation) et opportunités.

**Artefacts**

```
project-management/analysis/
├── research-summary.md      # Principales conclusions
├── constraints.md           # Toutes les contraintes identifiées
├── risks-opportunities.md   # Registre des risques & opportunités
└── technical-options.md     # Évaluation des technologies
```

Agents : **research-assistant** (recherche technique), **product-owner** (contexte métier). Suite : PRD (l'analyse l'alimente).

### Étape 3 (`--only=prd` ou exécution complète) : Génération du PRD

Écrit `project-management/prd.md` et `project-management/personas.md`.

**Phase 1 - Découverte du contexte** : lire `README.md`, parcourir `./docs/` pour les spécifications, lire `project-management/personas.md` et `project-management/analysis/` s'ils existent, analyser le code pour la stack technique, relire la conversation. Lister les sources trouvées.

**Phase 2 - Clarification interactive** (ne poser que ce qui manque) :

| Sujet | Questions |
|-------|-----------|
| Problème et opportunité | Quel problème ? Qui en souffre le plus ? Coût de l'inaction ? Opportunité business ? |
| Utilisateurs cibles | Utilisateurs principaux (rôle, profil) ? Objectifs ? Frustrations avec les solutions actuelles ? Utilisateurs secondaires ? |
| Objectifs et métriques | Objectifs business ? KPIs avec valeurs cibles et échéances ? À quoi ressemble le succès du MVP ? |
| Périmètre et contraintes | Fonctionnalités indispensables (P0) ? Explicitement hors périmètre ? Contraintes techniques, budget, délais, conformité ? |

**Phase 3 - Génération** : charger le template de PRD (`.claude/templates/project/prd.md` s'il existe), remplir chaque section, créer des personas détaillés, organiser les exigences en P0/P1/P2 avec des IDs stables `FR-001`, `FR-002`... (fonctionnelles) et `NFR-001`... (non fonctionnelles) afin que les stories puissent s'y rattacher, identifier les risques à partir des contraintes et dépendances.

**Phase 4 - Relecture et itération** : afficher une checklist des sections (Executive Summary, Problem Statement, Goals & Metrics, Target Users, Functional Requirements, Non-Functional Requirements, Scope & Constraints, Timeline, Risks & Mitigations), signaler les sections incomplètes, puis proposer d'étoffer une section, de détailler les personas ou d'ajuster la priorisation.

```
project-management/
├── prd.md                    # PRD généré (FR-xxx / NFR-xxx)
├── personas.md               # Personas extraits/créés
└── analysis/discovery-notes.md
```

### Étape 4 (`--only=backlog` ou exécution complète) : Génération du backlog

Vous agissez comme un Product Owner et Scrum Master expérimenté. Le backlog doit respecter les 3 piliers de Scrum (transparence, inspection, adaptation) et les valeurs Agile.

**Entrées, par ordre de priorité**

1. `project-management/prd.md` : source principale. Ses IDs `FR-xxx` alimentent le champ `**Implements**` de chaque user story.
2. `project-management/tech-spec.md` s'il existe (voir `/workflow:design`) : architecture, entités, endpoints utilisés dans les notes techniques.
3. Repli sans PRD : spécifications de `./docs/`.

**Vertical slicing (obligatoire)** : chaque user story traverse toutes les couches de la stack du projet (UI, API, persistance). Aucune story « backend seul » ou « frontend seul ». Détecter la stack depuis la tech spec ou le code et adapter la DoD et les critères techniques en conséquence.

**Structure créée**

```
project-management/
├── README.md                 # Vue d'ensemble, personas, epics, métriques, roadmap
├── personas.md
├── definition-of-done.md
├── dependencies-matrix.md
├── backlog/
│   ├── epics/EPIC-XXX-name.md
│   └── user-stories/US-XXX-name.md
└── sprints/sprint-{N}-{slug}/   # ex. sprint-1-walking_skeleton
    ├── sprint-goal.md
    └── sprint-dependencies.md
```

**personas.md** : minimum 3 personas (IDs P-001, P-002...; 1 principal, 2+ secondaires). Chacun : identité, citation représentative, contexte, 3 objectifs, au moins 3 frustrations, motivations, comportements, scénarios d'usage (Contexte, Besoin, Action, Résultat), critères de décision. Ajouter une matrice personas/fonctionnalités (3 étoiles critique, 2 important, 1 utile) et des anti-personas.

**definition-of-done.md** : code (revue approuvée, conventions, SOLID), tests (80 % unitaires, intégration, E2E, CI verte), critères par couche (UI, API, parité entre clients), documentation, qualité (analyse statique niveau max, API sous 200 ms), déploiement (migrations, staging, validation PO).

**Epics** (`EPIC-XXX-name.md`) : description (valeur métier), tableau des stories associées (ID, titre, points, priorité, dépend de), dépendances (prérequis et dépendants), Minimum Marketable Feature (MMF) avec les stories incluses, estimation (taille S/M/L/XL, sprints estimés).

**User stories** (`US-XXX-name.md`), à partir de `.claude/templates/project/user-story.md` :

- **INVEST** (obligatoire) : Independent, Negotiable, Valuable, Estimable, Sized (8 points max), Testable.
- **3 C** (obligatoire) : Card (« En tant que [P-XXX]... je veux... afin de... »), Conversation (questions ouvertes), Confirmation (critères d'acceptation).
- **Critères d'acceptation** en Gherkin SMART : 1 scénario nominal, au moins 2 alternatifs, au moins 2 scénarios d'erreur.
- Epic parent, persona associé, critères par couche, notes techniques, estimation (points Fibonacci, MoSCoW), dépendances (bloquantes et bloquées), sprint assigné.
- **Traçabilité** : remplir la section `## Traceability` avec `**Implements**: {FR-001, FR-003}` (IDs des exigences du PRD livrées par la story). Une story sans `FR-xxx` est signalée.

**dependencies-matrix.md** : graphe Mermaid entre epics, tableau des dépendances, chemin critique, dépendances inter-stories.

**Sprints** (`sprint-{N}-{slug}/`) : `sprint-goal.md` (objectif en une phrase, cérémonies, stories sélectionnées et total de points, ordre d'exécution, graphe de dépendances Mermaid, incrément livrable, directive de rétrospective et format Starfish) et `sprint-dependencies.md`.

**Enregistrement dans `.bmad/sprint-status.yaml`** : pour chaque story, ajouter une entrée avec `status: backlog` (schéma : `Project/templates/sprint-status.yaml.template`) : `title`, `story_points`, `epic_id`, `tasks` (total 0), `acceptance_criteria.total`, et une entrée `history` « Story created ». `.bmad/sprint-status.yaml` est la source unique de vérité pour le statut ; les fichiers markdown ne contiennent que le contenu, jamais de statut. Créer le fichier depuis le template s'il manque, ne jamais écraser les entrées existantes.

**Règles Scrum** : sprints de 2 semaines, vélocité 20-40 points, 8 points max par story (sinon découper), échelle de Fibonacci (1, 2, 3, 5, 8, 13, 21), Sprint 1 = Walking Skeleton (infrastructure + un flux complet).

### Étape 5 : Validation

Lancer `/gate:check backlog` (ou vérifier en ligne) :

| Contrôle | Critères |
|----------|----------|
| INVEST | Les 6 critères par story ; 8 points max (13+ doit être découpé) |
| 3 C | Card, Conversation, Confirmation présentes |
| Gherkin | Format valide ; 1 nominal + 2 alternatifs + 2 erreurs |
| Personas | Au moins 3, matrice présente |
| Epics | MMF identifié, dépendances Mermaid |
| Sprints | Sprint 1 = Walking Skeleton, objectif en une phrase, graphe de dépendances |
| Traçabilité | Chaque story a `**Implements**` ; chaque `FR-xxx` P0 est couvert par au moins une story |
| Statut | Chaque story est enregistrée dans `.bmad/sprint-status.yaml` en `backlog` |

Signaler les avertissements (par exemple « US-012 : 21 points - doit être découpée ») et les corriger avant de terminer.

### Étape 6 : Fin de phase

Résumer les artefacts (PRD, personas, epics, nombre de stories, total de points, périmètre du Sprint 1, sprints estimés) et recommander la suite : après `--only=prd`, `/workflow:design` puis `/workflow:plan --only=backlog` ; après le backlog, `/workflow:design` (si pas encore de tech spec) ou `/workflow:start 1`.

## Agents impliqués

- **product-owner** : création du PRD, personas, priorisation, backlog
- **tech-lead** : revue de faisabilité technique, aide à l'estimation
- **research-assistant** : recherche (`--research`)

## Fichiers produits

| Fichier | Rôle | Mode |
|---------|------|------|
| `analysis/*.md` | Recherche, contraintes, risques | `--research` |
| `prd.md`, `personas.md` | PRD avec `FR-xxx` / `NFR-xxx`, personas | `--only=prd` |
| `definition-of-done.md`, `dependencies-matrix.md`, `README.md` | Cadrage du backlog | `--only=backlog` |
| `backlog/epics/`, `backlog/user-stories/` | Epics et stories (`**Implements**`) | `--only=backlog` |
| `sprints/sprint-{N}-{slug}/` | Dossiers de sprint | `--only=backlog` |
| `.bmad/sprint-status.yaml` | Stories enregistrées en `backlog` | `--only=backlog` |

## Option de reprise

En cas d'interruption, `/workflow:plan --continue` détecte ce qui existe (PRD terminé, backlog à 12/18 stories) et reprend au prochain élément manquant.

## Commandes associées

- `/workflow:init` - Initialiser le workflow
- `/workflow:design` - Tech spec (entre le PRD et le backlog)
- `/workflow:start` - Démarrer un sprint depuis le backlog
- `/workflow:status` - Vérifier la progression
- `/project:backlog` - Ajouter, lister, modifier et déplacer des stories ensuite
- `/gate:check` - Valider le backlog
- `/common:research-context7` - Recherche approfondie avec Context7 MCP

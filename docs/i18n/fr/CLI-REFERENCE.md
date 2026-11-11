# Référence CLI

Référence complète de l'interface en ligne de commande Claude Craft.

---

## Installation NPX

La méthode recommandée pour installer Claude Craft est via NPX :

```bash
npx @the-bearded-bear/claude-craft [commande] [options]
```

### Commandes Disponibles

| Commande | Description |
|----------|-------------|
| `install` | Installer Claude Craft dans un projet |
| `flatten` | Générer un contexte aplati du codebase |
| (aucune commande) | Assistant d'installation interactif |

---

## Assistant Interactif

Exécutez sans arguments pour l'assistant interactif :

```bash
npx @the-bearded-bear/claude-craft
```

L'assistant vous guidera à travers :
1. **Répertoire cible** - Où installer
2. **Stack technologique** - Quel(s) framework(s) utiliser
3. **Langue** - Langue de la documentation (en, fr, es, de, pt)
4. **Options** - Sauvegarde, écrasement forcé, etc.

---

## Commande Install

### Usage de Base

```bash
npx @the-bearded-bear/claude-craft install <répertoire-cible> [options]
```

### Options

| Option | Raccourci | Description |
|--------|-----------|-------------|
| `--tech=<technologie>` | `-t` | Stack technologique à installer |
| `--lang=<langue>` | `-l` | Langue de la documentation |
| `--force` | `-f` | Écraser les fichiers existants |
| `--backup` | `-b` | Créer une sauvegarde avant installation |
| `--dry-run` | `-d` | Simuler sans effectuer de changements |
| `--preserve-config` | | Conserver le CLAUDE.md existant |

### Options de Technologie

| Valeur | Description |
|--------|-------------|
| `symfony` | Backend Symfony/PHP |
| `flutter` | Mobile Flutter/Dart |
| `react` | Frontend React |
| `reactnative` | Mobile React Native |
| `python` | Backend Python |
| `angular` | Frontend Angular |
| `csharp` | Backend C#/.NET |
| `laravel` | Backend Laravel/PHP |
| `vuejs` | Frontend Vue.js |
| `php` | PHP Clean Architecture |
| `common` | Règles communes uniquement |
| `all` | Toutes les technologies |

### Options de Langue

| Valeur | Langue |
|--------|--------|
| `en` | Anglais (défaut) |
| `fr` | Français |
| `es` | Espagnol |
| `de` | Allemand |
| `pt` | Portugais |

### Exemples

```bash
# Installer les règles Symfony en français
npx @the-bearded-bear/claude-craft install ~/mon-projet --tech=symfony --lang=fr

# Installer plusieurs technologies
npx @the-bearded-bear/claude-craft install . --tech=react
npx @the-bearded-bear/claude-craft install . --tech=python

# Forcer la réinstallation avec sauvegarde
npx @the-bearded-bear/claude-craft install ~/app --tech=flutter --force --backup

# Dry run pour prévisualiser les changements
npx @the-bearded-bear/claude-craft install . --tech=angular --dry-run

# Installer toutes les technologies
npx @the-bearded-bear/claude-craft install ~/projet --tech=all --lang=fr
```

---

## Commande Flatten

Génère un résumé aplati de votre codebase pour les assistants IA.

### Usage

```bash
npx @the-bearded-bear/claude-craft flatten [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--output=<fichier>` | Nom du fichier de sortie (défaut : `CODEBASE.md`) |
| `--max-tokens=<n>` | Tokens maximum avant fragmentation |
| `--exclude=<patterns>` | Patterns additionnels à exclure |

### Exemples

```bash
# Générer le codebase aplati
npx @the-bearded-bear/claude-craft flatten

# Fichier de sortie personnalisé
npx @the-bearded-bear/claude-craft flatten --output=CONTEXT.md

# Limiter le nombre de tokens (active la fragmentation pour les grands projets)
npx @the-bearded-bear/claude-craft flatten --max-tokens=50000

# Exclure des répertoires additionnels
npx @the-bearded-bear/claude-craft flatten --exclude="*.test.ts,*.spec.ts"
```

### Sortie

La commande flatten génère :
- Structure de l'arborescence des fichiers
- Contenu des fichiers par ordre de priorité
- Estimation des tokens
- Fragmentation automatique pour les grands projets

---

## Commandes Makefile

Quand vous clonez le dépôt, vous pouvez utiliser Make pour l'installation.

### Commandes d'Installation

```bash
# Installer une technologie spécifique
make install-symfony TARGET=~/projet
make install-flutter TARGET=~/projet RULES_LANG=fr
make install-react TARGET=~/projet OPTIONS="--force"

# Installer des presets
make install-all TARGET=~/projet         # Tout
make install-common TARGET=~/projet      # Règles communes uniquement
make install-web TARGET=~/projet         # React
make install-backend TARGET=~/projet     # Symfony + Python
make install-mobile TARGET=~/projet      # Flutter + React Native

# Installer les outils
make install-tools                        # Tous les outils
make install-statusline                   # Ligne de statut personnalisée
make install-multiaccount                 # Gestionnaire multi-comptes
make install-projectconfig                # Gestionnaire de config projet
```

### Commandes Dry Run

```bash
make dry-run-all TARGET=~/projet
make dry-run-symfony TARGET=~/projet
make dry-run-flutter TARGET=~/projet
```

### Commandes de Configuration

```bash
make config-list                          # Lister les projets dans la config YAML
make config-validate                      # Valider la config YAML
make config-install PROJECT=mon-projet    # Installer depuis la config
make config-install-all                   # Installer tout depuis la config
make config-dry-run PROJECT=mon-projet    # Dry run depuis la config
```

### Commandes Utilitaires

```bash
make help                                 # Afficher toutes les commandes disponibles
make list                                 # Lister les composants disponibles
make list-agents                          # Lister tous les agents
make list-commands                        # Lister toutes les commandes
make stats                                # Afficher les statistiques
make tree                                 # Afficher la structure du projet
make fix-permissions                      # Corriger les permissions des scripts
```

### Commandes de Migration

```bash
make migrate-check                        # Vérifier le statut de migration
```

### Export Plugin

```bash
make plugin-export                        # Exporter comme plugin Claude Code
make plugin-export-all                    # Exporter toutes les technologies
```

---

## Exécution Directe des Scripts

Pour un contrôle avancé, exécutez les scripts d'installation directement.

### Syntaxe

```bash
./Dev/scripts/install-{tech}-rules.sh [options] <répertoire-cible>
```

### Scripts Disponibles

| Script | Technologie |
|--------|-------------|
| `install-common-rules.sh` | Commun/transversal |
| `install-symfony-rules.sh` | Symfony |
| `install-flutter-rules.sh` | Flutter |
| `install-react-rules.sh` | React |
| `install-reactnative-rules.sh` | React Native |
| `install-python-rules.sh` | Python |
| `install-angular-rules.sh` | Angular |
| `install-csharp-rules.sh` | C#/.NET |
| `install-laravel-rules.sh` | Laravel |
| `install-vuejs-rules.sh` | Vue.js |
| `install-php-rules.sh` | PHP |

### Options des Scripts

| Option | Description |
|--------|-------------|
| `--install` | Installation fraîche (défaut) |
| `--update` | Mettre à jour les fichiers existants uniquement |
| `--force` | Écraser tous les fichiers |
| `--preserve-config` | Conserver CLAUDE.md et contexte projet |
| `--dry-run` | Simuler sans changements |
| `--backup` | Créer une sauvegarde avant changements |
| `--interactive` | Installation guidée |
| `--lang=XX` | Définir la langue (en, fr, es, de, pt) |
| `--agents-only` | Installer uniquement les agents |
| `--commands-only` | Installer uniquement les commandes |
| `--rules-only` | Installer uniquement les règles |
| `--templates-only` | Installer uniquement les templates |
| `--checklists-only` | Installer uniquement les checklists |

### Exemples

```bash
# Installation de base
./Dev/scripts/install-symfony-rules.sh --lang=fr ~/mon-projet

# Mettre à jour une installation existante
./Dev/scripts/install-flutter-rules.sh --update ~/mon-app

# Forcer la réinstallation avec sauvegarde
./Dev/scripts/install-python-rules.sh --force --backup ~/api

# Mode interactif
./Dev/scripts/install-react-rules.sh --interactive ~/frontend

# Installer uniquement les agents
./Dev/scripts/install-symfony-rules.sh --agents-only ~/projet
```

---

## Ralph Wiggum CLI

Exécute Claude en boucle continue jusqu'à l'achèvement de la tâche.

### Usage

```bash
npx @the-bearded-bear/claude-craft ralph "description de la tâche"
```

### Options

| Option | Description |
|--------|-------------|
| `--full` | Activer tous les validateurs DoD |
| `--max-iterations=<n>` | Nombre maximum d'itérations (défaut : 10) |
| `--dod=<fichier>` | Fichier de configuration DoD personnalisé |

### Exemples

```bash
# Tâche de base
npx @the-bearded-bear/claude-craft ralph "Implémenter l'authentification utilisateur"

# Avec toutes les vérifications DoD
npx @the-bearded-bear/claude-craft ralph --full "Corriger le bug de connexion"

# Limite d'itérations personnalisée
npx @the-bearded-bear/claude-craft ralph --max-iterations=20 "Refactorer le module de paiement"
```

---

## Commande Kanban

Lance une interface web locale pour visualiser et gérer le backlog et les sprints BMAD v6 sous forme de tableau Scrum / Kanban. Le serveur écoute exclusivement sur `127.0.0.1` et ne sollicite jamais Internet.

### Utilisation

```bash
npx @the-bearded-bear/claude-craft kanban [chemin] [options]
```

Le `chemin` est par défaut le répertoire courant. La cible doit contenir un sous-dossier `project-management/` (généré par `/workflow:plan` ou `/workflow:start`).

### Options

| Option | Description |
|--------|-------------|
| `--port=<n>` | Port HTTP, de 1024 à 65535 (défaut : 3737). La forme avec `=` est obligatoire : `--port 4000` (avec une espace) est refusé avec un message d'usage |
| `--open` | Ouvre automatiquement le navigateur |
| `--readonly` | Désactive toute écriture : le serveur répond 403 `readonly` à chaque PATCH, PUT, POST et DELETE, et le tableau n'offre aucun contrôle de déplacement |
| `--no-watch` | Désactive le watcher de fichiers (pas de rechargement lors des modifications externes) |
| `--user=<nom>` | Auteur inscrit dans l'`history` des modifications faites depuis le tableau (`kanban:<nom>`). Par défaut : `CLAUDE_CRAFT_USER`, puis `git config user.name`, puis l'utilisateur du système, puis `kanban` |

### Vues

Six vues, listées dans la barre de navigation.

- **Board** — 6 colonnes (backlog, ready-for-dev, in-progress, review, done, blocked). Une carte se déplace par glisser-déposer ou avec le menu « Déplacer » de la carte, qui ne propose que les colonnes autorisées (alternative au clavier et au pointeur unique). Les gates (INVEST ou points, tâches complètes, phase TDD) sont validés côté serveur. L'en-tête de colonne affiche le nombre de cartes, ou `nombre/limite` lorsqu'une limite WIP est définie.
- **Backlog** — arbre des epics avec la progression de chacun. On sélectionne une ou plusieurs stories pour les ajouter à un sprint, ou les remettre au backlog ; une barre de capacité compare les points engagés à la capacité du sprint cible.
- **Sprints** — tous les sprints (planifiés, actif, clos) avec objectif, dates, points, stories et tâches dépliables, ainsi que leurs notes de revue et de rétrospective. On y crée, démarre et clôture les sprints.
- **Burndown** — courbes idéale et réelle du sprint actif, indicateur on-track / at-risk / behind. Le graphique de vélocité (points engagés et livrés des sprints clos, moyenne des trois derniers, prévision du nombre de sprints restants) est accompagné d'un tableau équivalent.
- **Dependencies** — graphe orienté des dépendances entre stories, cycles en évidence, et tableau équivalent (story, dépend de, bloque, statut, cycle).
- **Docs** — visualiseur markdown de `prd.md`, `tech-spec.md`, `personas.md`, `architecture/*.md` et des documents d'epics, de stories et de sprints. Les identifiants `US-XXX` du texte renvoient à la story.

### Ce que l'on peut faire depuis le tableau

- **Déplacer une story** entre colonnes. Les transitions autorisées figurent dans [Machine d'états](#machine-détats) ; bloquer une story demande une raison.
- **Créer, modifier et supprimer une story** (« Nouvelle story » dans les vues Board et Backlog ; le formulaire se trouve dans le détail de la story). Champs modifiables : titre, epic, points, priorité, assigné, sprint, phase TDD et dépendances ; persona à la création. La suppression demande confirmation et déplace le fichier dans `project-management/backlog/user-stories/.trash/` (récupérable en le remettant en place). Une story en cours ou en revue exige une confirmation explicite, et une story dont d'autres dépendent ne peut pas être supprimée (409 `has_dependents`).
- **Ajouter des tâches et changer leur statut** (`to-do`, `in-progress`, `done`, `blocked`) depuis le détail de la story ; le nombre de tâches terminées est recalculé. Une story ne passe en revue qu'une fois qu'elle a des tâches, toutes terminées. Pour une story qui n'avait qu'un compteur de tâches, la première modification enregistre un statut par tâche (les premières tâches, autant que le compteur en indiquait, comptent comme terminées).
- **Planifier un sprint** : sélectionner des stories dans la vue Backlog et les ajouter à un sprint planifié ou actif.
- **Créer, démarrer et clôturer un sprint.** La création (nom, dates de début et de fin, objectif, capacité) écrit `sprints/sprint-<N>-<slug>/sprint-goal.md` ; le sprint est « planifié ». Le démarrer en fait le sprint actif (refusé tant qu'un autre sprint est actif). La clôture archive les stories `done` sous `archived_sprints` et permet de choisir la destination des stories non terminées : retour au backlog ou report dans un sprint planifié.
- **Régler les limites WIP** par colonne dans le panneau Réglages. Elles sont indicatives : un dépassement affiche un avertissement et ne bloque jamais un déplacement. Une colonne compte les stories du sprint actif, comme le tableau les affiche.
- **Saisie non enregistrée protégée** : fermer un formulaire (Échap, Annuler, clic hors de la fenêtre) ou changer d'URL (retour arrière, lien vers une story) alors qu'un formulaire de story ou de sprint contient des modifications demande confirmation avant de les abandonner.
- **Rechercher, filtrer et trier** : la zone de recherche (`Ctrl+K` ou `/`) filtre les vues Board et Backlog ; les filtres de priorité, d'assigné et d'epic ainsi que le tri sont conservés dans l'URL, par exemple `#/kanban?q=auth&prio=must,should&who=alice&epic=E4&sort=priority&dir=desc`. `?story=US-E4-03` ouvre une story depuis n'importe quelle vue, et `#/docs/<chemin>` ouvre un document.
- **Langue de l'interface** : anglais, français, espagnol, allemand ou portugais, choisie automatiquement d'après le navigateur ou dans le panneau Réglages. Les titres de stories et les documents restent tels qu'écrits.

Les commandes `/workflow:*` et `/project:*` restent valables et écrivent les mêmes fichiers.

### Où les données sont écrites

| Donnée | Fichier |
|--------|---------|
| Statut, appartenance à un sprint, tâches, points, assigné, priorité, historique | `.bmad/sprint-status.yaml` |
| Contenu d'une story (description, critères d'acceptation, persona) | `project-management/backlog/user-stories/US-*.md` |
| Objectif d'un nouveau sprint | `project-management/sprints/sprint-<N>-<slug>/sprint-goal.md` |
| Limites WIP | `.bmad/kanban.yaml` |
| Stories supprimées | `project-management/backlog/user-stories/.trash/` |

Les fichiers markdown ne reçoivent jamais de ligne de statut. Les clés optionnelles `stories.<id>.sprint_id` et `metadata.closed_date` sont décrites dans `Project/i18n/fr/templates/sprint-status.md`.

### Concurrence

- Les écritures dans `.bmad/sprint-status.yaml` prennent le même verrou que les scripts `.bmad/lib/` (`status-lock.sh`). Tant qu'un script le détient, le tableau répond 423 `locked` ; un verrou laissé par un processus interrompu est repris au bout de 10 secondes.
- Les conflits sont détectés story par story : chaque story porte une révision, renvoyée dans `If-Match`. Une story modifiée ailleurs entre-temps est refusée avec 409 `conflict`, et l'interface propose de la recharger.
- Le fichier est réécrit après revalidation, commentaires, ordre des clés et mise en forme préservés. Un fichier qui ne valide pas n'est jamais écrasé (409 `sprint_status_invalid`).

### Sécurité

- Écoute exclusivement sur `127.0.0.1`, jamais `0.0.0.0` ni le réseau local.
- L'en-tête `Host` doit être l'adresse de bouclage et le port servi (protection contre le DNS rebinding) ; l'`Origin` est vérifié à chaque écriture, et les écritures inter-origines sont refusées (403).
- Corps de requête limités à 64 Ko (512 Ko pour le corps d'une story).
- `--readonly` bloque toute écriture.
- Traversée de chemin bloquée sur le point d'accès aux documents ; les réponses d'erreur ne contiennent aucun chemin du système de fichiers.
- Écritures atomiques (verrou, fichier temporaire, renommage).
- CSP stricte (`script-src 'self'`, `connect-src 'self'`), aucun `eval`, aucune exécution de shell, aucun appel sortant.

### Machine d'états

Transitions autorisées (toutes les autres sont refusées avec 409 `invalid_transition` et la liste des cibles permises) :

```
backlog       -> ready-for-dev (invest_score >= 6 s'il existe, sinon story_points > 0) | blocked
ready-for-dev -> in-progress | backlog | blocked
in-progress   -> review (toutes les tâches terminées) | blocked
review        -> done (toutes les tâches + tdd_phase parmi green|refactor|done) | in-progress | blocked
blocked       -> previous_status (déblocage uniquement)
done          -> (terminal)
```

### Source sprint-status BMAD v6

Les stories viennent de `.bmad/sprint-status.yaml` (écrit par `/workflow:*` et `/project:backlog`) et des fichiers markdown de `project-management/`. Quand une story est suivie dans la YAML, la YAML l'emporte pour le statut, le titre, les points, la priorité, l'assigné, l'epic, les tâches et le sprint ; le markdown garde le contenu. Le tableau est mis à jour en direct dès que l'une des sources change. Les stories d'un sprint clos (`archived_sprints`) sont en lecture seule.

Si le tableau est vide ou qu'une story manque, le bandeau de diagnostics liste les fichiers illisibles ; la même liste est renvoyée par `GET /api/diagnostics`. Voir le [dépannage](../../TROUBLESHOOTING.md#kanban-board-empty).

### Routes HTTP

Lectures (`GET`) : `/api/health` (`ok`, `readonly`, `user`, `wip_limits`), `/api/diagnostics`, `/api/stories`, `/api/stories/:id`, `/api/dependencies`, `/api/docs`, `/api/docs/<chemin>`, `/api/sprints`, `/api/sprints/:id`, `/api/sprints/current`, `/api/velocity`, `/api/events` (évènements serveur).

Écritures :

| Route | Rôle | Erreurs propres |
|-------|------|-----------------|
| `PATCH /api/stories/:id/status` | Déplacer une story (`status`, `blocked_reason?`, `reason?`) | 409 `invalid_transition`, `archived`, `read_only_source`, `conflict` |
| `PATCH /api/stories/:id` | Modifier titre, points, assigné, priorité, phase TDD, epic, sprint (`null` = backlog), dépendances | 400 `invalid_payload` ; 409 `archived`, `sprint_not_found`, `conflict` |
| `PUT /api/stories/:id/body` | Remplacer le corps markdown (`markdown`, `expected_mtime`) | 409 `no_backing_file`, `conflict` ; 422 `status_line_forbidden` |
| `POST /api/stories` | Créer une story (`title`, `epic_id?`, `story_points?`, `priority?`, `persona?`, `sprint_id?`) | 409 `sprint_status_missing`, `sprint_status_invalid`, `sprint_not_found` |
| `DELETE /api/stories/:id[?force=1]` | Déplacer une story dans `.trash/` | 409 `story_active`, `has_dependents`, `archived` |
| `PATCH /api/stories/:id/tasks/:taskId` | Changer le statut d'une tâche | 404 `task_not_found` |
| `POST /api/stories/:id/tasks` | Ajouter une tâche à faire (`title`) | 409 `task_exists` |
| `POST /api/sprints` | Créer un sprint planifié | 409 `sprint_exists` |
| `POST /api/sprints/:id/start` | Démarrer un sprint | 409 `sprint_already_active`, `sprint_closed`, `conflict` |
| `POST /api/sprints/:id/close` | Clôturer un sprint (`carry_over` : `backlog` ou un identifiant de sprint) | 409 `not_active`, `sprint_not_found`, `conflict` |
| `PUT /api/settings/wip` | Définir les limites WIP (statut → 1..99 ou `null`) | 400 `invalid_payload` |

Erreurs communes à toutes les écritures : 400 `invalid_json` / `invalid_payload`, 403 `forbidden` / `readonly`, 404 `not_found`, 413 `payload_too_large`, 423 `locked`, 500 `write_failed`. Les modifications sont poussées aux navigateurs ouverts par `/api/events`.

### Raccourcis clavier (Board)

| Touche | Action |
|--------|--------|
| `↑` `↓` | Naviguer entre les cartes |
| `←` `→` | Changer de colonne |
| `Alt+M` | Ouvrir le menu de déplacement de la carte active |
| `1`-`6` | Déplacer la carte vers cette colonne (menu ouvert) |
| `Entrée` | Ouvrir le détail de la story |
| `Échap` | Fermer le menu ou la fenêtre |
| `Ctrl+K` (`⌘+K`) ou `/` | Rechercher une story |

Les raccourcis sont facultatifs : toutes les actions restent accessibles avec `Tab` et les boutons natifs.

### Exemples

```bash
# Lance sur le projet courant et ouvre le navigateur
npx @the-bearded-bear/claude-craft kanban --open

# Mode lecture seule
npx @the-bearded-bear/claude-craft kanban --readonly --port=4040
```

---

## Fichier de Configuration

### Configuration YAML

Pour les monorepos et configurations multi-projets, utilisez `claude-projects.yaml` :

```yaml
settings:
  default_lang: "fr"

projects:
  - name: "mon-monorepo"
    description: "Mon application fullstack"
    root: "~/Projets/mon-monorepo"
    lang: "fr"
    common: true
    modules:
      - path: "frontend"
        tech: react
      - path: "backend"
        tech: symfony
      - path: "mobile"
        tech: flutter
      - path: "api"
        tech: [python, react]  # Technologies multiples
```

### Variables d'Environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `CLAUDE_CRAFT_LANG` | Langue par défaut | `en` |
| `CLAUDE_CRAFT_TARGET` | Répertoire cible par défaut | `.` |
| `CLAUDE_CRAFT_CONFIG` | Chemin du fichier de config | `claude-projects.yaml` |

---

## Codes de Sortie

| Code | Signification |
|------|---------------|
| 0 | Succès |
| 1 | Erreur générale |
| 2 | Arguments invalides |
| 3 | Prérequis manquants |
| 4 | Répertoire cible non trouvé |
| 5 | Permission refusée |

---

## Dépannage

### Problèmes de cache NPX

```bash
# Vider le cache NPX
npx clear-npx-cache
# ou
rm -rf ~/.npm/_npx
```

### Script non exécutable

```bash
chmod +x Dev/scripts/*.sh
# ou
make fix-permissions
```

### Mauvaise version de yq

```bash
# Claude Craft nécessite yq v4 (version de Mike Farah)
yq --version
# Doit afficher : yq (https://github.com/mikefarah/yq/) version v4.x.x
```

---

## Optimisation des Tokens (RTK)

### Configuration Automatique

```bash
# Dans Claude Code, configurez toutes les optimisations en une commande
/common:setup-rtk
```

### Commandes RTK

| Commande | Description |
|----------|-------------|
| `rtk gain` | Afficher les économies de tokens |
| `rtk gain --history` | Historique des commandes avec économies |
| `rtk discover` | Analyser l'historique pour les opportunités manquées |
| `rtk proxy <cmd>` | Exécuter une commande sans filtrage (debug) |
| `rtk --version` | Vérifier la version installée |

### Commandes de Contexte Claude Code

| Commande | Description |
|----------|-------------|
| `/effort low\|medium\|high` | Ajuster le niveau d'effort du modèle |
| `/context` | Suggestions d'optimisation du contexte |
| `/compact` | Compacter proactivement le contexte |
| `/clear` | Nettoyer entre tâches non liées |
| `/memory` | Apprentissages persistants (v2.1.59+) |
| `/loop <intervalle> <cmd>` | Tâches récurrentes (v2.1.71+) |
| `/model haiku\|sonnet\|opus` | Changer de modèle en session |

---

## Voir Aussi

- [Guide de Démarrage Rapide](QUICKSTART.md)
- [Prérequis](PREREQUISITES.md)
- [Guide d'Installation](../INSTALLATION.md)
- [Référence des Commandes](../COMMANDS-FULL-REFERENCE.md)

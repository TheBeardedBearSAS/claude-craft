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

## Voir Aussi

- [Guide de Démarrage Rapide](QUICKSTART.md)
- [Prérequis](PREREQUISITES.md)
- [Guide d'Installation](../INSTALLATION.md)
- [Référence des Commandes](../COMMANDS-FULL-REFERENCE.md)

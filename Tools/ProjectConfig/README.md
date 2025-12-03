# Claude Projects Manager

Script interactif pour gérer les projets dans `claude-projects.yaml`.

## Aperçu

```
╔════════════════════════════════════════════════════════════╗
║     📁 Claude Projects Manager                            ║
╚════════════════════════════════════════════════════════════╝

ℹ Fichier de configuration: ~/.claude/claude-projects.yaml

Que veux-tu faire ?

  1) 📋 Lister les projets
  2) ➕ Ajouter un projet
  3) ✏️  Modifier un projet
  4) 📦 Ajouter un module
  5) 🗑️  Supprimer un projet
  6) ✅ Valider la configuration
  7) 📄 Changer de fichier config
  q) Quitter
```

## Installation

```bash
# Via Makefile
make install-projectconfig

# Ou manuellement
cp claude-projects.sh ~/.local/bin/claude-projects
chmod +x ~/.local/bin/claude-projects
```

## Prérequis

```bash
# yq est requis pour manipuler le YAML
sudo apt install yq      # Debian/Ubuntu
brew install yq          # macOS
```

## Utilisation

### Mode interactif (menu)

```bash
claude-projects
```

### Mode CLI (commandes directes)

```bash
# Lister les projets
claude-projects list

# Ajouter un projet
claude-projects add

# Modifier un projet
claude-projects edit

# Ajouter un module
claude-projects module

# Supprimer un projet
claude-projects delete

# Valider la configuration
claude-projects validate
```

### Spécifier un fichier de configuration

```bash
claude-projects -c ./my-projects.yaml list
claude-projects --config ~/custom.yaml add
```

## Fichier de configuration

Le script gère automatiquement les fichiers `claude-projects.yaml` :

```yaml
settings:
  default_mode: "install"
  backup: true

projects:
  - name: "mon-projet"
    description: "Description du projet"
    root: "~/Projects/mon-projet"
    common: true
    modules:
      - path: "frontend"
        tech: react
      - path: "backend"
        tech: symfony
```

## Technologies supportées

| Tech | Description |
|------|-------------|
| `symfony` | Backend PHP avec Symfony |
| `flutter` | Application mobile Flutter/Dart |
| `python` | Backend/API Python |
| `react` | Frontend React/Next.js |
| `reactnative` | Application mobile React Native |

## Exemples

### Créer un projet monorepo

```bash
claude-projects add
# Nom: ecommerce
# Description: Plateforme e-commerce
# Chemin: ~/Projects/ecommerce
# Common: Oui
# Modules:
#   - frontend → react
#   - backend → symfony
#   - mobile → reactnative
```

### Valider avant installation

```bash
claude-projects validate

# Puis installer avec make
make config-install PROJECT=ecommerce
```

## Intégration avec le Makefile

Après configuration, utilise le Makefile pour installer :

```bash
# Installer un projet spécifique
make config-install PROJECT=mon-projet

# Installer tous les projets
make config-install-all

# Simulation
make config-dry-run PROJECT=mon-projet
```

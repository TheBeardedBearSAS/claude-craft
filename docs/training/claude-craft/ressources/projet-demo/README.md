# Projet de Démonstration - Formation Claude Code + Claude-Craft

## Description

Ce projet sert de base pour les exercices pratiques de la formation.

## Prérequis

- PHP 8.5+
- Composer
- Symfony CLI (optionnel)
- Docker (recommandé - utilisé pour toutes les commandes)
- Chrome avec extension Claude Code (v1.0.36+) pour QA Recette

## Installation

```bash
# Cloner le projet (si fourni séparément)
git clone [url] projet-demo
cd projet-demo

# Installer les dépendances (via Docker)
docker compose exec app composer install

# Installer Claude-Craft
cd ~/claude-craft
make install-symfony TARGET=[chemin]/projet-demo LANG=fr
```

## Docker

> **Règle CLAUDE.md** : Toujours utiliser Docker pour les commandes afin de s'abstraire de l'environnement local.

```bash
# Lancer l'environnement
docker compose up -d

# Exécuter les commandes via Docker
docker compose exec app php bin/console ...
docker compose exec app ./vendor/bin/phpunit
docker compose exec app ./vendor/bin/phpstan analyse
```

## Structure

```
projet-demo/
├── .claude/                 # Claude-Craft installé
├── .bmad/                   # BMAD v6 project management
│   ├── backlog/
│   ├── sprints/
│   └── docs/
├── .recette/                # QA Recette sessions
│   ├── plans/
│   ├── sessions/
│   ├── regression/
│   └── reports/
├── src/
│   ├── Controller/
│   ├── Entity/
│   └── Service/
├── tests/
├── config/
├── docker-compose.yml
└── composer.json
```

## Utilisation pendant la formation

### Module 1-2 : Découverte

```bash
cd projet-demo
claude
# Explorer les commandes et agents
```

### Module 3 : Workflow

```bash
/workflow:init "Ajouter une feature X"
```

### Module 4 : Génération

```bash
/symfony:generate-feature Product
```

### Module 5 : Audit

```bash
/symfony:check-compliance
```

### Module 8 : Démos Avancées

```bash
# Ralph Wiggum demo
/common:ralph-run "Fix all PHPStan level 8 errors"

# QA Recette demo
/qa:recette --scope=story --id=US-1 --dry-run

# Workflow demo
/workflow:init
/workflow:status
```

## Réinitialisation

Pour revenir à l'état initial :

```bash
git checkout .
git clean -fd
```

## Notes

- Ce projet contient volontairement des "mauvaises pratiques" pour les exercices d'audit
- Les corrections doivent être faites pendant les ateliers
- Ne pas pousser les modifications sur le repo d'origine

---

**Formation Claude Code + Claude-Craft**
**The Bearded CTO**

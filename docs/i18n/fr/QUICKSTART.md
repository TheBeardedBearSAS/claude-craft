# Démarrage Rapide - Claude Craft en 5 Minutes

Soyez opérationnel avec Claude Craft en seulement 5 minutes !

---

## Vérification des Prérequis

Avant de commencer, vérifiez que ces outils sont installés :

```bash
# Vérifier Node.js (20+ requis)
node --version

# Vérifier npm
npm --version

# Vérifier yq (requis pour la config YAML)
yq --version

# Vérifier Docker (recommandé)
docker --version
```

**Il vous manque quelque chose ?** Consultez le [Guide des Prérequis](PREREQUISITES.md) pour les instructions d'installation.

---

## Script de Vérification Automatique

Exécutez ceci pour vérifier tous les prérequis en une fois :

```bash
# Télécharger et exécuter le script de vérification
curl -sSL https://raw.githubusercontent.com/TheBeardedBearSAS/claude-craft/main/Dev/scripts/check-prerequisites.sh | bash

# Ou si vous avez cloné le dépôt
./Dev/scripts/check-prerequisites.sh
```

---

## Installation

### Méthode 1 : NPX (Recommandée)

La méthode la plus rapide :

```bash
# Assistant interactif
npx @the-bearded-bear/claude-craft

# Ou installer directement dans un projet
npx @the-bearded-bear/claude-craft install ~/mon-projet --tech=symfony --lang=fr
```

### Méthode 2 : Clone + Makefile

```bash
# 1. Cloner le dépôt
git clone https://github.com/TheBeardedBearSAS/claude-craft.git
cd claude-craft

# 2. Installer dans votre projet (choisissez votre technologie)
make install-symfony TARGET=~/mon-projet RULES_LANG=fr
# Ou : make install-flutter, make install-react, make install-python, etc.
```

---

## Votre Premier Projet en 3 Commandes

```bash
# 1. Créer un nouveau répertoire de projet
mkdir ~/ma-premiere-app && cd ~/ma-premiere-app && git init

# 2. Installer les règles Claude Craft (exemple : Symfony + Français)
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=fr

# 3. Lancer Claude Code
claude
```

C'est tout ! Vous avez maintenant accès à toutes les fonctionnalités de Claude Craft.

---

## Vérifier l'Installation

Vérifiez que tout est correctement installé :

```bash
# Lister les fichiers installés
ls -la ~/ma-premiere-app/.claude/

# Vous devriez voir :
# CLAUDE.md          - Configuration principale
# INDEX.md           - Référence rapide
# references/        - Documentation complète
# agents/            - Spécialistes IA
# commands/          - Commandes slash
# skills/            - Bonnes pratiques
```

---

## Essayez Vos Premières Commandes

Dans Claude Code, essayez ces commandes :

```
# Vérifier l'architecture de votre projet
/symfony:check-architecture

# Obtenir une revue de code
@symfony-reviewer Passe en revue mon dossier src/

# Générer une nouvelle entité avec CRUD
/symfony:generate-crud Produit
```

---

## Et Ensuite ?

| Tâche | Guide |
|-------|-------|
| Comprendre la structure du projet | [Guide d'Architecture](../ARCHITECTURE.md) |
| Créer une fonctionnalité complète | [Développement de Fonctionnalités](../guides/fr/03-feature-development.md) |
| Configurer la gestion de projet BMAD | [Guide Pratique BMAD](../BMAD-PRACTICAL-GUIDE.md) |
| Exécuter Claude en boucle continue | [Guide Ralph Wiggum](../RALPH-GUIDE.md) |
| Corriger un bug avec TDD | [Guide de Correction de Bugs](../guides/fr/04-bug-fixing.md) |

---

## Technologies Disponibles

Claude Craft supporte **11 stacks applicatifs** (+ 8 stacks d'infrastructure). Voici les principaux stacks de développement :

| Technologie | Commande d'Installation | Focus |
|-------------|-------------------------|-------|
| Symfony/PHP | `make install-symfony` | Clean Architecture, DDD, API Platform |
| Flutter/Dart | `make install-flutter` | BLoC, Riverpod, Material/Cupertino |
| React | `make install-react` | Hooks, State Management, A11y |
| React Native | `make install-reactnative` | Mobile, Navigation, Modules Natifs |
| Python | `make install-python` | FastAPI, async/await, Type Hints |
| Angular | `make install-angular` | Signals, Standalone, RxJS |
| C#/.NET | `make install-csharp` | Clean Architecture, CQRS, MediatR |
| Laravel | `make install-laravel` | Clean Architecture, Pest PHP |
| Vue.js | `make install-vuejs` | Composition API, Pinia, Vitest |
| PHP | `make install-php` | Clean Architecture, PSR-12, PHPStan |

**Stacks d'infrastructure :** Docker, Coolify, Kubernetes, OpenTofu, Ansible, Hetzner Cloud, PgBouncer, FrankenPHP

---

## Optimisation des Tokens

Après l'installation, configurez l'optimisation des tokens pour réduire vos coûts de 55-65% :

```bash
# Dans Claude Code
/common:setup-rtk
```

---

## Besoin d'Aide ?

- **FAQ** : Questions et réponses courantes → [FAQ.md](FAQ.md)
- **Dépannage** : Erreurs courantes et solutions → [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Documentation Complète** : Toutes les commandes et agents → [COMMANDS-FULL-REFERENCE.md](../COMMANDS-FULL-REFERENCE.md)
- **Issues GitHub** : [Signaler un bug](https://github.com/TheBeardedBearSAS/claude-craft/issues)

---

## Carte de Référence Rapide

```
┌────────────────────────────────────────────────────────────┐
│                   AIDE-MÉMOIRE CLAUDE CRAFT                │
├────────────────────────────────────────────────────────────┤
│ INSTALLATION                                               │
│   npx @the-bearded-bear/claude-craft install . --tech=X   │
│   make install-{tech} TARGET=~/projet RULES_LANG=fr       │
├────────────────────────────────────────────────────────────┤
│ COMMANDES COURANTES (204+ disponibles)                     │
│   /common:pre-commit-check    Validation avant commit      │
│   /common:setup-rtk           Optimisation tokens (RTK)    │
│   /team:audit                 Audit multi-tech du projet   │
│   /workflow:init              Démarrer la méthodologie     │
├────────────────────────────────────────────────────────────┤
│ AGENTS UTILES                                              │
│   @tdd-coach                  Guidance TDD                 │
│   @api-designer               Aide à la conception d'API   │
│   @{tech}-reviewer            Revue de code pour votre tech│
├────────────────────────────────────────────────────────────┤
│ BESOIN D'AIDE ?                                            │
│   /help                       Aide intégrée Claude Code    │
│   Voir docs/FAQ.md            Questions fréquentes         │
└────────────────────────────────────────────────────────────┘
```

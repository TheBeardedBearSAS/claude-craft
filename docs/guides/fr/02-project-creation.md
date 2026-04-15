# Guide de Création de Projet

Ce guide vous accompagne dans la configuration d'un nouveau projet avec Claude-Craft, du choix de la stack technologique à la configuration de votre environnement de développement.

---

## Table des Matières

1. [Choisir Votre Technologie](#choisir-votre-technologie)
2. [Méthodes d'Installation](#méthodes-dinstallation)
3. [Projets Mono-Technologie](#projets-mono-technologie)
4. [Projets Monorepo](#projets-monorepo)
5. [Configuration Post-Installation](#configuration-post-installation)
6. [Checklist de Démarrage](#checklist-de-démarrage)

---

## Choisir Votre Technologie

### Comparatif des Technologies

Claude-Craft supporte **19 stacks technologiques** (10 dev + 8 infra) :

#### Stacks de Développement

| Technologie | Idéal Pour | Architecture | Caractéristiques Clés |
|-------------|------------|--------------|----------------------|
| **C# / .NET** | APIs backend, Enterprise | Clean Architecture | CQRS, MediatR, EF Core |
| **Symfony / PHP** | APIs backend, Apps web | Clean Architecture + DDD | Doctrine, Messenger, API Platform |
| **Laravel / PHP** | Apps web, APIs rapides | Clean Architecture | Actions, Pest PHP, Sanctum |
| **PHP** | Clean Architecture générique | Clean Architecture | PSR-12, PHPStan, Pest PHP |
| **Flutter / Dart** | Apps mobiles | Feature-based + BLoC | Material/Cupertino, Gestion d'état |
| **Python** | APIs, Services data | Clean Architecture | FastAPI, async/await, Pydantic |
| **React** | SPAs web | Feature-based + Hooks | Zustand, React Query, accessibilité |
| **React Native** | Mobile cross-platform | Feature-based | Navigation 7, Reanimated 4 |
| **Angular** | Apps d'entreprise | Domain-driven | Signals, Standalone, RxJS |
| **Vue.js** | SPAs web | Composition API | Pinia, Vitest, TypeScript |

#### Stacks d'Infrastructure

Docker, Coolify, Kubernetes, OpenTofu, Ansible, Hetzner Cloud, PgBouncer, FrankenPHP

### Choix selon le Type de Projet

| Type de Projet | Stack Recommandée |
|----------------|-------------------|
| API REST | Symfony, Laravel ou Python |
| App mobile (feel natif) | Flutter |
| App mobile (équipe JS) | React Native |
| SPA Web | React, Vue.js ou Angular |
| Full-stack web | Symfony + React |
| Full-stack mobile | Symfony + Flutter |
| Microservices | Python (FastAPI) |
| Enterprise | C# / .NET ou Angular |

### Combinaisons Courantes

```
Application Web:      Symfony (backend) + React (frontend)
Application Mobile:   Symfony (API) + Flutter (mobile)
Plateforme Complète:  Symfony (API) + React (web) + Flutter (mobile)
Plateforme Data:      Python (API) + React (dashboard)
Enterprise:           C# / .NET (backend) + Angular (frontend)
API Laravel:          Laravel (backend) + Vue.js (frontend)
```

---

## Méthodes d'Installation

Claude-Craft offre plusieurs méthodes d'installation selon vos workflows.

### Méthode 1 : Makefile (Recommandée)

L'approche la plus simple et flexible.

```bash
# Syntaxe de base
make install-{technologie} TARGET=chemin LANG=langue

# Exemples
make install-symfony TARGET=./backend LANG=fr
make install-flutter TARGET=./mobile LANG=fr
make install-python TARGET=./api LANG=es
make install-react TARGET=./frontend LANG=de
make install-reactnative TARGET=./app LANG=pt
```

#### Options Disponibles

| Option | Description | Exemple |
|--------|-------------|---------|
| `TARGET` | Chemin d'installation | `TARGET=~/projets/monapp` |
| `LANG` | Code langue | `LANG=fr` |
| `OPTIONS` | Flags additionnels | `OPTIONS="--force --backup"` |

#### Flags d'Options

```bash
# Prévisualiser sans appliquer
make install-symfony TARGET=./backend OPTIONS="--dry-run"

# Forcer l'écrasement (crée une sauvegarde)
make install-symfony TARGET=./backend OPTIONS="--force"

# Créer une sauvegarde avant installation
make install-symfony TARGET=./backend OPTIONS="--backup"

# Mode interactif (demande les infos projet)
make install-symfony TARGET=./backend OPTIONS="--interactive"

# Mise à jour uniquement (préserve les fichiers spécifiques)
make install-symfony TARGET=./backend OPTIONS="--update"
```

### Méthode 2 : Exécution Directe des Scripts

Exécutez les scripts d'installation directement pour plus de contrôle.

```bash
# Syntaxe
./Dev/scripts/install-{technologie}-rules.sh [OPTIONS] [TARGET]

# Exemples
./Dev/scripts/install-symfony-rules.sh --lang=fr ~/mon-projet
./Dev/scripts/install-flutter-rules.sh --lang=en --dry-run .
./Dev/scripts/install-python-rules.sh --force --backup ~/api
```

#### Options des Scripts

```bash
--lang=XX       # Langue (en, fr, es, de, pt)
--install       # Mode installation complète
--update        # Mise à jour des règles communes uniquement
--force         # Écraser tous les fichiers
--dry-run       # Prévisualiser sans modifier
--backup        # Créer une sauvegarde d'abord
--interactive   # Demander les infos projet
--help          # Afficher l'aide
--version       # Afficher la version
```

### Méthode 3 : Configuration YAML

Idéal pour les monorepos et configurations multi-projets.

```bash
# Créer la configuration
cp claude-projects.yaml.example claude-projects.yaml

# Éditer la configuration
nano claude-projects.yaml

# Valider la configuration
make config-validate CONFIG=claude-projects.yaml

# Installer un projet spécifique
make config-install CONFIG=claude-projects.yaml PROJECT=mon-projet

# Installer tous les projets
make config-install-all CONFIG=claude-projects.yaml
```

---

## Projets Mono-Technologie

### Projet Symfony

```bash
# Créer le répertoire projet
mkdir ~/mon-api-symfony
cd ~/mon-api-symfony
composer create-project symfony/skeleton .
git init

# Installer les règles Claude-Craft
make install-symfony TARGET=. LANG=fr

# Vérifier l'installation
ls -la .claude/
```

**Contenu installé :**
- 21 règles spécifiques Symfony (Clean Architecture, DDD, CQRS, etc.)
- 10+ commandes Symfony (`/symfony:generate-crud`, `/symfony:check-compliance`, etc.)
- Agent reviewer Symfony
- Templates de code (Service, ValueObject, Aggregate, etc.)
- Checklists qualité

### Projet Flutter

```bash
# Créer le projet
flutter create mon_app_flutter
cd mon_app_flutter
git init

# Installer les règles Claude-Craft
make install-flutter TARGET=. LANG=fr

# Vérifier
ls -la .claude/
```

**Contenu installé :**
- 13 règles spécifiques Flutter (BLoC, gestion d'état, tests)
- 10 commandes Flutter
- Agent reviewer Flutter
- Templates Widget et BLoC
- Checklists qualité

### Projet Python

```bash
# Créer le projet
mkdir ~/mon-api-python
cd ~/mon-api-python
python -m venv venv
git init

# Installer les règles Claude-Craft
make install-python TARGET=. LANG=fr

# Vérifier
ls -la .claude/
```

**Contenu installé :**
- 12 règles spécifiques Python (FastAPI, async, typing)
- 10 commandes Python
- Agent reviewer Python
- Templates Service et API
- Checklists qualité

### Projet React

```bash
# Créer le projet
npx create-react-app mon-app-react
cd mon-app-react

# Installer les règles Claude-Craft
make install-react TARGET=. LANG=fr

# Vérifier
ls -la .claude/
```

### Projet React Native

```bash
# Créer le projet
npx react-native init MonApp
cd MonApp

# Installer les règles Claude-Craft
make install-reactnative TARGET=. LANG=fr

# Vérifier
ls -la .claude/
```

---

## Projets Monorepo

### Comprendre la Structure Monorepo

Un monorepo typique ressemble à :

```
ma-plateforme/
├── backend/          # API Symfony
├── web/              # Frontend React
├── mobile/           # App Flutter
├── shared/           # Types/contrats partagés
└── claude-projects.yaml
```

### Structure de Configuration YAML

```yaml
# claude-projects.yaml

settings:
  default_lang: "fr"              # Langue par défaut pour tous les projets
  claude_craft_path: "~/claude-craft"  # Chemin vers claude-craft (optionnel)

projects:
  - name: "ma-plateforme"
    description: "Plateforme SaaS full-stack"
    path: "~/Projets/ma-plateforme"
    modules:
      - name: "api"
        path: "backend"
        technologies: ["symfony"]
        lang: "en"                # Surcharge la langue par défaut

      - name: "web"
        path: "web"
        technologies: ["react"]

      - name: "mobile"
        path: "mobile"
        technologies: ["flutter"]
```

### Champs de Configuration

#### Niveau Projet

| Champ | Requis | Description |
|-------|--------|-------------|
| `name` | Oui | Identifiant du projet |
| `description` | Non | Description du projet |
| `path` | Oui | Chemin absolu vers la racine du projet |
| `lang` | Non | Surcharge de langue |
| `modules` | Non | Liste des modules (pour monorepos) |
| `technologies` | Non | Technologies si pas de modules |

#### Niveau Module

| Champ | Requis | Description |
|-------|--------|-------------|
| `name` | Oui | Identifiant du module |
| `path` | Oui | Chemin relatif depuis la racine projet |
| `technologies` | Oui | Liste des technologies |
| `lang` | Non | Surcharge de langue |
| `skip_common` | Non | Ignorer les règles communes (défaut: false) |

### Commandes d'Installation

```bash
# Valider la configuration
make config-validate CONFIG=claude-projects.yaml

# Lister les projets configurés
make config-list CONFIG=claude-projects.yaml

# Installer un projet spécifique
make config-install CONFIG=claude-projects.yaml PROJECT=ma-plateforme

# Installer un module spécifique
make config-install CONFIG=claude-projects.yaml PROJECT=ma-plateforme MODULE=api

# Dry-run pour prévisualiser
make config-install CONFIG=claude-projects.yaml PROJECT=ma-plateforme OPTIONS="--dry-run"

# Installer tous les projets
make config-install-all CONFIG=claude-projects.yaml
```

### Exemples Concrets

#### Exemple 1 : Plateforme SaaS

```yaml
projects:
  - name: "plateforme-saas"
    path: "~/Projets/saas"
    modules:
      - name: "api"
        path: "services/api"
        technologies: ["symfony"]
      - name: "admin"
        path: "apps/admin"
        technologies: ["react"]
      - name: "mobile"
        path: "apps/mobile"
        technologies: ["flutter"]
```

#### Exemple 2 : Microservices

```yaml
projects:
  - name: "microservices"
    path: "~/Projets/micro"
    modules:
      - name: "gateway"
        path: "gateway"
        technologies: ["python"]
      - name: "users"
        path: "services/users"
        technologies: ["symfony"]
      - name: "orders"
        path: "services/orders"
        technologies: ["symfony"]
      - name: "analytics"
        path: "services/analytics"
        technologies: ["python"]
```

#### Exemple 3 : Projets Indépendants Multiples

```yaml
settings:
  default_lang: "fr"

projects:
  - name: "client-a"
    path: "~/Clients/client-a"
    technologies: ["symfony", "react"]

  - name: "client-b"
    path: "~/Clients/client-b"
    technologies: ["flutter"]
    lang: "en"

  - name: "outil-interne"
    path: "~/Interne/outil"
    technologies: ["python"]
```

---

## Configuration Post-Installation

Après l'installation, configurez ces fichiers pour votre projet spécifique.

### 1. Contexte Projet (`rules/00-project-context.md`)

C'est le fichier le plus important à personnaliser. Il informe Claude sur votre projet spécifique.

**Option A : Configuration Interactive (Recommandée)**

Exécutez cette commande dans Claude Code pour détecter votre stack et répondre à des questions ciblées :
```bash
/common:setup-project-context
```

**Option B : Configuration Manuelle**

Éditez le fichier directement avec les détails de votre projet :

```markdown
# Contexte Projet

## Informations Projet
- **Nom** : Mon API E-commerce
- **Type** : API REST pour plateforme e-commerce
- **Taille équipe** : 3 développeurs

## Stack Technique
- PHP 8.3 avec Symfony 7.0
- PostgreSQL 16
- Redis pour le cache
- RabbitMQ pour la messagerie

## Conventions
- Standard de codage PSR-12
- Typage strict activé
- Code en anglais, documentation en français

## Contraintes
- Conformité RGPD requise
- Architecture multi-tenant obligatoire
- Temps de réponse maximum : 200ms

## Dépendances Externes
- Stripe pour les paiements
- SendGrid pour les emails
- S3 pour le stockage de fichiers
```

### 2. Configuration Principale (`CLAUDE.md`)

Le fichier CLAUDE.md dans `.claude/` contient la configuration principale. Sections clés à revoir :

```markdown
# Configuration Projet

## Paramètres de Langue
- Code : Anglais
- Documentation : Français
- Commentaires : Anglais

## Architecture
Clean Architecture + DDD + Hexagonal

## Exigences Qualité
- Couverture de tests : 80%+
- Niveau PHPStan : 9
- Aucun problème de sécurité critique

## Exigences Docker
Toutes les commandes doivent utiliser Docker via les cibles make.
```

### 3. Configuration des Agents

Revoyez les agents installés dans `.claude/agents/` et personnalisez si nécessaire :

```bash
ls .claude/agents/
# api-designer.md
# database-architect.md
# symfony-reviewer.md
# tdd-coach.md
# ...
```

---

## Checklist de Démarrage

Utilisez cette checklist lors de la configuration d'un nouveau projet :

### Pré-Installation

- [ ] Répertoire projet créé
- [ ] Dépôt Git initialisé
- [ ] Stack technologique décidée
- [ ] Préférence de langue choisie

### Installation

- [ ] Règles Claude-Craft installées
- [ ] Installation vérifiée (`ls .claude/`)
- [ ] Pas d'erreurs dans la sortie d'installation

### Configuration

- [ ] `00-project-context.md` personnalisé avec les détails du projet
- [ ] `CLAUDE.md` revu et ajusté
- [ ] Conventions de l'équipe documentées
- [ ] Contraintes et exigences listées

### Vérification

- [ ] Claude Code démarré dans le répertoire projet
- [ ] Commandes disponibles (essayer `/symfony:check-compliance`)
- [ ] Agents répondent (essayer `@symfony-reviewer bonjour`)

### Configuration Équipe

- [ ] Répertoire `.claude/` commité dans git
- [ ] Membres de l'équipe informés des commandes disponibles
- [ ] README mis à jour avec les infos d'utilisation Claude-Craft

---

## Patterns Courants

### Installer Uniquement les Règles Communes

Pour les bibliothèques partagées ou packages qui ne correspondent pas à une technologie spécifique :

```bash
make install-common TARGET=./lib-partagee LANG=fr
```

### Installer les Outils de Gestion de Projet

Pour le suivi de sprint et la gestion du backlog :

```bash
make install-project TARGET=. LANG=fr
```

### Installer les Outils d'Infrastructure

Pour le support Docker et CI/CD :

```bash
make install-infra TARGET=. LANG=fr
```

### Installation Complète (Toutes Technologies)

```bash
make install-all TARGET=. LANG=fr
```

---

## Mise à Jour des Règles

Quand Claude-Craft publie de nouvelles versions :

```bash
# Mettre à jour vers la dernière (préserve les fichiers spécifiques)
make install-symfony TARGET=./backend OPTIONS="--update"

# Forcer la réinstallation complète (sauvegarde créée automatiquement)
make install-symfony TARGET=./backend OPTIONS="--force"
```

---

## Prochaines Étapes

Votre projet est maintenant configuré ! Continuez avec :

1. **[Guide de Développement de Fonctionnalités](03-feature-development.md)** - Apprenez le workflow TDD
2. **[Guide de Correction de Bugs](04-bug-fixing.md)** - Gérez les bugs efficacement
3. **[Référence des Outils](05-tools-reference.md)** - Explorez les outils additionnels

---

[&larr; Démarrage](01-getting-started.md) | [Développement de Fonctionnalités &rarr;](03-feature-development.md)

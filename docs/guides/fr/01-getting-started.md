# Démarrage avec Claude-Craft

Bienvenue dans Claude-Craft ! Ce guide vous aidera à comprendre ce qu'est Claude-Craft et à démarrer votre premier projet en seulement 5 minutes.

---

## Qu'est-ce que Claude-Craft ?

Claude-Craft est un framework complet pour le développement assisté par IA avec Claude Code. Il fournit :

- **125 Commandes Slash** - Actions rapides sur 15 namespaces pour la génération de code, l'analyse et les vérifications qualité
- **70 Agents IA (31 spécialisés + 39 infra à la demande)** - Assistants spécialisés pour différentes tâches (conception d'API, architecture, revue de code, DevOps, etc.)
- **11 Stacks Technologiques** - De .NET/C# à Vue.js, avec des règles et agents dédiés
- **55 skills** - Bonnes pratiques pour l'architecture, les tests, la sécurité et la qualité du code
- **21 Templates** - Patterns de code prêts à l'emploi pour les composants courants
- **10 Checklists** - Portes qualité pour les fonctionnalités, releases et audits de sécurité

### Technologies Supportées

| Technologie | Focus | Cas d'Usage |
|-------------|-------|-------------|
| **Symfony / PHP** | Clean Architecture + DDD | APIs, Apps web, Services backend |
| **React** | Hooks + State Management | SPAs web, Dashboards |
| **Flutter / Dart** | Pattern BLoC | Apps mobiles (iOS/Android) |
| **Python** | FastAPI + async/await | APIs, Services data, Backends ML |
| **Angular** | Signals + Standalone | SPAs enterprise |
| **Vue.js** | Composition API + Pinia | SPAs web, Dashboards |
| **React Native** | New Architecture | Apps mobiles cross-platform |
| **C# / .NET** | Clean Architecture + CQRS | APIs enterprise, Microservices |
| **Laravel** | Actions Pattern | APIs, CMS, E-commerce |
| **PHP** | PSR-12 + PHPStan | Librairies, APIs |
| **Docker** | Conteneurisation | Dev local, CI/CD |
| **Coolify** | PaaS auto-hébergé | Déploiements simples |
| **Kubernetes** | Orchestration | Microservices, Scale |
| **OpenTofu** | IaC | Multi-cloud |
| **Ansible** | Automation | Configuration management |
| **Hcloud** | Hetzner Cloud | Hébergement européen |
| **PgBouncer** | Connection pooling | PostgreSQL haute charge |
| **FrankenPHP** | Serveur PHP/Go | Performance PHP |

### Langues Supportées

Tout le contenu est disponible en 5 langues :
- Anglais (en)
- Français (fr)
- Espagnol (es)
- Allemand (de)
- Portugais (pt)

---

## Prérequis

### Obligatoires

- **Bash** - Shell pour exécuter les scripts d'installation
- **Claude Code** - L'assistant de codage IA d'Anthropic

### Optionnels (Recommandés)

- **yq** - Processeur YAML pour les fichiers de configuration
  ```bash
  # macOS
  brew install yq

  # Linux (Debian/Ubuntu)
  sudo apt install yq

  # Linux (snap)
  sudo snap install yq
  ```

- **jq** - Processeur JSON (pour l'outil StatusLine)
  ```bash
  # macOS
  brew install jq

  # Linux
  sudo apt install jq
  ```

---

## Installation Rapide

### Méthode 1 : Makefile (Recommandée)

```bash
# Cloner Claude-Craft
git clone https://github.com/TheBeardedBearSAS/claude-craft.git
cd claude-craft

# Installer pour un projet Symfony (en français)
make install-symfony TARGET=~/mon-projet RULES_LANG=fr

# Ou pour un projet Flutter (en anglais)
make install-flutter TARGET=~/mon-app RULES_LANG=en
```

### Méthode 2 : Script Direct

```bash
# Naviguer vers Claude-Craft
cd claude-craft

# Exécuter le script d'installation
./Dev/scripts/install-symfony-rules.sh --lang=fr ~/mon-projet
```

### Méthode 3 : Configuration YAML (pour Monorepos)

```bash
# Créer le fichier de configuration
cp claude-projects.yaml.example claude-projects.yaml

# Éditer avec vos projets
nano claude-projects.yaml

# Installer depuis la configuration
make config-install CONFIG=claude-projects.yaml PROJECT=mon-projet
```

---

## Votre Premier Projet en 5 Minutes

Créons un nouveau projet API Symfony avec les règles en français.

### Étape 1 : Créer le Répertoire du Projet

```bash
mkdir ~/mon-api
cd ~/mon-api
git init
```

### Étape 2 : Installer les Règles Claude-Craft

```bash
# Depuis le répertoire claude-craft
make install-symfony TARGET=~/mon-api RULES_LANG=fr
```

### Étape 3 : Vérifier l'Installation

```bash
ls -la ~/mon-api/.claude/
```

Vous devriez voir :
```
.claude/
├── CLAUDE.md           # Configuration principale
├── rules/              # 21 fichiers de règles
├── agents/             # Agents IA
├── commands/           # Commandes slash
│   ├── common/         # Commandes transversales
│   └── symfony/        # Commandes spécifiques Symfony
├── templates/          # Templates de code
└── checklists/         # Portes qualité
```

### Étape 4 : Configurer le Contexte de Votre Projet

Vous pouvez configurer le contexte du projet de manière interactive ou manuelle :

**Option A : Interactive (Recommandée)**
```bash
cd ~/mon-api && claude
# Puis exécutez :
/common:setup-project-context
```

**Option B : Manuelle**
```bash
nano ~/mon-api/.claude/references/<your-tech>/project-context.md
```

Mettez à jour ces sections :
- Nom et description du projet
- Détails de la stack technique
- Conventions de l'équipe
- Contraintes spécifiques

### Étape 5 : Démarrer Claude Code

```bash
cd ~/mon-api
claude
```

Vous pouvez maintenant utiliser toutes les commandes et agents installés !

---

## Comment Claude Craft est-il structuré ?

### Règles (`rules/`)

Les règles sont des directives que Claude suit lorsqu'il travaille sur votre projet. Elles sont numérotées par priorité :

| Numéro | Sujet |
|--------|-------|
| 00 | Contexte projet (personnalisez celui-ci !) |
| 01 | Workflow et analyse |
| 02 | Architecture |
| 03 | Standards de codage |
| 04 | Principes SOLID |
| 05 | KISS, DRY, YAGNI |
| 06 | Docker et outillage |
| 07 | Tests |
| 08 | Outils qualité |
| 09 | Workflow Git |
| 10 | Documentation |
| 11 | Sécurité |
| 12+ | Sujets avancés (DDD, CQRS, etc.) |

### Agents (`agents/`)

Les agents sont des personas IA spécialisées que vous pouvez invoquer pour des tâches spécifiques :

```markdown
@api-designer Conçois l'API REST pour la gestion des utilisateurs
@database-architect Crée le schéma pour l'agrégat Commande
@symfony-reviewer Revois mon implémentation de UserService
@tdd-coach Aide-moi à écrire des tests pour le flux d'authentification
```

### Commandes (`commands/`)

Les commandes slash sont des actions rapides :

```bash
# Générer du code
/symfony:generate-crud User

# Vérifier la qualité
/symfony:check-compliance

# Analyser l'architecture
/common:architecture-decision
```

### Templates (`templates/`)

Les templates fournissent des patterns de code :
- `service.md` - Template de classe Service
- `value-object.md` - Template Value Object
- `aggregate-root.md` - Template Aggregate Root DDD
- `test-unit.md` - Template de test unitaire

### Checklists (`checklists/`)

Portes qualité pour différents scénarios :
- `feature-checklist.md` - Avant de terminer une fonctionnalité
- `pre-commit.md` - Avant de commiter du code
- `release.md` - Avant une release
- `security-audit.md` - Revue de sécurité

---

## Quels sont les concepts clés de Claude Craft ?

### 1. Workflow TDD

Claude-Craft impose le Développement Piloté par les Tests :

```
1. Analyser les besoins
2. Écrire les tests (en échec)
3. Implémenter le code
4. Refactoriser
5. Revoir
```

### 2. Clean Architecture

Toutes les stacks technologiques suivent les principes Clean Architecture :

```
┌─────────────────────────────────────┐
│           Présentation              │
├─────────────────────────────────────┤
│           Application               │
├─────────────────────────────────────┤
│             Domaine                 │
├─────────────────────────────────────┤
│          Infrastructure             │
└─────────────────────────────────────┘
```

### 3. Qualité d'Abord

Chaque fonctionnalité doit passer les portes qualité :
- 80%+ de couverture de tests
- Analyse statique validée
- Audit de sécurité passé
- Documentation mise à jour

---

## Prochaines Étapes

Maintenant que vous comprenez les bases, continuez avec :

1. **[Guide de Création de Projet](02-project-creation.md)** - Configuration détaillée pour différents scénarios
2. **[Guide de Développement de Fonctionnalités](03-feature-development.md)** - Workflow TDD avec agents et commandes
3. **[Guide de Correction de Bugs](04-bug-fixing.md)** - Workflow de diagnostic et tests de régression

---

## Référence Rapide

### Commandes Courantes

```bash
# Installation
make install-{tech} TARGET=chemin RULES_LANG=xx

# Lister les options disponibles
make help

# Valider la config YAML
make config-validate CONFIG=fichier.yaml
```

### Agents Utiles

| Agent | Objectif |
|-------|----------|
| `@api-designer` | Conception et documentation d'API |
| `@database-architect` | Conception de schémas BDD |
| `@tdd-coach` | Assistance à l'écriture de tests |
| `@{tech}-reviewer` | Revue de code pour une tech spécifique |

### Commandes Essentielles

| Commande | Objectif |
|----------|----------|
| `/common:analyze-feature` | Analyser les besoins |
| `/{tech}:generate-crud` | Générer du code CRUD |
| `/{tech}:check-compliance` | Audit qualité complet |
| `/common:security-audit` | Revue de sécurité |

---

[Suivant : Guide de Création de Projet &rarr;](02-project-creation.md)

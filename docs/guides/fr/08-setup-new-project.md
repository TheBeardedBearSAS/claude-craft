# Installation de Claude-Craft sur un Nouveau Projet

Ce tutoriel pas à pas vous guide à travers l'installation de Claude-Craft sur un tout nouveau projet. À la fin, vous aurez un environnement de développement entièrement configuré avec assistance IA.

**Temps requis :** ~10 minutes

---

## Table des Matières

1. [Liste des Prérequis](#1-liste-des-prérequis)
2. [Créer le Répertoire de Votre Projet](#2-créer-le-répertoire-de-votre-projet)
3. [Initialiser le Dépôt Git](#3-initialiser-le-dépôt-git)
4. [Choisir Votre Stack Technologique](#4-choisir-votre-stack-technologique)
5. [Installer Claude-Craft](#5-installer-claude-craft)
   - [Méthode A : NPX (Sans Clone Requis)](#méthode-a--npx-sans-clone-requis)
   - [Méthode B : Makefile (Plus de Contrôle)](#méthode-b--makefile-plus-de-contrôle)
6. [Vérifier l'Installation](#6-vérifier-linstallation)
7. [Configurer le Contexte du Projet](#7-configurer-le-contexte-du-projet)
8. [Premier Lancement avec Claude Code](#8-premier-lancement-avec-claude-code)
9. [Tester Votre Configuration](#9-tester-votre-configuration)
10. [Dépannage](#10-dépannage)
11. [Prochaines Étapes](#11-prochaines-étapes)

---

## 1. Liste des Prérequis

Avant de commencer, assurez-vous d'avoir les éléments suivants installés :

### Requis

- [ ] **Terminal/Ligne de Commande** - N'importe quelle application terminal
- [ ] **Node.js 16+** - Requis pour l'installation NPX
- [ ] **Git** - Pour le contrôle de version
- [ ] **Claude Code** - L'assistant de codage IA

### Vérifier Vos Prérequis

Ouvrez votre terminal et exécutez ces commandes :

```bash
# Vérifier la version de Node.js (doit être 16 ou supérieure)
node --version
```
Sortie attendue : `v16.x.x` ou supérieure (ex: `v20.10.0`)

```bash
# Vérifier la version de Git
git --version
```
Sortie attendue : `git version 2.x.x` (ex: `git version 2.43.0`)

```bash
# Vérifier que Claude Code est installé
claude --version
```
Sortie attendue : Numéro de version (recommandé: `2.1.107` ou supérieur)

### Installer les Prérequis Manquants

Si une commande ci-dessus échoue :

**Node.js :** Téléchargez depuis [nodejs.org](https://nodejs.org/) ou utilisez :
```bash
# macOS avec Homebrew
brew install node

# Ubuntu/Debian
sudo apt install nodejs npm
```

**Git :** Téléchargez depuis [git-scm.com](https://git-scm.com/) ou utilisez :
```bash
# macOS avec Homebrew
brew install git

# Ubuntu/Debian
sudo apt install git
```

**Claude Code :** Suivez le [guide d'installation officiel](https://code.claude.com/docs/en/installation)

---

## 2. Créer le Répertoire de Votre Projet

Choisissez où vous voulez créer votre projet et exécutez :

```bash
# Créer le répertoire du projet
mkdir ~/mon-projet

# Naviguer dedans
cd ~/mon-projet
```

**Vérification :** Exécutez `pwd` pour confirmer que vous êtes dans le bon répertoire :
```bash
pwd
```
Sortie attendue : `/home/votrenom/mon-projet` (ou `/Users/votrenom/mon-projet` sur macOS)

---

## 3. Initialiser le Dépôt Git

Claude-Craft fonctionne mieux avec des projets suivis par Git :

```bash
# Initialiser le dépôt Git
git init
```

Sortie attendue :
```
Initialized empty Git repository in /home/votrenom/mon-projet/.git/
```

**Vérification :** Vérifiez que le dossier `.git` existe :
```bash
ls -la
```
Vous devriez voir un répertoire `.git/` dans la sortie.

---

## 4. Choisir Votre Stack Technologique

Claude-Craft supporte plusieurs stacks technologiques. Choisissez celui qui correspond à votre projet :

| Stack | Idéal Pour | Flag de Commande |
|-------|------------|------------------|
| **C# / .NET** | APIs Enterprise, Microservices | `--tech=csharp` |
| **Symfony** | APIs PHP, Applications Web, Services Backend | `--tech=symfony` |
| **Laravel** | Applications Web PHP, APIs rapides | `--tech=laravel` |
| **PHP** | Architecture PHP générique | `--tech=php` |
| **Flutter** | Applications mobiles (iOS/Android) | `--tech=flutter` |
| **Python** | APIs, Services de données, Backends ML | `--tech=python` |
| **React** | SPAs Web, Tableaux de bord | `--tech=react` |
| **React Native** | Applications mobiles cross-platform | `--tech=reactnative` |
| **Angular** | Applications d'entreprise Web | `--tech=angular` |
| **Vue.js** | SPAs Web, Interfaces réactives | `--tech=vuejs` |
| **Common uniquement** | Tout projet (règles génériques) | `--tech=common` |

**Choisissez votre langue :**

| Langue | Flag |
|--------|------|
| Anglais | `--lang=en` |
| Français | `--lang=fr` |
| Espagnol | `--lang=es` |
| Allemand | `--lang=de` |
| Portugais | `--lang=pt` |

---

## 5. Installer Claude-Craft

Vous avez deux méthodes d'installation. Choisissez celle qui correspond à vos besoins :

### Méthode A : NPX (Sans Clone Requis)

**Idéal pour :** Configuration rapide, premiers utilisateurs, pipelines CI/CD

Cette méthode télécharge et exécute Claude-Craft directement sans cloner le dépôt.

```bash
# Remplacez 'symfony' par votre stack tech et 'fr' par votre langue
npx @the-bearded-bear/claude-craft install ~/mon-projet --tech=symfony --lang=fr
```

**Exemple pour un projet Flutter en anglais :**
```bash
npx @the-bearded-bear/claude-craft install ~/mon-projet --tech=flutter --lang=en
```

Sortie attendue :
```
Installing Claude-Craft rules...
  ✓ Common rules installed
  ✓ Symfony rules installed
  ✓ Agents installed
  ✓ Commands installed
  ✓ Templates installed
  ✓ Checklists installed
  ✓ CLAUDE.md generated

Installation complete! Run 'claude' in your project directory to start.
```

**Si vous voyez une erreur :**
- `npm ERR! 404` → Vérifiez votre connexion internet
- `EACCES: permission denied` → Exécutez avec `sudo` ou corrigez les permissions npm
- `command not found: npx` → Installez Node.js d'abord

---

### Méthode B : Makefile (Plus de Contrôle)

**Idéal pour :** Personnalisation, contributeurs au projet, utilisation hors ligne

Cette méthode nécessite de cloner le dépôt Claude-Craft d'abord.

#### Étape B.1 : Cloner Claude-Craft

```bash
# Cloner vers un emplacement permanent
git clone https://github.com/TheBeardedBearSAS/claude-craft.git ~/claude-craft
```

Sortie attendue :
```
Cloning into '/home/votrenom/claude-craft'...
remote: Enumerating objects: XXX, done.
...
Resolving deltas: 100% (XXX/XXX), done.
```

#### Étape B.2 : Exécuter l'Installation

```bash
# Naviguer vers le répertoire Claude-Craft
cd ~/claude-craft

# Installer les règles dans votre projet
# Remplacez 'symfony' par votre tech et 'fr' par votre langue
make install-symfony TARGET=~/mon-projet LANG=fr
```

**Exemples pour d'autres stacks :**
```bash
# Flutter en anglais
make install-flutter TARGET=~/mon-projet LANG=en

# React en espagnol
make install-react TARGET=~/mon-projet LANG=es

# Python en allemand
make install-python TARGET=~/mon-projet LANG=de

# Règles communes uniquement (tout projet)
make install-common TARGET=~/mon-projet LANG=fr
```

Sortie attendue :
```
Installing Symfony rules to /home/votrenom/mon-projet...
  Creating .claude directory...
  Copying rules... done
  Copying agents... done
  Copying commands... done
  Copying templates... done
  Copying checklists... done
  Generating CLAUDE.md... done

Installation complete!
```

---

## 6. Vérifier l'Installation

Après l'installation, vérifiez que tout est en place :

```bash
# Naviguer vers votre projet
cd ~/mon-projet

# Lister le répertoire .claude
ls -la .claude/
```

Sortie attendue :
```
total XX
drwxr-xr-x  8 user user 4096 Jan 12 10:00 .
drwxr-xr-x  3 user user 4096 Jan 12 10:00 ..
-rw-r--r--  1 user user 2048 Jan 12 10:00 CLAUDE.md
drwxr-xr-x  2 user user 4096 Jan 12 10:00 agents
drwxr-xr-x  2 user user 4096 Jan 12 10:00 checklists
drwxr-xr-x  4 user user 4096 Jan 12 10:00 commands
drwxr-xr-x  2 user user 4096 Jan 12 10:00 rules
drwxr-xr-x  2 user user 4096 Jan 12 10:00 templates
```

### Vérifier Chaque Composant

```bash
# Compter les règles
ls .claude/rules/*.md | wc -l

# Compter les agents (jusqu'à 72 agents disponibles selon le stack)
ls .claude/agents/*.md | wc -l

# Compter les commandes (devrait avoir des sous-répertoires)
ls .claude/commands/
```

**Si des fichiers manquent :**
- Relancez la commande d'installation
- Vérifiez que vous avez les permissions d'écriture sur le répertoire
- Voir la section [Dépannage](#10-dépannage)

---

## 7. Configurer le Contexte du Projet

Le fichier le plus important à personnaliser est le contexte de votre projet. Il indique à Claude les spécificités de VOTRE projet.

### Option A : Configuration Interactive (Recommandée)

Utilisez la commande intégrée pour détecter automatiquement votre stack et répondre à des questions ciblées :

```bash
# Démarrer Claude Code
claude

# Exécuter la commande de configuration
/common:setup-project-context
```

La commande va :
1. **Auto-détecter** votre stack technique, framework, base de données et CI/CD
2. **Poser des questions** pour les informations manquantes (type d'app, domaine, utilisateurs, conformité)
3. **Générer** un fichier `.claude/rules/00-project-context.md` complet
4. **Suggérer les prochaines étapes** (agents à exécuter, sections à compléter)

**Modes disponibles :**
- `(défaut)` - Détection équilibrée + questions essentielles
- `--auto` - Détection maximale, questions minimales
- `--full` - Questionnaire complet incluant objectifs et glossaire

### Option B : Configuration Manuelle

Si vous préférez configurer manuellement, ouvrez le fichier directement :

```bash
# Ouvrir dans votre éditeur (remplacez 'nano' par 'code', 'vim', etc.)
nano .claude/rules/00-project-context.md
```

### Sections à Personnaliser

Trouvez et mettez à jour ces sections :

```markdown
## Aperçu du Projet
- **Nom** : [Nom de votre projet]
- **Description** : [Que fait votre projet ?]
- **Type** : [API / Application Web / Application Mobile / CLI / Bibliothèque]

## Stack Technique
- **Framework** : [ex: Symfony 7.0, Flutter 3.16]
- **Version du Langage** : [ex: PHP 8.3, Dart 3.2]
- **Base de Données** : [ex: PostgreSQL 16, MySQL 8]

## Conventions d'Équipe
- **Style de Code** : [ex: PSR-12, Effective Dart]
- **Stratégie de Branches** : [ex: GitFlow, Trunk-based]
- **Format de Commit** : [ex: Conventional Commits]

## Règles Spécifiques au Projet
- [Ajoutez toute règle personnalisée pour votre projet]
```

### Exemple : API E-commerce

```markdown
## Aperçu du Projet
- **Nom** : ShopAPI
- **Description** : API RESTful pour plateforme e-commerce
- **Type** : API

## Stack Technique
- **Framework** : Symfony 7.0 avec API Platform
- **Version du Langage** : PHP 8.3
- **Base de Données** : PostgreSQL 16

## Conventions d'Équipe
- **Style de Code** : PSR-12
- **Stratégie de Branches** : GitFlow
- **Format de Commit** : Conventional Commits

## Règles Spécifiques au Projet
- Tous les prix doivent être stockés en centimes (entier)
- Utiliser UUID v7 pour tous les identifiants d'entités
- Suppression douce requise pour toutes les entités
```

Sauvegardez le fichier quand c'est fait (dans nano : `Ctrl+O`, puis `Entrée`, puis `Ctrl+X`).

---

## 8. Premier Lancement avec Claude Code

Maintenant, lançons Claude Code et vérifions que tout fonctionne :

```bash
# Assurez-vous d'être dans le répertoire de votre projet
cd ~/mon-projet

# Lancer Claude Code
claude
```

Vous devriez voir Claude Code démarrer avec un prompt.

### Tester que les Règles Sont Actives

Tapez ce message à Claude :

```
Quelles règles et directives suis-tu pour ce projet ?
```

Claude devrait répondre en mentionnant :
- Le contexte du projet depuis `00-project-context.md`
- Les règles d'architecture
- Les exigences de test
- Les directives spécifiques à la technologie

**Si Claude ne mentionne pas vos règles :**
- Assurez-vous d'être à la racine du projet (pas dans un sous-répertoire)
- Vérifiez que le répertoire `.claude/` existe
- Redémarrez Claude Code

---

## 9. Tester Votre Configuration

Exécutez ces tests rapides pour vérifier que tout fonctionne :

### Test 1 : Vérifier les Commandes Disponibles

Demandez à Claude :
```
Liste toutes les commandes slash disponibles pour ce projet
```

Attendu : Claude devrait lister des commandes comme `/common:analyze-feature`, `/{tech}:generate-crud`, etc.

### Test 2 : Utiliser un Agent

Essayez d'invoquer un agent :
```
@tdd-coach Aide-moi à comprendre comment écrire des tests pour ce projet
```

Attendu : Claude devrait répondre en tant qu'agent TDD Coach avec des conseils sur les tests.

### Test 3 : Exécuter une Commande

Essayez une commande simple :
```
/common:pre-commit-check
```

Attendu : Claude devrait exécuter une vérification de qualité pré-commit (peut indiquer qu'il n'y a pas de changements si le projet est vide).

### Checklist de Validation

- [ ] Claude Code démarre sans erreurs
- [ ] Claude mentionne les règles du projet quand on lui demande
- [ ] Les commandes slash sont reconnues
- [ ] Les agents répondent avec des connaissances spécialisées
- [ ] Le contexte du projet est reflété dans les réponses

---

## 10. Dépannage

### Problèmes d'Installation

**Problème :** `Permission denied` pendant l'installation
```bash
# Solution 1 : Corriger les permissions du répertoire
chmod 755 ~/mon-projet

# Solution 2 : Exécuter avec sudo (non recommandé pour npm)
sudo npx @the-bearded-bear/claude-craft install ...
```

**Problème :** `Command not found: npx`
```bash
# Solution : Installer Node.js
brew install node  # macOS
sudo apt install nodejs npm  # Ubuntu/Debian
```

**Problème :** `ENOENT: no such file or directory`
```bash
# Solution : Créer d'abord le répertoire cible
mkdir -p ~/mon-projet
```

### Problèmes à l'Exécution

**Problème :** Claude ne voit pas les règles
- Vérifiez que vous êtes à la racine du projet : `pwd`
- Vérifiez que `.claude/` existe : `ls -la .claude/`
- Redémarrez Claude Code : quittez et relancez `claude`

**Problème :** Commandes non reconnues
- Vérifiez le répertoire des commandes : `ls .claude/commands/`
- Vérifiez les permissions des fichiers : `ls -la .claude/commands/*.md`

**Problème :** Agents ne répondent pas
- Vérifiez le répertoire des agents : `ls .claude/agents/`
- Utilisez la bonne syntaxe : `@nom-agent message`

### Obtenir de l'Aide

Si vous êtes toujours bloqué :
1. Consultez le [Guide de Dépannage](06-troubleshooting.md)
2. Recherchez dans les [Issues GitHub](https://github.com/TheBeardedBearSAS/claude-craft/issues)
3. Ouvrez une nouvelle issue avec votre message d'erreur

---

## 11. Prochaines Étapes

Félicitations ! Votre environnement Claude-Craft est prêt. Voici la suite :

### Prochaines Étapes Immédiates

1. **Committez votre configuration :**
   ```bash
   git add .claude/
   git commit -m "feat: add Claude-Craft configuration"
   ```

2. **Configurez l'optimisation des tokens (recommandé) :**
   ```bash
   /common:setup-rtk
   ```
   Cela réduit la consommation de tokens de 55-65% en configurant RTK et les hooks d'optimisation.

3. **Commencez à construire votre projet** avec l'assistance IA

4. **Lisez le Guide de Développement de Fonctionnalités** pour apprendre le workflow TDD

### Lectures Recommandées

| Guide | Description |
|-------|-------------|
| [Développement de Fonctionnalités](03-feature-development.md) | Workflow TDD avec agents et commandes |
| [Correction de Bugs](04-bug-fixing.md) | Diagnostic et tests de régression |
| [Référence des Outils](05-tools-reference.md) | Utilitaires Multi-compte, StatusLine |
| [Ajout à un Projet Existant](09-setup-existing-project.md) | Pour vos autres projets |

### Carte de Référence Rapide

```bash
# Lancer Claude Code
claude

# Agents courants
@api-designer      # Conception d'API
@database-architect # Schéma de base de données
@tdd-coach         # Aide aux tests
@{tech}-reviewer   # Revue de code

# Commandes courantes
/common:analyze-feature     # Analyser les besoins
/{tech}:generate-crud       # Générer du code CRUD
/common:pre-commit-check    # Vérification qualité
/common:security-audit      # Audit de sécurité
```

---

[&larr; Précédent : Gestion du Backlog](07-backlog-management.md) | [Suivant : Ajout à un Projet Existant &rarr;](09-setup-existing-project.md)

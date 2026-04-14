# Ajouter Claude-Craft à un Projet Existant

Ce tutoriel complet vous guide à travers l'ajout de Claude-Craft à un projet qui a déjà du code. Vous apprendrez à installer en toute sécurité, faire comprendre votre codebase à Claude, et pousser vos premières modifications assistées par IA.

**Temps requis :** ~20-30 minutes

---

## Table des Matières

1. [Avant de Commencer](#1-avant-de-commencer)
2. [Sauvegarder Votre Projet](#2-sauvegarder-votre-projet)
3. [Analyser la Structure de Votre Projet](#3-analyser-la-structure-de-votre-projet)
4. [Vérifier les Conflits](#4-vérifier-les-conflits)
5. [Choisir Votre Stack Technologique](#5-choisir-votre-stack-technologique)
6. [Installer Claude-Craft](#6-installer-claude-craft)
7. [Fusionner les Configurations](#7-fusionner-les-configurations)
8. [Faire Comprendre Votre Codebase à Claude](#8-faire-comprendre-votre-codebase-à-claude)
9. [Votre Première Modification](#9-votre-première-modification)
10. [Intégration de l'Équipe](#10-intégration-de-léquipe)
11. [Migration depuis d'Autres Outils IA](#11-migration-depuis-dautres-outils-ia)
12. [Dépannage](#12-dépannage)

---

## 1. Avant de Commencer

### Avertissements Importants

> **Attention :** L'installation de Claude-Craft créera un répertoire `.claude/` dans votre projet. Si un tel répertoire existe déjà, vous devrez décider de le fusionner, le remplacer ou le préserver.

> **Attention :** Créez toujours une branche de sauvegarde avant l'installation. Cela permet un retour arrière facile si quelque chose se passe mal.

### Checklist des Prérequis

- [ ] Votre projet est suivi par Git
- [ ] Vous avez commité tous les changements actuels
- [ ] Vous avez l'accès en écriture au répertoire du projet
- [ ] Node.js 16+ installé (pour la méthode NPX)
- [ ] Claude Code installé

### Quand NE PAS Installer

Envisagez de reporter l'installation si :
- Vous avez des changements non commités
- Vous êtes au milieu d'une release critique
- Le projet a une configuration `.claude/` existante complexe
- Plusieurs membres de l'équipe poussent activement des changements

---

## 2. Sauvegarder Votre Projet

**Ne sautez jamais cette étape.** Créez une branche de sauvegarde avant l'installation.

### Créer une Branche de Sauvegarde

```bash
# Naviguez vers votre projet
cd ~/votre-projet-existant

# Assurez-vous que tout est commité
git status
```

Si vous voyez des changements non commités :
```bash
git add .
git commit -m "chore: save work before Claude-Craft installation"
```

Maintenant créez la sauvegarde :
```bash
# Créer et rester sur la branche de sauvegarde
git checkout -b backup/before-claude-craft

# Retourner sur votre branche principale
git checkout main  # ou 'master' ou votre branche par défaut
```

### Vérifier la Sauvegarde

```bash
# Confirmer que la branche de sauvegarde existe
git branch | grep backup
```

Sortie attendue :
```
  backup/before-claude-craft
```

### Plan de Retour Arrière

Si quelque chose se passe mal, vous pouvez revenir en arrière :
```bash
# Abandonner tous les changements et retourner à la sauvegarde
git checkout backup/before-claude-craft
git branch -D main
git checkout -b main
```

---

## 3. Analyser la Structure de Votre Projet

Avant d'installer, comprenez ce que vous avez déjà.

### Vérifier l'Existence d'un Répertoire .claude

```bash
# Vérifier si .claude existe déjà
ls -la .claude/ 2>/dev/null || echo "No .claude directory found"
```

**Si .claude existe :**
- Notez quels fichiers sont à l'intérieur
- Décidez : fusionner, remplacer ou préserver
- Voir [Section 7 : Fusionner les Configurations](#7-fusionner-les-configurations)

### Identifier la Structure de Votre Projet

```bash
# Lister le répertoire racine
ls -la

# Afficher l'arborescence des répertoires (2 premiers niveaux)
find . -maxdepth 2 -type d | head -20
```

Prenez note de :
- Répertoires sources principaux (`src/`, `app/`, `lib/`)
- Fichiers de configuration (`.env`, `config/`, `settings/`)
- Répertoires de tests (`tests/`, `test/`, `spec/`)
- Documentation (`docs/`, `README.md`)

### Vérifier d'Autres Configurations d'Outils IA

```bash
# Vérifier les règles Cursor
ls -la .cursorrules 2>/dev/null

# Vérifier les instructions GitHub Copilot
ls -la .github/copilot-instructions.md 2>/dev/null

# Vérifier d'autres configs Claude
ls -la CLAUDE.md 2>/dev/null
```

Notez les configurations existantes - vous pourriez vouloir les migrer (voir [Section 11](#11-migration-depuis-dautres-outils-ia)).

---

## 4. Vérifier les Conflits

### Fichiers Pouvant Entrer en Conflit

| Fichier/Répertoire | Claude-Craft Crée | Votre Projet Peut Avoir |
|--------------------|-------------------|-------------------------|
| `.claude/` | Oui | Peut-être |
| `.claude/CLAUDE.md` | Oui | Peut-être |
| `.claude/rules/` | Oui | Peut-être |
| `CLAUDE.md` (racine) | Non | Peut-être |

### Matrice de Décision

| Scénario | Recommandation |
|----------|----------------|
| Pas de `.claude/` existant | Installer normalement |
| `.claude/` vide existe | Installer avec `--force` |
| `.claude/` a des règles personnalisées | Utiliser `--preserve-config` |
| `CLAUDE.md` racine existe | Gardez-le, il n'entrera pas en conflit |

---

## 5. Choisir Votre Stack Technologique

Identifiez la technologie principale de votre projet :

| Votre Projet Utilise | Commande d'Installation |
|----------------------|-------------------------|
| C# / .NET | `--tech=csharp` |
| PHP/Symfony | `--tech=symfony` |
| PHP/Laravel | `--tech=laravel` |
| PHP Clean Architecture | `--tech=php` |
| Dart/Flutter | `--tech=flutter` |
| Python/FastAPI/Django | `--tech=python` |
| JavaScript/React | `--tech=react` |
| JavaScript/React Native | `--tech=reactnative` |
| TypeScript/Angular | `--tech=angular` |
| TypeScript/Vue.js | `--tech=vuejs` |
| Multiple/Autre | `--tech=common` |

**Pour les monorepos :** Installez dans chaque sous-projet séparément (voir ci-dessous).

---

## 6. Installer Claude-Craft

### Installation Standard

**Méthode A : NPX (Recommandée)**
```bash
cd ~/votre-projet-existant
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=fr
```

**Méthode B : Makefile**
```bash
cd ~/claude-craft
make install-symfony TARGET=~/votre-projet-existant LANG=fr
```

### Préserver la Configuration Existante

Si vous avez des fichiers `.claude/` existants que vous voulez garder :

```bash
# NPX avec flag de préservation
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=fr --preserve-config

# Makefile avec flag de préservation
make install-symfony TARGET=~/votre-projet-existant LANG=fr OPTIONS="--preserve-config"
```

**Ce que `--preserve-config` garde :**
- `CLAUDE.md` (votre description de projet)
- `rules/00-project-context.md` (votre contexte personnalisé)
- Toute règle personnalisée que vous avez ajoutée

### Installation Monorepo

Pour les projets avec plusieurs applications :

```
mon-monorepo/
├── frontend/    (React)
├── backend/     (Symfony)
└── mobile/      (Flutter)
```

Installez dans chaque répertoire :
```bash
# Installer React dans frontend
npx @the-bearded-bear/claude-craft install ./frontend --tech=react --lang=fr

# Installer Symfony dans backend
npx @the-bearded-bear/claude-craft install ./backend --tech=symfony --lang=fr

# Installer Flutter dans mobile
npx @the-bearded-bear/claude-craft install ./mobile --tech=flutter --lang=fr
```

### Vérifier l'Installation

```bash
ls -la .claude/
```

Structure attendue :
```
.claude/
├── CLAUDE.md
├── agents/
├── checklists/
├── commands/
├── rules/
└── templates/
```

---

## 7. Fusionner les Configurations

Si vous aviez des configurations existantes, fusionnez-les maintenant.

### Fusionner CLAUDE.md

Si vous aviez un `CLAUDE.md` personnalisé :

1. Ouvrez les deux fichiers :
   ```bash
   # Votre ancien fichier (si sauvegardé)
   cat .claude/CLAUDE.md.backup

   # Nouveau fichier Claude-Craft
   cat .claude/CLAUDE.md
   ```

2. Copiez vos sections personnalisées dans le nouveau fichier
3. Gardez la structure Claude-Craft, ajoutez votre contenu

### Fusionner les Règles Personnalisées

Si vous aviez des règles personnalisées dans `rules/` :

1. Les règles Claude-Craft sont numérotées de `01-xx.md` à `12-xx.md`
2. Ajoutez vos règles personnalisées comme `90-custom-rule.md`, `91-another-rule.md`
3. Les numéros plus élevés = priorité plus basse, mais toujours incluses

### Exemple de Fusion

```bash
# Renommer votre ancienne règle personnalisée
mv .claude/rules/my-custom-rules.md .claude/rules/90-project-custom-rules.md
```

---

## 8. Faire Comprendre Votre Codebase à Claude

**C'est la section la plus importante.** Une installation réussie de Claude-Craft ne consiste pas seulement à installer des fichiers—c'est faire en sorte que Claude comprenne vraiment votre projet.

### 8.1 Exploration Initiale de la Codebase

Lancez Claude Code dans votre projet :

```bash
cd ~/votre-projet-existant
claude
```

Commencez par une exploration large :

```
Explore cette codebase et donne-moi un résumé complet de :
1. La structure globale du projet
2. Les répertoires principaux et leurs objectifs
3. Les points d'entrée clés
4. Les fichiers de configuration que tu trouves
```

**Résultat attendu :** Claude devrait décrire la structure de votre projet avec précision. S'il se trompe sur certains points, corrigez-le—cela aide Claude à apprendre.

**Vérifiez la compréhension de Claude :**
```
D'après ce que tu as trouvé, quel type de projet est-ce ?
Quel framework ou stack technologique est utilisé ?
```

### 8.2 Comprendre l'Architecture

Demandez à Claude d'identifier les patterns architecturaux :

```
Analyse l'architecture de ce projet :
1. Quel pattern architectural suit-il ? (MVC, Clean Architecture, etc.)
2. Quelles sont les principales couches et leurs responsabilités ?
3. Comment le code est-il organisé en modules/domaines ?
4. Quels design patterns vois-tu être utilisés ?
```

**Vérifiez avec des questions spécifiques :**
```
Montre-moi un exemple de comment une requête traverse le système,
du point d'entrée jusqu'à la base de données et retour.
```

Si l'analyse de Claude est précise, parfait ! Sinon, corrigez-le :
```
En fait, ce projet utilise la Clean Architecture avec ces couches :
- Domain (src/Domain/)
- Application (src/Application/)
- Infrastructure (src/Infrastructure/)
- Presentation (src/Controller/)
Mets à jour ta compréhension s'il te plaît.
```

### 8.3 Découvrir la Logique Métier

Aidez Claude à comprendre ce que fait réellement votre projet :

```
Quels sont les principaux domaines métier ou fonctionnalités dans cette codebase ?
Liste les entités principales et explique leurs relations.
```

**Utilisez les agents spécialisés :**

```
@database-architect
Analyse le schéma de base de données de ce projet.
Quelles sont les entités principales, leurs relations, et les patterns que tu remarques ?
```

```
@api-designer
Examine les endpoints API de ce projet.
Quelles ressources sont exposées ? Quels patterns sont utilisés ?
```

### 8.4 Documenter le Contexte

Vous avez deux options pour configurer le contexte du projet :

**Option A : Configuration Interactive (Recommandée)**

Utilisez la commande intégrée pour détecter automatiquement votre stack et répondre à des questions ciblées :

```bash
/common:setup-project-context
```

La commande analysera votre codebase existante, détectera les technologies et posera uniquement les questions pour les informations manquantes.

**Option B : Configuration Manuelle**

Créez ou mettez à jour le fichier de contexte du projet manuellement :

```bash
nano .claude/rules/00-project-context.md
```

Remplissez le template avec ce que vous avez découvert :

```markdown
## Aperçu du Projet
- **Nom** : [Nom de votre projet]
- **Description** : [Ce que Claude a appris + vos ajouts]
- **Domaine** : [ex: E-commerce, Santé, FinTech]

## Architecture
- **Pattern** : [Ce que Claude a identifié]
- **Couches** : [Listez-les]
- **Répertoires Clés** :
  - `src/Domain/` - Logique métier et entités
  - `src/Application/` - Cas d'usage et services
  - [etc.]

## Contexte Métier
- **Entités Principales** : [Listez les objets de domaine principaux]
- **Workflows Clés** : [Décrivez les parcours utilisateurs principaux]
- **Intégrations Externes** : [APIs, services auxquels vous vous connectez]

## Conventions de Développement
- **Testing** : [Votre approche de test]
- **Style de Code** : [Vos standards]
- **Workflow Git** : [Votre stratégie de branches]

## Notes Importantes pour l'IA
- [Tout ce que Claude devrait toujours se rappeler]
- [Pièges à éviter]
- [Considérations spéciales]
```

Sauvegardez et vérifiez que Claude le voit :
```
Lis le fichier de contexte du projet et résume ce que tu comprends
maintenant de ce projet.
```

---

## 9. Votre Première Modification

Maintenant, faisons votre premier changement assisté par IA et poussons-le.

### 9.1 Choisir une Tâche Simple

Bons premiers choix de tâches :
- [ ] Ajouter un test unitaire manquant
- [ ] Corriger un petit bug
- [ ] Ajouter de la documentation à une fonction
- [ ] Refactorer une méthode pour plus de clarté
- [ ] Ajouter une validation d'entrée

**À éviter pour la première tâche :**
- Grosses fonctionnalités
- Changements de sécurité critiques
- Migrations de base de données
- Changements d'API cassants

### 9.2 Laisser Claude Analyser

Demandez à Claude d'analyser avant de faire des changements :

```
Je veux [décrire votre tâche].

Avant de faire des changements :
1. Analyse le code concerné
2. Explique ton approche
3. Liste les fichiers que tu vas modifier
4. Décris les tests que tu vas ajouter ou mettre à jour
```

**Examinez attentivement le plan de Claude.** Posez des questions :
```
Pourquoi as-tu choisi cette approche ?
Y a-t-il des risques avec ce changement ?
Quels tests vérifieront que ça fonctionne ?
```

### 9.3 Implémenter le Changement

Une fois satisfait du plan :
```
Vas-y et implémente ce changement en suivant TDD :
1. D'abord écris/mets à jour les tests
2. Puis implémente le code
3. Lance les tests pour vérifier
```

### 9.4 Vérifier et Commiter

Avant de commiter, lancez les vérifications de qualité :

```
/common:pre-commit-check
```

Examinez tous les changements :
```bash
git diff
git status
```

Si tout semble bon :
```bash
# Stage les changements
git add .

# Commit avec un message descriptif
git commit -m "feat: [décrivez ce que vous avez fait]

- [point sur le changement]
- [autre changement]
- Ajouté des tests pour [fonctionnalité]

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 9.5 Pousser Vos Changements

```bash
# Pousser vers le remote
git push origin main
```

Si votre CI/CD s'exécute, vérifiez qu'il passe :
```bash
# Vérifier le statut CI (si vous utilisez GitHub)
gh run list --limit 1
```

**Félicitations !** Vous avez fait votre première modification assistée par IA.

---

## 10. Intégration de l'Équipe

Partagez Claude-Craft avec votre équipe.

### Commiter la Configuration

```bash
# Ajouter les fichiers Claude-Craft à git
git add .claude/

# Commiter
git commit -m "feat: add Claude-Craft AI development configuration

- Added rules for [votre stack tech]
- Configured project context
- Added agents and commands"

# Pousser
git push origin main
```

### Notifier Votre Équipe

Créez un guide bref pour les collègues :

```markdown
## Utiliser Claude-Craft dans Ce Projet

1. Installer Claude Code : [lien]
2. Tirer les derniers changements : `git pull`
3. Lancer dans le projet : `cd project && claude`

### Commandes Rapides
- `/common:pre-commit-check` - Lancer avant de commiter
- `@tdd-coach` - Aide sur les tests
- `@{tech}-reviewer` - Revue de code

### Contexte du Projet
Notre assistant IA comprend :
- [Les patterns d'architecture qu'on utilise]
- [Les conventions de code]
- [Le domaine métier]
```

### Démo d'Équipe

Envisagez de faire une courte démo :
1. Montrez Claude explorant la codebase
2. Démontrez une tâche simple
3. Montrez le workflow pre-commit
4. Répondez aux questions

---

## 11. Migration depuis d'Autres Outils IA

Si vous utilisez d'autres outils de codage IA, migrez leurs configurations.

### Depuis Cursor Rules (.cursorrules)

```bash
# Vérifier si vous avez des règles Cursor
cat .cursorrules 2>/dev/null
```

Migration :
1. Ouvrez `.cursorrules`
2. Copiez les règles pertinentes
3. Ajoutez dans `.claude/rules/90-migrated-cursor-rules.md`
4. Adaptez le format au style Claude-Craft

### Depuis GitHub Copilot Instructions

```bash
# Vérifier les instructions Copilot
cat .github/copilot-instructions.md 2>/dev/null
```

Migration :
1. Ouvrez les instructions Copilot
2. Extrayez les directives de codage
3. Ajoutez au contexte du projet ou aux règles personnalisées

### Depuis d'Autres Configurations Claude

Si vous avez un `CLAUDE.md` à la racine :
```bash
# Examiner la config existante
cat CLAUDE.md 2>/dev/null
```

Migration :
1. Comparez avec le nouveau `.claude/CLAUDE.md`
2. Fusionnez le contenu unique
3. Gardez le `CLAUDE.md` racine s'il contient de la documentation projet
4. Supprimez-le s'il est redondant avec `.claude/`

### Tableau de Mapping de Migration

| Ancien Emplacement | Emplacement Claude-Craft |
|--------------------|--------------------------|
| `.cursorrules` | `.claude/rules/90-custom.md` |
| `.github/copilot-instructions.md` | `.claude/rules/00-project-context.md` |
| `CLAUDE.md` (racine) | `.claude/CLAUDE.md` |
| Prompts personnalisés | `.claude/commands/custom/` |

---

## 12. Dépannage

### Problèmes d'Installation

**Problème :** Erreur "Directory already exists"
```bash
# Solution : Utiliser le flag force
npx @the-bearded-bear/claude-craft install . --tech=symfony --force
```

**Problème :** "Permission denied"
```bash
# Solution : Vérifier la propriété
ls -la .claude/
# Corriger les permissions
chmod -R 755 .claude/
```

**Problème :** "CLAUDE.md not found" après installation
```bash
# Solution : Relancer l'installation
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=fr
```

### Problèmes de Compréhension de Claude

**Problème :** Claude ne comprend pas la structure de mon projet

Solution : Soyez explicite dans votre fichier de contexte et pendant la conversation :
```
Ce projet utilise [pattern spécifique]. Le code source principal est dans [répertoire].
Quand je parle de [terme de domaine], je veux dire [explication].
```

**Problème :** Claude suggère de mauvais patterns

Solution : Corrigez et renforcez :
```
On n'utilise pas [pattern] dans ce projet. On utilise [pattern correct] parce que [raison].
Retiens ça pour les suggestions futures s'il te plaît.
```

**Problème :** Claude oublie le contexte entre les sessions

Solution : Assurez-vous que `00-project-context.md` est complet. Les informations clés doivent être dans les fichiers, pas seulement dans la conversation.

### Retour Arrière

Si vous devez annuler l'installation :

```bash
# Supprimer les fichiers Claude-Craft
rm -rf .claude/

# Restaurer depuis la branche de sauvegarde
git checkout backup/before-claude-craft -- .

# Ou hard reset
git checkout backup/before-claude-craft
```

---

### Optimiser les Tokens (Recommandé)

Après l'installation, configurez l'optimisation des tokens pour réduire vos coûts de 55-65% :

```bash
# Dans Claude Code
/common:setup-rtk
```

Cela configure RTK, les hooks de filtrage et le modèle des sous-agents automatiquement.

---

## Résumé

Vous avez réussi à :
- [x] Sauvegarder votre projet
- [x] Installer Claude-Craft en toute sécurité
- [x] Faire comprendre votre codebase à Claude
- [x] Faire votre première modification assistée par IA
- [x] Pousser des changements vers votre dépôt
- [x] Préparer l'intégration de l'équipe

### Et Ensuite ?

| Tâche | Guide |
|-------|-------|
| Apprendre le workflow TDD complet | [Développement de Fonctionnalités](03-feature-development.md) |
| Débugger efficacement | [Correction de Bugs](04-bug-fixing.md) |
| Gérer votre backlog avec l'IA | [Gestion du Backlog](07-backlog-management.md) |
| Explorer les outils avancés | [Référence des Outils](05-tools-reference.md) |

---

[&larr; Précédent : Installation Nouveau Projet](08-setup-new-project.md) | [Retour à l'Index](../index.md)

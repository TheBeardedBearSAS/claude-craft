# Exercice 2 : Installation de Claude-Craft 8.8.0

## Objectif

Installer Claude-Craft 8.8.0 via npx et explorer la structure TCL (Tiered Context Loading).

## Durée estimée

15 minutes

---

## Prérequis

- Exercice 1 complété (Claude Code fonctionnel)
- Node.js 20+ installé (pour npx)
- Git installé

---

## Étapes

### Étape 1 : Créer un projet de démo

```bash
# Créer un répertoire pour le projet de démo
mkdir ~/projet-demo
cd ~/projet-demo
git init

# Créer une structure Symfony minimale (simulée)
mkdir -p src/Controller src/Entity src/Service
touch src/Controller/HomeController.php
touch src/Entity/User.php
touch src/Service/UserService.php
```

---

### Étape 2 : Installer Claude-Craft via NPX (interactif)

```bash
# Installation interactive (recommandée pour la formation)
npx @the-bearded-bear/claude-craft install

# L'assistant vous demandera :
# 1. "Target directory?" → ~/projet-demo
# 2. "Technology?" → symfony
# 3. "Language?" → fr
```

**Validation :** Le message "Installation complete!" s'affiche

---

### Étape 3 : Alternative - Installation directe

```bash
# Si vous préférez une commande unique
npx @the-bearded-bear/claude-craft install ~/projet-demo --tech=symfony --lang=fr
```

**Technologies disponibles :**
- `symfony`, `laravel`, `react`, `angular`, `vuejs`
- `flutter`, `reactnative`, `python`, `php`, `csharp`

---

### Étape 4 : Explorer la structure TCL

```bash
# Aller dans le projet
cd ~/projet-demo

# Lister la structure générée
ls -la .claude/

# Devrait afficher :
# CLAUDE.md          ← Config minimale (~700 bytes)
# INDEX.md           ← Référence rapide
# context.yaml       ← Triggers automatiques
# references/        ← Documentation complète
# skills/            ← Best practices on-demand
# agents/            ← Agents IA
# commands/          ← Commandes slash
```

---

### Étape 5 : Comprendre les 3 niveaux TCL

#### Niveau 1 : ALWAYS (auto-chargé)

```bash
# Lire le CLAUDE.md minimal
cat .claude/CLAUDE.md

# Lire l'INDEX.md
cat .claude/INDEX.md

# Ces fichiers sont TOUJOURS chargés (~1,500 tokens total)
```

#### Niveau 2 : ON-DEMAND (via /skill)

```bash
# Lister les skills disponibles
ls .claude/skills/

# Lire un skill
cat .claude/skills/testing.md

# Ces fichiers sont chargés quand vous utilisez /testing
```

#### Niveau 3 : REFERENCE (via @)

```bash
# Explorer les références
ls .claude/references/
ls .claude/references/base/
ls .claude/references/symfony/

# Lire une référence complète
cat .claude/references/base/testing.md

# Ces fichiers sont chargés quand vous les mentionnez explicitement
```

---

### Étape 6 : Vérifier le context.yaml

```bash
# Voir les triggers automatiques
cat .claude/context.yaml

# Exemple de contenu :
# triggers:
#   testing:
#     keywords: ["test", "TDD", "spec"]
#     auto_load: true
```

---

### Étape 7 : Lancer Claude avec Claude-Craft

```bash
# Dans le répertoire du projet
cd ~/projet-demo
claude

# Claude charge automatiquement :
# ✓ CLAUDE.md
# ✓ INDEX.md
# (Environ 1,500 tokens au lieu de 70,000 !)
```

---

### Étape 8 : Tester le chargement on-demand

Dans Claude, essayez :

```bash
# Charger un skill manuellement
/testing

# Claude charge le skill et répond avec le contexte TDD

# Lister les commandes disponibles
"Quelles commandes sont disponibles ?"
```

---

### Étape 9 : Tester une commande

```bash
# Exécuter un audit de compliance
/symfony:check-compliance

# Claude analyse le projet (même minimal)
# et génère un rapport structuré
```

---

### Étape 10 : Accéder à une référence complète

```bash
# Dans Claude, mentionner une référence
"@.claude/references/base/testing.md explique-moi les principes TDD"

# Claude charge la documentation complète et répond
```

---

### Étape 11 : Comparer l'économie de tokens

```bash
# Quitter Claude
/exit

# Compter les tokens du CLAUDE.md minimal
wc -c .claude/CLAUDE.md
# Résultat attendu : ~700 bytes

# Comparer avec l'ancien système (si disponible)
# L'ancien CLAUDE.md faisait ~15,000+ caractères
```

**Économie réalisée :**
| Métrique | Avant (v3.x) | Après (v7.26.0) | Économie |
|----------|--------------|--------------|----------|
| Auto-chargé | ~70,000 tokens | ~3,500 tokens | **95%** |
| Temps de démarrage | Lent | Rapide | Significatif |

---

### Étape bonus : Initialiser le workflow

```bash
# Dans Claude, initialisez le workflow
/workflow:init

# Le workflow configure :
# ✓ Structure de gestion de projet
# ✓ Quality gates
# ✓ Sprint management
# ✓ Story lifecycle
```

---

## Critères de réussite

- [ ] Claude-Craft installé via npx
- [ ] Structure `.claude/` TCL créée
- [ ] CLAUDE.md minimal vérifié (~700 bytes)
- [ ] INDEX.md présent
- [ ] context.yaml configuré
- [ ] Session Claude lancée avec chargement minimal
- [ ] Skill chargé via /testing
- [ ] Commande testée (/symfony:check-compliance)
- [ ] Référence accédée via @

---

## Exploration bonus

### 1. Comparer les technologies

```bash
# Créer un projet React pour comparer
mkdir ~/projet-react-demo
npx @the-bearded-bear/claude-craft install ~/projet-react-demo --tech=react --lang=fr

# Comparer les structures
diff -r ~/projet-demo/.claude ~/projet-react-demo/.claude
```

### 2. Lister tous les skills disponibles

```bash
# Skills génériques
ls .claude/skills/

# Skills dans les références
ls .claude/references/base/
```

### 3. Personnaliser le context.yaml

```bash
# Éditer les triggers
nano .claude/context.yaml

# Ajouter un trigger personnalisé :
# mon-projet:
#   keywords: ["MonEntité", "MaFeature"]
#   auto_load: true
```

### 4. Tester le mode offline

```bash
# Les références locales fonctionnent sans internet
cat .claude/references/symfony/architecture.md
```

---

## Structure attendue (TCL)

```
projet-demo/
├── .claude/
│   ├── CLAUDE.md           # ~700 bytes - ALWAYS
│   ├── INDEX.md            # Liens rapides - ALWAYS
│   ├── context.yaml        # Triggers automatiques
│   ├── references/         # Documentation - REFERENCE
│   │   ├── base/
│   │   │   ├── SOLID.md
│   │   │   ├── KISS-DRY-YAGNI.md
│   │   │   ├── testing.md
│   │   │   └── security.md
│   │   └── symfony/
│   │       ├── CLAUDE.md
│   │       ├── architecture.md
│   │       └── patterns.md
│   ├── skills/             # On-demand - ON-DEMAND
│   │   ├── testing.md
│   │   ├── security.md
│   │   └── git-workflow.md
│   ├── agents/
│   │   └── ...
│   └── commands/
│       ├── common/
│       └── symfony/
├── .bmad/                  # BMAD v6 project management
├── .recette/               # QA Recette automated testing
├── src/
│   ├── Controller/
│   ├── Entity/
│   └── Service/
└── .git/
```

---

## Problèmes courants

### "npx: command not found"

Node.js n'est pas installé ou pas dans le PATH :
```bash
# Vérifier Node.js
node --version  # Doit être 20+

# Ubuntu/Debian
sudo apt install nodejs npm

# macOS (via Homebrew)
brew install node
```

### "Package not found"

Le package n'existe pas encore sur npm :
```bash
# Alternative : cloner et utiliser localement
git clone https://github.com/thebeardedcto/claude-craft.git ~/claude-craft
cd ~/claude-craft && npm link
claude-craft install ~/projet-demo --tech=symfony --lang=fr
```

### "Permission denied"

```bash
# Vérifier les droits sur le répertoire cible
ls -la ~/projet-demo

# Si nécessaire
chmod -R u+w ~/projet-demo
```

### Structure différente de celle attendue

```bash
# Vérifier la version de Claude-Craft
npx @the-bearded-bear/claude-craft --version
# Doit être 7.x ou supérieur

# Réinstaller si nécessaire
rm -rf ~/projet-demo/.claude
npx @the-bearded-bear/claude-craft install ~/projet-demo --tech=symfony --lang=fr
```

---

## Points clés appris

1. **NPX** = Installation en une commande (plus de git clone + make)
2. **TCL** = 3 niveaux de chargement (Always, On-Demand, Reference)
3. **CLAUDE.md** = Configuration minimale (~700 bytes vs ~15,000)
4. **INDEX.md** = Table des matières et liens rapides
5. **context.yaml** = Triggers automatiques pour le chargement intelligent
6. **Économie** = 95% de tokens économisés au démarrage

---

**Prochain exercice :** Workflow Standard

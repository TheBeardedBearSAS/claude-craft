---
description: Visite guidée interactive de 10 minutes pour les nouveaux utilisateurs Claude Craft
argument-hint: (aucun argument)
allowed-tools: Read, Glob, Bash, Grep
---

# /getting-started - Vos 10 Premières Minutes avec Claude Craft

Bienvenue ! Ce guide vous aide à découvrir la valeur de Claude Craft en moins de 10 minutes.

214 commandes peuvent sembler intimidantes — trouvons les 3 qui comptent le plus pour VOTRE projet, maintenant.

## Étape 1 : Détection de Votre Stack Projet (30 secondes)

Analyse de votre projet pour identifier la stack technologique...

**Actions :**
1. Vérifier les marqueurs technologiques dans le répertoire racine :
   - `package.json` → JavaScript/TypeScript (React, Angular, Vue.js, React Native)
   - `composer.json` → PHP (Symfony, Laravel)
   - `pyproject.toml` ou `requirements.txt` → Python
   - `pubspec.yaml` → Flutter/Dart
   - `*.csproj` ou `*.sln` → C# / .NET
   - `Cargo.toml` → Rust (Paperclip)
   - `go.mod` → Go
   - `mix.exs` → Elixir

2. Pour les projets JavaScript/TypeScript, vérifier les dépendances pour déterminer le framework :
   - Chercher `react`, `@angular/core`, `vue`, `react-native` dans les dépendances package.json

3. Si plusieurs fichiers technologiques trouvés :
   - Demander à l'utilisateur quelle stack prioriser
   - Stocker la stack détectée

**Format de sortie :**

```
✓ Stack Détectée : [Nom de la Technologie]

Votre projet utilise [Technologie]. Claude Craft dispose de commandes et agents spécialisés pour cette stack.
```

## Étape 2 : Proposer 3 Actions à Fort Impact (1 minute)

Basé sur la stack détectée, recommander 3 commandes contextualisées qui apportent une valeur immédiate.

### Mapping Stack vers Commandes

**Symfony / PHP :**
- `/symfony:check-architecture` — Vérifier conformité Clean Architecture + DDD
- `/symfony:check-testing` — Analyser couverture et qualité des tests
- `/symfony:check-security` — Audit de sécurité OWASP Top 10:2025

**React :**
- `/react:check-code-quality` — TypeScript, ESLint, standards de code
- `/react:accessibility-check` — Audit de conformité WCAG
- `/react:bundle-analyze` — Identifier problèmes de taille de bundle

**Python :**
- `/python:check-code-quality` — Ruff, type hints, PEP 8
- `/python:check-security` — Scan de sécurité Bandit
- `/python:type-coverage` — Analyse de couverture MyPy/Pyright

**Flutter / Dart :**
- `/flutter:check-testing` — Couverture de tests et golden tests
- `/flutter:analyze-performance` — Analyse de reconstruction de widgets
- `/flutter:golden-update` — Mise à jour des tests de régression visuelle

**Vue.js :**
- `/vuejs:check-code-quality` — Composition API, TypeScript, ESLint
- `/vuejs:check-architecture` — Validation structure de fonctionnalités
- `/vuejs:check-security` — Audit XSS, CSP, OWASP

**Laravel :**
- `/laravel:check-code-quality` — PSR-12, Pest 4, standards de code
- `/laravel:check-testing` — Couverture de tests avec Pest
- `/laravel:check-security` — Audit OWASP, configuration Sanctum

**Angular :**
- `/angular:check-code-quality` — Signals, composants standalone, ESLint
- `/angular:check-architecture` — Structure de modules, graphe de dépendances
- `/angular:check-security` — Protection XSS, en-têtes de sécurité

**React Native :**
- `/reactnative:check-code-quality` — TypeScript, ESLint, patterns de code
- `/reactnative:check-architecture` — Structure de fonctionnalités, navigation
- `/reactnative:app-size` — Analyse de taille de bundle

**C# / .NET :**
- `/csharp:check-architecture` — Validation Clean Architecture + CQRS
- `/csharp:check-testing` — Couverture et qualité xUnit
- `/csharp:check-security` — Audit OWASP pour .NET

**PHP (standalone) :**
- `/php:check-code-quality` — PSR-12, PHPStan Niveau 10
- `/php:check-testing` — Couverture de tests Pest 4
- `/php:check-security` — Bonnes pratiques de sécurité

**Inconnu/Multi-stack :**
- `/common:audit-freshness` — Vérifier mises à jour de dépendances et sécurité
- `/common:pre-commit-check` — Portes qualité avant commits
- `/team:audit` — Audit projet complet (architecture, sécurité, performance)

### Format de Sortie

```
ℹ Gains Rapides Recommandés pour [Technologie]

Basé sur votre stack, ces 3 commandes vous donneront des insights immédiats :

1. ✓ /[commande-1] — [Explication en 2 phrases de la valeur]
   Pourquoi maintenant ? [1 phrase sur le bénéfice TTFV]

2. ✓ /[commande-2] — [Explication en 2 phrases de la valeur]
   Pourquoi maintenant ? [1 phrase sur le bénéfice TTFV]

3. ✓ /[commande-3] — [Explication en 2 phrases de la valeur]
   Pourquoi maintenant ? [1 phrase sur le bénéfice TTFV]

Choisissez une commande à exécuter (tapez le numéro 1-3), ou passez pour explorer les 214 commandes avec /help
```

## Étape 3 : Exécuter avec Commentaire Pédagogique (5 minutes)

Quand l'utilisateur sélectionne une action (1, 2, ou 3) :

### Avant Exécution

Expliquer la commande en termes simples :

```
▶ Exécution de /[commande-sélectionnée]...

Cette commande va :
- [Ce qu'elle fait techniquement]
- [Quels insights vous allez obtenir]
- [Comment elle aide à améliorer la qualité / sécurité / architecture du code]

C'est votre première valeur de Claude Craft — voyons ce que nous trouvons.
```

### Pendant Exécution

Exécuter la commande sélectionnée avec les arguments appropriés (généralement répertoire courant).

### Après Exécution

Résumer les résultats dans un langage accessible :

```
✓ Analyse Terminée

Résultats Clés :
- [Résumer top 3 trouvailles en langage simple]
- [Traduire problèmes techniques en actions concrètes]
- [Mettre en avant gains rapides vs améliorations long terme]

Score : [X]/100 (si applicable)

Ce que cela signifie :
[2-3 phrases expliquant le score et prochaines étapes en langage clair]
```

## Étape 4 : Prochaines Étapes (1 minute)

Suggérer des actions de suivi concrètes :

```
⚡ Et Maintenant ?

Choisissez votre chemin :

A. Exécuter un autre check
   ℹ /[commande-restante-1] — [brève description]
   ℹ /[commande-restante-2] — [brève description]

B. Corriger une trouvaille
   → Choisissez un problème du rapport ci-dessus
   → Demandez-moi : "Aide-moi à corriger [description du problème]"
   → Je vous guiderai à travers le TDD (Développement Piloté par les Tests)

C. Rejoindre la communauté
   → Questions ? Rejoignez notre Discord : https://discord.gg/claude-craft
   → Voir directives communauté : @COMMUNITY.md

📚 Ressources :
- Guide quickstart complet : @docs/QUICKSTART.md (section "First 10 Minutes")
- Toutes les 214 commandes : /help
- Guides spécifiques à votre technologie : @.claude/references/[votre-tech]/

✓ Vous avez terminé vos 10 premières minutes avec Claude Craft !

Tapez /workflow:init quand vous êtes prêt à démarrer une fonctionnalité avec le workflow BMAD complet.
```

## Exemple de Parcours

### L'Utilisateur Tape : `/getting-started`

**Sortie Étape 1 :**
```
Analyse du projet pour marqueurs technologiques...

✓ Stack Détectée : React

Votre projet utilise React 19.x. Claude Craft dispose de plus de 15 commandes spécialisées pour le développement React.
```

**Sortie Étape 2 :**
```
ℹ Gains Rapides Recommandés pour React

Basé sur votre stack, ces 3 commandes vous donneront des insights immédiats :

1. ✓ /react:check-code-quality — Analyser types TypeScript, config ESLint, et standards de code
   Pourquoi maintenant ? Détecte erreurs courantes tôt et impose bonnes pratiques dans votre équipe.

2. ✓ /react:accessibility-check — Auditer conformité WCAG 2.2 et navigation clavier
   Pourquoi maintenant ? 15% des utilisateurs ont besoin de fonctionnalités d'accessibilité — trouvez les problèmes avant eux.

3. ✓ /react:bundle-analyze — Identifier grandes dépendances qui alourdissent votre bundle
   Pourquoi maintenant ? Chaque 100KB coûte de l'argent aux utilisateurs et ralentit le chargement — gains rapides ici.

Choisissez une commande à exécuter (tapez le numéro 1-3), ou passez pour explorer les 214 commandes avec /help
```

**L'Utilisateur Tape : 1**

**Sortie Étape 3 (Avant) :**
```
▶ Exécution de /react:check-code-quality...

Cette commande va :
- Scanner vos composants pour bonnes pratiques TypeScript
- Vérifier configuration ESLint et violations
- Vérifier règles React Hooks et patterns de composants

C'est votre première valeur de Claude Craft — voyons ce que nous trouvons.
```

**[La commande s'exécute]**

**Sortie Étape 3 (Après) :**
```
✓ Analyse Terminée

Résultats Clés :
- 23 composants manquent définitions de type props (correction rapide avec interfaces)
- ESLint configuré mais 47 avertissements ignorés avec // eslint-disable
- 12% d'utilisation du type 'any' (cible est <5%)

Score : 68/100

Ce que cela signifie :
Votre configuration TypeScript est solide mais nécessite du raffinement. Commencez par corriger les 23 types props manquants (gains faciles), puis attaquez les avertissements ESLint. L'utilisation de 'any' n'est pas critique mais la réduire améliore la sûreté de type.
```

**Sortie Étape 4 :**
```
⚡ Et Maintenant ?

Choisissez votre chemin :

A. Exécuter un autre check
   ℹ /react:accessibility-check — Audit conformité WCAG
   ℹ /react:bundle-analyze — Analyse taille de bundle

B. Corriger une trouvaille
   → Choisissez un problème du rapport ci-dessus
   → Demandez-moi : "Aide-moi à corriger les types props manquants dans UserProfile.tsx"
   → Je vous guiderai à travers le TDD (Développement Piloté par les Tests)

C. Rejoindre la communauté
   → Questions ? Rejoignez notre Discord : https://discord.gg/claude-craft
   → Voir directives communauté : @COMMUNITY.md

📚 Ressources :
- Guide quickstart complet : @docs/QUICKSTART.md (section "First 10 Minutes")
- Toutes les 214 commandes : /help
- Guides spécifiques React : @.claude/references/react/

✓ Vous avez terminé vos 10 premières minutes avec Claude Craft !

Tapez /workflow:init quand vous êtes prêt à démarrer une fonctionnalité avec le workflow BMAD complet.
```

## Notes d'Implémentation

### Logique de Détection Technologique

Utiliser l'outil Bash pour vérifier les fichiers :

```bash
# Vérifier package.json
test -f package.json && echo "node"

# Vérifier composer.json
test -f composer.json && echo "php"

# Vérifier pyproject.toml ou requirements.txt
(test -f pyproject.toml || test -f requirements.txt) && echo "python"

# Et ainsi de suite...
```

Pour JavaScript/TypeScript, parser package.json :

```bash
# Vérifier React
grep -q '"react"' package.json && echo "react"

# Vérifier Angular
grep -q '"@angular/core"' package.json && echo "angular"

# Vérifier Vue
grep -q '"vue"' package.json && echo "vuejs"

# Vérifier React Native
grep -q '"react-native"' package.json && echo "reactnative"
```

### Interaction Utilisateur

Le guide doit :
1. ✅ Être conversationnel et accueillant
2. ✅ Utiliser des symboles (✓, ℹ, ⚠, ✗) pour clarté visuelle
3. ✅ Garder chaque étape sous 3 minutes
4. ✅ Expliquer concepts techniques en langage simple
5. ✅ Fournir prochaines actions claires
6. ✅ Lier vers ressources pour apprentissage approfondi

### Accessibilité

Suivre standards d'accessibilité P1-06 :
- ✓ Utiliser symboles clairs avec étiquettes textuelles
- ✓ Pas d'indicateurs uniquement basés sur la couleur
- ✅ Explications en langage clair
- ✅ Navigation claire entre étapes

## Critères de Succès

L'utilisateur devrait :
- ✓ Comprendre ce que fait Claude Craft (en 2 minutes)
- ✓ Obtenir de la valeur de leur première commande (en 5 minutes)
- ✓ Savoir quoi faire ensuite (chemins clairs A/B/C)
- ✓ Se sentir confiant pour explorer davantage

Time to First Value (TTFV) : **< 10 minutes total**

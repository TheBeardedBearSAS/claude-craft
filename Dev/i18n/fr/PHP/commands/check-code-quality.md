---
description: Analyse Qualité du Code PHP
argument-hint: [arguments]
---

# Analyse Qualité du Code PHP

## Arguments

$ARGUMENTS (optionnel : chemin du projet PHP à analyser, répertoire courant par défaut)

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## MISSION

Analyser la qualité du code d'un projet PHP natif. Combiner analyse statique (PHPStan), vérifications de style (PSR-12), modernisation (Rector), et métriques de complexité. Produire un rapport actionnable avec un score sur 25.

**Règles de référence** : `.claude/rules/php-coding-standards.md`, `.claude/rules/php-quality-tools.md`

### Étape 1 : Inventaire de l'Outillage

- [ ] Lire les dépendances de dev dans `composer.json`
- [ ] Vérifier la présence de PHPStan (`phpstan.neon` / `phpstan.neon.dist`)
- [ ] Vérifier PHP-CS-Fixer (`.php-cs-fixer.dist.php`) ou PHP_CodeSniffer (`phpcs.xml`)
- [ ] Vérifier Rector (`rector.php`)
- [ ] Vérifier Psalm (optionnel) (`psalm.xml`)

**Stack attendu (2026)** :
- PHPStan niveau 10 (ou Psalm level 1)
- PHP-CS-Fixer avec PSR-12 + règles `@PHP85Migration`
- Rector avec `LevelSetList::UP_TO_PHP_85`

### Étape 2 : Conformité PSR-12 (5 pts)

```bash
docker compose exec app vendor/bin/php-cs-fixer fix --dry-run --diff --verbose
```

Vérifier :
- [ ] 0 violation de style
- [ ] `declare(strict_types=1);` sur chaque fichier
- [ ] Indentation 4 espaces, fins de ligne LF
- [ ] Visibilité des classes / méthodes / propriétés toujours explicite

### Étape 3 : Analyse Statique — PHPStan (5 pts)

```bash
docker compose exec app vendor/bin/phpstan analyse --level=max
```

Vérifier :
- [ ] Niveau 10 (ou max) passe avec 0 erreur
- [ ] Aucun `@phpstan-ignore` sans commentaire de justification
- [ ] Generics correctement typés (`@template`, `@param T`, `@return T`)
- [ ] Aucun retour `mixed` dans les APIs publiques

### Étape 4 : Sécurité des Types (4 pts)

- [ ] 100 % des paramètres typés
- [ ] 100 % des retours déclarés
- [ ] Types de propriétés déclarés (PHP 7.4+)
- [ ] Propriétés readonly utilisées quand la mutation est interdite (PHP 8.1+)
- [ ] Property Hooks utilisés pour les propriétés calculées (PHP 8.4+)
- [ ] Visibilité asymétrique utilisée si pertinent (PHP 8.4+)

### Étape 5 : KISS / DRY / YAGNI (4 pts)

- [ ] Complexité cognitive < 7 par méthode (cible), < 10 max
- [ ] Méthodes < 20 lignes
- [ ] Complexité cyclomatique < 10
- [ ] Pas de code mort (vérifier avec `vimeo/psalm --find-dead-code` ou `rector`)
- [ ] DRY : règles métier en un seul endroit (Value Objects pour la validation)
- [ ] YAGNI : pas d'abstraction spéculative — règle des 3 avant d'extraire

**Commande de détection** :

```bash
docker compose exec app vendor/bin/phpmetrics --report-cli src/
```

### Étape 6 : Nommage & Documentation (4 pts)

- [ ] Noms de classes en `PascalCase`, méthodes en `camelCase`, constantes `UPPER_SNAKE_CASE`
- [ ] Noms explicites (pas de `getData`, `process`, `manager` sans contexte)
- [ ] PHPDoc sur les APIs publiques uniquement pour les generics complexes (types déjà dans la signature)
- [ ] Pas de commentaires orphelins décrivant le QUOI (expliquer uniquement le POURQUOI)

### Étape 7 : Gestion des Erreurs (3 pts)

- [ ] Exceptions spécifiques au domaine, pas de `\Exception` générique
- [ ] Pas d'erreurs silencieuses (opérateur `@` interdit)
- [ ] Null safety : préférer les types `Option`/`Maybe` ou nullable explicite + early return
- [ ] Les exceptions ne sont jamais capturées pour être ignorées silencieusement

## FORMAT DE SORTIE

```
AUDIT QUALITÉ DU CODE PHP
=========================

SCORE : XX/25

PSR-12 (X/5)
  Violations php-cs-fixer : N
  Problèmes critiques :
  - [fichier:ligne] description

PHPSTAN (X/5)
  Niveau atteint : N/10
  Erreurs restantes : N
  Principaux blocages :
  - [fichier:ligne] description

SÉCURITÉ DES TYPES (X/4)
  Paramètres non typés : N
  Retours non typés : N
  Types de propriétés manquants : N

KISS / DRY / YAGNI (X/4)
  Méthodes à complexité élevée (>10) : N
  Blocs dupliqués : N
  Code mort : N

NOMMAGE & DOCS (X/4)
  Noms non explicites : N
  PHPDoc obsolètes : N

GESTION DES ERREURS (X/3)
  Usages de @ : N
  \Exception génériques levées : N

TOP 3 QUICK WINS :
1. Exécuter `vendor/bin/php-cs-fixer fix` — effort nul, corrige N violations
2. [...]
3. [...]

TOP 3 ACTIONS LONG TERME :
1. Atteindre PHPStan level max — répartir sur 3 sprints
2. [...]
3. [...]
```

## NOTES IMPORTANTES

- Toujours utiliser Docker (`docker compose exec app ...`)
- Ne jamais abaisser les niveaux PHPStan sans message de commit justifiant la raison
- Préférer Rector pour la modernisation en masse (sets de migration PHP 8.5)
- Une couverture à 100 % sans mutation testing est un faux sentiment de sécurité — rapporter le score de mutation si Infection est configuré

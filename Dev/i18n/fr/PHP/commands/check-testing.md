---
description: Analyse de Couverture des Tests PHP
argument-hint: [arguments]
---

# Analyse de Couverture des Tests PHP

## Arguments

$ARGUMENTS (optionnel : chemin du projet PHP à auditer, répertoire courant par défaut)

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## MISSION

Auditer la stratégie, la couverture et la qualité des tests d'un projet PHP natif. Évaluer la pyramide de tests (unitaires, intégration, end-to-end), les pratiques Pest / PHPUnit, le mutation score et l'hygiène des fixtures. Produire un rapport avec un score sur 25.

**Règles de référence** : `.claude/rules/php-testing.md`

### Étape 1 : Inventaire de la Suite de Tests

- [ ] Lire `phpunit.xml` / `phpunit.xml.dist` ou la configuration Pest
- [ ] Vérifier la présence de Pest 4.5+ (`pestphp/pest`) ou PHPUnit 12+
- [ ] Vérifier Infection (`infection/infection`) pour le mutation testing
- [ ] Vérifier Mockery, Prophecy, ou les doubles natifs PHPUnit
- [ ] Lire la structure de `tests/` : Unit / Integration / Feature / Browser

**Arborescence attendue** :

```
tests/
├── Unit/           # Rapides, pas d'IO, Domain + Application
├── Integration/    # DB, filesystem, adapters externes
├── Feature/        # Niveau use case, end-to-end dans les frontières de l'app
└── Fixtures/       # Factories de données de test, builders
```

### Étape 2 : Couverture (7 pts)

```bash
docker compose exec app vendor/bin/pest --coverage --min=80
# ou
docker compose exec app vendor/bin/phpunit --coverage-text --coverage-html=var/coverage
```

Vérifier :
- [ ] Couverture globale des lignes ≥ 80 %
- [ ] Couverture Domain ≥ 95 % (c'est là que les bugs coûtent le plus cher)
- [ ] Couverture Application ≥ 90 %
- [ ] Couverture Infrastructure ≥ 70 % (testée en intégration)
- [ ] Rapport de couverture publié en CI

**Barème** :
- ≥ 90 % : 7 pts
- 80–89 % : 5 pts
- 70–79 % : 3 pts
- < 70 % : 0 pt

### Étape 3 : Tests Unitaires — Domain (6 pts)

- [ ] Chaque Value Object a des tests d'invariants (les entrées invalides lèvent une exception)
- [ ] Chaque Entity a des tests d'identité + comportement
- [ ] Aggregates testés pour l'application des invariants
- [ ] Émission des domain events testée
- [ ] Aucun IO / aucun mock nécessaire (vrais tests unitaires)
- [ ] Pattern AAA (Arrange-Act-Assert) respecté

### Étape 4 : Tests d'Intégration (4 pts)

- [ ] Adapters de base de données testés contre une vraie DB (Postgres/MySQL en Docker)
- [ ] Adapters HTTP testés avec des fixtures enregistrées (pattern VCR) ou un mock server
- [ ] Adapters filesystem testés avec des répertoires temporaires
- [ ] **Pas de mock sur l'adapter testé** — les mocks masquent les ruptures de contrat

### Étape 5 : Qualité des Tests — Pest / PHPUnit (3 pts)

- [ ] Les noms de tests décrivent le comportement : `it('rejects empty email')` / `testRejectsEmptyEmail`
- [ ] Un groupe d'assertions par test (plusieurs `expect()` OK si même comportement)
- [ ] Aucun `$this->markTestSkipped()` sans référence de ticket
- [ ] Aucun test commenté
- [ ] `setUp` / `beforeEach` minimaux ; préférer des factories/builders

### Étape 6 : Fixtures & Data Builders (3 pts)

- [ ] Factories présentes pour les aggregates (ex. `UserFactory::make()->withEmail(...)`)
- [ ] Pas de données magiques dans les tests — constantes nommées ou builders
- [ ] Fixtures réinitialisées entre les tests (rollback de transaction pour les tests DB)
- [ ] Faker ou données fake déterministes

### Étape 7 : Mutation Testing & Isolation (2 pts)

```bash
docker compose exec app vendor/bin/infection --min-msi=70 --min-covered-msi=80
```

Vérifier :
- [ ] Mutation Score Indicator (MSI) ≥ 70 % (cible 80 %)
- [ ] Tests indépendants (ordre aléatoire doit passer)
- [ ] Pas d'état mutable partagé entre tests
- [ ] Temps et aléatoire injectés (pas de `time()` / `rand()` directement)

## FORMAT DE SORTIE

```
AUDIT TESTS PHP
===============

SCORE : XX/25

COUVERTURE (X/7)
  Globale        : XX %
  Domain         : XX %
  Application    : XX %
  Infrastructure : XX %
  Lacunes :
  - src/Domain/... : 0 % de couverture

TESTS UNITAIRES — DOMAIN (X/6)
  Entities testées : N/M
  Value Objects testés : N/M
  Manquants :
  - src/Domain/ValueObject/Email.php

INTÉGRATION (X/4)
  Vraie DB utilisée : oui/non
  Adapters mockés (red flag) : N

QUALITÉ DES TESTS (X/3)
  Tests skippés sans ticket : N
  Tests commentés : N

FIXTURES (X/3)
  Factories présentes : oui/non
  Nombre de données magiques : N

MUTATION & ISOLATION (X/2)
  MSI : XX %
  Tests flaky détectés : N

TOP 3 ACTIONS :
1. [CRITIQUE] Ajouter des tests unitaires pour src/Domain/...
2. Configurer Infection avec MSI ≥ 70
3. Remplacer les mocks d'adapters par une vraie DB dans tests/Integration/
```

## NOTES IMPORTANTES

- **Règle d'or** : un bug corrigé ne doit jamais régresser → ajouter un test de régression AVANT la correction
- La couverture seule n'est pas la qualité → rapporter le mutation score (Infection)
- Les tests d'intégration NE DOIVENT PAS mocker l'adapter testé — les mocks cachent les ruptures de contrat
- Pest 4.5+ embarque Browser Testing (propulsé par Playwright) — utile pour les scénarios HTTP/CLI end-to-end
- Utiliser Docker pour l'ensemble du pipeline de tests afin d'éviter les divergences d'environnement local

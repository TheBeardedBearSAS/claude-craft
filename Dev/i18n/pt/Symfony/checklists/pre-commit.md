# Checklist: Avant chaque commit

> **Obligatoire avant git commit** - Garantir la qualité du code
> Reference: `.claude/rules/04-testing-tdd.md`, `.claude/rules/03-coding-standards.md`

## Quick command

```bash
# Tout valider en une commande
make quality && make test

# Ou si Makefile non disponible:
composer phpstan && composer cs-fix && docker compose exec php bin/phpunit
```

---

## 1. Tests automatisés

### ✅ Tous les tests passent

```bash
# Tests unitaires
make test-unit
# ou: docker compose exec php bin/phpunit --testsuite=unit

# Tests d'intégration
make test-integration
# ou: docker compose exec php bin/phpunit --testsuite=integration

# Tests Behat (BDD)
make test-behat
# ou: docker compose exec php vendor/bin/behat

# TOUS les tests
make test
```

**Critère de succès:**
- ✅ Tous les tests passent (0 failed)
- ✅ Pas de tests skipped (sauf raison valable)
- ✅ Pas de warnings

**If failure:**
- ❌ Ne PAS commit
- 🔧 Corriger les tests ou le code
- 🔁 Relancer les tests

---

## 2. Analysis statique (PHPStan)

### ✅ Niveau 8 PHPStan sans erreurs

```bash
make phpstan
# ou: docker compose exec php vendor/bin/phpstan analyse
```

**Critère de succès:**
- ✅ 0 erreur PHPStan niveau 8
- ✅ Types corrects partout
- ✅ Pas de code mort détecté

**Erreurs fréquentes à vérifier:**
```php
// ❌ Type manquant
public function calculate($amount) { }

// ✅ Type explicite
public function calculate(Money $amount): Money { }

// ❌ Array sans type
/** @var array */
private $items;

// ✅ Array typé
/** @var array<int, Participant> */
private array $participants;
```

**If failure:**
- 🔧 Ajouter les types manquants
- 🔧 Corriger les incohérences de types
- 📖 Reference: `.claude/rules/03-coding-standards.md`

---

## 3. Coding Standards (PHP CS Fixer)

### ✅ Code formaté selon PSR-12

```bash
make cs-fix
# ou: docker compose exec php vendor/bin/php-cs-fixer fix
```

**Critère de succès:**
- ✅ Code formaté automatiquement
- ✅ PSR-12 respecté
- ✅ Pas de trailing whitespace
- ✅ Indentation cohérente (4 espaces)

**Verifications automatiques:**
- Déclaration de types stricte (`declare(strict_types=1);`)
- Imports triés alphabétiquement
- Ligne vide avant `return`
- Pas de `else` inutiles
- `final` sur toutes les classes

**If failure:**
- ✅ Le fixer corrige automatiquement
- ✅ Check les changements avec `git diff`
- ✅ Committer les corrections de style

---

## 4. Docker (Hadolint)

### ✅ Dockerfile valide (si modifié)

```bash
make hadolint
# ou: docker run --rm -i hadolint/hadolint < Dockerfile
```

**Critère de succès:**
- ✅ Pas d'erreurs Hadolint
- ✅ Bonnes pratiques Docker respectées
- ✅ Images avec version fixe (pas `:latest`)

**Verifications clés:**
```dockerfile
# ❌ Version non fixée
FROM php:fpm

# ✅ Version explicite
FROM php:8.2-fpm-alpine

# ❌ apt-get sans cleanup
RUN apt-get install -y curl

# ✅ Cleanup dans la même layer
RUN apt-get update && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
```

**If failure:**
- 🔧 Corriger le Dockerfile
- 📖 Reference: `.claude/rules/03-coding-standards.md` (section Docker)

---

## 5. Coverage de tests

### ✅ Coverage minimum 80%

```bash
make test-coverage
# ou: docker compose exec php bin/phpunit --coverage-html build/coverage

# Ouvrir le rapport
open build/coverage/index.html
```

**Critère de succès:**
- ✅ Coverage global ≥ 80%
- ✅ Nouvelles classes/méthodes testées
- ✅ Branches principales couvertes

**Si coverage < 80%:**
- ⚠️ Acceptable si:
  - Code legacy non touché
  - Getters/setters simples
  - Configuration/bootstrap
- ❌ Non acceptable si:
  - Nouvelle logique métier non testée
  - Nouvelles méthodes publiques non testées

**Actions:**
- 🔧 Ajouter tests unitaires manquants
- 🔧 Ajouter tests d'intégration si nécessaire
- 📖 Reference: `.claude/rules/04-testing-tdd.md`

---

## 6. Message de commit (Conventional Commits)

### ✅ Message conforme à la convention

```bash
# Format:
<type>(<scope>): <description>

[corps optionnel]

[footer optionnel]
```

**Types autorisés:**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `refactor`: Refactoring (pas de changement fonctionnel)
- `test`: Ajout/modification de tests
- `docs`: Documentation uniquement
- `style`: Formatage (pas de changement de code)
- `perf`: Amélioration de performance
- `chore`: Tâches techniques (deps, config, etc.)

**Exemples VALIDES:**

```bash
feat(reservation): ajoute supplément single pour 1 participant

Implémente la règle métier de +30% sur le prix si un seul participant.

Closes #42
```

```bash
fix(participant): corrige validation âge minimum

Ajout de la vérification que le participant soit majeur (≥18 ans).

BREAKING CHANGE: Les participants mineurs ne sont plus acceptés.
```

```bash
test(reservation): ajoute tests calcul prix total

Couvre les cas:
- 1 participant (avec supplément)
- 2+ participants (sans supplément)
- Avec options payantes
```

```bash
refactor(value-object): extrait Money dans un VO

Remplace les int/float par l'objet Money pour éviter les erreurs
de calcul avec les montants.
```

**Exemples INVALIDES:**

```bash
❌ "update code"  (trop vague)
❌ "fix bug"      (quel bug ?)
❌ "WIP"          (ne pas commit du WIP)
❌ "mise à jour"  (en français, type manquant)
```

**Règles:**
- Description en français (code en anglais)
- Impératif présent ("ajoute" pas "ajouté")
- Première lettre minuscule
- Pas de point final
- Max 72 caractères pour la première ligne
- Corps détaillé si nécessaire (après ligne vide)

**Si non conforme:**
- 🔧 Reformuler le message
- 📖 Reference: https://www.conventionalcommits.org/

---

## 7. Documentation (si applicable)

### ✅ Documentation mise à jour

**Check si nécessaire:**
- [ ] README.md mis à jour (nouvelle feature, changement d'API)
- [ ] PHPDoc complète sur méthodes publiques
- [ ] ADR (Architecture Decision Record) si décision importante
- [ ] CHANGELOG.md mis à jour (si versioning)

**Exemples nécessitant doc:**
- Nouvelle route API
- Nouvelle commande CLI
- Changement de config (env vars, services.yaml)
- Breaking change

**Si documentation manquante:**
- 🔧 Ajouter la documentation nécessaire
- 📖 Reference: `.claude/rules/03-coding-standards.md`

---

## 8. Sécurité & RGPD (si données personnelles)

### ✅ Conformité sécurité/RGPD

**Si le commit touche des données personnelles:**
- [ ] Données chiffrées en BDD (`doctrine-encrypt-bundle`)
- [ ] Validation stricte des inputs
- [ ] Pas de données sensibles en logs
- [ ] Consentement RGPD si nouvelle collecte
- [ ] Pas de secrets en clair (`.env`, pas de commit)

**Check:**
```bash
# Chercher des secrets potentiels
git diff --cached | grep -i 'password\|secret\|api_key'

# Pas de .env commité
git diff --cached --name-only | grep '.env$'
```

**Si violation détectée:**
- ❌ Ne PAS commit
- 🔧 Retirer les secrets
- 🔧 Utiliser variables d'environnement
- 📖 Reference: `.claude/rules/07-security-rgpd.md`

---

## Checklist finale avant commit

```bash
# 1. Statut propre
git status

# 2. Diff review
git diff --cached

# 3. Qualité OK
make quality
✅ PHPStan: 0 erreurs
✅ CS-Fixer: Code formaté

# 4. Tests OK
make test
✅ Tests unitaires: PASSED
✅ Tests intégration: PASSED
✅ Tests Behat: PASSED

# 5. Coverage OK
make test-coverage
✅ Coverage: ≥ 80%

# 6. Message commit préparé
✅ Format: <type>(<scope>): <description>
✅ Description claire et concise

# 7. Si tout OK → COMMIT
git add .
git commit -m "feat(reservation): ajoute supplément single pour 1 participant

Implémente la règle métier de +30% sur le prix si un seul participant.
Tests unitaires et d'intégration ajoutés.
Coverage: 85%

Closes #42
"
```

---

## Examples de workflow complet

### Workflow 1: Nouvelle feature

```bash
# 1. Développement TDD
vim tests/Unit/Service/ReservationServiceTest.php  # RED
vim src/Service/ReservationService.php             # GREEN
make test-unit                                     # ✅

# 2. Qualité
make cs-fix                                        # Auto-format
make phpstan                                       # ✅ Niveau 8

# 3. Tests complets
make test                                          # ✅ Tous passent

# 4. Coverage
make test-coverage                                 # ✅ 85%

# 5. Commit
git add .
git commit -m "feat(reservation): ajoute calcul prix avec options

Implémente le calcul du prix total incluant:
- Prix de base × nb participants
- Supplément single si 1 participant
- Options payantes (assurance, etc.)

Tests: 12 tests ajoutés (85% coverage)
PHPStan: niveau 8 OK

Closes #45
"
```

### Workflow 2: Fix de bug

```bash
# 1. Test de non-régression (RED)
vim tests/Unit/ValueObject/MoneyTest.php
make test-unit                                     # ❌ Failed (attendu)

# 2. Fix (GREEN)
vim src/ValueObject/Money.php
make test-unit                                     # ✅ Passed

# 3. Qualité
make quality                                       # ✅ OK

# 4. Commit
git commit -m "fix(value-object): corrige arrondi dans Money::multiply

Le calcul multiply() arrondissait incorrectement les centimes,
causant des écarts de prix de 0.01€.

Ajout de round() avec PHP_ROUND_HALF_UP.

Fixes #67
"
```

---

## En cas de problème

### Tests échouent

```bash
# Identifier le test qui échoue
make test-unit --verbose

# Debug
docker compose exec php bin/phpunit --filter=testMethodName --debug

# Vérifier les fixtures
docker compose exec php bin/console doctrine:fixtures:load --env=test
```

### PHPStan échoue

```bash
# Voir les erreurs détaillées
make phpstan --verbose

# Analyser un fichier spécifique
docker compose exec php vendor/bin/phpstan analyse src/Service/ReservationService.php -l 8
```

### Coverage trop bas

```bash
# Voir les fichiers non couverts
make test-coverage

# Ajouter tests manquants
vim tests/Unit/[ClassToTest]Test.php
```

---

## Commande all-in-one

```bash
# Script qui fait tout (à ajouter au Makefile)
make pre-commit
```

```makefile
# Makefile
.PHONY: pre-commit
pre-commit: ## Validation complète avant commit
	@echo "🔍 PHPStan..."
	@$(MAKE) phpstan
	@echo "✅ PHPStan OK"
	@echo ""
	@echo "🎨 CS-Fixer..."
	@$(MAKE) cs-fix
	@echo "✅ Code formaté"
	@echo ""
	@echo "🧪 Tests..."
	@$(MAKE) test
	@echo "✅ Tests OK"
	@echo ""
	@echo "📊 Coverage..."
	@$(MAKE) test-coverage
	@echo "✅ Coverage OK"
	@echo ""
	@echo "🐳 Hadolint..."
	@$(MAKE) hadolint || true
	@echo ""
	@echo "🎉 Prêt à commit!"
```

Utilisation:
```bash
make pre-commit && git commit
```

---

## Rappels importants

### ⚠️ Ne JAMAIS commit

- ❌ Tests qui échouent
- ❌ Code qui ne compile pas
- ❌ Erreurs PHPStan niveau 8
- ❌ Secrets/mots de passe en clair
- ❌ Fichiers `.env` (sauf `.env.dist`)
- ❌ Code commenté (supprimer, pas commenter)
- ❌ `var_dump()`, `dd()`, `console.log()`
- ❌ `//TODO` sans ticket associé
- ❌ Code non formaté (CS-Fixer)

### ✅ Toujours commit

- ✅ Tests qui passent
- ✅ Code formaté (PSR-12)
- ✅ PHPStan niveau 8 OK
- ✅ Documentation à jour
- ✅ Message de commit clair
- ✅ Coverage ≥ 80%

---

**Estimated time pour cette checklist:** 2-5 minutes

**Si ça prend plus de 5 minutes:** Il y a probablement un problème à corriger avant de commit.

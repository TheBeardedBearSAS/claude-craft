# Checklist: Nouvelle fonctionnalité

> **Processus complet** pour implémenter une nouvelle feature
> Référence: `.claude/rules/01-architecture-ddd.md`, `.claude/rules/04-testing-tdd.md`

## Vue d'ensemble

```
1. ANALYSE (30 min)     → Template: .claude/templates/analysis.md
2. TDD RED (1h)         → Template: .claude/templates/test-*.md
3. TDD GREEN (2h)       → Templates: .claude/templates/*.md
4. TDD REFACTOR (1h)    → Principes SOLID
5. VALIDATION (30 min)  → Checklist pre-commit
```

**Temps estimé total:** 5 heures pour une feature moyenne

---

## Phase 1: Analyse pré-implémentation

### ✅ Analyse complète documentée

**Template:** `.claude/templates/analysis.md`

```bash
# Créer le document d'analyse
vim docs/analysis/[YYYY-MM-DD]-[feature-name].md
```

**Contenu obligatoire:**
- [ ] **Objectif métier** clairement défini
- [ ] **Critères d'acceptation** (3-5 critères testables)
- [ ] **Fichiers impactés** (nouveaux + modifiés)
- [ ] **Impacts identifiés:**
  - [ ] Breaking changes (oui/non + détails)
  - [ ] Migration BDD (oui/non + script)
  - [ ] Performance (benchmarks si nécessaire)
  - [ ] RGPD (données perso + chiffrement)
- [ ] **Risques + mitigations** (tableau)
- [ ] **Approche TDD** (tests à écrire AVANT)
- [ ] **Validation** (relecture équipe)

**Exemple concret:**
```markdown
# Analyse: Supplément single sur réservations

## Objectif
Ajouter un supplément de 30% sur le prix total si la réservation
ne contient qu'un seul participant.

## Critères d'acceptation
- [ ] 1 participant → prix × 1.30
- [ ] 2+ participants → pas de supplément
- [ ] Affichage du détail dans le récapitulatif
- [ ] Email de confirmation inclut le détail

## Fichiers impactés
Nouveaux:
- tests/Unit/Service/PrixCalculatorServiceTest.php

Modifiés:
- src/Service/PrixCalculatorService.php
- src/Entity/Reservation.php
- templates/emails/confirmation_client.html.twig

## Impacts
- Breaking changes: NON
- Migration BDD: NON
- Performance: OK (calcul simple)
- RGPD: NON (pas de données perso)

## Tests TDD
1. it_applies_single_supplement_when_one_participant()
2. it_does_not_apply_supplement_when_multiple_participants()
3. it_calculates_correct_total_with_supplement()
```

**Validation avant de passer à la suite:**
- [ ] Analyse relue par au moins 1 personne
- [ ] Approche technique validée
- [ ] Tests TDD définis

---

## Phase 2: TDD - RED (Tests qui échouent)

### ✅ Tests écrits AVANT l'implémentation

**Templates:**
- `.claude/templates/test-unit.md`
- `.claude/templates/test-integration.md`
- `.claude/templates/test-behat.md`

### 2.1 Tests unitaires

```bash
# Créer le test AVANT le code
vim tests/Unit/Service/PrixCalculatorServiceTest.php
```

```php
<?php
// Test qui va échouer (classe n'existe pas encore)

class PrixCalculatorServiceTest extends TestCase
{
    /** @test */
    public function it_applies_single_supplement_when_one_participant(): void
    {
        // ARRANGE
        $calculator = new PrixCalculatorService();
        $reservation = $this->createReservation(1); // 1 participant

        // ACT
        $total = $calculator->calculate($reservation);

        // ASSERT
        $basePrice = 1000.00;
        $expectedWithSupplement = 1300.00; // +30%
        $this->assertEquals($expectedWithSupplement, $total->toEuros());
    }
}
```

**Lancer le test (doit ÉCHOUER):**
```bash
make test-unit
# ❌ Class PrixCalculatorService not found (ATTENDU)
```

### 2.2 Tests d'intégration

```bash
vim tests/Integration/Controller/ReservationControllerTest.php
```

```php
/** @test */
public function it_calculates_price_with_single_supplement(): void
{
    // ARRANGE
    $client = static::createClient();
    $sejour = $this->createSejour(1000.00); // Prix base

    // ACT
    $client->request('POST', '/api/reservation/create', [
        'sejour_id' => $sejour->getId(),
        'participants' => [
            ['nom' => 'Dupont', 'prenom' => 'Jean', 'date_naissance' => '1990-01-15'],
        ],
    ]);

    // ASSERT
    $response = json_decode($client->getResponse()->getContent(), true);
    $this->assertEquals(1300.00, $response['montant_total']);
}
```

### 2.3 Tests BDD (Behat)

```bash
vim features/reservation_pricing.feature
```

```gherkin
Scénario: Supplément single pour 1 participant
  Étant donné un séjour à "1000.00" €
  Quand je réserve avec "1" participant
  Alors le montant total est de "1300.00 €"
  Et je vois le détail "Supplément single: +300.00 €"
```

**Lancer tous les tests (doivent TOUS ÉCHOUER):**
```bash
make test
# ❌ Tous les tests échouent (ATTENDU - phase RED)
```

**Checklist phase RED:**
- [ ] Tests unitaires écrits et échouent
- [ ] Tests d'intégration écrits et échouent
- [ ] Tests Behat écrits et échouent
- [ ] Au moins 3 tests par fonctionnalité
- [ ] Tests couvrent les cas nominaux + erreurs
- [ ] Commit des tests (même s'ils échouent)

```bash
git add tests/ features/
git commit -m "test(reservation): ajoute tests supplément single (RED)

Tests TDD phase RED pour la fonctionnalité supplément single.
Tous les tests échouent car l'implémentation n'existe pas encore.

- Tests unitaires: PrixCalculatorServiceTest
- Tests intégration: ReservationControllerTest
- Tests BDD: reservation_pricing.feature

Ref: #42
"
```

---

## Phase 3: TDD - GREEN (Implémentation minimale)

### ✅ Implémenter le strict minimum pour passer les tests

**Templates:**
- `.claude/templates/value-object.md`
- `.claude/templates/service.md`
- `.claude/templates/aggregate-root.md`

### 3.1 Implémenter le code métier

```bash
# Créer le service
vim src/Service/PrixCalculatorService.php
```

```php
<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Reservation;
use App\ValueObject\Money;

final readonly class PrixCalculatorService
{
    private const SUPPLEMENT_SINGLE_PERCENT = 30;

    public function calculate(Reservation $reservation): Money
    {
        $basePrice = $reservation->getSejour()->getPrixTtc();
        $nbParticipants = $reservation->getNbParticipants();

        $total = $basePrice->multiply($nbParticipants);

        // Supplément single si 1 seul participant
        if ($nbParticipants === 1) {
            $supplement = $total->multiply(self::SUPPLEMENT_SINGLE_PERCENT / 100);
            $total = $total->add($supplement);
        }

        return $total;
    }
}
```

### 3.2 Intégrer dans l'aggregate

```bash
vim src/Entity/Reservation.php
```

```php
public function calculerMontantTotal(): void
{
    $calculator = new PrixCalculatorService(); // TODO: inject via service
    $total = $calculator->calculate($this);
    $this->montantTotalCents = $total->toCents();
}
```

### 3.3 Lancer les tests (doivent PASSER)

```bash
make test
# ✅ Tous les tests passent (phase GREEN)
```

**Si tests échouent:**
- 🔧 Debug le test qui échoue
- 🔧 Corriger l'implémentation
- 🔁 Relancer jusqu'à GREEN

**Checklist phase GREEN:**
- [ ] Tous les tests unitaires passent
- [ ] Tous les tests d'intégration passent
- [ ] Tous les tests Behat passent
- [ ] Implémentation minimale (pas de sur-engineering)
- [ ] Pas de code mort
- [ ] Commit de l'implémentation

```bash
git add src/
git commit -m "feat(reservation): implémente supplément single (GREEN)

Implémentation minimale pour passer les tests TDD.

Logique:
- 1 participant → prix × 1.30
- 2+ participants → pas de supplément

Tests: ✅ 8/8 passed

Ref: #42
"
```

---

## Phase 4: TDD - REFACTOR (Amélioration du code)

### ✅ Améliorer le code sans changer le comportement

**Principes à appliquer:**
- SOLID (Single Responsibility, Open/Closed, etc.)
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)
- Clean Code

### 4.1 Refactoring: Dependency Injection

**AVANT (couplage fort):**
```php
public function calculerMontantTotal(): void
{
    $calculator = new PrixCalculatorService(); // ❌ New dans la méthode
    $total = $calculator->calculate($this);
}
```

**APRÈS (injection):**
```php
// Reservation.php
public function calculerMontantTotal(PrixCalculatorService $calculator): void
{
    $total = $calculator->calculate($this);
    $this->montantTotalCents = $total->toCents();
}

// ReservationService.php
public function __construct(
    private readonly PrixCalculatorService $calculator
) {}

public function createReservation(array $data): Reservation
{
    // ...
    $reservation->calculerMontantTotal($this->calculator);
}
```

### 4.2 Refactoring: Extraire Value Object

**AVANT (primitive obsession):**
```php
private const SUPPLEMENT_SINGLE_PERCENT = 30;

$supplement = $total->multiply(self::SUPPLEMENT_SINGLE_PERCENT / 100);
```

**APRÈS (Value Object):**
```php
final readonly class SupplementRate
{
    public static function single(): self
    {
        return new self(30); // 30%
    }

    private function __construct(private int $percent) {}

    public function apply(Money $amount): Money
    {
        return $amount->multiply($this->percent / 100);
    }
}

// Usage
$supplement = SupplementRate::single()->apply($total);
```

### 4.3 Lancer les tests (doivent TOUJOURS PASSER)

```bash
make test
# ✅ Tous les tests passent (pas de régression)
```

**Checklist phase REFACTOR:**
- [ ] Tests passent toujours (pas de régression)
- [ ] Code plus lisible/maintenable
- [ ] Principes SOLID respectés
- [ ] Pas de duplication
- [ ] Noms expressifs (méthodes, variables)
- [ ] Complexité réduite
- [ ] PHPStan niveau 8 OK
- [ ] Commit du refactoring

```bash
git add src/
git commit -m "refactor(reservation): améliore PrixCalculatorService (REFACTOR)

Refactoring TDD sans changement de comportement:

- Injection de dépendances (pas de new)
- Extraction Value Object SupplementRate
- Meilleure séparation des responsabilités

Tests: ✅ 8/8 passed (pas de régression)
PHPStan: niveau 8 OK

Ref: #42
"
```

---

## Phase 5: Validation finale

### ✅ Checklist complète avant merge

### 5.1 Qualité du code

```bash
# PHPStan
make phpstan
# ✅ Niveau 8, 0 erreurs

# CS-Fixer
make cs-fix
# ✅ Code formaté PER-CS 3.0

# Hadolint (si Dockerfile modifié)
make hadolint
# ✅ Pas d'erreurs
```

### 5.2 Tests complets

```bash
# Tous les tests
make test
# ✅ Tous passent

# Coverage
make test-coverage
# ✅ Coverage ≥ 80%
```

**Vérifier le rapport de coverage:**
```bash
open build/coverage/index.html
```

- [ ] Nouvelles classes/méthodes ≥ 80% couvertes
- [ ] Branches principales testées
- [ ] Cas d'erreur testés

### 5.3 Clean Architecture respectée

**Vérifier la structure:**
```
src/
├── Domain/               # Entités, Value Objects, Events
│   ├── Entity/
│   ├── ValueObject/
│   ├── Event/
│   └── Exception/
├── Application/          # Use cases, Services
│   └── Service/
└── Infrastructure/       # Repositories, Controllers
    ├── Repository/
    └── Controller/
```

**Checklist architecture:**
- [ ] Domain ne dépend de RIEN
- [ ] Application dépend de Domain uniquement
- [ ] Infrastructure dépend de Domain + Application
- [ ] Pas de couplage circulaire
- [ ] Interfaces dans Domain, implémentations dans Infrastructure

### 5.4 SOLID respecté

#### Single Responsibility Principle
- [ ] Chaque classe a UNE seule responsabilité
- [ ] Chaque méthode fait UNE seule chose

#### Open/Closed Principle
- [ ] Extensible sans modifier le code existant
- [ ] Utilise interfaces/abstract pour extension

#### Liskov Substitution Principle
- [ ] Les implémentations respectent le contrat
- [ ] Pas de surprises dans les sous-classes

#### Interface Segregation Principle
- [ ] Interfaces petites et focalisées
- [ ] Pas d'interfaces "fourre-tout"

#### Dependency Inversion Principle
- [ ] Dépend d'abstractions (interfaces)
- [ ] Pas de dépendances concrètes

### 5.5 Documentation

- [ ] PHPDoc complète sur méthodes publiques
- [ ] README.md mis à jour (si API publique)
- [ ] CHANGELOG.md mis à jour
- [ ] ADR si décision architecturale importante

**Exemple PHPDoc:**
```php
/**
 * Calcule le prix total d'une réservation
 *
 * Applique les règles métier:
 * - Prix de base × nombre de participants
 * - Supplément single (+30%) si 1 seul participant
 * - Options payantes
 *
 * @param Reservation $reservation Réservation à calculer
 * @return Money Montant total TTC
 *
 * @throws ReservationInvalideException Si réservation sans participants
 */
public function calculate(Reservation $reservation): Money
{
    // ...
}
```

### 5.6 Sécurité & RGPD

**Si données personnelles:**
- [ ] Chiffrement en BDD (`doctrine-encrypt-bundle`)
- [ ] Validation stricte inputs
- [ ] Pas de données sensibles en logs
- [ ] Consentement RGPD
- [ ] Durée de conservation définie

**Si exposition API:**
- [ ] Authentication/Authorization
- [ ] Rate limiting
- [ ] Input validation
- [ ] Output sanitization
- [ ] CORS configuré

---

## Phase 6: Pull Request

### ✅ Créer une PR de qualité

```bash
# Push de la branche
git push origin feature/supplement-single

# Créer la PR (via GitHub/GitLab)
```

**Template de PR:**
```markdown
## Description

Ajoute un supplément de 30% sur le prix total des réservations
avec un seul participant (chambre single).

## Motivation

Alignement avec la politique tarifaire des hôtels partenaires.

## Changements

- ✅ `PrixCalculatorService`: Calcul du supplément
- ✅ `Reservation::calculerMontantTotal()`: Utilise le service
- ✅ `SupplementRate` Value Object: Encapsulation du taux
- ✅ Templates emails: Affichage du détail

## Tests

- ✅ 8 tests unitaires (100% coverage)
- ✅ 3 tests d'intégration
- ✅ 2 scénarios Behat

**Coverage:** 85% (+5%)

## Checklist

- [x] Tests passent
- [x] PHPStan niveau 8 OK
- [x] Code formaté (PER-CS 3.0)
- [x] Documentation à jour
- [x] Pas de breaking changes
- [x] Migration BDD: N/A
- [x] RGPD: N/A

## Screenshots

[Captures d'écran si UI]

## Closes

Closes #42
```

**Checklist PR:**
- [ ] Titre clair et concis
- [ ] Description complète
- [ ] Lien vers le ticket/issue
- [ ] Screenshots si UI
- [ ] Tests passent sur CI/CD
- [ ] Reviewers assignés
- [ ] Labels appropriés

---

## Exemple complet: Feature "Options payantes"

### Étape 1: Analyse (30 min)

```markdown
# Analyse: Options payantes sur réservations

## Objectif
Permettre d'ajouter des options payantes (assurance, supplément bagages)
sur les réservations.

## Critères d'acceptation
- [ ] Ajout d'options via formulaire
- [ ] Prix total inclut les options
- [ ] Email de confirmation liste les options
- [ ] Admin peut gérer les options disponibles

## Fichiers impactés
Nouveaux:
- src/Entity/OptionReservation.php
- src/Form/OptionType.php
- tests/Unit/Entity/OptionReservationTest.php

Modifiés:
- src/Entity/Reservation.php (relation OneToMany)
- src/Service/PrixCalculatorService.php (calcul avec options)
- templates/reservation/index.html.twig (formulaire)

## Migration BDD
```sql
CREATE TABLE option_reservation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    prix_ttc_cents INT NOT NULL,
    FOREIGN KEY (reservation_id) REFERENCES reservation(id) ON DELETE CASCADE
);
```

## Tests TDD
1. it_adds_option_to_reservation()
2. it_calculates_total_with_options()
3. it_removes_option_from_reservation()
```

### Étape 2: TDD RED (1h)

```bash
# Tests unitaires
vim tests/Unit/Entity/ReservationTest.php

# Tests intégration
vim tests/Integration/Service/ReservationServiceTest.php

# Tests Behat
vim features/reservation_options.feature

# Lancer (doivent échouer)
make test
# ❌ 12 tests failed (ATTENDU)

# Commit
git commit -m "test(reservation): ajoute tests options payantes (RED)"
```

### Étape 3: TDD GREEN (2h)

```bash
# Migration
docker compose exec php bin/console make:migration
vim migrations/Version20YYMMDDHHMMSS.php
docker compose exec php bin/console doctrine:migrations:migrate

# Entité
vim src/Entity/OptionReservation.php

# Relation
vim src/Entity/Reservation.php

# Service
vim src/Service/PrixCalculatorService.php

# Lancer (doivent passer)
make test
# ✅ 12/12 tests passed

# Commit
git commit -m "feat(reservation): implémente options payantes (GREEN)"
```

### Étape 4: TDD REFACTOR (1h)

```bash
# Extraire Value Object
vim src/ValueObject/OptionPrice.php

# Injection de dépendances
vim src/Service/PrixCalculatorService.php

# Lancer (doivent toujours passer)
make test
# ✅ 12/12 tests passed

# Commit
git commit -m "refactor(reservation): améliore gestion options (REFACTOR)"
```

### Étape 5: Validation (30 min)

```bash
# Qualité
make quality
# ✅ PHPStan + CS-Fixer OK

# Coverage
make test-coverage
# ✅ 88%

# Pre-commit checklist
make pre-commit
# ✅ Tout OK
```

### Étape 6: PR

```bash
git push origin feature/options-payantes
# Créer PR sur GitHub/GitLab
```

---

## Temps estimés par taille de feature

| Taille | Analyse | TDD RED | TDD GREEN | REFACTOR | Validation | Total |
|--------|---------|---------|-----------|----------|------------|-------|
| **Petite** (1 fichier) | 15 min | 30 min | 1h | 30 min | 15 min | **2h30** |
| **Moyenne** (3-5 fichiers) | 30 min | 1h | 2h | 1h | 30 min | **5h** |
| **Grande** (10+ fichiers) | 1h | 2h | 4h | 2h | 1h | **10h** |

---

## Checklist finale

- [ ] Phase 1: Analyse documentée et validée
- [ ] Phase 2: Tests écrits (RED)
- [ ] Phase 3: Implémentation minimale (GREEN)
- [ ] Phase 4: Refactoring SOLID (REFACTOR)
- [ ] Phase 5: Validation complète (qualité + tests)
- [ ] Phase 6: PR créée et reviewée

**Si toutes les cases cochées → MERGE!** 🎉

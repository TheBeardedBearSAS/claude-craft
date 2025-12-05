# Documentation - Atoll Tourisme

## Overview

La documentation est **OBLIGATOIRE** et doit être rédigée en **FRANÇAIS** (sauf code examples).

**Principes:**
- ✅ Documentation à jour (code = documentation)
- ✅ Français pour docs utilisateur/métier
- ✅ Anglais pour code/commentaires techniques
- ✅ ADR pour décisions architecturales importantes
- ✅ README complet et structuré

> **Références:**
> - `03-coding-standards.md` - Règles de langue (code EN, docs FR)
> - `02-architecture-clean-ddd.md` - Architecture à documenter

---

## Table des matières

1. [Standards de documentation](#standards-de-documentation)
2. [README structure](#readme-structure)
3. [PHPDoc](#phpdoc)
4. [Architecture Decision Records](#architecture-decision-records-adr)
5. [Documentation API](#documentation-api)
6. [Changelog](#changelog)

---

## Standards de documentation

### Règles de langue

| Type | Langue | Exemple |
|------|--------|---------|
| Code (variables, méthodes, classes) | 🇬🇧 Anglais | `calculateTotalPrice()`, `ReservationId` |
| Commentaires code | 🇬🇧 Anglais | `// Calculate discount for family` |
| PHPDoc (@param, @return) | 🇬🇧 Anglais | `@param Money $amount The amount to add` |
| Documentation utilisateur | 🇫🇷 Français | README.md, guides |
| Documentation métier | 🇫🇷 Français | ADR, spécifications |
| Messages d'erreur (end-user) | 🇫🇷 Français | "Réservation non trouvée" |
| Logs (technique) | 🇬🇧 Anglais | "Reservation confirmed" |

### Example

```php
<?php

namespace App\Domain\Reservation\Service;

/**
 * Calculates the total price for a reservation.
 *
 * This service applies various discount policies:
 * - Family discount (4+ participants)
 * - Early booking discount (90+ days advance)
 * - Loyalty discount (3+ previous reservations)
 *
 * @see FamilyDiscountPolicy
 * @see EarlyBookingDiscountPolicy
 */
final readonly class ReservationPricingService
{
    /**
     * @param iterable<DiscountPolicyInterface> $discountPolicies
     */
    public function __construct(
        private iterable $discountPolicies,
    ) {}

    /**
     * Calculate the total price for a reservation.
     *
     * @param Reservation $reservation The reservation to price
     * @return Money The calculated total price
     */
    public function calculateTotalPrice(Reservation $reservation): Money
    {
        // Calculate base price per participant
        $basePrice = $this->calculateBasePrice($reservation);

        // Apply all applicable discount policies
        return $this->applyDiscounts($basePrice, $reservation);
    }
}
```

---

## README structure

### Template README.md

```markdown
# Atoll Tourisme - Système de réservation

Application Symfony 6.4 LTS pour la gestion des réservations de séjours Atoll Tourisme.

## 📋 Table des matières

- [Présentation](#présentation)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Tests](#tests)
- [Qualité du code](#qualité-du-code)
- [Déploiement](#déploiement)
- [Documentation](#documentation)
- [Contribution](#contribution)
- [License](#license)

## 📖 Présentation

### Contexte métier

Atoll Tourisme organise des séjours sportifs et culturels. Cette application permet:
- Consultation du catalogue de séjours
- Réservation en ligne avec participants
- Gestion des remises (famille nombreuse, anticipée, fidélité)
- Notifications par email
- Espace administration (gestion séjours, réservations, avis)

### Stack technique

- **Backend:** Symfony 6.4 LTS
- **PHP:** 8.2+
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Frontend:** Twig + Stimulus + Tailwind CSS
- **Docker:** Obligatoire (développement et production)
- **CI/CD:** GitHub Actions

## 🏗️ Architecture

### Clean Architecture + DDD

Le projet suit une architecture en couches:

```
src/
├── Domain/          # Logique métier pure
├── Application/     # Cas d'usage (orchestration)
├── Infrastructure/  # Implementations techniques
└── Presentation/    # Controllers, Forms, Templates
```

### Bounded Contexts

- **Catalog:** Gestion des séjours et destinations
- **Reservation:** Réservations et participants
- **Notification:** Envoi d'emails

Voir [docs/architecture/README.md](docs/architecture/README.md) pour plus de détails.

## ⚙️ Prérequis

- Docker 24+ et Docker Compose 2.20+
- Make
- Git

**Aucune installation locale de PHP, Composer, npm requise.**

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/atoll-tourisme/atoll-symfony.git
cd atoll-symfony
```

### 2. Configuration environnement

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer les variables si nécessaire
nano .env
```

### 3. Build et démarrage

```bash
# Build des images Docker
make build

# Démarrage des conteneurs
make up

# Installation des dépendances
make composer-install
make npm-install

# Compilation des assets
make npm-build

# Base de données
make db-create
make migration-migrate
make fixtures

# Warmup cache
make cache-warmup
```

### 4. Accès

- **Application:** http://localhost:8080
- **Admin:** http://localhost:8080/admin
  - Login: `admin@atoll.com`
  - Password: `admin123` (à changer!)
- **MailHog:** http://localhost:8025
- **Base de données:** localhost:5432

## 🎯 Utilisation

### Commandes principales

```bash
# Démarrer les services
make up

# Arrêter les services
make down

# Logs
make logs

# Shell PHP
make shell

# Console Symfony
make console CMD="cache:clear"
make console CMD="debug:router"

# Créer une entité
make console CMD="make:entity Participant"

# Créer une migration
make migration-diff
make migration-migrate
```

### Développement quotidien

```bash
# Watch des assets
make npm-watch

# Clear cache
make cc

# Reset BDD
make db-reset
```

## 🧪 Tests

### Lancer les tests

```bash
# Tous les tests
make test

# Tests unitaires uniquement
make test-unit

# Tests d'intégration
make test-integration

# Tests fonctionnels
make test-functional

# Avec coverage
make test-coverage

# Behat (BDD)
make behat

# Mutation testing
make infection
```

### Objectifs de couverture

- **Code Coverage:** 80% minimum
- **Mutation Score:** 80% minimum
- **Tests:** TDD strict (test avant code)

## 🔍 Qualité du code

### Validation qualité

```bash
# Toutes les vérifications
make quality

# PHPStan (analyse statique)
make phpstan

# PHP-CS-Fixer (code style)
make cs-fixer-dry    # Verification
make cs-fixer        # Correction

# Rector (refactoring)
make rector-dry      # Verification
make rector          # Application

# Deptrac (architecture)
make deptrac

# Duplication
make phpcpd

# Corrections automatiques
make quality-fix
```

### Standards

- **PHPStan:** Niveau max (0 erreur)
- **Code Style:** PSR-12 + Symfony conventions
- **Architecture:** Validation Deptrac
- **Duplication:** < 3%

## 📦 Déploiement

### Production

```bash
# Build image production
docker build -t atoll-tourisme:latest .

# Run en production
docker-compose -f docker-compose.prod.yml up -d
```

Voir [docs/deployment/README.md](docs/deployment/README.md) pour le guide complet.

## 📚 Documentation

- [Architecture](docs/architecture/README.md)
- [Domain-Driven Design](docs/ddd/README.md)
- [API Documentation](docs/api/README.md)
- [ADR (Architecture Decision Records)](docs/adr/README.md)
- [Deployment Guide](docs/deployment/README.md)

## 🤝 Contribution

### Workflow

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commits conventionnels (`git commit -m 'feat(reservation): add feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

### Standards

- **TDD strict:** Tests avant code
- **Code review:** Obligatoire
- **CI:** Doit passer (tests + qualité)
- **Conventional Commits:** Obligatoire

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour plus de détails.

## 📄 License

Ce projet est sous licence MIT. Voir [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- **Product Owner:** [Nom]
- **Tech Lead:** The Bearded CTO
- **Développeurs:** [Noms]

## 📞 Support

- **Issues:** https://github.com/atoll-tourisme/atoll-symfony/issues
- **Email:** support@atoll-tourisme.fr
- **Documentation:** https://docs.atoll-tourisme.fr
```

---

## PHPDoc

### Standards PHPDoc

```php
<?php

namespace App\Domain\Reservation\Service;

use App\Domain\Reservation\Entity\Reservation;
use App\Domain\Reservation\ValueObject\Money;
use App\Domain\Reservation\Pricing\DiscountPolicyInterface;

/**
 * Service for calculating reservation total price.
 *
 * This service orchestrates the pricing calculation by:
 * 1. Computing the base price (sum of participant prices)
 * 2. Applying all applicable discount policies
 * 3. Returning the final total price
 *
 * The service follows the Strategy pattern for discount policies,
 * allowing new discount types to be added without modifying this code.
 *
 * @see DiscountPolicyInterface
 * @see FamilyDiscountPolicy
 * @see EarlyBookingDiscountPolicy
 *
 * @author The Bearded CTO <tech@atoll-tourisme.fr>
 * @since 1.0.0
 */
final readonly class ReservationPricingService
{
    /**
     * @param iterable<DiscountPolicyInterface> $discountPolicies List of discount policies to apply
     */
    public function __construct(
        private iterable $discountPolicies,
    ) {}

    /**
     * Calculate the total price for a reservation.
     *
     * The calculation process:
     * 1. Calculate base price (participants * sejour price)
     * 2. Apply age-based discounts (children, babies)
     * 3. Apply discount policies (family, early booking, loyalty)
     *
     * Example:
     * ```php
     * $reservation = Reservation::create(...);
     * $totalPrice = $pricingService->calculateTotalPrice($reservation);
     * echo $totalPrice->getAmountEuros(); // 1350.00
     * ```
     *
     * @param Reservation $reservation The reservation to calculate price for
     *
     * @return Money The calculated total price (always positive)
     *
     * @throws InvalidReservationException If reservation has no participants
     */
    public function calculateTotalPrice(Reservation $reservation): Money
    {
        if ($reservation->getParticipants()->isEmpty()) {
            throw InvalidReservationException::noParticipants();
        }

        $basePrice = $this->calculateBasePrice($reservation);

        return $this->applyDiscounts($basePrice, $reservation);
    }

    /**
     * Calculate base price (sum of all participant prices).
     *
     * Takes into account age-based pricing:
     * - Babies (< 3 years): Free
     * - Children (< 18 years): 50% of base price
     * - Adults: 100% of base price
     *
     * @param Reservation $reservation The reservation to calculate base price for
     *
     * @return Money The base price before discounts
     */
    private function calculateBasePrice(Reservation $reservation): Money
    {
        $total = Money::zero();

        foreach ($reservation->getParticipants() as $participant) {
            $participantPrice = $this->calculateParticipantPrice(
                $participant,
                $reservation->getSejour()->getPrixBase()
            );

            $total = $total->add($participantPrice);
        }

        return $total;
    }

    /**
     * Apply all applicable discount policies to the price.
     *
     * Policies are applied in order of priority (defined in each policy).
     * Only applicable policies are applied (checked via isApplicable()).
     *
     * @param Money $amount The base amount to apply discounts to
     * @param Reservation $reservation The reservation context
     *
     * @return Money The price after all applicable discounts
     */
    private function applyDiscounts(Money $amount, Reservation $reservation): Money
    {
        foreach ($this->discountPolicies as $policy) {
            if ($policy->isApplicable($reservation)) {
                $amount = $policy->apply($amount, $reservation);
            }
        }

        return $amount;
    }
}
```

### Tags PHPDoc obligatoires

| Tag | Usage | Obligatoire |
|-----|-------|-------------|
| `@param` | Paramètres méthode | Oui si paramètre |
| `@return` | Type de retour | Oui si non void |
| `@throws` | Exceptions lancées | Oui si exception |
| `@var` | Type variable | Si type complexe |
| `@see` | Références | Si pertinent |
| `@deprecated` | Méthode obsolète | Si déprécié |
| `@since` | Version introduction | Classes publiques |
| `@author` | Auteur | Classes principales |

---

## Architecture Decision Records (ADR)

### Structure ADR

```markdown
# ADR-XXX: [Titre de la décision]

**Statut:** [Proposed | Accepted | Deprecated | Superseded]

**Date:** YYYY-MM-DD

**Décideurs:** [Noms des personnes impliquées]

**Contexte technique:** [Version Symfony, PHP, etc.]

## Contexte

[Décrivez le problème ou le besoin qui nécessite une décision]

Exemple: Nous devons choisir comment stocker les montants monétaires dans l'application.
Les montants sont critiques pour le calcul des prix de réservation.

## Décision

[Décrivez la décision prise]

Exemple: Nous utiliserons un Value Object `Money` qui stocke les montants en centimes (entier)
plutôt qu'en euros (flottant).

## Options considérées

### Option 1: Float en euros

**Avantages:**
- Simple à utiliser (nombres décimaux standards)
- Lecture facile (100.50€)

**Inconvénients:**
- ❌ Précision: Erreurs d'arrondi (0.1 + 0.2 ≠ 0.3)
- ❌ Calculs: Accumulation d'erreurs sur additions multiples
- ❌ Comparaisons: Problèmes avec ===

### Option 2: Integer en centimes (CHOISI)

**Avantages:**
- ✅ Précision: Aucune erreur d'arrondi
- ✅ Calculs: Arithmétique entière exacte
- ✅ Comparaisons: Fiables
- ✅ Base de données: Type INTEGER plus performant

**Inconvénients:**
- ⚠️ Conversion: Nécessaire pour affichage (centimes → euros)
- ⚠️ Complexité: Value Object requis

### Option 3: Bibliothèque externe (moneyphp/money)

**Avantages:**
- ✅ Solution éprouvée
- ✅ Gestion multi-devises
- ✅ Formatage automatique

**Inconvénients:**
- ❌ Dépendance externe
- ❌ Over-engineering (pas besoin multi-devises)
- ❌ Courbe d'apprentissage

## Justification

Nous choisissons **Option 2 (Integer en centimes)** car:

1. **Précision critique:** Les calculs de prix doivent être exacts (légal, comptabilité)
2. **Simplicité:** Pas besoin multi-devises (EUR uniquement)
3. **Performance:** Integer plus performant que bibliotèque externe
4. **Contrôle:** Logique métier dans notre code, pas dans une dépendance

## Conséquences

### Positives

- ✅ Calculs de prix toujours exacts
- ✅ Pas de bugs d'arrondi
- ✅ Code métier explicite (Money VO)
- ✅ Type safety (PHPStan niveau max)

### Négatives

- ⚠️ Conversion nécessaire pour affichage
- ⚠️ Formation équipe sur le pattern

### Neutres

- 🔄 Migration données existantes (si applicable)

## Implémentation

```php
final readonly class Money
{
    private function __construct(
        private int $amountCents,
        private string $currency = 'EUR',
    ) {
        if ($amountCents < 0) {
            throw new \InvalidArgumentException('Amount cannot be negative');
        }
    }

    public static function fromEuros(float $amount): self
    {
        return new self((int) round($amount * 100));
    }

    public function getAmountEuros(): float
    {
        return $this->amountCents / 100;
    }

    public function add(self $other): self
    {
        return new self($this->amountCents + $other->amountCents);
    }
}
```

### Doctrine mapping

```xml
<embedded name="montantTotal" class="App\Domain\Reservation\ValueObject\Money">
    <field name="amountCents" type="integer" column="montant_total_cents"/>
    <field name="currency" type="string" column="currency" length="3"/>
</embedded>
```

## Notes

- Migration prévue: 2025-02-01
- Formation équipe: 2025-01-28
- Review après 3 mois d'utilisation

## Liens

- [PHPUnit tests](tests/Unit/Domain/Reservation/ValueObject/MoneyTest.php)
- [Documentation Money VO](docs/ddd/value-objects.md#money)
- [IEEE 754 (Float precision)](https://en.wikipedia.org/wiki/IEEE_754)

## Historique

- 2025-01-26: Décision initiale (Accepted)
```

### Liste des ADR

```
docs/adr/
├── README.md
├── 0001-use-money-value-object.md
├── 0002-clean-architecture-ddd.md
├── 0003-postgresql-database.md
├── 0004-redis-cache.md
├── 0005-symfony-messenger-async.md
├── 0006-doctrine-xml-mapping.md
└── template.md
```

---

## Documentation API

### OpenAPI / Swagger

```yaml
# docs/api/openapi.yaml

openapi: 3.0.3

info:
  title: Atoll Tourisme API
  description: API pour la gestion des réservations de séjours
  version: 1.0.0
  contact:
    name: Support Atoll Tourisme
    email: api@atoll-tourisme.fr

servers:
  - url: https://api.atoll-tourisme.fr/v1
    description: Production
  - url: https://staging-api.atoll-tourisme.fr/v1
    description: Staging
  - url: http://localhost:8080/api/v1
    description: Development

paths:
  /reservations:
    post:
      summary: Créer une réservation
      description: |
        Crée une nouvelle réservation pour un séjour.

        Le montant total est calculé automatiquement en fonction:
        - Du prix du séjour
        - De l'âge des participants
        - Des remises applicables
      operationId: createReservation
      tags:
        - Reservations
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateReservationRequest'
            example:
              sejourId: "sejour-ski-alpes-2025"
              clientEmail: "client@example.com"
              participants:
                - nom: "Jean Dupont"
                  age: 30
                - nom: "Marie Dupont"
                  age: 28
      responses:
        '201':
          description: Réservation créée avec succès
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReservationResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '422':
          $ref: '#/components/responses/ValidationError'

components:
  schemas:
    CreateReservationRequest:
      type: object
      required:
        - sejourId
        - clientEmail
        - participants
      properties:
        sejourId:
          type: string
          description: Identifiant du séjour
          example: "sejour-ski-alpes-2025"
        clientEmail:
          type: string
          format: email
          description: Email du client
          example: "client@example.com"
        participants:
          type: array
          minItems: 1
          maxItems: 10
          items:
            $ref: '#/components/schemas/ParticipantInput'

    ParticipantInput:
      type: object
      required:
        - nom
        - age
      properties:
        nom:
          type: string
          minLength: 2
          maxLength: 100
          example: "Jean Dupont"
        age:
          type: integer
          minimum: 0
          maximum: 120
          example: 30

    ReservationResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "550e8400-e29b-41d4-a716-446655440000"
        statut:
          type: string
          enum: [en_attente, confirmee, annulee, terminee]
          example: "en_attente"
        montantTotal:
          type: number
          format: float
          example: 1000.00
        devise:
          type: string
          example: "EUR"
        createdAt:
          type: string
          format: date-time
          example: "2025-01-26T10:30:00Z"

  responses:
    BadRequest:
      description: Requête invalide
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
                example: "Invalid request"

    ValidationError:
      description: Erreur de validation
      content:
        application/json:
          schema:
            type: object
            properties:
              errors:
                type: array
                items:
                  type: object
                  properties:
                    field:
                      type: string
                    message:
                      type: string
```

---

## Changelog

### Format CHANGELOG.md

```markdown
# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### Added
- Rien pour le moment

## [1.2.0] - 2025-02-15

### Added
- Système de remise fidélité pour clients réguliers
- Export CSV des réservations
- API REST pour les réservations

### Changed
- Amélioration performance calcul prix (cache Redis)
- Migration PostgreSQL 16
- Mise à jour Symfony 6.4.3

### Fixed
- Correction calcul remise famille nombreuse (#456)
- Fix envoi email confirmation double (#789)

### Security
- Chiffrement données médicales participants (RGPD)

## [1.1.0] - 2025-01-15

### Added
- Gestion des participants avec données médicales
- Notifications email automatiques
- Espace administration EasyAdmin

### Changed
- Refactoring architecture (Clean Architecture + DDD)
- Migration PHP 8.2

## [1.0.0] - 2025-01-01

### Added
- Catalogue de séjours
- Système de réservation en ligne
- Calcul automatique des prix
- Remise famille nombreuse
- Remise anticipée

[Unreleased]: https://github.com/atoll-tourisme/atoll-symfony/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/atoll-tourisme/atoll-symfony/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/atoll-tourisme/atoll-symfony/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/atoll-tourisme/atoll-symfony/releases/tag/v1.0.0
```

### Semantic Versioning

```
MAJOR.MINOR.PATCH

Exemples:
- 1.0.0 → 1.0.1 (PATCH: Bug fix)
- 1.0.1 → 1.1.0 (MINOR: Nouvelle feature backward compatible)
- 1.1.0 → 2.0.0 (MAJOR: Breaking change)
```

---

## Checklist documentation

### Before chaque commit

- [ ] **README:** À jour si changement majeur
- [ ] **PHPDoc:** Complet sur méthodes publiques
- [ ] **CHANGELOG:** Mis à jour avec les changements
- [ ] **ADR:** Créé si décision architecturale importante
- [ ] **API Docs:** OpenAPI à jour si changement API
- [ ] **Comments:** Code complexe commenté (en anglais)

### Before chaque release

- [ ] **CHANGELOG:** Complet avec tous les changements
- [ ] **README:** Instructions installation à jour
- [ ] **Docs:** Tous les docs techniques à jour
- [ ] **ADR:** Décisions importantes documentées
- [ ] **Version:** Semantic versioning respecté

---

## Ressources

- **Keep a Changelog:** https://keepachangelog.com/
- **Semantic Versioning:** https://semver.org/
- **ADR:** https://adr.github.io/
- **OpenAPI:** https://swagger.io/specification/
- **PHPDoc:** https://docs.phpdoc.org/

---

**Date de dernière mise à jour:** 2025-01-26
**Version:** 1.0.0
**Auteur:** The Bearded CTO

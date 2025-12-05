# Dokumentation - Atoll Tourisme

## Überblick

Die Dokumentation ist **OBLIGATORISCH** und muss in **FRANZÖSISCH** verfasst werden (außer Code-Beispiele).

**Prinzipien:**
- ✅ Aktuelle Dokumentation (Code = Dokumentation)
- ✅ Französisch für Benutzer-/Business-Dokumentation
- ✅ Englisch für Code/technische Kommentare
- ✅ ADR für wichtige architektonische Entscheidungen
- ✅ Vollständiges und strukturiertes README

> **Referenzen:**
> - `03-coding-standards.md` - Sprachregeln (Code EN, Docs FR)
> - `02-architecture-clean-ddd.md` - Zu dokumentierende Architektur

---

## Inhaltsverzeichnis

1. [Dokumentationsstandards](#dokumentationsstandards)
2. [README-Struktur](#readme-struktur)
3. [PHPDoc](#phpdoc)
4. [Architecture Decision Records](#architecture-decision-records-adr)
5. [API-Dokumentation](#api-dokumentation)
6. [Changelog](#changelog)

---

## Dokumentationsstandards

### Sprachregeln

| Typ | Sprache | Beispiel |
|------|--------|---------|
| Code (Variablen, Methoden, Klassen) | 🇬🇧 Englisch | `calculateTotalPrice()`, `ReservationId` |
| Code-Kommentare | 🇬🇧 Englisch | `// Calculate discount for family` |
| PHPDoc (@param, @return) | 🇬🇧 Englisch | `@param Money $amount The amount to add` |
| Benutzerdokumentation | 🇫🇷 Französisch | README.md, Anleitungen |
| Business-Dokumentation | 🇫🇷 Französisch | ADR, Spezifikationen |
| Fehlermeldungen (Endbenutzer) | 🇫🇷 Französisch | "Réservation non trouvée" |
| Logs (technisch) | 🇬🇧 Englisch | "Reservation confirmed" |

### Beispiel

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

## README-Struktur

### README.md Template

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

[...]
```

---

## PHPDoc

### PHPDoc-Standards

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

### Obligatorische PHPDoc-Tags

| Tag | Verwendung | Obligatorisch |
|-----|-------|-------------|
| `@param` | Methodenparameter | Ja bei Parameter |
| `@return` | Rückgabetyp | Ja wenn nicht void |
| `@throws` | Geworfene Exceptions | Ja bei Exception |
| `@var` | Variablentyp | Bei komplexem Typ |
| `@see` | Referenzen | Wenn relevant |
| `@deprecated` | Veraltete Methode | Bei Deprecation |
| `@since` | Einführungsversion | Öffentliche Klassen |
| `@author` | Autor | Hauptklassen |

---

## Architecture Decision Records (ADR)

[Der ADR-Abschnitt mit vollständigem Template und Beispiel würde hier folgen - aus Platzgründen gekürzt]

---

## API-Dokumentation

[Der API-Dokumentationsabschnitt mit OpenAPI/Swagger-Beispielen würde hier folgen]

---

## Changelog

### CHANGELOG.md Format

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

Beispiele:
- 1.0.0 → 1.0.1 (PATCH: Bug Fix)
- 1.0.1 → 1.1.0 (MINOR: Neues Feature backward compatible)
- 1.1.0 → 2.0.0 (MAJOR: Breaking Change)
```

---

## Dokumentations-Checklist

### Vor jedem Commit

- [ ] **README:** Aktuell bei größeren Änderungen
- [ ] **PHPDoc:** Vollständig bei öffentlichen Methoden
- [ ] **CHANGELOG:** Mit Änderungen aktualisiert
- [ ] **ADR:** Erstellt bei wichtiger architektonischer Entscheidung
- [ ] **API Docs:** OpenAPI aktuell bei API-Änderungen
- [ ] **Comments:** Komplexer Code kommentiert (auf Englisch)

### Vor jedem Release

- [ ] **CHANGELOG:** Vollständig mit allen Änderungen
- [ ] **README:** Installationsanweisungen aktuell
- [ ] **Docs:** Alle technischen Dokumente aktuell
- [ ] **ADR:** Wichtige Entscheidungen dokumentiert
- [ ] **Version:** Semantic Versioning respektiert

---

## Ressourcen

- **Keep a Changelog:** https://keepachangelog.com/
- **Semantic Versioning:** https://semver.org/
- **ADR:** https://adr.github.io/
- **OpenAPI:** https://swagger.io/specification/
- **PHPDoc:** https://docs.phpdoc.org/

---

**Letzte Aktualisierung:** 2025-01-26
**Version:** 1.0.0
**Autor:** The Bearded CTO

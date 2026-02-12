# Analyse pré-implémentation

> **Obligatoire avant toute implémentation** - Référence: `.claude/rules/03-coding-standards.md`

## Objectif

**Quelle est la fonctionnalité à implémenter ?**

[Décrire clairement l'objectif métier et technique]

**Valeur métier:**
- [En quoi cela améliore l'expérience utilisateur ou le business ?]

**Critères d'acceptation:**
- [ ] Critère 1
- [ ] Critère 2
- [ ] Critère 3

---

## Fichiers impactés

### Nouveaux fichiers à créer

```
src/
├── Entity/
│   └── [NomEntity].php
├── Repository/
│   └── [NomEntity]Repository.php
├── Service/
│   └── [NomService].php
└── Controller/
    └── [NomController].php

tests/
├── Unit/
│   └── [NomTest].php
└── Integration/
    └── [NomIntegrationTest].php
```

### Fichiers existants à modifier

- `src/Entity/Reservation.php` - [Raison de modification]
- `src/Controller/Admin/DashboardController.php` - [Raison de modification]
- `config/services.yaml` - [Configuration à ajouter]

---

## Impacts

### Breaking Changes

**Y a-t-il des breaking changes ?** ☐ OUI ☑ NON

Si OUI:
- [ ] Impact sur API publique
- [ ] Impact sur formulaires existants
- [ ] Impact sur commandes CLI
- [ ] Migration de données nécessaire

**Plan de migration:**
```
[Décrire la stratégie de migration si nécessaire]
```

### Migration base de données

**Requiert une migration ?** ☐ OUI ☑ NON

Si OUI:
```php
// Version20YYMMDDHHMMSS.php
public function up(Schema $schema): void
{
    // SQL DDL
    $this->addSql('ALTER TABLE reservation ADD COLUMN ...');
}

public function down(Schema $schema): void
{
    // Rollback
    $this->addSql('ALTER TABLE reservation DROP COLUMN ...');
}
```

**Données de test:**
```bash
make fixtures-load
```

### Performance

**Impact performance ?** ☐ OUI ☑ NON

Si OUI:
- [ ] Requêtes N+1 potentielles → Vérifier avec Symfony Profiler
- [ ] Index manquants → `CREATE INDEX idx_xxx ON table(column)`
- [ ] Cache nécessaire → Redis/Symfony Cache
- [ ] Pagination requise → Pagerfanta

**Benchmark:**
```bash
# Avant
ab -n 1000 -c 10 https://atoll.local/api/endpoint

# Après
ab -n 1000 -c 10 https://atoll.local/api/endpoint
```

### RGPD / Données personnelles

**Traite des données personnelles ?** ☐ OUI ☑ NON

Référence: `.claude/rules/07-security-rgpd.md`

Si OUI:
- [ ] Données collectées: [nom, prénom, email, téléphone, etc.]
- [ ] Consentement explicite obtenu
- [ ] Durée de conservation définie: [X mois/ans]
- [ ] Droit à l'oubli implémenté
- [ ] Chiffrement en base: `doctrine-encrypt-bundle`
- [ ] Anonymisation dans les logs

**Exemple:**
```php
use Doctrine\ORM\Mapping as ORM;
use DoctrineEncryptBundle\Configuration\Encrypted;

class Participant
{
    #[ORM\Column(type: 'string')]
    #[Encrypted]
    private string $nom; // Chiffré en BDD
}
```

---

## Risques et mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Perte de données lors de la migration | Faible | Critique | Backup BDD avant migration + migration réversible |
| Performance dégradée | Moyenne | Moyen | Index BDD + cache Redis + tests de charge |
| Régression fonctionnelle | Moyenne | Élevé | Tests automatisés exhaustifs (>80% coverage) |
| Non-conformité RGPD | Faible | Critique | Revue sécurité + chiffrement + audit logs |

---

## Approche TDD

Référence: `.claude/rules/01-architecture-ddd.md` et `.claude/rules/04-testing-tdd.md`

### 1. Tests à écrire AVANT implémentation

#### Tests unitaires (PHPUnit)

```php
// tests/Unit/Service/ReservationServiceTest.php
class ReservationServiceTest extends TestCase
{
    /** @test */
    public function it_creates_reservation_with_valid_data(): void
    {
        // ARRANGE
        $repository = $this->createMock(ReservationRepository::class);
        $service = new ReservationService($repository);

        // ACT
        $reservation = $service->create([...]);

        // ASSERT
        $this->assertInstanceOf(Reservation::class, $reservation);
    }

    /** @test */
    public function it_throws_exception_when_sejour_full(): void
    {
        // ARRANGE
        // ACT
        // ASSERT
        $this->expectException(SejourCompletException::class);
    }
}
```

#### Tests d'intégration (Symfony Kernel)

```php
// tests/Integration/Controller/ReservationControllerTest.php
class ReservationControllerTest extends WebTestCase
{
    /** @test */
    public function it_submits_reservation_form_successfully(): void
    {
        // ARRANGE
        $client = static::createClient();

        // ACT
        $crawler = $client->request('POST', '/reservation/create', [...]);

        // ASSERT
        $this->assertResponseIsSuccessful();
        $this->assertEmailCount(2); // Client + Admin
    }
}
```

#### Tests BDD (Behat)

```gherkin
# features/reservation.feature
Fonctionnalité: Création de réservation
  En tant que client
  Je veux réserver un séjour
  Afin de partir en vacances

  Scénario: Réservation avec 2 participants
    Étant donné un séjour "Guadeloupe" avec 10 places disponibles
    Quand je crée une réservation pour 2 participants
    Alors la réservation est confirmée
    Et il reste 8 places disponibles
    Et je reçois un email de confirmation
```

### 2. Cycle TDD

```
🔴 RED   → Écrire le test qui échoue
🟢 GREEN → Implémenter le minimum pour passer le test
🔵 REFACTOR → Améliorer le code (SOLID, Clean Code)
```

**Commandes:**
```bash
# RED: Test échoue
make test-unit

# GREEN: Implémentation minimale
vim src/Service/ReservationService.php

# Vérifier que ça passe
make test-unit

# REFACTOR: Améliorer le code
make quality  # PHPStan + CS-Fixer

# Vérifier que ça passe toujours
make test
```

### 3. Coverage attendu

**Objectif:** 80% minimum (référence: `.claude/rules/04-testing-tdd.md`)

```bash
make test-coverage
# Ouvre build/coverage/index.html
```

---

## Checklist validation

Avant de commencer l'implémentation:

- [ ] Analyse complétée et relue
- [ ] Impacts identifiés et mitigations définies
- [ ] Tests TDD écrits (RED)
- [ ] Approche validée par l'équipe
- [ ] Migration BDD préparée (si nécessaire)
- [ ] Conformité RGPD vérifiée (si données perso)

**Date d'analyse:** [YYYY-MM-DD]
**Analyste:** [Nom]
**Reviewers:** [Noms]

---

## Exemple concret Atoll Tourisme

### Objectif
Ajouter la gestion des options payantes sur les réservations (assurance annulation, supplément single, etc.)

### Fichiers impactés
- `src/Entity/Reservation.php` - Relation OneToMany vers OptionReservation
- `src/Entity/OptionReservation.php` - Nouvelle entité
- `src/Form/ReservationFormType.php` - Ajout CollectionType pour options

### Migration BDD
```sql
CREATE TABLE option_reservation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    prix_ttc DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (reservation_id) REFERENCES reservation(id)
);
```

### Tests TDD
```php
/** @test */
public function it_calculates_total_with_options(): void
{
    // ARRANGE
    $reservation = new Reservation();
    $reservation->setPrixBase(1000);
    $reservation->addOption(new OptionReservation('Assurance', 50));

    // ACT
    $total = $reservation->getMontantTotal();

    // ASSERT
    $this->assertEquals(1050, $total);
}
```

### Risques
- Performance: N+1 queries → `$qb->leftJoin('r.options', 'o')`
- RGPD: Non concerné (pas de données perso)

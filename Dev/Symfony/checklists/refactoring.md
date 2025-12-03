# Checklist: Refactoring sécurisé

> **Améliorer le code sans casser** - Refactoring avec filet de sécurité
> Référence: `.claude/rules/03-coding-standards.md`, `.claude/rules/04-testing-tdd.md`

## Qu'est-ce qu'un refactoring ?

**Refactoring =** Améliorer la structure interne du code **SANS** changer son comportement externe

### ✅ Refactoring (OK)
- Renommer une variable pour plus de clarté
- Extraire une méthode pour réduire la complexité
- Déplacer du code pour mieux organiser
- Simplifier une condition
- Éliminer de la duplication

### ❌ Pas un refactoring (c'est une feature/fix)
- Ajouter un nouveau comportement
- Corriger un bug
- Changer la logique métier
- Modifier l'API publique

---

## Principe fondamental: Filet de sécurité

**AVANT de refactorer:**
```bash
# 1. S'assurer que TOUS les tests passent
make test
# ✅ Tous les tests doivent être verts

# 2. Commit de l'état stable
git commit -m "chore: état stable avant refactoring"
```

**PENDANT le refactoring:**
```bash
# Lancer les tests après CHAQUE petite modification
make test
# ✅ Si rouge → annuler le changement
```

**APRÈS le refactoring:**
```bash
# Vérifier que rien n'a changé comportementalement
make test
# ✅ Tous les tests doivent toujours passer
```

---

## Phase 1: Préparation

### ✅ État stable vérifié

**1. Tous les tests passent**
```bash
make test
```

**Résultat attendu:**
```
✅ Tests unitaires: 45 passed
✅ Tests intégration: 12 passed
✅ Tests Behat: 8 scenarios passed
```

**Si tests échouent:**
- ❌ NE PAS refactorer
- 🔧 Corriger les tests d'abord
- ✅ Recommencer quand tout est vert

**2. Coverage suffisant**
```bash
make test-coverage
```

**Critère:**
- ✅ Coverage ≥ 80% sur le code à refactorer
- ⚠️ Si < 80% → Ajouter des tests AVANT de refactorer

**Pourquoi ?** Les tests sont le filet de sécurité. Sans tests, on refactore à l'aveugle.

**3. Commit de sécurité**
```bash
git add .
git commit -m "chore: état stable avant refactoring

Tous les tests passent.
Coverage: 85%

Prêt pour refactoring sécurisé.
"
```

---

## Phase 2: Analyse du code à refactorer

### ✅ Identifier les "code smells"

#### Code Smell 1: Méthode trop longue

**Symptôme:**
- Méthode > 20 lignes
- Fait plusieurs choses
- Difficile à comprendre

**Exemple:**
```php
// ❌ Méthode trop longue (47 lignes)
public function createReservation(array $data): Reservation
{
    // Validation
    if (empty($data['email'])) {
        throw new InvalidArgumentException('Email requis');
    }
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException('Email invalide');
    }
    if (empty($data['participants'])) {
        throw new InvalidArgumentException('Participants requis');
    }

    // Récupération séjour
    $sejour = $this->sejourRepository->find($data['sejour_id']);
    if (!$sejour) {
        throw new EntityNotFoundException('Séjour non trouvé');
    }

    // Vérification disponibilité
    $nbParticipants = count($data['participants']);
    if ($sejour->getPlacesRestantes() < $nbParticipants) {
        throw new SejourCompletException('Pas assez de places');
    }

    // Création réservation
    $reservation = new Reservation();
    $reservation->setSejour($sejour);
    $reservation->setEmailContact($data['email']);
    $reservation->setTelephoneContact($data['telephone']);

    // Ajout participants
    foreach ($data['participants'] as $participantData) {
        $participant = new Participant();
        $participant->setNom($participantData['nom']);
        $participant->setPrenom($participantData['prenom']);
        $participant->setDateNaissance(new \DateTimeImmutable($participantData['date_naissance']));
        $reservation->addParticipant($participant);
    }

    // Calcul prix
    $prixBase = $sejour->getPrixTtc();
    $total = $prixBase->multiply($nbParticipants);
    if ($nbParticipants === 1) {
        $supplement = $total->multiply(0.30);
        $total = $total->add($supplement);
    }
    $reservation->setMontantTotal($total);

    // Sauvegarde
    $this->entityManager->persist($reservation);
    $this->entityManager->flush();

    return $reservation;
}
```

**Refactoring: Extraire méthodes**
```php
// ✅ Méthode courte et claire (7 lignes)
public function createReservation(array $data): Reservation
{
    $this->validateData($data);

    $sejour = $this->findSejourOrFail($data['sejour_id']);
    $this->ensureAvailability($sejour, count($data['participants']));

    $reservation = $this->buildReservation($sejour, $data);
    $this->addParticipants($reservation, $data['participants']);
    $this->calculatePrice($reservation);

    $this->entityManager->persist($reservation);
    $this->entityManager->flush();

    return $reservation;
}

private function validateData(array $data): void
{
    // 5 lignes de validation
}

private function findSejourOrFail(int $sejourId): Sejour
{
    // 3 lignes
}

private function ensureAvailability(Sejour $sejour, int $nbParticipants): void
{
    // 3 lignes
}

// etc.
```

#### Code Smell 2: Duplication (DRY violation)

**Symptôme:**
- Même code répété plusieurs fois
- Copy/paste évident

**Exemple:**
```php
// ❌ Duplication
public function calculatePriceForSejour(Sejour $sejour, int $nbParticipants): Money
{
    $basePrice = $sejour->getPrixTtc();
    $total = $basePrice->multiply($nbParticipants);

    if ($nbParticipants === 1) {
        $supplement = $total->multiply(0.30);
        $total = $total->add($supplement);
    }

    return $total;
}

public function calculatePriceForReservation(Reservation $reservation): Money
{
    $basePrice = $reservation->getSejour()->getPrixTtc();
    $nbParticipants = $reservation->getNbParticipants();
    $total = $basePrice->multiply($nbParticipants);

    if ($nbParticipants === 1) {
        $supplement = $total->multiply(0.30);
        $total = $total->add($supplement);
    }

    return $total;
}
```

**Refactoring: Extraire logique commune**
```php
// ✅ DRY (Don't Repeat Yourself)
public function calculatePriceForSejour(Sejour $sejour, int $nbParticipants): Money
{
    return $this->calculatePrice($sejour->getPrixTtc(), $nbParticipants);
}

public function calculatePriceForReservation(Reservation $reservation): Money
{
    return $this->calculatePrice(
        $reservation->getSejour()->getPrixTtc(),
        $reservation->getNbParticipants()
    );
}

private function calculatePrice(Money $basePrice, int $nbParticipants): Money
{
    $total = $basePrice->multiply($nbParticipants);

    if ($nbParticipants === 1) {
        $supplement = $total->multiply(0.30);
        $total = $total->add($supplement);
    }

    return $total;
}
```

#### Code Smell 3: Complexité cyclomatique élevée

**Symptôme:**
- Trop de `if`, `else`, `switch`
- Difficile à tester
- Difficile à comprendre

**Exemple:**
```php
// ❌ Complexité cyclomatique = 8 (trop élevé)
public function calculateDiscount(Reservation $reservation): Money
{
    $discount = Money::zero();

    if ($reservation->getCodePromo()) {
        $promo = $reservation->getCodePromo();

        if ($promo->getType() === 'percentage') {
            if ($promo->getPourcentage() > 0) {
                $discount = $reservation->getMontantTotal()->multiply($promo->getPourcentage() / 100);
            }
        } elseif ($promo->getType() === 'fixed') {
            if ($promo->getMontantFixe() > 0) {
                $discount = Money::fromEuros($promo->getMontantFixe());
            }
        } elseif ($promo->getType() === 'early_bird') {
            if ($reservation->getCreatedAt() < $promo->getDateLimite()) {
                $discount = $reservation->getMontantTotal()->multiply(0.10);
            }
        }
    }

    return $discount;
}
```

**Refactoring: Stratégie pattern / Polymorphisme**
```php
// ✅ Complexité réduite + extensible
interface PromoCodeStrategy
{
    public function calculateDiscount(Reservation $reservation): Money;
}

class PercentagePromo implements PromoCodeStrategy
{
    public function calculateDiscount(Reservation $reservation): Money
    {
        return $reservation->getMontantTotal()
            ->multiply($this->pourcentage / 100);
    }
}

class FixedPromo implements PromoCodeStrategy
{
    public function calculateDiscount(Reservation $reservation): Money
    {
        return Money::fromEuros($this->montantFixe);
    }
}

class EarlyBirdPromo implements PromoCodeStrategy
{
    public function calculateDiscount(Reservation $reservation): Money
    {
        if ($reservation->getCreatedAt() < $this->dateLimite) {
            return $reservation->getMontantTotal()->multiply(0.10);
        }
        return Money::zero();
    }
}

// Usage simple
public function calculateDiscount(Reservation $reservation): Money
{
    if (!$promo = $reservation->getCodePromo()) {
        return Money::zero();
    }

    return $promo->getStrategy()->calculateDiscount($reservation);
}
```

#### Code Smell 4: Primitive Obsession

**Symptôme:**
- Utilisation de types primitifs (int, string, float) au lieu d'objets métier
- Pas de validation

**Exemple:**
```php
// ❌ Primitive obsession
class Reservation
{
    private string $email;
    private int $prixCents;

    public function setEmail(string $email): void
    {
        $this->email = $email; // Pas de validation
    }

    public function setPrix(int $cents): void
    {
        $this->prixCents = $cents; // Peut être négatif
    }
}
```

**Refactoring: Value Objects**
```php
// ✅ Value Objects avec validation
class Reservation
{
    private Email $email;
    private Money $prix;

    public function setEmail(Email $email): void
    {
        $this->email = $email; // Déjà validé dans Email::fromString()
    }

    public function setPrix(Money $prix): void
    {
        $this->prix = $prix; // Déjà validé (pas négatif)
    }
}
```

#### Code Smell 5: God Class

**Symptôme:**
- Classe qui fait tout
- Trop de responsabilités (SRP violation)
- > 300 lignes

**Exemple:**
```php
// ❌ God Class (500 lignes)
class ReservationManager
{
    public function create() {}
    public function update() {}
    public function delete() {}
    public function sendEmail() {}
    public function generatePdf() {}
    public function calculatePrice() {}
    public function validateData() {}
    public function exportCsv() {}
    // ... 20 autres méthodes
}
```

**Refactoring: Séparer les responsabilités**
```php
// ✅ Single Responsibility Principle
class ReservationService         // Gestion réservations
class ReservationMailer          // Envoi emails
class ReservationPdfGenerator    // Génération PDF
class PrixCalculatorService      // Calcul prix
class ReservationValidator       // Validation
class ReservationExporter        // Export CSV
```

---

## Phase 3: Refactoring par petits pas

### ✅ Technique: Baby Steps

**Règle d'or:** Un seul changement à la fois + tests verts

#### Étape 1: Renommer une variable

```bash
# AVANT
git status  # Clean

# REFACTORING
vim src/Service/ReservationService.php
# Renommer $data en $reservationData (plus clair)

# TESTS
make test
# ✅ Tous passent

# COMMIT
git commit -m "refactor(reservation): renomme variable data en reservationData"
```

#### Étape 2: Extraire une méthode

```bash
# REFACTORING
vim src/Service/ReservationService.php
# Extraire la validation dans validateReservationData()

# TESTS
make test
# ✅ Tous passent

# COMMIT
git commit -m "refactor(reservation): extrait méthode validateReservationData"
```

#### Étape 3: Déplacer la méthode

```bash
# REFACTORING
vim src/Validator/ReservationValidator.php
# Déplacer validateReservationData() dans une classe dédiée

# TESTS
make test
# ✅ Tous passent

# COMMIT
git commit -m "refactor(reservation): déplace validation vers ReservationValidator"
```

**Principe:** Chaque commit = code qui compile + tests verts

---

## Phase 4: Patterns de refactoring courants

### Pattern 1: Extract Method

**Quand:** Méthode trop longue

```php
// AVANT
public function process(): void
{
    // 10 lignes de code A
    // 15 lignes de code B
    // 8 lignes de code C
}

// APRÈS
public function process(): void
{
    $this->doA();
    $this->doB();
    $this->doC();
}

private function doA(): void { /* 10 lignes */ }
private function doB(): void { /* 15 lignes */ }
private function doC(): void { /* 8 lignes */ }
```

### Pattern 2: Extract Class

**Quand:** Classe avec trop de responsabilités

```php
// AVANT
class ReservationService
{
    public function create() {}
    public function sendEmail() {}
    public function generatePdf() {}
}

// APRÈS
class ReservationService { public function create() {} }
class ReservationMailer { public function sendEmail() {} }
class ReservationPdfGenerator { public function generatePdf() {} }
```

### Pattern 3: Replace Conditional with Polymorphism

**Quand:** Beaucoup de if/switch sur type

```php
// AVANT
public function calculate(Promo $promo): Money
{
    if ($promo->type === 'percentage') {
        return $this->calculatePercentage($promo);
    } elseif ($promo->type === 'fixed') {
        return $this->calculateFixed($promo);
    }
}

// APRÈS
interface PromoStrategy { public function calculate(): Money; }
class PercentagePromo implements PromoStrategy { /* ... */ }
class FixedPromo implements PromoStrategy { /* ... */ }

public function calculate(PromoStrategy $promo): Money
{
    return $promo->calculate();
}
```

### Pattern 4: Introduce Parameter Object

**Quand:** Trop de paramètres (> 3)

```php
// AVANT
public function create(
    string $email,
    string $telephone,
    int $sejourId,
    array $participants,
    ?string $codePromo
): Reservation {}

// APRÈS
class ReservationData
{
    public function __construct(
        public readonly string $email,
        public readonly string $telephone,
        public readonly int $sejourId,
        public readonly array $participants,
        public readonly ?string $codePromo
    ) {}
}

public function create(ReservationData $data): Reservation {}
```

### Pattern 5: Replace Magic Number with Constant

**Quand:** Nombres "magiques" dans le code

```php
// AVANT
if ($nbParticipants === 1) {
    $supplement = $total->multiply(0.30);
}

// APRÈS
private const SUPPLEMENT_SINGLE_PERCENT = 30;

if ($nbParticipants === 1) {
    $supplement = $total->multiply(self::SUPPLEMENT_SINGLE_PERCENT / 100);
}
```

---

## Phase 5: Validation post-refactoring

### ✅ Checklist complète

#### 1. Tests toujours verts

```bash
make test
```

**Critère:**
- ✅ Exactement le même nombre de tests passent qu'avant
- ✅ Aucun test ajouté/supprimé (sauf si justifié)
- ✅ Même coverage (ou mieux)

**Si tests échouent:**
- ❌ Le refactoring a changé le comportement (BUG)
- 🔧 Corriger ou annuler le refactoring

#### 2. Performance non dégradée

```bash
# Benchmark simple
time make test
```

**Critère:**
- ✅ Temps d'exécution similaire (± 10%)
- ⚠️ Si > +20% → Investiguer

**Pour refactoring critique:**
```bash
# Avant refactoring
ab -n 1000 -c 10 https://atoll.local/api/reservation
# Requests per second: 150

# Après refactoring
ab -n 1000 -c 10 https://atoll.local/api/reservation
# Requests per second: 148  (OK, -1.3%)
```

#### 3. Complexité réduite

**Métriques à vérifier:**

```bash
# Complexité cyclomatique
docker compose exec php vendor/bin/phpmetrics src/
```

**Critère:**
- ✅ Complexité moyenne ≤ 5
- ✅ Aucune méthode > 10
- ✅ Classes < 300 lignes

#### 4. SOLID respecté

**Checklist:**
- [ ] **S**ingle Responsibility: Chaque classe/méthode fait UNE chose
- [ ] **O**pen/Closed: Extensible sans modification
- [ ] **L**iskov Substitution: Substitution des implémentations OK
- [ ] **I**nterface Segregation: Interfaces focalisées
- [ ] **D**ependency Inversion: Dépend d'abstractions

#### 5. Simplicité (KISS)

**Questions:**
- Le code est-il plus facile à lire ?
- Un junior comprendrait-il facilement ?
- Y a-t-il moins de niveaux d'indentation ?
- Les noms sont-ils plus clairs ?

**Si "non" à une question → Revoir le refactoring**

#### 6. Qualité du code

```bash
# PHPStan
make phpstan
# ✅ Niveau 8, 0 erreurs (ou moins qu'avant)

# CS-Fixer
make cs-fix
# ✅ Code formaté

# Qualité globale
make quality
# ✅ Tout OK
```

---

## Phase 6: Commit & Documentation

### ✅ Commit de refactoring

**Format:**
```bash
git commit -m "refactor([scope]): [description]

[Détail du changement]

[Bénéfices]

Tests: ✅ [X]/[X] passed (pas de régression)
Performance: OK (±[Y]%)
Complexité: [avant] → [après]
"
```

**Exemple:**
```bash
git commit -m "refactor(reservation): extrait PrixCalculatorService

Extraction de la logique de calcul de prix dans un service dédié.

Bénéfices:
- Meilleure séparation des responsabilités (SRP)
- Code réutilisable (DRY)
- Plus facile à tester

Tests: ✅ 45/45 passed (pas de régression)
Performance: OK (-2%)
Complexité: 8 → 3
"
```

### ✅ Documentation du refactoring

**Si refactoring important → ADR (Architecture Decision Record)**

```markdown
# ADR-005: Extraction PrixCalculatorService

## Statut
Accepté

## Contexte
Le calcul de prix était dispersé dans plusieurs endroits:
- ReservationService
- Reservation entity
- Controller

Duplication et violation du SRP.

## Décision
Créer un PrixCalculatorService dédié avec:
- Calcul prix de base
- Supplément single
- Options payantes
- Code promo

## Conséquences

### Positif
- Un seul endroit pour la logique de prix
- Facilement testable
- Réutilisable
- Évolution simplifiée (nouveau type de supplément, etc.)

### Négatif
- Classe supplémentaire (mais justifiée)

## Alternatives considérées
1. Garder dans Reservation entity → Rejeté (trop de responsabilités)
2. Helper statique → Rejeté (pas injectable, pas testable)
```

---

## Exemples de refactoring complets

### Exemple 1: Simplifier validation

**AVANT (15 lignes, complexité 5):**
```php
private function validateReservationData(array $data): void
{
    if (empty($data['email'])) {
        throw new InvalidArgumentException('Email requis');
    }

    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException('Email invalide');
    }

    if (empty($data['participants'])) {
        throw new InvalidArgumentException('Participants requis');
    }

    if (count($data['participants']) > 10) {
        throw new InvalidArgumentException('Maximum 10 participants');
    }
}
```

**APRÈS (3 lignes, complexité 1):**
```php
private function validateReservationData(array $data): void
{
    Assert::email($data['email'] ?? null, 'Email invalide');
    Assert::notEmpty($data['participants'], 'Participants requis');
    Assert::maxCount($data['participants'], 10, 'Maximum 10 participants');
}
```

**Commit:**
```bash
git commit -m "refactor(reservation): utilise Assert pour validation

Remplace les if/throw par webmozart/assert pour plus de clarté.

Complexité: 5 → 1
Lignes: 15 → 3
"
```

### Exemple 2: Extraire Value Object

**AVANT:**
```php
class Reservation
{
    private int $montantTotalCents;

    public function setMontantTotal(int $cents): void
    {
        $this->montantTotalCents = $cents;
    }

    public function getMontantTotal(): float
    {
        return $this->montantTotalCents / 100;
    }
}
```

**APRÈS:**
```php
class Reservation
{
    private Money $montantTotal;

    public function setMontantTotal(Money $montant): void
    {
        $this->montantTotal = $montant;
    }

    public function getMontantTotal(): Money
    {
        return $this->montantTotal;
    }
}
```

**Commit:**
```bash
git commit -m "refactor(reservation): remplace int par Money VO

Extraction Value Object Money pour:
- Éviter erreurs de calcul float
- Validation automatique (pas négatif)
- Encapsulation logique monétaire

Tests: ✅ 45/45 passed
"
```

---

## Checklist finale

Avant de merger le refactoring:

- [ ] Tous les tests passent (même nombre qu'avant)
- [ ] Performance non dégradée (< +10%)
- [ ] Complexité réduite (métrique mesurée)
- [ ] Code plus simple (KISS)
- [ ] SOLID respecté
- [ ] PHPStan niveau 8 OK
- [ ] Code formaté (PSR-12)
- [ ] Commits atomiques (1 changement = 1 commit)
- [ ] Message de commit clair
- [ ] Documentation si refactoring majeur (ADR)
- [ ] Review effectuée

**Si toutes les cases cochées → MERGE!** 🎉

---

## Anti-patterns à éviter

### ❌ Refactoring "Big Bang"

```bash
# ❌ MAUVAIS
# 3 jours de refactoring sans commit
# Puis 1 gros commit avec 50 fichiers modifiés
git commit -m "refactor: améliore tout le code"
```

**Pourquoi c'est mal:**
- Impossible à reviewer
- Risque de régression élevé
- Difficile de rollback
- Perte de l'historique

```bash
# ✅ BON
# Commits atomiques
git commit -m "refactor: renomme variable data"
git commit -m "refactor: extrait méthode validateData"
git commit -m "refactor: déplace validation vers classe dédiée"
```

### ❌ Refactoring sans tests

```bash
# ❌ MAUVAIS
make test
# ❌ 5 tests failed

# On refactore quand même...
```

**Conséquence:** Risque de casser le code sans s'en rendre compte

```bash
# ✅ BON
make test
# ❌ 5 tests failed

# 1. Corriger les tests
# 2. PUIS refactorer
```

### ❌ Mélanger refactoring et feature

```bash
# ❌ MAUVAIS
git commit -m "feat: ajoute options payantes + refactor pricing"
```

**Conséquence:** Si la feature est rejetée, on perd le refactoring

```bash
# ✅ BON
git commit -m "refactor: extrait PrixCalculatorService"
git commit -m "feat: ajoute options payantes"
```

---

**Temps estimé d'un refactoring:** 30 min - 4h selon l'ampleur

**Règle:** Si > 4h → Découper en plusieurs refactorings plus petits

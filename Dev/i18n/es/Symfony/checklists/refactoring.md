# Checklist: Refactoring seguro

> **Mejorar el código sin romper** - Refactoring con red de seguridad
> Referencia: `.claude/rules/03-coding-standards.md`, `.claude/rules/04-testing-tdd.md`

## ¿Qué es un refactoring?

**Refactoring =** Mejorar la estructura interna del código **SIN** cambiar su comportamiento externo

### ✅ Refactoring (OK)
- Renombrar una variable para mayor claridad
- Extraer un método para reducir la complejidad
- Mover código para mejor organización
- Simplificar una condición
- Eliminar duplicación

### ❌ No es un refactoring (es una feature/fix)
- Añadir un nuevo comportamiento
- Corregir un bug
- Cambiar la lógica de negocio
- Modificar la API pública

---

## Principio fundamental: Red de seguridad

**ANTES de refactorizar:**
```bash
# 1. Asegurarse de que TODOS los tests pasan
make test
# ✅ Todos los tests deben estar en verde

# 2. Commit del estado estable
git commit -m "chore: estado estable antes del refactoring"
```

**DURANTE el refactoring:**
```bash
# Ejecutar los tests después de CADA pequeña modificación
make test
# ✅ Si rojo → anular el cambio
```

**DESPUÉS del refactoring:**
```bash
# Verificar que nada ha cambiado comportamentalmente
make test
# ✅ Todos los tests deben seguir pasando
```

---

## Fase 1: Preparación

### ✅ Estado estable verificado

**1. Todos los tests pasan**
```bash
make test
```

**Resultado esperado:**
```
✅ Tests unitarios: 45 passed
✅ Tests integración: 12 passed
✅ Tests Behat: 8 scenarios passed
```

**Si los tests fallan:**
- ❌ NO refactorizar
- 🔧 Corregir los tests primero
- ✅ Volver a empezar cuando todo esté en verde

**2. Coverage suficiente**
```bash
make test-coverage
```

**Criterio:**
- ✅ Coverage ≥ 80% sobre el código a refactorizar
- ⚠️ Si < 80% → Añadir tests ANTES de refactorizar

**¿Por qué?** Los tests son la red de seguridad. Sin tests, refactorizamos a ciegas.

**3. Commit de seguridad**
```bash
git add .
git commit -m "chore: estado estable antes del refactoring

Todos los tests pasan.
Coverage: 85%

Listo para refactoring seguro.
"
```

---

## Fase 2: Análisis del código a refactorizar

### ✅ Identificar los "code smells"

#### Code Smell 1: Método demasiado largo

**Síntoma:**
- Método > 20 líneas
- Hace varias cosas
- Difícil de entender

**Ejemplo:**
```php
// ❌ Método demasiado largo (47 líneas)
public function createReservation(array $data): Reservation
{
    // Validación
    if (empty($data['email'])) {
        throw new InvalidArgumentException('Email requerido');
    }
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException('Email inválido');
    }
    if (empty($data['participants'])) {
        throw new InvalidArgumentException('Participantes requeridos');
    }

    // Recuperación séjour
    $sejour = $this->sejourRepository->find($data['sejour_id']);
    if (!$sejour) {
        throw new EntityNotFoundException('Séjour no encontrado');
    }

    // Verificación disponibilidad
    $nbParticipants = count($data['participants']);
    if ($sejour->getPlacesRestantes() < $nbParticipants) {
        throw new SejourCompletException('No hay suficientes plazas');
    }

    // Creación reserva
    $reservation = new Reservation();
    $reservation->setSejour($sejour);
    $reservation->setEmailContact($data['email']);
    $reservation->setTelephoneContact($data['telephone']);

    // Añadir participantes
    foreach ($data['participants'] as $participantData) {
        $participant = new Participant();
        $participant->setNom($participantData['nom']);
        $participant->setPrenom($participantData['prenom']);
        $participant->setDateNaissance(new \DateTimeImmutable($participantData['date_naissance']));
        $reservation->addParticipant($participant);
    }

    // Cálculo precio
    $prixBase = $sejour->getPrixTtc();
    $total = $prixBase->multiply($nbParticipants);
    if ($nbParticipants === 1) {
        $supplement = $total->multiply(0.30);
        $total = $total->add($supplement);
    }
    $reservation->setMontantTotal($total);

    // Guardado
    $this->entityManager->persist($reservation);
    $this->entityManager->flush();

    return $reservation;
}
```

**Refactoring: Extraer métodos**
```php
// ✅ Método corto y claro (7 líneas)
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
    // 5 líneas de validación
}

private function findSejourOrFail(int $sejourId): Sejour
{
    // 3 líneas
}

private function ensureAvailability(Sejour $sejour, int $nbParticipants): void
{
    // 3 líneas
}

// etc.
```

#### Code Smell 2: Duplicación (violación DRY)

**Síntoma:**
- Mismo código repetido varias veces
- Copy/paste evidente

**Ejemplo:**
```php
// ❌ Duplicación
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

**Refactoring: Extraer lógica común**
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

#### Code Smell 3: Complejidad ciclomática elevada

**Síntoma:**
- Demasiados `if`, `else`, `switch`
- Difícil de testear
- Difícil de entender

**Ejemplo:**
```php
// ❌ Complejidad ciclomática = 8 (demasiado elevada)
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

**Refactoring: Patrón Estrategia / Polimorfismo**
```php
// ✅ Complejidad reducida + extensible
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

// Uso simple
public function calculateDiscount(Reservation $reservation): Money
{
    if (!$promo = $reservation->getCodePromo()) {
        return Money::zero();
    }

    return $promo->getStrategy()->calculateDiscount($reservation);
}
```

#### Code Smell 4: Primitive Obsession

**Síntoma:**
- Uso de tipos primitivos (int, string, float) en lugar de objetos de negocio
- Sin validación

**Ejemplo:**
```php
// ❌ Primitive obsession
class Reservation
{
    private string $email;
    private int $prixCents;

    public function setEmail(string $email): void
    {
        $this->email = $email; // Sin validación
    }

    public function setPrix(int $cents): void
    {
        $this->prixCents = $cents; // Puede ser negativo
    }
}
```

**Refactoring: Value Objects**
```php
// ✅ Value Objects con validación
class Reservation
{
    private Email $email;
    private Money $prix;

    public function setEmail(Email $email): void
    {
        $this->email = $email; // Ya validado en Email::fromString()
    }

    public function setPrix(Money $prix): void
    {
        $this->prix = $prix; // Ya validado (no negativo)
    }
}
```

#### Code Smell 5: God Class

**Síntoma:**
- Clase que hace todo
- Demasiadas responsabilidades (violación SRP)
- > 300 líneas

**Ejemplo:**
```php
// ❌ God Class (500 líneas)
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
    // ... 20 otros métodos
}
```

**Refactoring: Separar las responsabilidades**
```php
// ✅ Single Responsibility Principle
class ReservationService         // Gestión reservas
class ReservationMailer          // Envío emails
class ReservationPdfGenerator    // Generación PDF
class PrixCalculatorService      // Cálculo precio
class ReservationValidator       // Validación
class ReservationExporter        // Export CSV
```

---

## Fase 3: Refactoring por pasos pequeños

### ✅ Técnica: Baby Steps

**Regla de oro:** Un solo cambio a la vez + tests verdes

#### Paso 1: Renombrar una variable

```bash
# ANTES
git status  # Clean

# REFACTORING
vim src/Service/ReservationService.php
# Renombrar $data a $reservationData (más claro)

# TESTS
make test
# ✅ Todos pasan

# COMMIT
git commit -m "refactor(reservation): renombra variable data a reservationData"
```

#### Paso 2: Extraer un método

```bash
# REFACTORING
vim src/Service/ReservationService.php
# Extraer la validación en validateReservationData()

# TESTS
make test
# ✅ Todos pasan

# COMMIT
git commit -m "refactor(reservation): extrae método validateReservationData"
```

#### Paso 3: Mover el método

```bash
# REFACTORING
vim src/Validator/ReservationValidator.php
# Mover validateReservationData() a una clase dedicada

# TESTS
make test
# ✅ Todos pasan

# COMMIT
git commit -m "refactor(reservation): mueve validación a ReservationValidator"
```

**Principio:** Cada commit = código que compila + tests verdes

---

## Fase 4: Patrones de refactoring comunes

### Patrón 1: Extract Method

**Cuándo:** Método demasiado largo

```php
// ANTES
public function process(): void
{
    // 10 líneas de código A
    // 15 líneas de código B
    // 8 líneas de código C
}

// DESPUÉS
public function process(): void
{
    $this->doA();
    $this->doB();
    $this->doC();
}

private function doA(): void { /* 10 líneas */ }
private function doB(): void { /* 15 líneas */ }
private function doC(): void { /* 8 líneas */ }
```

### Patrón 2: Extract Class

**Cuándo:** Clase con demasiadas responsabilidades

```php
// ANTES
class ReservationService
{
    public function create() {}
    public function sendEmail() {}
    public function generatePdf() {}
}

// DESPUÉS
class ReservationService { public function create() {} }
class ReservationMailer { public function sendEmail() {} }
class ReservationPdfGenerator { public function generatePdf() {} }
```

### Patrón 3: Replace Conditional with Polymorphism

**Cuándo:** Muchos if/switch sobre tipo

```php
// ANTES
public function calculate(Promo $promo): Money
{
    if ($promo->type === 'percentage') {
        return $this->calculatePercentage($promo);
    } elseif ($promo->type === 'fixed') {
        return $this->calculateFixed($promo);
    }
}

// DESPUÉS
interface PromoStrategy { public function calculate(): Money; }
class PercentagePromo implements PromoStrategy { /* ... */ }
class FixedPromo implements PromoStrategy { /* ... */ }

public function calculate(PromoStrategy $promo): Money
{
    return $promo->calculate();
}
```

### Patrón 4: Introduce Parameter Object

**Cuándo:** Demasiados parámetros (> 3)

```php
// ANTES
public function create(
    string $email,
    string $telephone,
    int $sejourId,
    array $participants,
    ?string $codePromo
): Reservation {}

// DESPUÉS
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

### Patrón 5: Replace Magic Number with Constant

**Cuándo:** Números "mágicos" en el código

```php
// ANTES
if ($nbParticipants === 1) {
    $supplement = $total->multiply(0.30);
}

// DESPUÉS
private const SUPPLEMENT_SINGLE_PERCENT = 30;

if ($nbParticipants === 1) {
    $supplement = $total->multiply(self::SUPPLEMENT_SINGLE_PERCENT / 100);
}
```

---

## Fase 5: Validación post-refactoring

### ✅ Checklist completa

#### 1. Tests siempre verdes

```bash
make test
```

**Criterio:**
- ✅ Exactamente el mismo número de tests pasan que antes
- ✅ Ningún test añadido/eliminado (salvo justificación)
- ✅ Mismo coverage (o mejor)

**Si los tests fallan:**
- ❌ El refactoring ha cambiado el comportamiento (BUG)
- 🔧 Corregir o anular el refactoring

#### 2. Rendimiento no degradado

```bash
# Benchmark simple
time make test
```

**Criterio:**
- ✅ Tiempo de ejecución similar (± 10%)
- ⚠️ Si > +20% → Investigar

**Para refactoring crítico:**
```bash
# Antes del refactoring
ab -n 1000 -c 10 https://atoll.local/api/reservation
# Requests per second: 150

# Después del refactoring
ab -n 1000 -c 10 https://atoll.local/api/reservation
# Requests per second: 148  (OK, -1.3%)
```

#### 3. Complejidad reducida

**Métricas a verificar:**

```bash
# Complejidad ciclomática
docker compose exec php vendor/bin/phpmetrics src/
```

**Criterio:**
- ✅ Complejidad media ≤ 5
- ✅ Ningún método > 10
- ✅ Clases < 300 líneas

#### 4. SOLID respetado

**Checklist:**
- [ ] **S**ingle Responsibility: Cada clase/método hace UNA cosa
- [ ] **O**pen/Closed: Extensible sin modificación
- [ ] **L**iskov Substitution: Sustitución de implementaciones OK
- [ ] **I**nterface Segregation: Interfaces focalizadas
- [ ] **D**ependency Inversion: Depende de abstracciones

#### 5. Simplicidad (KISS)

**Preguntas:**
- ¿El código es más fácil de leer?
- ¿Un junior lo entendería fácilmente?
- ¿Hay menos niveles de indentación?
- ¿Los nombres son más claros?

**Si "no" a una pregunta → Revisar el refactoring**

#### 6. Calidad del código

```bash
# PHPStan
make phpstan
# ✅ Nivel 8, 0 errores (o menos que antes)

# CS-Fixer
make cs-fix
# ✅ Código formateado

# Calidad global
make quality
# ✅ Todo OK
```

---

## Fase 6: Commit & Documentación

### ✅ Commit de refactoring

**Formato:**
```bash
git commit -m "refactor([scope]): [descripción]

[Detalle del cambio]

[Beneficios]

Tests: ✅ [X]/[X] passed (sin regresión)
Rendimiento: OK (±[Y]%)
Complejidad: [antes] → [después]
"
```

**Ejemplo:**
```bash
git commit -m "refactor(reservation): extrae PrixCalculatorService

Extracción de la lógica de cálculo de precio en un servicio dedicado.

Beneficios:
- Mejor separación de responsabilidades (SRP)
- Código reutilizable (DRY)
- Más fácil de testear

Tests: ✅ 45/45 passed (sin regresión)
Rendimiento: OK (-2%)
Complejidad: 8 → 3
"
```

### ✅ Documentación del refactoring

**Si refactoring importante → ADR (Architecture Decision Record)**

```markdown
# ADR-005: Extracción PrixCalculatorService

## Estado
Aceptado

## Contexto
El cálculo de precio estaba disperso en varios lugares:
- ReservationService
- Reservation entity
- Controller

Duplicación y violación del SRP.

## Decisión
Crear un PrixCalculatorService dedicado con:
- Cálculo precio base
- Suplemento single
- Opciones de pago
- Código promo

## Consecuencias

### Positivo
- Un solo lugar para la lógica de precio
- Fácilmente testeable
- Reutilizable
- Evolución simplificada (nuevo tipo de suplemento, etc.)

### Negativo
- Clase adicional (pero justificada)

## Alternativas consideradas
1. Mantener en Reservation entity → Rechazado (demasiadas responsabilidades)
2. Helper estático → Rechazado (no inyectable, no testeable)
```

---

## Ejemplos de refactoring completos

### Ejemplo 1: Simplificar validación

**ANTES (15 líneas, complejidad 5):**
```php
private function validateReservationData(array $data): void
{
    if (empty($data['email'])) {
        throw new InvalidArgumentException('Email requerido');
    }

    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException('Email inválido');
    }

    if (empty($data['participants'])) {
        throw new InvalidArgumentException('Participantes requeridos');
    }

    if (count($data['participants']) > 10) {
        throw new InvalidArgumentException('Máximo 10 participantes');
    }
}
```

**DESPUÉS (3 líneas, complejidad 1):**
```php
private function validateReservationData(array $data): void
{
    Assert::email($data['email'] ?? null, 'Email inválido');
    Assert::notEmpty($data['participants'], 'Participantes requeridos');
    Assert::maxCount($data['participants'], 10, 'Máximo 10 participantes');
}
```

**Commit:**
```bash
git commit -m "refactor(reservation): usa Assert para validación

Reemplaza los if/throw por webmozart/assert para mayor claridad.

Complejidad: 5 → 1
Líneas: 15 → 3
"
```

### Ejemplo 2: Extraer Value Object

**ANTES:**
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

**DESPUÉS:**
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
git commit -m "refactor(reservation): reemplaza int por Money VO

Extracción Value Object Money para:
- Evitar errores de cálculo float
- Validación automática (no negativo)
- Encapsulación lógica monetaria

Tests: ✅ 45/45 passed
"
```

---

## Checklist final

Antes de mergear el refactoring:

- [ ] Todos los tests pasan (mismo número que antes)
- [ ] Rendimiento no degradado (< +10%)
- [ ] Complejidad reducida (métrica medida)
- [ ] Código más simple (KISS)
- [ ] SOLID respetado
- [ ] PHPStan nivel 8 OK
- [ ] Código formateado (PER-CS 3.0)
- [ ] Commits atómicos (1 cambio = 1 commit)
- [ ] Mensaje de commit claro
- [ ] Documentación si refactoring mayor (ADR)
- [ ] Review efectuada

**Si todas las casillas están marcadas → MERGE!**

---

## Anti-patrones a evitar

### ❌ Refactoring "Big Bang"

```bash
# ❌ MALO
# 3 días de refactoring sin commit
# Luego 1 gran commit con 50 archivos modificados
git commit -m "refactor: mejora todo el código"
```

**Por qué está mal:**
- Imposible de revisar
- Riesgo de regresión elevado
- Difícil de revertir
- Pérdida del histórico

```bash
# ✅ BIEN
# Commits atómicos
git commit -m "refactor: renombra variable data"
git commit -m "refactor: extrae método validateData"
git commit -m "refactor: mueve validación a clase dedicada"
```

### ❌ Refactoring sin tests

```bash
# ❌ MALO
make test
# ❌ 5 tests failed

# Refactorizamos de todos modos...
```

**Consecuencia:** Riesgo de romper el código sin darse cuenta

```bash
# ✅ BIEN
make test
# ❌ 5 tests failed

# 1. Corregir los tests
# 2. LUEGO refactorizar
```

### ❌ Mezclar refactoring y feature

```bash
# ❌ MALO
git commit -m "feat: añade opciones de pago + refactor pricing"
```

**Consecuencia:** Si la feature es rechazada, perdemos el refactoring

```bash
# ✅ BIEN
git commit -m "refactor: extrae PrixCalculatorService"
git commit -m "feat: añade opciones de pago"
```

---

**Tiempo estimado de un refactoring:** 30 min - 4h según la amplitud

**Regla:** Si > 4h → Dividir en varios refactorings más pequeños

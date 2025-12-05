# Seguridad & RGPD - Atoll Tourisme

## Descripción General

La **seguridad** y el **respeto del RGPD** son **OBLIGATORIOS** y críticos para Atoll Tourisme.

**Objetivos:**
- ✅ Protección OWASP Top 10
- ✅ Conformidad RGPD estricta
- ✅ Cifrado de datos sensibles (alergias, tratamientos médicos)
- ✅ Validación y sanitización sistemáticas
- ✅ Headers CSP
- ✅ Registro de auditoría para datos personales

> **Recordatorio RGPD:**
> Los datos médicos (alergias, tratamientos) de los participantes son **datos sensibles**
> que requieren **cifrado** y **medidas de protección reforzadas**.

> **Referencias:**
> - `03-coding-standards.md` - Validación de inputs
> - `01-symfony-best-practices.md` - Seguridad Symfony

---

## Tabla de Contenidos

1. [Protecciones OWASP Top 10](#protecciones-owasp-top-10)
2. [Conformidad RGPD](#conformidad-rgpd)
3. [Cifrado de datos sensibles](#cifrado-de-datos-sensibles)
4. [Validación y sanitización](#validación-y-sanitización)
5. [Security Headers](#security-headers)
6. [Registro de Auditoría](#registro-de-auditoría)
7. [Checklist de seguridad](#checklist-de-seguridad)

---

## Protecciones OWASP Top 10

### 1. Injection (SQL, XSS, Command)

#### SQL Injection

```php
<?php

// ❌ PELIGROSO: Concatenación SQL
$sql = "SELECT * FROM reservation WHERE email = '" . $_POST['email'] . "'";
$result = $connection->query($sql);

// ✅ SEGURO: Consultas preparadas (Doctrine ORM/DQL)
$query = $entityManager->createQuery(
    'SELECT r FROM App\Entity\Reservation r WHERE r.email = :email'
);
$query->setParameter('email', $email); // ✅ Parámetro vinculado
$result = $query->getResult();

// ✅ AÚN MEJOR: Repository + QueryBuilder
final class DoctrineReservationRepository
{
    public function findByEmail(Email $email): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.email = :email')
            ->setParameter('email', (string) $email) // ✅ Escapado automáticamente
            ->getQuery()
            ->getResult();
    }
}
```

#### XSS (Cross-Site Scripting)

```twig
{# ❌ PELIGROSO: Visualización sin procesar #}
{{ userInput|raw }}
<div>{{ comment|raw }}</div>

{# ✅ SEGURO: Auto-escape Twig (por defecto) #}
{{ userInput }}
<div>{{ comment }}</div>

{# ✅ Escape explícito si raw es necesario #}
{{ userInput|escape('html') }}
{{ userInput|e }}
```

```php
<?php

// ❌ PELIGROSO: echo directo
echo $_POST['name'];

// ✅ SEGURO: htmlspecialchars
echo htmlspecialchars($_POST['name'], ENT_QUOTES, 'UTF-8');

// ✅ AÚN MEJOR: Usar Twig para visualización
return $this->render('reservation/show.html.twig', [
    'name' => $name, // Auto-escapado por Twig
]);
```

#### Command Injection

```php
<?php

// ❌ PELIGROSO: shell_exec con input de usuario
shell_exec('convert ' . $_POST['filename'] . ' output.pdf');

// ✅ SEGURO: Usar ProcessBuilder Symfony
use Symfony\Component\Process\Process;

$process = new Process([
    'convert',
    $filename, // ✅ Argumento separado (no es posible la inyección)
    'output.pdf',
]);
$process->run();
```

### 2. Broken Authentication

```php
<?php

// ❌ PELIGROSO: Comparación simple de contraseña
if ($inputPassword === $storedPassword) {
    // Login
}

// ✅ SEGURO: Usar PasswordHasher Symfony
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final readonly class AuthenticationService
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher,
    ) {}

    public function verifyPassword(User $user, string $plainPassword): bool
    {
        // ✅ Usa bcrypt/argon2 (seguro contra timing-attack)
        return $this->passwordHasher->isPasswordValid($user, $plainPassword);
    }

    public function hashPassword(User $user, string $plainPassword): string
    {
        // ✅ Hash seguro con salt automático
        return $this->passwordHasher->hashPassword($user, $plainPassword);
    }
}
```

### 3. Sensitive Data Exposure

```php
<?php

// ❌ PELIGROSO: Datos sensibles en claro
#[ORM\Column(type: 'text')]
private string $allergies; // ❌ Violación RGPD!

// ✅ SEGURO: Cifrado Doctrine (ver sección Cifrado)
#[ORM\Column(type: 'encrypted_text')]
private ?EncryptedData $allergies = null;

// ❌ PELIGROSO: Logs con datos sensibles
$this->logger->info('User login', [
    'email' => $user->getEmail(),
    'password' => $password, // ❌ NUNCA registrar contraseñas!
]);

// ✅ SEGURO: Logs sin datos sensibles
$this->logger->info('User login attempt', [
    'user_id' => $user->getId(),
    // Sin email, sin contraseña
]);
```

### 4. XML External Entities (XXE)

```php
<?php

// ❌ PELIGROSO: Análisis XML sin protección
$xml = simplexml_load_string($userInput);

// ✅ SEGURO: Desactivar entidades externas
libxml_disable_entity_loader(true);
$xml = simplexml_load_string($userInput, 'SimpleXMLElement', LIBXML_NOENT | LIBXML_DTDLOAD);
```

### 5. Broken Access Control

```php
<?php

// ❌ PELIGROSO: Sin verificación de derechos
public function show(int $id): Response
{
    $reservation = $this->repository->find($id);

    return $this->render('reservation/show.html.twig', [
        'reservation' => $reservation, // ❌ ¡Cualquiera puede ver!
    ]);
}

// ✅ SEGURO: Verificación vía Voter Symfony
#[Route('/reservations/{id}', name: 'reservation_show')]
public function show(Reservation $reservation): Response
{
    // ✅ Verifica que el usuario puede ver esta reserva
    $this->denyAccessUnlessGranted('VIEW', $reservation);

    return $this->render('reservation/show.html.twig', [
        'reservation' => $reservation,
    ]);
}
```

```php
<?php

// Voter para verificar derechos
namespace App\Security\Voter;

use App\Entity\Reservation;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

final class ReservationVoter extends Voter
{
    public const VIEW = 'VIEW';
    public const EDIT = 'EDIT';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::VIEW, self::EDIT])
            && $subject instanceof Reservation;
    }

    protected function voteOnAttribute(
        string $attribute,
        mixed $subject,
        TokenInterface $token
    ): bool {
        $user = $token->getUser();

        if (!$user instanceof UserInterface) {
            return false;
        }

        /** @var Reservation $reservation */
        $reservation = $subject;

        return match ($attribute) {
            self::VIEW => $this->canView($reservation, $user),
            self::EDIT => $this->canEdit($reservation, $user),
            default => false,
        };
    }

    private function canView(Reservation $reservation, UserInterface $user): bool
    {
        // ✅ El usuario puede ver sus propias reservas
        return $reservation->getClient()->getEmail() === $user->getUserIdentifier()
            || in_array('ROLE_ADMIN', $user->getRoles());
    }

    private function canEdit(Reservation $reservation, UserInterface $user): bool
    {
        // ✅ Solo el propietario o admin puede modificar
        return $reservation->getClient()->getEmail() === $user->getUserIdentifier()
            || in_array('ROLE_ADMIN', $user->getRoles());
    }
}
```

### 6. Security Misconfiguration

```yaml
# config/packages/security.yaml

security:
    # ✅ Password hasher seguro
    password_hashers:
        Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface:
            algorithm: auto # Usa mejor algoritmo (bcrypt/argon2)
            cost: 12       # Coste elevado (protección brute-force)

    # ✅ Firewalls configurados
    firewalls:
        dev:
            pattern: ^/(_(profiler|wdt)|css|images|js)/
            security: false

        main:
            lazy: true
            provider: app_user_provider
            form_login:
                login_path: login
                check_path: login
                enable_csrf: true # ✅ Protección CSRF

            logout:
                path: logout
                target: home

            # ✅ Remember me seguro
            remember_me:
                secret: '%kernel.secret%'
                lifetime: 604800 # 7 días
                secure: true     # Solo HTTPS
                httponly: true   # No accesible JS
                samesite: lax    # Protección CSRF

    # ✅ Control de acceso
    access_control:
        - { path: ^/admin, roles: ROLE_ADMIN }
        - { path: ^/reservations, roles: ROLE_USER }
```

### 7. XSS (ya cubierto en Injection)

### 8. Insecure Deserialization

```php
<?php

// ❌ PELIGROSO: Unserialize input de usuario
$data = unserialize($_POST['data']); // ❌ ¡Ejecución Remota de Código!

// ✅ SEGURO: Usar JSON
$data = json_decode($_POST['data'], true, 512, JSON_THROW_ON_ERROR);

// ✅ Validar después de deserialización
if (!isset($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    throw new InvalidArgumentException('Invalid data');
}
```

### 9. Using Components with Known Vulnerabilities

```bash
# ✅ Escanear las dependencias regularmente
make security-check

# composer audit
docker-compose exec php composer audit

# Output:
# Found 2 security vulnerability advisories affecting 1 package:
# symfony/http-kernel (v6.4.0)
#   CVE-2024-XXXX: Potential XSS vulnerability
#   Upgrade to 6.4.3

# ✅ Actualizar
make composer-update
```

### 10. Insufficient Logging & Monitoring

```php
<?php

namespace App\Security\EventListener;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\Security\Http\Event\LoginSuccessEvent;
use Symfony\Component\Security\Http\Event\LoginFailureEvent;
use Psr\Log\LoggerInterface;

#[AsEventListener]
final readonly class SecurityEventLogger
{
    public function __construct(
        private LoggerInterface $securityLogger,
    ) {}

    public function __invoke(LoginSuccessEvent|LoginFailureEvent $event): void
    {
        $request = $event->getRequest();

        if ($event instanceof LoginSuccessEvent) {
            // ✅ Registrar inicio de sesión exitoso
            $this->securityLogger->info('User login successful', [
                'user_id' => $event->getUser()->getUserIdentifier(),
                'ip' => $request->getClientIp(),
                'user_agent' => $request->headers->get('User-Agent'),
            ]);
        } else {
            // ✅ Registrar fallo de inicio de sesión (detectar brute-force)
            $this->securityLogger->warning('User login failed', [
                'username' => $request->request->get('_username'),
                'ip' => $request->getClientIp(),
                'user_agent' => $request->headers->get('User-Agent'),
                'error' => $event->getException()->getMessage(),
            ]);
        }
    }
}
```

---

## Conformidad RGPD

### Datos personales recopilados

| Dato | Tipo | Base legal | Duración de conservación |
|------|------|------------|-------------------------|
| Nombre, Apellido | Identidad | Contrato | 3 años después de la estancia |
| Email | Contacto | Contrato | 3 años después de la estancia |
| Teléfono | Contacto | Contrato | 3 años después de la estancia |
| **Alergias** | **Salud (sensible)** | **Consentimiento explícito** | **Duración de la estancia + eliminación** |
| **Tratamientos médicos** | **Salud (sensible)** | **Consentimiento explícito** | **Duración de la estancia + eliminación** |
| Dirección | Ubicación | Contrato | 3 años después de la estancia |
| Fecha de nacimiento | Identidad | Contrato | 3 años después de la estancia |

### Derechos de los usuarios (RGPD)

1. **Derecho de acceso:** Ver sus datos personales
2. **Derecho de rectificación:** Corregir sus datos
3. **Derecho al olvido:** Eliminar sus datos
4. **Derecho a la portabilidad:** Exportar sus datos
5. **Derecho de oposición:** Rechazar tratamiento de datos
6. **Derecho a la limitación:** Limitar el uso

### Implementación de derechos

```php
<?php

namespace App\Application\RGPD\UseCase;

use App\Domain\Client\Repository\ClientRepositoryInterface;
use App\Domain\Client\ValueObject\ClientId;

final readonly class ExportClientDataUseCase
{
    public function __construct(
        private ClientRepositoryInterface $clientRepository,
    ) {}

    /**
     * Exportar todos los datos personales de un cliente (derecho RGPD a la portabilidad).
     */
    public function execute(ExportClientDataCommand $command): array
    {
        $client = $this->clientRepository->findById(
            ClientId::fromString($command->clientId)
        );

        // ✅ Exportar TODOS los datos personales
        return [
            'identite' => [
                'nom' => $client->getNom(),
                'prenom' => $client->getPrenom(),
                'email' => (string) $client->getEmail(),
                'telephone' => (string) $client->getTelephone(),
                'date_naissance' => $client->getDateNaissance()->format('Y-m-d'),
            ],
            'adresse' => [
                'rue' => $client->getAdresse()->getRue(),
                'code_postal' => $client->getAdresse()->getCodePostal(),
                'ville' => $client->getAdresse()->getVille(),
            ],
            'reservations' => $this->exportReservations($client),
            'consentements' => $this->exportConsents($client),
        ];
    }

    private function exportReservations(Client $client): array
    {
        // Exportar reservas con participantes (incluidos datos médicos cifrados)
        return array_map(
            fn (Reservation $r) => [
                'id' => (string) $r->getId(),
                'date_creation' => $r->getCreatedAt()->format('Y-m-d H:i:s'),
                'statut' => $r->getStatut()->value,
                'montant' => $r->getMontantTotal()->getAmountEuros(),
                'participants' => $this->exportParticipants($r),
            ],
            $client->getReservations()->toArray()
        );
    }

    private function exportParticipants(Reservation $reservation): array
    {
        return array_map(
            fn (Participant $p) => [
                'nom' => $p->getNom(),
                'age' => $p->getAge(),
                // ✅ Datos sensibles descifrados para exportación del usuario
                'allergies' => $p->getAllergies()?->getDecrypted(),
                'traitements_medicaux' => $p->getTraitementsMedicaux()?->getDecrypted(),
            ],
            $reservation->getParticipants()->toArray()
        );
    }
}
```

```php
<?php

namespace App\Application\RGPD\UseCase;

final readonly class DeleteClientDataUseCase
{
    /**
     * Eliminar todos los datos personales de un cliente (derecho RGPD al olvido).
     */
    public function execute(DeleteClientDataCommand $command): void
    {
        $client = $this->clientRepository->findById($command->clientId);

        // ✅ Verificar que las reservas están terminadas
        if ($client->hasActiveReservations()) {
            throw new CannotDeleteClientException(
                'Client has active reservations. Cannot delete data.'
            );
        }

        // ✅ Anonimizar datos en lugar de eliminar (trazabilidad contable)
        $client->anonymize();

        // ✅ Eliminar datos sensibles (alergias, tratamientos)
        foreach ($client->getReservations() as $reservation) {
            foreach ($reservation->getParticipants() as $participant) {
                $participant->deleteSensitiveData();
            }
        }

        $this->clientRepository->save($client);

        // ✅ Registro de auditoría
        $this->auditLogger->info('Client data deleted', [
            'client_id' => (string) $command->clientId,
            'deleted_at' => new \DateTimeImmutable(),
        ]);
    }
}
```

---

## Cifrado de datos sensibles

### Configuración Halite (cifrado)

```php
<?php

// config/services.yaml
parameters:
    app.encryption_key: '%env(ENCRYPTION_KEY)%'

services:
    App\Infrastructure\Encryption\EncryptionService:
        arguments:
            $encryptionKey: '%app.encryption_key%'
```

```bash
# .env
# ⚠️ Generar una clave fuerte (32 bytes hex = 64 chars)
ENCRYPTION_KEY=your-64-character-hex-encryption-key-here
```

```bash
# Generar una clave segura
php -r "echo bin2hex(random_bytes(32)) . PHP_EOL;"
```

### Servicio de cifrado

```php
<?php

namespace App\Infrastructure\Encryption;

use ParagonIE\Halite\Symmetric\Crypto;
use ParagonIE\Halite\Symmetric\EncryptionKey;
use ParagonIE\HiddenString\HiddenString;

final readonly class EncryptionService
{
    private EncryptionKey $key;

    public function __construct(string $encryptionKey)
    {
        $this->key = new EncryptionKey(new HiddenString(hex2bin($encryptionKey)));
    }

    public function encrypt(string $plaintext): string
    {
        return Crypto::encrypt(
            new HiddenString($plaintext),
            $this->key
        );
    }

    public function decrypt(string $ciphertext): string
    {
        return Crypto::decrypt(
            $ciphertext,
            $this->key
        )->getString();
    }
}
```

### Value Object para datos cifrados

```php
<?php

namespace App\Domain\Shared\ValueObject;

/**
 * Value object de datos cifrados (para datos sensibles RGPD).
 */
final readonly class EncryptedData
{
    private function __construct(
        private string $encryptedValue,
    ) {}

    public static function fromPlaintext(
        string $plaintext,
        EncryptionService $encryptionService
    ): self {
        return new self($encryptionService->encrypt($plaintext));
    }

    public static function fromEncrypted(string $encrypted): self
    {
        return new self($encrypted);
    }

    public function getEncrypted(): string
    {
        return $this->encryptedValue;
    }

    public function getDecrypted(EncryptionService $encryptionService): string
    {
        return $encryptionService->decrypt($this->encryptedValue);
    }
}
```

### Entity con datos cifrados

```php
<?php

namespace App\Domain\Reservation\Entity;

use App\Domain\Shared\ValueObject\EncryptedData;

final class Participant
{
    private ?EncryptedData $allergies = null;
    private ?EncryptedData $traitementsMedicaux = null;

    public function setAllergies(
        ?string $plaintext,
        EncryptionService $encryptionService
    ): void {
        $this->allergies = $plaintext !== null
            ? EncryptedData::fromPlaintext($plaintext, $encryptionService)
            : null;
    }

    public function getAllergies(): ?EncryptedData
    {
        return $this->allergies;
    }

    public function getAllergiesDecrypted(EncryptionService $encryptionService): ?string
    {
        return $this->allergies?->getDecrypted($encryptionService);
    }

    /**
     * Eliminar datos sensibles (derecho RGPD al olvido).
     */
    public function deleteSensitiveData(): void
    {
        $this->allergies = null;
        $this->traitementsMedicaux = null;
    }
}
```

### Tipo Doctrine para cifrado automático

```php
<?php

namespace App\Infrastructure\Doctrine\Type;

use App\Domain\Shared\ValueObject\EncryptedData;
use App\Infrastructure\Encryption\EncryptionService;
use Doctrine\DBAL\Platforms\AbstractPlatform;
use Doctrine\DBAL\Types\Type;

final class EncryptedTextType extends Type
{
    private static ?EncryptionService $encryptionService = null;

    public static function setEncryptionService(EncryptionService $service): void
    {
        self::$encryptionService = $service;
    }

    public function convertToDatabaseValue($value, AbstractPlatform $platform): ?string
    {
        if ($value === null) {
            return null;
        }

        if (!$value instanceof EncryptedData) {
            throw new \InvalidArgumentException('Expected EncryptedData');
        }

        // ✅ Almacena el valor CIFRADO en la BD
        return $value->getEncrypted();
    }

    public function convertToPHPValue($value, AbstractPlatform $platform): ?EncryptedData
    {
        if ($value === null) {
            return null;
        }

        // ✅ Devuelve el objeto EncryptedData (NO descifrado automáticamente)
        return EncryptedData::fromEncrypted($value);
    }

    public function getName(): string
    {
        return 'encrypted_text';
    }

    public function getSQLDeclaration(array $column, AbstractPlatform $platform): string
    {
        return $platform->getClobTypeDeclarationSQL($column);
    }
}
```

### Mapeo Doctrine

```xml
<!-- Infrastructure/Persistence/Doctrine/Mapping/Participant.orm.xml -->
<entity name="App\Domain\Reservation\Entity\Participant" table="participant">
    <id name="id" type="participant_id"/>

    <!-- ✅ Datos sensibles cifrados -->
    <field name="allergies" type="encrypted_text" nullable="true" column="allergies_encrypted"/>
    <field name="traitementsMedicaux" type="encrypted_text" nullable="true" column="traitements_medicaux_encrypted"/>
</entity>
```

---

## Validación y sanitización

### Validación Symfony

```php
<?php

namespace App\Presentation\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Validator\Constraints as Assert;

final class ReservationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('email', EmailType::class, [
                'label' => 'Email',
                'constraints' => [
                    // ✅ Validación email
                    new Assert\NotBlank(),
                    new Assert\Email(mode: Assert\Email::VALIDATION_MODE_STRICT),
                    new Assert\Length(max: 255),
                ],
            ])
            ->add('nom', TextType::class, [
                'label' => 'Nombre',
                'constraints' => [
                    // ✅ Validación texto
                    new Assert\NotBlank(),
                    new Assert\Length(min: 2, max: 100),
                    new Assert\Regex(
                        pattern: '/^[a-zA-ZÀ-ÿ\s\-\']+$/',
                        message: 'El nombre contiene caracteres inválidos'
                    ),
                ],
            ]);
    }
}
```

### Sanitización

```php
<?php

namespace App\Application\Reservation\UseCase;

final readonly class CreateReservationUseCase
{
    public function execute(CreateReservationCommand $command): ReservationId
    {
        // ✅ Sanitizar input
        $sanitizedEmail = filter_var(
            trim($command->clientEmail),
            FILTER_SANITIZE_EMAIL
        );

        // ✅ Validar después de sanitización
        if (!filter_var($sanitizedEmail, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidEmailException('Invalid email address');
        }

        $email = Email::fromString($sanitizedEmail);

        // ...
    }
}
```

---

## Security Headers

### Configuración Symfony

```yaml
# config/packages/nelmio_security.yaml

nelmio_security:
    # ✅ Signed cookies
    signed_cookie:
        names: ['*']

    # ✅ Encrypted cookies
    encrypted_cookie:
        names: ['*']

    # ✅ Content Security Policy
    csp:
        enabled: true
        hosts: []
        content_types: []
        enforce:
            level1_fallback: false
            browser_adaptive:
                enabled: false
            default-src: ['self']
            script-src: ['self', 'unsafe-inline']
            style-src: ['self', 'unsafe-inline']
            img-src: ['self', 'data:']
            font-src: ['self']
            connect-src: ['self']
            frame-ancestors: ['none']
            base-uri: ['self']
            form-action: ['self']

    # ✅ Protección Clickjacking
    clickjacking:
        paths:
            '^/.*': DENY

    # ✅ Forzar HTTPS
    forced_ssl:
        enabled: true
        hsts_max_age: 31536000
        hsts_subdomains: true
        hsts_preload: true

    # ✅ Protección XSS
    xss_protection:
        enabled: true
        mode_block: true

    # ✅ Content Type Sniffing
    content_type:
        nosniff: true
```

---

## Registro de Auditoría

### Entity AuditLog

```php
<?php

namespace App\Domain\Audit\Entity;

final class AuditLog
{
    private string $id;
    private \DateTimeImmutable $occurredAt;
    private string $userId;
    private string $action;
    private string $entityType;
    private string $entityId;
    private array $changes;
    private string $ipAddress;

    public static function create(
        string $userId,
        string $action,
        string $entityType,
        string $entityId,
        array $changes,
        string $ipAddress
    ): self {
        $log = new self();
        $log->id = Uuid::v4()->toRfc4122();
        $log->occurredAt = new \DateTimeImmutable();
        $log->userId = $userId;
        $log->action = $action; // CREATE, UPDATE, DELETE, VIEW
        $log->entityType = $entityType;
        $log->entityId = $entityId;
        $log->changes = $changes;
        $log->ipAddress = $ipAddress;

        return $log;
    }
}
```

### Event Listener para auditoría

```php
<?php

namespace App\Infrastructure\Audit\EventListener;

use Doctrine\Bundle\DoctrineBundle\Attribute\AsDoctrineListener;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Doctrine\ORM\Events;

#[AsDoctrineListener(event: Events::preUpdate)]
final readonly class AuditListener
{
    public function __construct(
        private AuditLogRepository $auditRepository,
        private RequestStack $requestStack,
    ) {}

    public function preUpdate(PreUpdateEventArgs $args): void
    {
        $entity = $args->getObject();

        // ✅ Auditar solo ciertas entidades
        if (!$this->shouldAudit($entity)) {
            return;
        }

        $changes = [];

        foreach ($args->getEntityChangeSet() as $field => $values) {
            // ✅ No registrar datos sensibles en claro!
            if ($this->isSensitiveField($field)) {
                $changes[$field] = ['old' => '[ENCRYPTED]', 'new' => '[ENCRYPTED]'];
            } else {
                $changes[$field] = ['old' => $values[0], 'new' => $values[1]];
            }
        }

        $request = $this->requestStack->getCurrentRequest();

        $auditLog = AuditLog::create(
            userId: $this->getUser()?->getId() ?? 'anonymous',
            action: 'UPDATE',
            entityType: get_class($entity),
            entityId: (string) $entity->getId(),
            changes: $changes,
            ipAddress: $request?->getClientIp() ?? 'unknown'
        );

        $this->auditRepository->save($auditLog);
    }

    private function shouldAudit(object $entity): bool
    {
        return $entity instanceof Reservation
            || $entity instanceof Participant
            || $entity instanceof Client;
    }

    private function isSensitiveField(string $field): bool
    {
        return in_array($field, ['allergies', 'traitementsMedicaux', 'password']);
    }
}
```

---

## Checklist de seguridad

### Antes de cada commit

- [ ] **SQL Injection:** Consultas preparadas (Doctrine ORM)
- [ ] **XSS:** Auto-escape Twig activado
- [ ] **CSRF:** Tokens CSRF en formularios
- [ ] **Authentication:** PasswordHasher Symfony
- [ ] **Access Control:** Voters para verificación de derechos
- [ ] **Datos sensibles:** Cifrados (alergias, tratamientos)
- [ ] **Validación:** Restricciones Symfony Validator
- [ ] **Sanitización:** filter_var() en inputs
- [ ] **Secretos:** No hay secretos hardcodeados (usar .env)
- [ ] **Dependencias:** `composer audit` pasa

### Antes de cada release

- [ ] **OWASP Top 10:** Todas las protecciones implementadas
- [ ] **RGPD:** Derechos de usuario implementados
- [ ] **Cifrado:** Datos médicos cifrados
- [ ] **Security Headers:** CSP, HSTS, X-Frame-Options
- [ ] **Registro de Auditoría:** Logs para datos personales
- [ ] **Pruebas de Penetración:** Tests de seguridad realizados
- [ ] **Consentimiento:** Consentimiento RGPD recopilado y almacenado

---

## Recursos

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **RGPD (CNIL):** https://www.cnil.fr/fr/rgpd-de-quoi-parle-t-on
- **Symfony Security:** https://symfony.com/doc/current/security.html
- **Halite (Encryption):** https://github.com/paragonie/halite

---

**Fecha de última actualización:** 2025-01-26
**Versión:** 1.0.0
**Autor:** The Bearded CTO

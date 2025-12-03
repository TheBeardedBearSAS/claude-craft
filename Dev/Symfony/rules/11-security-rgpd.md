# Sécurité & RGPD - Atoll Tourisme

## Vue d'ensemble

La **sécurité** et le **respect du RGPD** sont **OBLIGATOIRES** et critiques pour Atoll Tourisme.

**Objectifs:**
- ✅ Protection OWASP Top 10
- ✅ Conformité RGPD stricte
- ✅ Chiffrement données sensibles (allergies, traitements médicaux)
- ✅ Validation et sanitization systématiques
- ✅ CSP headers
- ✅ Audit trail pour données personnelles

> **Rappel RGPD:**
> Les données médicales (allergies, traitements) des participants sont des **données sensibles**
> nécessitant un **chiffrement** et des **mesures de protection renforcées**.

> **Références:**
> - `03-coding-standards.md` - Validation inputs
> - `01-symfony-best-practices.md` - Security Symfony

---

## Table des matières

1. [OWASP Top 10 Protections](#owasp-top-10-protections)
2. [RGPD Compliance](#rgpd-compliance)
3. [Chiffrement données sensibles](#chiffrement-données-sensibles)
4. [Validation et sanitization](#validation-et-sanitization)
5. [Security Headers](#security-headers)
6. [Audit Trail](#audit-trail)
7. [Checklist sécurité](#checklist-sécurité)

---

## OWASP Top 10 Protections

### 1. Injection (SQL, XSS, Command)

#### SQL Injection

```php
<?php

// ❌ DANGEREUX: Concaténation SQL
$sql = "SELECT * FROM reservation WHERE email = '" . $_POST['email'] . "'";
$result = $connection->query($sql);

// ✅ SÛR: Requêtes préparées (Doctrine ORM/DQL)
$query = $entityManager->createQuery(
    'SELECT r FROM App\Entity\Reservation r WHERE r.email = :email'
);
$query->setParameter('email', $email); // ✅ Paramètre bindé
$result = $query->getResult();

// ✅ ENCORE MIEUX: Repository + QueryBuilder
final class DoctrineReservationRepository
{
    public function findByEmail(Email $email): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.email = :email')
            ->setParameter('email', (string) $email) // ✅ Automatiquement échappé
            ->getQuery()
            ->getResult();
    }
}
```

#### XSS (Cross-Site Scripting)

```twig
{# ❌ DANGEREUX: Affichage brut #}
{{ userInput|raw }}
<div>{{ comment|raw }}</div>

{# ✅ SÛR: Auto-escape Twig (par défaut) #}
{{ userInput }}
<div>{{ comment }}</div>

{# ✅ Escape explicite si raw nécessaire #}
{{ userInput|escape('html') }}
{{ userInput|e }}
```

```php
<?php

// ❌ DANGEREUX: echo direct
echo $_POST['name'];

// ✅ SÛR: htmlspecialchars
echo htmlspecialchars($_POST['name'], ENT_QUOTES, 'UTF-8');

// ✅ ENCORE MIEUX: Utiliser Twig pour l'affichage
return $this->render('reservation/show.html.twig', [
    'name' => $name, // Auto-escaped par Twig
]);
```

#### Command Injection

```php
<?php

// ❌ DANGEREUX: shell_exec avec input utilisateur
shell_exec('convert ' . $_POST['filename'] . ' output.pdf');

// ✅ SÛR: Utiliser ProcessBuilder Symfony
use Symfony\Component\Process\Process;

$process = new Process([
    'convert',
    $filename, // ✅ Argument séparé (pas d'injection possible)
    'output.pdf',
]);
$process->run();
```

### 2. Broken Authentication

```php
<?php

// ❌ DANGEREUX: Comparaison simple mot de passe
if ($inputPassword === $storedPassword) {
    // Login
}

// ✅ SÛR: Utiliser PasswordHasher Symfony
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final readonly class AuthenticationService
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher,
    ) {}

    public function verifyPassword(User $user, string $plainPassword): bool
    {
        // ✅ Utilise bcrypt/argon2 (timing-attack safe)
        return $this->passwordHasher->isPasswordValid($user, $plainPassword);
    }

    public function hashPassword(User $user, string $plainPassword): string
    {
        // ✅ Hash sécurisé avec salt automatique
        return $this->passwordHasher->hashPassword($user, $plainPassword);
    }
}
```

### 3. Sensitive Data Exposure

```php
<?php

// ❌ DANGEREUX: Données sensibles en clair
#[ORM\Column(type: 'text')]
private string $allergies; // ❌ RGPD violation!

// ✅ SÛR: Chiffrement Doctrine (voir section Chiffrement)
#[ORM\Column(type: 'encrypted_text')]
private ?EncryptedData $allergies = null;

// ❌ DANGEREUX: Logs avec données sensibles
$this->logger->info('User login', [
    'email' => $user->getEmail(),
    'password' => $password, // ❌ JAMAIS logger les mots de passe!
]);

// ✅ SÛR: Logs sans données sensibles
$this->logger->info('User login attempt', [
    'user_id' => $user->getId(),
    // Pas d'email, pas de mot de passe
]);
```

### 4. XML External Entities (XXE)

```php
<?php

// ❌ DANGEREUX: XML parsing sans protection
$xml = simplexml_load_string($userInput);

// ✅ SÛR: Désactiver external entities
libxml_disable_entity_loader(true);
$xml = simplexml_load_string($userInput, 'SimpleXMLElement', LIBXML_NOENT | LIBXML_DTDLOAD);
```

### 5. Broken Access Control

```php
<?php

// ❌ DANGEREUX: Pas de vérification de droits
public function show(int $id): Response
{
    $reservation = $this->repository->find($id);

    return $this->render('reservation/show.html.twig', [
        'reservation' => $reservation, // ❌ N'importe qui peut voir!
    ]);
}

// ✅ SÛR: Vérification via Voter Symfony
#[Route('/reservations/{id}', name: 'reservation_show')]
public function show(Reservation $reservation): Response
{
    // ✅ Vérifie que l'utilisateur peut voir cette réservation
    $this->denyAccessUnlessGranted('VIEW', $reservation);

    return $this->render('reservation/show.html.twig', [
        'reservation' => $reservation,
    ]);
}
```

```php
<?php

// Voter pour vérifier les droits
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
        // ✅ L'utilisateur peut voir ses propres réservations
        return $reservation->getClient()->getEmail() === $user->getUserIdentifier()
            || in_array('ROLE_ADMIN', $user->getRoles());
    }

    private function canEdit(Reservation $reservation, UserInterface $user): bool
    {
        // ✅ Seul le propriétaire ou admin peut modifier
        return $reservation->getClient()->getEmail() === $user->getUserIdentifier()
            || in_array('ROLE_ADMIN', $user->getRoles());
    }
}
```

### 6. Security Misconfiguration

```yaml
# config/packages/security.yaml

security:
    # ✅ Password hasher sécurisé
    password_hashers:
        Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface:
            algorithm: auto # Utilise meilleur algo (bcrypt/argon2)
            cost: 12       # Coût élevé (protection brute-force)

    # ✅ Firewalls configurés
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
                enable_csrf: true # ✅ Protection CSRF

            logout:
                path: logout
                target: home

            # ✅ Remember me sécurisé
            remember_me:
                secret: '%kernel.secret%'
                lifetime: 604800 # 7 jours
                secure: true     # HTTPS uniquement
                httponly: true   # Pas accessible JS
                samesite: lax    # Protection CSRF

    # ✅ Access control
    access_control:
        - { path: ^/admin, roles: ROLE_ADMIN }
        - { path: ^/reservations, roles: ROLE_USER }
```

### 7. XSS (déjà couvert dans Injection)

### 8. Insecure Deserialization

```php
<?php

// ❌ DANGEREUX: Unserialize input utilisateur
$data = unserialize($_POST['data']); // ❌ Remote Code Execution!

// ✅ SÛR: Utiliser JSON
$data = json_decode($_POST['data'], true, 512, JSON_THROW_ON_ERROR);

// ✅ Valider après désérialisation
if (!isset($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    throw new InvalidArgumentException('Invalid data');
}
```

### 9. Using Components with Known Vulnerabilities

```bash
# ✅ Scanner les dépendances régulièrement
make security-check

# composer audit
docker-compose exec php composer audit

# Output:
# Found 2 security vulnerability advisories affecting 1 package:
# symfony/http-kernel (v6.4.0)
#   CVE-2024-XXXX: Potential XSS vulnerability
#   Upgrade to 6.4.3

# ✅ Mettre à jour
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
            // ✅ Log successful login
            $this->securityLogger->info('User login successful', [
                'user_id' => $event->getUser()->getUserIdentifier(),
                'ip' => $request->getClientIp(),
                'user_agent' => $request->headers->get('User-Agent'),
            ]);
        } else {
            // ✅ Log failed login (detect brute-force)
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

## RGPD Compliance

### Données personnelles collectées

| Donnée | Type | Base légale | Durée conservation |
|--------|------|-------------|-------------------|
| Nom, Prénom | Identité | Contrat | 3 ans après séjour |
| Email | Contact | Contrat | 3 ans après séjour |
| Téléphone | Contact | Contrat | 3 ans après séjour |
| **Allergies** | **Santé (sensible)** | **Consentement explicite** | **Durée du séjour + suppression** |
| **Traitements médicaux** | **Santé (sensible)** | **Consentement explicite** | **Durée du séjour + suppression** |
| Adresse | Localisation | Contrat | 3 ans après séjour |
| Date de naissance | Identité | Contrat | 3 ans après séjour |

### Droits des utilisateurs (RGPD)

1. **Droit d'accès:** Voir ses données personnelles
2. **Droit de rectification:** Corriger ses données
3. **Droit à l'effacement:** Supprimer ses données
4. **Droit à la portabilité:** Exporter ses données
5. **Droit d'opposition:** Refuser traitement données
6. **Droit à la limitation:** Limiter l'utilisation

### Implémentation des droits

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
     * Export all personal data for a client (RGPD right to portability).
     */
    public function execute(ExportClientDataCommand $command): array
    {
        $client = $this->clientRepository->findById(
            ClientId::fromString($command->clientId)
        );

        // ✅ Export TOUTES les données personnelles
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
        // Export des réservations avec participants (y compris données médicales chiffrées)
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
                // ✅ Données sensibles déchiffrées pour export utilisateur
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
     * Delete all personal data for a client (RGPD right to erasure).
     */
    public function execute(DeleteClientDataCommand $command): void
    {
        $client = $this->clientRepository->findById($command->clientId);

        // ✅ Vérifier que les réservations sont terminées
        if ($client->hasActiveReservations()) {
            throw new CannotDeleteClientException(
                'Client has active reservations. Cannot delete data.'
            );
        }

        // ✅ Anonymiser les données au lieu de supprimer (traçabilité comptable)
        $client->anonymize();

        // ✅ Supprimer les données sensibles (allergies, traitements)
        foreach ($client->getReservations() as $reservation) {
            foreach ($reservation->getParticipants() as $participant) {
                $participant->deleteSensitiveData();
            }
        }

        $this->clientRepository->save($client);

        // ✅ Audit log
        $this->auditLogger->info('Client data deleted', [
            'client_id' => (string) $command->clientId,
            'deleted_at' => new \DateTimeImmutable(),
        ]);
    }
}
```

---

## Chiffrement données sensibles

### Configuration Halite (chiffrement)

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
# ⚠️ Générer une clé forte (32 bytes hex = 64 chars)
ENCRYPTION_KEY=your-64-character-hex-encryption-key-here
```

```bash
# Générer une clé sécurisée
php -r "echo bin2hex(random_bytes(32)) . PHP_EOL;"
```

### Service de chiffrement

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

### Value Object pour données chiffrées

```php
<?php

namespace App\Domain\Shared\ValueObject;

/**
 * Encrypted data value object (for GDPR-sensitive data).
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

### Entity avec données chiffrées

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
     * Delete sensitive data (RGPD right to erasure).
     */
    public function deleteSensitiveData(): void
    {
        $this->allergies = null;
        $this->traitementsMedicaux = null;
    }
}
```

### Doctrine Type pour chiffrement automatique

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

        // ✅ Stocke la valeur CHIFFRÉE dans la BDD
        return $value->getEncrypted();
    }

    public function convertToPHPValue($value, AbstractPlatform $platform): ?EncryptedData
    {
        if ($value === null) {
            return null;
        }

        // ✅ Retourne l'objet EncryptedData (PAS déchiffré automatiquement)
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

### Mapping Doctrine

```xml
<!-- Infrastructure/Persistence/Doctrine/Mapping/Participant.orm.xml -->
<entity name="App\Domain\Reservation\Entity\Participant" table="participant">
    <id name="id" type="participant_id"/>

    <!-- ✅ Données sensibles chiffrées -->
    <field name="allergies" type="encrypted_text" nullable="true" column="allergies_encrypted"/>
    <field name="traitementsMedicaux" type="encrypted_text" nullable="true" column="traitements_medicaux_encrypted"/>
</entity>
```

---

## Validation et sanitization

### Validation Symfony

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
                    // ✅ Validation email
                    new Assert\NotBlank(),
                    new Assert\Email(mode: Assert\Email::VALIDATION_MODE_STRICT),
                    new Assert\Length(max: 255),
                ],
            ])
            ->add('nom', TextType::class, [
                'label' => 'Nom',
                'constraints' => [
                    // ✅ Validation texte
                    new Assert\NotBlank(),
                    new Assert\Length(min: 2, max: 100),
                    new Assert\Regex(
                        pattern: '/^[a-zA-ZÀ-ÿ\s\-\']+$/',
                        message: 'Le nom contient des caractères invalides'
                    ),
                ],
            ]);
    }
}
```

### Sanitization

```php
<?php

namespace App\Application\Reservation\UseCase;

final readonly class CreateReservationUseCase
{
    public function execute(CreateReservationCommand $command): ReservationId
    {
        // ✅ Sanitize input
        $sanitizedEmail = filter_var(
            trim($command->clientEmail),
            FILTER_SANITIZE_EMAIL
        );

        // ✅ Validate après sanitization
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

### Configuration Symfony

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

    # ✅ Clickjacking protection
    clickjacking:
        paths:
            '^/.*': DENY

    # ✅ Force HTTPS
    forced_ssl:
        enabled: true
        hsts_max_age: 31536000
        hsts_subdomains: true
        hsts_preload: true

    # ✅ XSS Protection
    xss_protection:
        enabled: true
        mode_block: true

    # ✅ Content Type Sniffing
    content_type:
        nosniff: true
```

---

## Audit Trail

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

### Event Listener pour audit

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

        // ✅ Audit uniquement certaines entités
        if (!$this->shouldAudit($entity)) {
            return;
        }

        $changes = [];

        foreach ($args->getEntityChangeSet() as $field => $values) {
            // ✅ Ne pas logger les données sensibles en clair!
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

## Checklist sécurité

### Avant chaque commit

- [ ] **SQL Injection:** Requêtes préparées (Doctrine ORM)
- [ ] **XSS:** Auto-escape Twig activé
- [ ] **CSRF:** Tokens CSRF sur formulaires
- [ ] **Authentication:** PasswordHasher Symfony
- [ ] **Access Control:** Voters pour vérification droits
- [ ] **Données sensibles:** Chiffrées (allergies, traitements)
- [ ] **Validation:** Contraintes Symfony Validator
- [ ] **Sanitization:** filter_var() sur inputs
- [ ] **Secrets:** Pas de secrets en dur (utiliser .env)
- [ ] **Dependencies:** `composer audit` passe

### Avant chaque release

- [ ] **OWASP Top 10:** Toutes protections implémentées
- [ ] **RGPD:** Droits utilisateurs implémentés
- [ ] **Chiffrement:** Données médicales chiffrées
- [ ] **Security Headers:** CSP, HSTS, X-Frame-Options
- [ ] **Audit Trail:** Logs pour données personnelles
- [ ] **Penetration Testing:** Tests de sécurité effectués
- [ ] **Consent:** Consentement RGPD collecté et stocké

---

## Ressources

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **RGPD (CNIL):** https://www.cnil.fr/fr/rgpd-de-quoi-parle-t-on
- **Symfony Security:** https://symfony.com/doc/current/security.html
- **Halite (Encryption):** https://github.com/paragonie/halite

---

**Date de dernière mise à jour:** 2025-01-26
**Version:** 1.0.0
**Auteur:** The Bearded CTO

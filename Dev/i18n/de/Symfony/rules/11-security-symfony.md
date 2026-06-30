---
---

# Sicherheit & DSGVO - Atoll Tourisme

## Überblick

**Sicherheit** und **DSGVO-Konformität** sind **OBLIGATORISCH** und kritisch für Atoll Tourisme.

**Ziele:**
- ✅ OWASP Top 10 Schutz
- ✅ Strikte DSGVO-Konformität
- ✅ Verschlüsselung sensibler Daten (Allergien, medizinische Behandlungen)
- ✅ Systematische Validierung und Sanitization
- ✅ CSP-Header
- ✅ Audit Trail für personenbezogene Daten

> **DSGVO-Erinnerung:**
> Medizinische Daten (Allergien, Behandlungen) der Teilnehmer sind **sensible Daten**,
> die **Verschlüsselung** und **verstärkte Schutzmaßnahmen** erfordern.

> **Referenzen:**
> - `03-coding-standards.md` - Eingabevalidierung
> - `01-symfony-best-practices.md` - Symfony Security

---

## Inhaltsverzeichnis

1. [OWASP Top 10 Schutzmaßnahmen](#owasp-top-10-schutzmaßnahmen)
2. [DSGVO-Konformität](#dsgvo-konformität)
3. [Verschlüsselung sensibler Daten](#verschlüsselung-sensibler-daten)
4. [Validierung und Sanitization](#validierung-und-sanitization)
5. [Sicherheits-Header](#sicherheits-header)
6. [Audit Trail](#audit-trail)
7. [Sicherheits-Checkliste](#sicherheits-checkliste)

---

## OWASP Top 10 Schutzmaßnahmen

### 1. Injection (SQL, XSS, Command)

#### SQL-Injection

```php
<?php

// ❌ GEFÄHRLICH: SQL-Konkatenation
$sql = "SELECT * FROM reservation WHERE email = '" . $_POST['email'] . "'";
$result = $connection->query($sql);

// ✅ SICHER: Prepared Statements (Doctrine ORM/DQL)
$query = $entityManager->createQuery(
    'SELECT r FROM App\Entity\Reservation r WHERE r.email = :email'
);
$query->setParameter('email', $email); // ✅ Parameter gebunden
$result = $query->getResult();

// ✅ NOCH BESSER: Repository + QueryBuilder
final class DoctrineReservationRepository
{
    public function findByEmail(Email $email): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.email = :email')
            ->setParameter('email', (string) $email) // ✅ Automatisch escaped
            ->getQuery()
            ->getResult();
    }
}
```

#### XSS (Cross-Site Scripting)

```twig
{# ❌ GEFÄHRLICH: Rohe Ausgabe #}
{{ userInput|raw }}
<div>{{ comment|raw }}</div>

{# ✅ SICHER: Twig Auto-Escape (Standard) #}
{{ userInput }}
<div>{{ comment }}</div>

{# ✅ Explizites Escape bei raw erforderlich #}
{{ userInput|escape('html') }}
{{ userInput|e }}
```

```php
<?php

// ❌ GEFÄHRLICH: Direktes echo
echo $_POST['name'];

// ✅ SICHER: htmlspecialchars
echo htmlspecialchars($_POST['name'], ENT_QUOTES, 'UTF-8');

// ✅ NOCH BESSER: Twig für Ausgabe verwenden
return $this->render('reservation/show.html.twig', [
    'name' => $name, // Auto-escaped von Twig
]);
```

#### Command-Injection

```php
<?php

// ❌ GEFÄHRLICH: shell_exec mit Benutzereingabe
shell_exec('convert ' . $_POST['filename'] . ' output.pdf');

// ✅ SICHER: Symfony ProcessBuilder verwenden
use Symfony\Component\Process\Process;

$process = new Process([
    'convert',
    $filename, // ✅ Separates Argument (keine Injection möglich)
    'output.pdf',
]);
$process->run();
```

### 2. Broken Authentication

```php
<?php

// ❌ GEFÄHRLICH: Einfacher Passwortvergleich
if ($inputPassword === $storedPassword) {
    // Anmeldung
}

// ✅ SICHER: Symfony PasswordHasher verwenden
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final readonly class AuthenticationService
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher,
    ) {}

    public function verifyPassword(User $user, string $plainPassword): bool
    {
        // ✅ Verwendet bcrypt/argon2 (timing-attack-sicher)
        return $this->passwordHasher->isPasswordValid($user, $plainPassword);
    }

    public function hashPassword(User $user, string $plainPassword): string
    {
        // ✅ Sicheres Hashing mit automatischem Salt
        return $this->passwordHasher->hashPassword($user, $plainPassword);
    }
}
```

### 3. Sensitive Data Exposure

```php
<?php

// ❌ GEFÄHRLICH: Sensible Daten im Klartext
#[ORM\Column(type: 'text')]
private string $allergies; // ❌ DSGVO-Verletzung!

// ✅ SICHER: Doctrine-Verschlüsselung (siehe Verschlüsselungsabschnitt)
#[ORM\Column(type: 'encrypted_text')]
private ?EncryptedData $allergies = null;

// ❌ GEFÄHRLICH: Logs mit sensiblen Daten
$this->logger->info('Benutzeranmeldung', [
    'email' => $user->getEmail(),
    'password' => $password, // ❌ NIEMALS Passwörter loggen!
]);

// ✅ SICHER: Logs ohne sensible Daten
$this->logger->info('Anmeldeversuch', [
    'user_id' => $user->getId(),
    // Keine E-Mail, kein Passwort
]);
```

### 4. XML External Entities (XXE)

```php
<?php

// ✅ SÛR: libxml 2.9+ (défaut depuis PHP 7/2013) désactive les entités externes par défaut.
// Ne PAS passer LIBXML_NOENT ni LIBXML_DTDLOAD avec de la saisie utilisateur.
$xml = simplexml_load_string($userInput);  // safe — aucun flag supplémentaire

// ✅ SÛR (défense en profondeur, si libxml >= 2.13.0) : LIBXML_NO_XXE explicite
// Disponible seulement si libxml >= 2.13.0 (vérifier : LIBXML_DOTTED_VERSION >= '2.13.0')
if (defined('LIBXML_NO_XXE')) {
    $xml = simplexml_load_string($userInput, null, LIBXML_NO_XXE);
}

// ❌ DANGEREUX: LIBXML_NOENT active la substitution d'entités ;
//               LIBXML_DTDLOAD charge les DTD externes — combinaison XXE classique
$xml = simplexml_load_string($userInput, 'SimpleXMLElement', LIBXML_NOENT | LIBXML_DTDLOAD);

// ❌ DÉPRÉCIÉ depuis PHP 8.0 + DANGEREUX: la fonction deprecated n'annule pas les flags ci-dessous
libxml_disable_entity_loader(true);
$xml = simplexml_load_string($userInput, 'SimpleXMLElement', LIBXML_NOENT | LIBXML_DTDLOAD);
```

### 5. Broken Access Control

```php
<?php

// ❌ GEFÄHRLICH: Keine Rechteprüfung
public function show(int $id): Response
{
    $reservation = $this->repository->find($id);

    return $this->render('reservation/show.html.twig', [
        'reservation' => $reservation, // ❌ Jeder kann es sehen!
    ]);
}

// ✅ SICHER: Überprüfung über Symfony Voter
#[Route('/reservations/{id}', name: 'reservation_show')]
public function show(Reservation $reservation): Response
{
    // ✅ Prüft, ob der Benutzer diese Reservierung sehen darf
    $this->denyAccessUnlessGranted('VIEW', $reservation);

    return $this->render('reservation/show.html.twig', [
        'reservation' => $reservation,
    ]);
}
```

```php
<?php

// Voter zur Rechteprüfung
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
        // ✅ Benutzer kann eigene Reservierungen sehen
        return $reservation->getClient()->getEmail() === $user->getUserIdentifier()
            || in_array('ROLE_ADMIN', $user->getRoles());
    }

    private function canEdit(Reservation $reservation, UserInterface $user): bool
    {
        // ✅ Nur Eigentümer oder Admin kann bearbeiten
        return $reservation->getClient()->getEmail() === $user->getUserIdentifier()
            || in_array('ROLE_ADMIN', $user->getRoles());
    }
}
```

### 6. Security Misconfiguration

```yaml
# config/packages/security.yaml

security:
    # ✅ Sicherer Password-Hasher: sodium = Argon2id via libsodium (OWASP 2026)
    password_hashers:
        Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface:
            algorithm: sodium      # Argon2id via libsodium (always present PHP 8.4+)
            memory_cost: 131072    # 128 MiB in KiB — OWASP 2026 minimum
            time_cost: 3           # iterations — OWASP 2026 minimum
        # Legacy rehash on next login:
        legacy_bcrypt:
            algorithm: bcrypt
            migrate_from: [App\Security\LegacyBcryptHasher]

    # ✅ Firewalls konfiguriert
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
                enable_csrf: true # ✅ CSRF-Schutz

            logout:
                path: logout
                target: home

            # ✅ Sicheres Remember-Me
            remember_me:
                secret: '%kernel.secret%'
                lifetime: 604800 # 7 Tage
                secure: true     # Nur HTTPS
                httponly: true   # Nicht per JS zugänglich
                samesite: lax    # CSRF-Schutz

    # ✅ Zugriffskontrolle
    access_control:
        - { path: ^/admin, roles: ROLE_ADMIN }
        - { path: ^/reservations, roles: ROLE_USER }
```

### 7. XSS (bereits in Injection behandelt)

### 8. Insecure Deserialization

```php
<?php

// ❌ GEFÄHRLICH: Benutzer-Input deserialisieren
$data = unserialize($_POST['data']); // ❌ Remote Code Execution!

// ✅ SICHER: JSON verwenden
$data = json_decode($_POST['data'], true, 512, JSON_THROW_ON_ERROR);

// ✅ Nach Deserialisierung validieren
if (!isset($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    throw new InvalidArgumentException('Ungültige Daten');
}
```

### 9. Using Components with Known Vulnerabilities

```bash
# ✅ Abhängigkeiten regelmäßig scannen
make security-check

# composer audit
docker-compose exec php composer audit

# Ausgabe:
# Found 2 security vulnerability advisories affecting 1 package:
# symfony/http-kernel (v6.4.0)
#   CVE-2024-XXXX: Potential XSS vulnerability
#   Upgrade to 6.4.3

# ✅ Aktualisieren
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
            // ✅ Erfolgreiche Anmeldung loggen
            $this->securityLogger->info('Benutzeranmeldung erfolgreich', [
                'user_id' => $event->getUser()->getUserIdentifier(),
                'ip' => $request->getClientIp(),
                'user_agent' => $request->headers->get('User-Agent'),
            ]);
        } else {
            // ✅ Fehlgeschlagene Anmeldung loggen (Brute-Force erkennen)
            $this->securityLogger->warning('Benutzeranmeldung fehlgeschlagen', [
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

## DSGVO-Konformität

### Gesammelte personenbezogene Daten

| Daten | Typ | Rechtsgrundlage | Aufbewahrungsdauer |
|--------|------|-------------|-------------------|
| Name, Vorname | Identität | Vertrag | 3 Jahre nach Aufenthalt |
| E-Mail | Kontakt | Vertrag | 3 Jahre nach Aufenthalt |
| Telefon | Kontakt | Vertrag | 3 Jahre nach Aufenthalt |
| **Allergien** | **Gesundheit (sensibel)** | **Ausdrückliche Einwilligung** | **Dauer des Aufenthalts + Löschung** |
| **Medizinische Behandlungen** | **Gesundheit (sensibel)** | **Ausdrückliche Einwilligung** | **Dauer des Aufenthalts + Löschung** |
| Adresse | Standort | Vertrag | 3 Jahre nach Aufenthalt |
| Geburtsdatum | Identität | Vertrag | 3 Jahre nach Aufenthalt |

### Benutzerrechte (DSGVO)

1. **Auskunftsrecht:** Eigene personenbezogene Daten einsehen
2. **Berichtigungsrecht:** Eigene Daten korrigieren
3. **Recht auf Löschung:** Eigene Daten löschen
4. **Recht auf Datenübertragbarkeit:** Eigene Daten exportieren
5. **Widerspruchsrecht:** Datenverarbeitung ablehnen
6. **Recht auf Einschränkung:** Nutzung einschränken

### Implementierung der Rechte

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
     * Alle personenbezogenen Daten eines Kunden exportieren (DSGVO-Recht auf Datenübertragbarkeit).
     */
    public function execute(ExportClientDataCommand $command): array
    {
        $client = $this->clientRepository->findById(
            ClientId::fromString($command->clientId)
        );

        // ✅ Export ALLER personenbezogenen Daten
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
        // Export der Buchungen mit Teilnehmern (inkl. verschlüsselte medizinische Daten)
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
                // ✅ Sensible Daten entschlüsselt für Benutzerexport
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
     * Alle personenbezogenen Daten eines Kunden löschen (DSGVO-Recht auf Löschung).
     */
    public function execute(DeleteClientDataCommand $command): void
    {
        $client = $this->clientRepository->findById($command->clientId);

        // ✅ Prüfen, ob Buchungen abgeschlossen sind
        if ($client->hasActiveReservations()) {
            throw new CannotDeleteClientException(
                'Kunde hat aktive Buchungen. Daten können nicht gelöscht werden.'
            );
        }

        // ✅ Daten anonymisieren statt löschen (buchhalterische Nachverfolgbarkeit)
        $client->anonymize();

        // ✅ Sensible Daten löschen (Allergien, Behandlungen)
        foreach ($client->getReservations() as $reservation) {
            foreach ($reservation->getParticipants() as $participant) {
                $participant->deleteSensitiveData();
            }
        }

        $this->clientRepository->save($client);

        // ✅ Audit-Log
        $this->auditLogger->info('Kundendaten gelöscht', [
            'client_id' => (string) $command->clientId,
            'deleted_at' => new \DateTimeImmutable(),
        ]);
    }
}
```

---

## Verschlüsselung sensibler Daten

### Halite-Konfiguration (Verschlüsselung)

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
# ⚠️ Starken Schlüssel generieren (32 Bytes hex = 64 Zeichen)
ENCRYPTION_KEY=ihr-64-zeichen-hex-verschlüsselungsschlüssel-hier
```

```bash
# Sicheren Schlüssel generieren
php -r "echo bin2hex(random_bytes(32)) . PHP_EOL;"
```

### Verschlüsselungsservice

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

### Value Object für verschlüsselte Daten

```php
<?php

namespace App\Domain\Shared\ValueObject;

/**
 * Verschlüsseltes Daten-Value-Object (für DSGVO-sensible Daten).
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

### Entity mit verschlüsselten Daten

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
     * Sensible Daten löschen (DSGVO-Recht auf Löschung).
     */
    public function deleteSensitiveData(): void
    {
        $this->allergies = null;
        $this->traitementsMedicaux = null;
    }
}
```

### Doctrine-Typ für automatische Verschlüsselung

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
            throw new \InvalidArgumentException('EncryptedData erwartet');
        }

        // ✅ VERSCHLÜSSELTEN Wert in der DB speichern
        return $value->getEncrypted();
    }

    public function convertToPHPValue($value, AbstractPlatform $platform): ?EncryptedData
    {
        if ($value === null) {
            return null;
        }

        // ✅ EncryptedData-Objekt zurückgeben (NICHT automatisch entschlüsselt)
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

### Doctrine-Mapping

```xml
<!-- Infrastructure/Persistence/Doctrine/Mapping/Participant.orm.xml -->
<entity name="App\Domain\Reservation\Entity\Participant" table="participant">
    <id name="id" type="participant_id"/>

    <!-- ✅ Sensible Daten verschlüsselt -->
    <field name="allergies" type="encrypted_text" nullable="true" column="allergies_encrypted"/>
    <field name="traitementsMedicaux" type="encrypted_text" nullable="true" column="traitements_medicaux_encrypted"/>
</entity>
```

---

## Validierung und Sanitization

### Symfony-Validierung

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
                'label' => 'E-Mail',
                'constraints' => [
                    // ✅ E-Mail-Validierung
                    new Assert\NotBlank(),
                    new Assert\Email(mode: Assert\Email::VALIDATION_MODE_STRICT),
                    new Assert\Length(max: 255),
                ],
            ])
            ->add('nom', TextType::class, [
                'label' => 'Name',
                'constraints' => [
                    // ✅ Text-Validierung
                    new Assert\NotBlank(),
                    new Assert\Length(min: 2, max: 100),
                    new Assert\Regex(
                        pattern: '/^[a-zA-ZÀ-ÿ\s\-\']+$/',
                        message: 'Der Name enthält ungültige Zeichen'
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
        // ✅ Eingabe bereinigen
        $sanitizedEmail = filter_var(
            trim($command->clientEmail),
            FILTER_SANITIZE_EMAIL
        );

        // ✅ Nach Sanitization validieren
        if (!filter_var($sanitizedEmail, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidEmailException('Ungültige E-Mail-Adresse');
        }

        $email = Email::fromString($sanitizedEmail);

        // ...
    }
}
```

---

## Sicherheits-Header

### Symfony-Konfiguration

```yaml
# config/packages/nelmio_security.yaml

nelmio_security:
    # ✅ Signierte Cookies
    signed_cookie:
        names: ['*']

    # ✅ Verschlüsselte Cookies
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

    # ✅ Clickjacking-Schutz
    clickjacking:
        paths:
            '^/.*': DENY

    # ✅ HTTPS erzwingen
    forced_ssl:
        enabled: true
        hsts_max_age: 31536000
        hsts_subdomains: true
        hsts_preload: true

    # ✅ XSS-Schutz
    xss_protection:
        enabled: true
        mode_block: true

    # ✅ Content-Type-Sniffing verhindern
    content_type:
        nosniff: true
```

---

## Audit Trail

### AuditLog-Entity

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

### Event-Listener für Audit

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

        // ✅ Nur bestimmte Entitäten auditieren
        if (!$this->shouldAudit($entity)) {
            return;
        }

        $changes = [];

        foreach ($args->getEntityChangeSet() as $field => $values) {
            // ✅ Sensible Daten NICHT im Klartext loggen!
            if ($this->isSensitiveField($field)) {
                $changes[$field] = ['old' => '[VERSCHLÜSSELT]', 'new' => '[VERSCHLÜSSELT]'];
            } else {
                $changes[$field] = ['old' => $values[0], 'new' => $values[1]];
            }
        }

        $request = $this->requestStack->getCurrentRequest();

        $auditLog = AuditLog::create(
            userId: $this->getUser()?->getId() ?? 'anonym',
            action: 'UPDATE',
            entityType: get_class($entity),
            entityId: (string) $entity->getId(),
            changes: $changes,
            ipAddress: $request?->getClientIp() ?? 'unbekannt'
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

## Sicherheits-Checkliste

### Vor jedem Commit

- [ ] **SQL-Injection:** Prepared Statements (Doctrine ORM)
- [ ] **XSS:** Twig Auto-Escape aktiviert
- [ ] **CSRF:** CSRF-Tokens bei Formularen
- [ ] **Authentifizierung:** Symfony PasswordHasher
- [ ] **Zugriffskontrolle:** Voters zur Rechteprüfung
- [ ] **Sensible Daten:** Verschlüsselt (Allergien, Behandlungen)
- [ ] **Validierung:** Symfony Validator Constraints
- [ ] **Sanitization:** filter_var() bei Eingaben
- [ ] **Secrets:** Keine Secrets hardcodiert (.env verwenden)
- [ ] **Abhängigkeiten:** `composer audit` besteht

### Vor jedem Release

- [ ] **OWASP Top 10:** Alle Schutzmaßnahmen implementiert
- [ ] **DSGVO:** Benutzerrechte implementiert
- [ ] **Verschlüsselung:** Medizinische Daten verschlüsselt
- [ ] **Sicherheits-Header:** CSP, HSTS, X-Frame-Options
- [ ] **Audit Trail:** Logs für personenbezogene Daten
- [ ] **Penetration Testing:** Sicherheitstests durchgeführt
- [ ] **Einwilligung:** DSGVO-Einwilligung gesammelt und gespeichert

---

## Ressourcen

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **DSGVO (CNIL):** https://www.cnil.fr/fr/rgpd-de-quoi-parle-t-on
- **Symfony Security:** https://symfony.com/doc/current/security.html
- **Halite (Verschlüsselung):** https://github.com/paragonie/halite

---

**Letzte Aktualisierung:** 2025-01-26
**Version:** 1.0.0
**Autor:** The Bearded CTO

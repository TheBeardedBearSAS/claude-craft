# Checkliste: Sicherheit & DSGVO

> **Sicherheitsaudit und DSGVO-Konformität** - Vor jedem Release zu prüfen
> Referenz: `.claude/rules/07-security-rgpd.md`

## Kontext Atoll Tourisme

**Erfasste personenbezogene Daten:**
- Teilnehmer: Nachname, Vorname, Geburtsdatum
- Kontakt: E-Mail, Telefon
- Buchungen: Aufenthaltshistorie
- Zahlungen: Zahlungsinformationen (über Stripe)

**DSGVO-Pflichten:**
- Ausdrückliche Einwilligung
- Recht auf Vergessenwerden
- Datenportabilität
- Verschlüsselung in der Datenbank
- Begrenzte Aufbewahrungsdauer
- Nachverfolgbarkeit (Logs)

---

## 1. Schutz personenbezogener Daten

### ✅ Sensible Daten in DB verschlüsselt

**Prüfung:**
```bash
# Doctrine-Verschlüsselung prüfen
grep -r "Encrypted" src/Entity/
```

**Kriterium:**
```php
use DoctrineEncryptBundle\Configuration\Encrypted;

#[ORM\Entity]
class Participant
{
    #[ORM\Column(type: 'string')]
    #[Encrypted]  // ✅ In DB verschlüsselt
    private string $nom;

    #[ORM\Column(type: 'string')]
    #[Encrypted]  // ✅ In DB verschlüsselt
    private string $prenom;

    #[ORM\Column(type: 'date_immutable')]
    #[Encrypted]  // ✅ In DB verschlüsselt
    private \DateTimeImmutable $dateNaissance;
}
```

**Verschlüsselungs-Checkliste:**
- [ ] `Participant::$nom` verschlüsselt
- [ ] `Participant::$prenom` verschlüsselt
- [ ] `Participant::$dateNaissance` verschlüsselt
- [ ] `Reservation::$emailContact` verschlüsselt
- [ ] `Reservation::$telephoneContact` verschlüsselt
- [ ] Verschlüsselungsschlüssel in `.env` (nicht committed)
- [ ] Rotierender Verschlüsselungsschlüssel (Prozess dokumentiert)

**Verschlüsselung testen:**
```bash
# Mit DB verbinden
docker compose exec db mysql -u root -p atoll

# Prüfen, dass Daten verschlüsselt sind
SELECT nom, prenom FROM participant LIMIT 1;
# Erwartetes Ergebnis: verschlüsselte Strings (base64)
# ✅ "enc:def502000..."
# ❌ "Dupont" (Klartext)
```

**Wenn Daten nicht verschlüsselt:**
```bash
# doctrine-encrypt-bundle installieren
composer require ambta/doctrine-encrypt-bundle

# Konfiguration
# config/packages/doctrine_encrypt.yaml
doctrine_encrypt:
    secret_directory_path: '%kernel.project_dir%/config/secrets/%kernel.environment%'
    cipher_algorithm: 'aes-256-gcm'
    encryptor_class: Halite

# Annotationen hinzufügen
vim src/Entity/Participant.php

# Migration zur Verschlüsselung vorhandener Daten
php bin/console doctrine:encrypt:database
```

---

## 2. Validierung von Benutzereingaben

### ✅ Strikte Validierung aller Inputs

**Prüfung:**
```bash
# Nach nicht validierten Inputs suchen
grep -r "request->get\|request->request->get" src/Controller/
```

**Anti-Pattern:**
```php
// ❌ Keine Validierung
public function create(Request $request): Response
{
    $email = $request->request->get('email');
    $reservation = new Reservation();
    $reservation->setEmail($email); // Injektion möglich
}
```

**Sicheres Pattern:**
```php
// ✅ Validierung über Form + Constraints
use Symfony\Component\Validator\Constraints as Assert;

class ReservationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('emailContact', EmailType::class, [
                'constraints' => [
                    new Assert\NotBlank(),
                    new Assert\Email(mode: 'strict'),
                    new Assert\Length(max: 180),
                ],
            ])
            ->add('telephoneContact', TelType::class, [
                'constraints' => [
                    new Assert\NotBlank(),
                    new Assert\Regex(pattern: '/^0[1-9]\d{8}$/'),
                ],
            ]);
    }
}

// Sichere Verwendung
public function create(Request $request): Response
{
    $form = $this->createForm(ReservationFormType::class);
    $form->handleRequest($request);

    if ($form->isSubmitted() && $form->isValid()) {
        $data = $form->getData(); // ✅ Validierte Daten
    }
}
```

**Validierungs-Checkliste:**
- [ ] Alle Formulare verwenden Form Component
- [ ] Validierungs-Constraints definiert
- [ ] Kein `request->get()` ohne Validierung
- [ ] Serverseitige Validierung (nicht nur Client)
- [ ] Fehlermeldungen nicht zu ausführlich (keine Stack-Traces)

**Constraint-Beispiele:**
```php
// E-Mail
new Assert\Email(mode: 'strict')

// Deutsche Telefonnummer
new Assert\Regex(pattern: '/^0[1-9]\d{8}$/')

// Geburtsdatum (18-100 Jahre)
new Assert\Range([
    'min' => new \DateTime('-100 years'),
    'max' => new \DateTime('-18 years'),
])

// Name/Vorname
new Assert\Length(min: 2, max: 100)
new Assert\Regex(pattern: '/^[a-zA-ZÀ-ÿ\s\'-]+$/u')

// Betrag
new Assert\PositiveOrZero()
new Assert\LessThanOrEqual(999999.99)
```

---

## 3. CSRF-Schutz

### ✅ CSRF-Tokens auf allen Formularen

**Prüfung:**
```bash
# Prüfen ob CSRF aktiviert ist
grep "csrf_protection" config/packages/framework.yaml
```

**Konfiguration:**
```yaml
# config/packages/framework.yaml
framework:
    csrf_protection: true  # ✅ Aktiviert
```

**In Formularen:**
```php
// ✅ CSRF automatisch mit Form Component
public function buildForm(FormBuilderInterface $builder, array $options): void
{
    // CSRF standardmäßig aktiviert
}
```

**In Twig-Templates:**
```twig
{# ✅ CSRF-Token automatisch mit form_start #}
{{ form_start(form) }}
    {# ... #}
{{ form_end(form) }}

{# ✅ Manuelles Formular mit Token #}
<form method="post">
    <input type="hidden" name="_token" value="{{ csrf_token('delete_reservation') }}">
    <button type="submit">Löschen</button>
</form>
```

**Serverseitige Validierung:**
```php
// ✅ CSRF-Token-Validierung
public function delete(Request $request, Reservation $reservation): Response
{
    if (!$this->isCsrfTokenValid('delete_reservation', $request->request->get('_token'))) {
        throw new InvalidCsrfTokenException();
    }

    // ...
}
```

**CSRF-Checkliste:**
- [ ] `csrf_protection: true` in framework.yaml
- [ ] Alle POST-Formulare haben Token
- [ ] Token serverseitig validiert
- [ ] Unterschiedliches Token pro Aktion (delete, update, etc.)
- [ ] Keine sensiblen Aktionen über GET

---

## 4. XSS-Schutz (Cross-Site Scripting)

### ✅ Automatisches Escaping der Outputs

**Prüfung:**
```bash
# Twig Auto-Escape prüfen
grep "autoescape" config/packages/twig.yaml
```

**Konfiguration:**
```yaml
# config/packages/twig.yaml
twig:
    autoescape: 'html'  # ✅ Standardmäßig aktiviert
```

**In Templates:**
```twig
{# ✅ Standardmäßig Auto-Escaped #}
<p>{{ participant.nom }}</p>

{# ❌ Raw (gefährlich) #}
<p>{{ participant.nom|raw }}</p>

{# ✅ Raw nur wenn Inhalt vertrauenswürdig #}
<div>{{ content|sanitize_html }}</div>
```

**XSS-Checkliste:**
- [ ] Autoescape in Twig aktiviert
- [ ] Keine Verwendung von `|raw` ohne Sanitization
- [ ] Keine nicht-escapete JavaScript-Interpolation
- [ ] Korrekte Content-Type-Header
- [ ] CSP-Header (siehe Abschnitt 6)

**Sanitization-Beispiel:**
```php
use HtmlSanitizer\HtmlSanitizerInterface;

public function __construct(
    private HtmlSanitizerInterface $htmlSanitizer
) {}

public function render(string $content): string
{
    return $this->htmlSanitizer->sanitize($content);
}
```

---

## 5. SQL-Injection-Schutz

### ✅ Verwendung von Doctrine ORM (Prepared Statements)

**Prüfung:**
```bash
# Nach direkten SQL-Queries suchen
grep -r "->query\|->exec" src/Repository/
```

**Anti-Pattern:**
```php
// ❌ SQL-Injektion möglich
public function findByEmail(string $email): ?Reservation
{
    $sql = "SELECT * FROM reservation WHERE email = '$email'";
    return $this->getEntityManager()->getConnection()->query($sql);
}
```

**Sicheres Pattern:**
```php
// ✅ Doctrine QueryBuilder (Prepared Statement)
public function findByEmail(string $email): ?Reservation
{
    return $this->createQueryBuilder('r')
        ->where('r.emailContact = :email')
        ->setParameter('email', $email)  // ✅ Gebundener Parameter
        ->getQuery()
        ->getOneOrNullResult();
}

// ✅ Doctrine DQL
public function findByEmail(string $email): ?Reservation
{
    $dql = 'SELECT r FROM App\Entity\Reservation r WHERE r.emailContact = :email';
    return $this->getEntityManager()
        ->createQuery($dql)
        ->setParameter('email', $email)  // ✅ Gebundener Parameter
        ->getOneOrNullResult();
}
```

**SQL-Injection-Checkliste:**
- [ ] Ausschließliche Verwendung von Doctrine ORM
- [ ] Keine direkten `query()` oder `exec()`
- [ ] Parameter immer gebunden (`:parameter`)
- [ ] Keine SQL-Konkatenation

---

## 6. Security-Header

### ✅ Security-Header konfiguriert

**Symfony-Konfiguration:**
```yaml
# config/packages/security.yaml
security:
    # ...

# config/packages/nelmio_security.yaml
nelmio_security:
    # Content Security Policy
    csp:
        enabled: true
        report_uri: /csp-report
        hosts: []
        content_types: []
        enforce:
            default-src: ['self']
            script-src: ['self', 'unsafe-inline']  # Einschränken
            style-src: ['self', 'unsafe-inline']   # Einschränken
            img-src: ['self', 'data:', 'https:']
            font-src: ['self']
            connect-src: ['self']
            frame-ancestors: ['none']

    # X-Frame-Options (Clickjacking)
    clickjacking:
        paths:
            '^/.*': DENY

    # X-Content-Type-Options
    content_type:
        nosniff: true

    # Referrer-Policy
    referrer_policy:
        enabled: true
        policies:
            - 'no-referrer-when-downgrade'
            - 'strict-origin-when-cross-origin'

    # HSTS (HTTP Strict Transport Security)
    forced_ssl:
        enabled: true
        hsts_max_age: 31536000  # 1 Jahr
        hsts_subdomains: true
        hsts_preload: true
```

**Header testen:**
```bash
# Security-Header prüfen
curl -I https://atoll-tourisme.com

# Erwartet:
# ✅ X-Frame-Options: DENY
# ✅ X-Content-Type-Options: nosniff
# ✅ Content-Security-Policy: default-src 'self'
# ✅ Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# ✅ Referrer-Policy: strict-origin-when-cross-origin
```

**Security-Header-Checkliste:**
- [ ] CSP konfiguriert (Content-Security-Policy)
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy konfiguriert
- [ ] HSTS aktiviert (Strict-Transport-Security)
- [ ] HTTPS erzwungen (Redirect HTTP → HTTPS)

---

## 7. Authentifizierung & Autorisierung

### ✅ Sichere Zugriffsverwaltung

**Konfiguration:**
```yaml
# config/packages/security.yaml
security:
    password_hashers:
        App\Entity\User:
            algorithm: auto  # ✅ Bcrypt/Argon2

    firewalls:
        main:
            lazy: true
            provider: app_user_provider
            form_login:
                login_path: app_login
                check_path: app_login
                enable_csrf: true  # ✅ CSRF bei Login
            logout:
                path: app_logout
                target: app_home
            remember_me:
                secret: '%kernel.secret%'
                lifetime: 604800  # 1 Woche
                secure: true      # ✅ Nur HTTPS
                httponly: true    # ✅ Nicht per JS zugreifbar

    access_control:
        - { path: ^/admin, roles: ROLE_ADMIN }
        - { path: ^/api, roles: ROLE_USER }
```

**Authentifizierungs-Checkliste:**
- [ ] Passwörter gehasht (Bcrypt/Argon2, nicht MD5)
- [ ] CSRF bei Login/Logout aktiviert
- [ ] Remember-me sicher (nur HTTPS, httponly)
- [ ] Rate Limiting bei Login (gegen Brute-Force)
- [ ] Starke Passwort-Politik (min. 12 Zeichen)
- [ ] 2FA empfohlen für Admin

**Autorisierungs-Checkliste:**
- [ ] Voter/Attributes für Geschäftslogik
- [ ] Systematische Rechtsprüfung
- [ ] Keine hartcodierten Rollen
- [ ] Prinzip der minimalen Rechte

**Voter-Beispiel:**
```php
class ReservationVoter extends Voter
{
    protected function supports(string $attribute, mixed $subject): bool
    {
        return $subject instanceof Reservation
            && in_array($attribute, ['VIEW', 'EDIT', 'DELETE']);
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        /** @var Reservation $reservation */
        $reservation = $subject;

        return match ($attribute) {
            'VIEW' => $this->canView($reservation, $user),
            'EDIT' => $this->canEdit($reservation, $user),
            'DELETE' => $this->canDelete($reservation, $user),
            default => false,
        };
    }

    private function canView(Reservation $reservation, User $user): bool
    {
        // Admin kann alles sehen
        if (in_array('ROLE_ADMIN', $user->getRoles())) {
            return true;
        }

        // Eigentümer kann seine Buchung sehen
        return $reservation->getEmailContact() === $user->getEmail();
    }
}
```

---

## 8. DSGVO - Einwilligung & Rechte

### ✅ Ausdrückliche Einwilligung

**Buchungsformular:**
```php
class ReservationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            // ...
            ->add('rgpdConsent', CheckboxType::class, [
                'label' => 'Ich akzeptiere, dass meine personenbezogenen Daten gemäß der Datenschutzrichtlinie verarbeitet werden',
                'constraints' => [
                    new Assert\IsTrue(message: 'Sie müssen der Verarbeitung Ihrer Daten zustimmen'),
                ],
                'mapped' => false,
            ]);
    }
}
```

**Template:**
```twig
{{ form_row(form.rgpdConsent, {
    label: 'Ich akzeptiere, dass meine personenbezogenen Daten erfasst und verarbeitet werden, um meine Buchung zu verwalten'
}) }}

<p>
    <a href="{{ path('app_privacy_policy') }}" target="_blank">
        Unsere Datenschutzerklärung einsehen
    </a>
</p>
```

**Nachverfolgbarkeit der Einwilligung:**
```php
#[ORM\Entity]
class Reservation
{
    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $rgpdConsentDate;

    #[ORM\Column(type: 'string', length: 45)]
    private string $rgpdConsentIp;

    public function grantRgpdConsent(Request $request): void
    {
        $this->rgpdConsentDate = new \DateTimeImmutable();
        $this->rgpdConsentIp = $request->getClientIp();
    }
}
```

**Einwilligungs-Checkliste:**
- [ ] Explizite Checkbox (nicht vorangekreuzt)
- [ ] Link zur Datenschutzerklärung
- [ ] Einwilligungsdatum gespeichert
- [ ] IP der Einwilligung gespeichert
- [ ] Granulare Einwilligung (Newsletter separat)

### ✅ Recht auf Vergessenwerden

**Anonymisierungs-Befehl:**
```php
#[AsCommand(name: 'app:gdpr:anonymize')]
class GdprAnonymizeCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $email = $input->getArgument('email');

        // Alle Buchungen finden
        $reservations = $this->entityManager
            ->getRepository(Reservation::class)
            ->findBy(['emailContact' => $email]);

        foreach ($reservations as $reservation) {
            // Daten anonymisieren
            $reservation->setEmailContact('anonymized@example.com');
            $reservation->setTelephoneContact('0000000000');

            foreach ($reservation->getParticipants() as $participant) {
                $participant->setNom('ANONYMISIERT');
                $participant->setPrenom('ANONYMISIERT');
                $participant->setDateNaissance(new \DateTimeImmutable('1900-01-01'));
            }
        }

        $this->entityManager->flush();

        return Command::SUCCESS;
    }
}
```

**Recht-auf-Vergessenwerden-Checkliste:**
- [ ] Anonymisierungsprozess dokumentiert
- [ ] CLI-Befehl verfügbar
- [ ] Bearbeitungsfrist ≤ 1 Monat
- [ ] Bestätigung an Antragsteller
- [ ] Logs aufbewahrt (aber anonymisiert)

### ✅ Datenportabilität

**JSON-Export:**
```php
#[Route('/api/me/export', name: 'api_user_export')]
public function export(#[CurrentUser] User $user): JsonResponse
{
    $reservations = $this->reservationRepository->findBy([
        'emailContact' => $user->getEmail(),
    ]);

    $data = [
        'user' => [
            'email' => $user->getEmail(),
            'created_at' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
        ],
        'reservations' => array_map(
            fn(Reservation $r) => [
                'reference' => $r->getReference(),
                'sejour' => $r->getSejour()->getDestination(),
                'date_reservation' => $r->getCreatedAt()->format('Y-m-d H:i:s'),
                'montant_total' => $r->getMontantTotal()->toEuros(),
                'participants' => array_map(
                    fn(Participant $p) => [
                        'nom' => $p->getNom(),
                        'prenom' => $p->getPrenom(),
                        'date_naissance' => $p->getDateNaissance()->format('Y-m-d'),
                    ],
                    $r->getParticipants()->toArray()
                ),
            ],
            $reservations
        ),
    ];

    return $this->json($data);
}
```

**Portabilitäts-Checkliste:**
- [ ] JSON-Export verfügbar
- [ ] Strukturiertes und lesbares Format
- [ ] Alle personenbezogenen Daten enthalten
- [ ] Bearbeitungsfrist ≤ 1 Monat

---

## 9. Aufbewahrungsdauer der Daten

### ✅ Automatische Löschung veralteter Daten

**Konfiguration:**
```yaml
# config/services.yaml
parameters:
    app.data_retention:
        reservation_cancelled: '-3 months'   # Stornierte Buchungen
        reservation_completed: '-3 years'    # Abgeschlossene Buchungen
        logs: '-1 year'                      # Anwendungslogs
```

**Bereinigungsbefehl:**
```php
#[AsCommand(name: 'app:gdpr:cleanup')]
class GdprCleanupCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $threeMonthsAgo = new \DateTimeImmutable('-3 months');
        $threeYearsAgo = new \DateTimeImmutable('-3 years');

        // Stornierte Buchungen > 3 Monate löschen
        $this->entityManager->createQueryBuilder()
            ->delete(Reservation::class, 'r')
            ->where('r.statut = :statut')
            ->andWhere('r.dateAnnulation < :date')
            ->setParameter('statut', 'annulee')
            ->setParameter('date', $threeMonthsAgo)
            ->getQuery()
            ->execute();

        // Abgeschlossene Buchungen > 3 Jahre anonymisieren
        $oldReservations = $this->reservationRepository
            ->createQueryBuilder('r')
            ->where('r.statut = :statut')
            ->andWhere('r.dateConfirmation < :date')
            ->setParameter('statut', 'confirmee')
            ->setParameter('date', $threeYearsAgo)
            ->getQuery()
            ->getResult();

        foreach ($oldReservations as $reservation) {
            $this->anonymize($reservation);
        }

        $this->entityManager->flush();

        return Command::SUCCESS;
    }
}
```

**Aufbewahrungsdauer-Checkliste:**
- [ ] Aufbewahrungsrichtlinie dokumentiert
- [ ] Automatische Bereinigung (Cron)
- [ ] DSGVO-konforme Dauer (max. 3 Jahre)
- [ ] Bereinigungs-Logs aufbewahrt

---

## 10. Audit & Nachverfolgbarkeit

### ✅ Logs sensibler Aktionen

**Monolog-Konfiguration:**
```yaml
# config/packages/monolog.yaml
monolog:
    channels: ['security', 'gdpr']

    handlers:
        gdpr:
            type: stream
            path: "%kernel.logs_dir%/gdpr-%kernel.environment%.log"
            level: info
            channels: ['gdpr']

        security:
            type: stream
            path: "%kernel.logs_dir%/security-%kernel.environment%.log"
            level: warning
            channels: ['security']
```

**DSGVO-Aktionen loggen:**
```php
use Psr\Log\LoggerInterface;

class ReservationService
{
    public function __construct(
        private LoggerInterface $gdprLogger
    ) {}

    public function createReservation(array $data): Reservation
    {
        // ...

        $this->gdprLogger->info('Buchung erstellt', [
            'reservation_id' => $reservation->getId(),
            'email' => $reservation->getEmailContact(),  // ⚠️ In Prod. anonymisieren
            'ip' => $request->getClientIp(),
            'consent_date' => $reservation->getRgpdConsentDate(),
        ]);

        return $reservation;
    }

    public function anonymize(Reservation $reservation): void
    {
        $this->gdprLogger->warning('Daten anonymisiert (DSGVO)', [
            'reservation_id' => $reservation->getId(),
            'email_before' => $reservation->getEmailContact(),
            'reason' => 'Recht auf Vergessenwerden',
        ]);

        // Anonymisierung...
    }
}
```

**Log-Checkliste:**
- [ ] Logs für Zugriff auf personenbezogene Daten
- [ ] Logs für Datenänderungen
- [ ] Logs für Exporte (Portabilität)
- [ ] Logs für Löschungen/Anonymisierungen
- [ ] Logs nicht zu ausführlich (keine Passwörter)
- [ ] Log-Rotation (max. 1 Jahr)

---

## 11. Sicherheitstests

### ✅ Automatisierte Tests

**CSRF-Test:**
```php
public function testCsrfProtectionOnDeleteReservation(): void
{
    $client = static::createClient();

    // Ohne CSRF-Token
    $client->request('POST', '/reservation/1/delete');

    $this->assertResponseStatusCodeSame(403);
}
```

**XSS-Test:**
```php
public function testXssProtectionInParticipantName(): void
{
    $client = static::createClient();

    $client->request('POST', '/reservation/create', [
        'participants' => [
            ['nom' => '<script>alert("XSS")</script>', 'prenom' => 'Test'],
        ],
    ]);

    $crawler = $client->followRedirect();

    // Prüfen, dass Skript escaped ist
    $this->assertStringNotContainsString('<script>', $crawler->html());
    $this->assertStringContainsString('&lt;script&gt;', $crawler->html());
}
```

**SQL-Injection-Test:**
```php
public function testSqlInjectionProtectionInSearch(): void
{
    $client = static::createClient();

    // Injektionsversuch
    $client->request('GET', '/reservation/search', [
        'email' => "' OR '1'='1",
    ]);

    // Darf nicht alle Buchungen zurückgeben
    $this->assertResponseIsSuccessful();
    $this->assertCount(0, json_decode($client->getResponse()->getContent()));
}
```

---

## 12. Abschließende Checkliste vor Release

### Sicherheit

- [ ] Sensible Daten in DB verschlüsselt
- [ ] Strikte Validierung aller Inputs
- [ ] CSRF auf allen Formularen aktiviert
- [ ] XSS-Schutz (Twig Autoescape)
- [ ] SQL-Injection unmöglich (Doctrine ORM)
- [ ] Security-Header konfiguriert (CSP, HSTS, etc.)
- [ ] HTTPS erzwungen
- [ ] Sichere Authentifizierung (Bcrypt/Argon2)
- [ ] Rate Limiting bei Login
- [ ] Keine Secrets committed (.env)
- [ ] Abhängigkeiten aktuell (composer audit)

### DSGVO

- [ ] Datenschutzerklärung veröffentlicht
- [ ] Ausdrückliche Einwilligung (Checkbox)
- [ ] Nachverfolgbarkeit der Einwilligung (Datum, IP)
- [ ] Recht auf Vergessenwerden implementiert
- [ ] Datenportabilität (JSON-Export)
- [ ] Aufbewahrungsdauer definiert
- [ ] Automatische Bereinigung (Cron)
- [ ] Logs sensibler Aktionen
- [ ] Verschlüsselung personenbezogener Daten
- [ ] Verfahren bei Datenpanne dokumentiert

### Tests

- [ ] CSRF-Tests
- [ ] XSS-Tests
- [ ] SQL-Injection-Tests
- [ ] Autorisierungs-Tests (Voter)
- [ ] Schwachstellen-Scan (composer audit)

### Audit

```bash
# Composer-Schwachstellen
composer audit

# Symfony Security Checker
symfony security:check

# Statische Analyse
make phpstan
```

---

**Audit-Frequenz:** Vor jedem Major-Release + alle 3 Monate

**Verantwortlich:** Lead Dev + DSB (Datenschutzbeauftragter)

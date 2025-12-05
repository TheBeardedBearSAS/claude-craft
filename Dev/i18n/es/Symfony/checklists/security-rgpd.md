# Checklist: Seguridad y RGPD

> **Auditoría de seguridad y conformidad RGPD** - A verificar antes de cada release
> Referencia: `.claude/rules/07-security-rgpd.md`

## Contexto Atoll Tourisme

**Datos personales recopilados:**
- Participantes: Nombre, apellido, fecha de nacimiento
- Contacto: Email, teléfono
- Reservas: Historial de estancias
- Pagos: Información de pago (vía Stripe)

**Obligaciones RGPD:**
- Consentimiento explícito
- Derecho al olvido
- Portabilidad de datos
- Cifrado en BD
- Duración de conservación limitada
- Trazabilidad (logs)

---

## 1. Protección de datos personales

### ✅ Datos sensibles cifrados en BD

**Verificación:**
```bash
# Verificar el cifrado Doctrine
grep -r "Encrypted" src/Entity/
```

**Criterio:**
```php
use DoctrineEncryptBundle\Configuration\Encrypted;

#[ORM\Entity]
class Participant
{
    #[ORM\Column(type: 'string')]
    #[Encrypted]  // ✅ Cifrado en BD
    private string $nom;

    #[ORM\Column(type: 'string')]
    #[Encrypted]  // ✅ Cifrado en BD
    private string $prenom;

    #[ORM\Column(type: 'date_immutable')]
    #[Encrypted]  // ✅ Cifrado en BD
    private \DateTimeImmutable $dateNaissance;
}
```

**Checklist cifrado:**
- [ ] `Participant::$nom` cifrado
- [ ] `Participant::$prenom` cifrado
- [ ] `Participant::$dateNaissance` cifrado
- [ ] `Reservation::$emailContact` cifrado
- [ ] `Reservation::$telephoneContact` cifrado
- [ ] Clave de cifrado en `.env` (no commiteada)
- [ ] Clave de cifrado rotativa (procedimiento documentado)

**Probar el cifrado:**
```bash
# Conectarse a la BD
docker compose exec db mysql -u root -p atoll

# Verificar que los datos están cifrados
SELECT nom, prenom FROM participant LIMIT 1;
# Resultado esperado: cadenas cifradas (base64)
# ✅ "enc:def502000..."
# ❌ "Dupont" (claro)
```

**Si datos no cifrados:**
```bash
# Instalar doctrine-encrypt-bundle
composer require ambta/doctrine-encrypt-bundle

# Configuración
# config/packages/doctrine_encrypt.yaml
doctrine_encrypt:
    secret_directory_path: '%kernel.project_dir%/config/secrets/%kernel.environment%'
    cipher_algorithm: 'aes-256-gcm'
    encryptor_class: Halite

# Añadir anotaciones
vim src/Entity/Participant.php

# Migración para cifrar datos existentes
php bin/console doctrine:encrypt:database
```

---

## 2. Validación de entradas de usuario

### ✅ Validación estricta de todos los inputs

**Verificación:**
```bash
# Buscar inputs no validados
grep -r "request->get\|request->request->get" src/Controller/
```

**Anti-patrón:**
```php
// ❌ Sin validación
public function create(Request $request): Response
{
    $email = $request->request->get('email');
    $reservation = new Reservation();
    $reservation->setEmail($email); // Inyección posible
}
```

**Patrón seguro:**
```php
// ✅ Validación vía Form + Constraints
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

// Uso seguro
public function create(Request $request): Response
{
    $form = $this->createForm(ReservationFormType::class);
    $form->handleRequest($request);

    if ($form->isSubmitted() && $form->isValid()) {
        $data = $form->getData(); // ✅ Datos validados
    }
}
```

**Checklist validación:**
- [ ] Todos los formularios utilizan Form Component
- [ ] Constraints de validación definidas
- [ ] No hay `request->get()` sin validación
- [ ] Validación del lado servidor (no solo cliente)
- [ ] Mensajes de error no demasiado detallados (sin stack trace)

**Ejemplos de constraints:**
```php
// Email
new Assert\Email(mode: 'strict')

// Teléfono FR
new Assert\Regex(pattern: '/^0[1-9]\d{8}$/')

// Fecha de nacimiento (18-100 años)
new Assert\Range([
    'min' => new \DateTime('-100 years'),
    'max' => new \DateTime('-18 years'),
])

// Nombre/Apellido
new Assert\Length(min: 2, max: 100)
new Assert\Regex(pattern: '/^[a-zA-ZÀ-ÿ\s\'-]+$/u')

// Monto
new Assert\PositiveOrZero()
new Assert\LessThanOrEqual(999999.99)
```

---

## 3. Protección CSRF

### ✅ Tokens CSRF en todos los formularios

**Verificación:**
```bash
# Verificar que CSRF está activado
grep "csrf_protection" config/packages/framework.yaml
```

**Configuración:**
```yaml
# config/packages/framework.yaml
framework:
    csrf_protection: true  # ✅ Activado
```

**En los formularios:**
```php
// ✅ CSRF automático con Form Component
public function buildForm(FormBuilderInterface $builder, array $options): void
{
    // CSRF activado por defecto
}
```

**En los templates Twig:**
```twig
{# ✅ Token CSRF automático con form_start #}
{{ form_start(form) }}
    {# ... #}
{{ form_end(form) }}

{# ✅ Formulario manual con token #}
<form method="post">
    <input type="hidden" name="_token" value="{{ csrf_token('delete_reservation') }}">
    <button type="submit">Eliminar</button>
</form>
```

**Validación del lado servidor:**
```php
// ✅ Validación token CSRF
public function delete(Request $request, Reservation $reservation): Response
{
    if (!$this->isCsrfTokenValid('delete_reservation', $request->request->get('_token'))) {
        throw new InvalidCsrfTokenException();
    }

    // ...
}
```

**Checklist CSRF:**
- [ ] `csrf_protection: true` en framework.yaml
- [ ] Todos los formularios POST tienen un token
- [ ] Validación token del lado servidor
- [ ] Token diferente por acción (delete, update, etc.)
- [ ] No hay acciones sensibles en GET

---

## 4. Protección XSS (Cross-Site Scripting)

### ✅ Escapado automático de outputs

**Verificación:**
```bash
# Verificar auto-escape Twig
grep "autoescape" config/packages/twig.yaml
```

**Configuración:**
```yaml
# config/packages/twig.yaml
twig:
    autoescape: 'html'  # ✅ Activado por defecto
```

**En los templates:**
```twig
{# ✅ Auto-escaped por defecto #}
<p>{{ participant.nom }}</p>

{# ❌ Raw (peligroso) #}
<p>{{ participant.nom|raw }}</p>

{# ✅ Raw solo si contenido confiable #}
<div>{{ content|sanitize_html }}</div>
```

**Checklist XSS:**
- [ ] Autoescape activado en Twig
- [ ] No se usa `|raw` sin sanitización
- [ ] No hay interpolación JavaScript sin escapar
- [ ] Headers Content-Type correctos
- [ ] CSP headers (ver sección 6)

**Ejemplo sanitización:**
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

## 5. Protección SQL Injection

### ✅ Uso de Doctrine ORM (consultas preparadas)

**Verificación:**
```bash
# Buscar consultas SQL directas
grep -r "->query\|->exec" src/Repository/
```

**Anti-patrón:**
```php
// ❌ Inyección SQL posible
public function findByEmail(string $email): ?Reservation
{
    $sql = "SELECT * FROM reservation WHERE email = '$email'";
    return $this->getEntityManager()->getConnection()->query($sql);
}
```

**Patrón seguro:**
```php
// ✅ Doctrine QueryBuilder (consulta preparada)
public function findByEmail(string $email): ?Reservation
{
    return $this->createQueryBuilder('r')
        ->where('r.emailContact = :email')
        ->setParameter('email', $email)  // ✅ Parámetro bindado
        ->getQuery()
        ->getOneOrNullResult();
}

// ✅ Doctrine DQL
public function findByEmail(string $email): ?Reservation
{
    $dql = 'SELECT r FROM App\Entity\Reservation r WHERE r.emailContact = :email';
    return $this->getEntityManager()
        ->createQuery($dql)
        ->setParameter('email', $email)  // ✅ Parámetro bindado
        ->getOneOrNullResult();
}
```

**Checklist SQL Injection:**
- [ ] Uso exclusivo de Doctrine ORM
- [ ] No hay `query()` o `exec()` directos
- [ ] Parámetros siempre bindados (`:parameter`)
- [ ] No hay concatenación SQL

---

## 6. Security Headers

### ✅ Headers de seguridad configurados

**Configuración Symfony:**
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
            script-src: ['self', 'unsafe-inline']  # A restringir
            style-src: ['self', 'unsafe-inline']   # A restringir
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
        hsts_max_age: 31536000  # 1 año
        hsts_subdomains: true
        hsts_preload: true
```

**Probar los headers:**
```bash
# Verificar los headers de seguridad
curl -I https://atoll-tourisme.com

# Esperado:
# ✅ X-Frame-Options: DENY
# ✅ X-Content-Type-Options: nosniff
# ✅ Content-Security-Policy: default-src 'self'
# ✅ Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# ✅ Referrer-Policy: strict-origin-when-cross-origin
```

**Checklist Security Headers:**
- [ ] CSP configurado (Content-Security-Policy)
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy configurado
- [ ] HSTS activado (Strict-Transport-Security)
- [ ] HTTPS forzado (redirect HTTP → HTTPS)

---

## 7. Autenticación y Autorización

### ✅ Gestión segura de accesos

**Configuración:**
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
                enable_csrf: true  # ✅ CSRF en login
            logout:
                path: app_logout
                target: app_home
            remember_me:
                secret: '%kernel.secret%'
                lifetime: 604800  # 1 semana
                secure: true      # ✅ solo HTTPS
                httponly: true    # ✅ No accesible por JS

    access_control:
        - { path: ^/admin, roles: ROLE_ADMIN }
        - { path: ^/api, roles: ROLE_USER }
```

**Checklist Autenticación:**
- [ ] Contraseñas hasheadas (Bcrypt/Argon2, no MD5)
- [ ] CSRF activado en login/logout
- [ ] Remember-me seguro (solo HTTPS, httponly)
- [ ] Rate limiting en login (contra brute-force)
- [ ] Política contraseña fuerte (mín 12 caracteres)
- [ ] 2FA recomendado para admin

**Checklist Autorización:**
- [ ] Voter/Attributes para lógica de negocio
- [ ] Verificación sistemática de derechos
- [ ] No hay roles hard-coded
- [ ] Principio del menor privilegio

**Ejemplo Voter:**
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
        // Admin puede ver todo
        if (in_array('ROLE_ADMIN', $user->getRoles())) {
            return true;
        }

        // Propietario puede ver su reserva
        return $reservation->getEmailContact() === $user->getEmail();
    }
}
```

---

## 8. RGPD - Consentimiento y Derechos

### ✅ Consentimiento explícito

**Formulario de reserva:**
```php
class ReservationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            // ...
            ->add('rgpdConsent', CheckboxType::class, [
                'label' => 'Acepto que mis datos personales sean tratados conforme a la política de privacidad',
                'constraints' => [
                    new Assert\IsTrue(message: 'Debe aceptar el tratamiento de sus datos'),
                ],
                'mapped' => false,
            ]);
    }
}
```

**Template:**
```twig
{{ form_row(form.rgpdConsent, {
    label: 'Acepto que mis datos personales sean recopilados y tratados para gestionar mi reserva'
}) }}

<p>
    <a href="{{ path('app_privacy_policy') }}" target="_blank">
        Consultar nuestra política de privacidad
    </a>
</p>
```

**Trazabilidad del consentimiento:**
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

**Checklist Consentimiento:**
- [ ] Checkbox explícito (no pre-marcado)
- [ ] Enlace a política de privacidad
- [ ] Fecha de consentimiento registrada
- [ ] IP del consentimiento registrada
- [ ] Consentimiento granular (newsletters separadas)

### ✅ Derecho al olvido

**Comando de anonimización:**
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

        // Encontrar todas las reservas
        $reservations = $this->entityManager
            ->getRepository(Reservation::class)
            ->findBy(['emailContact' => $email]);

        foreach ($reservations as $reservation) {
            // Anonimizar los datos
            $reservation->setEmailContact('anonymized@example.com');
            $reservation->setTelephoneContact('0000000000');

            foreach ($reservation->getParticipants() as $participant) {
                $participant->setNom('ANONIMIZADO');
                $participant->setPrenom('ANONIMIZADO');
                $participant->setDateNaissance(new \DateTimeImmutable('1900-01-01'));
            }
        }

        $this->entityManager->flush();

        return Command::SUCCESS;
    }
}
```

**Checklist Derecho al olvido:**
- [ ] Procedimiento de anonimización documentado
- [ ] Comando CLI disponible
- [ ] Plazo de tratamiento ≤ 1 mes
- [ ] Confirmación al solicitante
- [ ] Logs conservados (pero anonimizados)

### ✅ Portabilidad de datos

**Export JSON:**
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

**Checklist Portabilidad:**
- [ ] Export JSON disponible
- [ ] Formato estructurado y legible
- [ ] Todos los datos personales incluidos
- [ ] Plazo de tratamiento ≤ 1 mes

---

## 9. Duración de conservación de datos

### ✅ Eliminación automática de datos obsoletos

**Configuración:**
```yaml
# config/services.yaml
parameters:
    app.data_retention:
        reservation_cancelled: '-3 months'   # Reservas canceladas
        reservation_completed: '-3 years'    # Reservas completadas
        logs: '-1 year'                      # Logs aplicativos
```

**Comando de limpieza:**
```php
#[AsCommand(name: 'app:gdpr:cleanup')]
class GdprCleanupCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $threeMonthsAgo = new \DateTimeImmutable('-3 months');
        $threeYearsAgo = new \DateTimeImmutable('-3 years');

        // Eliminar reservas canceladas > 3 meses
        $this->entityManager->createQueryBuilder()
            ->delete(Reservation::class, 'r')
            ->where('r.statut = :statut')
            ->andWhere('r.dateAnnulation < :date')
            ->setParameter('statut', 'annulee')
            ->setParameter('date', $threeMonthsAgo)
            ->getQuery()
            ->execute();

        // Anonimizar reservas completadas > 3 años
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

**Checklist Duración de conservación:**
- [ ] Política de retención documentada
- [ ] Limpieza automática (cron)
- [ ] Duraciones conformes RGPD (máx 3 años)
- [ ] Logs de limpieza conservados

---

## 10. Auditoría y Trazabilidad

### ✅ Logs de acciones sensibles

**Configuración Monolog:**
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

**Loggear acciones RGPD:**
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

        $this->gdprLogger->info('Reserva creada', [
            'reservation_id' => $reservation->getId(),
            'email' => $reservation->getEmailContact(),  // ⚠️ Anonimizar en prod
            'ip' => $request->getClientIp(),
            'consent_date' => $reservation->getRgpdConsentDate(),
        ]);

        return $reservation;
    }

    public function anonymize(Reservation $reservation): void
    {
        $this->gdprLogger->warning('Datos anonimizados (RGPD)', [
            'reservation_id' => $reservation->getId(),
            'email_before' => $reservation->getEmailContact(),
            'reason' => 'derecho al olvido',
        ]);

        // Anonimización...
    }
}
```

**Checklist Logs:**
- [ ] Logs de accesos a datos personales
- [ ] Logs de modificaciones de datos
- [ ] Logs de exports (portabilidad)
- [ ] Logs de eliminaciones/anonimizaciones
- [ ] Logs no demasiado verbosos (sin passwords)
- [ ] Rotación de logs (máx 1 año)

---

## 11. Tests de seguridad

### ✅ Tests automatizados

**Test CSRF:**
```php
public function testCsrfProtectionOnDeleteReservation(): void
{
    $client = static::createClient();

    // Sin token CSRF
    $client->request('POST', '/reservation/1/delete');

    $this->assertResponseStatusCodeSame(403);
}
```

**Test XSS:**
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

    // Verificar que el script está escapado
    $this->assertStringNotContainsString('<script>', $crawler->html());
    $this->assertStringContainsString('&lt;script&gt;', $crawler->html());
}
```

**Test SQL Injection:**
```php
public function testSqlInjectionProtectionInSearch(): void
{
    $client = static::createClient();

    // Intento de inyección
    $client->request('GET', '/reservation/search', [
        'email' => "' OR '1'='1",
    ]);

    // No debe devolver todas las reservas
    $this->assertResponseIsSuccessful();
    $this->assertCount(0, json_decode($client->getResponse()->getContent()));
}
```

---

## 12. Checklist final antes del release

### Seguridad

- [ ] Datos sensibles cifrados en BD
- [ ] Validación estricta de todos los inputs
- [ ] CSRF activado en todos los formularios
- [ ] Protección XSS (autoescape Twig)
- [ ] SQL Injection imposible (Doctrine ORM)
- [ ] Security headers configurados (CSP, HSTS, etc.)
- [ ] HTTPS forzado
- [ ] Autenticación segura (Bcrypt/Argon2)
- [ ] Rate limiting en login
- [ ] No hay secretos commiteados (.env)
- [ ] Dependencias actualizadas (composer audit)

### RGPD

- [ ] Política de privacidad publicada
- [ ] Consentimiento explícito (checkbox)
- [ ] Trazabilidad del consentimiento (fecha, IP)
- [ ] Derecho al olvido implementado
- [ ] Portabilidad de datos (export JSON)
- [ ] Duración de conservación definida
- [ ] Limpieza automática (cron)
- [ ] Logs de acciones sensibles
- [ ] Cifrado de datos personales
- [ ] Procedimiento de breach documentado

### Tests

- [ ] Tests CSRF
- [ ] Tests XSS
- [ ] Tests SQL Injection
- [ ] Tests autorización (Voter)
- [ ] Scan de vulnerabilidades (composer audit)

### Auditoría

```bash
# Vulnerabilidades composer
composer audit

# Security checker Symfony
symfony security:check

# Análisis estático
make phpstan
```

---

**Frecuencia de auditoría:** Antes de cada release mayor + cada 3 meses

**Responsable:** Lead Dev + DPO (Data Protection Officer)

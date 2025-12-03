# Checklist: Sécurité & RGPD

> **Audit de sécurité et conformité RGPD** - À vérifier avant chaque release
> Référence: `.claude/rules/07-security-rgpd.md`

## Contexte Atoll Tourisme

**Données personnelles collectées:**
- Participants: Nom, prénom, date de naissance
- Contact: Email, téléphone
- Réservations: Historique des séjours
- Paiements: Informations de paiement (via Stripe)

**Obligations RGPD:**
- Consentement explicite
- Droit à l'oubli
- Portabilité des données
- Chiffrement en BDD
- Durée de conservation limitée
- Traçabilité (logs)

---

## 1. Protection des données personnelles

### ✅ Données sensibles chiffrées en BDD

**Vérification:**
```bash
# Vérifier le chiffrement Doctrine
grep -r "Encrypted" src/Entity/
```

**Critère:**
```php
use DoctrineEncryptBundle\Configuration\Encrypted;

#[ORM\Entity]
class Participant
{
    #[ORM\Column(type: 'string')]
    #[Encrypted]  // ✅ Chiffré en BDD
    private string $nom;

    #[ORM\Column(type: 'string')]
    #[Encrypted]  // ✅ Chiffré en BDD
    private string $prenom;

    #[ORM\Column(type: 'date_immutable')]
    #[Encrypted]  // ✅ Chiffré en BDD
    private \DateTimeImmutable $dateNaissance;
}
```

**Checklist chiffrement:**
- [ ] `Participant::$nom` chiffré
- [ ] `Participant::$prenom` chiffré
- [ ] `Participant::$dateNaissance` chiffré
- [ ] `Reservation::$emailContact` chiffré
- [ ] `Reservation::$telephoneContact` chiffré
- [ ] Clé de chiffrement dans `.env` (pas committed)
- [ ] Clé de chiffrement rotative (procédure documentée)

**Tester le chiffrement:**
```bash
# Se connecter à la BDD
docker compose exec db mysql -u root -p atoll

# Vérifier que les données sont chiffrées
SELECT nom, prenom FROM participant LIMIT 1;
# Résultat attendu: chaînes chiffrées (base64)
# ✅ "enc:def502000..."
# ❌ "Dupont" (clair)
```

**Si données non chiffrées:**
```bash
# Installer doctrine-encrypt-bundle
composer require ambta/doctrine-encrypt-bundle

# Configuration
# config/packages/doctrine_encrypt.yaml
doctrine_encrypt:
    secret_directory_path: '%kernel.project_dir%/config/secrets/%kernel.environment%'
    cipher_algorithm: 'aes-256-gcm'
    encryptor_class: Halite

# Ajouter annotations
vim src/Entity/Participant.php

# Migration pour chiffrer les données existantes
php bin/console doctrine:encrypt:database
```

---

## 2. Validation des entrées utilisateur

### ✅ Validation stricte de tous les inputs

**Vérification:**
```bash
# Chercher les inputs non validés
grep -r "request->get\|request->request->get" src/Controller/
```

**Anti-pattern:**
```php
// ❌ Pas de validation
public function create(Request $request): Response
{
    $email = $request->request->get('email');
    $reservation = new Reservation();
    $reservation->setEmail($email); // Injection possible
}
```

**Pattern sécurisé:**
```php
// ✅ Validation via Form + Constraints
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

// Utilisation sécurisée
public function create(Request $request): Response
{
    $form = $this->createForm(ReservationFormType::class);
    $form->handleRequest($request);

    if ($form->isSubmitted() && $form->isValid()) {
        $data = $form->getData(); // ✅ Données validées
    }
}
```

**Checklist validation:**
- [ ] Tous les formulaires utilisent Form Component
- [ ] Contraintes de validation définies
- [ ] Pas de `request->get()` sans validation
- [ ] Validation côté serveur (pas que client)
- [ ] Messages d'erreur pas trop verbeux (pas de stack trace)

**Exemples de contraintes:**
```php
// Email
new Assert\Email(mode: 'strict')

// Téléphone FR
new Assert\Regex(pattern: '/^0[1-9]\d{8}$/')

// Date de naissance (18-100 ans)
new Assert\Range([
    'min' => new \DateTime('-100 years'),
    'max' => new \DateTime('-18 years'),
])

// Nom/Prénom
new Assert\Length(min: 2, max: 100)
new Assert\Regex(pattern: '/^[a-zA-ZÀ-ÿ\s\'-]+$/u')

// Montant
new Assert\PositiveOrZero()
new Assert\LessThanOrEqual(999999.99)
```

---

## 3. Protection CSRF

### ✅ Tokens CSRF sur tous les formulaires

**Vérification:**
```bash
# Vérifier que CSRF est activé
grep "csrf_protection" config/packages/framework.yaml
```

**Configuration:**
```yaml
# config/packages/framework.yaml
framework:
    csrf_protection: true  # ✅ Activé
```

**Dans les formulaires:**
```php
// ✅ CSRF automatique avec Form Component
public function buildForm(FormBuilderInterface $builder, array $options): void
{
    // CSRF activé par défaut
}
```

**Dans les templates Twig:**
```twig
{# ✅ Token CSRF automatique avec form_start #}
{{ form_start(form) }}
    {# ... #}
{{ form_end(form) }}

{# ✅ Formulaire manuel avec token #}
<form method="post">
    <input type="hidden" name="_token" value="{{ csrf_token('delete_reservation') }}">
    <button type="submit">Supprimer</button>
</form>
```

**Validation côté serveur:**
```php
// ✅ Validation token CSRF
public function delete(Request $request, Reservation $reservation): Response
{
    if (!$this->isCsrfTokenValid('delete_reservation', $request->request->get('_token'))) {
        throw new InvalidCsrfTokenException();
    }

    // ...
}
```

**Checklist CSRF:**
- [ ] `csrf_protection: true` dans framework.yaml
- [ ] Tous les formulaires POST ont un token
- [ ] Validation token côté serveur
- [ ] Token différent par action (delete, update, etc.)
- [ ] Pas d'actions sensibles en GET

---

## 4. Protection XSS (Cross-Site Scripting)

### ✅ Échappement automatique des outputs

**Vérification:**
```bash
# Vérifier l'auto-escape Twig
grep "autoescape" config/packages/twig.yaml
```

**Configuration:**
```yaml
# config/packages/twig.yaml
twig:
    autoescape: 'html'  # ✅ Activé par défaut
```

**Dans les templates:**
```twig
{# ✅ Auto-escaped par défaut #}
<p>{{ participant.nom }}</p>

{# ❌ Raw (dangereux) #}
<p>{{ participant.nom|raw }}</p>

{# ✅ Raw seulement si content trusted #}
<div>{{ content|sanitize_html }}</div>
```

**Checklist XSS:**
- [ ] Autoescape activé dans Twig
- [ ] Pas d'utilisation de `|raw` sans sanitization
- [ ] Pas d'interpolation JavaScript non escapée
- [ ] Content-Type headers corrects
- [ ] CSP headers (voir section 6)

**Exemple sanitization:**
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

## 5. Protection SQL Injection

### ✅ Utilisation de Doctrine ORM (requêtes préparées)

**Vérification:**
```bash
# Chercher les requêtes SQL directes
grep -r "->query\|->exec" src/Repository/
```

**Anti-pattern:**
```php
// ❌ Injection SQL possible
public function findByEmail(string $email): ?Reservation
{
    $sql = "SELECT * FROM reservation WHERE email = '$email'";
    return $this->getEntityManager()->getConnection()->query($sql);
}
```

**Pattern sécurisé:**
```php
// ✅ Doctrine QueryBuilder (requête préparée)
public function findByEmail(string $email): ?Reservation
{
    return $this->createQueryBuilder('r')
        ->where('r.emailContact = :email')
        ->setParameter('email', $email)  // ✅ Paramètre bindé
        ->getQuery()
        ->getOneOrNullResult();
}

// ✅ Doctrine DQL
public function findByEmail(string $email): ?Reservation
{
    $dql = 'SELECT r FROM App\Entity\Reservation r WHERE r.emailContact = :email';
    return $this->getEntityManager()
        ->createQuery($dql)
        ->setParameter('email', $email)  // ✅ Paramètre bindé
        ->getOneOrNullResult();
}
```

**Checklist SQL Injection:**
- [ ] Utilisation exclusive de Doctrine ORM
- [ ] Pas de `query()` ou `exec()` directs
- [ ] Paramètres toujours bindés (`:parameter`)
- [ ] Pas de concaténation SQL

---

## 6. Security Headers

### ✅ Headers de sécurité configurés

**Configuration Symfony:**
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
            script-src: ['self', 'unsafe-inline']  # À restreindre
            style-src: ['self', 'unsafe-inline']   # À restreindre
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
        hsts_max_age: 31536000  # 1 an
        hsts_subdomains: true
        hsts_preload: true
```

**Tester les headers:**
```bash
# Vérifier les headers de sécurité
curl -I https://atoll-tourisme.com

# Attendu:
# ✅ X-Frame-Options: DENY
# ✅ X-Content-Type-Options: nosniff
# ✅ Content-Security-Policy: default-src 'self'
# ✅ Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# ✅ Referrer-Policy: strict-origin-when-cross-origin
```

**Checklist Security Headers:**
- [ ] CSP configuré (Content-Security-Policy)
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy configuré
- [ ] HSTS activé (Strict-Transport-Security)
- [ ] HTTPS forcé (redirect HTTP → HTTPS)

---

## 7. Authentification & Autorisation

### ✅ Gestion sécurisée des accès

**Configuration:**
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
                enable_csrf: true  # ✅ CSRF sur login
            logout:
                path: app_logout
                target: app_home
            remember_me:
                secret: '%kernel.secret%'
                lifetime: 604800  # 1 semaine
                secure: true      # ✅ HTTPS only
                httponly: true    # ✅ Pas accessible JS

    access_control:
        - { path: ^/admin, roles: ROLE_ADMIN }
        - { path: ^/api, roles: ROLE_USER }
```

**Checklist Authentification:**
- [ ] Mots de passe hashés (Bcrypt/Argon2, pas MD5)
- [ ] CSRF activé sur login/logout
- [ ] Remember-me secure (HTTPS only, httponly)
- [ ] Rate limiting sur login (contre brute-force)
- [ ] Politique mot de passe fort (min 12 caractères)
- [ ] 2FA recommandé pour admin

**Checklist Autorisation:**
- [ ] Voter/Attributes pour logique métier
- [ ] Vérification systématique des droits
- [ ] Pas de hard-coded roles
- [ ] Principe du moindre privilège

**Exemple Voter:**
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
        // Admin peut tout voir
        if (in_array('ROLE_ADMIN', $user->getRoles())) {
            return true;
        }

        // Propriétaire peut voir sa réservation
        return $reservation->getEmailContact() === $user->getEmail();
    }
}
```

---

## 8. RGPD - Consentement & Droits

### ✅ Consentement explicite

**Formulaire de réservation:**
```php
class ReservationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            // ...
            ->add('rgpdConsent', CheckboxType::class, [
                'label' => 'J\'accepte que mes données personnelles soient traitées conformément à la politique de confidentialité',
                'constraints' => [
                    new Assert\IsTrue(message: 'Vous devez accepter le traitement de vos données'),
                ],
                'mapped' => false,
            ]);
    }
}
```

**Template:**
```twig
{{ form_row(form.rgpdConsent, {
    label: 'J\'accepte que mes données personnelles soient collectées et traitées pour gérer ma réservation'
}) }}

<p>
    <a href="{{ path('app_privacy_policy') }}" target="_blank">
        Consulter notre politique de confidentialité
    </a>
</p>
```

**Traçabilité du consentement:**
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

**Checklist Consentement:**
- [ ] Checkbox explicite (pas pré-cochée)
- [ ] Lien vers politique de confidentialité
- [ ] Date de consentement enregistrée
- [ ] IP du consentement enregistrée
- [ ] Consentement granulaire (newsletters séparées)

### ✅ Droit à l'oubli

**Commande d'anonymisation:**
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

        // Trouver toutes les réservations
        $reservations = $this->entityManager
            ->getRepository(Reservation::class)
            ->findBy(['emailContact' => $email]);

        foreach ($reservations as $reservation) {
            // Anonymiser les données
            $reservation->setEmailContact('anonymized@example.com');
            $reservation->setTelephoneContact('0000000000');

            foreach ($reservation->getParticipants() as $participant) {
                $participant->setNom('ANONYMISÉ');
                $participant->setPrenom('ANONYMISÉ');
                $participant->setDateNaissance(new \DateTimeImmutable('1900-01-01'));
            }
        }

        $this->entityManager->flush();

        return Command::SUCCESS;
    }
}
```

**Checklist Droit à l'oubli:**
- [ ] Procédure d'anonymisation documentée
- [ ] Commande CLI disponible
- [ ] Délai de traitement ≤ 1 mois
- [ ] Confirmation au demandeur
- [ ] Logs conservés (mais anonymisés)

### ✅ Portabilité des données

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

**Checklist Portabilité:**
- [ ] Export JSON disponible
- [ ] Format structuré et lisible
- [ ] Toutes les données personnelles incluses
- [ ] Délai de traitement ≤ 1 mois

---

## 9. Durée de conservation des données

### ✅ Suppression automatique des données obsolètes

**Configuration:**
```yaml
# config/services.yaml
parameters:
    app.data_retention:
        reservation_cancelled: '-3 months'   # Réservations annulées
        reservation_completed: '-3 years'    # Réservations complétées
        logs: '-1 year'                      # Logs applicatifs
```

**Commande de nettoyage:**
```php
#[AsCommand(name: 'app:gdpr:cleanup')]
class GdprCleanupCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $threeMonthsAgo = new \DateTimeImmutable('-3 months');
        $threeYearsAgo = new \DateTimeImmutable('-3 years');

        // Supprimer réservations annulées > 3 mois
        $this->entityManager->createQueryBuilder()
            ->delete(Reservation::class, 'r')
            ->where('r.statut = :statut')
            ->andWhere('r.dateAnnulation < :date')
            ->setParameter('statut', 'annulee')
            ->setParameter('date', $threeMonthsAgo)
            ->getQuery()
            ->execute();

        // Anonymiser réservations complétées > 3 ans
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

**Checklist Durée de conservation:**
- [ ] Politique de rétention documentée
- [ ] Nettoyage automatique (cron)
- [ ] Durées conformes RGPD (max 3 ans)
- [ ] Logs de nettoyage conservés

---

## 10. Audit & Traçabilité

### ✅ Logs des actions sensibles

**Configuration Monolog:**
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

**Logger les actions RGPD:**
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

        $this->gdprLogger->info('Réservation créée', [
            'reservation_id' => $reservation->getId(),
            'email' => $reservation->getEmailContact(),  // ⚠️ Anonymiser en prod
            'ip' => $request->getClientIp(),
            'consent_date' => $reservation->getRgpdConsentDate(),
        ]);

        return $reservation;
    }

    public function anonymize(Reservation $reservation): void
    {
        $this->gdprLogger->warning('Données anonymisées (RGPD)', [
            'reservation_id' => $reservation->getId(),
            'email_before' => $reservation->getEmailContact(),
            'reason' => 'droit à l\'oubli',
        ]);

        // Anonymisation...
    }
}
```

**Checklist Logs:**
- [ ] Logs des accès aux données personnelles
- [ ] Logs des modifications de données
- [ ] Logs des exports (portabilité)
- [ ] Logs des suppressions/anonymisations
- [ ] Logs pas trop verbeux (pas de passwords)
- [ ] Rotation des logs (max 1 an)

---

## 11. Tests de sécurité

### ✅ Tests automatisés

**Test CSRF:**
```php
public function testCsrfProtectionOnDeleteReservation(): void
{
    $client = static::createClient();

    // Sans token CSRF
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

    // Vérifier que le script est échappé
    $this->assertStringNotContainsString('<script>', $crawler->html());
    $this->assertStringContainsString('&lt;script&gt;', $crawler->html());
}
```

**Test SQL Injection:**
```php
public function testSqlInjectionProtectionInSearch(): void
{
    $client = static::createClient();

    // Tentative d'injection
    $client->request('GET', '/reservation/search', [
        'email' => "' OR '1'='1",
    ]);

    // Ne doit pas retourner toutes les réservations
    $this->assertResponseIsSuccessful();
    $this->assertCount(0, json_decode($client->getResponse()->getContent()));
}
```

---

## 12. Checklist finale avant release

### Sécurité

- [ ] Données sensibles chiffrées en BDD
- [ ] Validation stricte de tous les inputs
- [ ] CSRF activé sur tous les formulaires
- [ ] XSS protection (autoescape Twig)
- [ ] SQL Injection impossible (Doctrine ORM)
- [ ] Security headers configurés (CSP, HSTS, etc.)
- [ ] HTTPS forcé
- [ ] Authentification sécurisée (Bcrypt/Argon2)
- [ ] Rate limiting sur login
- [ ] Pas de secrets committed (.env)
- [ ] Dépendances à jour (composer audit)

### RGPD

- [ ] Politique de confidentialité publiée
- [ ] Consentement explicite (checkbox)
- [ ] Traçabilité du consentement (date, IP)
- [ ] Droit à l'oubli implémenté
- [ ] Portabilité des données (export JSON)
- [ ] Durée de conservation définie
- [ ] Nettoyage automatique (cron)
- [ ] Logs des actions sensibles
- [ ] Chiffrement des données perso
- [ ] Procédure de breach documentée

### Tests

- [ ] Tests CSRF
- [ ] Tests XSS
- [ ] Tests SQL Injection
- [ ] Tests autorisation (Voter)
- [ ] Scan de vulnérabilités (composer audit)

### Audit

```bash
# Vulnérabilités composer
composer audit

# Security checker Symfony
symfony security:check

# Static analysis
make phpstan
```

---

**Fréquence de l'audit:** Avant chaque release majeure + tous les 3 mois

**Responsable:** Lead Dev + DPO (Data Protection Officer)

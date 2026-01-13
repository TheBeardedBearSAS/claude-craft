# Bonnes Pratiques de Sécurité PHP

## Protection OWASP Top 10

### A01: Contrôle d'Accès Défaillant

```php
<?php
// ✅ BON: Utiliser le pattern Voter pour la vérification des permissions
final readonly class OrderVoter extends Voter
{
    protected function supports(string $attribute, mixed $subject): bool
    {
        return $subject instanceof Order
            && in_array($attribute, ['view', 'edit', 'delete'], true);
    }

    protected function voteOnAttribute(
        string $attribute,
        mixed $subject,
        TokenInterface $token
    ): bool {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        /** @var Order $order */
        $order = $subject;

        return match ($attribute) {
            'view' => $this->canView($order, $user),
            'edit' => $this->canEdit($order, $user),
            'delete' => $this->canDelete($order, $user),
            default => false,
        };
    }

    private function canView(Order $order, User $user): bool
    {
        // Le propriétaire ou l'admin peuvent voir
        return $order->getUserId()->equals($user->getId())
            || $user->hasRole('ROLE_ADMIN');
    }

    private function canEdit(Order $order, User $user): bool
    {
        // Seul le propriétaire peut modifier les commandes en brouillon
        return $order->getUserId()->equals($user->getId())
            && $order->getStatus() === OrderStatus::DRAFT;
    }
}

// Utilisation dans le contrôleur
#[Route('/orders/{id}', methods: ['GET'])]
public function show(Order $order): JsonResponse
{
    $this->denyAccessUnlessGranted('view', $order);

    return new JsonResponse($order);
}
```

### A02: Défaillances Cryptographiques

```php
<?php
// ✅ BON: Utiliser password_hash avec PASSWORD_ARGON2ID
final class PasswordHasher
{
    public function hash(string $password): string
    {
        return password_hash($password, PASSWORD_ARGON2ID, [
            'memory_cost' => 65536,    // 64 Mo
            'time_cost' => 4,          // 4 itérations
            'threads' => 3,            // 3 threads parallèles
        ]);
    }

    public function verify(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    public function needsRehash(string $hash): bool
    {
        return password_needs_rehash($hash, PASSWORD_ARGON2ID);
    }
}

// ✅ BON: Chiffrement des données sensibles
final class Encryptor
{
    private const CIPHER = 'aes-256-gcm';

    public function __construct(
        #[\SensitiveParameter]
        private readonly string $key,
    ) {}

    public function encrypt(string $plaintext): string
    {
        $iv = random_bytes(12);  // Recommandé 96 bits pour GCM
        $tag = '';

        $ciphertext = openssl_encrypt(
            $plaintext,
            self::CIPHER,
            $this->key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            '',
            16  // Longueur du tag
        );

        // Format: IV + Tag + Ciphertext
        return base64_encode($iv . $tag . $ciphertext);
    }

    public function decrypt(string $encoded): string
    {
        $data = base64_decode($encoded, true);
        if ($data === false) {
            throw new DecryptionException('Données encodées invalides');
        }

        $iv = substr($data, 0, 12);
        $tag = substr($data, 12, 16);
        $ciphertext = substr($data, 28);

        $plaintext = openssl_decrypt(
            $ciphertext,
            self::CIPHER,
            $this->key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        if ($plaintext === false) {
            throw new DecryptionException('Échec du déchiffrement');
        }

        return $plaintext;
    }
}

// ❌ MAUVAIS: Ne jamais utiliser des algorithmes faibles
$hash = md5($password);           // MAUVAIS
$hash = sha1($password);          // MAUVAIS
$hash = hash('sha256', $password); // MAUVAIS pour les mots de passe
```

### A03: Injection

```php
<?php
// ✅ BON: Utiliser des requêtes paramétrées (Doctrine)
final class DoctrineUserRepository implements UserRepositoryInterface
{
    public function findByEmail(Email $email): ?User
    {
        return $this->entityManager
            ->createQueryBuilder()
            ->select('u')
            ->from(User::class, 'u')
            ->where('u.email = :email')
            ->setParameter('email', $email->getValue())
            ->getQuery()
            ->getOneOrNullResult();
    }

    // Requête native avec paramètres
    public function searchUsers(string $term, int $limit): array
    {
        $conn = $this->entityManager->getConnection();

        $sql = 'SELECT * FROM users WHERE name LIKE :term LIMIT :limit';

        return $conn->executeQuery($sql, [
            'term' => '%' . $term . '%',
            'limit' => $limit,
        ], [
            'term' => \PDO::PARAM_STR,
            'limit' => \PDO::PARAM_INT,
        ])->fetchAllAssociative();
    }
}

// ❌ MAUVAIS: Ne JAMAIS concaténer des requêtes SQL
$sql = "SELECT * FROM users WHERE email = '$email'"; // INJECTION SQL!

// ✅ BON: Échapper les sorties pour prévenir XSS
final class HtmlSanitizer
{
    public function escape(string $content): string
    {
        return htmlspecialchars($content, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
}

// Dans les templates Twig (échappement automatique)
// {{ user.name }} - Automatiquement échappé
// {{ user.bio|raw }} - NON échappé, utiliser avec précaution
```

### A04: Conception Non Sécurisée

```php
<?php
// ✅ BON: Implémenter le rate limiting
final class RateLimiter
{
    public function __construct(
        private readonly CacheInterface $cache,
    ) {}

    public function isAllowed(string $key, int $maxAttempts, int $decaySeconds): bool
    {
        $cacheKey = 'rate_limit:' . $key;
        $attempts = (int) $this->cache->get($cacheKey, fn() => 0);

        if ($attempts >= $maxAttempts) {
            return false;
        }

        $this->cache->set($cacheKey, $attempts + 1, $decaySeconds);

        return true;
    }

    public function tooManyAttempts(string $key, int $maxAttempts): bool
    {
        $cacheKey = 'rate_limit:' . $key;
        return (int) $this->cache->get($cacheKey, fn() => 0) >= $maxAttempts;
    }
}

// Utilisation dans le contrôleur de connexion
#[Route('/login', methods: ['POST'])]
public function login(Request $request): JsonResponse
{
    $ip = $request->getClientIp();
    $key = 'login:' . $ip;

    if (!$this->rateLimiter->isAllowed($key, maxAttempts: 5, decaySeconds: 300)) {
        throw new TooManyRequestsHttpException(300, 'Trop de tentatives de connexion');
    }

    // Procéder à la connexion...
}
```

### A05: Mauvaise Configuration de Sécurité

```php
<?php
// ✅ BON: Définir les headers de sécurité
final class SecurityHeadersMiddleware
{
    public function __invoke(Request $request, callable $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        // Prévenir le sniffing MIME
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Prévenir le clickjacking
        $response->headers->set('X-Frame-Options', 'DENY');

        // Activer le filtre XSS (hérité, mais toujours utile)
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Content Security Policy
        $response->headers->set(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'"
        );

        // Referrer Policy
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Permissions Policy
        $response->headers->set(
            'Permissions-Policy',
            'geolocation=(), microphone=(), camera=()'
        );

        return $response;
    }
}

// Configuration .env (ne jamais exposer en production)
// APP_ENV=prod
// APP_DEBUG=false

// php.ini hardening
// expose_php = Off
// display_errors = Off
// log_errors = On
// allow_url_fopen = Off
// allow_url_include = Off
```

### A06: Composants Vulnérables et Obsolètes

```bash
# Vérifier les vulnérabilités des dépendances
composer audit

# Mettre à jour les dépendances
composer update

# Vérifier les packages obsolètes
composer outdated
```

```yaml
# .github/workflows/security.yml
name: Security Audit

on:
  schedule:
    - cron: '0 0 * * *'  # Quotidien
  push:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Audit de sécurité
        run: composer audit --format=json

      - name: Vérifier les mises à jour
        run: composer outdated --direct
```

### A07: Défaillances d'Identification et d'Authentification

```php
<?php
// ✅ BON: Utiliser des tokens JWT sécurisés
final class JwtTokenGenerator
{
    public function __construct(
        #[\SensitiveParameter]
        private readonly string $secretKey,
        private readonly string $algorithm = 'HS256',
    ) {}

    public function generate(User $user): string
    {
        $payload = [
            'sub' => $user->getId()->getValue(),
            'email' => $user->getEmail()->getValue(),
            'roles' => $user->getRoles(),
            'iat' => time(),
            'exp' => time() + 3600,  // 1 heure
            'jti' => bin2hex(random_bytes(16)),  // ID unique de token
        ];

        return JWT::encode($payload, $this->secretKey, $this->algorithm);
    }

    public function validate(string $token): array
    {
        try {
            return (array) JWT::decode(
                $token,
                new Key($this->secretKey, $this->algorithm)
            );
        } catch (\Exception $e) {
            throw new InvalidTokenException('Token invalide ou expiré');
        }
    }
}

// ✅ BON: Stockage sécurisé des sessions
// php.ini ou configuration Symfony
// session.cookie_httponly = 1
// session.cookie_secure = 1
// session.cookie_samesite = Strict
// session.use_strict_mode = 1
// session.sid_length = 48
// session.sid_bits_per_character = 6

// ✅ BON: Implémenter MFA
final class TwoFactorAuthenticator
{
    private readonly TOTP $totp;

    public function __construct()
    {
        $this->totp = TOTP::createFromSecret(
            random_bytes(20),
            'MonApp',
            6,
            'sha1',
            30
        );
    }

    public function generateSecret(): string
    {
        return $this->totp->getSecret();
    }

    public function verify(string $code, string $secret): bool
    {
        $totp = TOTP::createFromSecret($secret);
        return $totp->verify($code, null, 1);  // Fenêtre de 1 période
    }
}
```

### A08: Défaillances d'Intégrité des Logiciels et des Données

```php
<?php
// ✅ BON: Valider les téléchargements de fichiers
final class FileUploadValidator
{
    private const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
    ];

    private const MAX_FILE_SIZE = 5 * 1024 * 1024;  // 5MB

    public function validate(UploadedFile $file): void
    {
        // Vérifier la taille
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new InvalidFileException('Fichier trop volumineux');
        }

        // Vérifier le type MIME (ne pas se fier à l'extension)
        $mimeType = $file->getMimeType();
        if (!in_array($mimeType, self::ALLOWED_MIME_TYPES, true)) {
            throw new InvalidFileException('Type de fichier non autorisé');
        }

        // Vérifier le contenu réel du fichier
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $detectedType = $finfo->file($file->getPathname());

        if ($detectedType !== $mimeType) {
            throw new InvalidFileException('Le contenu du fichier ne correspond pas au type déclaré');
        }

        // Pour les images, vérifier qu'elles sont bien des images valides
        if (str_starts_with($mimeType, 'image/')) {
            $imageInfo = @getimagesize($file->getPathname());
            if ($imageInfo === false) {
                throw new InvalidFileException('Fichier image invalide');
            }
        }
    }

    public function generateSafeFilename(UploadedFile $file): string
    {
        $extension = $file->guessExtension();
        return bin2hex(random_bytes(16)) . '.' . $extension;
    }
}

// ✅ BON: Protection CSRF
// Symfony l'inclut automatiquement dans les formulaires
// Pour les APIs, utiliser un header personnalisé ou double submit cookie
```

### A09: Défaillances de Journalisation et de Surveillance

```php
<?php
// ✅ BON: Logger les événements de sécurité
final class SecurityLogger
{
    public function __construct(
        private readonly LoggerInterface $logger,
    ) {}

    public function logAuthenticationSuccess(User $user, string $ip): void
    {
        $this->logger->info('Authentification réussie', [
            'user_id' => $user->getId()->getValue(),
            'email' => $user->getEmail()->getValue(),
            'ip' => $ip,
            'timestamp' => (new \DateTimeImmutable())->format('c'),
        ]);
    }

    public function logAuthenticationFailure(string $email, string $ip, string $reason): void
    {
        $this->logger->warning('Authentification échouée', [
            'email' => $email,
            'ip' => $ip,
            'reason' => $reason,
            'timestamp' => (new \DateTimeImmutable())->format('c'),
        ]);
    }

    public function logSuspiciousActivity(string $description, array $context): void
    {
        $this->logger->error('Activité suspecte détectée', [
            'description' => $description,
            'context' => $context,
            'timestamp' => (new \DateTimeImmutable())->format('c'),
        ]);
    }

    public function logAccessDenied(User $user, string $resource, string $action): void
    {
        $this->logger->warning('Accès refusé', [
            'user_id' => $user->getId()->getValue(),
            'resource' => $resource,
            'action' => $action,
            'timestamp' => (new \DateTimeImmutable())->format('c'),
        ]);
    }
}

// ❌ MAUVAIS: Ne jamais logger d'informations sensibles
$this->logger->info('Connexion utilisateur', [
    'password' => $password,    // NE JAMAIS FAIRE ÇA!
    'credit_card' => $card,     // NE JAMAIS FAIRE ÇA!
]);
```

### A10: Falsification de Requête Côté Serveur (SSRF)

```php
<?php
// ✅ BON: Valider et restreindre les URLs
final class SafeUrlFetcher
{
    private const ALLOWED_HOSTS = [
        'api.example.com',
        'cdn.example.com',
    ];

    private const BLOCKED_IP_RANGES = [
        '10.0.0.0/8',
        '172.16.0.0/12',
        '192.168.0.0/16',
        '127.0.0.0/8',
        '169.254.0.0/16',
        '0.0.0.0/8',
    ];

    public function fetch(string $url): string
    {
        $parsedUrl = parse_url($url);

        if ($parsedUrl === false || !isset($parsedUrl['host'])) {
            throw new InvalidUrlException('Format d\'URL invalide');
        }

        // Vérifier contre la liste blanche
        if (!in_array($parsedUrl['host'], self::ALLOWED_HOSTS, true)) {
            throw new InvalidUrlException('Hôte non dans la liste des hôtes autorisés');
        }

        // Résoudre le nom d'hôte et vérifier l'IP
        $ip = gethostbyname($parsedUrl['host']);
        if ($this->isPrivateIp($ip)) {
            throw new InvalidUrlException('Accès aux adresses IP privées non autorisé');
        }

        // Effectuer la requête avec un timeout strict
        $context = stream_context_create([
            'http' => [
                'timeout' => 5,
                'follow_location' => 0,  // Ne pas suivre les redirections
            ],
        ]);

        $content = @file_get_contents($url, false, $context);

        if ($content === false) {
            throw new FetchException('Échec de la récupération de l\'URL');
        }

        return $content;
    }

    private function isPrivateIp(string $ip): bool
    {
        return filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        ) === false;
    }
}
```

## Gestion des Secrets

```php
<?php
// ✅ BON: Utiliser des variables d'environnement
$databaseUrl = $_ENV['DATABASE_URL'];
$apiKey = $_ENV['API_SECRET_KEY'];

// ✅ BON: Utiliser l'attribut #[\SensitiveParameter] de PHP 8.2
function connect(
    string $host,
    string $user,
    #[\SensitiveParameter]
    string $password,
): PDO {
    // Le mot de passe ne sera pas affiché dans les traces de pile
}

// ❌ MAUVAIS: Ne jamais coder en dur les secrets
$apiKey = 'sk_live_xxxxxxxxxxxxx';  // NE JAMAIS FAIRE ÇA!
```

## Checklist de Sécurité

- [ ] Mots de passe hashés avec Argon2ID ou bcrypt
- [ ] Données sensibles chiffrées au repos
- [ ] Requêtes paramétrées utilisées partout
- [ ] Protection CSRF implémentée
- [ ] Rate limiting en place
- [ ] Headers de sécurité configurés
- [ ] Téléchargements de fichiers validés
- [ ] Événements de sécurité loggés
- [ ] Dépendances régulièrement auditées
- [ ] HTTPS forcé en production
- [ ] Cookies sécurisés (HttpOnly, Secure, SameSite)
- [ ] Secrets stockés dans les variables d'environnement
- [ ] JWT avec expiration courte
- [ ] Contrôle d'accès vérifié à chaque requête

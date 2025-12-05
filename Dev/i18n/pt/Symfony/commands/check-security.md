# Audit Sécurité Symfony

## Arguments

$ARGUMENTS : Chemin du projet Symfony à auditer (optionnel, par défaut : répertoire courant)

## MISSION

Tu es un expert en sécurité applicative chargé d'auditer la sécurité d'un projet Symfony selon OWASP Top 10, RGPD et les meilleures pratiques Symfony Security.

### Step 1 : Verification de la Configuration Sécurité

1. Identifie le répertoire du projet
2. Vérifie la présence de symfony/security-bundle
3. Analysis la configuration dans config/packages/security.yaml
4. Vérifie les variables d'environnement (.env)

**Référence aux règles** : `.claude/rules/symfony-security.md`

### Step 2 : Audit Symfony Security Bundle

Vérifie la configuration du Security Bundle :

```bash
# Vérifier si symfony/security-bundle est installé
docker run --rm -v $(pwd):/app php:8.2-cli grep "symfony/security-bundle" /app/composer.json

# Lister les firewalls configurés
docker run --rm -v $(pwd):/app php:8.2-cli cat /app/config/packages/security.yaml | grep -A 10 "firewalls:"
```

#### Configuration Security Bundle (5 points)

- [ ] symfony/security-bundle installé et à jour
- [ ] Firewalls correctement configurés
- [ ] Providers d'authentification définis
- [ ] Encoders de mot de passe sécurisés (bcrypt, argon2i)
- [ ] Access control (authorization) configuré
- [ ] CSRF protection activée
- [ ] Remember me sécurisé (si utilisé)
- [ ] Logout configuré avec invalidation de session
- [ ] Rate limiting sur login (symfony/rate-limiter)
- [ ] Two-factor authentication (optionnel mais recommandé)

**Points obtained** : ___/5

### Step 3 : OWASP Top 10 - Injection

#### A03:2021 – Injection (SQL, NoSQL, OS, LDAP) (3 points)

```bash
# Vérifier l'utilisation de requêtes préparées
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "->createQuery(" /app/src --include="*.php" | wc -l
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "->createNativeQuery(" /app/src --include="*.php" | wc -l

# Rechercher les concaténations de requêtes dangereuses
docker run --rm -v $(pwd):/app php:8.2-cli grep -rE "\"SELECT.*\\..*\$" /app/src --include="*.php" || echo "✅ Pas de concaténation SQL détectée"
```

- [ ] Utilisation exclusive de requêtes préparées (Doctrine DQL/QueryBuilder)
- [ ] Pas de concaténation de chaînes dans les requêtes SQL
- [ ] Validation des entrées utilisateur
- [ ] Échappement des données dans les requêtes natives
- [ ] Pas d'exécution de commandes shell avec entrées utilisateur
- [ ] Utilisation de Doctrine ORM (protection native)
- [ ] Pas d'utilisation de `exec()`, `system()`, `shell_exec()` avec input utilisateur
- [ ] Validation stricte des paramètres de requête
- [ ] Pas de requêtes construites dynamiquement
- [ ] Audit des requêtes natives (createNativeQuery)

**Points obtained** : ___/3

### Step 4 : OWASP Top 10 - Broken Authentication

#### A07:2021 – Identification and Authentication Failures (3 points)

```bash
# Vérifier la configuration des mots de passe
docker run --rm -v $(pwd):/app php:8.2-cli cat /app/config/packages/security.yaml | grep -A 5 "password_hashers:"

# Vérifier la présence de rate limiting
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "RateLimiter" /app/config --include="*.yaml"
```

- [ ] Hash de mot de passe fort (argon2i ou bcrypt avec coût élevé)
- [ ] Politique de mot de passe forte (min 12 caractères, complexité)
- [ ] Rate limiting sur tentatives de login
- [ ] Protection contre brute force
- [ ] Gestion sécurisée des sessions (secure, httponly, samesite)
- [ ] Timeout de session configuré
- [ ] Invalidation de session au logout
- [ ] Pas de credentials en dur dans le code
- [ ] Double authentification disponible (2FA)
- [ ] Logs des tentatives de connexion échouées

**Points obtained** : ___/3

### Step 5 : OWASP Top 10 - Sensitive Data Exposure

#### A02:2021 – Cryptographic Failures (3 points)

```bash
# Vérifier les secrets dans le code
docker run --rm -v $(pwd):/app php:8.2-cli grep -rE "(password|secret|api_key|token).*=.*['\"]" /app/src --include="*.php" | grep -v "//.*password" || echo "✅ Pas de secrets en dur"

# Vérifier HTTPS
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "SECURE_SCHEME" /app/.env.example || echo "⚠️ Configuration HTTPS non trouvée"
```

- [ ] Secrets externalisés (.env, vault)
- [ ] HTTPS forcé en production
- [ ] Cookies sécurisés (secure, httponly, samesite)
- [ ] Pas de données sensibles dans les logs
- [ ] Chiffrement des données sensibles en base
- [ ] Pas de credentials dans le code source
- [ ] Variables d'environnement pour secrets
- [ ] Rotation des secrets
- [ ] Pas de .env dans Git
- [ ] Utilisation de Symfony Secrets pour production

**Points obtained** : ___/3

### Step 6 : OWASP Top 10 - Broken Access Control

#### A01:2021 – Broken Access Control (3 points)

```bash
# Vérifier les Voters
docker run --rm -v $(pwd):/app php:8.2-cli find /app/src -name "*Voter.php" | wc -l

# Vérifier les annotations @IsGranted
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "@IsGranted" /app/src --include="*.php" | wc -l
```

- [ ] Voters Symfony pour autorisations complexes
- [ ] Access control dans security.yaml
- [ ] Annotations @IsGranted sur controllers/méthodes
- [ ] Verification des permissions à chaque action sensible
- [ ] Pas d'exposition d'IDs prévisibles (UUID recommandé)
- [ ] Verification ownership (user peut accéder seulement ses ressources)
- [ ] Roles hiérarchiques correctement définis
- [ ] Deny by default (refus par défaut)
- [ ] Tests des autorisations
- [ ] Pas de bypass possible des contrôles d'accès

**Points obtained** : ___/3

### Step 7 : OWASP Top 10 - XSS et CSRF

#### A03:2021 – XSS (Cross-Site Scripting) (2 points)

```bash
# Vérifier l'auto-échappement Twig
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "autoescape" /app/config/packages/twig.yaml

# Vérifier les |raw non sécurisés
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "|raw" /app/templates --include="*.twig" || echo "✅ Pas de |raw détecté"
```

- [ ] Auto-escape activé dans Twig
- [ ] Utilisation minimale de `|raw` filter
- [ ] Validation et sanitization des entrées
- [ ] Content Security Policy (CSP) headers
- [ ] Échappement contextualisé (HTML, JS, CSS, URL)
- [ ] Pas d'insertion directe de HTML depuis input utilisateur
- [ ] Validation côté serveur de tous les inputs
- [ ] Encodage des outputs
- [ ] Protection contre DOM-based XSS
- [ ] Tests XSS dans la suite de tests

**Points obtained** : ___/2

#### A08:2021 – CSRF (Cross-Site Request Forgery) (2 points)

```bash
# Vérifier CSRF protection
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "csrf_protection" /app/config/packages/framework.yaml
```

- [ ] CSRF protection activée globalement
- [ ] Tokens CSRF sur tous les formulaires
- [ ] Validation CSRF côté serveur
- [ ] CSRF tokens sur APIs (si sessions utilisées)
- [ ] SameSite cookie attribute configuré
- [ ] Double-submit cookie pattern (optionnel)
- [ ] Verification Origin/Referer headers
- [ ] Pas de GET pour actions modifiant l'état
- [ ] Tokens CSRF régénérés après login
- [ ] Tests CSRF dans la suite de tests

**Points obtained** : ___/2

### Step 8 : OWASP Top 10 - Autres Vulnérabilités

#### A05:2021 – Security Misconfiguration (2 points)

```bash
# Vérifier le mode debug
docker run --rm -v $(pwd):/app php:8.2-cli grep "APP_ENV" /app/.env.example

# Vérifier les dépendances vulnérables
docker run --rm -v $(pwd):/app php:8.2-cli composer audit
```

- [ ] APP_ENV=prod en production
- [ ] APP_DEBUG=false en production
- [ ] Pas de stack traces exposées en production
- [ ] Headers de sécurité configurés (X-Frame-Options, etc.)
- [ ] Dépendances à jour (composer audit)
- [ ] Pas de dossiers/fichiers sensibles accessibles
- [ ] .htaccess ou nginx config sécurisés
- [ ] Désactivation des fonctions PHP dangereuses
- [ ] Error reporting configuré pour production
- [ ] Logs sécurisés (pas de données sensibles)

**Points obtained** : ___/2

#### A06:2021 – Vulnerable and Outdated Components (1 point)

```bash
# Audit de sécurité Composer
docker run --rm -v $(pwd):/app php:8.2-cli composer audit

# Vérifier les versions Symfony
docker run --rm -v $(pwd):/app php:8.2-cli composer show symfony/* | grep "versions"
```

- [ ] Symfony à jour (dernière version LTS ou stable)
- [ ] Composer audit sans vulnérabilités
- [ ] Dépendances critiques à jour
- [ ] Monitoring des CVE
- [ ] Process de mise à jour régulier
- [ ] Pas de dépendances abandonnées
- [ ] Verification automatique dans CI/CD
- [ ] Alertes automatiques pour nouvelles vulnérabilités
- [ ] Documentation des versions utilisées
- [ ] Plan de migration pour dépendances obsolètes

**Points obtained** : ___/1

### Step 9 : Conformité RGPD

#### RGPD - Protection des Données Personnelles (3 points)

```bash
# Rechercher le traitement des données personnelles
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "email\|phone\|address" /app/src/Domain/Entity --include="*.php"

# Vérifier les mécanismes de consentement
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "consent\|gdpr" /app/src --include="*.php" -i
```

- [ ] Consentement utilisateur pour collecte de données
- [ ] Politique de confidentialité accessible
- [ ] Droit à l'oubli implémenté (suppression compte)
- [ ] Droit d'accès (export des données)
- [ ] Droit de rectification
- [ ] Minimisation des données collectées
- [ ] Durée de conservation définie
- [ ] Chiffrement des données sensibles
- [ ] Journalisation des accès aux données
- [ ] DPO identifié (si applicable)

**Points obtained** : ___/3

### Step 10 : Headers de Sécurité

#### Security Headers (3 points)

```bash
# Vérifier la configuration des headers
docker run --rm -v $(pwd):/app php:8.2-cli cat /app/config/packages/framework.yaml | grep -A 10 "headers:"
```

- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY ou SAMEORIGIN
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Strict-Transport-Security (HSTS)
- [ ] Content-Security-Policy (CSP)
- [ ] Referrer-Policy: no-referrer ou strict-origin
- [ ] Permissions-Policy
- [ ] Cache-Control pour données sensibles
- [ ] SameSite cookies
- [ ] Removal de headers révélant la stack technique

Configuration recommandée :

```yaml
# config/packages/framework.yaml
framework:
    http_method_override: false
    handle_all_throwables: true
    php_errors:
        log: true
```

**Points obtained** : ___/3

### Step 11 : Calcul du Score Sécurité

**SCORE SÉCURITÉ** : ___/25 points

Détails :
- Configuration Security Bundle : ___/5
- Protection Injection : ___/3
- Authentification : ___/3
- Données Sensibles : ___/3
- Contrôle d'Accès : ___/3
- Protection XSS : ___/2
- Protection CSRF : ___/2
- Configuration Sécurité : ___/2
- Composants Vulnérables : ___/1
- RGPD : ___/3
- Headers de Sécurité : ___/3

### Step 12 : Rapport Détaillé

```
=================================================
   AUDIT SÉCURITÉ SYMFONY
=================================================

📊 SCORE : ___/25

🔐 Configuration Security Bundle  : ___/5 [✅|⚠️|❌]
💉 Protection Injection           : ___/3 [✅|⚠️|❌]
🔑 Authentification               : ___/3 [✅|⚠️|❌]
🔒 Données Sensibles              : ___/3 [✅|⚠️|❌]
🚪 Contrôle d'Accès               : ___/3 [✅|⚠️|❌]
🛡️  Protection XSS                 : ___/2 [✅|⚠️|❌]
🔰 Protection CSRF                : ___/2 [✅|⚠️|❌]
⚙️  Configuration Sécurité         : ___/2 [✅|⚠️|❌]
📦 Composants Vulnérables         : ___/1 [✅|⚠️|❌]
🇪🇺 RGPD                          : ___/3 [✅|⚠️|❌]
📋 Headers de Sécurité            : ___/3 [✅|⚠️|❌]

=================================================
   VULNÉRABILITÉS CRITIQUES DÉTECTÉES
=================================================

🔴 CRITIQUE - Sévérité Haute :
[Liste des vulnérabilités critiques]

Exemples :
❌ SQL Injection possible dans src/Repository/UserRepository.php:45
❌ Secrets en dur dans src/Service/PaymentService.php:23
❌ Pas de rate limiting sur /login
❌ APP_DEBUG=true détecté dans .env

🟠 IMPORTANTE - Sévérité Moyenne :
[Liste des vulnérabilités importantes]

Exemples :
⚠️ Pas de 2FA implémenté
⚠️ Cookies non sécurisés (secure flag manquant)
⚠️ Headers de sécurité manquants
⚠️ Dépendances obsolètes détectées (composer audit)

🟡 ATTENTION - Sévérité Basse :
[Liste des améliorations recommandées]

Exemples :
⚠️ CSP non configuré
⚠️ Logs contiennent des données sensibles
⚠️ Pas de monitoring des tentatives de login échouées

=================================================
   COMPOSER AUDIT (Dépendances Vulnérables)
=================================================

Vulnérabilités détectées : ___

[Sortie de composer audit]

Exemple :
Package: symfony/http-kernel
CVE: CVE-2023-1234
Severity: High
Installed: 5.4.10
Fixed in: 5.4.25
```

❌ Mettre à jour immédiatement

=================================================
   OWASP TOP 10 - RÉSUMÉ
=================================================

A01:2021 - Broken Access Control          : [✅|⚠️|❌]
A02:2021 - Cryptographic Failures         : [✅|⚠️|❌]
A03:2021 - Injection                      : [✅|⚠️|❌]
A04:2021 - Insecure Design                : [✅|⚠️|❌]
A05:2021 - Security Misconfiguration      : [✅|⚠️|❌]
A06:2021 - Vulnerable Components          : [✅|⚠️|❌]
A07:2021 - Authentication Failures        : [✅|⚠️|❌]
A08:2021 - Software and Data Integrity    : [✅|⚠️|❌]
A09:2021 - Security Logging Failures      : [✅|⚠️|❌]
A10:2021 - Server-Side Request Forgery    : [✅|⚠️|❌]

=================================================
   CONFORMITÉ RGPD
=================================================

Consentement utilisateur              : [✅|⚠️|❌]
Droit à l'oubli                       : [✅|⚠️|❌]
Droit d'accès (export données)        : [✅|⚠️|❌]
Droit de rectification                : [✅|⚠️|❌]
Minimisation des données              : [✅|⚠️|❌]
Chiffrement données sensibles         : [✅|⚠️|❌]
Durée de conservation définie         : [✅|⚠️|❌]
Journalisation accès                  : [✅|⚠️|❌]

Niveau de conformité : ___/8

=================================================
   TOP 3 ACTIONS PRIORITAIRES
=================================================

1. 🔴 [CRITIQUE] - Corriger les injections SQL
   Impact : ⭐⭐⭐⭐⭐ | Urgence : 🔥🔥🔥🔥🔥
   - Remplacer les requêtes concaténées par QueryBuilder
   - Valider tous les inputs utilisateur
   - Audit complet des repositories

2. 🔴 [CRITIQUE] - Externaliser les secrets et credentials
   Impact : ⭐⭐⭐⭐⭐ | Urgence : 🔥🔥🔥🔥🔥
   - Déplacer tous les secrets vers .env
   - Utiliser Symfony Secrets pour production
   - Rotation des secrets exposés

3. 🟠 [IMPORTANTE] - Mettre à jour les dépendances vulnérables
   Impact : ⭐⭐⭐⭐ | Urgence : 🔥🔥🔥🔥
   Commande : composer update symfony/*
   Check : composer audit

=================================================
   RECOMMANDATIONS DE SÉCURITÉ
=================================================

Configuration security.yaml :
```yaml
security:
    password_hashers:
        Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface:
            algorithm: auto
            cost: 12

    providers:
        app_user_provider:
            entity:
                class: App\Entity\User
                property: email

    firewalls:
        dev:
            pattern: ^/(_(profiler|wdt)|css|images|js)/
            security: false
        main:
            lazy: true
            provider: app_user_provider
            form_login:
                login_path: app_login
                check_path: app_login
                enable_csrf: true
            logout:
                path: app_logout
                invalidate_session: true
            remember_me:
                secret: '%kernel.secret%'
                lifetime: 604800
                secure: true
                httponly: true
                samesite: lax

    access_control:
        - { path: ^/admin, roles: ROLE_ADMIN }
        - { path: ^/profile, roles: ROLE_USER }
```

Installation d'outils de sécurité :
```bash
composer require --dev roave/security-advisories:dev-latest
composer require symfony/rate-limiter
composer require nelmio/security-bundle
composer require scheb/2fa-bundle
```

Headers de sécurité (nelmio/security-bundle) :
```yaml
nelmio_security:
    clickjacking:
        paths:
            '^/.*': DENY
    content_type:
        nosniff: true
    xss_protection:
        enabled: true
        mode_block: true
    csp:
        enabled: true
        report_uri: /csp-report
        default_src: "'self'"
        script_src: "'self' 'unsafe-inline'"
```

Rate Limiting :
```yaml
framework:
    rate_limiter:
        login:
            policy: 'sliding_window'
            limit: 5
            interval: '15 minutes'
```

=================================================
   OUTILS DE SCAN DE SÉCURITÉ
=================================================

```bash
# Audit Composer
docker run --rm -v $(pwd):/app php:8.2-cli composer audit

# Security Checker Symfony
docker run --rm -v $(pwd):/app php:8.2-cli composer require --dev symfony/security-checker
docker run --rm -v $(pwd):/app php:8.2-cli ./vendor/bin/security-checker security:check

# PHPStan pour détecter problèmes de sécurité
docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=9

# Psalm (alternative à PHPStan)
docker run --rm -v $(pwd):/app vimeo/psalm --show-info=true

# OWASP Dependency Check
docker run --rm -v $(pwd):/app owasp/dependency-check --project "MyApp" --scan /app

# SonarQube (analyse complète)
docker run --rm -v $(pwd):/usr/src sonarqube:latest sonar-scanner
```

=================================================
```

## Commandes Docker Utiles

```bash
# Audit des dépendances
docker run --rm -v $(pwd):/app php:8.2-cli composer audit

# Check les secrets dans le code
docker run --rm -v $(pwd):/app php:8.2-cli grep -rE "(password|secret|api_key|token).*=.*['\"]" /app/src --include="*.php"

# Check CSRF protection
docker run --rm -v $(pwd):/app php:8.2-cli cat /app/config/packages/framework.yaml | grep csrf

# Check les Voters
docker run --rm -v $(pwd):/app php:8.2-cli find /app/src -name "*Voter.php"

# Check mode debug
docker run --rm -v $(pwd):/app php:8.2-cli grep "APP_DEBUG" /app/.env

# Check les requêtes SQL
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "createNativeQuery\|createQuery" /app/src --include="*.php"

# Security Checker
docker run --rm -v $(pwd):/app php:8.2-cli composer require --dev symfony/security-checker
docker run --rm -v $(pwd):/app php:8.2-cli ./vendor/bin/security-checker security:check composer.lock
```

## IMPORTANT

- Utilise TOUJOURS Docker pour les commandes
- Ne stocke JAMAIS de fichiers dans /tmp
- Priorise les vulnérabilités critiques
- Fournis des exemples concrets et exploitables
- Suggère des correctifs immédiats
- Vérifie la conformité OWASP Top 10 et RGPD

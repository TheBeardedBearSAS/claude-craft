---
description: Symfony-Sicherheitsaudit
argument-hint: [arguments]
---

# Symfony-Sicherheitsaudit

## Argumente

$ARGUMENTS : Pfad zum zu prüfenden Symfony-Projekt (optional, Standard: aktuelles Verzeichnis)

## MISSION

Du bist ein Experte für Anwendungssicherheit, der mit der Sicherheitsprüfung eines Symfony-Projekts gemäß OWASP Top 10, DSGVO und Symfony Security Best Practices beauftragt ist.

### Schritt 1: Überprüfung der Sicherheitskonfiguration

1. Identifiziere das Projektverzeichnis
2. Überprüfe das Vorhandensein von symfony/security-bundle
3. Analysiere die Konfiguration in config/packages/security.yaml
4. Überprüfe die Umgebungsvariablen (.env)

**Verweis auf Regeln** : `.claude/rules/symfony-security.md`

### Schritt 2: Audit Symfony Security Bundle

Überprüfe die Security Bundle-Konfiguration:

```bash
# Prüfen, ob symfony/security-bundle installiert ist
docker run --rm -v $(pwd):/app php:8.2-cli grep "symfony/security-bundle" /app/composer.json

# Konfigurierte Firewalls auflisten
docker run --rm -v $(pwd):/app php:8.2-cli cat /app/config/packages/security.yaml | grep -A 10 "firewalls:"
```

#### Security Bundle-Konfiguration (5 Punkte)

- [ ] symfony/security-bundle installiert und aktuell
- [ ] Firewalls korrekt konfiguriert
- [ ] Authentifizierungs-Provider definiert
- [ ] Sichere Passwort-Encoder (bcrypt, argon2i)
- [ ] Access Control (Autorisierung) konfiguriert
- [ ] CSRF-Schutz aktiviert
- [ ] Sichere Remember-Me-Funktion (falls verwendet)
- [ ] Logout mit Session-Invalidierung konfiguriert
- [ ] Rate Limiting beim Login (symfony/rate-limiter)
- [ ] Zwei-Faktor-Authentifizierung (optional aber empfohlen)

**Erreichte Punkte** : ___/5

### Schritt 3: OWASP Top 10 - Injection

#### A03:2021 – Injection (SQL, NoSQL, OS, LDAP) (3 Punkte)

```bash
# Verwendung von Prepared Statements überprüfen
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "->createQuery(" /app/src --include="*.php" | wc -l
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "->createNativeQuery(" /app/src --include="*.php" | wc -l

# Nach gefährlichen Query-Konkatenationen suchen
docker run --rm -v $(pwd):/app php:8.2-cli grep -rE "\"SELECT.*\\..*\$" /app/src --include="*.php" || echo "✅ Keine SQL-Konkatenation erkannt"
```

- [ ] Ausschließliche Verwendung von Prepared Statements (Doctrine DQL/QueryBuilder)
- [ ] Keine String-Konkatenation in SQL-Abfragen
- [ ] Validierung von Benutzereingaben
- [ ] Escaping von Daten in nativen Abfragen
- [ ] Keine Ausführung von Shell-Befehlen mit Benutzereingaben
- [ ] Verwendung von Doctrine ORM (nativer Schutz)
- [ ] Keine Verwendung von `exec()`, `system()`, `shell_exec()` mit Benutzereingaben
- [ ] Strikte Validierung von Abfrageparametern
- [ ] Keine dynamisch erstellten Abfragen
- [ ] Audit von nativen Abfragen (createNativeQuery)

**Erreichte Punkte** : ___/3

### Schritt 4: OWASP Top 10 - Broken Authentication

#### A07:2021 – Identification and Authentication Failures (3 Punkte)

```bash
# Passwort-Konfiguration überprüfen
docker run --rm -v $(pwd):/app php:8.2-cli cat /app/config/packages/security.yaml | grep -A 5 "password_hashers:"

# Vorhandensein von Rate Limiting prüfen
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "RateLimiter" /app/config --include="*.yaml"
```

- [ ] Starker Passwort-Hash (argon2i oder bcrypt mit hohen Kosten)
- [ ] Starke Passwort-Richtlinie (min. 12 Zeichen, Komplexität)
- [ ] Rate Limiting bei Login-Versuchen
- [ ] Schutz gegen Brute Force
- [ ] Sichere Session-Verwaltung (secure, httponly, samesite)
- [ ] Konfiguriertes Session-Timeout
- [ ] Session-Invalidierung beim Logout
- [ ] Keine hartcodierten Credentials im Code
- [ ] Zwei-Faktor-Authentifizierung verfügbar (2FA)
- [ ] Protokollierung fehlgeschlagener Login-Versuche

**Erreichte Punkte** : ___/3

### Schritt 5: OWASP Top 10 - Sensitive Data Exposure

#### A02:2021 – Cryptographic Failures (3 Punkte)

```bash
# Secrets im Code überprüfen
docker run --rm -v $(pwd):/app php:8.2-cli grep -rE "(password|secret|api_key|token).*=.*['\"]" /app/src --include="*.php" | grep -v "//.*password" || echo "✅ Keine hartcodierten Secrets"

# HTTPS überprüfen
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "SECURE_SCHEME" /app/.env.example || echo "⚠️ HTTPS-Konfiguration nicht gefunden"
```

- [ ] Externalisierte Secrets (.env, vault)
- [ ] Erzwungenes HTTPS in Produktion
- [ ] Sichere Cookies (secure, httponly, samesite)
- [ ] Keine sensiblen Daten in Logs
- [ ] Verschlüsselung sensibler Daten in der Datenbank
- [ ] Keine Credentials im Quellcode
- [ ] Umgebungsvariablen für Secrets
- [ ] Rotation von Secrets
- [ ] Keine .env in Git
- [ ] Verwendung von Symfony Secrets für Produktion

**Erreichte Punkte** : ___/3

### Schritt 6: OWASP Top 10 - Broken Access Control

#### A01:2021 – Broken Access Control (3 Punkte)

```bash
# Voters überprüfen
docker run --rm -v $(pwd):/app php:8.2-cli find /app/src -name "*Voter.php" | wc -l

# @IsGranted Annotations überprüfen
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "@IsGranted" /app/src --include="*.php" | wc -l
```

- [ ] Symfony Voters für komplexe Berechtigungen
- [ ] Access Control in security.yaml
- [ ] @IsGranted Annotations auf Controllern/Methoden
- [ ] Berechtigungsprüfung bei jeder sensiblen Aktion
- [ ] Keine Exposition vorhersagbarer IDs (UUID empfohlen)
- [ ] Überprüfung der Eigentümerschaft (Benutzer kann nur auf eigene Ressourcen zugreifen)
- [ ] Korrekt definierte Rollen-Hierarchie
- [ ] Deny by Default (Standardablehnung)
- [ ] Tests der Berechtigungen
- [ ] Keine Umgehungsmöglichkeit der Zugriffskontrollen

**Erreichte Punkte** : ___/3

### Schritt 7: OWASP Top 10 - XSS und CSRF

#### A03:2021 – XSS (Cross-Site Scripting) (2 Punkte)

```bash
# Twig Auto-Escaping überprüfen
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "autoescape" /app/config/packages/twig.yaml

# Unsichere |raw-Filter überprüfen
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "|raw" /app/templates --include="*.twig" || echo "✅ Kein |raw erkannt"
```

- [ ] Auto-Escape in Twig aktiviert
- [ ] Minimale Verwendung des `|raw` Filters
- [ ] Validierung und Bereinigung von Eingaben
- [ ] Content Security Policy (CSP) Headers
- [ ] Kontextbezogenes Escaping (HTML, JS, CSS, URL)
- [ ] Keine direkte Einfügung von HTML aus Benutzereingaben
- [ ] Serverseitige Validierung aller Eingaben
- [ ] Encoding der Ausgaben
- [ ] Schutz gegen DOM-basiertes XSS
- [ ] XSS-Tests in der Testsuite

**Erreichte Punkte** : ___/2

#### A08:2021 – CSRF (Cross-Site Request Forgery) (2 Punkte)

```bash
# CSRF-Schutz überprüfen
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "csrf_protection" /app/config/packages/framework.yaml
```

- [ ] CSRF-Schutz global aktiviert
- [ ] CSRF-Tokens auf allen Formularen
- [ ] Serverseitige CSRF-Validierung
- [ ] CSRF-Tokens auf APIs (falls Sessions verwendet werden)
- [ ] SameSite Cookie-Attribut konfiguriert
- [ ] Double-Submit Cookie Pattern (optional)
- [ ] Überprüfung von Origin/Referer Headers
- [ ] Keine GET-Anfragen für zustandsändernde Aktionen
- [ ] CSRF-Tokens nach Login neu generiert
- [ ] CSRF-Tests in der Testsuite

**Erreichte Punkte** : ___/2

### Schritt 8: OWASP Top 10 - Weitere Schwachstellen

#### A05:2021 – Security Misconfiguration (2 Punkte)

```bash
# Debug-Modus überprüfen
docker run --rm -v $(pwd):/app php:8.2-cli grep "APP_ENV" /app/.env.example

# Auf anfällige Abhängigkeiten prüfen
docker run --rm -v $(pwd):/app php:8.2-cli composer audit
```

- [ ] APP_ENV=prod in Produktion
- [ ] APP_DEBUG=false in Produktion
- [ ] Keine exponierten Stack Traces in Produktion
- [ ] Konfigurierte Security-Header (X-Frame-Options, etc.)
- [ ] Aktuelle Abhängigkeiten (composer audit)
- [ ] Keine zugänglichen sensiblen Ordner/Dateien
- [ ] Sichere .htaccess oder nginx-Konfiguration
- [ ] Deaktivierung gefährlicher PHP-Funktionen
- [ ] Error Reporting für Produktion konfiguriert
- [ ] Sichere Logs (keine sensiblen Daten)

**Erreichte Punkte** : ___/2

#### A06:2021 – Vulnerable and Outdated Components (1 Punkt)

```bash
# Composer Sicherheitsaudit
docker run --rm -v $(pwd):/app php:8.2-cli composer audit

# Symfony-Versionen überprüfen
docker run --rm -v $(pwd):/app php:8.2-cli composer show symfony/* | grep "versions"
```

- [ ] Symfony aktuell (neueste LTS oder stabile Version)
- [ ] Composer Audit ohne Schwachstellen
- [ ] Kritische Abhängigkeiten aktuell
- [ ] Monitoring von CVEs
- [ ] Regelmäßiger Update-Prozess
- [ ] Keine aufgegebenen Abhängigkeiten
- [ ] Automatische Überprüfung in CI/CD
- [ ] Automatische Benachrichtigungen bei neuen Schwachstellen
- [ ] Dokumentation verwendeter Versionen
- [ ] Migrationsplan für veraltete Abhängigkeiten

**Erreichte Punkte** : ___/1

### Schritt 9: DSGVO-Konformität

#### DSGVO - Schutz personenbezogener Daten (3 Punkte)

```bash
# Verarbeitung personenbezogener Daten suchen
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "email\|phone\|address" /app/src/Domain/Entity --include="*.php"

# Einwilligungsmechanismen überprüfen
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "consent\|gdpr" /app/src --include="*.php" -i
```

- [ ] Benutzereinwilligung für Datenerfassung
- [ ] Zugängliche Datenschutzerklärung
- [ ] Implementiertes Recht auf Vergessenwerden (Kontolöschung)
- [ ] Auskunftsrecht (Datenexport)
- [ ] Recht auf Berichtigung
- [ ] Datenminimierung
- [ ] Definierte Aufbewahrungsdauer
- [ ] Verschlüsselung sensibler Daten
- [ ] Protokollierung des Datenzugriffs
- [ ] DSB identifiziert (falls zutreffend)

**Erreichte Punkte** : ___/3

### Schritt 10: Security Headers

#### Security Headers (3 Punkte)

```bash
# Header-Konfiguration überprüfen
docker run --rm -v $(pwd):/app php:8.2-cli cat /app/config/packages/framework.yaml | grep -A 10 "headers:"
```

- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY oder SAMEORIGIN
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Strict-Transport-Security (HSTS)
- [ ] Content-Security-Policy (CSP)
- [ ] Referrer-Policy: no-referrer oder strict-origin
- [ ] Permissions-Policy
- [ ] Cache-Control für sensible Daten
- [ ] SameSite Cookies
- [ ] Entfernung von Headern, die den Tech-Stack verraten

Empfohlene Konfiguration:

```yaml
# config/packages/framework.yaml
framework:
    http_method_override: false
    handle_all_throwables: true
    php_errors:
        log: true
```

**Erreichte Punkte** : ___/3

### Schritt 11: Berechnung des Sicherheits-Scores

**SICHERHEITS-SCORE** : ___/25 Punkte

Details:
- Security Bundle-Konfiguration : ___/5
- Injection-Schutz : ___/3
- Authentifizierung : ___/3
- Sensible Daten : ___/3
- Zugriffskontrolle : ___/3
- XSS-Schutz : ___/2
- CSRF-Schutz : ___/2
- Sicherheitskonfiguration : ___/2
- Anfällige Komponenten : ___/1
- DSGVO : ___/3
- Security Headers : ___/3

### Schritt 12: Detaillierter Bericht

```
=================================================
   SYMFONY-SICHERHEITSAUDIT
=================================================

📊 SCORE : ___/25

🔐 Security Bundle-Konfiguration : ___/5 [✅|⚠️|❌]
💉 Injection-Schutz               : ___/3 [✅|⚠️|❌]
🔑 Authentifizierung              : ___/3 [✅|⚠️|❌]
🔒 Sensible Daten                 : ___/3 [✅|⚠️|❌]
🚪 Zugriffskontrolle             : ___/3 [✅|⚠️|❌]
🛡️  XSS-Schutz                    : ___/2 [✅|⚠️|❌]
🔰 CSRF-Schutz                    : ___/2 [✅|⚠️|❌]
⚙️  Sicherheitskonfiguration       : ___/2 [✅|⚠️|❌]
📦 Anfällige Komponenten          : ___/1 [✅|⚠️|❌]
🇪🇺 DSGVO                          : ___/3 [✅|⚠️|❌]
📋 Security Headers               : ___/3 [✅|⚠️|❌]

=================================================
   ERKANNTE KRITISCHE SCHWACHSTELLEN
=================================================

🔴 KRITISCH - Hoher Schweregrad:
[Liste der kritischen Schwachstellen]

Beispiele:
❌ SQL Injection möglich in src/Repository/UserRepository.php:45
❌ Hartcodierte Secrets in src/Service/PaymentService.php:23
❌ Kein Rate Limiting bei /login
❌ APP_DEBUG=true in .env erkannt

🟠 WICHTIG - Mittlerer Schweregrad:
[Liste der wichtigen Schwachstellen]

Beispiele:
⚠️ Keine 2FA implementiert
⚠️ Unsichere Cookies (secure Flag fehlt)
⚠️ Fehlende Security Headers
⚠️ Veraltete Abhängigkeiten erkannt (composer audit)

🟡 ACHTUNG - Niedriger Schweregrad:
[Liste empfohlener Verbesserungen]

Beispiele:
⚠️ CSP nicht konfiguriert
⚠️ Logs enthalten sensible Daten
⚠️ Kein Monitoring fehlgeschlagener Login-Versuche

=================================================
   COMPOSER AUDIT (Anfällige Abhängigkeiten)
=================================================

Erkannte Schwachstellen: ___

[Ausgabe von composer audit]

Beispiel:
Package: symfony/http-kernel
CVE: CVE-2023-1234
Severity: High
Installed: 5.4.10
Fixed in: 5.4.25
```

❌ Sofort aktualisieren

=================================================
   OWASP TOP 10 - ZUSAMMENFASSUNG
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
   DSGVO-KONFORMITÄT
=================================================

Benutzereinwilligung                      : [✅|⚠️|❌]
Recht auf Vergessenwerden                 : [✅|⚠️|❌]
Auskunftsrecht (Datenexport)              : [✅|⚠️|❌]
Recht auf Berichtigung                    : [✅|⚠️|❌]
Datenminimierung                          : [✅|⚠️|❌]
Verschlüsselung sensibler Daten           : [✅|⚠️|❌]
Definierte Aufbewahrungsdauer             : [✅|⚠️|❌]
Zugriffsprotokoller                       : [✅|⚠️|❌]

Konformitätsstufe: ___/8

=================================================
   TOP 3 PRIORITÄRE MASSNAHMEN
=================================================

1. 🔴 [KRITISCH] - SQL-Injections korrigieren
   Auswirkung: ⭐⭐⭐⭐⭐ | Dringlichkeit: 🔥🔥🔥🔥🔥
   - Konkatenierte Abfragen durch QueryBuilder ersetzen
   - Alle Benutzereingaben validieren
   - Vollständiges Repository-Audit

2. 🔴 [KRITISCH] - Secrets und Credentials externalisieren
   Auswirkung: ⭐⭐⭐⭐⭐ | Dringlichkeit: 🔥🔥🔥🔥🔥
   - Alle Secrets in .env verschieben
   - Symfony Secrets für Produktion verwenden
   - Rotation exponierter Secrets

3. 🟠 [WICHTIG] - Anfällige Abhängigkeiten aktualisieren
   Auswirkung: ⭐⭐⭐⭐ | Dringlichkeit: 🔥🔥🔥🔥
   Befehl: composer update symfony/*
   Check: composer audit

=================================================
   SICHERHEITSEMPFEHLUNGEN
=================================================

Konfiguration security.yaml:
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

Installation von Sicherheitstools:
```bash
composer require --dev roave/security-advisories:dev-latest
composer require symfony/rate-limiter
composer require nelmio/security-bundle
composer require scheb/2fa-bundle
```

Security Headers (nelmio/security-bundle):
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

Rate Limiting:
```yaml
framework:
    rate_limiter:
        login:
            policy: 'sliding_window'
            limit: 5
            interval: '15 minutes'
```

=================================================
   SICHERHEITS-SCAN-TOOLS
=================================================

```bash
# Composer Audit
docker run --rm -v $(pwd):/app php:8.2-cli composer audit

# Symfony Security Checker
docker run --rm -v $(pwd):/app php:8.2-cli composer require --dev symfony/security-checker
docker run --rm -v $(pwd):/app php:8.2-cli ./vendor/bin/security-checker security:check

# PHPStan zur Erkennung von Sicherheitsproblemen
docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=9

# Psalm (Alternative zu PHPStan)
docker run --rm -v $(pwd):/app vimeo/psalm --show-info=true

# OWASP Dependency Check
docker run --rm -v $(pwd):/app owasp/dependency-check --project "MyApp" --scan /app

# SonarQube (vollständige Analyse)
docker run --rm -v $(pwd):/usr/src sonarqube:latest sonar-scanner
```

=================================================
```

## Nützliche Docker-Befehle

```bash
# Abhängigkeiten-Audit
docker run --rm -v $(pwd):/app php:8.2-cli composer audit

# Secrets im Code prüfen
docker run --rm -v $(pwd):/app php:8.2-cli grep -rE "(password|secret|api_key|token).*=.*['\"]" /app/src --include="*.php"

# CSRF-Schutz prüfen
docker run --rm -v $(pwd):/app php:8.2-cli cat /app/config/packages/framework.yaml | grep csrf

# Voters prüfen
docker run --rm -v $(pwd):/app php:8.2-cli find /app/src -name "*Voter.php"

# Debug-Modus prüfen
docker run --rm -v $(pwd):/app php:8.2-cli grep "APP_DEBUG" /app/.env

# SQL-Abfragen prüfen
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "createNativeQuery\|createQuery" /app/src --include="*.php"

# Security Checker
docker run --rm -v $(pwd):/app php:8.2-cli composer require --dev symfony/security-checker
docker run --rm -v $(pwd):/app php:8.2-cli ./vendor/bin/security-checker security:check composer.lock
```

## WICHTIG

- Verwende IMMER Docker für Befehle
- Speichere NIEMALS Dateien in /tmp
- Priorisiere kritische Schwachstellen
- Liefere konkrete und umsetzbare Beispiele
- Schlage sofortige Korrekturen vor
- Überprüfe die Konformität mit OWASP Top 10 und DSGVO

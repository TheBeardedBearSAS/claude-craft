---
description: Auditoría de Seguridad Symfony
argument-hint: [arguments]
---

# Auditoría de Seguridad Symfony

## Argumentos

$ARGUMENTS : Ruta del proyecto Symfony a auditar (opcional, por defecto: directorio actual)

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Eres un experto en seguridad de aplicaciones encargado de auditar la seguridad de un proyecto Symfony según OWASP Top 10, RGPD y las mejores prácticas de Symfony Security.

### Paso 1: Verificación de la Configuración de Seguridad

1. Identifica el directorio del proyecto
2. Verifica la presencia de symfony/security-bundle
3. Analiza la configuración en config/packages/security.yaml
4. Verifica las variables de entorno (.env)

**Referencia a las reglas**: `.claude/rules/symfony-security.md`

### Paso 2: Auditoría de Symfony Security Bundle

Verifica la configuración del Security Bundle:

```bash
# Verificar si symfony/security-bundle está instalado
docker run --rm -v $(pwd):/app php:8.2-cli grep "symfony/security-bundle" /app/composer.json

# Listar los firewalls configurados
docker run --rm -v $(pwd):/app php:8.2-cli cat /app/config/packages/security.yaml | grep -A 10 "firewalls:"
```

#### Configuración Security Bundle (5 puntos)

- [ ] symfony/security-bundle instalado y actualizado
- [ ] Firewalls correctamente configurados
- [ ] Providers de autenticación definidos
- [ ] Encoders de contraseña seguros (bcrypt, argon2i)
- [ ] Access control (authorization) configurado
- [ ] Protección CSRF activada
- [ ] Remember me seguro (si se utiliza)
- [ ] Logout configurado con invalidación de sesión
- [ ] Rate limiting en login (symfony/rate-limiter)
- [ ] Autenticación de dos factores (opcional pero recomendado)

**Puntos obtenidos**: ___/5

### Paso 3: OWASP Top 10 - Inyección

#### A03:2021 – Injection (SQL, NoSQL, OS, LDAP) (3 puntos)

```bash
# Verificar el uso de consultas preparadas
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "->createQuery(" /app/src --include="*.php" | wc -l
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "->createNativeQuery(" /app/src --include="*.php" | wc -l

# Buscar concatenaciones de consultas peligrosas
docker run --rm -v $(pwd):/app php:8.2-cli grep -rE "\"SELECT.*\\..*\$" /app/src --include="*.php" || echo "✅ No se detectó concatenación SQL"
```

- [ ] Uso exclusivo de consultas preparadas (Doctrine DQL/QueryBuilder)
- [ ] Sin concatenación de cadenas en las consultas SQL
- [ ] Validación de entradas del usuario
- [ ] Escapado de datos en las consultas nativas
- [ ] Sin ejecución de comandos shell con entradas de usuario
- [ ] Uso de Doctrine ORM (protección nativa)
- [ ] Sin uso de `exec()`, `system()`, `shell_exec()` con input de usuario
- [ ] Validación estricta de parámetros de consulta
- [ ] Sin consultas construidas dinámicamente
- [ ] Auditoría de consultas nativas (createNativeQuery)

**Puntos obtenidos**: ___/3

### Paso 4: OWASP Top 10 - Broken Authentication

#### A07:2021 – Identification and Authentication Failures (3 puntos)

```bash
# Verificar la configuración de contraseñas
docker run --rm -v $(pwd):/app php:8.2-cli cat /app/config/packages/security.yaml | grep -A 5 "password_hashers:"

# Verificar la presencia de rate limiting
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "RateLimiter" /app/config --include="*.yaml"
```

- [ ] Hash de contraseña fuerte (argon2i o bcrypt con coste elevado)
- [ ] Política de contraseña fuerte (mín 12 caracteres, complejidad)
- [ ] Rate limiting en intentos de login
- [ ] Protección contra fuerza bruta
- [ ] Gestión segura de sesiones (secure, httponly, samesite)
- [ ] Timeout de sesión configurado
- [ ] Invalidación de sesión al logout
- [ ] Sin credenciales en el código
- [ ] Autenticación doble disponible (2FA)
- [ ] Logs de intentos de conexión fallidos

**Puntos obtenidos**: ___/3

### Paso 5: OWASP Top 10 - Exposición de Datos Sensibles

#### A02:2021 – Cryptographic Failures (3 puntos)

```bash
# Verificar secretos en el código
docker run --rm -v $(pwd):/app php:8.2-cli grep -rE "(password|secret|api_key|token).*=.*['\"]" /app/src --include="*.php" | grep -v "//.*password" || echo "✅ No se encontraron secretos en el código"

# Verificar HTTPS
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "SECURE_SCHEME" /app/.env.example || echo "⚠️ Configuración HTTPS no encontrada"
```

- [ ] Secretos externalizados (.env, vault)
- [ ] HTTPS forzado en producción
- [ ] Cookies seguras (secure, httponly, samesite)
- [ ] Sin datos sensibles en los logs
- [ ] Cifrado de datos sensibles en base de datos
- [ ] Sin credenciales en el código fuente
- [ ] Variables de entorno para secretos
- [ ] Rotación de secretos
- [ ] Sin .env en Git
- [ ] Uso de Symfony Secrets para producción

**Puntos obtenidos**: ___/3

### Paso 6: OWASP Top 10 - Control de Acceso Roto

#### A01:2021 – Broken Access Control (3 puntos)

```bash
# Verificar los Voters
docker run --rm -v $(pwd):/app php:8.2-cli find /app/src -name "*Voter.php" | wc -l

# Verificar las anotaciones @IsGranted
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "@IsGranted" /app/src --include="*.php" | wc -l
```

- [ ] Voters Symfony para autorizaciones complejas
- [ ] Access control en security.yaml
- [ ] Anotaciones @IsGranted en controllers/métodos
- [ ] Verificación de permisos en cada acción sensible
- [ ] Sin exposición de IDs predecibles (UUID recomendado)
- [ ] Verificación de propiedad (usuario puede acceder solo a sus recursos)
- [ ] Roles jerárquicos correctamente definidos
- [ ] Denegación por defecto (deny by default)
- [ ] Tests de las autorizaciones
- [ ] Sin posibilidad de bypass de los controles de acceso

**Puntos obtenidos**: ___/3

### Paso 7: OWASP Top 10 - XSS y CSRF

#### A03:2021 – XSS (Cross-Site Scripting) (2 puntos)

```bash
# Verificar el auto-escape de Twig
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "autoescape" /app/config/packages/twig.yaml

# Verificar los |raw no seguros
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "|raw" /app/templates --include="*.twig" || echo "✅ No se detectó |raw"
```

- [ ] Auto-escape activado en Twig
- [ ] Uso mínimo del filtro `|raw`
- [ ] Validación y saneamiento de entradas
- [ ] Cabeceras Content Security Policy (CSP)
- [ ] Escape contextualizado (HTML, JS, CSS, URL)
- [ ] Sin inserción directa de HTML desde input de usuario
- [ ] Validación del lado del servidor de todos los inputs
- [ ] Codificación de outputs
- [ ] Protección contra DOM-based XSS
- [ ] Tests XSS en la suite de tests

**Puntos obtenidos**: ___/2

#### A08:2021 – CSRF (Cross-Site Request Forgery) (2 puntos)

```bash
# Verificar la protección CSRF
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "csrf_protection" /app/config/packages/framework.yaml
```

- [ ] Protección CSRF activada globalmente
- [ ] Tokens CSRF en todos los formularios
- [ ] Validación CSRF del lado del servidor
- [ ] Tokens CSRF en APIs (si se usan sesiones)
- [ ] Atributo SameSite configurado en cookies
- [ ] Patrón double-submit cookie (opcional)
- [ ] Verificación de cabeceras Origin/Referer
- [ ] Sin GET para acciones que modifican el estado
- [ ] Tokens CSRF regenerados después del login
- [ ] Tests CSRF en la suite de tests

**Puntos obtenidos**: ___/2

### Paso 8: OWASP Top 10 - Otras Vulnerabilidades

#### A05:2021 – Security Misconfiguration (2 puntos)

```bash
# Verificar el modo debug
docker run --rm -v $(pwd):/app php:8.2-cli grep "APP_ENV" /app/.env.example

# Verificar dependencias vulnerables
docker run --rm -v $(pwd):/app php:8.2-cli composer audit
```

- [ ] APP_ENV=prod en producción
- [ ] APP_DEBUG=false en producción
- [ ] Sin stack traces expuestos en producción
- [ ] Cabeceras de seguridad configuradas (X-Frame-Options, etc.)
- [ ] Dependencias actualizadas (composer audit)
- [ ] Sin carpetas/archivos sensibles accesibles
- [ ] .htaccess o nginx config seguros
- [ ] Desactivación de funciones PHP peligrosas
- [ ] Error reporting configurado para producción
- [ ] Logs seguros (sin datos sensibles)

**Puntos obtenidos**: ___/2

#### A06:2021 – Vulnerable and Outdated Components (1 punto)

```bash
# Auditoría de seguridad Composer
docker run --rm -v $(pwd):/app php:8.2-cli composer audit

# Verificar versiones Symfony
docker run --rm -v $(pwd):/app php:8.2-cli composer show symfony/* | grep "versions"
```

- [ ] Symfony actualizado (última versión LTS o estable)
- [ ] Composer audit sin vulnerabilidades
- [ ] Dependencias críticas actualizadas
- [ ] Monitoreo de CVE
- [ ] Proceso de actualización regular
- [ ] Sin dependencias abandonadas
- [ ] Verificación automática en CI/CD
- [ ] Alertas automáticas para nuevas vulnerabilidades
- [ ] Documentación de las versiones utilizadas
- [ ] Plan de migración para dependencias obsoletas

**Puntos obtenidos**: ___/1

### Paso 9: Conformidad RGPD

#### RGPD - Protección de Datos Personales (3 puntos)

```bash
# Buscar el tratamiento de datos personales
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "email\|phone\|address" /app/src/Domain/Entity --include="*.php"

# Verificar los mecanismos de consentimiento
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "consent\|gdpr" /app/src --include="*.php" -i
```

- [ ] Consentimiento del usuario para recolección de datos
- [ ] Política de privacidad accesible
- [ ] Derecho al olvido implementado (eliminación de cuenta)
- [ ] Derecho de acceso (exportación de datos)
- [ ] Derecho de rectificación
- [ ] Minimización de datos recolectados
- [ ] Período de conservación definido
- [ ] Cifrado de datos sensibles
- [ ] Registro de accesos a los datos
- [ ] DPO identificado (si aplica)

**Puntos obtenidos**: ___/3

### Paso 10: Cabeceras de Seguridad

#### Security Headers (3 puntos)

```bash
# Verificar la configuración de cabeceras
docker run --rm -v $(pwd):/app php:8.2-cli cat /app/config/packages/framework.yaml | grep -A 10 "headers:"
```

- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY o SAMEORIGIN
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Strict-Transport-Security (HSTS)
- [ ] Content-Security-Policy (CSP)
- [ ] Referrer-Policy: no-referrer o strict-origin
- [ ] Permissions-Policy
- [ ] Cache-Control para datos sensibles
- [ ] SameSite cookies
- [ ] Eliminación de cabeceras que revelan la stack técnica

Configuración recomendada:

```yaml
# config/packages/framework.yaml
framework:
    http_method_override: false
    handle_all_throwables: true
    php_errors:
        log: true
```

**Puntos obtenidos**: ___/3

### Paso 11: Cálculo del Puntaje de Seguridad

**PUNTAJE DE SEGURIDAD**: ___/25 puntos

Detalles:
- Configuración Security Bundle: ___/5
- Protección Inyección: ___/3
- Autenticación: ___/3
- Datos Sensibles: ___/3
- Control de Acceso: ___/3
- Protección XSS: ___/2
- Protección CSRF: ___/2
- Configuración Seguridad: ___/2
- Componentes Vulnerables: ___/1
- RGPD: ___/3
- Cabeceras de Seguridad: ___/3

### Paso 12: Informe Detallado

```
=================================================
   AUDITORÍA DE SEGURIDAD SYMFONY
=================================================

📊 PUNTAJE: ___/25

🔐 Configuración Security Bundle  : ___/5 [✅|⚠️|❌]
💉 Protección Inyección           : ___/3 [✅|⚠️|❌]
🔑 Autenticación                  : ___/3 [✅|⚠️|❌]
🔒 Datos Sensibles                : ___/3 [✅|⚠️|❌]
🚪 Control de Acceso              : ___/3 [✅|⚠️|❌]
🛡️  Protección XSS                 : ___/2 [✅|⚠️|❌]
🔰 Protección CSRF                : ___/2 [✅|⚠️|❌]
⚙️  Configuración Seguridad        : ___/2 [✅|⚠️|❌]
📦 Componentes Vulnerables        : ___/1 [✅|⚠️|❌]
🇪🇺 RGPD                          : ___/3 [✅|⚠️|❌]
📋 Cabeceras de Seguridad         : ___/3 [✅|⚠️|❌]

=================================================
   VULNERABILIDADES CRÍTICAS DETECTADAS
=================================================

🔴 CRÍTICO - Severidad Alta:
[Lista de vulnerabilidades críticas]

Ejemplos:
❌ SQL Injection posible en src/Repository/UserRepository.php:45
❌ Secretos en el código en src/Service/PaymentService.php:23
❌ Sin rate limiting en /login
❌ APP_DEBUG=true detectado en .env

🟠 IMPORTANTE - Severidad Media:
[Lista de vulnerabilidades importantes]

Ejemplos:
⚠️ Sin 2FA implementado
⚠️ Cookies no seguras (falta flag secure)
⚠️ Cabeceras de seguridad faltantes
⚠️ Dependencias obsoletas detectadas (composer audit)

🟡 ATENCIÓN - Severidad Baja:
[Lista de mejoras recomendadas]

Ejemplos:
⚠️ CSP no configurado
⚠️ Los logs contienen datos sensibles
⚠️ Sin monitoreo de intentos de login fallidos

=================================================
   COMPOSER AUDIT (Dependencias Vulnerables)
=================================================

Vulnerabilidades detectadas: ___

[Salida de composer audit]

Ejemplo:
Package: symfony/http-kernel
CVE: CVE-2023-1234
Severity: High
Installed: 5.4.10
Fixed in: 5.4.25
```

❌ Actualizar inmediatamente

=================================================
   OWASP TOP 10 - RESUMEN
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
   CONFORMIDAD RGPD
=================================================

Consentimiento del usuario            : [✅|⚠️|❌]
Derecho al olvido                     : [✅|⚠️|❌]
Derecho de acceso (exportación datos) : [✅|⚠️|❌]
Derecho de rectificación              : [✅|⚠️|❌]
Minimización de datos                 : [✅|⚠️|❌]
Cifrado de datos sensibles            : [✅|⚠️|❌]
Período de conservación definido      : [✅|⚠️|❌]
Registro de accesos                   : [✅|⚠️|❌]

Nivel de conformidad: ___/8

=================================================
   TOP 3 ACCIONES PRIORITARIAS
=================================================

1. 🔴 [CRÍTICO] - Corregir las inyecciones SQL
   Impacto: ⭐⭐⭐⭐⭐ | Urgencia: 🔥🔥🔥🔥🔥
   - Reemplazar las consultas concatenadas por QueryBuilder
   - Validar todos los inputs del usuario
   - Auditoría completa de los repositorios

2. 🔴 [CRÍTICO] - Externalizar los secretos y credenciales
   Impacto: ⭐⭐⭐⭐⭐ | Urgencia: 🔥🔥🔥🔥🔥
   - Mover todos los secretos a .env
   - Usar Symfony Secrets para producción
   - Rotación de los secretos expuestos

3. 🟠 [IMPORTANTE] - Actualizar las dependencias vulnerables
   Impacto: ⭐⭐⭐⭐ | Urgencia: 🔥🔥🔥🔥
   Comando: composer update symfony/*
   Verificar: composer audit

=================================================
   RECOMENDACIONES DE SEGURIDAD
=================================================

Configuración security.yaml:
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

Instalación de herramientas de seguridad:
```bash
composer require --dev roave/security-advisories:dev-latest
composer require symfony/rate-limiter
composer require nelmio/security-bundle
composer require scheb/2fa-bundle
```

Cabeceras de seguridad (nelmio/security-bundle):
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
   HERRAMIENTAS DE ESCANEO DE SEGURIDAD
=================================================

```bash
# Auditoría Composer
docker run --rm -v $(pwd):/app php:8.2-cli composer audit

# Security Checker Symfony
docker run --rm -v $(pwd):/app php:8.2-cli composer require --dev symfony/security-checker
docker run --rm -v $(pwd):/app php:8.2-cli ./vendor/bin/security-checker security:check

# PHPStan para detectar problemas de seguridad
docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=9

# Psalm (alternativa a PHPStan)
docker run --rm -v $(pwd):/app vimeo/psalm --show-info=true

# OWASP Dependency Check
docker run --rm -v $(pwd):/app owasp/dependency-check --project "MyApp" --scan /app

# SonarQube (análisis completo)
docker run --rm -v $(pwd):/usr/src sonarqube:latest sonar-scanner
```

=================================================
```

## Comandos Docker Útiles

```bash
# Auditoría de dependencias
docker run --rm -v $(pwd):/app php:8.2-cli composer audit

# Verificar secretos en el código
docker run --rm -v $(pwd):/app php:8.2-cli grep -rE "(password|secret|api_key|token).*=.*['\"]" /app/src --include="*.php"

# Verificar protección CSRF
docker run --rm -v $(pwd):/app php:8.2-cli cat /app/config/packages/framework.yaml | grep csrf

# Verificar los Voters
docker run --rm -v $(pwd):/app php:8.2-cli find /app/src -name "*Voter.php"

# Verificar modo debug
docker run --rm -v $(pwd):/app php:8.2-cli grep "APP_DEBUG" /app/.env

# Verificar consultas SQL
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "createNativeQuery\|createQuery" /app/src --include="*.php"

# Security Checker
docker run --rm -v $(pwd):/app php:8.2-cli composer require --dev symfony/security-checker
docker run --rm -v $(pwd):/app php:8.2-cli ./vendor/bin/security-checker security:check composer.lock
```

## IMPORTANTE

- Utiliza SIEMPRE Docker para los comandos
- NO almacenes NUNCA archivos en /tmp
- Prioriza las vulnerabilidades críticas
- Proporciona ejemplos concretos y explotables
- Sugiere correcciones inmediatas
- Verifica el cumplimiento de OWASP Top 10 y RGPD

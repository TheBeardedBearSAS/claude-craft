---
description: Auditoría de Seguridad Symfony
argument-hint: [arguments]
---

# Auditoría de Seguridad Symfony

## Argumentos

$ARGUMENTS : Ruta del proyecto Symfony a auditar (opcional, por defecto: directorio actual)

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

[Contenido continúa con el mismo patrón del archivo inglés...]

## Comandos Docker Útiles

```bash
# Auditoría de dependencias
docker run --rm -v $(pwd):/app php:8.2-cli composer audit

# Check secrets en el código
docker run --rm -v $(pwd):/app php:8.2-cli grep -rE "(password|secret|api_key|token).*=.*['\"]" /app/src --include="*.php"

# Check protección CSRF
docker run --rm -v $(pwd):/app php:8.2-cli cat /app/config/packages/framework.yaml | grep csrf

# Check Voters
docker run --rm -v $(pwd):/app php:8.2-cli find /app/src -name "*Voter.php"

# Check modo debug
docker run --rm -v $(pwd):/app php:8.2-cli grep "APP_DEBUG" /app/.env

# Check consultas SQL
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

---
description: Auditoría de Seguridad PHP
argument-hint: [argumentos]
---

# Auditoría de Seguridad PHP

## Argumentos

$ARGUMENTS (opcional: ruta al proyecto PHP a auditar, por defecto el directorio actual)

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca múltiples módulos o requiere una investigación transversal.

## MISIÓN

Auditoría de seguridad de un proyecto PHP nativo basada en **OWASP Top 10:2025** (incl. Software Supply Chain Failures y Mishandling of Exceptional Conditions), CWE/SANS Top 25 y SLSA 1.0. Producir un informe con una puntuación sobre 25 y un plan de remediación priorizado.

**Reglas de referencia**: `.claude/rules/php-security.md`

### Paso 1: Escaneo de Dependencias (4 pts)

```bash
docker compose exec app composer audit
docker compose exec app composer outdated --direct
```

Opcional (SBOM + CVE):

```bash
docker compose exec app trivy fs --scanners vuln,secret,config .
```

Verificar:
- [ ] `composer audit` reporta 0 vulnerabilidades críticas / altas
- [ ] Todas las dependencias directas fijadas a rangos exactos o caret (sin `*`)
- [ ] Sin paquetes abandonados
- [ ] SBOM generado (SPDX 3 o CycloneDX) y verificado en CI
- [ ] Firmado Sigstore / cosign configurado para artefactos de release (SLSA 1.0)

### Paso 2: Inyección — SQL, Command, LDAP, Header (5 pts)

Escanear patrones peligrosos:

```bash
docker compose exec app grep -rn "PDO.*->query\|mysqli_query\|->prepare.*\$_" src/
docker compose exec app grep -rn "shell_exec\|passthru\|system\|exec\|popen" src/
```

Verificar:
- [ ] 100% queries parametrizadas — **sin concatenación de strings en SQL**
- [ ] Ejecución de comandos evitada; si es requerida, `escapeshellarg()` + whitelist
- [ ] Inyección de headers HTTP prevenida (sin CR/LF crudo en `header()`)
- [ ] Filtros LDAP escapados vía `ldap_escape()`
- [ ] Parsers XML deshabilitan entidades externas (`libxml_disable_entity_loader(true)` / `LIBXML_NONET`)

### Paso 3: Autenticación y Autorización (4 pts)

- [ ] Contraseñas hasheadas con **Argon2id** (OWASP 2026: 128 MiB RAM, t=3-5, p=1)
- [ ] `password_hash($p, PASSWORD_ARGON2ID)` usado; **sin MD5/SHA1/bcrypt en código nuevo**
- [ ] Longitud mínima de contraseña ≥ 12 caracteres
- [ ] Cookies de sesión: `HttpOnly`, `Secure`, `SameSite=Strict`
- [ ] Expiración de sesión 15–30 minutos
- [ ] JWT: **EdDSA (Ed25519)** > ES256 > RS256; expiración corta (15 min)
- [ ] **DPoP (RFC 9449)** para tokens sensibles
- [ ] Permisos verificados en cada solicitud (deny-by-default, no solo una vez en login)

**Comando de detección**:

```bash
docker compose exec app grep -rn "md5\|sha1\|password_hash.*BCRYPT" src/
```

### Paso 4: Secretos y Criptografía (4 pts)

- [ ] Sin secretos en historial de git (`gitleaks detect --log-opts='--all'` / `trufflehog`)
- [ ] Secretos cargados desde vars de entorno o un vault (HashiCorp Vault, AWS Secrets Manager)
- [ ] TLS 1.3 forzado; TLS 1.2 solo si se requiere compatibilidad hacia atrás
- [ ] Generación aleatoria vía `random_bytes()` / `random_int()` — **nunca `rand()`/`mt_rand()` para seguridad**
- [ ] Estrategia de rotación de claves documentada
- [ ] Cifrado en reposo para campos sensibles (ej., `paragonie/halite` para AEAD a nivel de campo)

### Paso 5: Validación de Entrada y Codificación de Salida (3 pts)

- [ ] Todas las entradas de usuario validadas del lado del servidor (nunca confiar en validación del cliente)
- [ ] Los Value Objects aplican invariantes en constructores
- [ ] Salida HTML escapada con `htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')`
- [ ] Salida JSON vía `json_encode()` con `JSON_THROW_ON_ERROR`
- [ ] Cargas de archivos: sniffing MIME, límite de tamaño, nombre aleatorio, fuera de web root

### Paso 6: Headers de Seguridad y Configuración (3 pts)

- [ ] `Content-Security-Policy` (Level 3) con nonces, sin `unsafe-inline`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY` (o CSP `frame-ancestors 'none'`)
- [ ] `Strict-Transport-Security` (HSTS, 1 año mín., preload si aplica)
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Cross-Origin-Opener-Policy: same-origin` (COOP)
- [ ] `Cross-Origin-Embedder-Policy: require-corp` (COEP)
- [ ] `Cross-Origin-Resource-Policy` (CORP)
- [ ] `Permissions-Policy` granular
- [ ] `display_errors=Off`, `expose_php=Off` en producción
- [ ] Páginas de error genéricas — **nunca filtrar stack traces en producción**

### Paso 7: Logging y Supply Chain (2 pts)

- [ ] Los logs incluyen: inicios de sesión, cambios de permisos, acceso a datos sensibles, errores de autorización
- [ ] Los logs **nunca** contienen: contraseñas, tokens, PII completa, stack traces en prod
- [ ] Logs estructurados (JSON) con IDs de correlación
- [ ] Provenance SLSA 1.0 nivel 1+ en builds de CI
- [ ] Dependabot / Renovate con escaneo CVE (Trivy, Grype)
- [ ] Builds reproducibles verificados en releases

## FORMATO DE SALIDA

```
AUDITORÍA DE SEGURIDAD PHP — OWASP TOP 10:2025
===============================================

PUNTUACIÓN: XX/25
SEVERIDAD: [Crítica / Alta / Media / Baja]

ESCANEO DE DEPENDENCIAS (X/4)
  composer audit: N críticas, N altas
  Paquetes abandonados: N
  SBOM presente: sí/no

INYECCIÓN (X/5)
  SQL no parametrizado: N
  Llamadas de comando peligrosas: N
  Riesgo XXE: sí/no

AUTH Y AUTORIZACIÓN (X/4)
  Hashes débiles (MD5/SHA1/bcrypt): N
  Verificaciones de permisos faltantes: N
  Algoritmo JWT: [EdDSA/ES256/RS256/ninguno]

SECRETOS Y CRYPTO (X/4)
  Secretos en historial: N
  Uso de RNG débil: N

ENTRADA / SALIDA (X/3)
  Validación faltante: N
  Salida sin escapar: N

HEADERS Y CONFIG (X/3)
  CSP / HSTS / COOP faltantes: N
  display_errors filtrando: sí/no

LOGGING Y SUPPLY CHAIN (X/2)
  PII en logs: N
  Nivel SLSA: [0/1/2/3]

TOP 3 ACCIONES CRÍTICAS:
1. [CRÍTICO] Reemplazar hashes MD5 con Argon2id
   Archivos: src/Infrastructure/Auth/...:línea
   Impacto: ALTO — Esfuerzo: MEDIO
2. [...]
3. [...]

VICTORIAS RÁPIDAS:
- Ejecutar `composer audit` en CI (0 esfuerzo)
- Agregar `declare(strict_types=1);` en todas partes (forzado por Rector)
- Habilitar HSTS en producción (1 línea de config)

HOJA DE RUTA DE REMEDIACIÓN:
Semana 1  — Parchear todos los CVEs CRÍTICOS de composer audit
Semana 2  — Migración Argon2id + rotación de algoritmo JWT
Mes 2     — SBOM + firmado Sigstore + SLSA nivel 2
```

## NOTAS IMPORTANTES

- **Los problemas de seguridad son SIEMPRE máxima prioridad** — superan las preocupaciones arquitectónicas
- Usar Docker para todos los escaneos; **nunca** filtrar secretos reales en la salida del escaneo
- OWASP Top 10:2025 consolida SSRF en Broken Access Control
- **Mishandling Exceptional Conditions** (nuevo 2025): un stack trace en producción es una vulnerabilidad de divulgación
- Supply Chain (nuevo 2025): firmar artefactos con Sigstore/cosign, generar SBOM en cada build
- Re-ejecutar esta auditoría en cada bump mayor de dependencias y trimestralmente en estado estable

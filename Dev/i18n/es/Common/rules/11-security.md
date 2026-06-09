# Seguridad

## Vision general

La seguridad es una **prioridad absoluta**. Este documento presenta los principios generales de seguridad aplicables a todo proyecto.

> **Nota:** Consulta las reglas especificas de tu tecnologia para las implementaciones concretas.

**Referencias:**
- **OWASP Top 10:2025** (publicado noviembre 2025)
- CWE/SANS Top 25
- SLSA 1.0

---

## Tabla de contenidos

1. [OWASP Top 10:2025](#owasp-top-102025)
2. [Validacion de entradas](#validacion-de-entradas)
3. [Autenticacion](#autenticacion)
4. [Autorizacion](#autorizacion)
5. [Datos sensibles](#datos-sensibles)
6. [Headers de seguridad](#headers-de-seguridad)
7. [Supply Chain](#supply-chain)
8. [Logging y monitoring](#logging-y-monitoring)
9. [Seguridad MCP & Plugins](#seguridad-mcp--plugins)
10. [Checklist](#checklist)

---

## OWASP Top 10:2025

> **Fuente:** [OWASP Top 10:2025](https://owasp.org/Top10/2025/) — publicado noviembre 2025.
> Cambios principales vs 2021: SSRF consolidado en #1, Supply Chain Failures nuevo en #6, Mishandling Exceptional Conditions nuevo en #7.

### 1. Broken Access Control (incluye SSRF consolidado)

```
❌ RIESGO
- Acceso a recursos sin verificacion
- URLs predecibles (/admin, /user/123/edit)
- Manipulacion de IDs en las URLs
- SSRF: URLs proporcionadas por el usuario no validadas, acceso a recursos internos

✅ PROTECCION
- Verificar los permisos en CADA peticion
- Usar identificadores no predecibles (UUID)
- Deny by default
- SSRF: Whitelist de destinos autorizados, validacion estricta de URLs
- Sin acceso a red interna desde los inputs del usuario
```

### 2. Cryptographic Failures

```
❌ RIESGO
- Datos sensibles en texto plano
- Algoritmos obsoletos (MD5, SHA1, bcrypt en nuevo codigo)
- Claves en el codigo fuente
- JWT con algoritmo debil (HS256, RS256)

✅ PROTECCION
- Cifrar los datos sensibles en reposo
- Usar TLS 1.3 en transito
- Hash de contrasenas: Argon2id (128 MiB RAM, t=3-5, p=1) — NUNCA MD5/SHA1/bcrypt
- JWT: EdDSA (Ed25519) preferido > ES256 > RS256
- Secretos en un vault (no en el codigo)
```

### 3. Injection

```
❌ RIESGO
- SQL Injection
- Command Injection
- LDAP Injection

✅ PROTECCION
- Consultas parametrizadas (prepared statements)
- Validacion y sanitizacion de entradas
- Principio de minimo privilegio (DB)
- Escape de outputs
```

### 4. Insecure Design

```
❌ RIESGO
- Sin threat modeling
- Funcionalidades sensibles sin proteccion
- Rate limiting ausente

✅ PROTECCION
- Threat modeling desde el diseno
- Security by design
- Defense in depth
- Rate limiting
```

### 5. Security Misconfiguration

```
❌ RIESGO
- Configuraciones por defecto no modificadas
- Funcionalidades innecesarias activadas
- Mensajes de error verbosos
- Permisos demasiado amplios

✅ PROTECCION
- Hardening de las configuraciones
- Desactivar lo no necesario
- Mensajes de error genericos en prod
- Principio de minimo privilegio
```

### 6. Software Supply Chain Failures (nuevo en 2025)

```
❌ RIESGO
- Dependencias con vulnerabilidades conocidas
- Componentes sin procedencia verificable
- CI/CD no securizado
- Artefactos no firmados

✅ PROTECCION
- SLSA 1.0 niveles 1-3 (fuentes verificables, builds reproducibles, procedencia)
- SBOM automatico (SPDX 3 o CycloneDX) en cada build
- Sigstore keyless signing (cosign) para artefactos e imagenes
- Dependabot / Renovate con escaneo de CVE (Trivy, Grype)
- Version fijada en todas las dependencias (no "latest")
```

### 7. Mishandling of Exceptional Conditions (nuevo en 2025)

```
❌ RIESGO
- Stack traces expuestos en produccion
- Excepciones no gestionadas que filtran datos internos
- Comportamiento indefinido en inputs mal formados

✅ PROTECCION
- Registrar errores, nunca exponer stack traces en prod
- Gestores de excepciones globales (error boundaries)
- Mensajes de error genericos en el cliente
- Fail fast con errores de negocio claros
```

### 8. Authentication Failures

```
❌ RIESGO
- Contrasenas debiles autorizadas
- Sin MFA
- Sesiones que no expiran
- Credential stuffing posible

✅ PROTECCION
- Politica de contrasenas fuertes (min 12 caracteres)
- MFA para accesos sensibles
- Expiracion de sesiones
- Rate limiting en login
- Deteccion de fuerza bruta
```

### 9. Logging & Monitoring Failures

```
❌ RIESGO
- Sin logs de eventos de seguridad
- Logs no protegidos
- Sin alertas

✅ PROTECCION
- Loguear los eventos de seguridad
- Proteger los logs (acceso restringido)
- Alertas sobre anomalias
- Retencion apropiada
```

### 10. Data Integrity Failures

```
❌ RIESGO
- Dependencias no verificadas
- CI/CD no securizado
- Updates no firmados

✅ PROTECCION
- Verificacion de firmas
- CI/CD securizado
- Integrity checks (checksums)
```

---

## Validacion de entradas

### Regla de oro

> **Nunca confiar en los datos del usuario.**
> Validar del lado del servidor, SIEMPRE.

### Tipos de validacion

| Tipo | Descripcion | Ejemplo |
|------|-------------|---------|
| **Whitelist** | Aceptar unicamente lo esperado | `status in ["pending", "done"]` |
| **Type checking** | Verificar el tipo | `typeof id === "number"` |
| **Formato** | Verificar el formato | `email.matches(EMAIL_REGEX)` |
| **Rango** | Verificar los limites | `1 <= page <= 100` |
| **Longitud** | Verificar la longitud | `name.length <= 255` |

### Ejemplos

```
// ❌ MALO - Sin validacion
function getUser(id):
  return db.query("SELECT * FROM users WHERE id = " + id)

// ✅ BUENO - Validacion + consulta parametrizada
function getUser(id):
  if not isValidUUID(id):
    throw InvalidInput("Invalid user ID")

  return db.query(
    "SELECT * FROM users WHERE id = ?",
    [id]
  )
```

### Sanitizacion vs Validacion

```
Validacion: Rechazar los datos invalidos
  → "abc" como ID numerico → ERROR

Sanitizacion: Limpiar los datos
  → "<script>" en un nombre → "script"

Preferir VALIDACION (rechazar) a SANITIZACION (transformar)
```

---

## Autenticacion

### Contrasenas

```
Reglas OWASP 2026:
- Minimo 12 caracteres
- Mayusculas, minusculas, numeros, especiales
- No estar en listas de contrasenas comprometidas
- Hash con Argon2id (128 MiB RAM, t=3-5, p=1)
- NUNCA MD5/SHA1/bcrypt en nuevo codigo
- Salt unico por usuario (gestionado por Argon2id)

// ✅ BUENO
hash = argon2id.hash(password, memory=131072, iterations=3, parallelism=1)

// ❌ MALO
hash = md5(password)
hash = sha1(password + "static_salt")
hash = bcrypt.hash(password, costFactor=12)  // No usar en nuevo codigo
```

Fuentes: [Argon2id OWASP 2026](https://guptadeepak.com/the-complete-guide-to-password-hashing-argon2-vs-bcrypt-vs-scrypt-vs-pbkdf2-2026/)

### Sesiones

```
Reglas:
- Token aleatorio criptograficamente seguro
- Almacenamiento del lado del servidor (no en cookies)
- Expiracion: 15-30 min de inactividad
- Renovacion despues del login
- Invalidacion despues del logout

Session config:
  cookie:
    httpOnly: true     # No accesible en JS
    secure: true       # Solo HTTPS
    sameSite: strict   # Proteccion CSRF
```

### JWT (si se usa)

```
Reglas OWASP 2026:
- Algoritmo: EdDSA (Ed25519) preferido > ES256 > RS256
- NUNCA HS256 con secreto debil
- Expiracion corta (15 min)
- Refresh token largo (7 dias) almacenado de forma segura
- DPoP (RFC 9449) para tokens sensibles
- Verificar firma y claims
- No almacenar datos sensibles en el payload

// ❌ MALO
jwt.sign(payload, "secret123", { algorithm: "HS256" })

// ✅ BUENO
jwt.sign(payload, ed25519PrivateKey, {
  algorithm: "EdDSA",
  expiresIn: "15m"
})
```

Fuentes: [JWT Best Practices 2026](https://duendesoftware.com/learn/best-practices-using-jwts-with-web-and-mobile-apps), [RFC 9449 DPoP](https://datatracker.ietf.org/doc/html/rfc9449)

### Multi-Factor Authentication (MFA)

```
Cuando activar MFA:
- Acceso admin
- Operaciones sensibles (pago, eliminacion)
- Cambio de contrasena
- Conexion desde nuevo dispositivo

Metodos (por nivel de seguridad):
- Hardware keys (FIDO2/WebAuthn) — el mas seguro
- TOTP (Google Authenticator, Authy)
- SMS (menos seguro — evitar si es posible)
```

---

## Autorizacion

### Principio de minimo privilegio

```
Regla: Otorgar unicamente los permisos NECESARIOS.

❌ MALO
user.role = "admin"  # Acceso a todo

✅ BUENO
user.permissions = ["read:users", "write:orders"]
```

### RBAC (Role-Based Access Control)

```
Roles:
- admin: Todos los permisos
- manager: Gestion de usuarios, lectura de reportes
- user: Acceso a sus propios datos

Verificacion:
function deleteUser(userId, currentUser):
  if not currentUser.hasPermission("delete:users"):
    throw Forbidden("Permission denied")

  // ... logica de eliminacion
```

### Row-Level Security

```
Regla: Verificar que el usuario tiene acceso AL recurso especifico.

// ❌ MALO - Verifica solo la autenticacion
function getOrder(orderId):
  return db.find("orders", orderId)

// ✅ BUENO - Verifica la pertenencia
function getOrder(orderId, currentUser):
  order = db.find("orders", orderId)

  if order.userId != currentUser.id:
    throw Forbidden("Not your order")

  return order
```

---

## Datos sensibles

### Clasificacion

| Categoria | Ejemplos | Proteccion |
|-----------|----------|------------|
| **Publico** | Nombre del producto | Ninguna |
| **Interno** | Emails | Acceso restringido |
| **Confidencial** | Datos de clientes | Cifrado |
| **Secreto** | Contrasenas, claves | Vault, hash Argon2id |

### Almacenamiento

```
Contrasenas:
  → Hash con Argon2id (128 MiB RAM, t=3-5, p=1)
  → NUNCA en texto plano
  → NUNCA bcrypt/MD5/SHA1 en nuevo codigo

Datos personales (RGPD):
  → Cifrado en reposo (AES-256-GCM)
  → Pseudonimizacion si es posible
  → Retencion limitada

Secretos (API keys, etc.):
  → Variables de entorno
  → Vault (HashiCorp, AWS Secrets Manager)
  → NUNCA en el codigo fuente
```

### Transmision

```
Reglas:
- HTTPS obligatorio (TLS 1.3)
- Certificados validos
- HSTS activado
- Sin datos sensibles en URLs

// ❌ MALO
GET /api/users?password=secret123

// ✅ BUENO
POST /api/auth
Body: { "password": "..." }
```

---

## Headers de seguridad

### Headers obligatorios 2026

```http
# Proteccion XSS + CSP Level 3
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'
X-Content-Type-Options: nosniff

# Proteccion clickjacking
X-Frame-Options: DENY

# HTTPS
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

# Referrer
Referrer-Policy: strict-origin-when-cross-origin

# Permisos granulares
Permissions-Policy: geolocation=(), camera=(), microphone=()

# Cross-Origin Isolation (2026 — obligatorios)
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

Fuente: [HTTP Security Headers 2026](https://thibautprobst.fr/en/posts/http-security-headers/)

### Content-Security-Policy (CSP) Level 3

```http
# Restrictivo (recomendado)
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self' api.example.com;
  frame-ancestors 'none';
  upgrade-insecure-requests;
```

### Cross-Origin Headers (nuevos en 2026)

| Header | Valor recomendado | Proteccion |
|--------|-------------------|------------|
| **COOP** | `same-origin` | Aisla el contexto de navegacion (Spectre) |
| **COEP** | `require-corp` | Activa Cross-Origin Isolation |
| **CORP** | `same-origin` | Protege los recursos contra inclusiones cross-origin |
| **Permissions-Policy** | Granular por feature | Controla el acceso a las APIs del navegador |

---

## Supply Chain

> **Referencia:** [Supply Chain Security 2026](https://kawaldeepsingh.medium.com/practical-software-supply-chain-security-2026-sboms-signing-slsa-reproducible-builds-a-0416cfac32dc)

### SLSA 1.0 (Supply-chain Levels for Software Artifacts)

| Nivel | Requisitos | Impacto |
|-------|------------|---------|
| **Nivel 1** | Procedencia del build documentada | Trazabilidad basica |
| **Nivel 2** | Build en plataforma verificable, firmado | Resistencia a compromisos internos |
| **Nivel 3** | Build reproducible, infraestructura reforzada | Resistencia a compromisos de la plataforma |

### SBOM (Software Bill of Materials)

```
Generar automaticamente en cada build:
- Formato SPDX 3 o CycloneDX
- Listar todas las dependencias directas y transitivas
- Incluir versiones, licencias, CVEs conocidos
- Publicar en el registro de artefactos

Herramientas: syft, cdxgen, trivy --format cyclonedx
```

### Sigstore / cosign

```
Firmar artefactos e imagenes Docker:
cosign sign --key cosign.key ghcr.io/org/image:tag
cosign verify --key cosign.pub ghcr.io/org/image:tag

Keyless signing (recomendado en CI/CD):
cosign sign --identity-token=$(cat $ACTIONS_ID_TOKEN_REQUEST_TOKEN) \
  ghcr.io/org/image:tag
```

### Checklist Supply Chain

- [ ] SBOM generado automaticamente (SPDX 3 o CycloneDX)
- [ ] Artefactos firmados con Sigstore/cosign
- [ ] Procedencia SLSA 1+ documentada
- [ ] Dependencias con versiones fijadas (hash o version exacta)
- [ ] Escaneo CVE automatizado (Trivy, Grype) en cada build
- [ ] Dependabot / Renovate configurado
- [ ] Revision de dependencias antes del merge

---

## Logging y monitoring

### Eventos a loguear

```
✅ A LOGUEAR:
- Intentos de conexion (exito/fallo)
- Cambios de permisos
- Acceso a datos sensibles
- Errores de autorizacion
- Modificaciones de configuracion
- Exportaciones de datos

❌ NO LOGUEAR:
- Contrasenas
- Tokens
- Datos personales completos
- Numeros de tarjeta bancaria
- Stack traces completos en prod
```

### Formato de log

```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "level": "WARN",
  "event": "login_failed",
  "user_id": "user_123",
  "ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "details": {
    "reason": "invalid_password",
    "attempts": 3
  }
}
```

### Alertas

```
Alertas criticas:
- 5+ fallos de login en la misma cuenta
- Acceso admin desde nueva IP
- Modificacion de permisos
- Errores 500 en serie
- Volumen anormal de peticiones
```

---

## Seguridad MCP & Plugins

### Riesgos de servidores MCP de terceros

> **Alerta:** Investigaciones de seguridad (Snyk, 2026) identificaron 76 payloads maliciosos en registros publicos de servidores MCP. Los servidores MCP de terceros no verificados representan un riesgo significativo.

```
RIESGOS:
- Inyeccion de comandos via parametros MCP
- Exfiltracion de datos (archivos, secretos, contexto)
- Ejecucion de codigo arbitrario en la maquina host
- Escalada de privilegios via herramientas expuestas

PROTECCION:
- Preferir escribir propios servidores MCP
- Auditar el codigo fuente antes de instalar un servidor de terceros
- Limitar permisos (allowlist de herramientas)
- Usar hook PreToolUse para bloquear patrones peligrosos
```

### Checklist de verificacion MCP/Plugin

Antes de instalar un servidor MCP de terceros:

- [ ] Codigo fuente disponible y auditable
- [ ] Autor/organizacion verificada
- [ ] Sin acceso de red no justificado
- [ ] Sin lectura de archivos sensibles (.env, secretos)
- [ ] Permisos minimos (principio de menor privilegio)
- [ ] Version fijada (no `latest`)
- [ ] Changelog e historial de seguridad

### Hook PreToolUse para seguridad

> **Buena práctica:** Los hooks reciben el input de la herramienta como JSON en **stdin** — usar siempre `jq -r '.tool_input.<campo>'` (no `echo '$TOOL_INPUT'`) para leer valores de forma segura y evitar inyección shell.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(jq -r '.tool_input.command // empty'); echo \"$INPUT\" | grep -qE '(curl|wget).*\\.(sh|py|rb)' && echo 'BLOCKED: suspicious download' >&2 && exit 1 || exit 0"
          }
        ]
      }
    ]
  }
}
```

### CLAUDE.md vs Hooks

| Mecanismo | Fuerza | Uso |
|-----------|--------|-----|
| **CLAUDE.md** | Sugerencia | Directrices, convenciones |
| **Rules** | Sugerencia fuerte | Reglas detalladas |
| **Hooks** | Aplicacion | Bloqueo efectivo, validacion automatica |

> **Regla:** CLAUDE.md = sugerencias. Hooks = requisitos.
> Para las restricciones de seguridad criticas, usar hooks, no instrucciones textuales.

---

## Checklist

### Desarrollo

- [ ] Validacion de entradas del lado del servidor
- [ ] Consultas parametrizadas (sin concatenacion SQL)
- [ ] Escape de outputs (prevencion XSS)
- [ ] Contrasenas hasheadas con **Argon2id** (128 MiB, t=3-5, p=1)
- [ ] Sesiones seguras (httpOnly, secure, sameSite)
- [ ] Verificacion de permisos en cada peticion
- [ ] Secretos en variables de entorno o Vault
- [ ] Dependencias auditadas (escaneo CVE)
- [ ] JWT con EdDSA o ES256 (nunca HS256)
- [ ] DPoP (RFC 9449) para tokens sensibles

### Configuracion

- [ ] HTTPS activado (TLS 1.3)
- [ ] Headers de seguridad 2026 (CSP L3, HSTS, COOP, COEP, CORP, Permissions-Policy)
- [ ] Mensajes de error genericos en prod
- [ ] Modo debug desactivado en prod
- [ ] Rate limiting activado
- [ ] CORS configurado estrictamente

### Supply Chain

- [ ] SBOM generado (SPDX 3 o CycloneDX)
- [ ] Artefactos firmados (Sigstore/cosign)
- [ ] Procedencia SLSA 1+ documentada
- [ ] Dependencias fijadas en version exacta

### Monitoring

- [ ] Logging de eventos de seguridad
- [ ] Alertas sobre anomalias
- [ ] Auditoria regular de accesos
- [ ] Escaneo de vulnerabilidades periodico

### Compliance (si aplica)

- [ ] RGPD: Consentimiento, derecho al olvido
- [ ] PCI-DSS: Datos de pago
- [ ] HIPAA: Datos de salud
- [ ] SOC2: Controles de seguridad

---

## Recursos

- **OWASP Top 10:2025:** [owasp.org/Top10/2025/](https://owasp.org/Top10/2025/)
- **OWASP Cheat Sheets:** [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/)
- **CWE Top 25:** [cwe.mitre.org/top25](https://cwe.mitre.org/top25/)
- **NIST Guidelines:** [nist.gov](https://www.nist.gov/cyberframework)
- **Argon2id 2026:** [Guia completa](https://guptadeepak.com/the-complete-guide-to-password-hashing-argon2-vs-bcrypt-vs-scrypt-vs-pbkdf2-2026/)
- **RFC 9449 DPoP:** [datatracker.ietf.org](https://datatracker.ietf.org/doc/html/rfc9449)
- **JWT Best Practices 2026:** [duendesoftware.com](https://duendesoftware.com/learn/best-practices-using-jwts-with-web-and-mobile-apps)
- **HTTP Security Headers 2026:** [thibautprobst.fr](https://thibautprobst.fr/en/posts/http-security-headers/)
- **Supply Chain 2026:** [kawaldeepsingh.medium.com](https://kawaldeepsingh.medium.com/practical-software-supply-chain-security-2026-sboms-signing-slsa-reproducible-builds-a-0416cfac32dc)

---

**Ultima actualizacion:** 2026-06
**Version:** 1.2.0
**Autor:** The Bearded CTO

# Seguridad

## Vision general

La seguridad es una **prioridad absoluta**. Este documento presenta los principios generales de seguridad aplicables a todo proyecto.

> **Nota:** Consulta las reglas especificas de tu tecnologia para las implementaciones concretas.

**Referencias:**
- OWASP Top 10
- CWE/SANS Top 25

---

## Tabla de contenidos

1. [OWASP Top 10](#owasp-top-10)
2. [Validacion de entradas](#validacion-de-entradas)
3. [Autenticacion](#autenticacion)
4. [Autorizacion](#autorizacion)
5. [Datos sensibles](#datos-sensibles)
6. [Headers de seguridad](#headers-de-seguridad)
7. [Logging y monitoring](#logging-y-monitoring)
8. [Checklist](#checklist)

---

## OWASP Top 10

### 1. Broken Access Control

```
❌ RIESGO
- Acceso a recursos sin verificacion
- URLs predecibles (/admin, /user/123/edit)
- Manipulacion de IDs en las URLs

✅ PROTECCION
- Verificar los permisos en CADA peticion
- Usar identificadores no predecibles (UUID)
- Deny by default
```

### 2. Cryptographic Failures

```
❌ RIESGO
- Datos sensibles en texto plano
- Algoritmos obsoletos (MD5, SHA1)
- Claves en el codigo fuente

✅ PROTECCION
- Cifrar los datos sensibles en reposo
- Usar TLS 1.3 en transito
- Algoritmos modernos (bcrypt, Argon2, AES-256)
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

### 6. Vulnerable Components

```
❌ RIESGO
- Dependencias con vulnerabilidades conocidas
- Componentes obsoletos
- Sin seguimiento de CVE

✅ PROTECCION
- Auditoria regular de dependencias
- Actualizacion automatica (Dependabot)
- SBOM (Software Bill of Materials)
```

### 7. Authentication Failures

```
❌ RIESGO
- Contrasenas debiles autorizadas
- Sin MFA
- Sesiones que no expiran
- Credential stuffing posible

✅ PROTECCION
- Politica de contrasenas fuertes
- MFA para accesos sensibles
- Expiracion de sesiones
- Rate limiting en login
- Deteccion de fuerza bruta
```

### 8. Data Integrity Failures

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

### 10. SSRF (Server-Side Request Forgery)

```
❌ RIESGO
- URLs proporcionadas por el usuario no validadas
- Acceso a recursos internos

✅ PROTECCION
- Whitelist de destinos autorizados
- Validacion estricta de URLs
- Sin acceso a red interna desde los inputs
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
Reglas:
- Minimo 12 caracteres
- Mayusculas, minusculas, numeros, especiales
- No estar en listas de contrasenas comprometidas
- Hash con bcrypt/Argon2 (NUNCA MD5/SHA1)
- Salt unico por usuario

// ✅ BUENO
hash = bcrypt.hash(password, costFactor=12)

// ❌ MALO
hash = md5(password)
hash = sha1(password + "static_salt")
```

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
Reglas:
- Algoritmo: RS256 o ES256 (no HS256 con secreto debil)
- Expiracion corta (15 min)
- Refresh token largo (7 dias) almacenado de forma segura
- Verificar firma y claims
- No almacenar datos sensibles en el payload

// ❌ MALO
jwt.sign(payload, "secret123", { algorithm: "HS256" })

// ✅ BUENO
jwt.sign(payload, privateKey, {
  algorithm: "RS256",
  expiresIn: "15m"
})
```

### Multi-Factor Authentication (MFA)

```
Cuando activar MFA:
- Acceso admin
- Operaciones sensibles (pago, eliminacion)
- Cambio de contrasena
- Conexion desde nuevo dispositivo

Metodos:
- TOTP (Google Authenticator)
- SMS (menos seguro)
- Hardware keys (FIDO2)
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
| **Secreto** | Contrasenas, claves | Vault, hash |

### Almacenamiento

```
Contrasenas:
  → Hash con bcrypt/Argon2
  → NUNCA en texto plano

Datos personales (RGPD):
  → Cifrado en reposo
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

### Headers recomendados

```http
# Proteccion XSS
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block

# Proteccion clickjacking
X-Frame-Options: DENY

# HTTPS
Strict-Transport-Security: max-age=31536000; includeSubDomains

# Referrer
Referrer-Policy: strict-origin-when-cross-origin

# Permisos
Permissions-Policy: geolocation=(), camera=()
```

### Content-Security-Policy (CSP)

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
```

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

## Checklist

### Desarrollo

- [ ] Validacion de entradas del lado del servidor
- [ ] Consultas parametrizadas (sin concatenacion SQL)
- [ ] Escape de outputs (prevencion XSS)
- [ ] Contrasenas hasheadas (bcrypt/Argon2)
- [ ] Sesiones seguras (httpOnly, secure, sameSite)
- [ ] Verificacion de permisos en cada peticion
- [ ] Secretos en variables de entorno
- [ ] Dependencias auditadas

### Configuracion

- [ ] HTTPS activado (TLS 1.3)
- [ ] Headers de seguridad configurados
- [ ] Mensajes de error genericos en prod
- [ ] Modo debug desactivado en prod
- [ ] Rate limiting activado
- [ ] CORS configurado estrictamente

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

- **OWASP Top 10:** [owasp.org/Top10](https://owasp.org/Top10/)
- **OWASP Cheat Sheets:** [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/)
- **CWE Top 25:** [cwe.mitre.org/top25](https://cwe.mitre.org/top25/)
- **NIST Guidelines:** [nist.gov](https://www.nist.gov/cyberframework)

---

**Fecha de ultima actualizacion:** 2025-01
**Version:** 1.0.0
**Autor:** The Bearded CTO

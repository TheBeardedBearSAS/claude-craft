# Checklist de Revisión de Seguridad

## OWASP Top 10 (2021)

### A01:2021 - Broken Access Control

- [ ] Verificación de autorización en cada endpoint
- [ ] Sin acceso directo a objetos por ID sin verificación
- [ ] CORS configurado correctamente
- [ ] Tokens JWT validados del lado del servidor
- [ ] Principio de menor privilegio aplicado
- [ ] Sin posibilidad de escalada de privilegios

### A02:2021 - Cryptographic Failures

- [ ] Datos sensibles cifrados en reposo
- [ ] Datos sensibles cifrados en tránsito (HTTPS)
- [ ] Algoritmos de cifrado actualizados (no MD5, SHA1)
- [ ] Claves de cifrado almacenadas de forma segura
- [ ] Contraseñas hasheadas con bcrypt/argon2
- [ ] Sin secrets en código fuente

### A03:2021 - Injection

- [ ] Consultas SQL parametrizadas (prepared statements)
- [ ] Validación y sanitización de entrada
- [ ] Escape de salida (XSS)
- [ ] Sin evaluación de código dinámico
- [ ] Inyección LDAP/XML/OS verificada
- [ ] Encabezados HTTP sanitizados

### A04:2021 - Insecure Design

- [ ] Threat modeling realizado
- [ ] Rate limiting implementado
- [ ] Límites de recursos definidos
- [ ] Fail securely (sin datos expuestos en error)
- [ ] Defensa en profundidad aplicada

### A05:2021 - Security Misconfiguration

- [ ] Encabezados de seguridad configurados (CSP, HSTS, X-Frame-Options)
- [ ] Modo debug deshabilitado en producción
- [ ] Errores genéricos en producción (sin stack traces)
- [ ] Permisos de archivo restrictivos
- [ ] Servicios no utilizados deshabilitados
- [ ] Versiones de dependencias actualizadas

### A06:2021 - Vulnerable Components

- [ ] Auditoría de dependencias realizada (npm audit, safety check)
- [ ] Sin vulnerabilidades críticas conocidas
- [ ] Dependencias actualizadas
- [ ] Fuentes de paquetes verificadas
- [ ] Lockfile presente y actualizado

### A07:2021 - Authentication Failures

- [ ] Política de contraseñas robusta (12+ caracteres, complejidad)
- [ ] Protección contra fuerza bruta
- [ ] MFA disponible/obligatorio para admins
- [ ] Sesión invalidada después de logout
- [ ] Tokens con expiración razonable
- [ ] Sin credenciales por defecto

### A08:2021 - Software and Data Integrity Failures

- [ ] Integridad del pipeline CI/CD verificada
- [ ] Firmas de paquetes verificadas
- [ ] Sin deserialización insegura
- [ ] SRI (Subresource Integrity) para CDNs
- [ ] Actualizaciones automáticas seguras

### A09:2021 - Security Logging Failures

- [ ] Eventos de seguridad logueados (login, fallos, accesos)
- [ ] Logs protegidos contra modificación
- [ ] Sin datos sensibles en logs
- [ ] Alertas en eventos sospechosos
- [ ] Retención de logs conforme

### A10:2021 - Server-Side Request Forgery (SSRF)

- [ ] URLs validadas del lado del servidor
- [ ] Whitelist de dominios permitidos
- [ ] Sin acceso a metadata de cloud
- [ ] Resolución DNS controlada

---

## Checklist por Componente

### API / Backend

- [ ] Autenticación en todos los endpoints sensibles
- [ ] Autorización verificada (RBAC/ABAC)
- [ ] Validación estricta de entrada
- [ ] Codificación de salida
- [ ] Rate limiting por IP/usuario
- [ ] Timeouts configurados
- [ ] CORS restrictivo

### Base de Datos

- [ ] Acceso con cuenta de privilegio limitado
- [ ] Sin acceso directo desde internet
- [ ] Cifrado de datos sensibles
- [ ] Backups cifrados
- [ ] Auditoría de acceso habilitada

### Frontend

- [ ] Content Security Policy (CSP)
- [ ] Sanitización de datos mostrados
- [ ] Sin secrets en código JS
- [ ] HTTPS forzado
- [ ] Cookies seguras (HttpOnly, Secure, SameSite)

### Móvil

- [ ] Certificate pinning
- [ ] Almacenamiento seguro (Keychain/Keystore)
- [ ] Sin datos sensibles en texto plano
- [ ] Anti-tampering
- [ ] Ofuscación de código

### Infraestructura

- [ ] Firewall configurado
- [ ] VPC/red aislada
- [ ] Secrets en vault (no en env vars)
- [ ] Logs centralizados
- [ ] Monitoreo de seguridad

---

## Tests de Seguridad

### Tests Automatizados

- [ ] SAST (análisis estático) pasado
- [ ] DAST (análisis dinámico) pasado
- [ ] Escaneo de dependencias pasado
- [ ] Escaneo de contenedores pasado (si aplica)

### Tests Manuales

- [ ] Test de penetración (si cambio mayor)
- [ ] Revisión de código de seguridad
- [ ] Testing de escenarios de ataque comunes

---

## Documentación de Seguridad

- [ ] Política de seguridad documentada
- [ ] Proceso de respuesta a incidentes
- [ ] Contacto de seguridad definido
- [ ] Política de divulgación responsable

---

## Decisión

- [ ] ✅ **Aprobado** - Sin problemas de seguridad
- [ ] ⚠️ **Preocupaciones** - Puntos a verificar/mejorar
- [ ] ❌ **Bloqueado** - Vulnerabilidades críticas a corregir

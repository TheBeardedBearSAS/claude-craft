---
description: Auditar Seguridad de Paperclip
argument-hint: [ruta-proyecto]
---

# Auditar Seguridad de Paperclip

## MISIÓN

Revisar aislamiento de tenencia, manejo de secretos, compuertas de aprobación, aplicación de presupuestos, canal de adaptador, headers HTTP y cadena de suministro.

## Procedimiento

### 1. Aislamiento de tenant

- [ ] Ningún endpoint recibe `companyId` desde el body / query string del cliente — siempre deriva de la sesión autenticada
- [ ] Cada consulta de repositorio filtra por `companyId`
- [ ] Existe un test de integración de aislamiento cross-tenant por módulo
- [ ] Log de auditoría captura intentos cross-tenant rechazados

Grep para patrones sospechosos: `req.body.companyId`, `req.query.companyId`, `WHERE company_id = $1` sin verificación de proveniencia.

### 2. Secretos

- [ ] Columna de tabla `secrets` usa cifrado autenticado (AES-256-GCM) con clave maestra derivada de KMS o env
- [ ] Secretos entregados a adaptadores en tiempo de invocación, no al arranque
- [ ] Ningún valor de secreto aparece en ningún mensaje de log (escaneo regex de muestras de log almacenadas)
- [ ] `.env` no en git; `.env.example` sí lo está
- [ ] Procedimiento de rotación de clave de cifrado de secretos documentado (específico por ambiente, nunca reutilizado)

### 3. Compuertas de aprobación

- [ ] Decisiones de aprobación viven en tabla `approvals`, solo-agregar (verificar con trigger DB o migración)
- [ ] Ningún path de código permite a un adaptador ejecutar una acción con `requires_approval` antes de que el control plane devuelva `approved`
- [ ] Sin auto-aprobación (el agente solicitante no puede ser el aprobador)

### 4. Presupuestos (límites duros)

- [ ] Existe un test que verifica que `BUDGET_EXCEEDED` es devuelto cuando un agente excede su presupuesto
- [ ] Ningún path de código incrementa consumo pasado `budgetTokens` silenciosamente
- [ ] Cambios de presupuesto emiten eventos de actividad

### 5. Sandbox de plugin y límites de adaptador

- [ ] Cada plugin instalado declara solo las capacidades que realmente necesita (revisar el manifiesto contra su código)
- [ ] Llamadas `ctx.http` pasan por el cliente controlado por host (sin `fetch` / `axios` raw contrabandea do)
- [ ] Valores de config de plugin vienen de `ctx.config.get()`; sin lecturas de `process.env` en runtime
- [ ] Adaptadores no contienen lógica de gobernanza — solo spawn + supervisar
- [ ] Endpoints públicos corren detrás de TLS 1.3 (terminar en reverse proxy si es necesario)

### 6. Headers HTTP (respuestas web UI)

Verificar headers enviados:
- `Content-Security-Policy` (sin `unsafe-inline` para scripts)
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `Permissions-Policy` presente

### 7. Autenticación

- [ ] Contraseñas hasheadas con Argon2id (128 MiB RAM, t=3, p=1)
- [ ] Cookies de sesión `HttpOnly`, `Secure`, `SameSite=Strict`
- [ ] JWT (si se usa) — EdDSA / Ed25519, expiración 15 minutos, DPoP en endpoints sensibles

### 8. Cadena de suministro

- [ ] `pnpm audit --audit-level=high` limpio
- [ ] `packageManager` fijado en `package.json`
- [ ] `pnpm.onlyBuiltDependencies` allowlist presente
- [ ] Releases de Adapter SDK firmados con Sigstore (verificar con `cosign`)

### 9. Respuesta a incidentes

- [ ] Kill switch de toda la compañía testeado
- [ ] Revocación de adaptador invalida firmas inmediatamente
- [ ] Exportación de auditoría por compañía disponible (JSON + manifiesto firmado)

## Output

Reporte Markdown con pasa/falla por sección, severidad (Blocker / Major / Minor), referencias CVE donde sea relevante, y un puntaje /20 para `/paperclip:check-compliance`.

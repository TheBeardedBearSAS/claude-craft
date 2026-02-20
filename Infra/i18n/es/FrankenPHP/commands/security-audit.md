---
description: Audit FrankenPHP security posture
argument-hint: [scope]
---

# FrankenPHP Security Audit

Eres un especialista en seguridad de FrankenPHP. Debes realizar una auditoria de seguridad completa del despliegue de FrankenPHP.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Scope: tls, headers, caddyfile, container, php, admin, full (default: full)

Example: `/frankenphp:security-audit scope:full`

## Plan Mode

> **Plan mode es condicional.** Se activa automaticamente cuando el scope es "full" para presentar el plan de auditoria antes de proceder.

## MISION

### Paso 1: Definicion de Alcance

```
══════════════════════════════════════════════════════════════
AUDITORIA DE SEGURIDAD FRANKENPHP
══════════════════════════════════════════════════════════════

Alcance: {tls, headers, caddyfile, container, php, admin, full}

──────────────────────────────────────────────────────────────
ALCANCE DE AUDITORIA
──────────────────────────────────────────────────────────────

| Categoria | Incluida | Peso |
|-----------|----------|------|
| Configuracion TLS | {si/no} | 25% |
| Headers de Seguridad | {si/no} | 20% |
| Hardening de Caddyfile | {si/no} | 20% |
| Seguridad de Contenedor | {si/no} | 15% |
| Hardening PHP | {si/no} | 10% |
| Admin API | {si/no} | 10% |
```

### Paso 2: Auditoria TLS

```
──────────────────────────────────────────────────────────────
CONFIGURACION TLS
──────────────────────────────────────────────────────────────

| Verificacion | Estado | Detalles |
|-------------|--------|----------|
| Auto-HTTPS habilitado | {si/no/proxy} | {configuracion} |
| Version de protocolo TLS | {1.3/1.2} | {recomendacion} |
| Header HSTS | {establecido/faltante} | {max-age, preload} |
| Validez del certificado | {valido/expirando/expirado} | {dias restantes} |
| HTTP/3 habilitado | {si/no} | {estado UDP 443} |
| Soporte ECH | {si/no} | {funcionalidad v1.6+} |
| Soporte PQC | {si/no} | {funcionalidad v1.6+} |
```

### Paso 3: Auditoria de Headers de Seguridad

```
──────────────────────────────────────────────────────────────
HEADERS DE SEGURIDAD
──────────────────────────────────────────────────────────────

| Header | Estado | Valor |
|--------|--------|-------|
| Strict-Transport-Security | {establecido/faltante} | {valor} |
| X-Content-Type-Options | {establecido/faltante} | {valor} |
| X-Frame-Options | {establecido/faltante} | {valor} |
| Content-Security-Policy | {establecido/faltante} | {valor} |
| Referrer-Policy | {establecido/faltante} | {valor} |
| Permissions-Policy | {establecido/faltante} | {valor} |
| Header Server eliminado | {si/no} | {valor} |
```

### Paso 4: Auditoria de Caddyfile

```
──────────────────────────────────────────────────────────────
HARDENING DE CADDYFILE
──────────────────────────────────────────────────────────────

| Verificacion | Estado | Detalles |
|-------------|--------|----------|
| Rate limiting configurado | {si/no} | {limites} |
| Filtrado de IP (si necesario) | {si/no} | {reglas} |
| Endpoints de debug deshabilitados | {si/no} | {rutas} |
| Paginas de error personalizadas | {si/no} | {sin fuga de info} |
| Secretos via env vars | {si/no} | {no hardcodeados} |
```

### Paso 5: Auditoria de Contenedor

```
──────────────────────────────────────────────────────────────
SEGURIDAD DE CONTENEDOR
──────────────────────────────────────────────────────────────

| Verificacion | Estado | Detalles |
|-------------|--------|----------|
| Usuario non-root | {si/no} | {usuario} |
| Capabilities minimas | {si/no} | {capabilities} |
| Filesystem read-only | {si/no} | {rutas escribibles} |
| Sin secretos en capas | {si/no} | {evaluacion} |
| Escaneo de vulnerabilidades de imagen | {pasa/falla} | {conteo CVE} |
```

### Paso 6: Auditoria PHP

```
──────────────────────────────────────────────────────────────
SEGURIDAD PHP
──────────────────────────────────────────────────────────────

| Verificacion | Estado | Detalles |
|-------------|--------|----------|
| disable_functions | {establecido/vacio} | {funciones} |
| open_basedir | {establecido/vacio} | {rutas} |
| expose_php | {off/on} | {recomendacion} |
| Cookies de sesion seguras | {si/no} | {httpOnly, secure, sameSite} |
| allow_url_include | {off/on} | {recomendacion} |
```

### Paso 7: Informe Final

```
══════════════════════════════════════════════════════════════
INFORME DE AUDITORIA DE SEGURIDAD
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
PUNTUACION
──────────────────────────────────────────────────────────────

| Categoria | Puntuacion | Estado |
|-----------|-----------|--------|
| Configuracion TLS | {x}/100 | {pasa/advertencia/falla} |
| Headers de Seguridad | {x}/100 | {pasa/advertencia/falla} |
| Hardening de Caddyfile | {x}/100 | {pasa/advertencia/falla} |
| Seguridad de Contenedor | {x}/100 | {pasa/advertencia/falla} |
| Hardening PHP | {x}/100 | {pasa/advertencia/falla} |
| Admin API | {x}/100 | {pasa/advertencia/falla} |
| **General** | **{x}/100** | **{estado}** |

──────────────────────────────────────────────────────────────
HALLAZGOS CRITICOS
──────────────────────────────────────────────────────────────

1. [ ] {hallazgo critico 1}
2. [ ] {hallazgo critico 2}

──────────────────────────────────────────────────────────────
RECOMENDACIONES
──────────────────────────────────────────────────────────────

Prioridad 1 (Inmediata):
- [ ] {recomendacion}

Prioridad 2 (Este sprint):
- [ ] {recomendacion}

Prioridad 3 (Proximo trimestre):
- [ ] {recomendacion}
```

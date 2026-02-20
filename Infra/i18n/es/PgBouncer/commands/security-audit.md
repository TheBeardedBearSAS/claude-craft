---
description: Audit PgBouncer security posture
argument-hint: [scope]
---

# PgBouncer Security Audit

Eres un especialista en seguridad de PgBouncer. Debes realizar una auditoria de seguridad completa del despliegue de PgBouncer.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Scope: auth, tls, access, admin, network, full (default: full)

Example: `/pgbouncer:security-audit scope:full`

## Plan Mode

> **Plan mode es condicional.** Se activa automaticamente cuando el alcance es "full" para presentar el plan de auditoria antes de proceder.

## MISION

### Paso 1: Definicion de Alcance

```
══════════════════════════════════════════════════════════════
AUDITORIA DE SEGURIDAD PGBOUNCER
══════════════════════════════════════════════════════════════

Alcance: {auth, tls, access, admin, network, full}

──────────────────────────────────────────────────────────────
ALCANCE DE LA AUDITORIA
──────────────────────────────────────────────────────────────

| Categoria | Incluida | Peso |
|-----------|----------|------|
| Autenticacion | {si/no} | 25% |
| Cifrado TLS | {si/no} | 25% |
| Control de Acceso | {si/no} | 20% |
| Seguridad Admin | {si/no} | 15% |
| Seguridad de Red | {si/no} | 15% |
```

### Paso 2: Auditoria de Autenticacion

```
──────────────────────────────────────────────────────────────
AUTENTICACION
──────────────────────────────────────────────────────────────

| Verificacion | Estado | Detalles |
|-------------|--------|----------|
| auth_type | {scram/md5/trust} | {recomendacion} |
| Permisos auth_file | {0600/otro} | {propietario} |
| auth_query utilizado | {si/no} | {nombre de funcion} |
| auth_hba_file | {si/no} | {conteo de reglas} |
| Fortaleza de contrasenas | {fuerte/debil} | {politica} |
| Rotacion de credenciales | {programada/ninguna} | {frecuencia} |
```

### Paso 3: Auditoria TLS

```
──────────────────────────────────────────────────────────────
CIFRADO TLS
──────────────────────────────────────────────────────────────

| Verificacion | Estado | Detalles |
|-------------|--------|----------|
| Modo TLS cliente | {require/prefer/disable} | {ajuste} |
| Modo TLS servidor | {verify-full/require/disable} | {ajuste} |
| Version protocolo TLS | {1.3/1.2/1.1} | {recomendacion} |
| Validez del certificado | {valido/por expirar/expirado} | {dias restantes} |
| Permisos archivo de clave | {0600/otro} | {propietario} |
| Fortaleza de cifrado | {HIGH/MEDIUM/LOW} | {lista de ciphers} |
```

### Paso 4: Auditoria de Control de Acceso

```
──────────────────────────────────────────────────────────────
CONTROL DE ACCESO
──────────────────────────────────────────────────────────────

| Verificacion | Estado | Detalles |
|-------------|--------|----------|
| auth_hba_file configurado | {si/no} | {ruta} |
| Restricciones basadas en IP | {si/no} | {reglas} |
| Limites de conexion por usuario | {si/no} | {max_user_connections} |
| Limites de conexion por base de datos | {si/no} | {max_db_connections} |
| Acceso wildcard a base de datos | {restringido/abierto} | {configuracion} |
```

### Paso 5: Auditoria de Seguridad Admin

```
──────────────────────────────────────────────────────────────
SEGURIDAD ADMIN
──────────────────────────────────────────────────────────────

| Verificacion | Estado | Detalles |
|-------------|--------|----------|
| admin_users restringido | {si/no} | {usuarios} |
| stats_users restringido | {si/no} | {usuarios} |
| Admin solo en localhost | {si/no} | {listen_addr} |
| Fortaleza contrasena admin | {fuerte/debil} | {evaluacion} |
| Log de conexiones habilitado | {si/no} | {ajuste} |
```

### Paso 6: Auditoria de Seguridad de Red

```
──────────────────────────────────────────────────────────────
SEGURIDAD DE RED
──────────────────────────────────────────────────────────────

| Verificacion | Estado | Detalles |
|-------------|--------|----------|
| listen_addr restringido | {si/no} | {interfaces} |
| Firewall en puerto 6432 | {si/no} | {reglas} |
| Unix socket disponible | {si/no} | {permisos} |
| Proceso ejecuta como no-root | {si/no} | {usuario} |
| Permisos archivo de configuracion | {0600/otro} | {propietario} |
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
| Autenticacion | {x}/100 | {aprobado/advertencia/fallo} |
| Cifrado TLS | {x}/100 | {aprobado/advertencia/fallo} |
| Control de Acceso | {x}/100 | {aprobado/advertencia/fallo} |
| Seguridad Admin | {x}/100 | {aprobado/advertencia/fallo} |
| Seguridad de Red | {x}/100 | {aprobado/advertencia/fallo} |
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

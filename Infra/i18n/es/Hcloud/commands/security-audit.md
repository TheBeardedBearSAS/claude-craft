---
description: Audit Hetzner Cloud security posture
argument-hint: [scope]
---

# Hcloud Security Audit

Eres un especialista en seguridad de Hetzner Cloud. Debes realizar una auditoría de seguridad completa de la infraestructura de Hetzner Cloud.

## Arguments
$ARGUMENTS

Argumentos:
- (Opcional) Alcance: firewall, ssh, network, tokens, certificates, full (por defecto: full)

Ejemplo: `/hcloud:security-audit scope:full`

## Plan Mode

> **El modo plan es condicional.** Se activa automáticamente cuando el alcance es "full" para presentar el plan de auditoría antes de proceder.

## MISIÓN

### Paso 1: Definición de Alcance

```
══════════════════════════════════════════════════════════════
AUDITORÍA DE SEGURIDAD HCLOUD
══════════════════════════════════════════════════════════════

Alcance: {firewall, ssh, network, tokens, certificates, full}

──────────────────────────────────────────────────────────────
ALCANCE DE LA AUDITORÍA
──────────────────────────────────────────────────────────────

| Categoría | Incluida | Peso |
|-----------|----------|------|
| Firewalls | {sí/no} | 25% |
| SSH y Acceso | {sí/no} | 20% |
| Aislamiento de Red | {sí/no} | 20% |
| Tokens API | {sí/no} | 20% |
| TLS y Certificados | {sí/no} | 15% |
```

### Paso 2: Auditoría de Firewalls

```
──────────────────────────────────────────────────────────────
ANÁLISIS DE FIREWALLS
──────────────────────────────────────────────────────────────

| Verificación | Estado | Detalles |
|-------------|--------|---------|
| Todos los servidores tienen firewalls | {sí/no} | {servidores desprotegidos} |
| SSH restringido a IPs conocidas | {sí/no} | {¿abierto a 0.0.0.0/0?} |
| Puertos de BD solo privados | {sí/no} | {puertos expuestos} |
| Selectores de etiquetas usados | {sí/no} | {estático vs dinámico} |
| Denegar por defecto | {sí/no} | {reglas demasiado permisivas} |
| Reglas IPv6 coinciden con IPv4 | {sí/no} | {reglas faltantes} |
```

Escanear todos los firewalls, verificar servidores sin protección de firewall e identificar reglas demasiado permisivas.

### Paso 3: Auditoría de SSH y Acceso

```
──────────────────────────────────────────────────────────────
SEGURIDAD SSH Y ACCESO
──────────────────────────────────────────────────────────────

| Verificación | Estado | Detalles |
|-------------|--------|---------|
| Algoritmo de clave SSH | {ed25519/rsa} | {recomendación} |
| Autenticación por contraseña deshabilitada | {sí/no} | {verificación cloud-init} |
| fail2ban configurado | {sí/no} | {en qué servidores} |
| Política de login root | {prohibit-password/yes/no} | {configuración} |
| Puerto SSH | {22/personalizado} | {protección de firewall} |
| Rotación de claves | {programada/ninguna} | {última rotación} |
```

### Paso 4: Auditoría de Aislamiento de Red

```
──────────────────────────────────────────────────────────────
AISLAMIENTO DE RED
──────────────────────────────────────────────────────────────

| Verificación | Estado | Detalles |
|-------------|--------|---------|
| Red privada usada | {sí/no} | {nombre de la red} |
| Segmentación de subredes | {sí/no} | {tiers web/app/data} |
| BD sin IP pública | {sí/no} | {bases de datos expuestas} |
| Patrón de host bastión | {sí/no} | {método de acceso} |
| Inter-servicio vía red privada | {sí/no} | {uso de IP pública} |
```

### Paso 5: Auditoría de Tokens API

```
──────────────────────────────────────────────────────────────
SEGURIDAD DE TOKENS API
──────────────────────────────────────────────────────────────

| Verificación | Estado | Detalles |
|-------------|--------|---------|
| Tokens por entorno | {sí/no} | {¿tokens compartidos?} |
| Tokens solo lectura para CI | {sí/no} | {alcance} |
| Token en secretos de CI | {sí/no} | {método de almacenamiento} |
| Calendario de rotación de tokens | {sí/no} | {frecuencia} |
| Sin tokens en el código | {sí/no} | {tokens filtrados} |
```

### Paso 6: Auditoría de TLS y Certificados

```
──────────────────────────────────────────────────────────────
TLS Y CERTIFICADOS
──────────────────────────────────────────────────────────────

| Verificación | Estado | Detalles |
|-------------|--------|---------|
| TLS en el balanceador de carga | {sí/no} | {protocolo} |
| Certificados gestionados | {sí/no} | {auto-renovación} |
| Redirección HTTP a HTTPS | {sí/no} | {configurado} |
| Expiración de certificado | {ok/advertencia} | {días restantes} |
| Tráfico interno cifrado | {sí/no/red-privada} | {método} |
```

### Paso 7: Informe Final

```
══════════════════════════════════════════════════════════════
INFORME DE AUDITORÍA DE SEGURIDAD
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
PUNTUACIÓN
──────────────────────────────────────────────────────────────

| Categoría | Puntuación | Estado |
|-----------|-----------|--------|
| Firewalls | {x}/100 | {aprobado/advertencia/fallo} |
| SSH y Acceso | {x}/100 | {aprobado/advertencia/fallo} |
| Aislamiento de Red | {x}/100 | {aprobado/advertencia/fallo} |
| Tokens API | {x}/100 | {aprobado/advertencia/fallo} |
| TLS y Certificados | {x}/100 | {aprobado/advertencia/fallo} |
| **General** | **{x}/100** | **{estado}** |

──────────────────────────────────────────────────────────────
HALLAZGOS CRÍTICOS
──────────────────────────────────────────────────────────────

1. [ ] {hallazgo crítico 1}
2. [ ] {hallazgo crítico 2}

──────────────────────────────────────────────────────────────
RECOMENDACIONES
──────────────────────────────────────────────────────────────

Prioridad 1 (Inmediato):
- [ ] {recomendación}

Prioridad 2 (Este sprint):
- [ ] {recomendación}

Prioridad 3 (Próximo trimestre):
- [ ] {recomendación}
```

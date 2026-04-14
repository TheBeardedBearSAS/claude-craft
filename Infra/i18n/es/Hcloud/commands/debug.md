---
description: Diagnose Hetzner Cloud infrastructure issues from symptoms
argument-hint: <Symptom> [resource]
---

# Hcloud Debug

> ⚠️ **Migración obligatoria antes de 2026-07-01**: el parámetro `datacenter` está deprecado en favor de `location`. Proveedor Terraform de Hetzner Cloud >= 1.58.0. Fuente: https://github.com/hetznercloud/terraform-provider-hcloud/releases

Eres un especialista en resolución de problemas de Hetzner Cloud. Debes diagnosticar y resolver sistemáticamente problemas de infraestructura a partir de los síntomas proporcionados.

## Arguments
$ARGUMENTS

Argumentos:
- Descripción del síntoma (p. ej., "servidor inaccesible", "health check del balanceador de carga fallando", "volumen no se monta")
- (Opcional) Nombre o tipo de recurso
- (Opcional) Datacenter o ubicación

Ejemplo: `/hcloud:debug "Conexión SSH rechazada en web-01" resource:server`

## Plan Mode

> **El modo plan no es requerido.** Este es un comando de diagnóstico que procede inmediatamente con la investigación.

## MISIÓN

### Paso 1: Recopilar Información

```
══════════════════════════════════════════════════════════════
HCLOUD DEBUG
══════════════════════════════════════════════════════════════

Síntoma: {description}
Recurso: {resource}
Ubicación: {location}

──────────────────────────────────────────────────────────────
ESTADO DEL ENTORNO
──────────────────────────────────────────────────────────────
```

Ejecutar comandos de diagnóstico:
```bash
# Estado del servidor
hcloud server describe {resource}
hcloud server list-actions {resource}

# Estado de la red
hcloud server describe {resource} -o json | jq '.private_net'
hcloud network list

# Estado del firewall
hcloud firewall list
hcloud server describe {resource} -o json | jq '.public_net.firewalls'

# Estado del volumen
hcloud volume list --server {resource}

# Estado del balanceador de carga (si aplica)
hcloud load-balancer list
```

### Paso 2: Análisis de Causa Raíz

```
──────────────────────────────────────────────────────────────
DIAGNÓSTICO
──────────────────────────────────────────────────────────────

| Verificación | Estado | Detalles |
|-------------|--------|---------|
| Estado del servidor | {running/off/rebuilding} | {detalles} |
| IP pública | {asignada/faltante} | {dirección ip} |
| Reglas de firewall | {ok/bloqueando} | {detalles} |
| Red privada | {adjuntada/desadjuntada} | {detalles} |
| Montaje de volumen | {ok/fallo} | {detalles} |
| Cloud-init | {completado/ejecutando/fallido} | {detalles} |
| Clave SSH | {desplegada/faltante} | {detalles} |

──────────────────────────────────────────────────────────────
ÁRBOL DE DECISIÓN
──────────────────────────────────────────────────────────────

Síntoma: {symptom}
  ├── ¿Problema de servidor?
  │   ├── No está ejecutando → Verificar hcloud server describe, encender
  │   ├── Atascado en reconstrucción → Esperar o contactar soporte
  │   └── Cloud-init falló → Habilitar rescate, verificar logs
  ├── ¿Problema de red?
  │   ├── Sin IP pública → Verificar asignación de primary IP
  │   ├── Firewall bloqueando → Revisar reglas con hcloud firewall describe
  │   └── Red privada → Verificar adjunción y subred
  ├── ¿Problema de volumen?
  │   ├── No adjuntado → hcloud volume attach
  │   ├── Fallo de montaje → Verificar sistema de archivos, /dev/disk/by-id/
  │   └── Ubicación incorrecta → El volumen debe estar en la misma location
  └── ¿Problema de balanceador de carga?
      ├── Health check fallo → Verificar puerto, ruta, códigos de estado
      ├── Sin targets → Verificar selector de etiquetas
      └── Error TLS → Verificar certificado

Causa Raíz: {explicación}
```

### Paso 3: Resolución

```
──────────────────────────────────────────────────────────────
CORRECCIÓN
──────────────────────────────────────────────────────────────
```

Proporcionar:
1. **Corrección inmediata** -- Comandos hcloud exactos o cambios de configuración para resolver el problema ahora
2. **Explicación** -- Por qué ocurrió esto, incluyendo especificidades de Hetzner Cloud
3. **Prevención** -- Reglas de firewall, scripts cloud-init o monitoreo para prevenir recurrencia

### Paso 4: Verificación

```bash
# Verificar que el servidor está ejecutando
hcloud server describe {resource}

# Verificar conectividad
ssh root@{server-ip} echo "OK"

# Verificar health checks (si LB)
hcloud load-balancer describe {lb-name} -o json | jq '.targets[].health_status'
```

### Paso 5: Informe Final

```
══════════════════════════════════════════════════════════════
INFORME DE DEPURACIÓN
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUMEN
──────────────────────────────────────────────────────────────

| Elemento | Valor |
|----------|-------|
| Síntoma | {symptom} |
| Causa raíz | {cause} |
| Corrección aplicada | {fix} |
| Estado | Resuelto / Necesita acción |

──────────────────────────────────────────────────────────────
PREVENCIÓN
──────────────────────────────────────────────────────────────

- [ ] Agregar monitoreo para {condición}
- [ ] Actualizar cloud-init para prevenir {problema}
- [ ] Agregar verificación de CI para {validación}
- [ ] Documentar corrección en el runbook para referencia de @hcloud-debug
```

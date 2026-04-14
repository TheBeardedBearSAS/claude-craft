---
description: Design complete Hetzner Cloud infrastructure architecture
argument-hint: <Project> [constraints]
---

# Hcloud Architecture

> ⚠️ **Migración obligatoria antes de 2026-07-01**: el parámetro `datacenter` está deprecado en favor de `location`. Proveedor Terraform de Hetzner Cloud >= 1.58.0. Fuente: https://github.com/hetznercloud/terraform-provider-hcloud/releases

Eres un arquitecto senior de Hetzner Cloud. Debes diseñar una arquitectura completa de infraestructura en la nube a partir de las especificaciones del proyecto.

## Arguments
$ARGUMENTS

Argumentos:
- Descripción del proyecto
- Carga de trabajo objetivo (p. ej., web-application, microservices, database-cluster)
- Restricciones (p. ej., budget, location, compliance)

Ejemplo: `/hcloud:architecture "Plataforma de e-commerce" workload:web-application location:fsn1 budget:100eur`

## Plan Mode

> **Se recomienda el modo plan.** Claude activa el modo plan para estructurar el enfoque, identificar los tipos de servidor y presentar una topología de red antes de generar los comandos de hcloud CLI.

## MISIÓN

### Paso 1: Descubrimiento

```
══════════════════════════════════════════════════════════════
ARQUITECTURA HCLOUD
══════════════════════════════════════════════════════════════

Proyecto: {name}
Descripción: {description}

──────────────────────────────────────────────────────────────
ANÁLISIS DE REQUISITOS
──────────────────────────────────────────────────────────────

### Stack de Aplicación
| Componente | Tecnología | Requisitos |
|------------|------------|------------|
| Servidor Web | {tech} | {necesidades cpu/ram} |
| Aplicación | {tech} | {necesidades cpu/ram} |
| Base de Datos | {tech} | {necesidades storage/iops} |

### Entorno Objetivo
| Atributo | Valor |
|----------|-------|
| Location | {fsn1/nbg1/hel1/ash/hil/sin} |
| Presupuesto | {límite mensual} |
| HA Requerido | {sí/no} |
| Cumplimiento | {GDPR/ninguno} |
```

### Paso 2: Diseño de Arquitectura

```
──────────────────────────────────────────────────────────────
TOPOLOGÍA DE INFRAESTRUCTURA
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                    HETZNER CLOUD                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Load Balancer│  │  Firewalls   │  │ Floating IPs │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│  NETWORK → SERVERS → VOLUMES → SNAPSHOTS                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Private  │  │ CX/CPX/  │  │ Block    │  │ Backup   │   │
│  │ Subnets  │  │ CAX/CCX  │  │ Storage  │  │ Images   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────
SELECCIÓN DE TIPOS DE SERVIDOR
──────────────────────────────────────────────────────────────

| Rol | Tipo de Servidor | Cantidad | Justificación |
|-----|-----------------|----------|---------------|
| Web | {cax21/cx22} | {n} | {razón} |
| App | {cpx31/cax31} | {n} | {razón} |
| DB | {ccx23/ccx33} | {n} | {razón} |

──────────────────────────────────────────────────────────────
DISEÑO DE RED
──────────────────────────────────────────────────────────────

| Subred | Rango IP | Propósito | Servidores |
|--------|----------|-----------|------------|
| web | 10.0.1.0/24 | Frontends web | web-01, web-02 |
| app | 10.0.2.0/24 | Tier de aplicación | app-01 |
| data | 10.0.3.0/24 | Bases de datos, caché | db-01, redis-01 |
```

### Paso 3: Reglas de Firewall

```
──────────────────────────────────────────────────────────────
DISEÑO DE FIREWALL
──────────────────────────────────────────────────────────────

| Firewall | Dirección | Protocolo | Puerto | Origen | Aplicado A |
|----------|-----------|-----------|--------|--------|------------|
| fw-web | in | TCP | 80,443 | 0.0.0.0/0 | label:role=web |
| fw-web | in | TCP | 22 | {office-ip}/32 | label:role=web |
| fw-db | in | TCP | 5432 | 10.0.0.0/8 | label:role=db |
| fw-db | in | TCP | 22 | 10.0.0.0/8 | label:role=db |
```

### Paso 4: Generar Comandos hcloud CLI

Generar el script de aprovisionamiento completo con comandos de hcloud CLI para:
- Creación de red y subredes
- Reglas de firewall con selectores de etiquetas
- Registro de claves SSH
- Grupos de ubicación para servicios críticos
- Creación de servidores con cloud-init
- Creación y adjunción de volúmenes
- Balanceador de carga con health checks
- Asignación de floating IP (si es necesario)

### Paso 5: Generar Cloud-Init

Generar plantillas `cloud-init.yml` para cada rol de servidor con instalación de paquetes, endurecimiento de seguridad (fail2ban, UFW) y configuración de la aplicación.

### Paso 6: Informe Final

```
══════════════════════════════════════════════════════════════
ARQUITECTURA GENERADA
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUMEN DE RECURSOS
──────────────────────────────────────────────────────────────

| Recurso | Cantidad | Costo Mensual |
|---------|----------|---------------|
| Servidores | {n} | {cost}€ |
| Volúmenes | {n} | {cost}€ |
| Balanceadores de Carga | {n} | {cost}€ |
| Floating IPs | {n} | {cost}€ |
| **Total** | | **{total}€** |

──────────────────────────────────────────────────────────────
PRÓXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Revisar tipos de servidor y ajustar según presupuesto
2. [ ] Auditar postura de seguridad con /hcloud:security-audit
3. [ ] Configurar pipeline CI/CD con /hcloud:deploy-setup
4. [ ] Optimizar costos con @hcloud-cost
5. [ ] Configurar monitoreo y alertas
```

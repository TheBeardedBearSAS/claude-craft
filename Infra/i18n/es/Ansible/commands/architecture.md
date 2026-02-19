---
description: Design complete Ansible automation architecture
argument-hint: <Project> [constraints]
---

# Arquitectura Ansible

Eres un arquitecto Ansible senior. Debes disenar una arquitectura de automatizacion completa a partir de las especificaciones del proyecto.

## Arguments
$ARGUMENTS

Argumentos:
- Descripcion del proyecto
- Infraestructura objetivo (ej., servidores web, bases de datos, multi-cloud)
- Automatizacion requerida (ej., aprovisionamiento, configuracion, despliegue)
- Restricciones (ej., multi-entorno, cumplimiento normativo, tamano del equipo)

Ejemplo: `/ansible:architecture "Plataforma e-commerce" infra:aws services:nginx,postgresql,redis compliance:soc2`

## Plan Mode

> **Se recomienda el modo plan.** Claude activa el modo plan para estructurar el enfoque, identificar los objetivos de infraestructura y presentar una estrategia de automatizacion antes de generar playbooks y roles.

## MISSION

### Paso 1: Descubrimiento

```
══════════════════════════════════════════════════════════════
ARQUITECTURA ANSIBLE
══════════════════════════════════════════════════════════════

Proyecto: {name}
Descripcion: {description}

──────────────────────────────────────────────────────────────
ANALISIS DE REQUISITOS
──────────────────────────────────────────────────────────────

### Stack Tecnologico
| Componente | Tecnologia | Version |
|------------|------------|---------|
| Servidor Web | {tech} | {version} |
| Base de Datos | {tech} | {version} |
| Cache | {tech} | {version} |

### Hosts Objetivo
| Grupo | SO | Cantidad | Proposito |
|-------|----|----------|-----------|
| {group} | {os} | {count} | {purpose} |

### Entornos
| Entorno | Proposito | Especificaciones |
|---------|-----------|------------------|
| dev | Desarrollo | VMs locales (Vagrant/Docker) |
| staging | Validacion | Similar a produccion |
| prod | Produccion | HA, endurecido, monitorizado |
```

### Paso 2: Diseno de Arquitectura

```
──────────────────────────────────────────────────────────────
TOPOLOGIA DE AUTOMATIZACION
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                     CONTROL NODE                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  ansible.cfg │  │ requirements │  │  .ansible-   │      │
│  │              │  │     .yml     │  │    lint       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│  INVENTORIES → PLAYBOOKS → ROLES → TARGET HOSTS            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ dev/stg/ │  │ site.yml │  │  common  │  │ servers  │   │
│  │ prod     │  │ deploy   │  │  nginx   │  │ (managed │   │
│  │ (hosts)  │  │ security │  │ postgres │  │  nodes)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────
ESTRATEGIA DE INVENTARIO
──────────────────────────────────────────────────────────────

| Entorno | Fuente | Group Vars | Especificaciones |
|---------|--------|------------|------------------|
| dev | YAML estatico | Recursos reducidos | Vagrant/local |
| staging | Dinamico (cloud) | Similar a produccion | Auto-descubrimiento |
| prod | Dinamico (cloud) | Recursos completos, HA | Vault cifrado |

──────────────────────────────────────────────────────────────
DESCOMPOSICION DE ROLES
──────────────────────────────────────────────────────────────

| Rol | Alcance | Dependencias | Molecule |
|-----|---------|-------------|----------|
| common | Configuracion base del SO, usuarios, paquetes | ninguna | Si |
| {service} | {description} | common | Si |
```

### Paso 3: Estructura del Proyecto

```
──────────────────────────────────────────────────────────────
ESTRUCTURA DEL PROYECTO
──────────────────────────────────────────────────────────────

ansible/
├── ansible.cfg
├── requirements.yml
├── .ansible-lint
├── inventories/
│   ├── dev/
│   │   ├── hosts.yml
│   │   └── group_vars/
│   ├── staging/
│   │   └── hosts.yml, group_vars/
│   └── prod/
│       ├── hosts.yml
│       └── group_vars/all/{vars,vault}.yml
├── playbooks/
│   ├── site.yml
│   ├── deploy.yml
│   └── security.yml
├── roles/
│   ├── common/
│   │   ├── defaults/, handlers/, tasks/main.yml
│   │   ├── templates/
│   │   └── molecule/default/
│   └── {service}/
└── collections/
    └── requirements.yml
```

### Paso 4: Generar Configuracion

Generar `ansible.cfg` (rutas de inventario, configuracion SSH, cache de facts, valores de seguridad por defecto), `requirements.yml` (colecciones: `ansible.posix`, `community.general`), estructura de inventario por entorno y `.ansible-lint` con perfil de seguridad de produccion. Todas las tareas deben usar FQCN (ej., `ansible.builtin.copy`).

### Paso 5: Generar Roles

Generar esqueletos de roles para cada servicio identificado con `defaults/main.yml`, `tasks/main.yml` (idempotente), `handlers/main.yml`, `templates/` y `molecule/default/` para testing.

### Paso 6: Informe Final

```
══════════════════════════════════════════════════════════════
ARQUITECTURA GENERADA
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ARCHIVOS CREADOS
──────────────────────────────────────────────────────────────

| Archivo | Descripcion |
|---------|-------------|
| ansible/ansible.cfg | Configuracion principal de Ansible |
| ansible/requirements.yml | Dependencias de colecciones |
| ansible/inventories/prod/hosts.yml | Inventario de produccion |
| ansible/playbooks/site.yml | Playbook maestro |
| ansible/roles/common/tasks/main.yml | Rol de configuracion base del SO |

──────────────────────────────────────────────────────────────
PROXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Revisar group_vars y ajustar para cada entorno
2. [ ] Configurar Ansible Vault con /ansible:security-audit
3. [ ] Configurar pipeline CI/CD con /ansible:deploy-setup
4. [ ] Ejecutar verificacion de calidad con @ansible-quality
5. [ ] Probar roles con Molecule antes del primer despliegue
```

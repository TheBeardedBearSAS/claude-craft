---
description: Design complete OpenTofu IaC architecture
argument-hint: <Project> [cloud-provider] [constraints]
---

# Arquitectura OpenTofu

Eres un arquitecto OpenTofu senior. Debes diseñar una arquitectura completa de Infraestructura como Código a partir de las especificaciones del proyecto.

## Arguments
$ARGUMENTS

Argumentos:
- Descripción del proyecto
- Proveedor cloud (p. ej., aws, gcp, azure, multi-cloud)
- Servicios requeridos (p. ej., compute, database, networking, storage)
- Restricciones (p. ej., multi-env, compliance, migration-from-terraform)

Ejemplo: `/opentofu:architecture "Plataforma E-commerce" cloud:aws services:ecs,rds,redis compliance:soc2`

## Plan Mode

> **Se recomienda el modo plan.** Claude activa el modo plan para estructurar el enfoque, identificar los componentes de infraestructura y presentar una estrategia de arquitectura antes de crear las configuraciones.

## MISSION

### Paso 1: Descubrimiento

```
══════════════════════════════════════════════════════════════
ARQUITECTURA OPENTOFU
══════════════════════════════════════════════════════════════

Proyecto: {name}
Descripción: {description}

──────────────────────────────────────────────────────────────
ANÁLISIS DE REQUISITOS
──────────────────────────────────────────────────────────────

### Proveedor Cloud
| Proveedor | Región | Servicios |
|-----------|--------|-----------|
| {provider} | {region} | {services} |

### Infraestructura Requerida
| Componente | Tecnología | Criticidad |
|------------|------------|------------|
| {component} | {technology} | Alta/Media/Baja |

### Entornos
| Entorno | Propósito | Especificaciones |
|---------|-----------|------------------|
| dev | Desarrollo | Recursos mínimos |
| staging | Validación | Similar a producción |
| prod | Producción | HA, cifrado, monitorización |
```

### Paso 2: Diseño de Módulos

```
──────────────────────────────────────────────────────────────
ARQUITECTURA DE MÓDULOS
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                    NETWORKING MODULE                          │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐  │
│  │     VPC       │  │   Subnets     │  │ Security Groups│  │
│  └───────────────┘  └───────────────┘  └────────────────┘  │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                    COMPUTE MODULE                            │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐  │
│  │  ECS/EKS/EC2  │  │  Auto-Scaling │  │  Load Balancer │  │
│  └───────────────┘  └───────────────┘  └────────────────┘  │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                    DATA MODULE                               │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐  │
│  │  RDS/Aurora   │  │  ElastiCache  │  │  S3 Storage    │  │
│  └───────────────┘  └───────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────
DISTRIBUCIÓN DE MÓDULOS
──────────────────────────────────────────────────────────────

| Módulo | Propósito | Recursos Principales |
|--------|-----------|----------------------|
| networking | VPC, subnets, SGs | aws_vpc, aws_subnet |
| compute | Cargas de trabajo de aplicación | aws_ecs_service, aws_lb |
| database | Persistencia de datos | aws_db_instance |
| monitoring | Observabilidad | aws_cloudwatch_* |
```

### Paso 3: Estructura del Proyecto

```
──────────────────────────────────────────────────────────────
ESTRUCTURA DEL PROYECTO
──────────────────────────────────────────────────────────────

infra/
├── modules/
│   ├── networking/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── versions.tf
│   ├── compute/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── versions.tf
│   ├── database/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── versions.tf
│   └── monitoring/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── versions.tf
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   ├── staging/
│   │   └── ...
│   └── prod/
│       └── ...
└── shared/
    ├── providers.tf
    └── versions.tf
```

### Paso 4: Generar Configuraciones de Módulos

Generar archivos de módulos con:
- Variables con restricciones de tipo y bloques de validación
- Outputs para referencias entre módulos
- Fijación de versiones de proveedores
- Configuración de cifrado de estado (v1.7+)
- Mejores prácticas de seguridad (IAM de privilegio mínimo, cifrado en reposo)

### Paso 5: Generar Configuraciones de Entornos

Crear configuraciones específicas por entorno:
- Dev: recursos mínimos, configuraciones relajadas
- Staging: similar a producción, escala reducida
- Prod: HA completa, cifrado, monitorización, copias de seguridad

### Paso 6: Informe Final

```
══════════════════════════════════════════════════════════════
ARQUITECTURA GENERADA
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ARCHIVOS CREADOS
──────────────────────────────────────────────────────────────

| Archivo | Descripción |
|---------|-------------|
| infra/modules/networking/main.tf | VPC y redes |
| infra/modules/compute/main.tf | Compute de aplicación |
| infra/environments/prod/main.tf | Configuración de producción |
| infra/environments/prod/backend.tf | Backend de estado con cifrado |

──────────────────────────────────────────────────────────────
PRÓXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Revisar y ajustar dimensionamiento de recursos por entorno
2. [ ] Configurar frase de cifrado de estado/clave KMS
3. [ ] Configurar CI/CD con /opentofu:deploy-setup
4. [ ] Ejecutar auditoría de seguridad con /opentofu:security-audit
5. [ ] Estimar costos con /opentofu:optimize
```

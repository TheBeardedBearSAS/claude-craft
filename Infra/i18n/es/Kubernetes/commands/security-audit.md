---
description: "Auditoría de la postura de seguridad de Kubernetes"
argument-hint: "[namespace] [alcance]"
---

# Auditoría de Seguridad de Kubernetes

Eres un especialista en seguridad de Kubernetes. Debes realizar una auditoría de seguridad exhaustiva del clúster o del namespace.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Namespace a auditar (por defecto: todos los namespaces)
- (Opcional) Alcance: rbac, network, pods, secrets, images, full (por defecto: full)

Ejemplo: `/kubernetes:security-audit namespace:app-prod scope:full`

## Modo Plan

> **El modo plan es condicional.** Se activa automáticamente cuando el alcance es "full" o abarca múltiples namespaces.

## MISIÓN

### Paso 1: Definición del Alcance

```
══════════════════════════════════════════════════════════════
AUDITORÍA DE SEGURIDAD KUBERNETES
══════════════════════════════════════════════════════════════

Alcance: {namespace o a nivel de clúster}
Categorías: {rbac, network, pods, secrets, images}

──────────────────────────────────────────────────────────────
ALCANCE DE LA AUDITORÍA
──────────────────────────────────────────────────────────────
```

### Paso 2: Auditoría RBAC

```
──────────────────────────────────────────────────────────────
ANÁLISIS RBAC
──────────────────────────────────────────────────────────────

| Comprobación | Estado | Detalles |
|--------------|--------|---------|
| Bindings de cluster-admin | {cantidad} | {detalles} |
| Roles excesivamente permisivos | {cantidad} | {detalles} |
| ServiceAccounts sin usar | {cantidad} | {detalles} |
| Montaje automático de token | {habilitado/deshabilitado} | {detalles} |
```

### Paso 3: Auditoría de Seguridad de Pods

```
──────────────────────────────────────────────────────────────
SEGURIDAD DE PODS
──────────────────────────────────────────────────────────────

| Comprobación | Estado | Detalles |
|--------------|--------|---------|
| Aplicación de PSS | {restricted/baseline/none} | {detalles} |
| Contenedores como root | {cantidad} | {lista de pods} |
| Contenedores privilegiados | {cantidad} | {lista de pods} |
| rootfs de solo lectura | {%} | {detalles} |
| Capacidades eliminadas | {%} | {detalles} |
| Perfiles seccomp | {%} | {detalles} |
```

### Paso 4: Auditoría de Seguridad de Red

```
──────────────────────────────────────────────────────────────
SEGURIDAD DE RED
──────────────────────────────────────────────────────────────

| Comprobación | Estado | Detalles |
|--------------|--------|---------|
| Políticas de deny por defecto | {sí/no por ns} | {detalles} |
| Servicios expuestos | {cantidad} | {lista de servicios} |
| TLS de Ingress | {%} | {detalles} |
| Exposición de servicios internos | {cantidad} | {detalles} |
```

### Paso 5: Auditoría de Secrets

```
──────────────────────────────────────────────────────────────
GESTIÓN DE SECRETS
──────────────────────────────────────────────────────────────

| Comprobación | Estado | Detalles |
|--------------|--------|---------|
| Secrets en variables de entorno | {cantidad} | {detalles} |
| Secrets externos | {sí/no} | {herramienta} |
| Cifrado en reposo | {habilitado/deshabilitado} | {detalles} |
| Rotación de Secrets | {automatizada/manual/ninguna} | {detalles} |
```

### Paso 6: Seguridad de Imágenes

```
──────────────────────────────────────────────────────────────
SEGURIDAD DE IMÁGENES
──────────────────────────────────────────────────────────────

| Comprobación | Estado | Detalles |
|--------------|--------|---------|
| Etiquetas latest | {cantidad} | {imágenes} |
| Imágenes sin firmar | {cantidad} | {imágenes} |
| Vulnerabilidades conocidas | {cantidad} | {desglose por severidad} |
| Registros de confianza | {%} | {detalles} |
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
|-----------|------------|--------|
| RBAC | {x}/100 | {aprobado/advertencia/fallido} |
| Seguridad de Pods | {x}/100 | {aprobado/advertencia/fallido} |
| Red | {x}/100 | {aprobado/advertencia/fallido} |
| Secrets | {x}/100 | {aprobado/advertencia/fallido} |
| Imágenes | {x}/100 | {aprobado/advertencia/fallido} |
| **Total** | **{x}/100** | **{estado}** |

──────────────────────────────────────────────────────────────
HALLAZGOS CRÍTICOS
──────────────────────────────────────────────────────────────

1. [ ] {hallazgo crítico 1}
2. [ ] {hallazgo crítico 2}

──────────────────────────────────────────────────────────────
RECOMENDACIONES
──────────────────────────────────────────────────────────────

Prioridad 1 (Inmediata):
- [ ] {recomendación}

Prioridad 2 (Este sprint):
- [ ] {recomendación}

Prioridad 3 (Próximo trimestre):
- [ ] {recomendación}
```

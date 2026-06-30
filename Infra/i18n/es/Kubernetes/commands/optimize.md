---
description: "Optimizar el uso de recursos y los costes en Kubernetes"
argument-hint: "[namespace] [objetivo]"
---

# Optimización de Kubernetes

Eres un especialista en optimización de Kubernetes. Debes analizar el uso de recursos y proporcionar recomendaciones accionables para el ajuste de tamaño, el autoescalado y la reducción de costes.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Namespace a optimizar (por defecto: todos los namespaces)
- (Opcional) Objetivo: resources, autoscaling, costs, full (por defecto: full)

Ejemplo: `/kubernetes:optimize namespace:app-prod target:resources`

## Modo Plan

> **El modo plan es recomendado.** Claude analiza el uso actual de recursos antes de proponer cambios.

## MISIÓN

### Paso 1: Análisis de Recursos

```
══════════════════════════════════════════════════════════════
OPTIMIZACIÓN DE KUBERNETES
══════════════════════════════════════════════════════════════

Namespace: {namespace}
Objetivo: {resources/autoscaling/costs/full}

──────────────────────────────────────────────────────────────
USO ACTUAL DE RECURSOS
──────────────────────────────────────────────────────────────
```

Analizar con:
```bash
kubectl top pods -n {namespace}
kubectl top nodes
kubectl get hpa -n {namespace}
kubectl get pdb -n {namespace}
kubectl get vpa -n {namespace}
```

### Paso 2: Análisis de Ajuste de Tamaño

```
──────────────────────────────────────────────────────────────
RECOMENDACIONES DE AJUSTE DE TAMAÑO
──────────────────────────────────────────────────────────────

| Carga de trabajo | Solicitud actual | Límite actual | Uso real | Recomendado |
|------------------|------------------|---------------|----------|-------------|
| api | 500m/512Mi | 1/1Gi | 120m/200Mi | 200m/300Mi |
| worker | 250m/256Mi | 500m/512Mi | 50m/100Mi | 100m/150Mi |

Ahorro potencial: {estimación}
```

### Paso 3: Configuración de Autoescalado

```
──────────────────────────────────────────────────────────────
RECOMENDACIONES DE AUTOESCALADO
──────────────────────────────────────────────────────────────

| Carga de trabajo | Actual | HPA recomendado | Sugerencia VPA |
|------------------|--------|-----------------|----------------|
| api | 3 fijo | 2-10, CPU 70% | mode: Auto |
| worker | 2 fijo | 1-5, longitud de cola | mode: Auto |
```

Generar manifiestos HPA:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
```

### Paso 4: PodDisruptionBudget

```
──────────────────────────────────────────────────────────────
RECOMENDACIONES DE PDB
──────────────────────────────────────────────────────────────

| Carga de trabajo | Réplicas | PDB | Recomendación |
|------------------|----------|-----|---------------|
| api | 3 | ninguno | minAvailable: 2 |
| worker | 2 | ninguno | minAvailable: 1 |
```

Generar manifiestos PDB.

### Paso 5: Optimización de Costes

```
──────────────────────────────────────────────────────────────
ANÁLISIS DE COSTES
──────────────────────────────────────────────────────────────

| Área | Actual | Optimizado | Ahorro |
|------|--------|------------|--------|
| Cómputo (CPU) | {x} cores | {y} cores | {z}% |
| Memoria | {x} Gi | {y} Gi | {z}% |
| Almacenamiento | {x} Gi | {y} Gi | {z}% |
| Spot/Preemptible | {no} | {recomendado} | {z}% |
```

### Paso 6: Informe Final

```
══════════════════════════════════════════════════════════════
INFORME DE OPTIMIZACIÓN
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUMEN
──────────────────────────────────────────────────────────────

| Optimización | Impacto | Esfuerzo | Prioridad |
|--------------|---------|----------|-----------|
| Ajustar solicitudes | Alto | Bajo | 1 |
| Añadir HPA | Alto | Medio | 2 |
| Añadir PDB | Medio | Bajo | 3 |
| Instancias Spot | Alto | Medio | 4 |

──────────────────────────────────────────────────────────────
ARCHIVOS GENERADOS
──────────────────────────────────────────────────────────────

| Archivo | Descripción |
|---------|-------------|
| {archivo} | {descripción} |

──────────────────────────────────────────────────────────────
PRÓXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Aplicar el ajuste de tamaño en staging primero
2. [ ] Habilitar HPA y monitorizar durante 24h
3. [ ] Añadir PDBs antes de la próxima ventana de mantenimiento
4. [ ] Configurar monitorización con @kubernetes-monitoring
```

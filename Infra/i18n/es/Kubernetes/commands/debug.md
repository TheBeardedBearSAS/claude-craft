---
description: Diagnosticar problemas de Kubernetes a partir de síntomas
argument-hint: <Síntoma> [namespace]
---

# Depuración de Kubernetes

Eres un especialista en resolución de problemas de Kubernetes. Debes diagnosticar y resolver problemas de forma sistemática a partir de los síntomas indicados.

## Argumentos
$ARGUMENTS

Argumentos:
- Descripción del síntoma (p. ej., "pods bloqueados en CrashLoopBackOff", "servicio no alcanzable")
- (Opcional) Namespace
- (Opcional) Nombre del pod o del deployment

Ejemplo: `/kubernetes:debug "CrashLoopBackOff en los pods de la api" namespace:app-prod`

## Modo Plan

> **El modo plan no es necesario.** Este es un comando de diagnóstico que procede inmediatamente con la investigación.

## MISIÓN

### Paso 1: Recopilar Información

```
══════════════════════════════════════════════════════════════
DEPURACIÓN KUBERNETES
══════════════════════════════════════════════════════════════

Síntoma: {descripción}
Namespace: {namespace}

──────────────────────────────────────────────────────────────
ESTADO DEL CLÚSTER
──────────────────────────────────────────────────────────────
```

Ejecutar comandos de diagnóstico:
```bash
# Resumen del clúster
kubectl get nodes
kubectl get pods -n {namespace}
kubectl get events -n {namespace} --sort-by='.lastTimestamp' | tail -20

# Detalles del recurso problemático
kubectl describe pod {pod} -n {namespace}
kubectl logs {pod} -n {namespace} --tail=50
kubectl logs {pod} -n {namespace} --previous --tail=50
```

### Paso 2: Análisis de Causa Raíz

```
──────────────────────────────────────────────────────────────
DIAGNÓSTICO
──────────────────────────────────────────────────────────────

| Comprobación | Estado | Detalles |
|--------------|--------|---------|
| Estado del pod | {estado} | {detalles} |
| Eventos | {normal/warning} | {detalles} |
| Logs | {error/limpio} | {detalles} |
| Recursos | {ok/agotado} | {detalles} |
| Red | {ok/problema} | {detalles} |
| Almacenamiento | {ok/problema} | {detalles} |

Causa raíz: {explicación}
```

### Paso 3: Resolución

```
──────────────────────────────────────────────────────────────
SOLUCIÓN
──────────────────────────────────────────────────────────────
```

Proporcionar:
1. **Solución inmediata** -- Comandos o cambios en el manifiesto para resolver ahora
2. **Explicación** -- Por qué ocurrió esto
3. **Prevención** -- Cómo evitar la recurrencia

### Paso 4: Verificación

```bash
# Verificar la solución
kubectl get pods -n {namespace}
kubectl describe pod {pod} -n {namespace}
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
| Síntoma | {síntoma} |
| Causa raíz | {causa} |
| Solución aplicada | {solución} |
| Estado | Resuelto / Requiere acción |

──────────────────────────────────────────────────────────────
PREVENCIÓN
──────────────────────────────────────────────────────────────

- [ ] {medida de prevención 1}
- [ ] {medida de prevención 2}
- [ ] {recomendación de monitorización}
```

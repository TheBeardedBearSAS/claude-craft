---
description: Diagnose OpenTofu state issues and drift
argument-hint: <Symptom>
---

# Depuración OpenTofu

Eres un especialista en resolución de problemas de OpenTofu. Debes diagnosticar y resolver problemas de forma sistemática a partir de los síntomas proporcionados.

## Arguments
$ARGUMENTS

Argumentos:
- Descripción del síntoma (p. ej., "conflicto de bloqueo de estado", "deriva detectada", "fallo de importación")
- (Opcional) Mensaje de error
- (Opcional) Dirección del recurso

Ejemplo: `/opentofu:debug "conflicto de bloqueo de estado en entorno de producción"`

## Plan Mode

> **No se requiere modo plan.** Este es un comando de diagnóstico que procede inmediatamente con la investigación.

## MISSION

### Paso 1: Recopilar Información

```
══════════════════════════════════════════════════════════════
DEPURACIÓN OPENTOFU
══════════════════════════════════════════════════════════════

Síntoma: {description}

──────────────────────────────────────────────────────────────
INFORMACIÓN DEL ENTORNO
──────────────────────────────────────────────────────────────
```

Ejecutar comandos de diagnóstico:
```bash
tofu version
tofu providers
tofu state list
tofu validate
TF_LOG=DEBUG tofu plan 2> debug.log
```

### Paso 2: Análisis de Causa Raíz

```
──────────────────────────────────────────────────────────────
DIAGNÓSTICO
──────────────────────────────────────────────────────────────

| Verificación | Estado | Detalles |
|--------------|--------|----------|
| Salud del estado | {ok/corrupto} | {detalles} |
| Estado del bloqueo | {libre/bloqueado} | {detalles} |
| Auth del proveedor | {ok/fallido} | {detalles} |
| Conectividad backend | {ok/fallido} | {detalles} |
| Deriva de recursos | {ninguna/detectada} | {detalles} |
| Validez de config | {ok/errores} | {detalles} |

Causa Raíz: {explicación}
```

### Paso 3: Resolución

```
──────────────────────────────────────────────────────────────
CORRECCIÓN
──────────────────────────────────────────────────────────────
```

Proporcionar:
1. **Corrección inmediata** -- Comandos para resolver ahora
2. **Explicación** -- Por qué ocurrió esto
3. **Prevención** -- Cómo prevenir la recurrencia

### Paso 4: Verificación

```bash
# Verify fix
tofu validate
tofu plan
tofu state list
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
| Corrección aplicada | {corrección} |
| Estado | Resuelto / Requiere acción |

──────────────────────────────────────────────────────────────
PREVENCIÓN
──────────────────────────────────────────────────────────────

- [ ] {medida de prevención 1}
- [ ] {medida de prevención 2}
- [ ] {recomendación de monitorización}
```

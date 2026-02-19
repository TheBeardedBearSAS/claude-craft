---
description: OpenTofu cost optimization and resource analysis
argument-hint: [Target]
---

# Optimización OpenTofu

Eres un especialista en optimización de costos OpenTofu. Debes analizar las configuraciones de infraestructura y proporcionar recomendaciones prácticas de reducción de costos.

## Arguments
$ARGUMENTS

Argumentos:
- (Opcional) Objetivo: resources, costs, tags, full (por defecto: full)
- (Opcional) Ruta al directorio de configuración

Ejemplo: `/opentofu:optimize target:full path:infra/`

## Plan Mode

> **Se recomienda el modo plan.** Claude analiza las configuraciones actuales antes de proponer optimizaciones.

## MISSION

### Paso 1: Análisis de Recursos

```
══════════════════════════════════════════════════════════════
OPTIMIZACIÓN OPENTOFU
══════════════════════════════════════════════════════════════

Objetivo: {resources/costs/tags/full}
Ruta: {ruta de configuración}

──────────────────────────────────────────────────────────────
INVENTARIO DE RECURSOS
──────────────────────────────────────────────────────────────
```

Analizar con:
```bash
tofu state list | sort
infracost breakdown --path=. --format=table
```

### Paso 2: Desglose de Costos

```
──────────────────────────────────────────────────────────────
ANÁLISIS DE COSTOS
──────────────────────────────────────────────────────────────

| Tipo de Recurso | Cantidad | Costo Mensual | % Total |
|-----------------|----------|---------------|---------|
| Compute | {n} | ${x} | {y}% |
| Base de datos | {n} | ${x} | {y}% |
| Almacenamiento | {n} | ${x} | {y}% |
| Red | {n} | ${x} | {y}% |
| **Total** | | **${x}** | **100%** |
```

### Paso 3: Recomendaciones de Dimensionamiento Correcto

```
──────────────────────────────────────────────────────────────
DIMENSIONAMIENTO CORRECTO
──────────────────────────────────────────────────────────────

| Recurso | Actual | Recomendado | Ahorro |
|---------|--------|-------------|--------|
| {recurso} | {tipo} | {tipo} | {x}% |
```

### Paso 4: Cumplimiento de Etiquetas

```
──────────────────────────────────────────────────────────────
CUMPLIMIENTO DE ETIQUETAS
──────────────────────────────────────────────────────────────

| Etiqueta Requerida | Cobertura | Recursos Faltantes |
|--------------------|-----------|-------------------|
| CostCenter | {x}% | {lista} |
| Environment | {x}% | {lista} |
| Project | {x}% | {lista} |
```

### Paso 5: Acciones de Optimización

Generar cambios específicos en la configuración de OpenTofu:
- Definiciones de recursos correctamente dimensionados
- Configuraciones de instancias spot/preemptible
- Optimización de niveles de almacenamiento
- Etiquetas por defecto en el proveedor
- Políticas de costos OPA

### Paso 6: Informe Final

```
══════════════════════════════════════════════════════════════
INFORME DE OPTIMIZACIÓN
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUMEN
──────────────────────────────────────────────────────────────

| Optimización | Impacto | Esfuerzo | Prioridad |
|-------------|---------|----------|-----------|
| Dimensionar correctamente instancias | Alto | Bajo | 1 |
| Habilitar instancias spot | Alto | Medio | 2 |
| Cumplimiento de etiquetas | Medio | Bajo | 3 |
| Control de costos CI con Infracost | Medio | Medio | 4 |

──────────────────────────────────────────────────────────────
AHORRO ESTIMADO
──────────────────────────────────────────────────────────────

| Área | Actual | Optimizado | Ahorro Mensual |
|------|--------|------------|----------------|
| Compute | ${x} | ${y} | ${z} |
| Base de datos | ${x} | ${y} | ${z} |
| Almacenamiento | ${x} | ${y} | ${z} |
| **Total** | **${x}** | **${y}** | **${z}** |

──────────────────────────────────────────────────────────────
PRÓXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Aplicar dimensionamiento correcto primero en dev
2. [ ] Integrar Infracost en CI/CD
3. [ ] Obligar cumplimiento de etiquetas vía OPA
4. [ ] Revisar oportunidades de instancias reservadas
5. [ ] Programar revisión mensual de costos
```

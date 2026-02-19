---
description: Optimize Hetzner Cloud cost and performance
argument-hint: [target]
---

# Hcloud Optimize

Eres un especialista en optimización de Hetzner Cloud. Debes analizar la utilización de recursos de infraestructura y proporcionar recomendaciones accionables para ahorro de costos y mejoras de rendimiento.

## Arguments
$ARGUMENTS

Argumentos:
- (Opcional) Objetivo: cost, performance, both (por defecto: both)

Ejemplo: `/hcloud:optimize target:cost`

## Plan Mode

> **Se recomienda el modo plan.** Claude analiza la utilización actual de recursos antes de proponer optimizaciones.

## MISIÓN

### Paso 1: Inventario de Recursos

```
══════════════════════════════════════════════════════════════
OPTIMIZACIÓN HCLOUD
══════════════════════════════════════════════════════════════

Objetivo: {cost/performance/both}

──────────────────────────────────────────────────────────────
PERFIL DE RECURSOS ACTUAL
──────────────────────────────────────────────────────────────

| Recurso | Cantidad | Costo Mensual | Detalles |
|---------|----------|---------------|---------|
| Servidores | {n} | {cost}€ | {desglose de tipos} |
| Volúmenes | {n} | {cost}€ | {total GB} |
| Balanceadores de Carga | {n} | {cost}€ | {tipos} |
| Floating IPs | {n} | {cost}€ | {asignadas/no asignadas} |
| Snapshots | {n} | {cost}€ | {total GB} |
| **Total** | | **{total}€** | |
```

Inventariar todos los recursos usando hcloud CLI y calcular los costos mensuales actuales.

### Paso 2: Dimensionamiento Correcto de Servidores

```
──────────────────────────────────────────────────────────────
DIMENSIONAMIENTO CORRECTO DE SERVIDORES
──────────────────────────────────────────────────────────────

| Servidor | Tipo Actual | CPU Prom | RAM Prom | Recomendación | Ahorro |
|----------|-------------|----------|----------|---------------|--------|
| {name} | {type} | {x}% | {x}% | {new type} | {x}€/mes |
```

Verificar métricas del servidor e identificar:
- **Servidores sobredimensionados** (CPU < 20%): reducir o cambiar a compartido (CX)
- **Candidatos ARM** (cargas compatibles): cambiar a CAX para 30-50% de ahorro
- **Servidores subdimensionados** (CPU > 80%): aumentar o escalar horizontalmente

### Paso 3: Evaluación de Migración a ARM

```
──────────────────────────────────────────────────────────────
OPORTUNIDADES DE MIGRACIÓN A ARM (CAX)
──────────────────────────────────────────────────────────────

| Servidor | Actual | ARM Propuesto | Ahorro Mensual | Compatible |
|----------|--------|---------------|----------------|------------|
| {name} | {type} ({cost}€) | {cax type} ({cost}€) | {savings}€ | {sí/no} |
```

Evaluar cada servidor para compatibilidad ARM (Go, Node.js, Python, Java, .NET 8+, PostgreSQL, MySQL, Redis todos soportan ARM).

### Paso 4: Limpieza de Recursos

```
──────────────────────────────────────────────────────────────
RECURSOS SIN USO
──────────────────────────────────────────────────────────────

| Recurso | Nombre | Estado | Costo | Acción |
|---------|--------|--------|-------|--------|
| Servidor | {name} | Detenido | {cost}€/mes | Snapshot + eliminar |
| Volumen | {name} | No adjuntado | {cost}€/mes | Archivar o eliminar |
| Floating IP | {ip} | No asignada | {cost}€/mes | Eliminar |
| Snapshot | {name} | > 30 días | {cost}€ | Eliminar |
```

Identificar servidores detenidos, volúmenes no adjuntados, floating IPs no asignadas y snapshots antiguos.

### Paso 5: Optimización de Rendimiento

```
──────────────────────────────────────────────────────────────
AJUSTE DE RENDIMIENTO
──────────────────────────────────────────────────────────────

| Configuración | Actual | Recomendado | Impacto |
|--------------|--------|-------------|---------|
| Grupos de ubicación | {usado/no usado} | Usado para HA | Distribución entre hosts |
| Red privada | {usada/no usada} | Usada para todo interno | Menor latencia, gratuito |
| Tipo de balanceador de carga | {lb11/lb21} | {recomendación} | Throughput |
| I/O de volumen | {estándar} | Considerar SSD local | Mejora de IOPS |
| Ubicación del servidor | {location} | {recomendación} | Latencia |
```

Patrones clave de optimización:
- **Red privada** para tráfico entre servidores (gratuito, menor latencia)
- **Grupos de ubicación** con política spread para alta disponibilidad
- **SSD local** en lugar de block volumes para cargas efímeras de alto IOPS
- **CDN** para activos estáticos para reducir ancho de banda saliente

### Paso 6: Informe Final

```
══════════════════════════════════════════════════════════════
INFORME DE OPTIMIZACIÓN
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUMEN
──────────────────────────────────────────────────────────────

| Optimización | Impacto | Esfuerzo | Ahorro Mensual | Prioridad |
|-------------|---------|----------|----------------|-----------|
| Dimensionar correctamente servidores | Alto | Bajo | {x}€ | 1 |
| Migrar a ARM (CAX) | Alto | Medio | {x}€ | 2 |
| Eliminar recursos sin uso | Medio | Bajo | {x}€ | 3 |
| Limpiar snapshots antiguos | Bajo | Bajo | {x}€ | 4 |
| Optimizar redes | Medio | Medio | {x}€ | 5 |

**Ahorro potencial total: {total}€/mes ({percentage}% de reducción)**

──────────────────────────────────────────────────────────────
PRÓXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Aplicar recomendaciones de dimensionamiento correcto de servidores
2. [ ] Probar compatibilidad ARM para servidores identificados
3. [ ] Eliminar recursos sin uso después de confirmación del equipo
4. [ ] Configurar automatización de limpieza de snapshots
5. [ ] Auditar postura de seguridad con /hcloud:security-audit
```
